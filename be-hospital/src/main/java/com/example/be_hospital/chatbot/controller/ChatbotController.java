package com.example.be_hospital.chatbot.controller;

import com.example.be_hospital.chatbot.dto.ChatMessageDto;
import com.example.be_hospital.chatbot.memory.entity.ChatMessageEntity;
import com.example.be_hospital.chatbot.memory.repository.ChatMessageRepository;
import com.example.be_hospital.chatbot.memory.DatabaseChatMemoryStore;
import com.example.be_hospital.chatbot.service.ChatGuardrailService;
import com.example.be_hospital.chatbot.service.CurrentTimeProvider;
import com.example.be_hospital.chatbot.service.MedicalAssistant;
import com.example.be_hospital.security.UserDetailsImpl;
import dev.langchain4j.data.message.ChatMessage;
import dev.langchain4j.data.message.ChatMessageDeserializer;
import dev.langchain4j.exception.InternalServerException;
import dev.langchain4j.exception.InvalidRequestException;
import dev.langchain4j.exception.RateLimitException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chatbot")
@RequiredArgsConstructor
@Slf4j
public class ChatbotController {

    private final MedicalAssistant medicalAssistant;
    private final ChatMessageRepository chatMessageRepository;
    private final DatabaseChatMemoryStore chatMemoryStore;
    private final ChatGuardrailService guardrailService;
    private final CurrentTimeProvider currentTimeProvider;

    @PostMapping("/chat")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<Map<String, String>> chat(@RequestBody Map<String, String> request) {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String sessionId = userDetails.getUsername(); // Sử dụng số điện thoại / username làm sessionId

        String userMessage = request.get("message");
        if (userMessage == null || userMessage.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Message không được để trống"));
        }

        var refusal = guardrailService.refusalFor(userMessage);
        if (refusal.isPresent()) {
            chatMemoryStore.appendExchange(sessionId, userMessage, refusal.get());
            return ResponseEntity.ok(Map.of(
                    "sessionId", sessionId,
                    "reply", refusal.get()));
        }

        try {
            String botReply = medicalAssistant.chat(sessionId, userMessage, currentTimeProvider.currentContext());
            return ResponseEntity.ok(Map.of(
                    "sessionId", sessionId,
                    "reply", botReply));
        } catch (RateLimitException exception) {
            log.warn("Chatbot rate limited for session {}", sessionId, exception);
            removeFailedTurn(sessionId);
            return ResponseEntity.status(429).body(Map.of(
                    "sessionId", sessionId,
                    "reply", "Chatbot đang đạt giới hạn yêu cầu. Vui lòng chờ khoảng một phút rồi thử lại."));
        } catch (InternalServerException exception) {
            log.error("Chatbot provider failed for session {}", sessionId, exception);
            removeFailedTurn(sessionId);
            return ResponseEntity.status(503).body(Map.of(
                    "sessionId", sessionId,
                    "reply", "Dịch vụ AI đang quá tải. Vui lòng thử lại sau ít phút."));
        } catch (InvalidRequestException exception) {
            log.warn("Chatbot request invalid for session {}; retrying without history", sessionId, exception);
            chatMessageRepository.deleteBySessionId(sessionId);
            return retryWithoutHistory(sessionId, userMessage);
        }
    }

    @GetMapping("/history")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<List<ChatMessageDto>> getHistory() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String sessionId = userDetails.getUsername();

        List<ChatMessageEntity> entities = chatMessageRepository.findTop10BySessionIdOrderByIdDesc(sessionId);
        List<ChatMessageDto> history = new ArrayList<>();

        for (ChatMessageEntity entity : entities) {
            ChatMessage msg = ChatMessageDeserializer.messageFromJson(entity.getMessageJson());
            if (msg instanceof dev.langchain4j.data.message.UserMessage) {
                String text = ((dev.langchain4j.data.message.UserMessage) msg).singleText();
                history.add(new ChatMessageDto("USER", DatabaseChatMemoryStore.originalUserText(text)));
            } else if (msg instanceof dev.langchain4j.data.message.AiMessage) {
                history.add(new ChatMessageDto("AI", ((dev.langchain4j.data.message.AiMessage) msg).text()));
            }
        }

        Collections.reverse(history);
        return ResponseEntity.ok(history);
    }

    private ResponseEntity<Map<String, String>> retryWithoutHistory(String sessionId, String userMessage) {
        try {
            String botReply = medicalAssistant.chat(sessionId, userMessage, currentTimeProvider.currentContext());
            return ResponseEntity.ok(Map.of(
                    "sessionId", sessionId,
                    "reply", botReply));
        } catch (RateLimitException exception) {
            log.warn("Chatbot retry rate limited for session {}", sessionId, exception);
            removeFailedTurn(sessionId);
            return ResponseEntity.status(429).body(Map.of(
                    "sessionId", sessionId,
                    "reply", "Chatbot đang đạt giới hạn yêu cầu. Vui lòng chờ khoảng một phút rồi thử lại."));
        } catch (RuntimeException exception) {
            log.error("Chatbot retry failed for session {} and message '{}'",
                    sessionId, summarized(userMessage), exception);
            removeFailedTurn(sessionId);
            return ResponseEntity.status(503).body(Map.of(
                    "sessionId", sessionId,
                    "reply", "Chatbot không thể xử lý cuộc hội thoại hiện tại. Vui lòng thử lại sau."));
        }
    }

    private String summarized(String message) {
        String normalized = message.replaceAll("\\s+", " ").trim();
        return normalized.length() <= 120 ? normalized : normalized.substring(0, 120) + "...";
    }

    private void removeFailedTurn(String sessionId) {
        List<ChatMessageEntity> entities = chatMessageRepository.findBySessionIdOrderByIdAsc(sessionId);
        int failedTurnStart = -1;

        for (int i = entities.size() - 1; i >= 0; i--) {
            ChatMessage message = ChatMessageDeserializer.messageFromJson(entities.get(i).getMessageJson());
            if (message instanceof dev.langchain4j.data.message.UserMessage) {
                failedTurnStart = i;
                break;
            }
        }

        if (failedTurnStart >= 0) {
            chatMessageRepository.deleteAll(entities.subList(failedTurnStart, entities.size()));
        }
    }
}
