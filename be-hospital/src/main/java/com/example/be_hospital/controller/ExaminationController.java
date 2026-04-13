package com.example.be_hospital.controller;

import com.example.be_hospital.dto.ResponseObject;
import com.example.be_hospital.dto.examination.ExaminationRequest;
import com.example.be_hospital.dto.examination.ExaminationResponse;
import com.example.be_hospital.dto.examination.PrescriptionRequest;
import com.example.be_hospital.service.ExaminationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/examinations")
public class ExaminationController {

    @Autowired
    private ExaminationService examinationService;

    @GetMapping("/{appointmentId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'PATIENT')")
    public ResponseEntity<ExaminationResponse> getExamination(@PathVariable int appointmentId) {
        return ResponseEntity.ok(examinationService.getExamination(appointmentId));
    }

    @PostMapping("/{appointmentId}")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ResponseObject> saveExamination(
            @PathVariable int appointmentId,
            @RequestBody ExaminationRequest request) {
        return ResponseEntity.ok(examinationService.saveExamination(appointmentId, request));
    }

    @PostMapping("/{appointmentId}/prescription")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ResponseObject> savePrescription(
            @PathVariable int appointmentId,
            @RequestBody PrescriptionRequest request) {
        return ResponseEntity.ok(examinationService.savePrescription(appointmentId, request));
    }

    @PostMapping("/{appointmentId}/complete")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ResponseObject> completeExamination(@PathVariable int appointmentId) {
        return ResponseEntity.ok(examinationService.completeExamination(appointmentId));
    }
}
