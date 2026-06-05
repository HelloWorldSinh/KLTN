package com.example.be_hospital.service.impl;

import com.example.be_hospital.dto.ResponseObject;
import com.example.be_hospital.dto.queue.*;
import com.example.be_hospital.entity.*;
import com.example.be_hospital.repository.*;
import com.example.be_hospital.service.QueueService;
import com.example.be_hospital.service.SseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
public class QueueServiceImpl implements QueueService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private ScheduleRepository scheduleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SseService sseService;

    // Các trạng thái tham gia hàng đợi (chưa khám xong, chưa hủy)
    private static final List<AppointmentStatus> QUEUE_STATUSES = Arrays.asList(
            AppointmentStatus.CONFIRMED,
            AppointmentStatus.WAITING,
            AppointmentStatus.IN_PROGRESS,
            AppointmentStatus.MISSED);

    // ============================================================
    // 1. BỆNH NHÂN XEM HÀNG ĐỢI
    // ============================================================
    @Override
    public PatientQueueResponse getPatientQueue(String phone) {
        PatientQueueResponse response = new PatientQueueResponse();

        // Bước 1: Tìm user theo phone
        User patient = userRepository.findByPhone(phone)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        // Bước 2: Tìm tất cả appointment hôm nay của BN
        List<Appointment> allAppointments = appointmentRepository
                .findByPatientIdOrderByCreatedAtDesc(patient.getId());

        LocalDate today = LocalDate.now();
        Appointment todayAppointment = null;

        for (Appointment app : allAppointments) {
            Schedule schedule = scheduleRepository.findById(app.getScheduleId()).orElse(null);
            if (schedule != null && schedule.getWorkDate().equals(today)
                    && QUEUE_STATUSES.contains(app.getStatus())) {
                todayAppointment = app;
                break;
            }
        }

        // Bước 3: Nếu không có lịch hôm nay → trả về hasAppointmentToday = false
        if (todayAppointment == null) {
            response.setHasAppointmentToday(false);
            return response;
        }

        // Bước 4: Có lịch → lấy thông tin schedule
        response.setHasAppointmentToday(true);
        response.setAppointmentId(todayAppointment.getId());

        Schedule schedule = scheduleRepository.findById(todayAppointment.getScheduleId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lịch khám"));

        response.setScheduleId(schedule.getId());
        response.setRoom(schedule.getRoom());
        response.setStartTime(schedule.getStartTime().toString().substring(0, 5));
        response.setEndTime(schedule.getEndTime().toString().substring(0, 5));

        // Tìm tên bác sĩ
        userRepository.findById(schedule.getDoctorId())
                .ifPresent(doc -> response.setDoctorName(doc.getFullName()));

        // Bước 5: Lấy toàn bộ hàng đợi trong cùng schedule
        List<Appointment> queue = appointmentRepository
                .findByScheduleIdAndStatusInOrderByQueueOrderAsc(
                        schedule.getId(), QUEUE_STATUSES);

        // Bước 6: Tính vị trí và gán displayStatus
        List<QueueItemDTO> queueList = new ArrayList<>();
        boolean hasInProgress = queue.stream()
                .anyMatch(a -> a.getStatus() == AppointmentStatus.IN_PROGRESS);

        int position = 0;
        for (int i = 0; i < queue.size(); i++) {
            Appointment app = queue.get(i);
            position++;

            QueueItemDTO item = new QueueItemDTO();
            item.setAppointmentId(app.getId());
            item.setQueuePosition(position);
            item.setStatus(app.getStatus().name());
            item.setDisplayStatus(getDisplayStatus(app.getStatus(), i, hasInProgress));

            queueList.add(item);

            // Nếu đây là BN hiện tại
            if (app.getId() == todayAppointment.getId()) {
                response.setMyPosition(position);
                response.setMyStatus(app.getStatus().name());
                response.setMyDisplayStatus(item.getDisplayStatus());
            }
        }

        response.setTotalInQueue(queueList.size());
        response.setQueueList(queueList);

        return response;
    }

    // ============================================================
    // 2. BÁC SĨ XEM HÀNG ĐỢI
    // ============================================================
    @Override
    public DoctorQueueResponse getDoctorQueue(String phone, int scheduleId) {
        DoctorQueueResponse response = new DoctorQueueResponse();

        // Validate: BS phải sở hữu schedule này
        User doctor = userRepository.findByPhone(phone)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bác sĩ"));

        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lịch khám"));

        if (schedule.getDoctorId() != doctor.getId()) {
            throw new RuntimeException("Bạn không có quyền xem hàng đợi này");
        }

        response.setScheduleId(scheduleId);
        response.setRoom(schedule.getRoom());
        response.setStartTime(schedule.getStartTime().toString().substring(0, 5));
        response.setEndTime(schedule.getEndTime().toString().substring(0, 5));

        // Lấy danh sách hàng đợi
        List<Appointment> queue = appointmentRepository
                .findByScheduleIdAndStatusInOrderByQueueOrderAsc(
                        scheduleId, QUEUE_STATUSES);

        boolean hasInProgress = queue.stream()
                .anyMatch(a -> a.getStatus() == AppointmentStatus.IN_PROGRESS);

        List<DoctorQueueResponse.DoctorQueueItemDTO> queueList = new ArrayList<>();
        int completedCount = 0;
        int waitingCount = 0;

        int position = 0;
        for (int i = 0; i < queue.size(); i++) {
            Appointment app = queue.get(i);
            position++;

            DoctorQueueResponse.DoctorQueueItemDTO item = new DoctorQueueResponse.DoctorQueueItemDTO();
            item.setAppointmentId(app.getId());
            item.setPatientId(app.getPatientId());
            item.setQueuePosition(position);
            item.setStatus(app.getStatus().name());
            item.setDisplayStatus(getDisplayStatus(app.getStatus(), i, hasInProgress));

            // Lấy tên bệnh nhân (BS được phép thấy)
            userRepository.findById(app.getPatientId())
                    .ifPresent(p -> item.setPatientName(p.getFullName()));

            queueList.add(item);

            // Đếm thống kê
            if (app.getStatus() == AppointmentStatus.IN_PROGRESS) {
                // không đếm vào waiting
            } else if (app.getStatus() == AppointmentStatus.MISSED) {
                // không đếm vào waiting
            } else {
                waitingCount++;
            }
        }

        // Đếm BN đã hoàn thành (COMPLETED) riêng
        List<Appointment> allInSchedule = appointmentRepository
                .findByScheduleIdAndStatusInOrderByQueueOrderAsc(
                        scheduleId, Arrays.asList(AppointmentStatus.COMPLETED));
        completedCount = allInSchedule.size();

        response.setTotalPatients(queueList.size() + completedCount);
        response.setCompletedCount(completedCount);
        response.setWaitingCount(waitingCount);
        response.setQueueList(queueList);

        return response;
    }

    // ============================================================
    // 3. BÁC SĨ BẮT ĐẦU KHÁM
    // ============================================================
    @Override
    @Transactional
    public ResponseObject startExamination(int appointmentId, String doctorPhone) {
        // Validate bác sĩ
        User doctor = userRepository.findByPhone(doctorPhone)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bác sĩ"));

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lịch hẹn"));

        Schedule schedule = scheduleRepository.findById(appointment.getScheduleId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lịch khám"));

        // Kiểm tra BS có sở hữu schedule không
        if (schedule.getDoctorId() != doctor.getId()) {
            return new ResponseObject(false, "Bạn không có quyền thao tác");
        }

        // Kiểm tra trạng thái hợp lệ (chỉ CONFIRMED hoặc WAITING mới bắt đầu khám được)
        if (appointment.getStatus() != AppointmentStatus.CONFIRMED
                && appointment.getStatus() != AppointmentStatus.WAITING) {
            return new ResponseObject(false, "Trạng thái bệnh nhân không hợp lệ để bắt đầu khám");
        }

        // Kiểm tra không có BN khác đang IN_PROGRESS trong cùng schedule
        List<Appointment> queue = appointmentRepository
                .findByScheduleIdAndStatusInOrderByQueueOrderAsc(
                        schedule.getId(), Arrays.asList(AppointmentStatus.IN_PROGRESS));
        if (!queue.isEmpty()) {
            return new ResponseObject(false,
                    "Đang có bệnh nhân khác trong phòng khám. Vui lòng kết thúc ca khám trước.");
        }

        // Chuyển trạng thái → IN_PROGRESS
        appointment.setStatus(AppointmentStatus.IN_PROGRESS);
        appointmentRepository.save(appointment);

        // Phát sự kiện SSE cập nhật hàng đợi thời gian thực
        sseService.broadcastQueueUpdate(schedule.getId());

        return new ResponseObject(true, "Đã bắt đầu khám bệnh nhân");
    }

    // ============================================================
    // 4. BÁC SĨ ĐÁNH DẤU VẮNG MẶT
    // ============================================================
    @Override
    @Transactional
    public ResponseObject markAbsent(int appointmentId, String doctorPhone) {
        User doctor = userRepository.findByPhone(doctorPhone)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bác sĩ"));

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lịch hẹn"));

        Schedule schedule = scheduleRepository.findById(appointment.getScheduleId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lịch khám"));

        if (schedule.getDoctorId() != doctor.getId()) {
            return new ResponseObject(false, "Bạn không có quyền thao tác");
        }

        if (appointment.getStatus() != AppointmentStatus.CONFIRMED
                && appointment.getStatus() != AppointmentStatus.WAITING) {
            return new ResponseObject(false, "Trạng thái không hợp lệ để đánh dấu vắng mặt");
        }

        // Chuyển status → MISSED
        appointment.setStatus(AppointmentStatus.MISSED);
        appointment.setAbsentAt(LocalDateTime.now());

        // Đẩy xuống cuối hàng đợi: queueOrder = max + 1
        int maxOrder = appointmentRepository.findMaxQueueOrderByScheduleId(schedule.getId());
        appointment.setQueueOrder(maxOrder + 1);

        appointmentRepository.save(appointment);

        // Phát sự kiện SSE cập nhật hàng đợi thời gian thực
        sseService.broadcastQueueUpdate(schedule.getId());

        return new ResponseObject(true, "Đã đánh dấu bệnh nhân vắng mặt và đưa xuống cuối hàng đợi");
    }

    // ============================================================
    // 5. BÁC SĨ GỌI LẠI BỆNH NHÂN VẮNG MẶT
    // ============================================================
    @Override
    @Transactional
    public ResponseObject recallPatient(int appointmentId, String doctorPhone) {
        User doctor = userRepository.findByPhone(doctorPhone)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bác sĩ"));

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lịch hẹn"));

        Schedule schedule = scheduleRepository.findById(appointment.getScheduleId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lịch khám"));

        if (schedule.getDoctorId() != doctor.getId()) {
            return new ResponseObject(false, "Bạn không có quyền thao tác");
        }

        // Chỉ BN đang MISSED mới được gọi lại
        if (appointment.getStatus() != AppointmentStatus.MISSED) {
            return new ResponseObject(false, "Chỉ có thể gọi lại bệnh nhân đang ở trạng thái vắng mặt");
        }

        // Kiểm tra quy tắc 30 phút vắng mặt
        if (appointment.getAbsentAt() != null && 
            Duration.between(appointment.getAbsentAt(), LocalDateTime.now()).toMinutes() > 30) {
            
            // Quá hạn 30 phút: Đẩy xuống cuối hàng đợi
            int maxOrder = appointmentRepository.findMaxQueueOrderByScheduleId(schedule.getId());
            appointment.setQueueOrder(maxOrder + 1);
            appointment.setStatus(AppointmentStatus.WAITING);
            appointment.setAbsentAt(null); // Reset thời gian vắng mặt
            appointmentRepository.save(appointment);

            // Phát sự kiện SSE cập nhật hàng đợi thời gian thực
            sseService.broadcastQueueUpdate(schedule.getId());

            return new ResponseObject(true, "Bệnh nhân vắng mặt quá 30 phút. Đã chuyển xuống cuối hàng đợi.");
        }

        // Trong thời hạn 30 phút: Chèn vào vị trí thứ 3 trong danh sách chờ
        List<Appointment> waitingQueue = appointmentRepository
                .findByScheduleIdAndStatusInOrderByQueueOrderAsc(
                        schedule.getId(),
                        Arrays.asList(AppointmentStatus.CONFIRMED, AppointmentStatus.WAITING));

        // Chèn sau 2 người: tìm queueOrder của người thứ 2 trong danh sách chờ
        int insertAfterOrder;
        if (waitingQueue.size() >= 2) {
            // Chèn sau người thứ 2
            insertAfterOrder = waitingQueue.get(1).getQueueOrder();
        } else if (waitingQueue.size() == 1) {
            // Chỉ còn 1 người → chèn sau người đó
            insertAfterOrder = waitingQueue.get(0).getQueueOrder();
        } else {
            // Không ai chờ → đưa lên đầu
            insertAfterOrder = 0;
        }

        // Đẩy tất cả BN có queueOrder > insertAfterOrder lên 1 bậc để tạo chỗ trống
        List<Appointment> allInQueue = appointmentRepository
                .findByScheduleIdAndStatusInOrderByQueueOrderAsc(
                        schedule.getId(), QUEUE_STATUSES);
        for (Appointment a : allInQueue) {
            if (a.getQueueOrder() != null && a.getQueueOrder() > insertAfterOrder
                    && a.getId() != appointment.getId()) {
                a.setQueueOrder(a.getQueueOrder() + 1);
                appointmentRepository.save(a);
            }
        }

        // Đặt BN vào vị trí mới
        appointment.setQueueOrder(insertAfterOrder + 1);
        appointment.setStatus(AppointmentStatus.WAITING);
        appointment.setAbsentAt(null); // Reset thời gian vắng mặt
        appointmentRepository.save(appointment);

        // Phát sự kiện SSE cập nhật hàng đợi thời gian thực
        sseService.broadcastQueueUpdate(schedule.getId());

        return new ResponseObject(true, "Đã gọi lại bệnh nhân vào hàng đợi (Ưu tiên vị trí thứ 3)");
    }

    // ============================================================
    // 6. BÁC SĨ HOÀN LẠI TRẠNG THÁI (QUAY LẠI)
    // ============================================================
    @Override
    @Transactional
    public ResponseObject revertExamination(int appointmentId, String doctorPhone) {
        User doctor = userRepository.findByPhone(doctorPhone)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bác sĩ"));

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lịch hẹn"));

        Schedule schedule = scheduleRepository.findById(appointment.getScheduleId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lịch khám"));

        if (schedule.getDoctorId() != doctor.getId()) {
            return new ResponseObject(false, "Bạn không có quyền thao tác");
        }

        // Chỉ có thể hoàn lại nếu đang IN_PROGRESS
        if (appointment.getStatus() != AppointmentStatus.IN_PROGRESS) {
            return new ResponseObject(false, "Chỉ có thể hoàn lại bệnh nhân đang khám");
        }

        appointment.setStatus(AppointmentStatus.WAITING);
        appointmentRepository.save(appointment);

        // Phát sự kiện SSE cập nhật hàng đợi thời gian thực
        sseService.broadcastQueueUpdate(schedule.getId());

        return new ResponseObject(true, "Đã hoàn lại trạng thái bệnh nhân vào hàng đợi");
    }

    // ============================================================
    // HELPER: Chuyển status → text hiển thị tiếng Việt
    // ============================================================
    private String getDisplayStatus(AppointmentStatus status, int indexInQueue, boolean hasInProgress) {
        switch (status) {
            case IN_PROGRESS:
                return "Đang khám";
            case MISSED:
                return "Vắng mặt";
            case CONFIRMED:
            case WAITING:
                // BN đầu tiên trong danh sách chờ (không phải MISSED/IN_PROGRESS) → "Chuẩn bị"
                if (!hasInProgress && indexInQueue == 0) {
                    return "Chuẩn bị";
                }
                if (hasInProgress && indexInQueue == 0) {
                    // Có người đang khám, BN này vẫn đứng đầu queue → "Chuẩn bị"
                    return "Chuẩn bị";
                }
                // Tìm xem BN này có phải là BN WAITING/CONFIRMED đầu tiên không
                return "Chờ khám";
            default:
                return status.name();
        }
    }
}
