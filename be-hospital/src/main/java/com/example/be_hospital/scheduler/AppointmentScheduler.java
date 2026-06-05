package com.example.be_hospital.scheduler;

import com.example.be_hospital.entity.Appointment;
import com.example.be_hospital.entity.AppointmentStatus;
import com.example.be_hospital.entity.Notification;
import com.example.be_hospital.entity.Schedule;
import com.example.be_hospital.repository.AppointmentRepository;
import com.example.be_hospital.repository.ScheduleRepository;
import com.example.be_hospital.repository.NotificationRepository;
import com.example.be_hospital.service.SseService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;

@Component
public class AppointmentScheduler {
    private static final Logger log = LoggerFactory.getLogger(AppointmentScheduler.class);

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private ScheduleRepository scheduleRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private SseService sseService;

    private static final List<AppointmentStatus> ACTIVE_STATUSES = Arrays.asList(
            AppointmentStatus.PENDING,
            AppointmentStatus.CONFIRMED,
            AppointmentStatus.WAITING,
            AppointmentStatus.IN_PROGRESS,
            AppointmentStatus.MISSED
    );

    // Chạy định kỳ lúc 12:00 và 20:00 hàng ngày
    @Scheduled(cron = "0 0 12,20 * * ?")
    @Transactional
    public void cancelExpiredAppointmentsScheduled() {
        log.info("Scheduled task triggered: Checking for expired appointments (12h/20h daily)...");
        executeCancellation();
    }

    // Tự động chạy khi khởi động server thành công
    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void onApplicationReady() {
        log.info("Application started: Checking for missed expired appointments during downtime...");
        executeCancellation();
    }

    private void executeCancellation() {
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        List<Appointment> expiredAppointments = appointmentRepository.findExpiredAppointments(
                today, now, ACTIVE_STATUSES
        );

        if (expiredAppointments.isEmpty()) {
            log.info("No expired appointments found.");
            return;
        }

        log.info("Found {} expired appointments. Updating status to NO_SHOW...", expiredAppointments.size());

        for (Appointment appointment : expiredAppointments) {
            appointment.setStatus(AppointmentStatus.NO_SHOW);
            appointment.setCancelReason("Hệ thống tự động hủy do bệnh nhân không đến khám đúng ca hẹn");
            appointmentRepository.save(appointment);
            log.info("Updated appointment ID {} (Patient ID {}) to NO_SHOW", appointment.getId(), appointment.getPatientId());

            // Tạo thông báo cho bệnh nhân
            scheduleRepository.findById(appointment.getScheduleId()).ifPresent(schedule -> {
                Notification notification = new Notification();
                notification.setUserId(appointment.getPatientId());
                notification.setTitle("Lịch hẹn khám bệnh bị hủy tự động");
                notification.setContent("Lịch hẹn của bạn vào ca " + schedule.getStartTime().toString().substring(0, 5) + 
                    " - " + schedule.getEndTime().toString().substring(0, 5) + " ngày " + schedule.getWorkDate() +
                    " tại phòng " + schedule.getRoom() + " đã bị hệ thống tự động hủy do bạn không đến khám đúng hẹn.");
                notification.setRead(false);
                notificationRepository.save(notification);

                // Gửi thông báo real-time qua SSE đến bệnh nhân
                try {
                    sseService.sendNotification(
                        appointment.getPatientId(),
                        notification.getTitle(),
                        notification.getContent()
                    );
                } catch (Exception e) {
                    log.error("Failed to send SSE notification to patient ID {}: {}", appointment.getPatientId(), e.getMessage());
                }
            });
        }

        log.info("Successfully cancelled expired appointments and notified patients.");
    }
}
