import api from './api';

export interface ScheduleDTO {
  id?: number;
  doctorId: number;
  doctorName?: string;
  workDate: string;
  startTime: string;
  endTime: string;
  slot: number;
  room: string;
  appointmentCount?: number;
  status?: string;
  cancelReason?: string;
}

export interface ScheduleCreateRequest {
  doctorId: number;
  startDate: string;
  endDate?: string;
  daysOfWeek?: number[];
  startTime: string;
  endTime: string;
  slot: number;
  room: string;
  recurring: boolean;
}

export interface ResponseObject {
  status: boolean;
  message: string;
}

export const scheduleService = {
  getAllSchedules: async () => {
    const response = await api.get<ScheduleDTO[]>('/schedules');
    return response.data;
  },

  createSchedules: async (data: ScheduleCreateRequest) => {
    const response = await api.post<ResponseObject>('/schedules', data);
    return response.data;
  },

  updateSchedule: async (id: number, data: ScheduleDTO) => {
    console.log(data);
    const response = await api.put<ResponseObject>(`/schedules/${id}`, data);
    return response.data;
  },

  deleteSchedule: async (id: number) => {
    const response = await api.delete<ResponseObject>(`/schedules/${id}`);
    return response.data;
  },

  getAvailableSchedules: async (params?: { specialtyId?: number, doctorId?: number, date?: string }): Promise<ScheduleDTO[]> => {
    const response = await api.get('/schedules/available', { params });
    return response.data;
  },

  getSchedulesByDoctor: async (doctorId: number) => {
    const response = await api.get<ScheduleDTO[]>(`/schedules/doctor/${doctorId}`);
    return response.data;
  },

  requestCancelSchedule: async (id: number, reason: string) => {
    const response = await api.post<ResponseObject>(`/schedules/${id}/cancel-request`, { reason });
    return response.data;
  },

  approveCancelSchedule: async (id: number) => {
    const response = await api.post<ResponseObject>(`/schedules/${id}/approve-cancel`);
    return response.data;
  },

  rejectCancelSchedule: async (id: number, reason: string) => {
    const response = await api.post<ResponseObject>(`/schedules/${id}/reject-cancel`, { reason });
    return response.data;
  }
};
