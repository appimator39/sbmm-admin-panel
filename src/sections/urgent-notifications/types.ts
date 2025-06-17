export interface UrgentNotification {
  _id: string;
  title: string;
  description: string;
  type: 'HEADLINE' | 'INFO' | 'WARNING' | 'ERROR';
  user?: {
    _id: string;
    name: string;
    rollNo: string;
    email: string;
  };
  isRead: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface UrgentNotificationFormData {
  title: string;
  description: string;
  type: 'HEADLINE' | 'INFO' | 'WARNING' | 'ERROR';
  userIds: string[];
  batchIds: string[];
  isDefault: boolean;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  rollNo?: string;
}

export interface Batch {
  _id: string;
  title: string;
  description?: string;
}

export interface NotificationResponse {
  statusCode: number;
  message: string;
  data: {
    notifications: UrgentNotification[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      limit: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
      nextPage: number | null;
      prevPage: number | null;
    };
  };
} 