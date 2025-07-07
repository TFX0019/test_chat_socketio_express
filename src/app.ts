import express from 'express';
import { PrismaClient } from '../generated/prisma';
import usuarioRoutes from './routes/usuario.routes';
import mensajeRoutes from './routes/mensaje.routes';
import cors from 'cors';
const app = express();
const prisma = new PrismaClient();

app.use(cors({
    origin: ['http://localhost:3000', 'https://test-chat-socketio-express.onrender.com'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static('uploads'));

// Rutas de ejemplo
app.use('/api', usuarioRoutes);
app.use('/api', mensajeRoutes);

export default app;