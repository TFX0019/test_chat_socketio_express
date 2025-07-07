import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';

let io: Server;

// Almacenar usuarios conectados
export const usuariosConectados = new Map<string, string>();

export const initSocket = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: '*', // Ajusta esto en producción
      methods: ['GET', 'POST'],
    }
  });
  
  io.on('connection', (socket) => {
    console.log('Usuario conectado:', socket.id);

    // Manejar autenticación del usuario
    socket.on('autenticar', (usuarioData: { usuarioId: string }) => {
      const usuarioId = usuarioData.usuarioId;
      
      // Verificar si el usuario ya está conectado
      const socketIdAnterior = usuariosConectados.get(usuarioId);
      
      // Actualizar o agregar el nuevo socket.id para este usuario
      usuariosConectados.set(usuarioId, socket.id);
      
      // Si había un socket anterior, podemos cerrarlo para evitar duplicados
      if (socketIdAnterior && socketIdAnterior !== socket.id) {
        const socketAnterior = io.sockets.sockets.get(socketIdAnterior);
        if (socketAnterior) {
          console.log(`Cerrando conexión duplicada para el usuario ${usuarioId}: ${socketIdAnterior}`);
          socketAnterior.disconnect(true);
        }
      }
      
      // Notificar a todos los clientes sobre la lista actualizada de usuarios
      io.emit('usuarios-activos', Array.from(usuariosConectados.keys()));
      console.log('Usuario autenticado:', { usuarioId, socketId: socket.id });
      
      // Enviar confirmación al cliente
      socket.emit('autenticacion-exitosa', { 
        usuarioId,
        socketId: socket.id,
        esReconexion: !!socketIdAnterior
      });
    });

    // Manejar mensajes privados
    socket.on('mensaje-privado', ({ de, para, mensaje }) => {
      const socketIdDestino = usuariosConectados.get(para);
      if (socketIdDestino) {
        io.to(socketIdDestino).emit('mensaje-recibido', { de, mensaje });
      }
    });

    // Manejar estado de escritura
    socket.on('escribiendo', ({ usuarioId, otherUserId, estaEscribiendo }) => {
      console.log('Users conectados:', Array.from(usuariosConectados.entries()));
      console.log('Usuario escribiendo:', usuarioId, otherUserId, estaEscribiendo);
      const socketIdDestino = usuariosConectados.get(otherUserId.toString());
      console.log('Socket ID del destinatario:', socketIdDestino);
      if (socketIdDestino) {
        socket.to(socketIdDestino).emit('usuario-escribiendo', { usuarioId, estaEscribiendo });
      }
    });

    // Manejar desconexión
    socket.on('disconnect', () => {
      // Encontrar y eliminar el usuario desconectado
      for (const [usuarioId, socketId] of usuariosConectados.entries()) {
        if (socketId === socket.id) {
          usuariosConectados.delete(usuarioId);
          io.emit('usuario-desconectado', usuarioId);
          io.emit('usuarios-activos', Array.from(usuariosConectados.keys()));
          console.log(`Usuario desconectado: ${usuarioId}`);
          break;
        }
      }
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.io no inicializado');
  }
  return io;
};

// Obtener el socket ID de un usuario
export const getSocketId = (usuarioId: string): string | undefined => {
  console.log('Buscando socket ID para usuario:', usuarioId);
  console.log('Usuarios conectados:', Array.from(usuariosConectados.entries()));
  console.log(typeof usuarioId);
  return usuariosConectados.get(usuarioId);
};
