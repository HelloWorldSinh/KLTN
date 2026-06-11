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
import org.springframework.context.annotation.PropertySource;

import java.time.Duration;
import java.util.Locale;
import java.util.Map;

@Configuration
@PropertySource("classpath:application-llm.properties")
public class ChatbotConfig {

    @Value("${llm.provider:deepseek}")
    private String llmProvider;

    @Value("${llm.timeout-seconds:120}")
    private long timeoutSeconds;

    @Value("${llm.temperature:0.2}")
    private double temperature;

    @Value("${llm.max-output-tokens:1024}")
    private Integer maxOutputTokens;

    @Value("${llm.deepseek.model:deepseek-v4-flash}")
    private String deepSeekModel;

    @Value("${llm.deepseek.base-url:https://api.deepseek.com}")
    private String deepSeekBaseUrl;

    @Value("${llm.deepseek.api-key:}")
    private String deepSeekApiKey;

    @Value("${llm.gemini.api-key:}")
    private String geminiApiKey;

    @Value("${llm.gemini.model:gemini-2.5-flash-lite}")
    private String geminiModelName;

    @Value("${chatbot.memory.max-messages:12}")
    private int memoryMaxMessages;

    @Bean
    public ChatModel chatModel() {
        return switch (normalizedProvider()) {
            case "deepseek" -> deepSeekChatModel();
            case "gemini" -> geminiChatModel();
            default -> throw new IllegalArgumentException(
                    "Unsupported llm.provider: " + llmProvider + ". Supported values: deepseek, gemini");
        };
    }

    private ChatModel deepSeekChatModel() {
        requireConfigured("LLM_DEEPSEEK_API_KEY", deepSeekApiKey);
        return OpenAiChatModel.builder()
                .baseUrl(deepSeekBaseUrl)
                .apiKey(deepSeekApiKey)
                .modelName(deepSeekModel)
                .temperature(temperature)
                .maxTokens(maxOutputTokens)
                .timeout(Duration.ofSeconds(timeoutSeconds))
                .maxRetries(1)
                .customParameters(Map.of("thinking", Map.of("type", "disabled")))
                .build();
    }

    private ChatModel geminiChatModel() {
        requireConfigured("GEMINI_API_KEY", geminiApiKey);
        return GoogleAiGeminiChatModel.builder()
                .apiKey(geminiApiKey)
                .modelName(geminiModelName)
                .temperature(temperature)
                .maxOutputTokens(maxOutputTokens)
                .timeout(Duration.ofSeconds(timeoutSeconds))
                .build();
    }

    private String normalizedProvider() {
        return llmProvider == null ? "" : llmProvider.trim().toLowerCase(Locale.ROOT);
    }

    private void requireConfigured(String environmentVariable, String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalStateException(
                    environmentVariable + " must be configured when LLM_PROVIDER=" + normalizedProvider());
        }
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
