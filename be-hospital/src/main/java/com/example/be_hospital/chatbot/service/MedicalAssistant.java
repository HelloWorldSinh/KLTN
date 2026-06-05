package com.example.be_hospital.chatbot.service;

import dev.langchain4j.service.MemoryId;
import dev.langchain4j.service.SystemMessage;
import dev.langchain4j.service.UserMessage;
import dev.langchain4j.service.spring.AiService;

/**
 * Interface đóng vai trò là Assistant (Trợ lý AI).
 * LangChain4j Spring Boot Starter sẽ tự động tạo implementation cho interface
 * này
 * dựa trên các cấu hình từ ChatbotConfig và các bean hiện có.
 */
@AiService
public interface MedicalAssistant {

    @SystemMessage({
            "Bạn là một trợ lý y tế AI thân thiện và chuyên nghiệp của phòng khám.",
            "Nhiệm vụ của bạn là hỗ trợ bệnh nhân giải đáp thắc mắc, tư vấn chuyên khoa đi khám dựa trên triệu chứng, và cung cấp thông tin bác sĩ, lịch khám.",
            "QUAN TRỌNG: Hãy sử dụng thông tin được cung cấp (nếu có) để trả lời các câu hỏi về quy định, giờ giấc, chi phí của phòng khám. Nếu thông tin không có trong tài liệu, hãy nói rằng bạn không biết.",
            "TỪ CHỐI NGOÀI LỀ: Nếu người dùng hỏi những vấn đề không liên quan đến y tế, sức khỏe hoặc dịch vụ của phòng khám (ví dụ: toán học, lập trình, động vật, chính trị...), hãy từ chối trả lời một cách lịch sự và nhắc họ rằng bạn chỉ hỗ trợ các vấn đề y tế.",
            "Luôn trả lời bằng tiếng Việt một cách lịch sự, dễ hiểu, rõ ràng và đồng cảm.",
            "Tuyệt đối không tự ý chẩn đoán bệnh chính xác hay kê đơn thuốc."
    })

    String chat(@MemoryId String sessionId, @UserMessage String userMessage);
}
