import { Router } from 'express';
import { 
  createUser, 
  getUsers, 
  getUserByEmail,
  updateUser 
} from '../controllers/usuario.controller';

const router = Router();

// Ruta para crear un nuevo usuario
router.post('/users', createUser);

// Ruta para obtener todos los usuarios
router.get('/users', getUsers);

// Ruta para obtener un usuario por su email
router.get('/users/email/:email', (req, res, next) => {
  getUserByEmail(req as any, res).catch(next);
});

// Ruta para actualizar un usuario por su ID
router.put('/users/:id', (req, res, next) => {
  updateUser(req as any, res).catch(next);
});

export default router;