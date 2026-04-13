package com.example.be_hospital.service;

import com.example.be_hospital.dto.ResponseObject;
import com.example.be_hospital.dto.examination.ExaminationRequest;
import com.example.be_hospital.dto.examination.ExaminationResponse;
import com.example.be_hospital.dto.examination.PrescriptionRequest;

public interface ExaminationService {
    ExaminationResponse getExamination(int appointmentId);
    ResponseObject saveExamination(int appointmentId, ExaminationRequest request);
    ResponseObject savePrescription(int appointmentId, PrescriptionRequest request);
    ResponseObject completeExamination(int appointmentId);
}
