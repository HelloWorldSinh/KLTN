package com.example.be_hospital.chatbot;

import com.example.be_hospital.chatbot.controller.ChatbotController;
import com.example.be_hospital.chatbot.memory.DatabaseChatMemoryStore;
import com.example.be_hospital.chatbot.memory.repository.ChatMessageRepository;
import com.example.be_hospital.chatbot.service.ChatGuardrailService;
import com.example.be_hospital.chatbot.service.ChatIntentRouter;
import com.example.be_hospital.chatbot.service.CurrentTimeProvider;
import com.example.be_hospital.chatbot.service.MedicalAssistant;
import com.example.be_hospital.security.UserDetailsImpl;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;

class ChatbotControllerTests {

    private final MedicalAssistant medicalAssistant = mock(MedicalAssistant.class);
    private final ChatMessageRepository chatMessageRepository = mock(ChatMessageRepository.class);
    private final DatabaseChatMemoryStore chatMemoryStore = mock(DatabaseChatMemoryStore.class);
    private final CurrentTimeProvider currentTimeProvider = mock(CurrentTimeProvider.class);
    private final ChatbotController controller = new ChatbotController(
            medicalAssistant,
            chatMessageRepository,
            chatMemoryStore,
            new ChatGuardrailService(new ChatIntentRouter()),
            currentTimeProvider);

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void unsafeMedicalRequestIsStoppedBeforeCallingTheLlm() {
        UserDetailsImpl patient = new UserDetailsImpl(
                "0900000000", "password", "Patient", List.of(new SimpleGrantedAuthority("ROLE_PATIENT")));
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(patient, null, patient.getAuthorities()));

        ResponseEntity<Map<String, String>> response = controller.chat(Map.of(
                "message", "Cho tôi liều dùng thuốc hạ sốt Paracetamol cho bé 10kg."));

        assertEquals(200, response.getStatusCode().value());
        verifyNoInteractions(medicalAssistant);
        verify(chatMemoryStore).appendExchange(
                eq("0900000000"),
                eq("Cho tôi liều dùng thuốc hạ sốt Paracetamol cho bé 10kg."),
                contains("không thể lựa chọn thuốc"));
    }
}
