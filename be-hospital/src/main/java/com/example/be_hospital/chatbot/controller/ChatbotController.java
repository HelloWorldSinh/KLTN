package com.example.be_hospital.chatbot.controller;

import com.example.be_hospital.chatbot.service.MedicalAssistant;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/chatbot")
@RequiredArgsConstructor
public class ChatbotController {

    private final MedicalAssistant medicalAssistant;

    /**
     * API nhận tin nhắn từ người dùng và trả về phản hồi của AI.
     * Cần truyền lên "sessionId" để giữ bối cảnh hội thoại, nếu gửi lên lần đầu
     * chưa có sessionId thì backend sẽ tự tạo.
     */
    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> chat(@RequestBody Map<String, String> request) {
        String sessionId = request.get("sessionId");
        if (sessionId == null || sessionId.isEmpty()) {
            sessionId = UUID.randomUUID().toString(); // Tạo session mới nếu chưa có
        }

        String userMessage = request.get("message");
        if (userMessage == null || userMessage.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Message không được để trống"));
        }

        // Gọi MedicalAssistant (LangChain4j sẽ tự động xử lý prompt, memory, và gọi
        // Gemini)
        String botReply = medicalAssistant.chat(sessionId, userMessage);

        return ResponseEntity.ok(Map.of(
                "sessionId", sessionId,
                "reply", botReply));
    }
}
