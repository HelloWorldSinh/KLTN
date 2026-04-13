package com.example.be_hospital.controller;

import com.example.be_hospital.dto.ResponseObject;
import com.example.be_hospital.dto.specialty.SpecialtyDTO;
import com.example.be_hospital.service.SpecialtyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/specialties")
public class SpecialtyController {

    @Autowired
    private SpecialtyService specialtyService;

    @GetMapping("")
    public ResponseEntity<List<SpecialtyDTO>> getAllSpecialties() {
        return ResponseEntity.ok(specialtyService.getAllSpecialties());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getSpecialtyById(@PathVariable int id) {
        SpecialtyDTO dto = specialtyService.getSpecialtyById(id);
        if (dto != null) {
            return ResponseEntity.ok(dto);
        }
        return ResponseEntity.badRequest().body(new ResponseObject(false, "Lỗi: Không tìm thấy chuyên khoa"));
    }

    @PostMapping("")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResponseObject> createSpecialty(@RequestBody SpecialtyDTO dto) {
        ResponseObject response = specialtyService.createSpecialty(dto);
        if (!response.isStatus()) {
            return ResponseEntity.badRequest().body(response);
        }
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResponseObject> updateSpecialty(@PathVariable int id, @RequestBody SpecialtyDTO dto) {
        ResponseObject response = specialtyService.updateSpecialty(id, dto);
        if (!response.isStatus()) {
            return ResponseEntity.badRequest().body(response);
        }
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResponseObject> deleteSpecialty(@PathVariable int id) {
        ResponseObject response = specialtyService.deleteSpecialty(id);
        if (!response.isStatus()) {
            return ResponseEntity.badRequest().body(response);
        }
        return ResponseEntity.ok(response);
    }
}
