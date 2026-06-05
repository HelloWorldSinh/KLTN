package com.example.be_hospital.service.impl;

import com.example.be_hospital.dto.account.AccountRequest;
import com.example.be_hospital.dto.account.AccountResponse;
import com.example.be_hospital.dto.ResponseObject;
import com.example.be_hospital.dto.admin.DashboardStatsResponse;
import com.example.be_hospital.dto.admin.RecentAppointmentDTO;
import com.example.be_hospital.entity.*;
import com.example.be_hospital.repository.*;
import com.example.be_hospital.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@Service
public class AdminServiceImpl implements AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DoctorProfileRepository doctorProfileRepository;

    @Autowired
    private SpecialtyRepository specialtyRepository;

    @Autowired
    private MedicineRepository medicineRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private ScheduleRepository scheduleRepository;

    @Override
    public List<AccountResponse> getAllAccounts() {
        List<String> roles = List.of("DOCTOR", "STAFF");
        List<User> users = userRepository.findByRoleIn(roles);

        return users.stream().map(user -> {
            AccountResponse dto = new AccountResponse();
            dto.setId(user.getId());
            dto.setPhone(user.getPhone());
            dto.setFullName(user.getFullName());
            dto.setRole(user.getRole());
            dto.setPassword(user.getPassword());

            if ("DOCTOR".equals(user.getRole())) {
                doctorProfileRepository.findById(user.getId()).ifPresent(profile -> {
                    dto.setSpecialtyId(profile.getSpecialtyId());
                    dto.setDegree(profile.getDegree());
                    dto.setStartWorkingDate(profile.getStartWorkingDate());
                });
            }
            return dto;
        }).collect(Collectors.toList());
    }

    @Override
    public ResponseObject createAccount(AccountRequest request) {
        if (userRepository.existsByPhone(request.getPhone())) {
            return new ResponseObject(false, "Lỗi: Tên đăng nhập đã tồn tại");
        }

        User user = new User();
        user.setPassword(request.getPassword());
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        user.setRole(request.getRole().toUpperCase());

        userRepository.save(user);

        if ("DOCTOR".equalsIgnoreCase(request.getRole()) && request.getSpecialtyId() != null) {
            com.example.be_hospital.entity.DoctorProfile profile = new com.example.be_hospital.entity.DoctorProfile();
            profile.setUserId(user.getId());
            profile.setSpecialtyId(request.getSpecialtyId());
            profile.setDegree(request.getDegree());
            profile.setStartWorkingDate(request.getStartWorkingDate());
            doctorProfileRepository.save(profile);
        }

        return new ResponseObject(true, "Thêm tài khoản mới thành công");
    }

    @Override
    public ResponseObject updateAccount(int id, AccountRequest request) {
        Optional<User> userOptional = userRepository.findById(id);

        if (userOptional.isEmpty()) {
            return new ResponseObject(false, "Lỗi: không tồn tại user");
        }

        User existUser = userOptional.get();
        existUser.setFullName(request.getFullName());
        existUser.setPhone(request.getPhone());
        existUser.setPassword(request.getPassword());
        existUser.setRole(request.getRole());
        userRepository.save(existUser);

        if ("DOCTOR".equalsIgnoreCase(request.getRole())) {
            com.example.be_hospital.entity.DoctorProfile profile = doctorProfileRepository.findById(id)
                    .orElse(new com.example.be_hospital.entity.DoctorProfile());
            profile.setUserId(id);
            if (request.getSpecialtyId() != null) {
                profile.setSpecialtyId(request.getSpecialtyId());
            }
            profile.setDegree(request.getDegree());
            profile.setStartWorkingDate(request.getStartWorkingDate());
            doctorProfileRepository.save(profile);
        } else {
            // Khi thao tác edit account chọn role staff (hoặc khác DOCTOR), xóa dữ liệu ở bảng doctor_profile
            doctorProfileRepository.deleteById(id);
        }

        return new ResponseObject(true, "Cập nhật thành công");
    }

    @Override
    public ResponseObject deleteAccount(int id) {
        if (!userRepository.existsById(id)) {
            return new ResponseObject(false, "Lỗi: tài khoản không tồn tại");
        }

        if (doctorProfileRepository.existsById(id)) {
            doctorProfileRepository.deleteById(id);
        }
        userRepository.deleteById(id);
        return new ResponseObject(true, "Xóa thành công");
    }

    @Override
    public DashboardStatsResponse getDashboardStats() {
        DashboardStatsResponse stats = new DashboardStatsResponse();
        
        // Count totals
        stats.setTotalPatients(userRepository.countByRole("PATIENT"));
        stats.setTotalDoctors(userRepository.countByRole("DOCTOR"));
        stats.setTotalStaff(userRepository.countByRole("STAFF"));
        stats.setTotalSpecialties(specialtyRepository.count());
        stats.setTotalMedicines(medicineRepository.count());
        stats.setTotalAppointments(appointmentRepository.count());
        stats.setPendingCancelSchedules(scheduleRepository.countByStatus("PENDING_CANCEL"));

        // Status breakdown
        Map<String, Long> statusCounts = new HashMap<>();
        // Initialize all enum values to 0 to ensure we have consistent keys in the response
        for (AppointmentStatus status : AppointmentStatus.values()) {
            statusCounts.put(status.name(), 0L);
        }
        
        List<Object[]> statusGroupResults = appointmentRepository.countAppointmentsByStatus();
        for (Object[] row : statusGroupResults) {
            if (row[0] != null) {
                AppointmentStatus status = (AppointmentStatus) row[0];
                Long count = (Long) row[1];
                statusCounts.put(status.name(), count);
            }
        }
        stats.setStatusCounts(statusCounts);

        // Recent appointments
        List<Appointment> recentList = appointmentRepository.findTop10ByOrderByCreatedAtDesc();
        List<RecentAppointmentDTO> recentDTOs = recentList.stream().map(appointment -> {
            RecentAppointmentDTO dto = new RecentAppointmentDTO();
            dto.setId(appointment.getId());
            dto.setStatus(appointment.getStatus());
            dto.setCreatedAt(appointment.getCreatedAt());

            // Patient info
            userRepository.findById(appointment.getPatientId()).ifPresent(patient -> {
                dto.setPatientName(patient.getFullName());
                dto.setPatientPhone(patient.getPhone());
            });

            // Schedule info
            scheduleRepository.findById(appointment.getScheduleId()).ifPresent(schedule -> {
                dto.setWorkDate(schedule.getWorkDate());
                dto.setTimeSlot(schedule.getStartTime().toString() + " - " + schedule.getEndTime().toString());

                // Doctor info
                userRepository.findById(schedule.getDoctorId()).ifPresent(doctor -> {
                    dto.setDoctorName(doctor.getFullName());
                });

                // Specialty info
                doctorProfileRepository.findById(schedule.getDoctorId()).ifPresent(profile -> {
                    specialtyRepository.findById(profile.getSpecialtyId()).ifPresent(specialty -> {
                        dto.setSpecialtyName(specialty.getName());
                    });
                });
            });

            return dto;
        }).collect(Collectors.toList());

        stats.setRecentAppointments(recentDTOs);
        return stats;
    }
}
