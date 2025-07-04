import { createServer } from 'http';
import app from './app';
import { initSocket } from './config/socket';

const PORT = process.env.PORT || 3000;
const httpServer = createServer(app);

// Inicializar Socket.IO
initSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});