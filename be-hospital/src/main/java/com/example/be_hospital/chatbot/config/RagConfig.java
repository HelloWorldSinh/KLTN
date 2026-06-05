package com.example.be_hospital.chatbot.config;

import dev.langchain4j.data.document.Document;
import dev.langchain4j.data.document.DocumentSplitter;
import dev.langchain4j.data.document.loader.FileSystemDocumentLoader;
import dev.langchain4j.data.document.parser.TextDocumentParser;
import dev.langchain4j.data.document.splitter.DocumentSplitters;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.embedding.onnx.allminilml6v2.AllMiniLmL6V2EmbeddingModel;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.rag.content.retriever.ContentRetriever;
import dev.langchain4j.rag.content.retriever.EmbeddingStoreContentRetriever;
import dev.langchain4j.store.embedding.EmbeddingStore;
import dev.langchain4j.store.embedding.EmbeddingStoreIngestor;
import dev.langchain4j.store.embedding.inmemory.InMemoryEmbeddingStore;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import java.io.IOException;

@Configuration
public class RagConfig {

    // 1. Cấu hình Mô hình nhúng (Embedding Model) - Chạy local, không tốn API key
    @Bean
    public EmbeddingModel embeddingModel() {
        return new AllMiniLmL6V2EmbeddingModel();
    }

    // 2. Cấu hình Nơi lưu trữ Vector (Vector Store) - Dùng RAM (InMemory)
    @Bean
    public EmbeddingStore<TextSegment> embeddingStore() {
        return new InMemoryEmbeddingStore<>();
    }

    // 3. Nạp dữ liệu từ file faq.txt vào Vector Store
    @Bean
    public ContentRetriever contentRetriever(EmbeddingStore<TextSegment> embeddingStore, EmbeddingModel embeddingModel)
            throws IOException {

        // Lấy đường dẫn tới file faq.txt trong resources
        String faqPath = new ClassPathResource("faq.txt").getFile().toPath().toString();

        // Load file txt
        Document document = FileSystemDocumentLoader.loadDocument(faqPath, new TextDocumentParser());

        // Cắt tài liệu thành các đoạn nhỏ (mỗi đoạn 300 token, trùng nhau 30 token để
        // giữ ngữ cảnh)
        DocumentSplitter documentSplitter = DocumentSplitters.recursive(300, 30);

        // Nạp dữ liệu vào Embedding Store (Chuyển chữ thành Vector)
        EmbeddingStoreIngestor ingestor = EmbeddingStoreIngestor.builder()
                .documentSplitter(documentSplitter)
                .embeddingModel(embeddingModel)
                .embeddingStore(embeddingStore)
                .build();

        ingestor.ingest(document);

        // Trả về ContentRetriever để AI Service sử dụng
        return EmbeddingStoreContentRetriever.builder()
                .embeddingStore(embeddingStore)
                .embeddingModel(embeddingModel)
                .maxResults(2) // Lấy ra 2 đoạn thông tin liên quan nhất
                .minScore(0.6) // Độ chính xác tối thiểu
                .build();
    }
}
