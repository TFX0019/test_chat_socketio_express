// src/controllers/mensaje.controller.ts
import { Request, Response } from 'express';
import { PrismaClient } from '../../generated/prisma';
import { getIO, getSocketId, usuariosConectados } from '../config/socket';
import { NotificationService } from '../services/notificacion_service';

const prisma = new PrismaClient();

// Obtener o crear un chat 1 a 1
// export const getOrCreateChat = async (req: Request, res: Response) => {
//   try {
//     const { senderId, receiverId } = req.body;

//     // Verificar si ya existe un chat entre estos usuarios
//     let chat = await prisma.chat.findFirst({
//       where: {
//         OR: [
//           { senderId: parseInt(senderId), receiverId: parseInt(receiverId) },
//           { senderId: parseInt(receiverId), receiverId: parseInt(senderId) }
//         ]
//       }
//     });

//     // Si no existe, crearlo
//     if (!chat) {
//       chat = await prisma.chat.create({
//         data: {
//           senderId: parseInt(senderId),
//           receiverId: parseInt(receiverId)
//         }
//       });
//     }

//     res.json(chat);
//   } catch (error) {
//     console.error('Error al obtener/crear chat:', error);
//     res.status(500).json({ error: 'Error al obtener/crear el chat' });
//   }
// };

// Enviar mensaje en un chat 1 a 1
// En src/controllers/mensaje.controller.ts
export const sendMessage = async (req: Request, res: Response): Promise<any> => {
  try {
    const { content, senderId, receiverId } = req.body;
    const file = req.file;
    console.log('Enviando mensaje:', { content, senderId, receiverId });
    console.log('Enviando mensaje:', { file });

    if (!receiverId) {
      return res.status(400).json({ error: 'Se requiere un destinatario' });
    }

    // Buscar o crear el chat
    let chat = await prisma.chat.findFirst({
      where: {
        OR: [
          { senderId: parseInt(senderId), receiverId: parseInt(receiverId) },
          { senderId: parseInt(receiverId), receiverId: parseInt(senderId) }
        ]
      },
      include: {
        sender: true,
        receiver: true
      }
    });


    const [sender, receiver] = await Promise.all([
      prisma.users.findUnique({ where: { id: parseInt(senderId) } }),
      prisma.users.findUnique({ where: { id: parseInt(receiverId) } })
    ]);

    // Si no existe el chat, crearlo
    if (!chat) {
      chat = await prisma.chat.create({
        data: {
          senderId: parseInt(senderId),
          receiverId: parseInt(receiverId)
        },
        include: {
          sender: true,
          receiver: true
        }
      });
    }

    let tipo = 'texto';
    let urlFile = null;
    let nameFile = null;

    if (file) {
      tipo = obtenerTipoMensaje(file.mimetype);
      urlFile = `/uploads/${file.filename}`;
      nameFile = file.originalname;
    }

    const mensaje = await prisma.messages.create({
      data: {
        content,
        type: tipo,
        urlFile,
        nameFile,
        senderId: parseInt(senderId),
        chatId: chat.id
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        chat: {
          include: {
            sender: true,
            receiver: true
          }
        }
      }
    });

    if (receiver !== null && receiver.fcmToken !== null) {
      const response = await NotificationService.sendToToken(
        receiver.fcmToken,
        { 
          title: receiver.name, 
          body: content, 
          imageUrl: process.env.URL_BASE + "/uploads/" + urlFile,
          data: {
            chatId: chat.id.toString(),
            }
        },
      );
    }

    // Obtener el socket del destinatario
    const io = getIO();
    const socketIdDestino = getSocketId(receiverId);
    const socketIdRemitente = getSocketId(senderId);

    console.log('Enviando mensaje:', { socketIdDestino, socketIdRemitente, receiverId, senderId });
    console.log('Usuarios conectados:', Array.from(usuariosConectados.entries()));

    // Preparar el mensaje para el cliente
    const mensajeParaCliente = {
      ...mensaje,
      createdAt: mensaje.createdAt.toISOString()
    };

    // Emitir el mensaje al destinatario si está conectado
    if (socketIdDestino) {
      console.log(`Enviando mensaje a ${receiverId} (socket: ${socketIdDestino})`);
      io.to(socketIdDestino).emit(`mensaje:${receiverId}`, {
        tipo: 'nuevo_mensaje',
        mensaje: mensajeParaCliente
      });
    } else {
      console.log(`El usuario ${receiverId} no tiene un socket conectado`);
    }

    // También emitir al remitente para actualizar la interfaz
    if (socketIdRemitente) {
      console.log(`Enviando confirmación a remitente ${senderId} (socket: ${socketIdRemitente})`);
      io.to(socketIdRemitente).emit(`mensaje:${senderId}`, {
        tipo: 'mensaje_enviado',
        mensaje: mensajeParaCliente
      });
    }

    res.status(201).json(mensaje);
  } catch (error) {
    console.error('Error al enviar mensaje:', error);
    res.status(500).json({ error: 'Error al enviar el mensaje' });
  }
};

// Obtener mensajes de un chat 1 a 1
export const getMessagesByChatId = async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    const { limit = 10, cursor } = req.query;

    const mensajes = await prisma.messages.findMany({
      where: {
        chatId: parseInt(chatId),
        ...(cursor ? { id: { lt: parseInt(cursor as string) } } : {})
      },
      take: parseInt(limit as string),
      orderBy: { createdAt: 'desc' },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json(mensajes);
  } catch (error) {
    console.error('Error al obtener mensajes:', error);
    res.status(500).json({ error: 'Error al obtener los mensajes' });
  }
};

// Obtener chats de un usuario
export const getChatsByUserId = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const chats = await prisma.chat.findMany({
      where: {
        OR: [
          { senderId: parseInt(userId) },
          { receiverId: parseInt(userId) }
        ]
      },
      include: {
        sender: true,
        receiver: true,
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    // Formatear la respuesta para incluir el otro usuario
    const chatsFormateados = chats.map(chat => ({
      id: chat.id,
      receiver: chat.senderId === parseInt(userId) ? chat.receiver : chat.sender,
      ultimoMensaje: chat.messages[0] || null,
      updatedAt: chat.updatedAt
    }));

    res.json(chatsFormateados);
  } catch (error) {
    console.error('Error al obtener chats:', error);
    res.status(500).json({ error: 'Error al obtener los chats' });
  }
};

function obtenerTipoMensaje(mimetype: string): string {
  if (mimetype.startsWith('image/')) return 'imagen';
  if (mimetype.startsWith('video/')) return 'video';
  if (mimetype.startsWith('audio/')) return 'audio';
  if (mimetype === 'application/pdf') return 'documento';
  return 'texto';
};

// Marcar mensajes como leídos
export const markMessagesAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const { messageIds } = req.body;

    if (!Array.isArray(messageIds) || messageIds.length === 0) {
      res.status(400).json({ error: 'Se requiere un array de IDs de mensajes' });
      return;
    }

    // Actualizar los mensajes a estado leído
    await prisma.messages.updateMany({
      where: {
        id: {
          in: messageIds.map(id => parseInt(id))
        },
        read: false // Solo actualizar si no están leídos
      },
      data: {
        read: true,
        updatedAt: new Date()
      }
    });

    // Obtener los mensajes actualizados para emitir por socket
    const updatedMessages = await prisma.messages.findMany({
      where: {
        id: {
          in: messageIds.map(id => parseInt(id))
        }
      },
      include: {
        sender: true
      }
    });

    // Emitir evento de mensajes leídos a los usuarios correspondientes
    const io = getIO();
    updatedMessages.forEach(message => {
      io.to(`user_${message.senderId}`).emit('messages-read', {
        messageIds: updatedMessages.map(m => m.id),
        chatId: message.chatId,
        readAt: new Date()
      });
    });

    res.json({ success: true, message: 'Mensajes marcados como leídos' });
  } catch (error) {
    console.error('Error al marcar mensajes como leídos:', error);
    res.status(500).json({ error: 'Error al marcar mensajes como leídos' });
  }
};