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
  }
};
