package com.example.be_hospital.repository;

import com.example.be_hospital.entity.Appointment;
import com.example.be_hospital.entity.AppointmentStatus;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Integer> {
    int countByScheduleId(int scheduleId);

    int countByScheduleIdAndStatusNot(int scheduleId, AppointmentStatus status);

    List<Appointment> findByPatientIdOrderByCreatedAtDesc(int patientId);

    @Query("SELECT a FROM Appointment a INNER JOIN Schedule s ON a.scheduleId = s.id WHERE s.doctorId = :doctorId ORDER BY s.workDate DESC, s.startTime ASC")
    List<Appointment> findAppointmentsByDoctorId(
            @org.springframework.data.repository.query.Param("doctorId") int doctorId);
}
