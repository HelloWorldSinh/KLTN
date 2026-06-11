package com.example.be_hospital.chatbot.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.Locale;
import java.util.Optional;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class ChatGuardrailService {

    private static final String OUTSIDE_MEDICAL_REPLY =
            "Xin lỗi, tôi chỉ hỗ trợ các câu hỏi về y tế và dịch vụ của bệnh viện.";

    private static final String UNSUPPORTED_HOSPITAL_INFO_REPLY =
            "Xin lỗi, hiện tại tôi chưa có thông tin chính xác về nội dung này. "
                    + "Bạn vui lòng liên hệ trực tiếp bệnh viện để được tư vấn.";

    private static final String URGENT_SYMPTOM_REPLY =
            "Triệu chứng dữ dội có thể cần được đánh giá khẩn cấp. Bạn không nên tự dùng thuốc; "
                    + "hãy đến cơ sở y tế gần nhất hoặc gọi 115 nếu tình trạng nặng lên.";

    private static final String MEDICATION_REPLY =
            "Tôi không thể lựa chọn thuốc, kê đơn hoặc hướng dẫn liều dùng cá nhân. "
                    + "Bạn vui lòng hỏi bác sĩ hoặc dược sĩ; nếu triệu chứng nặng, hãy đến cơ sở y tế.";

    private static final String DIAGNOSIS_REPLY =
            "Tôi không thể chẩn đoán bệnh chỉ từ mô tả này. "
                    + "Bạn nên được bác sĩ thăm khám trực tiếp để xác định nguyên nhân.";

    private static final String SQL_REQUEST_REPLY =
            "Xin lỗi, tôi không thể thực thi hoặc hỗ trợ câu lệnh SQL. "
                    + "Bạn vui lòng hỏi về y tế hoặc dịch vụ của bệnh viện.";

    private static final Pattern SQL_STATEMENT_PATTERN = Pattern.compile(
            "(?is)(?:^|[;\\s])(?:"
                    + "select\\s+.+?\\s+from\\s+"
                    + "|select\\s+(?:@@|\\d|['\"`]|[\\w.]+\\s*\\()"
                    + "|insert\\s+into\\s+"
                    + "|update\\s+[\\w.`\"\\[\\]-]+\\s+set\\s+"
                    + "|delete\\s+from\\s+"
                    + "|drop\\s+(?:table|database|schema|view|index)\\s+"
                    + "|alter\\s+(?:table|database|schema|view)\\s+"
                    + "|create\\s+(?:table|database|schema|view|index)\\s+"
                    + "|truncate\\s+table\\s+"
                    + "|merge\\s+into\\s+"
                    + "|(?:grant|revoke)\\s+.+?\\s+(?:to|from)\\s+"
                    + "|call\\s+[\\w.`\"\\[\\]-]+\\s*\\("
                    + "|union\\s+(?:all\\s+)?select\\s+"
                    + "|(?:exec|execute)\\s+"
                    + "|show\\s+(?:databases|tables)\\b"
                    + "|describe\\s+[\\w.`\"\\[\\]-]+"
                    + "|use\\s+[\\w.`\"\\[\\]-]+"
                    + ")");

    private static final Pattern SQL_ATTACK_PATTERN = Pattern.compile(
            "(?is)(?:"
                    + "\\bor\\s+['\"]?1['\"]?\\s*=\\s*['\"]?1['\"]?"
                    + "|\\binformation_schema\\b"
                    + "|\\bxp_cmdshell\\b"
                    + "|\\bsleep\\s*\\("
                    + "|\\bbenchmark\\s*\\("
                    + ")");

    private final ChatIntentRouter intentRouter;

    public Optional<String> refusalFor(String question) {
        if (isSqlRequest(question)) {
            return Optional.of(SQL_REQUEST_REPLY);
        }

        String text = normalize(question);
        if (containsAny(text, "du doi", "kho tho nang", "mat y thuc", "co giat keo dai",
                "chay mau o at", "tim tai", "dau bung cap")) {
            return Optional.of(URGENT_SYMPTOM_REPLY);
        }
        if (isDosageOrPrescriptionRequest(text) || isMedicationRecommendationRequest(text)) {
            return Optional.of(MEDICATION_REPLY);
        }
        if (isDiagnosisRequest(text)) {
            return Optional.of(DIAGNOSIS_REPLY);
        }

        return switch (intentRouter.classify(question)) {
            case OUTSIDE_MEDICAL -> Optional.of(OUTSIDE_MEDICAL_REPLY);
            case UNSUPPORTED_HOSPITAL_INFO -> Optional.of(UNSUPPORTED_HOSPITAL_INFO_REPLY);
            default -> Optional.empty();
        };
    }

    private boolean isDosageOrPrescriptionRequest(String text) {
        return containsAny(text,
                "lieu dung", "lieu thuoc", "cho toi lieu", "ke don", "ke thuoc",
                "uong bao nhieu", "dung bao nhieu", "bao nhieu mg", "mg kg");
    }

    private boolean isMedicationRecommendationRequest(String text) {
        if (containsAny(text,
                "nen dung thuoc", "nen uong thuoc", "uong panadol",
                "uong paracetamol", "dung panadol", "dung paracetamol")) {
            return true;
        }
        return containsAny(text, "thuoc gi")
                && containsAny(text, "nen", "uong", "dung", "cho toi", "tu van");
    }

    private boolean isDiagnosisRequest(String text) {
        if (containsAny(text, "chan doan giup toi", "chan doan cho toi", "toi bi benh gi",
                "minh bi benh gi", "bi benh gi", "mac benh gi")) {
            return true;
        }
        return containsAny(text, "la benh gi")
                && containsAny(text, "toi", "bi", "not", "trieu chung", "tay", "chan", "da");
    }

    private boolean isSqlRequest(String text) {
        if (text == null || text.isBlank()) {
            return false;
        }
        return SQL_STATEMENT_PATTERN.matcher(text).find()
                || SQL_ATTACK_PATTERN.matcher(text).find();
    }

    private boolean containsAny(String text, String... phrases) {
        String paddedText = " " + text + " ";
        for (String phrase : phrases) {
            if (paddedText.contains(" " + phrase + " ")) {
                return true;
            }
        }
        return false;
    }

    private String normalize(String text) {
        if (text == null) {
            return "";
        }
        return Normalizer.normalize(text, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .replace('\u0111', 'd')
                .replace('\u0110', 'D')
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", " ")
                .trim();
    }
}
