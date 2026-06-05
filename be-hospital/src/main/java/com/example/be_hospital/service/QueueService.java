package com.example.be_hospital.service;

import com.example.be_hospital.dto.ResponseObject;
import com.example.be_hospital.dto.queue.DoctorQueueResponse;
import com.example.be_hospital.dto.queue.PatientQueueResponse;

public interface QueueService {

    // Bệnh nhân xem hàng đợi hôm nay
    PatientQueueResponse getPatientQueue(String phone);

    // Bác sĩ xem hàng đợi theo scheduleId
    DoctorQueueResponse getDoctorQueue(String phone, int scheduleId);

    // Bác sĩ bắt đầu khám 1 BN (chuyển status → IN_PROGRESS)
    ResponseObject startExamination(int appointmentId, String doctorPhone);

    // Bác sĩ đánh dấu BN vắng mặt (chuyển status → MISSED, xuống cuối)
    ResponseObject markAbsent(int appointmentId, String doctorPhone);

    // Bác sĩ gọi lại BN vắng mặt (chèn lại queue sau 2 người)
    ResponseObject recallPatient(int appointmentId, String doctorPhone);

    // Bác sĩ hoàn lại trạng thái BN đang khám (chuyển status → WAITING)
    ResponseObject revertExamination(int appointmentId, String doctorPhone);
}
