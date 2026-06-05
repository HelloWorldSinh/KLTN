package com.example.be_hospital.controller;

import com.example.be_hospital.entity.User;
import com.example.be_hospital.repository.UserRepository;
import com.example.be_hospital.service.SseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.security.Principal;

@RestController
public class SseController {

    @Autowired
    private SseService sseService;

    @Autowired
    private UserRepository userRepository;

    /**
     * Endpoint kết nối SSE cho người dùng (Bệnh nhân / Bác sĩ).
     * Yêu cầu xác thực hợp lệ thông qua Spring Security.
     *
     * @param principal Thông tin tài khoản đăng nhập (được tự động trích xuất từ JWT)
     * @param scheduleId ID của lịch khám/phòng khám cần theo dõi hàng đợi (tùy chọn)
     * @return SseEmitter đối tượng duy trì luồng sự kiện
     */
    @GetMapping(value = "/sse/connect", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter connect(Principal principal, @RequestParam(required = false) Integer scheduleId) {
        if (principal == null) {
            throw new RuntimeException("Chưa xác thực người dùng");
        }

        String phone = principal.getName();
        User user = userRepository.findByPhone(phone)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin người dùng"));

        return sseService.createEmitter(user.getId(), scheduleId);
    }
}
