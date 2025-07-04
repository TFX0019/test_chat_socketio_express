import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'video/mp4', 'audio/mpeg', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no soportado'), false);
  }
};

export const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB límite
});