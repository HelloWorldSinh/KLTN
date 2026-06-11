package com.example.be_hospital.chatbot;

import com.example.be_hospital.chatbot.service.ChatIntentRouter;
import org.junit.jupiter.api.Test;

import static com.example.be_hospital.chatbot.service.ChatIntentRouter.ChatIntent.FAQ;
import static com.example.be_hospital.chatbot.service.ChatIntentRouter.ChatIntent.OUTSIDE_MEDICAL;
import static com.example.be_hospital.chatbot.service.ChatIntentRouter.ChatIntent.SYMPTOM;
import static com.example.be_hospital.chatbot.service.ChatIntentRouter.ChatIntent.TOOL_LOOKUP;
import static org.junit.jupiter.api.Assertions.assertEquals;

class ChatIntentRouterTests {

    private final ChatIntentRouter router = new ChatIntentRouter();

    @Test
    void routesEachSupportedQuestionType() {
        assertEquals(FAQ, router.classify("Bệnh viện mở cửa lúc mấy giờ?"));
        assertEquals(SYMPTOM, router.classify("Tôi bị đau tai nên khám khoa nào?"));
        assertEquals(TOOL_LOOKUP, router.classify("Bệnh viện có những chuyên khoa nào?"));
        assertEquals(OUTSIDE_MEDICAL, router.classify("Viết code Java giúp tôi"));
    }
}
