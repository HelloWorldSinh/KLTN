package com.example.be_hospital.dto.queue;

import lombok.Data;
import java.util.List;

@Data
public class DoctorQueueResponse {

    private int scheduleId; // ID ca khám
    private String room; // Phòng khám
    private String startTime; // Giờ bắt đầu
    private String endTime; // Giờ kết thúc

    // === Thống kê ===
    private int totalPatients; // Tổng BN trong ca
    private int completedCount; // Đã khám xong
    private int waitingCount; // Đang chờ

    // === Danh sách hàng đợi (BS thấy đầy đủ tên BN) ===
    private List<DoctorQueueItemDTO> queueList;

    // === DTO riêng cho BS — có thêm tên bệnh nhân ===
    @Data
    public static class DoctorQueueItemDTO {
        private int appointmentId;
        private int patientId;
        private String patientName; // BS được thấy tên đầy đủ
        private int queuePosition;
        private String status;
        private String displayStatus;
    }
}