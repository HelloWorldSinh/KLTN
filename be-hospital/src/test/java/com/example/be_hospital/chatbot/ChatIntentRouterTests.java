package com.example.be_hospital.chatbot;

import com.example.be_hospital.chatbot.service.ChatIntentRouter;
import org.junit.jupiter.api.Test;

import static com.example.be_hospital.chatbot.service.ChatIntentRouter.ChatIntent.FAQ;
import static com.example.be_hospital.chatbot.service.ChatIntentRouter.ChatIntent.OUTSIDE_MEDICAL;
import static com.example.be_hospital.chatbot.service.ChatIntentRouter.ChatIntent.SYMPTOM;
import static com.example.be_hospital.chatbot.service.ChatIntentRouter.ChatIntent.TOOL_LOOKUP;
import static com.example.be_hospital.chatbot.service.ChatIntentRouter.ChatIntent.UNSUPPORTED_HOSPITAL_INFO;
import static org.junit.jupiter.api.Assertions.assertEquals;

class ChatIntentRouterTests {

    private final ChatIntentRouter router = new ChatIntentRouter();

    @Test
    void routesEachSupportedQuestionType() {
        assertEquals(FAQ, router.classify("Bệnh viện mở cửa lúc mấy giờ?"));
        assertEquals(SYMPTOM, router.classify("Tôi bị đau tai nên khám khoa nào?"));
        assertEquals(TOOL_LOOKUP, router.classify("Bệnh viện có những chuyên khoa nào?"));
        assertEquals(TOOL_LOOKUP, router.classify("Bác sĩ Bùi Quang Huy khám khoa nào?"));
        assertEquals(OUTSIDE_MEDICAL, router.classify("Viết code Java giúp tôi"));
        assertEquals(FAQ, router.classify("Chi phí khám sức khỏe xin việc là bao nhiêu?"));
        assertEquals(UNSUPPORTED_HOSPITAL_INFO, router.classify("Giá khám tổng quát là bao nhiêu?"));
        assertEquals(UNSUPPORTED_HOSPITAL_INFO, router.classify("Khám tổng quát giá bao nhiêu?"));
        assertEquals(UNSUPPORTED_HOSPITAL_INFO, router.classify("Phí khám tổng quát thế nào?"));
        assertEquals(UNSUPPORTED_HOSPITAL_INFO, router.classify("Bệnh viện có khám tổng quát không?"));
        assertEquals(UNSUPPORTED_HOSPITAL_INFO, router.classify("Địa chỉ bệnh viện ở đâu?"));
        assertEquals(SYMPTOM, router.classify("Tôi đau đầu và chóng mặt"));
    }
}
