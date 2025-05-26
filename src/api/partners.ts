import { AxiosResponse } from 'axios';
import apiClient from './api';
import { ApiResponse } from '../types/api';
import { Partner } from '../types/models';
import { CreatePartnerRequest, UpdatePartnerRequest } from '../types/api-requests';

interface QueryParams {
  page?: number;
  per_page?: number;
  query?: string;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
}

// Интерфейс для ответа API партнеров
interface PartnersApiResponse {
  partners: Partner[];
  total_items: number;
}

export const partnersApi = {
  getAll: async (params?: QueryParams): Promise<PartnersApiResponse> => {
    const response = await apiClient.get<PartnersApiResponse>('/api/v1/partners', { params });
    return response.data;
  },

  getById: async (id: number): Promise<Partner> => {
    const response = await apiClient.get<Partner>(`/api/v1/partners/${id}`);
    return response.data;
  },

  create: async (data: CreatePartnerRequest): Promise<Partner> => {
    const response = await apiClient.post<Partner>('/api/v1/partners', { partner: data.partner, user: data.user });
    return response.data;
  },

  update: async (id: number, data: UpdatePartnerRequest): Promise<Partner> => {
    const response = await apiClient.put<Partner>(`/api/v1/partners/${id}`, { partner: data.partner, user: data.user });
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/v1/partners/${id}`);
  },

  toggleActive: async (id: number, active: boolean): Promise<Partner> => {
    const response = await apiClient.patch<{success: boolean, partner: Partner}>(`/api/v1/partners/${id}/toggle_active`, { active });
    return response.data.partner;
  }
}; 