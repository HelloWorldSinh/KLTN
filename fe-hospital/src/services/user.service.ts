import api from './api';

export interface UserProfile {
  id: number;
  phone: string;
  role: string;
  fullName: string;
  email: string;
  dob: string;
  gender: string;
  address: string;
  specialtyId?: number;
  degree?: string;
  startWorkingDate?: string;
}

export interface UserProfileRequest {
  fullName: string;
  email: string;
  dob: string;
  gender: string;
  address: string;
  specialtyId?: number;
  degree?: string;
  startWorkingDate?: string;
}

export const userService = {
  getProfile: async () => {
    const response = await api.get<UserProfile>('/profile');
    return response.data;
  },

  updateProfile: async (data: UserProfileRequest) => {
    const response = await api.put<UserProfile>('/profile', data);
    return response.data;
  },
};
