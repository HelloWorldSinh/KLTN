package com.example.be_hospital.chatbot;

import dev.langchain4j.rag.content.Content;
import dev.langchain4j.rag.content.retriever.ContentRetriever;
import dev.langchain4j.rag.query.Query;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
class RagConfigTests {

    @Autowired
    private ContentRetriever contentRetriever;

    @Test
    void faqQuestionRetrievesAtMostTwoFaqChunks() {
        List<Content> content = contentRetriever.retrieve(
                Query.from("Bệnh viện mở cửa lúc mấy giờ và có khám thứ bảy không?"));

        String context = joinedText(content);
        assertFalse(content.isEmpty());
        assertTrue(content.size() <= 2);
        assertTrue(context.contains("7h00"));
        assertFalse(context.contains("SẢN PHỤ KHOA"));
    }

    @Test
    void dynamicDataQuestionDoesNotAttachRagContext() {
        List<Content> content = contentRetriever.retrieve(
                Query.from("Bệnh viện có những chuyên khoa nào?"));

        assertTrue(content.isEmpty());
    }

    @Test
    void symptomQuestionRetrievesAtMostTwoSpecialtyChunks() {
        List<Content> content = contentRetriever.retrieve(
                Query.from("Tôi bị đau tai thì nên khám khoa nào?"));

        String context = joinedText(content);
        assertFalse(content.isEmpty());
        assertTrue(content.size() <= 2);
        assertTrue(context.contains("TAI MŨI HỌNG"), context);
    }

    @Test
    void outsideMedicalQuestionDoesNotAttachRagContext() {
        List<Content> content = contentRetriever.retrieve(
                Query.from("Viết code Java giúp tôi"));

        assertTrue(content.isEmpty());
    }

    private String joinedText(List<Content> content) {
        return content.stream()
                .map(item -> item.textSegment().text())
                .reduce("", (first, second) -> first + "\n" + second);
    }
}
