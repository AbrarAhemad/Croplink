import { AppNotification } from '@/types';

export interface NotificationDispatchParams {
  userId: string;
  title: string;
  message: string;
  category: AppNotification['category'];
  linkUrl?: string;
  sendSms?: boolean;
  sendEmail?: boolean;
  phone?: string;
  email?: string;
}

export class NotificationService {
  private notificationsStore: AppNotification[] = [];

  async dispatchNotification(params: NotificationDispatchParams): Promise<AppNotification> {
    const notification: AppNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: params.userId,
      title: params.title,
      message: params.message,
      category: params.category,
      read: false,
      createdAt: new Date().toISOString(),
      linkUrl: params.linkUrl,
    };

    this.notificationsStore.unshift(notification);

    if (params.sendSms) {
      this.sendSmsAbstraction(params.phone || 'Farmer/Industry Mobile', params.message);
    }

    if (params.sendEmail) {
      this.sendEmailAbstraction(params.email || 'user@croplink.demo', params.title, params.message);
    }

    return notification;
  }

  private sendSmsAbstraction(phone: string, text: string) {
    console.log(`[SMS ABSTRACTION LOG] -> Sent to ${phone}: "${text}"`);
  }

  private sendEmailAbstraction(email: string, subject: string, body: string) {
    console.log(`[EMAIL ABSTRACTION LOG] -> Sent to ${email} | Subject: "${subject}"`);
  }

  getUserNotifications(userId: string): AppNotification[] {
    return this.notificationsStore.filter(n => n.userId === userId);
  }
}

export const notificationService = new NotificationService();
