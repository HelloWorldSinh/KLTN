package com.example.be_hospital.service;

import com.example.be_hospital.dto.ResponseObject;
import com.example.be_hospital.dto.schedule.ScheduleCreateRequest;
import com.example.be_hospital.dto.schedule.ScheduleDTO;

import java.time.LocalDate;
import java.util.List;

public interface ScheduleService {
    List<ScheduleDTO> getAllSchedules();

    ResponseObject createSchedules(ScheduleCreateRequest request);

    ResponseObject updateSchedule(int id, ScheduleDTO dto);

    ResponseObject deleteSchedule(int id);

    List<ScheduleDTO> getSchedulesByDoctor(int doctorId);

    List<ScheduleDTO> getAvailableSchedules(Integer specialtyId, Integer doctorId, LocalDate date);
}
