package com.example.be_hospital.controller;

import com.example.be_hospital.dto.ResponseObject;
import com.example.be_hospital.entity.Notification;
import com.example.be_hospital.entity.User;
import com.example.be_hospital.repository.UserRepository;
import com.example.be_hospital.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserRepository userRepository;

    private User getAuthenticatedUser(Principal principal) {
        if (principal == null) {
            throw new RuntimeException("Chưa xác thực người dùng");
        }
        return userRepository.findByPhone(principal.getName())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin người dùng"));
    }

    // Lấy danh sách thông báo của người dùng đăng nhập hiện tại
    @GetMapping("")
    public ResponseEntity<List<Notification>> getUserNotifications(Principal principal) {
        User user = getAuthenticatedUser(principal);
        return ResponseEntity.ok(notificationService.getUserNotifications(user.getId()));
    }

    // Đếm số lượng thông báo chưa đọc của người dùng đăng nhập hiện tại
    @GetMapping("/unread-count")
    public ResponseEntity<Long> countUnreadNotifications(Principal principal) {
        User user = getAuthenticatedUser(principal);
        return ResponseEntity.ok(notificationService.countUnreadNotifications(user.getId()));
    }

    // Đánh dấu một thông báo là đã đọc
    @PutMapping("/{id}/read")
    public ResponseEntity<ResponseObject> markAsRead(@PathVariable int id, Principal principal) {
        User user = getAuthenticatedUser(principal);
        notificationService.markAsRead(id, user.getId());
        return ResponseEntity.ok(new ResponseObject(true, "Đã đánh dấu thông báo đã đọc"));
    }

    // Đánh dấu tất cả thông báo của người dùng là đã đọc
    @PutMapping("/read-all")
    public ResponseEntity<ResponseObject> markAllAsRead(Principal principal) {
        User user = getAuthenticatedUser(principal);
        notificationService.markAllAsRead(user.getId());
        return ResponseEntity.ok(new ResponseObject(true, "Đã đánh dấu đọc tất cả thông báo"));
    }
}
