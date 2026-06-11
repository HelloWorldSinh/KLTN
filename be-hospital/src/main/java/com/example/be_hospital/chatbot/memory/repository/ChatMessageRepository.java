package com.example.be_hospital.chatbot.memory.repository;

import com.example.be_hospital.chatbot.memory.entity.ChatMessageEntity;

import jakarta.transaction.Transactional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessageEntity, Long> {
    List<ChatMessageEntity> findBySessionIdOrderByIdAsc(String sessionId);

    List<ChatMessageEntity> findTop10BySessionIdOrderByIdDesc(String sessionId);

    @Modifying
    @Transactional
    @Query("DELETE FROM ChatMessageEntity c WHERE c.sessionId = :sessionId")
    void deleteBySessionId(@Param("sessionId") String sessionId);
}
