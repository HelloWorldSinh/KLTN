import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authService, type LoginRequest } from '../services/auth.service';

export type Role = 'ADMIN' | 'STAFF' | 'DOCTOR' | 'PATIENT' | null;

interface AuthState {
  user: { name: string; role: Role; phone: string } | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (loginData: LoginRequest) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: async (loginData) => {
        try {
          const data = await authService.login(loginData);
          set({
            user: {
              name: data.fullName,
              role: data.role as Role,
              phone: data.phone
            },
            token: data.token,
            isAuthenticated: true,
          });
        } catch (error: any) {
          throw new Error(error.response?.data?.message || 'Đăng nhập không thành công');
        }
      },
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
