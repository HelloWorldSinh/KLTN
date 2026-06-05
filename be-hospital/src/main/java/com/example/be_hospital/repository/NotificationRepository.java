package com.example.be_hospital.repository;

import com.example.be_hospital.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Integer> {
    // Tìm danh sách thông báo của người dùng sắp xếp theo thời gian tạo giảm dần
    List<Notification> findByUserIdOrderByCreatedAtDesc(int userId);

    // Đếm số lượng thông báo theo trạng thái đọc (isRead) của người dùng
    long countByUserIdAndIsRead(int userId, boolean isRead);
}
