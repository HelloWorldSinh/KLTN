package com.example.be_hospital.service;

import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

public interface SseService {
    // Khởi tạo kết nối SSE cho người dùng
    SseEmitter createEmitter(int userId, Integer scheduleId);

    // Phát tín hiệu cập nhật hàng đợi cho tất cả người dùng đang theo dõi một lịch khám cụ thể
    void broadcastQueueUpdate(int scheduleId);

    // Gửi thông báo trực tiếp đến một người dùng cụ thể
    void sendNotification(int userId, String title, String content);
}
