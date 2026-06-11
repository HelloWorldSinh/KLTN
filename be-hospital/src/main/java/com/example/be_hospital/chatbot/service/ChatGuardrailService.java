package com.example.be_hospital.chatbot.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ChatGuardrailService {

    private static final String OUTSIDE_MEDICAL_REPLY =
            "Xin lỗi, tôi chỉ hỗ trợ các câu hỏi về y tế và dịch vụ của bệnh viện.";

    private final ChatIntentRouter intentRouter;

    public Optional<String> refusalFor(String question) {
        if (intentRouter.classify(question) == ChatIntentRouter.ChatIntent.OUTSIDE_MEDICAL) {
            return Optional.of(OUTSIDE_MEDICAL_REPLY);
        }
        return Optional.empty();
    }
}
