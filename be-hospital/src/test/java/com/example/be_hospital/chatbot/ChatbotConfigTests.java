package com.example.be_hospital.chatbot;

import com.example.be_hospital.chatbot.config.ChatbotConfig;
import dev.langchain4j.model.googleai.GoogleAiGeminiChatModel;
import dev.langchain4j.model.openai.OpenAiChatModel;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ChatbotConfigTests {

    @Test
    void selectsDeepSeekUsingOnlyProviderValue() {
        ChatbotConfig config = configured();
        ReflectionTestUtils.setField(config, "llmProvider", "deepseek");

        assertInstanceOf(OpenAiChatModel.class, config.chatModel());
    }

    @Test
    void selectsGeminiUsingOnlyProviderValue() {
        ChatbotConfig config = configured();
        ReflectionTestUtils.setField(config, "llmProvider", " GEMINI ");

        assertInstanceOf(GoogleAiGeminiChatModel.class, config.chatModel());
    }

    @Test
    void rejectsUnsupportedProviderWithHelpfulMessage() {
        ChatbotConfig config = configured();
        ReflectionTestUtils.setField(config, "llmProvider", "unknown");

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, config::chatModel);
        assertTrue(exception.getMessage().contains("deepseek, gemini"));
    }

    @Test
    void validatesOnlyTheSelectedProviderApiKey() {
        ChatbotConfig config = configured();
        ReflectionTestUtils.setField(config, "llmProvider", "gemini");
        ReflectionTestUtils.setField(config, "geminiApiKey", "");

        IllegalStateException exception = assertThrows(IllegalStateException.class, config::chatModel);
        assertTrue(exception.getMessage().contains("GEMINI_API_KEY"));
    }

    private ChatbotConfig configured() {
        ChatbotConfig config = new ChatbotConfig();
        ReflectionTestUtils.setField(config, "timeoutSeconds", 120L);
        ReflectionTestUtils.setField(config, "temperature", 0.2);
        ReflectionTestUtils.setField(config, "maxOutputTokens", 1024);
        ReflectionTestUtils.setField(config, "deepSeekModel", "deepseek-v4-flash");
        ReflectionTestUtils.setField(config, "deepSeekBaseUrl", "https://api.deepseek.com");
        ReflectionTestUtils.setField(config, "deepSeekApiKey", "deepseek-test-key");
        ReflectionTestUtils.setField(config, "geminiApiKey", "gemini-test-key");
        ReflectionTestUtils.setField(config, "geminiModelName", "gemini-2.5-flash-lite");
        return config;
    }
}
