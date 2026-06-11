package com.example.be_hospital.repository;

import com.example.be_hospital.entity.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, Integer> {
    List<Schedule> findAllByOrderByWorkDateDesc();
    
    @Query("SELECT s FROM Schedule s WHERE s.doctorId = :doctorId AND s.workDate = :workDate " +
           "AND ((s.startTime < :endTime AND s.endTime > :startTime))")
    List<Schedule> findOverlappingSchedules(
            @Param("doctorId") int doctorId, 
            @Param("workDate") LocalDate workDate, 
            @Param("startTime") LocalTime startTime, 
            @Param("endTime") LocalTime endTime);

    List<Schedule> findByDoctorId(int doctorId);

    // === QUEUE: Tìm tất cả schedule của bác sĩ trong ngày cụ thể ===
    List<Schedule> findByDoctorIdAndWorkDate(int doctorId, LocalDate workDate);
    List<Schedule> findByWorkDate(LocalDate workDate);
    long countByStatus(String status);
}
