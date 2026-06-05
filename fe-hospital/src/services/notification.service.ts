import api from './api';

export interface NotificationDTO {
  id: number;
  userId: number;
  title: string;
  content: string;
  read: boolean;
  isRead?: boolean; // Hỗ trợ dự phòng trường hợp Jackson serialize khác nhau
  createdAt: string;
}

export const notificationService = {
  // Lấy danh sách thông báo của người dùng
  getNotifications: async (): Promise<NotificationDTO[]> => {
    const response = await api.get('/notifications');
    return response.data;
  },

  // Lấy số lượng thông báo chưa đọc
  getUnreadCount: async (): Promise<number> => {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },

  // Đánh dấu một thông báo đã đọc
  markAsRead: async (id: number): Promise<{ status: boolean; message: string }> => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },

  // Đánh dấu tất cả thông báo đã đọc
  markAllAsRead: async (): Promise<{ status: boolean; message: string }> => {
    const response = await api.put('/notifications/read-all');
    return response.data;
  }
};
