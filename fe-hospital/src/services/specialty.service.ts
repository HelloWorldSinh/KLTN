import api from './api';

export interface SpecialtyDTO {
  id?: number;
  name: string;
  description: string;
}

export interface ResponseObject {
  status: boolean;
  message: string;
}

export const specialtyService = {
  getAllSpecialties: async (): Promise<SpecialtyDTO[]> => {
    const response = await api.get<SpecialtyDTO[]>('/specialties');
    return response.data;
  },

  getSpecialtyById: async (id: number): Promise<SpecialtyDTO> => {
    const response = await api.get<SpecialtyDTO>(`/specialties/${id}`);
    return response.data;
  },

  createSpecialty: async (dto: SpecialtyDTO): Promise<ResponseObject> => {
    const response = await api.post<ResponseObject>('/specialties', dto);
    return response.data;
  },

  updateSpecialty: async (id: number, dto: SpecialtyDTO): Promise<ResponseObject> => {
    const response = await api.put<ResponseObject>(`/specialties/${id}`, dto);
    return response.data;
  },

  deleteSpecialty: async (id: number): Promise<ResponseObject> => {
    const response = await api.delete<ResponseObject>(`/specialties/${id}`);
    return response.data;
  },
};
