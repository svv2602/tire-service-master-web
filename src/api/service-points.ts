import { AxiosResponse } from 'axios';
import apiClient from './api';
import { ApiResponse } from '../types/api';
import { ServicePoint } from '../types/models';
import { CreateServicePointRequest, UpdateServicePointRequest } from '../types/api-requests';

interface QueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  partner_id?: number;
  city_id?: number;
  is_active?: boolean;
}

export const servicePointsApi = {
  getAll: async (params?: QueryParams): Promise<ApiResponse<ServicePoint[]>> => {
    const response = await apiClient.get<ApiResponse<ServicePoint[]>>('/service-points', { params });
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<ServicePoint>> => {
    const response = await apiClient.get<ApiResponse<ServicePoint>>(`/service-points/${id}`);
    return response.data;
  },

  create: async (partnerId: number, data: CreateServicePointRequest): Promise<ApiResponse<ServicePoint>> => {
    const response = await apiClient.post<ApiResponse<ServicePoint>>(`/partners/${partnerId}/service-points`, data);
    return response.data;
  },

  update: async (partnerId: number, id: number, data: UpdateServicePointRequest): Promise<ApiResponse<ServicePoint>> => {
    const response = await apiClient.put<ApiResponse<ServicePoint>>(`/partners/${partnerId}/service-points/${id}`, data);
    return response.data;
  },

  delete: async (partnerId: number, id: number): Promise<void> => {
    await apiClient.delete(`/partners/${partnerId}/service-points/${id}`);
  },

  findNearby: async (latitude: number, longitude: number, distance: number): Promise<ApiResponse<ServicePoint[]>> => {
    const response = await apiClient.get<ApiResponse<ServicePoint[]>>('/service-points/nearby', {
      params: { latitude, longitude, distance }
    });
    return response.data;
  },

  uploadPhoto: async (id: number, photoData: FormData): Promise<ApiResponse<{ id: number; url: string }>> => {
    const response = await apiClient.post<ApiResponse<{ id: number; url: string }>>(
      `/service-points/${id}/photos`,
      photoData,
      {
        headers: { 'Content-Type': 'multipart/form-data' }
      }
    );
    return response.data;
  },

  deletePhoto: async (servicePointId: number, photoId: number): Promise<void> => {
    await apiClient.delete(`/service-points/${servicePointId}/photos/${photoId}`);
  }
}; 