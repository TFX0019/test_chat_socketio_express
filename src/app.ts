import express from 'express';
import { PrismaClient } from '../generated/prisma';
import usuarioRoutes from './routes/usuario.routes';
import mensajeRoutes from './routes/mensaje.routes';

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Rutas de ejemplo
app.use('/api', usuarioRoutes);
app.use('/api', mensajeRoutes);

export default app;