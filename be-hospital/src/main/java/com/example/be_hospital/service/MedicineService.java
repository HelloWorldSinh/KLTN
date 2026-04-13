package com.example.be_hospital.service;

import com.example.be_hospital.dto.medicine.MedicineDTO;
import com.example.be_hospital.dto.ResponseObject;

import java.util.List;

public interface MedicineService {
    List<MedicineDTO> getAllMedicines();
    MedicineDTO getMedicineById(int id);
    ResponseObject createMedicine(MedicineDTO dto);
    ResponseObject updateMedicine(int id, MedicineDTO dto);
    ResponseObject deleteMedicine(int id);
}
