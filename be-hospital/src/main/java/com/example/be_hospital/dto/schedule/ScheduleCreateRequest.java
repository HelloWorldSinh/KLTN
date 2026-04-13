package com.example.be_hospital.dto.schedule;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleCreateRequest {
    private int doctorId;
    private LocalDate startDate;
    private LocalDate endDate;
    private List<Integer> daysOfWeek; // 1=Monday, 7=Sunday
    private LocalTime startTime;
    private LocalTime endTime;
    private int slot;
    private String room;
    private boolean recurring;
}
