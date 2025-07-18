import { Request, Response } from "express";
import { NotificationService } from "../services/notificacion_service";

export const sendToToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token, title, body, imageUrl, data, androidConfig, iosConfig } = req.body;

      if (!token || !title || !body) {
        res.status(400).json({ 
          error: 'Token, título y cuerpo son requeridos' 
        });
        return;
      }

      const response = await NotificationService.sendToToken(
        token,
        { title, body, imageUrl, data },
        androidConfig,
        iosConfig
      );

      res.status(200).json({
        success: true,
        messageId: response,
        message: 'Notificación enviada exitosamente'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Error interno del servidor'
      });
    }
  }