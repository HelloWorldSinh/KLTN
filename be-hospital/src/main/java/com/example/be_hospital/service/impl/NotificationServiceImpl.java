package com.example.be_hospital.service.impl;

import com.example.be_hospital.entity.Notification;
import com.example.be_hospital.repository.NotificationRepository;
import com.example.be_hospital.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class NotificationServiceImpl implements NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Override
    public List<Notification> getUserNotifications(int userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Override
    public long countUnreadNotifications(int userId) {
        return notificationRepository.countByUserIdAndIsRead(userId, false);
    }

    @Override
    @Transactional
    public void markAsRead(int notificationId, int userId) {
        Optional<Notification> optional = notificationRepository.findById(notificationId);
        if (optional.isPresent()) {
            Notification notification = optional.get();
            if (notification.getUserId() == userId) {
                notification.setRead(true);
                notificationRepository.save(notification);
            }
        }
    }

    @Override
    @Transactional
    public void markAllAsRead(int userId) {
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        boolean changed = false;
        for (Notification notification : notifications) {
            if (!notification.isRead()) {
                notification.setRead(true);
                changed = true;
            }
        }
        if (changed) {
            notificationRepository.saveAll(notifications);
        }
    }
}
