package com.example.be_hospital.service;

import com.example.be_hospital.entity.Notification;
import java.util.List;

public interface NotificationService {
    // Lấy toàn bộ thông báo của người dùng sắp xếp theo thời gian mới nhất
    List<Notification> getUserNotifications(int userId);

    // Đếm số lượng thông báo chưa đọc của người dùng
    long countUnreadNotifications(int userId);

    // Đánh dấu một thông báo cụ thể là đã đọc
    void markAsRead(int notificationId, int userId);

    // Đánh dấu tất cả thông báo của người dùng là đã đọc
    void markAllAsRead(int userId);
}
