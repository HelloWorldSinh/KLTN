package com.example.be_hospital.service.impl;

import com.example.be_hospital.service.SseService;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import org.springframework.scheduling.annotation.Scheduled;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.HashMap;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;

@Service
public class SseServiceImpl implements SseService {

    private static final Logger log = LoggerFactory.getLogger(SseServiceImpl.class);

    // Lưu trữ các Emitter hoạt động theo userId (phục vụ thông báo cá nhân)
    private final Map<Integer, SseEmitter> userEmitters = new ConcurrentHashMap<>();

    // Lưu trữ danh sách Emitter đăng ký theo scheduleId (phục vụ cập nhật hàng đợi phòng khám)
    private final Map<Integer, Set<SseEmitter>> scheduleSubscribers = new ConcurrentHashMap<>();

    @Override
    public SseEmitter createEmitter(int userId, Integer scheduleId) {
        // Khởi tạo SseEmitter với thời gian timeout là 30 phút (1,800,000 ms)
        SseEmitter emitter = new SseEmitter(1800000L);

        // Lưu emitter cho người dùng
        userEmitters.put(userId, emitter);

        // Nếu người dùng đang theo dõi một lịch khám cụ thể, đăng ký vào danh sách tương ứng
        if (scheduleId != null) {
            scheduleSubscribers.computeIfAbsent(scheduleId, k -> new CopyOnWriteArraySet<>()).add(emitter);
        }

        // Thiết lập các callback dọn dẹp kết nối khi kết thúc, timeout hoặc có lỗi xảy ra
        emitter.onCompletion(() -> removeEmitter(userId, scheduleId, emitter));
        emitter.onTimeout(() -> removeEmitter(userId, scheduleId, emitter));
        emitter.onError(e -> removeEmitter(userId, scheduleId, emitter));

        // Gửi một sự kiện kết nối thành công (connected) ngay khi thiết lập xong để tránh kết nối bị timeout sớm
        try {
            emitter.send(SseEmitter.event()
                    .name("connected")
                    .data("Connection established successfully"));
            log.info("SSE connection established for userId: {}, scheduleId: {}", userId, scheduleId);
        } catch (IOException e) {
            removeEmitter(userId, scheduleId, emitter);
        }

        return emitter;
    }

    private void removeEmitter(int userId, Integer scheduleId, SseEmitter emitter) {
        userEmitters.remove(userId, emitter);
        if (scheduleId != null) {
            Set<SseEmitter> subscribers = scheduleSubscribers.get(scheduleId);
            if (subscribers != null) {
                subscribers.remove(emitter);
                if (subscribers.isEmpty()) {
                    scheduleSubscribers.remove(scheduleId);
                }
            }
        }
        log.info("Removed SSE connection for userId: {}, scheduleId: {}", userId, scheduleId);
    }

    @Override
    public void broadcastQueueUpdate(int scheduleId) {
        Set<SseEmitter> subscribers = scheduleSubscribers.get(scheduleId);
        if (subscribers != null && !subscribers.isEmpty()) {
            log.info("Broadcasting queue update for scheduleId: {} to {} subscribers", scheduleId, subscribers.size());
            for (SseEmitter emitter : subscribers) {
                try {
                    emitter.send(SseEmitter.event()
                            .name("queue_update")
                            .data("Queue updated"));
                } catch (IOException e) {
                    // Khi có lỗi xảy ra, SseEmitter tự động kích hoạt callback onError/onCompletion để tự giải phóng
                }
            }
        }
    }

    @Override
    public void sendNotification(int userId, String title, String content) {
        SseEmitter emitter = userEmitters.get(userId);
        if (emitter != null) {
            try {
                Map<String, String> payload = new HashMap<>();
                payload.put("title", title);
                payload.put("content", content);

                emitter.send(SseEmitter.event()
                        .name("notification")
                        .data(payload));
                log.info("Sent personal notification via SSE to userId: {}", userId);
            } catch (IOException e) {
                // Tự động kích hoạt dọn dẹp khi lỗi
            }
        }
    }

    // Gửi gói tin ping định kỳ mỗi 30 giây để tránh ngắt kết nối và phát hiện các kết nối "chết"
    @Scheduled(fixedRate = 30000)
    public void sendHeartbeat() {
        if (userEmitters.isEmpty()) {
            return;
        }
        log.debug("Sending heartbeat to {} active SSE connections", userEmitters.size());
        for (Map.Entry<Integer, SseEmitter> entry : userEmitters.entrySet()) {
            try {
                entry.getValue().send(SseEmitter.event().comment("ping"));
            } catch (IOException e) {
                // Tự động dọn dẹp khi có lỗi gửi
            }
        }
    }
}
