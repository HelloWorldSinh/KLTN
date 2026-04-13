package com.example.be_hospital.dto.examination;

import lombok.Data;
import java.util.List;

@Data
public class PrescriptionRequest {
    private List<PrescriptionDetailRequest> details;

    @Data
    public static class PrescriptionDetailRequest {
        private int medicineId;
        private int quantity;
        private String dosage;
    }
}
