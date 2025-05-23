import { AxiosResponse } from 'axios';
import apiClient from './api';
import { ApiResponse } from '../types/api';
import { Partner } from '../types/models';
import { CreatePartnerRequest, UpdatePartnerRequest } from '../types/api-requests';

interface QueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
}

export const partnersApi = {
  getAll: async (params?: QueryParams): Promise<ApiResponse<Partner[]>> => {
    const response = await apiClient.get<ApiResponse<Partner[]>>('/partners', { params });
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<Partner>> => {
    const response = await apiClient.get<ApiResponse<Partner>>(`/partners/${id}`);
    return response.data;
  },

  create: async (data: CreatePartnerRequest): Promise<ApiResponse<Partner>> => {
    const response = await apiClient.post<ApiResponse<Partner>>('/partners', data);
    return response.data;
  },

  update: async (id: number, data: UpdatePartnerRequest): Promise<ApiResponse<Partner>> => {
    const response = await apiClient.put<ApiResponse<Partner>>(`/partners/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/partners/${id}`);
  },

  toggleActive: async (id: number, active: boolean): Promise<ApiResponse<Partner>> => {
    const response = await apiClient.patch<ApiResponse<Partner>>(`/partners/${id}/toggle_active`, { active });
    return response.data;
  }
}; 