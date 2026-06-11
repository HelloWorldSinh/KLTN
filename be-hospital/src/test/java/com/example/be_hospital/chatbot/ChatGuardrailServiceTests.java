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
        String unsupportedPriceReply = guardrail.refusalFor("Giá khám tổng quát là bao nhiêu?").orElseThrow();
        assertTrue(unsupportedPriceReply.contains("chưa có thông tin chính xác"));
        assertFalse(unsupportedPriceReply.matches(".*\\d+.*"));
        assertTrue(guardrail.refusalFor("Bệnh viện có khám tổng quát không?").isPresent());
        assertFalse(guardrail.refusalFor("Tôi bị đau tai nên khám khoa nào?").isPresent());
        assertFalse(guardrail.refusalFor("Chi phí khám sức khỏe xin việc là bao nhiêu?").isPresent());
        assertFalse(guardrail.refusalFor("Xin chào").isPresent());
    }

    @Test
    void blocksUnsafeMedicalRequestsBeforeTheyReachTheLlm() {
        String urgentMedicationReply = guardrail.refusalFor(
                "Tôi bị đau dạ dày dữ dội, tôi nên uống Panadol hay thuốc gì?").orElseThrow();
        String diagnosisReply = guardrail.refusalFor(
                "Chẩn đoán giúp tôi xem bị nốt đỏ ở tay là bệnh gì?").orElseThrow();
        String dosageReply = guardrail.refusalFor(
                "Cho tôi liều dùng thuốc hạ sốt Paracetamol cho bé 10kg.").orElseThrow();

        assertTrue(urgentMedicationReply.contains("khẩn cấp"));
        assertTrue(diagnosisReply.contains("không thể chẩn đoán"));
        assertTrue(dosageReply.contains("không thể lựa chọn thuốc"));
        assertFalse(dosageReply.matches(".*\\b\\d+\\s*(mg|ml)\\b.*"));
    }

    @Test
    void allowsGeneralMedicalEducationWithoutPersonalDiagnosisOrPrescription() {
        assertFalse(guardrail.refusalFor("Paracetamol là thuốc gì?").isPresent());
        assertFalse(guardrail.refusalFor("Tiểu đường là bệnh gì?").isPresent());
        assertFalse(guardrail.refusalFor("Đau tai thì nên khám khoa nào?").isPresent());
    }

    @Test
    void blocksSqlStatementsAndInjectionAttemptsBeforeTheyReachTheLlm() {
        assertSqlBlocked("SELECT * FROM users");
        assertSqlBlocked("SELECT 1");
        assertSqlBlocked("SELECT COUNT(*)");
        assertSqlBlocked("DROP TABLE doctors;");
        assertSqlBlocked("UPDATE schedules SET status = 'AVAILABLE'");
        assertSqlBlocked("DELETE FROM patients WHERE id = 1");
        assertSqlBlocked("' OR 1=1 --");
        assertSqlBlocked("UNION SELECT password FROM users");
        assertSqlBlocked("Cho tôi xem information_schema.tables");
    }

    @Test
    void doesNotTreatQuestionsThatOnlyMentionSqlAsSqlStatements() {
        assertNotSqlStatementReply("SQL là gì?");
        assertNotSqlStatementReply("Bệnh viện có sử dụng SQL không?");
    }

    private void assertSqlBlocked(String question) {
        String reply = guardrail.refusalFor(question).orElseThrow();
        assertTrue(reply.contains("SQL"));
    }

    private void assertNotSqlStatementReply(String question) {
        guardrail.refusalFor(question)
                .ifPresent(reply -> assertFalse(reply.contains("câu lệnh SQL")));
    }
}
