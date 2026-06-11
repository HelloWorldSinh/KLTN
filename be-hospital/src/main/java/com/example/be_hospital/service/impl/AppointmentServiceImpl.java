package com.example.be_hospital.service.impl;

import com.example.be_hospital.dto.appointment.AppointmentCreateRequest;
import com.example.be_hospital.dto.appointment.AppointmentDTO;
import com.example.be_hospital.dto.appointment.DoctorAppointmentDTO;
import com.example.be_hospital.dto.ResponseObject;
import com.example.be_hospital.entity.*;
import com.example.be_hospital.repository.*;
import com.example.be_hospital.service.AppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AppointmentServiceImpl implements AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private ScheduleRepository scheduleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DoctorProfileRepository doctorProfileRepository;

    @Autowired
    private SpecialtyRepository specialtyRepository;

    @Override
    public ResponseObject bookAppointment(String phone, AppointmentCreateRequest request) {
        Optional<User> patientOpt = userRepository.findByPhone(phone);
        if (patientOpt.isEmpty()) {
            return new ResponseObject(false, "Không tìm thấy người dùng");
        }
        User patient = patientOpt.get();

        Optional<Schedule> scheduleOpt = scheduleRepository.findById(request.getScheduleId());
        if (scheduleOpt.isEmpty()) {
            return new ResponseObject(false, "Không tìm thấy lịch khám");
        }
        Schedule schedule = scheduleOpt.get();

        // Check if schedule date is valid (can add logic here if needed, eg. not in
        // past)
        if (schedule.getWorkDate().isBefore(java.time.LocalDate.now())) {
            return new ResponseObject(false, "Không thể đặt lịch trong quá khứ");
        }

        int activeCount = appointmentRepository.countByScheduleIdAndStatusNot(schedule.getId(),
                AppointmentStatus.CANCELLED);
        if (activeCount >= schedule.getSlot()) {
            return new ResponseObject(false, "Khung giờ khám này đã hết chỗ");
        }

        Appointment appointment = new Appointment();
        appointment.setPatientId(patient.getId());
        appointment.setScheduleId(schedule.getId());
        appointment.setStatus(AppointmentStatus.CONFIRMED);

        // Gán số thứ tự trong hàng đợi
        int currentCount = appointmentRepository.countByScheduleId(schedule.getId());
        appointment.setQueueOrder(currentCount + 1);

        appointmentRepository.save(appointment);

        return new ResponseObject(true, "Đặt lịch khám thành công", appointment.getQueueOrder());
    }

    @Override
    public List<AppointmentDTO> getPatientAppointments(String phone) {
        User patient = userRepository.findByPhone(phone).orElseThrow(() -> new RuntimeException("User not found"));

        return appointmentRepository.findByPatientIdOrderByCreatedAtDesc(patient.getId())
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ResponseObject cancelAppointment(int appointmentId, String phone, String reason) {
        User patient = userRepository.findByPhone(phone).orElseThrow(() -> new RuntimeException("User not found"));
        Optional<Appointment> appointmentOpt = appointmentRepository.findById(appointmentId);

        if (appointmentOpt.isEmpty()) {
            return new ResponseObject(false, "Không tìm thấy lịch hẹn");
        }

        Appointment appointment = appointmentOpt.get();
        if (appointment.getPatientId() != patient.getId()) {
            return new ResponseObject(false, "Từ chối quyền truy cập");
        }

        if (appointment.getStatus() != AppointmentStatus.PENDING
                && appointment.getStatus() != AppointmentStatus.CONFIRMED) {
            return new ResponseObject(false, "Không thể hủy lịch này do trạng thái không hợp lệ");
        }

        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointment.setCancelReason(reason != null && !reason.trim().isEmpty() ? reason : "");
        appointmentRepository.save(appointment);

        return new ResponseObject(true, "Đã hủy lịch khám");
    }

    @Override
    public List<DoctorAppointmentDTO> getDoctorAppointments(String phone) {
        User doctor = userRepository.findByPhone(phone).orElseThrow(() -> new RuntimeException("Doctor not found"));

        return appointmentRepository.findAppointmentsByDoctorId(doctor.getId())
                .stream()
                .map(this::mapToDoctorDTO)
                .collect(Collectors.toList());
    }

    private DoctorAppointmentDTO mapToDoctorDTO(Appointment appointment) {
        DoctorAppointmentDTO dto = new DoctorAppointmentDTO();
        dto.setAppointmentId(appointment.getId());
        dto.setPatientId(appointment.getPatientId());
        dto.setStatus(appointment.getStatus());
        dto.setCancelReason(appointment.getCancelReason());
        dto.setCreatedAt(appointment.getCreatedAt());
        dto.setQueueOrder(appointment.getQueueOrder());

        userRepository.findById(appointment.getPatientId()).ifPresent(patient -> {
            dto.setPatientName(patient.getFullName());
            dto.setPatientGender(patient.getGender());
            dto.setPatientDob(patient.getDob());
            dto.setPatientPhone(patient.getPhone());
            dto.setPatientAddress(patient.getAddress());
        });

        scheduleRepository.findById(appointment.getScheduleId()).ifPresent(schedule -> {
            dto.setWorkDate(schedule.getWorkDate());
            dto.setStartTime(schedule.getStartTime());
            dto.setEndTime(schedule.getEndTime());
            dto.setRoom(schedule.getRoom());
        });

        return dto;
    }

    private AppointmentDTO mapToDTO(Appointment appointment) {
        AppointmentDTO dto = new AppointmentDTO();
        dto.setId(appointment.getId());
        dto.setScheduleId(appointment.getScheduleId());
        dto.setStatus(appointment.getStatus());
        dto.setCancelReason(appointment.getCancelReason());
        dto.setCreatedAt(appointment.getCreatedAt());
        dto.setQueueOrder(appointment.getQueueOrder());

        scheduleRepository.findById(appointment.getScheduleId()).ifPresent(schedule -> {
            dto.setDoctorId(schedule.getDoctorId());
            dto.setWorkDate(schedule.getWorkDate());
            dto.setStartTime(schedule.getStartTime());
            dto.setEndTime(schedule.getEndTime());
            dto.setRoom(schedule.getRoom());

            userRepository.findById(schedule.getDoctorId()).ifPresent(doctor -> {
                dto.setDoctorName(doctor.getFullName());
            });

            doctorProfileRepository.findById(schedule.getDoctorId()).ifPresent(profile -> {
                specialtyRepository.findById(profile.getSpecialtyId()).ifPresent(spec -> {
                    dto.setSpecialtyName(spec.getName());
                });
            });
        });

        return dto;
    }
}
