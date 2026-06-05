package com.example.be_hospital.chatbot.memory;

import com.example.be_hospital.chatbot.memory.entity.ChatMessageEntity;
import com.example.be_hospital.chatbot.memory.repository.ChatMessageRepository;
import dev.langchain4j.data.message.ChatMessage;
import dev.langchain4j.data.message.ChatMessageDeserializer;
import dev.langchain4j.data.message.ChatMessageSerializer;
import dev.langchain4j.store.memory.chat.ChatMemoryStore;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class DatabaseChatMemoryStore implements ChatMemoryStore {

    private final ChatMessageRepository repository;

    @Override
    public List<ChatMessage> getMessages(Object memoryId) {
        String sessionId = (String) memoryId;
        List<ChatMessageEntity> entities = repository.findBySessionIdOrderByIdAsc(sessionId);
        
        return entities.stream()
                .map(entity -> ChatMessageDeserializer.messageFromJson(entity.getMessageJson()))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void updateMessages(Object memoryId, List<ChatMessage> messages) {
        String sessionId = (String) memoryId;
        
        // Cập nhật memory thường được gọi mỗi khi có tin nhắn mới.
        // Để đơn giản, ta có thể xóa hết tin nhắn cũ của session này và lưu lại danh sách mới
        // (Cách này phù hợp khi maxMessages được cấu hình giới hạn, ví dụ: 20 tin)
        repository.deleteBySessionId(sessionId);
        
        List<ChatMessageEntity> entities = messages.stream()
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
}
