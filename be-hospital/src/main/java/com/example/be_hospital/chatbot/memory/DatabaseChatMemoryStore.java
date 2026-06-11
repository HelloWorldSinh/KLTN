package com.example.be_hospital.chatbot.memory;

import com.example.be_hospital.chatbot.memory.entity.ChatMessageEntity;
import com.example.be_hospital.chatbot.memory.repository.ChatMessageRepository;
import dev.langchain4j.data.message.ChatMessage;
import dev.langchain4j.data.message.AiMessage;
import dev.langchain4j.data.message.ChatMessageDeserializer;
import dev.langchain4j.data.message.ChatMessageSerializer;
import dev.langchain4j.data.message.UserMessage;
import dev.langchain4j.store.memory.chat.ChatMemoryStore;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.ArrayList;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class DatabaseChatMemoryStore implements ChatMemoryStore {

    private static final String RAG_CONTEXT_MARKER = "\n\nAnswer using the following information:";

    private final ChatMessageRepository repository;

    @Value("${chatbot.memory.max-messages:12}")
    private int memoryMaxMessages;

    @Override
    public List<ChatMessage> getMessages(Object memoryId) {
        String sessionId = (String) memoryId;
        List<ChatMessageEntity> entities = repository.findBySessionIdOrderByIdAsc(sessionId);

        List<ChatMessage> messages = entities.stream()
                .map(entity -> ChatMessageDeserializer.messageFromJson(entity.getMessageJson()))
                .map(this::removeInjectedRagContext)
                .collect(Collectors.toList());

        return removeOrphanedPrefix(messages);
    }

    @Override
    @Transactional
    public void updateMessages(Object memoryId, List<ChatMessage> messages) {
        String sessionId = (String) memoryId;
        
        // Cập nhật memory thường được gọi mỗi khi có tin nhắn mới.
        // Để đơn giản, ta có thể xóa hết tin nhắn cũ của session này và lưu lại danh sách mới
        // (Cách này phù hợp khi maxMessages được cấu hình giới hạn, ví dụ: 20 tin)
        repository.deleteBySessionId(sessionId);
        
        List<ChatMessage> sanitizedMessages = removeOrphanedPrefix(messages).stream()
                .map(this::removeInjectedRagContext)
                .collect(Collectors.toList());

        List<ChatMessageEntity> entities = compactCompletedTurns(sanitizedMessages).stream()
                .map(msg -> ChatMessageEntity.builder()
                        .sessionId(sessionId)
                        .messageJson(ChatMessageSerializer.messageToJson(msg))
                        .build())
                .collect(Collectors.toList());
                
        repository.saveAll(entities);
    }

    @Override
    @Transactional
    public void deleteMessages(Object memoryId) {
        String sessionId = (String) memoryId;
        repository.deleteBySessionId(sessionId);
    }

    @Transactional
    public void appendExchange(String sessionId, String userText, String aiText) {
        List<ChatMessage> messages = getMessages(sessionId);
        messages.add(UserMessage.from(userText));
        messages.add(AiMessage.from(aiText));

        int fromIndex = Math.max(0, messages.size() - memoryMaxMessages);
        updateMessages(sessionId, removeOrphanedPrefix(messages.subList(fromIndex, messages.size())));
    }

    private List<ChatMessage> compactCompletedTurns(List<ChatMessage> messages) {
        List<ChatMessage> compacted = new ArrayList<>();
        int turnStart = 0;

        while (turnStart < messages.size()) {
            if (!(messages.get(turnStart) instanceof UserMessage)) {
                compacted.add(messages.get(turnStart++));
                continue;
            }

            int nextTurnStart = turnStart + 1;
            while (nextTurnStart < messages.size()
                    && !(messages.get(nextTurnStart) instanceof UserMessage)) {
                nextTurnStart++;
            }

            ChatMessage lastMessage = messages.get(nextTurnStart - 1);
            if (isFinalAnswer(lastMessage)) {
                compacted.add(messages.get(turnStart));
                compacted.add(lastMessage);
            } else {
                compacted.addAll(messages.subList(turnStart, nextTurnStart));
            }
            turnStart = nextTurnStart;
        }

        return compacted;
    }

    private boolean isFinalAnswer(ChatMessage message) {
        return message instanceof AiMessage aiMessage
                && !aiMessage.hasToolExecutionRequests()
                && aiMessage.text() != null
                && !aiMessage.text().isBlank();
    }

    private List<ChatMessage> removeOrphanedPrefix(List<ChatMessage> messages) {
        int firstUserMessageIndex = 0;
        while (firstUserMessageIndex < messages.size()
                && !(messages.get(firstUserMessageIndex) instanceof UserMessage)) {
            firstUserMessageIndex++;
        }

        if (firstUserMessageIndex == 0) {
            return new ArrayList<>(messages);
        }
        if (firstUserMessageIndex == messages.size()) {
            return new ArrayList<>();
        }
        return new ArrayList<>(messages.subList(firstUserMessageIndex, messages.size()));
    }

    private ChatMessage removeInjectedRagContext(ChatMessage message) {
        if (message instanceof UserMessage userMessage && userMessage.hasSingleText()) {
            String originalText = originalUserText(userMessage.singleText());
            if (!originalText.equals(userMessage.singleText())) {
                return UserMessage.from(originalText);
            }
        }
        return message;
    }

    public static String originalUserText(String text) {
        int markerIndex = text.indexOf(RAG_CONTEXT_MARKER);
        return markerIndex >= 0 ? text.substring(0, markerIndex).trim() : text;
    }
}
