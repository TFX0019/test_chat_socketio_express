
export interface NotificationData {
  title: string;
  body: string;
  imageUrl?: string;
  data?: { [key: string]: string };
  clickAction?: string;
  sound?: string;
  badge?: number;
}

export interface AndroidNotificationConfig {
  channelId?: string;
  priority?: 'min' | 'low' | 'default' | 'high' | 'max';
  color?: string;
  icon?: string;
  tag?: string;
  clickAction?: string;
  bodyLocKey?: string;
  bodyLocArgs?: string[];
  titleLocKey?: string;
  titleLocArgs?: string[];
}

export interface IOSNotificationConfig {
  sound?: string;
  badge?: number;
  threadId?: string;
  category?: string;
  subtitle?: string;
  bodyLocKey?: string;
  bodyLocArgs?: string[];
  titleLocKey?: string;
  titleLocArgs?: string[];
}