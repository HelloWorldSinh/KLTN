package com.example.be_hospital.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "schedule")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Schedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "doctor_id", nullable = false)
    private int doctorId;

    @Column(name = "work_date")
    private LocalDate workDate;

    @Column(name = "start_time")
    private LocalTime startTime;

    @Column(name = "end_time")
    private  LocalTime endTime;

    private int slot;
    private String room;

    @Column(name = "status", nullable = false)
    private String status = "ACTIVE";

    @Column(name = "cancel_reason")
    private String cancelReason;
}
