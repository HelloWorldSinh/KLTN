import api from './api';

export interface AppointmentDTO {
  id: number;
  scheduleId: number;
  doctorId: number;
  doctorName: string;
  specialtyName?: string;
  workDate: string;
  startTime: string;
  endTime: string;
  room: string;
  status: 'PENDING' | 'CONFIRMED' | 'WAITING' | 'IN_PROGRESS' | 'COMPLETED' | 'MISSED' | 'NO_SHOW' | 'CANCELLED' | 'SYSTEM_CANCELLED';
  cancelReason?: string;
  createdAt: string;
  queueOrder?: number;
}

export interface DoctorAppointmentDTO {
  appointmentId: number;
  patientId: number;
  patientName: string;
  patientGender: string;
  patientDob: string;
  patientPhone: string;
  patientAddress: string;
  workDate: string;
  startTime: string;
  endTime: string;
  room: string;
  status: 'PENDING' | 'CONFIRMED' | 'WAITING' | 'IN_PROGRESS' | 'COMPLETED' | 'MISSED' | 'NO_SHOW' | 'CANCELLED' | 'SYSTEM_CANCELLED';
  cancelReason?: string;
  createdAt: string;
  queueOrder?: number;
}

export interface AppointmentCreateRequest {
  scheduleId: number;
}

export const appointmentService = {
  bookAppointment: async (request: AppointmentCreateRequest) => {
    const response = await api.post('/appointments/book', request);
    return response.data;
  },

  getPatientAppointments: async (): Promise<AppointmentDTO[]> => {
    const response = await api.get('/appointments/patient');
    return response.data;
  },

  cancelAppointment: async (id: number, reason?: string) => {
    const response = await api.put(`/appointments/${id}/cancel`, null, { params: { reason } });
    return response.data;
  },

  getDoctorAppointments: async (): Promise<DoctorAppointmentDTO[]> => {
    const response = await api.get('/appointments/doctor');
    return response.data;
  }
};
