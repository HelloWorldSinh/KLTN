import api from './api';

export interface LoginRequest {
  phone: string;
  password: string;
}

export interface JwtResponse {
  token: string;
  type: string;
  phone: string;
  role: string;
  fullName: string;
}

export interface SignupRequest {
  fullName: string;
  phone: string;
  dob: string;
  gender: string;
  email: string;
  password: string;
  address: string;
}

export const authService = {
  login: async (loginData: LoginRequest): Promise<JwtResponse> => {
    const response = await api.post<JwtResponse>('/login', loginData);
    return response.data;
  },

  register: async (signupData: SignupRequest) => {
    const response = await api.post('/register', signupData);
    return response.data;
  },
};
