package com.example.be_hospital.service.impl;

import com.example.be_hospital.dto.medicine.MedicineDTO;
import com.example.be_hospital.dto.ResponseObject;
import com.example.be_hospital.entity.Medicine;
import com.example.be_hospital.repository.MedicineRepository;
import com.example.be_hospital.service.MedicineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class MedicineServiceImpl implements MedicineService {

    @Autowired
    private MedicineRepository medicineRepository;

    @Override
    public List<MedicineDTO> getAllMedicines() {
        List<Medicine> medicines = medicineRepository.findAll();
        return medicines.stream().map(m -> new MedicineDTO(m.getId(), m.getName(), m.getUnit(), m.isActive()))
                .collect(Collectors.toList());
    }

    @Override
    public MedicineDTO getMedicineById(int id) {
        Optional<Medicine> medicine = medicineRepository.findById(id);
        return medicine.map(m -> new MedicineDTO(m.getId(), m.getName(), m.getUnit(), m.isActive())).orElse(null);
    }

    @Override
    public ResponseObject createMedicine(MedicineDTO dto) {
        if (medicineRepository.existsByName(dto.getName())) {
            return new ResponseObject(false, "Lỗi: Tên thuốc đã tồn tại");
        }
        Medicine medicine = new Medicine();
        medicine.setName(dto.getName());
        medicine.setUnit(dto.getUnit());
        medicine.setActive(true);
        medicineRepository.save(medicine);
        return new ResponseObject(true, "Thêm thuốc mới thành công");
    }

    @Override
    public ResponseObject updateMedicine(int id, MedicineDTO dto) {
        Optional<Medicine> existing = medicineRepository.findById(id);
        if (existing.isEmpty()) {
            return new ResponseObject(false, "Lỗi: Thuốc không tồn tại");
        }
        Medicine medicine = existing.get();
        medicine.setName(dto.getName());
        medicine.setUnit(dto.getUnit());
        medicine.setActive(dto.isActive());
        medicineRepository.save(medicine);
        return new ResponseObject(true, "Cập nhật thông tin thuốc thành công");
    }

    @Override
    public ResponseObject deleteMedicine(int id) {
        Optional<Medicine> existing = medicineRepository.findById(id);
        if (existing.isEmpty()) {
            return new ResponseObject(false, "Lỗi: Thuốc không tồn tại");
        }
        Medicine medicine = existing.get();
        medicine.setActive(false); // Chuyển trạng thái sang false (xóa mềm)
        medicineRepository.save(medicine);
        return new ResponseObject(true, "Xóa thuốc thành công (Đã chuyển sang ngừng hoạt động)");
    }
}
