package com.example.be_hospital.controller;

import com.example.be_hospital.dto.ResponseObject;
import com.example.be_hospital.dto.queue.DoctorQueueResponse;
import com.example.be_hospital.dto.queue.PatientQueueResponse;
import com.example.be_hospital.entity.Schedule;
import com.example.be_hospital.entity.User;
import com.example.be_hospital.repository.ScheduleRepository;
import com.example.be_hospital.repository.UserRepository;
import com.example.be_hospital.service.QueueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/queue")
public class QueueController {

    @Autowired
    private QueueService queueService;

    @Autowired
    private ScheduleRepository scheduleRepository;

    @Autowired
    private UserRepository userRepository;

    // Bác sĩ lấy danh sách schedule hôm nay (để chọn ca khám)
    @GetMapping("/doctor/schedules/today")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<List<Schedule>> getDoctorTodaySchedules(Principal principal) {
        User doctor = userRepository.findByPhone(principal.getName())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bác sĩ"));
        List<Schedule> schedules = scheduleRepository.findByDoctorIdAndWorkDate(
                doctor.getId(), LocalDate.now());
        return ResponseEntity.ok(schedules);
    }

    // Bệnh nhân xem hàng đợi hôm nay của mình
    @GetMapping("/patient")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<PatientQueueResponse> getPatientQueue(Principal principal) {
        return ResponseEntity.ok(queueService.getPatientQueue(principal.getName()));
    }

    // Bác sĩ/Điều dưỡng xem hàng đợi của một ca khám (schedule)
    @GetMapping("/doctor/{scheduleId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'STAFF')")
    public ResponseEntity<DoctorQueueResponse> getDoctorQueue(@PathVariable int scheduleId, Principal principal) {
        return ResponseEntity.ok(queueService.getDoctorQueue(principal.getName(), scheduleId));
    }

    // Bác sĩ nhấn nút "Bắt đầu khám"
    @PutMapping("/{appointmentId}/start")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ResponseObject> startExamination(@PathVariable int appointmentId, Principal principal) {
        return ResponseEntity.ok(queueService.startExamination(appointmentId, principal.getName()));
    }

    // Bác sĩ nhấn nút "Vắng mặt"
    @PutMapping("/{appointmentId}/absent")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ResponseObject> markAbsent(@PathVariable int appointmentId, Principal principal) {
        return ResponseEntity.ok(queueService.markAbsent(appointmentId, principal.getName()));
    }

    // Điều dưỡng nhấn nút "Gọi lại" (cho bệnh nhân vắng mặt)
    @PutMapping("/{appointmentId}/recall")
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<ResponseObject> recallPatient(@PathVariable int appointmentId, Principal principal) {
        return ResponseEntity.ok(queueService.recallPatient(appointmentId, principal.getName()));
    }

    // Bác sĩ nhấn nút "Quay lại" (hoàn lại trạng thái Đang khám)
    @PutMapping("/{appointmentId}/revert")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ResponseObject> revertExamination(@PathVariable int appointmentId, Principal principal) {
        return ResponseEntity.ok(queueService.revertExamination(appointmentId, principal.getName()));
    }
}
