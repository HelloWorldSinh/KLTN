package com.example.be_hospital.chatbot.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public record ScheduleToolDto(
        int doctorId,
        String doctorName,
        LocalDate date,
        LocalTime startTime,
        LocalTime endTime,
        String room,
        int remainingSlots) {
}
