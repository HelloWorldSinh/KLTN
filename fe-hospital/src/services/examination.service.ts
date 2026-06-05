import api from './api';

export interface ExaminationResponse {
  appointmentId: number;
  symptom: string | null;
  diagnosis: string | null;
  status: 'PENDING' | 'CONFIRMED' | 'WAITING' | 'IN_PROGRESS' | 'COMPLETED' | 'MISSED' | 'NO_SHOW' | 'CANCELLED';
  prescriptionDetails: PrescriptionDetailResponse[];
  lastUpdated: string | null;
}

export interface PrescriptionDetailResponse {
  medicineId: number;
  medicineName: string;
  medicineUnit: string;
  quantity: number;
  dosage: string;
}

export interface ExaminationRequest {
  symptom: string;
  diagnosis: string;
}

export interface PrescriptionRequest {
  details: {
    medicineId: number;
    quantity: number;
    dosage: string;
  }[];
}

export const examinationService = {
  getExamination: async (appointmentId: number): Promise<ExaminationResponse> => {
    const response = await api.get(`/examinations/${appointmentId}`);
    return response.data;
  },

  saveExamination: async (appointmentId: number, data: ExaminationRequest) => {
    const response = await api.post(`/examinations/${appointmentId}`, data);
    return response.data;
  },

  savePrescription: async (appointmentId: number, data: PrescriptionRequest) => {
    const response = await api.post(`/examinations/${appointmentId}/prescription`, data);
    return response.data;
  },

  completeExamination: async (appointmentId: number) => {
    const response = await api.post(`/examinations/${appointmentId}/complete`);
    return response.data;
  }
};
