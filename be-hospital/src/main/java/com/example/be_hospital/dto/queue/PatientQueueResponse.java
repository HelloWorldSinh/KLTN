package com.example.be_hospital.dto.queue;

import lombok.Data;
import java.util.List;

@Data
public class PatientQueueResponse {

    // === Bệnh nhân có lịch hẹn hôm nay không? ===
    private boolean hasAppointmentToday;

    // === Thông tin vị trí của bệnh nhân ===
    private int myPosition;          // Vị trí trong hàng đợi (0 = không trong queue)
    private int totalInQueue;        // Tổng số BN đang chờ
    private String myStatus;         // Status gốc: WAITING, IN_PROGRESS...
    private String myDisplayStatus;  // "Đang khám", "Chuẩn bị", "Chờ khám"

    // === Thông tin lịch khám ===
    private int appointmentId;       // ID lịch hẹn của BN
    private int scheduleId;          // ID lịch làm việc/lịch khám
    private String doctorName;       // Tên bác sĩ
    private String room;             // Phòng khám
    private String startTime;        // Giờ bắt đầu ca
    private String endTime;          // Giờ kết thúc ca

    // === Danh sách hàng đợi (chỉ hiển thị số thứ tự) ===
    private List<QueueItemDTO> queueList;
}
