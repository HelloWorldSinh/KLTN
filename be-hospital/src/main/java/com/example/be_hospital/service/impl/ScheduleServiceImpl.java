package com.example.be_hospital.service.impl;

import com.example.be_hospital.dto.ResponseObject;
import com.example.be_hospital.dto.schedule.ScheduleCreateRequest;
import com.example.be_hospital.dto.schedule.ScheduleDTO;
import com.example.be_hospital.entity.Schedule;
import com.example.be_hospital.repository.AppointmentRepository;
import com.example.be_hospital.repository.ScheduleRepository;
import com.example.be_hospital.repository.UserRepository;
import com.example.be_hospital.repository.DoctorProfileRepository;
import com.example.be_hospital.service.ScheduleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ScheduleServiceImpl implements ScheduleService {

    @Autowired
    private ScheduleRepository scheduleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private DoctorProfileRepository doctorProfileRepository;

    @Override
    public List<ScheduleDTO> getAllSchedules() {
        return scheduleRepository.findAllByOrderByWorkDateDesc().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ResponseObject createSchedules(ScheduleCreateRequest request) {
        List<LocalDate> dates = new ArrayList<>();
        if (request.isRecurring()) {
            LocalDate current = request.getStartDate();
            while (!current.isAfter(request.getEndDate())) {
                if (request.getDaysOfWeek().contains(current.getDayOfWeek().getValue())) {
                    dates.add(current);
                }
                current = current.plusDays(1);
            }
        } else {
            dates.add(request.getStartDate());
        }

        if (dates.isEmpty()) {
            return new ResponseObject(false, "Không có ngày nào hợp lệ trong khoảng được chọn");
        }

        // Validate all dates for conflicts before saving anything
        for (LocalDate date : dates) {
            List<Schedule> conflicts = scheduleRepository.findOverlappingSchedules(
                    request.getDoctorId(), date, request.getStartTime(), request.getEndTime());
            if (!conflicts.isEmpty()) {
                return new ResponseObject(false, "Xung đột lịch vào ngày: " + date + ". Vui lòng kiểm tra lại.");
            }
        }

        // If no conflicts, save all
        for (LocalDate date : dates) {
            Schedule schedule = new Schedule();
            schedule.setDoctorId(request.getDoctorId());
            schedule.setWorkDate(date);
            schedule.setStartTime(request.getStartTime());
            schedule.setEndTime(request.getEndTime());
            schedule.setSlot(request.getSlot());
            schedule.setRoom(request.getRoom());
            scheduleRepository.save(schedule);
        }

        return new ResponseObject(true, "Tạo " + dates.size() + " lịch làm việc thành công");
    }

    @Override
    public ResponseObject updateSchedule(int id, ScheduleDTO dto) {
        Optional<Schedule> optional = scheduleRepository.findById(id);
        if (optional.isEmpty()) {
            return new ResponseObject(false, "Không tìm thấy lịch làm việc");
        }

        if (appointmentRepository.countByScheduleId(id) > 0) {
            return new ResponseObject(false, "Không thể chỉnh sửa lịch đã có bệnh nhân đăng ký");
        }

        // Overlap check for the updated time (excluding self)
        List<Schedule> conflicts = scheduleRepository.findOverlappingSchedules(
                dto.getDoctorId(), dto.getWorkDate(), dto.getStartTime(), dto.getEndTime());
        
        boolean hasRealConflict = conflicts.stream().anyMatch(s -> s.getId() != id);
        if (hasRealConflict) {
            return new ResponseObject(false, "Xung đột lịch làm việc khác của bác sĩ");
        }

        Schedule schedule = optional.get();
        schedule.setWorkDate(dto.getWorkDate());
        schedule.setStartTime(dto.getStartTime());
        schedule.setEndTime(dto.getEndTime());
        schedule.setSlot(dto.getSlot());
        schedule.setRoom(dto.getRoom());
        scheduleRepository.save(schedule);

        return new ResponseObject(true, "Cập nhật lịch thành công");
    }

    @Override
    public ResponseObject deleteSchedule(int id) {
        if (appointmentRepository.countByScheduleId(id) > 0) {
            return new ResponseObject(false, "Không thể xóa lịch đã có bệnh nhân đăng ký");
        }
        if (!scheduleRepository.existsById(id)) {
            return new ResponseObject(false, "Lịch làm việc không tồn tại");
        }
        scheduleRepository.deleteById(id);
        return new ResponseObject(true, "Xóa lịch thành công");
    }

    @Override
    public List<ScheduleDTO> getSchedulesByDoctor(int doctorId) {
        return scheduleRepository.findByDoctorId(doctorId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ScheduleDTO> getAvailableSchedules(Integer specialtyId, Integer doctorId, LocalDate date) {
        return scheduleRepository.findAllByOrderByWorkDateDesc().stream()
                .filter(s -> {
                    if (date != null && !s.getWorkDate().equals(date)) return false;
                    if (doctorId != null && s.getDoctorId() != doctorId) return false;
                    if (s.getWorkDate().isBefore(LocalDate.now())) return false;
                    if (specialtyId != null) {
                        com.example.be_hospital.entity.DoctorProfile profile = 
                            doctorProfileRepository.findById(s.getDoctorId()).orElse(null);
                        if (profile == null || profile.getSpecialtyId() != specialtyId) return false;
                    }
                    int activeCount = appointmentRepository.countByScheduleIdAndStatusNot(s.getId(), com.example.be_hospital.entity.AppointmentStatus.CANCELLED);
                    if (activeCount >= s.getSlot()) return false;
                    return true;
                })
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private ScheduleDTO mapToDTO(Schedule schedule) {
        ScheduleDTO dto = new ScheduleDTO();
        dto.setId(schedule.getId());
        dto.setDoctorId(schedule.getDoctorId());
        dto.setWorkDate(schedule.getWorkDate());
        dto.setStartTime(schedule.getStartTime());
        dto.setEndTime(schedule.getEndTime());
        dto.setSlot(schedule.getSlot());
        dto.setRoom(schedule.getRoom());
        dto.setAppointmentCount(appointmentRepository.countByScheduleId(schedule.getId()));

        userRepository.findById(schedule.getDoctorId()).ifPresent(user -> {
            dto.setDoctorName(user.getFullName());
        });

        return dto;
    }
}
