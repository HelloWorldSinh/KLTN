package com.example.be_hospital.dto.admin;

import com.example.be_hospital.entity.AppointmentStatus;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class RecentAppointmentDTO {
    private int id;
    private String patientName;
    private String patientPhone;
    private String doctorName;
    private String specialtyName;
    private LocalDate workDate;
    private String timeSlot;
    private AppointmentStatus status;
    private LocalDateTime createdAt;
}
