import api from './api';

export interface AccountResponse {
  id: number;
  fullName: string;
  phone: string;
  role: string;
  specialtyId?: number;
  degree?: string;
  startWorkingDate?: string;
}

export interface AccountRequest {
  fullName: string;
  phone: string;
  password?: string;
  role: string;
  specialtyId?: number;
  degree?: string;
  startWorkingDate?: string;
}

export interface RecentAppointmentDTO {
  id: number;
  patientName: string;
  patientPhone: string;
  doctorName: string;
  specialtyName: string;
  workDate: string;
  timeSlot: string;
  status: string;
  createdAt: string;
}

export interface DashboardStatsResponse {
  totalPatients: number;
  totalDoctors: number;
  totalStaff: number;
  totalSpecialties: number;
  totalMedicines: number;
  totalAppointments: number;
  pendingCancelSchedules: number;
  statusCounts: Record<string, number>;
  recentAppointments: RecentAppointmentDTO[];
}

export const adminService = {
  getAllAccounts: async () => {
    const response = await api.get<AccountResponse[]>('/admin/accounts');
    return response.data;
  },

  createAccount: async (data: AccountRequest) => {
    const response = await api.post('/admin/create', data);
    return response.data;
  },

  updateAccount: async (id: number, data: AccountRequest) => {
    const response = await api.put(`/admin/update/${id}`, data);
    return response.data;
  },

  deleteAccount: async (id: number) => {
    const response = await api.delete(`/admin/delete/${id}`);
    return response.data;
  },

  getDashboardStats: async () => {
    const response = await api.get<DashboardStatsResponse>('/admin/dashboard-stats');
    return response.data;
  }
};
