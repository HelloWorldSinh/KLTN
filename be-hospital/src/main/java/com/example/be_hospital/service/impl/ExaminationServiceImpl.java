package com.example.be_hospital.service.impl;

import com.example.be_hospital.dto.ResponseObject;
import com.example.be_hospital.dto.examination.ExaminationRequest;
import com.example.be_hospital.dto.examination.ExaminationResponse;
import com.example.be_hospital.dto.examination.PrescriptionRequest;
import com.example.be_hospital.entity.*;
import com.example.be_hospital.repository.*;
import com.example.be_hospital.service.ExaminationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ExaminationServiceImpl implements ExaminationService {

    @Autowired
    private ExaminationRepository examinationRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private PrescriptionRepository prescriptionRepository;

    @Autowired
    private PrescriptionDetailRepository prescriptionDetailRepository;

    @Autowired
    private MedicineRepository medicineRepository;

    @Override
    public ExaminationResponse getExamination(int appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        ExaminationResponse response = new ExaminationResponse();
        response.setAppointmentId(appointmentId);
        response.setStatus(appointment.getStatus());

        examinationRepository.findById(appointmentId).ifPresent(exam -> {
            response.setSymptom(exam.getSymptom());
            response.setDiagnosis(exam.getDiagnosis());

            prescriptionRepository.findById(appointmentId).ifPresent(pres -> {
                response.setLastUpdated(pres.getLastUpdated());
                List<ExaminationResponse.PrescriptionDetailResponse> details = prescriptionDetailRepository
                        .findByPrescriptionId(appointmentId).stream().map(d -> {
                            ExaminationResponse.PrescriptionDetailResponse dr = new ExaminationResponse.PrescriptionDetailResponse();
                            dr.setMedicineId(d.getMedicineId());
                            dr.setQuantity(d.getQuantity());
                            dr.setDosage(d.getDosage());
                            medicineRepository.findById(d.getMedicineId())
                                    .ifPresent(m -> dr.setMedicineName(m.getName()));
                            return dr;
                        }).collect(Collectors.toList());
                response.setPrescriptionDetails(details);
            });
        });

        if (response.getPrescriptionDetails() == null) {
            response.setPrescriptionDetails(new ArrayList<>());
        }

        return response;
    }

    @Override
    @Transactional
    public ResponseObject saveExamination(int appointmentId, ExaminationRequest request) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if (appointment.getStatus() == AppointmentStatus.COMPLETED) {
            return new ResponseObject(false, "Hồ sơ đã đóng, không thể chỉnh sửa");
        }

        Examination examination = examinationRepository.findById(appointmentId).orElse(new Examination());
        examination.setAppointmentId(appointmentId);
        examination.setSymptom(request.getSymptom());
        examination.setDiagnosis(request.getDiagnosis());

        examinationRepository.save(examination);
        return new ResponseObject(true, "Lưu thông tin khám thành công");
    }

    @Override
    @Transactional
    public ResponseObject savePrescription(int appointmentId, PrescriptionRequest request) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        Examination examination = examinationRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Vui lòng lưu thông tin chẩn đoán trước khi kê đơn"));

        if (examination.getDiagnosis() == null || examination.getDiagnosis().trim().isEmpty()) {
            return new ResponseObject(false, "Vui lòng nhập chẩn đoán trước khi kê đơn");
        }

        // Save Prescription master
        Prescription prescription = prescriptionRepository.findById(appointmentId).orElse(new Prescription());

        prescription.setExaminationId(appointmentId);
        prescriptionRepository.save(prescription);

        // Clear old details and save new ones
        prescriptionDetailRepository.deleteByPrescriptionId(appointmentId);
        if (request.getDetails() != null) {
            List<PrescriptionDetail> details = request.getDetails().stream().map(req -> {
                PrescriptionDetail detail = new PrescriptionDetail();
                detail.setPrescriptionId(appointmentId);
                detail.setMedicineId(req.getMedicineId());
                detail.setQuantity(req.getQuantity());
                detail.setDosage(req.getDosage());
                return detail;
            }).collect(Collectors.toList());
            prescriptionDetailRepository.saveAll(details);
        }

        return new ResponseObject(true, "Lưu đơn thuốc thành công");
    }

    @Override
    @Transactional
    public ResponseObject completeExamination(int appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if (appointment.getStatus() == AppointmentStatus.COMPLETED) {
            return new ResponseObject(true, "Cuộc hẹn đã hoàn thành trước đó");
        }

        Examination examination = examinationRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Chưa có thông tin khám bệnh. Vui lòng nhập chẩn đoán."));

        if (examination.getDiagnosis() == null || examination.getDiagnosis().trim().isEmpty()) {
            return new ResponseObject(false, "Vui lòng nhập chẩn đoán trước khi kết thúc khám");
        }

        appointment.setStatus(AppointmentStatus.COMPLETED);
        appointmentRepository.save(appointment);

        return new ResponseObject(true, "Kết thúc ca khám thành công. Hồ sơ đã được đóng.");
    }
}
