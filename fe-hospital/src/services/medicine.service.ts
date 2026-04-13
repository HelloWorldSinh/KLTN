import api from './api';

export interface MedicineDTO {
  id?: number;
  name: string;
  unit: string;
  active: boolean;
}

export interface ResponseObject {
  status: boolean;
  message: string;
}

export const medicineService = {
  getAllMedicines: async (): Promise<MedicineDTO[]> => {
    const response = await api.get<MedicineDTO[]>('/medicines');
    return response.data;
  },

  getMedicineById: async (id: number): Promise<MedicineDTO> => {
    const response = await api.get<MedicineDTO>(`/medicines/${id}`);
    return response.data;
  },

  createMedicine: async (dto: MedicineDTO): Promise<ResponseObject> => {
    const response = await api.post<ResponseObject>('/medicines', dto);
    return response.data;
  },

  updateMedicine: async (id: number, dto: MedicineDTO): Promise<ResponseObject> => {
    const response = await api.put<ResponseObject>(`/medicines/${id}`, dto);
    return response.data;
  },

  deleteMedicine: async (id: number): Promise<ResponseObject> => {
    const response = await api.delete<ResponseObject>(`/medicines/${id}`);
    return response.data;
  },
};
