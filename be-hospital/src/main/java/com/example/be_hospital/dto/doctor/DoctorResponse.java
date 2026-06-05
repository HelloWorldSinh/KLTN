package com.example.be_hospital.dto.doctor;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DoctorResponse {
    private int id;
    private String fullName;
    private String phone;
    private String email;
    private LocalDate dob;
    private String gender;
    private String address;
    private Integer specialtyId;
    private String specialtyName;
    private String degree;
    private LocalDate startWorkingDate;
}
