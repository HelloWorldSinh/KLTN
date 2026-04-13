package com.example.be_hospital.controller;

import com.example.be_hospital.dto.ResponseObject;
import com.example.be_hospital.dto.schedule.ScheduleCreateRequest;
import com.example.be_hospital.dto.schedule.ScheduleDTO;
import com.example.be_hospital.service.ScheduleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.format.annotation.DateTimeFormat.ISO;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/schedules")
public class ScheduleController {

    @Autowired
    private ScheduleService scheduleService;

    @GetMapping("")
    public ResponseEntity<List<ScheduleDTO>> getAllSchedules() {
        return ResponseEntity.ok(scheduleService.getAllSchedules());
    }

    @PostMapping("")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResponseObject> createSchedules(@RequestBody ScheduleCreateRequest request) {
        ResponseObject response = scheduleService.createSchedules(request);
        if (response.isStatus()) {
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.badRequest().body(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResponseObject> updateSchedule(@PathVariable int id, @RequestBody ScheduleDTO dto) {
        ResponseObject response = scheduleService.updateSchedule(id, dto);
        if (response.isStatus()) {
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.badRequest().body(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResponseObject> deleteSchedule(@PathVariable int id) {
        ResponseObject response = scheduleService.deleteSchedule(id);
        if (response.isStatus()) {
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.badRequest().body(response);
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<ScheduleDTO>> getSchedulesByDoctor(@PathVariable int doctorId) {
        return ResponseEntity.ok(scheduleService.getSchedulesByDoctor(doctorId));
    }

    @GetMapping("/available")
    public ResponseEntity<List<ScheduleDTO>> getAvailableSchedules(
            @RequestParam(required = false) Integer specialtyId,
            @RequestParam(required = false) Integer doctorId,
            @RequestParam(required = false) @DateTimeFormat(iso = ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(scheduleService.getAvailableSchedules(specialtyId, doctorId, date));
    }
}
