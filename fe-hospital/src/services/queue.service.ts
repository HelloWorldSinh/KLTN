import api from './api';

export interface QueueItemDTO {
  appointmentId: number;
  queuePosition: number;
  status: string;
  displayStatus: string;
  queueOrder?: number;
}

export interface PatientQueueResponse {
  hasAppointmentToday: boolean;
  myPosition: number;
  totalInQueue: number;
  myStatus: string;
  myDisplayStatus: string;
  appointmentId: number;
  scheduleId: number;
  doctorName: string;
  room: string;
  startTime: string;
  endTime: string;
  queueList: QueueItemDTO[];
  myQueueOrder?: number;
}

export interface DoctorQueueItemDTO extends QueueItemDTO {
  patientId: number;
  patientName: string;
  absentAt?: string; // Thời gian bắt đầu vắng mặt
}

export interface DoctorQueueResponse {
  scheduleId: number;
  room: string;
  startTime: string;
  endTime: string;
  totalPatients: number;
  completedCount: number;
  waitingCount: number;
  queueList: DoctorQueueItemDTO[];
}

export interface ScheduleSummary {
  id: number;
  room: string;
  startTime: string;
  endTime: string;
}

export interface ScheduleDTO {
  id: number;
  doctorId: number;
  doctorName: string;
  workDate: string;
  startTime: string;
  endTime: string;
  slot: number;
  room: string;
  appointmentCount: number;
  status: string;
}

export const queueService = {
  // Điều dưỡng lấy danh sách schedule hôm nay
  getTodaySchedulesForStaff: async (): Promise<ScheduleDTO[]> => {
    const response = await api.get('/schedules/today');
    return response.data;
  },

  // Bác sĩ lấy danh sách schedule hôm nay
  getTodaySchedules: async (): Promise<ScheduleSummary[]> => {
    const response = await api.get('/queue/doctor/schedules/today');
    return response.data;
  },

  // Bệnh nhân xem hàng đợi của mình
  getPatientQueue: async (): Promise<PatientQueueResponse> => {
    const response = await api.get('/queue/patient');
    return response.data;
  },

  // Bác sĩ xem hàng đợi của một ca khám
  getDoctorQueue: async (scheduleId: number): Promise<DoctorQueueResponse> => {
    const response = await api.get(`/queue/doctor/${scheduleId}`);
    return response.data;
  },

  // Bác sĩ bắt đầu khám
  startExamination: async (appointmentId: number) => {
    const response = await api.put(`/queue/${appointmentId}/start`);
    return response.data;
  },

  // Bác sĩ đánh dấu vắng mặt
  markAbsent: async (appointmentId: number) => {
    const response = await api.put(`/queue/${appointmentId}/absent`);
    return response.data;
  },

  // Bác sĩ gọi lại bệnh nhân vắng mặt
  recallPatient: async (appointmentId: number) => {
    const response = await api.put(`/queue/${appointmentId}/recall`);
    return response.data;
  },

  // Bác sĩ hoàn lại trạng thái (từ Đang khám về Chờ khám)
  revertExamination: async (appointmentId: number) => {
    const response = await api.put(`/queue/${appointmentId}/revert`);
    return response.data;
  }
};
