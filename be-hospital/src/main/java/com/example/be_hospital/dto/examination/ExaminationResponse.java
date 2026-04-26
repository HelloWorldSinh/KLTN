package com.example.be_hospital.dto.examination;

import com.example.be_hospital.entity.AppointmentStatus;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class ExaminationResponse {
    private int appointmentId;
    private String symptom;
    private String diagnosis;
    private AppointmentStatus status;
    private List<PrescriptionDetailResponse> prescriptionDetails;
    private LocalDateTime lastUpdated;

    @Data
    public static class PrescriptionDetailResponse {
        private int medicineId;
        private String medicineName;
        private int quantity;
        private String dosage;
    }
}
