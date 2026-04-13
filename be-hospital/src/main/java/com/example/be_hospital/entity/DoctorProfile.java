package com.example.be_hospital.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "doctor_profile")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DoctorProfile {

    @Id
    @Column(name = "user_id")
    private int userId;

    @Column(name = "specialty_id")
    private int specialtyId;

    private String degree;

    @Column(name = "start_working_date")
    private LocalDate startWorkingDate;
}
