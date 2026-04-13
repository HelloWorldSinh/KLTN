package com.example.be_hospital.dto.appointment;

import com.example.be_hospital.entity.AppointmentStatus;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
public class AppointmentDTO {
    private int id;
    private int scheduleId;
    private int doctorId;
    private String doctorName;
    private String specialtyName;
    private LocalDate workDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String room;
    private AppointmentStatus status;
    private String cancelReason;
    private LocalDateTime createdAt;
}
