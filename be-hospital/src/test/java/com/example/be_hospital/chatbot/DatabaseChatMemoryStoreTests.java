package com.example.be_hospital.chatbot;

import com.example.be_hospital.chatbot.memory.DatabaseChatMemoryStore;
import com.example.be_hospital.chatbot.memory.entity.ChatMessageEntity;
import com.example.be_hospital.chatbot.memory.repository.ChatMessageRepository;
import dev.langchain4j.agent.tool.ToolExecutionRequest;
import dev.langchain4j.data.message.AiMessage;
import dev.langchain4j.data.message.ChatMessage;
import dev.langchain4j.data.message.ChatMessageDeserializer;
import dev.langchain4j.data.message.ToolExecutionResultMessage;
import dev.langchain4j.data.message.UserMessage;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicReference;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class DatabaseChatMemoryStoreTests {

    @Test
    void removesInjectedRagContextFromStoredUserMessage() {
        String augmentedMessage = """
                Bệnh viện mở cửa lúc mấy giờ?

                Answer using the following information:
                Một đoạn RAG rất dài không nên lưu vào lịch sử.
                """;

        assertEquals(
                "Bệnh viện mở cửa lúc mấy giờ?",
                DatabaseChatMemoryStore.originalUserText(augmentedMessage));
    }

    @Test
    void keepsNormalUserMessageUnchanged() {
        assertEquals(
                "Ngày mai có lịch khám không?",
                DatabaseChatMemoryStore.originalUserText("Ngày mai có lịch khám không?"));
    }

    @Test
    void completedToolTurnKeepsUserQuestionAndFinalAnswerOnly() {
        ChatMessageRepository repository = mock(ChatMessageRepository.class);
        AtomicReference<List<ChatMessageEntity>> savedMessages = captureSavedMessages(repository);
        DatabaseChatMemoryStore store = new DatabaseChatMemoryStore(repository);
        ToolExecutionRequest request = ToolExecutionRequest.builder()
                .id("tool-1")
                .name("getDoctors")
                .arguments("{}")
                .build();

        store.updateMessages("patient", List.of(
                UserMessage.from("Tôi muốn khám cho bé 5 tuổi bị sốt"),
                AiMessage.from(request),
                ToolExecutionResultMessage.from(request, "[{\"specialtyId\":6}]"),
                AiMessage.from("Bé nên khám Nhi khoa (ID: 6).")));

        List<ChatMessage> messages = deserialize(savedMessages.get());
        assertEquals(2, messages.size());
        assertInstanceOf(UserMessage.class, messages.get(0));
        assertEquals("Bé nên khám Nhi khoa (ID: 6).", assertInstanceOf(AiMessage.class, messages.get(1)).text());
    }

    @Test
    void inProgressToolTurnIsNotCompacted() {
        ChatMessageRepository repository = mock(ChatMessageRepository.class);
        AtomicReference<List<ChatMessageEntity>> savedMessages = captureSavedMessages(repository);
        DatabaseChatMemoryStore store = new DatabaseChatMemoryStore(repository);
        ToolExecutionRequest request = ToolExecutionRequest.builder()
                .id("tool-1")
                .name("getAvailableSchedules")
                .arguments("{\"specialtyId\":6}")
                .build();

        store.updateMessages("patient", List.of(
                UserMessage.from("Khoa đó hôm nay có lịch khám trống nào không?"),
                AiMessage.from(request),
                ToolExecutionResultMessage.from(request, "[]")));

        assertEquals(3, savedMessages.get().size());
    }

    @SuppressWarnings("unchecked")
    private AtomicReference<List<ChatMessageEntity>> captureSavedMessages(ChatMessageRepository repository) {
        AtomicReference<List<ChatMessageEntity>> captured = new AtomicReference<>();
        when(repository.saveAll(any())).thenAnswer(invocation -> {
            Iterable<ChatMessageEntity> entities = invocation.getArgument(0);
            List<ChatMessageEntity> list = new ArrayList<>();
            entities.forEach(list::add);
            captured.set(list);
            return list;
        });
        return captured;
    }

    private List<ChatMessage> deserialize(List<ChatMessageEntity> entities) {
        return entities.stream()
                .map(entity -> ChatMessageDeserializer.messageFromJson(entity.getMessageJson()))
                .toList();
    }
}
