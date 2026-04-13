package com.example.be_hospital.dto.examination;

import lombok.Data;

@Data
public class ExaminationRequest {
    private String symptom;
    private String diagnosis;
}
