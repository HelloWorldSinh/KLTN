package com.example.be_hospital.chatbot.config;

import dev.langchain4j.memory.chat.ChatMemoryProvider;
import dev.langchain4j.memory.chat.MessageWindowChatMemory;
import dev.langchain4j.model.chat.ChatModel;
import dev.langchain4j.model.googleai.GoogleAiGeminiChatModel;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.example.be_hospital.chatbot.memory.DatabaseChatMemoryStore;

@Configuration
public class ChatbotConfig {

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    /**
     * Tạo ChatModel kết nối tới Google Gemini.
     */
    @Bean
    public ChatModel chatModel() {
        return GoogleAiGeminiChatModel.builder()
                .apiKey(geminiApiKey)
                .modelName("gemini-2.5-flash")
                .temperature(0.2)
                .maxOutputTokens(1024)
                .build();
    }

    /**
     * Quản lý bộ nhớ hội thoại cho từng session.
     * Sử dụng DatabaseChatMemoryStore để lưu trữ vào MySQL thay vì RAM.
     */
    @Bean
    public ChatMemoryProvider chatMemoryProvider(DatabaseChatMemoryStore memoryStore) {
        return sessionId -> MessageWindowChatMemory.builder()
                .id(sessionId)
                .maxMessages(20)
                .chatMemoryStore(memoryStore)
                .build();
    }
}
