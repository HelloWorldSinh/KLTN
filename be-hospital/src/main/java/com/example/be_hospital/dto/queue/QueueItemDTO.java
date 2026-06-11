package com.example.be_hospital.dto.queue;

import lombok.Data;

@Data
public class QueueItemDTO {

    private int appointmentId;    // ID lịch hẹn

    private int queuePosition;   // Vị trí: 1, 2, 3...

    private String status;       // Trạng thái gốc: WAITING, IN_PROGRESS, MISSED...

    private String displayStatus; // Trạng thái hiển thị: "Đang khám", "Chuẩn bị", "Chờ khám", "Vắng mặt"

    private Integer queueOrder;   // Số thứ tự gốc của bệnh nhân
}
