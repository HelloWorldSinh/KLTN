package com.example.be_hospital.controller;

import com.example.be_hospital.dto.appointment.AppointmentCreateRequest;
import com.example.be_hospital.dto.appointment.AppointmentDTO;
import com.example.be_hospital.dto.appointment.DoctorAppointmentDTO;
import com.example.be_hospital.dto.ResponseObject;
import com.example.be_hospital.service.AppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR')")
@RequestMapping("/appointments")
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    @PostMapping("/book")
    public ResponseEntity<ResponseObject> bookAppointment(@RequestBody AppointmentCreateRequest request,
            Principal principal) {
        ResponseObject result = appointmentService.bookAppointment(principal.getName(), request);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/patient")
    public ResponseEntity<List<AppointmentDTO>> getPatientAppointments(Principal principal) {
        List<AppointmentDTO> list = appointmentService.getPatientAppointments(principal.getName());
        return ResponseEntity.ok(list);
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ResponseObject> cancelAppointment(
            @PathVariable int id, 
            @RequestParam(required = false) String reason,
            Principal principal) {
        ResponseObject result = appointmentService.cancelAppointment(id, principal.getName(), reason);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/doctor")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<List<DoctorAppointmentDTO>> getDoctorAppointments(Principal principal) {
        List<DoctorAppointmentDTO> list = appointmentService.getDoctorAppointments(principal.getName());
        return ResponseEntity.ok(list);
    }
}
