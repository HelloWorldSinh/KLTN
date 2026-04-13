package com.example.be_hospital.service;

import com.example.be_hospital.dto.ResponseObject;
import com.example.be_hospital.dto.specialty.SpecialtyDTO;

import java.util.List;

public interface SpecialtyService {
    List<SpecialtyDTO> getAllSpecialties();
    SpecialtyDTO getSpecialtyById(int id);
    ResponseObject createSpecialty(SpecialtyDTO dto);
    ResponseObject updateSpecialty(int id, SpecialtyDTO dto);
    ResponseObject deleteSpecialty(int id);
}
