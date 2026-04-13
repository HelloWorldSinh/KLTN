package com.example.be_hospital.service.impl;

import com.example.be_hospital.dto.ResponseObject;
import com.example.be_hospital.dto.specialty.SpecialtyDTO;
import com.example.be_hospital.entity.Specialty;
import com.example.be_hospital.repository.SpecialtyRepository;
import com.example.be_hospital.service.SpecialtyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class SpecialtyServiceImpl implements SpecialtyService {

    @Autowired
    private SpecialtyRepository specialtyRepository;

    @Override
    public List<SpecialtyDTO> getAllSpecialties() {
        List<Specialty> specialties = specialtyRepository.findAll();
        return specialties.stream().map(s -> new SpecialtyDTO(s.getId(), s.getName(), s.getDescription()))
                .collect(Collectors.toList());
    }

    @Override
    public SpecialtyDTO getSpecialtyById(int id) {
        Optional<Specialty> specialty = specialtyRepository.findById(id);
        return specialty.map(s -> new SpecialtyDTO(s.getId(), s.getName(), s.getDescription())).orElse(null);
    }

    @Override
    public ResponseObject createSpecialty(SpecialtyDTO dto) {
        if (specialtyRepository.existsByName(dto.getName())) {
            return new ResponseObject(false, "Lỗi: Tên chuyên khoa đã tồn tại");
        }
        Specialty specialty = new Specialty();
        specialty.setName(dto.getName());
        specialty.setDescription(dto.getDescription());
        specialtyRepository.save(specialty);
        return new ResponseObject(true, "Thêm chuyên khoa mới thành công");
    }

    @Override
    public ResponseObject updateSpecialty(int id, SpecialtyDTO dto) {
        Optional<Specialty> existing = specialtyRepository.findById(id);
        if (existing.isEmpty()) {
            return new ResponseObject(false, "Lỗi: Chuyên khoa không tồn tại");
        }
        Specialty s = existing.get();
        s.setName(dto.getName());
        s.setDescription(dto.getDescription());
        specialtyRepository.save(s);
        return new ResponseObject(true, "Cập nhật chuyên khoa thành công");
    }

    @Override
    public ResponseObject deleteSpecialty(int id) {
        if (!specialtyRepository.existsById(id)) {
            return new ResponseObject(false, "Lỗi: Chuyên khoa không tồn tại");
        }
        specialtyRepository.deleteById(id);
        return new ResponseObject(true, "Xóa chuyên khoa thành công");
    }
}
