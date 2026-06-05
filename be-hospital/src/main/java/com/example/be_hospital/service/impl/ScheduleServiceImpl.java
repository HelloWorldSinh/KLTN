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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.example.be_hospital.entity.Appointment;
import com.example.be_hospital.entity.AppointmentStatus;
import com.example.be_hospital.entity.Notification;
import com.example.be_hospital.repository.NotificationRepository;
import com.example.be_hospital.service.SseService;

@Service
public class ScheduleServiceImpl implements ScheduleService {

    private static final Logger log = LoggerFactory.getLogger(ScheduleServiceImpl.class);

    @Autowired
    private ScheduleRepository scheduleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private DoctorProfileRepository doctorProfileRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private SseService sseService;

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
            schedule.setStatus("ACTIVE");
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
                    if (s.getStatus() != null && !"ACTIVE".equals(s.getStatus()) && !"REJECTED_CANCEL".equals(s.getStatus())) return false;
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
        dto.setStatus(schedule.getStatus() != null ? schedule.getStatus() : "ACTIVE");
        dto.setCancelReason(schedule.getCancelReason());

        userRepository.findById(schedule.getDoctorId()).ifPresent(user -> {
            dto.setDoctorName(user.getFullName());
        });

        return dto;
    }

    @Override
    @Transactional
    public ResponseObject requestCancelSchedule(int id, String reason) {
        Optional<Schedule> optional = scheduleRepository.findById(id);
        if (optional.isEmpty()) {
            return new ResponseObject(false, "Không tìm thấy lịch làm việc");
        }
        Schedule schedule = optional.get();

        // Kiểm tra điều kiện: Ngày hủy - Ngày hiện tại >= 2 ngày
        long daysBetween = java.time.temporal.ChronoUnit.DAYS.between(LocalDate.now(), schedule.getWorkDate());
        if (daysBetween < 2) {
            return new ResponseObject(false, "Không đủ thời gian tối thiểu (yêu cầu hủy phải trước ít nhất 2 ngày)");
        }

        schedule.setStatus("PENDING_CANCEL");
        schedule.setCancelReason(reason);
        scheduleRepository.save(schedule);

        // Ghi nhận lý do hủy vào lịch sử (Log)
        log.info("Bác sĩ yêu cầu hủy lịch làm việc. ID lịch: {}, Ngày trực: {}, Lý do: {}", 
                id, schedule.getWorkDate(), reason);

        return new ResponseObject(true, "Đã gửi yêu cầu, chờ phê duyệt");
    }

    @Override
    @Transactional
    public ResponseObject approveCancelSchedule(int id) {
        Optional<Schedule> optional = scheduleRepository.findById(id);
        if (optional.isEmpty()) {
            return new ResponseObject(false, "Không tìm thấy lịch làm việc");
        }
        Schedule schedule = optional.get();
        if (!"PENDING_CANCEL".equals(schedule.getStatus())) {
            return new ResponseObject(false, "Lịch làm việc không ở trạng thái chờ hủy");
        }

        schedule.setStatus("CANCELLED");
        scheduleRepository.save(schedule);

        // Hủy toàn bộ lịch hẹn liên quan (appointment.status = 'CANCELLED')
        List<Appointment> appointments = appointmentRepository.findByScheduleId(id);
        for (Appointment app : appointments) {
            if (app.getStatus() != AppointmentStatus.CANCELLED &&
                app.getStatus() != AppointmentStatus.COMPLETED) {
                
                app.setStatus(AppointmentStatus.CANCELLED);
                app.setCancelReason("Bị hệ thống hủy do bác sĩ thay đổi lịch trực.");
                appointmentRepository.save(app);

                // Thêm thông báo vào bảng notification cho các bệnh nhân
                Notification notification = new Notification();
                notification.setUserId(app.getPatientId());
                notification.setTitle("Lịch hẹn khám bệnh bị hủy");
                notification.setContent("Lịch hẹn của bạn vào ca " + schedule.getStartTime().toString().substring(0, 5) + 
                    " - " + schedule.getEndTime().toString().substring(0, 5) + " ngày " + schedule.getWorkDate() +
                    " tại phòng " + schedule.getRoom() + " đã bị hủy bởi hệ thống do bác sĩ thay đổi lịch trực.");
                notification.setRead(false);
                notificationRepository.save(notification);

                // Gửi thông báo real-time qua SSE đến bệnh nhân
                sseService.sendNotification(
                    app.getPatientId(),
                    notification.getTitle(),
                    notification.getContent()
                );
            }
        }

        log.info("Admin đã phê duyệt yêu cầu hủy lịch làm việc. ID: {}", id);

        return new ResponseObject(true, "Phê duyệt hủy lịch thành công");
    }

    @Override
    @Transactional
    public ResponseObject rejectCancelSchedule(int id, String reason) {
        Optional<Schedule> optional = scheduleRepository.findById(id);
        if (optional.isEmpty()) {
            return new ResponseObject(false, "Không tìm thấy lịch làm việc");
        }
        Schedule schedule = optional.get();
        if (!"PENDING_CANCEL".equals(schedule.getStatus())) {
            return new ResponseObject(false, "Lịch làm việc không ở trạng thái chờ hủy");
        }

        // Khôi phục trạng thái hoạt động (bệnh nhân có thể đăng ký bình thường)
        // Lưu trạng thái REJECTED_CANCEL để bác sĩ biết và hiển thị trong danh sách từ chối
        schedule.setStatus("REJECTED_CANCEL");
        if (reason != null && !reason.trim().isEmpty()) {
            schedule.setCancelReason("Từ chối hủy: " + reason);
        }
        scheduleRepository.save(schedule);

        log.info("Admin đã từ chối yêu cầu hủy lịch làm việc. ID: {}, Lý do từ chối: {}", id, reason);

        return new ResponseObject(true, "Từ chối hủy lịch thành công");
    }
}
