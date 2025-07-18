
import { messaging } from '../config/firebase';
import {
    Message,
    MulticastMessage,
    TopicMessage,
    AndroidConfig,
    ApnsConfig,
    Notification
} from 'firebase-admin/messaging';
import { AndroidNotificationConfig, IOSNotificationConfig, NotificationData } from '../models/notifications';

export class NotificationService {
    static async sendToToken(
        token: string,
        notification: NotificationData,
        androidConfig?: AndroidNotificationConfig,
        iosConfig?: IOSNotificationConfig
    ): Promise<string> {
        try {
            const message: Message = {
                token,
                notification: {
                    title: notification.title,
                    body: notification.body,
                    imageUrl: notification.imageUrl,
                },
                data: notification.data,
                android: androidConfig ? {
                    notification: {
                        channelId: androidConfig.channelId || 'default',
                        priority: androidConfig.priority || 'high',
                        color: androidConfig.color,
                        icon: androidConfig.icon,
                        tag: androidConfig.tag,
                        clickAction: androidConfig.clickAction,
                        bodyLocKey: androidConfig.bodyLocKey,
                        bodyLocArgs: androidConfig.bodyLocArgs,
                        titleLocKey: androidConfig.titleLocKey,
                        titleLocArgs: androidConfig.titleLocArgs,
                    }
                } : undefined,
                apns: iosConfig ? {
                    payload: {
                        aps: {
                            sound: iosConfig.sound || 'default',
                            badge: iosConfig.badge,
                            threadId: iosConfig.threadId,
                            category: iosConfig.category,
                        }
                    },
                    headers: {
                        'apns-priority': '10',
                    }
                } : undefined,
            };

            const response = await messaging.send(message);
            console.log('Notificación enviada exitosamente:', response);
            return response;
        } catch (error) {
            console.error('Error enviando notificación:', error);
            throw error;
        }
    }
}