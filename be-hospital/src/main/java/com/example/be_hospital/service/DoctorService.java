package com.example.be_hospital.service;

import com.example.be_hospital.dto.doctor.DoctorResponse;
import java.util.List;

public interface DoctorService {
    List<DoctorResponse> getAllDoctors();
    DoctorResponse getDoctorById(int id);
}
