import api from './api';

export interface DoctorResponse {
  id: number;
  fullName: string;
  phone: string;
  email: string;
  dob: string;
  gender: string;
  address: string;
  specialtyId?: number;
  specialtyName?: string;
  degree?: string;
  startWorkingDate?: string;
}

export const doctorService = {
  getAllDoctors: async () => {
    const response = await api.get<DoctorResponse[]>('/doctors');
    return response.data;
  },

  getDoctorById: async (id: number) => {
    const response = await api.get<DoctorResponse>(`/doctors/${id}`);
    return response.data;
  }
};
