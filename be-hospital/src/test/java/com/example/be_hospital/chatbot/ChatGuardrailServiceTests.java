package com.example.be_hospital.chatbot;

import com.example.be_hospital.chatbot.service.ChatGuardrailService;
import com.example.be_hospital.chatbot.service.ChatIntentRouter;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ChatGuardrailServiceTests {

    private final ChatGuardrailService guardrail = new ChatGuardrailService(new ChatIntentRouter());

    @Test
    void refusesOnlyClearlyOutsideMedicalQuestions() {
        assertTrue(guardrail.refusalFor("Viết code Java giúp tôi").isPresent());
        assertFalse(guardrail.refusalFor("Tôi bị đau tai nên khám khoa nào?").isPresent());
        assertFalse(guardrail.refusalFor("Xin chào").isPresent());
    }
}
