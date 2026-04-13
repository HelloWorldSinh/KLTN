package com.example.be_hospital.service;

import com.example.be_hospital.dto.appointment.AppointmentCreateRequest;
import com.example.be_hospital.dto.appointment.AppointmentDTO;
import com.example.be_hospital.dto.ResponseObject;

import java.util.List;

public interface AppointmentService {
    ResponseObject bookAppointment(String phone, AppointmentCreateRequest request);
    List<AppointmentDTO> getPatientAppointments(String phone);
    ResponseObject cancelAppointment(int appointmentId, String phone, String reason);
    List<com.example.be_hospital.dto.appointment.DoctorAppointmentDTO> getDoctorAppointments(String phone);
}
