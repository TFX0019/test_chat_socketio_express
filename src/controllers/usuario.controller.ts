import { Request, Response } from 'express';
import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();

export const createUser = async (req: Request, res: Response): Promise<any> => {
    try {
      const { email, name } = req.body;
  
      // Validación básica
      if (!email || !name) {
        return res.status(400).json({ error: 'Email y nombre son requeridos' });
      }
  
      // Verificar si el email ya existe
      const usuarioExistente = await prisma.users.findUnique({
        where: { email }
      });
  
      if (usuarioExistente) {
        return res.status(400).json({ 
          error: 'El correo electrónico ya está en uso',
          code: 'EMAIL_ALREADY_EXISTS'
        });
      }
  
      const usuario = await prisma.users.create({
        data: {
          email: email.toLowerCase(),
          name,
        },
      });
  
      res.status(201).json(usuario);
    } catch (error) {
      console.error('Error al crear usuario:', error);
      
      // Manejar específicamente el error de restricción única de Prisma
      if ((error as any).code === 'P2002') {
        return res.status(400).json({ 
          error: 'El correo electrónico ya está en uso',
          code: 'EMAIL_ALREADY_EXISTS'
        });
      }
      
      res.status(500).json({ 
        error: 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  };

export const getUsers = async (req: Request, res: Response) => {
  try {
    const usuarios = await prisma.users.findMany();
    res.json(usuarios);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

interface IGetUserByEmailRequest extends Request {
  params: {
    email: string;
  };
}

export const getUserByEmail = async (req: IGetUserByEmailRequest, res: Response): Promise<void> => {
  try {
    const { email } = req.params;

    if (!email) {
      res.status(400).json({ error: 'El email es requerido' });
      return;
    }

    const usuario = await prisma.users.findUnique({
      where: { email }
    });

    if (!usuario) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    res.json(usuario);
  } catch (error) {
    console.error('Error al obtener usuario por email:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
};

interface IUpdateUserRequest extends Request {
  params: {
    id: string;
  };
  body: {
    email?: string;
    name?: string;
  };
}

export const updateUser = async (req: IUpdateUserRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { email, name } = req.body;

    if (!id) {
      res.status(400).json({ error: 'El ID del usuario es requerido' });
      return;
    }

    // Verificar si el usuario existe
    const usuarioExistente = await prisma.users.findUnique({
      where: { id: parseInt(id) }
    });

    if (!usuarioExistente) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    // Verificar si el nuevo email ya está en uso por otro usuario
    if (email && email !== usuarioExistente.email) {
      const emailEnUso = await prisma.users.findUnique({
        where: { email }
      });

      if (emailEnUso) {
        res.status(400).json({ 
          error: 'El correo electrónico ya está en uso',
          code: 'EMAIL_ALREADY_EXISTS'
        });
        return;
      }
    }

    // Actualizar el usuario
    const usuarioActualizado = await prisma.users.update({
      where: { id: parseInt(id) },
      data: {
        ...(email && { email }),
        ...(name && { name })
      }
    });

    res.json(usuarioActualizado);
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    
    // Manejar específicamente el error de restricción única de Prisma
    if ((error as any).code === 'P2002') {
      res.status(400).json({ 
        error: 'El correo electrónico ya está en uso',
        code: 'EMAIL_ALREADY_EXISTS'
      });
      return;
    }

    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
};