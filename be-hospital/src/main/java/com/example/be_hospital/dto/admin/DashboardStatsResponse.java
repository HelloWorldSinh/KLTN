package com.example.be_hospital.dto.admin;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class DashboardStatsResponse {
    private long totalPatients;
    private long totalDoctors;
    private long totalStaff;
    private long totalSpecialties;
    private long totalMedicines;
    private long totalAppointments;
    private long pendingCancelSchedules;
    private Map<String, Long> statusCounts;
    private List<RecentAppointmentDTO> recentAppointments;
}
