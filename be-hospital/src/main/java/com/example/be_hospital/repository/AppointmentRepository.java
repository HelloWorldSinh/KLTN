package com.example.be_hospital.repository;

import com.example.be_hospital.entity.Appointment;
import com.example.be_hospital.entity.AppointmentStatus;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Integer> {
        @Query("SELECT a FROM Appointment a INNER JOIN Schedule s ON a.scheduleId = s.id " +
               "WHERE (s.workDate < :currentDate OR (s.workDate = :currentDate AND s.endTime < :currentTime)) " +
               "AND a.status IN :activeStatuses")
        List<Appointment> findExpiredAppointments(
                @Param("currentDate") LocalDate currentDate,
                @Param("currentTime") LocalTime currentTime,
                @Param("activeStatuses") List<AppointmentStatus> activeStatuses);

        int countByScheduleId(int scheduleId);

        List<Appointment> findByScheduleId(int scheduleId);

        int countByScheduleIdAndStatusNot(int scheduleId, AppointmentStatus status);

        List<Appointment> findByPatientIdOrderByCreatedAtDesc(int patientId);

        @Query("SELECT a FROM Appointment a INNER JOIN Schedule s ON a.scheduleId = s.id WHERE s.doctorId = :doctorId ORDER BY s.workDate DESC, a.createdAt ASC")
        List<Appointment> findAppointmentsByDoctorId(
                        @org.springframework.data.repository.query.Param("doctorId") int doctorId);

        // === QUEUE: Lấy danh sách hàng đợi theo schedule, lọc theo status, sắp theo
        // queueOrder ===
        List<Appointment> findByScheduleIdAndStatusInOrderByQueueOrderAsc(
                        int scheduleId, List<AppointmentStatus> statuses);

        // === QUEUE: Tìm queueOrder lớn nhất trong 1 schedule (dùng khi đẩy BN xuống
        // cuối) ===
        @Query("SELECT COALESCE(MAX(a.queueOrder), 0) FROM Appointment a WHERE a.scheduleId = :scheduleId")
        int findMaxQueueOrderByScheduleId(
                        @org.springframework.data.repository.query.Param("scheduleId") int scheduleId);

        @Query("SELECT a.status, COUNT(a) FROM Appointment a GROUP BY a.status")
        List<Object[]> countAppointmentsByStatus();

        List<Appointment> findTop10ByOrderByCreatedAtDesc();
}