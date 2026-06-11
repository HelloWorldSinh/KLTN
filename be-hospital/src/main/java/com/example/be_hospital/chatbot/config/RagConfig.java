package com.example.be_hospital.chatbot.config;

import com.example.be_hospital.chatbot.service.ChatIntentRouter;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.model.embedding.onnx.allminilml6v2.AllMiniLmL6V2EmbeddingModel;
import dev.langchain4j.rag.content.retriever.ContentRetriever;
import dev.langchain4j.rag.content.retriever.EmbeddingStoreContentRetriever;
import dev.langchain4j.rag.query.Query;
import dev.langchain4j.store.embedding.EmbeddingStore;
import dev.langchain4j.store.embedding.inmemory.InMemoryEmbeddingStore;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;

@Configuration
public class RagConfig {

    @Bean
    public EmbeddingModel embeddingModel() {
        return new AllMiniLmL6V2EmbeddingModel();
    }

    @Bean
    public EmbeddingStore<TextSegment> faqEmbeddingStore() {
        return new InMemoryEmbeddingStore<>();
    }

    @Bean
    public EmbeddingStore<TextSegment> specialtyEmbeddingStore() {
        return new InMemoryEmbeddingStore<>();
    }

    @Bean
    public ContentRetriever contentRetriever(
            @Qualifier("faqEmbeddingStore") EmbeddingStore<TextSegment> faqEmbeddingStore,
            @Qualifier("specialtyEmbeddingStore") EmbeddingStore<TextSegment> specialtyEmbeddingStore,
            EmbeddingModel embeddingModel,
            ChatIntentRouter intentRouter) throws IOException {

        ingestFaq(faqEmbeddingStore, embeddingModel);
        ingestSpecialties(specialtyEmbeddingStore, embeddingModel);

        ContentRetriever faqRetriever = retriever(faqEmbeddingStore, embeddingModel, 0.45);
        ContentRetriever specialtyRetriever = retriever(specialtyEmbeddingStore, embeddingModel, 0.62);

        return query -> switch (intentRouter.classify(query.text())) {
            case FAQ -> faqRetriever.retrieve(query);
            case SYMPTOM -> specialtyRetriever.retrieve(
                    Query.from(intentRouter.specialtySearchText(query.text())));
            case TOOL_LOOKUP, OUTSIDE_MEDICAL, GENERAL_MEDICAL -> List.of();
        };
    }

    private ContentRetriever retriever(
            EmbeddingStore<TextSegment> embeddingStore,
            EmbeddingModel embeddingModel,
            double minScore) {
        return EmbeddingStoreContentRetriever.builder()
                .embeddingStore(embeddingStore)
                .embeddingModel(embeddingModel)
                .maxResults(2)
                .minScore(minScore)
                .build();
    }

    private void ingestFaq(
            EmbeddingStore<TextSegment> embeddingStore,
            EmbeddingModel embeddingModel) throws IOException {
        List<TextSegment> segments = readResource("faq.txt").lines()
                .filter(line -> !line.isBlank())
                .map(TextSegment::from)
                .toList();
        addSegments(segments, embeddingStore, embeddingModel);
    }

    private void ingestSpecialties(
            EmbeddingStore<TextSegment> embeddingStore,
            EmbeddingModel embeddingModel) throws IOException {
        List<TextSegment> segments = Arrays.stream(readResource("specialty_guide.txt")
                        .split("(?m)^={10,}\\R"))
                .map(String::trim)
                .filter(section -> !section.isBlank())
                .map(TextSegment::from)
                .toList();
        addSegments(segments, embeddingStore, embeddingModel);
    }

    private void addSegments(
            List<TextSegment> segments,
            EmbeddingStore<TextSegment> embeddingStore,
            EmbeddingModel embeddingModel) {
        embeddingStore.addAll(embeddingModel.embedAll(segments).content(), segments);
    }

    private String readResource(String name) throws IOException {
        try (var inputStream = new ClassPathResource(name).getInputStream()) {
            return new String(inputStream.readAllBytes(), StandardCharsets.UTF_8);
        }
    }
}
