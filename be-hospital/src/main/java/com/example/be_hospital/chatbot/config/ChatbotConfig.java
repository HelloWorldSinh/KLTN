package com.example.be_hospital.chatbot.config;

import dev.langchain4j.memory.chat.ChatMemoryProvider;
import dev.langchain4j.memory.chat.MessageWindowChatMemory;
import dev.langchain4j.model.chat.ChatModel;
import dev.langchain4j.model.googleai.GoogleAiGeminiChatModel;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

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
                .modelName("gemini-2.0-flash-lite")
                .temperature(0.7)
                .maxOutputTokens(1024)
                .build();
    }

    /**
     * Quản lý bộ nhớ hội thoại cho từng session.
     * Mỗi sessionId sẽ có một ChatMemory riêng, giữ tối đa 20 tin nhắn gần nhất.
     */
    @Bean
    public ChatMemoryProvider chatMemoryProvider() {
        return sessionId -> MessageWindowChatMemory.builder()
                .id(sessionId)
                .maxMessages(20)
                .build();
    }
}
