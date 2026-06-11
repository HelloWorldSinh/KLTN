package com.example.be_hospital.chatbot.config;

import com.example.be_hospital.chatbot.memory.DatabaseChatMemoryStore;
import dev.langchain4j.memory.chat.ChatMemoryProvider;
import dev.langchain4j.memory.chat.MessageWindowChatMemory;
import dev.langchain4j.model.chat.ChatModel;
import dev.langchain4j.model.googleai.GoogleAiGeminiChatModel;
import dev.langchain4j.model.openai.OpenAiChatModel;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;
import java.util.Map;

@Configuration
public class ChatbotConfig {

    @Value("${llm.provider:deepseek}")
    private String llmProvider;

    @Value("${llm.model:deepseek-v4-flash}")
    private String llmModel;

    @Value("${llm.base-url:https://api.deepseek.com}")
    private String llmBaseUrl;

    @Value("${llm.api-key}")
    private String llmApiKey;

    @Value("${llm.timeout-seconds:2000}")
    private long llmTimeoutSeconds;

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    @Value("${gemini.model-name:gemini-2.5-flash-lite}")
    private String geminiModelName;

    @Value("${chatbot.memory.max-messages:12}")
    private int memoryMaxMessages;

    @Bean
    public ChatModel chatModel() {
        if ("deepseek".equalsIgnoreCase(llmProvider)) {
            return deepSeekChatModel();
        }
        if ("gemini".equalsIgnoreCase(llmProvider)) {
            return geminiChatModel();
        }
        throw new IllegalArgumentException("Unsupported llm.provider: " + llmProvider);
    }

    private ChatModel deepSeekChatModel() {
        return OpenAiChatModel.builder()
                .baseUrl(llmBaseUrl)
                .apiKey(llmApiKey)
                .modelName(llmModel)
                .temperature(0.2)
                .maxTokens(1024)
                .timeout(Duration.ofSeconds(llmTimeoutSeconds))
                .maxRetries(1)
                .customParameters(Map.of("thinking", Map.of("type", "disabled")))
                .build();
    }

    private ChatModel geminiChatModel() {
        return GoogleAiGeminiChatModel.builder()
                .apiKey(geminiApiKey)
                .modelName(geminiModelName)
                .temperature(0.2)
                .maxOutputTokens(1024)
                .timeout(Duration.ofSeconds(llmTimeoutSeconds))
                .build();
    }

    @Bean
    public ChatMemoryProvider chatMemoryProvider(DatabaseChatMemoryStore memoryStore) {
        return sessionId -> MessageWindowChatMemory.builder()
                .id(sessionId)
                .maxMessages(memoryMaxMessages)
                .chatMemoryStore(memoryStore)
                .build();
    }
}
