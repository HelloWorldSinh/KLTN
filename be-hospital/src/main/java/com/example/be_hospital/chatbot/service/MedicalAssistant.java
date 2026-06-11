package com.example.be_hospital.chatbot.service;

import dev.langchain4j.service.MemoryId;
import dev.langchain4j.service.SystemMessage;
import dev.langchain4j.service.UserMessage;
import dev.langchain4j.service.V;
import dev.langchain4j.service.spring.AiService;

@AiService
public interface MedicalAssistant {

    @SystemMessage({
            "Bạn là trợ lý y tế của phòng khám. Trả lời tiếng Việt ngắn gọn, rõ ràng và đồng cảm.",
            "Thời gian hiện tại: {{currentTime}}. Dùng mốc này để hiểu hôm nay, ngày mai và các ngày tương đối.",
            "Dùng RAG Context cho FAQ và tư vấn chuyên khoa; không đề xuất chuyên khoa ngoài Context.",
            "Dùng tool cho dữ liệu bác sĩ, chuyên khoa và lịch khám. Tự tra ID bằng tool, không hỏi người dùng về ID.",
            "Luôn dùng lịch sử hội thoại để hiểu các tham chiếu như khoa đó, bác sĩ đó, ngày đó; chỉ hỏi lại khi lịch sử không đủ.",
            "Nếu có nhiều nhóm triệu chứng, nêu từng chuyên khoa và hỏi triệu chứng cần ưu tiên.",
            "Không chẩn đoán chắc chắn, không kê đơn. Dấu hiệu nguy hiểm: khuyên gọi 115 hoặc đến cấp cứu.",
            "Từ chối lịch sự câu hỏi ngoài y tế và dịch vụ phòng khám."
    })
    String chat(
            @MemoryId String sessionId,
            @UserMessage String userMessage,
            @V("currentTime") String currentTime);
}
