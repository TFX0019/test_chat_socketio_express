// src/routes/mensaje.routes.ts
import { Router } from 'express';
import { upload } from '../config/multer';
import { 
  // obtenerOCrearChat,
  getMessagesByChatId,
  getChatsByUserId,
  sendMessage
} from '../controllers/mensaje.controller';

const router = Router();

// Obtener o crear un chat 1 a 1
// router.post('/chats/obtener-o-crear', obtenerOCrearChat);

// Enviar mensaje
router.post('/messages', upload.single('image'), sendMessage);

// Obtener mensajes de un chat
router.get('/chats/:chatId/messages', getMessagesByChatId);

// Obtener chats de un usuario
router.get('/users/:userId/chats', getChatsByUserId);

export default router;