package com.example.be_hospital.dto.appointment;

import com.example.be_hospital.entity.AppointmentStatus;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
public class DoctorAppointmentDTO {
    private int appointmentId;
    private int patientId;
    private String patientName;
    private String patientGender;
    private LocalDate patientDob;
    private String patientPhone;
    private String patientAddress;
    
    private LocalDate workDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String room;
    
    private AppointmentStatus status;
    private String cancelReason;
    private LocalDateTime createdAt;
    private Integer queueOrder;
}
