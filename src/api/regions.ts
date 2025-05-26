import { AxiosResponse } from 'axios';
import apiClient from './api';
import { Region } from '../types/models';

export interface City {
  id: number;
  name: string;
}

export interface RegionResponse {
  region: Region;
}

export interface RegionsResponse {
  regions: Region[];
  total_items: number;
}

interface GetAllParams {
  page?: number;
  per_page?: number;
  query?: string;
  active?: boolean;
}

// API для работы с регионами
export const regionsApi = {
  // Получение списка регионов
  getAll: async (): Promise<Region[]> => {
    const response = await apiClient.get<Region[]>('/api/v1/regions');
    return response.data;
  },

  // Получение региона по ID
  getById: async (id: number): Promise<Region> => {
    const response = await apiClient.get<Region>(`/api/v1/regions/${id}`);
    return response.data;
  },

  // Создание нового региона
  create: async (data: Omit<Region, 'id'>): Promise<AxiosResponse<RegionResponse>> => {
    console.log('Создание нового региона');
    return apiClient.post('/api/v1/regions', { region: data });
  },

  // Обновление региона
  update: async (id: number, data: Partial<Omit<Region, 'id'>>): Promise<AxiosResponse<RegionResponse>> => {
    console.log(`Обновление региона ${id}`);
    return apiClient.put(`/api/v1/regions/${id}`, { region: data });
  },

  // Удаление региона
  delete: async (id: number): Promise<AxiosResponse<void>> => {
    console.log(`Удаление региона ${id}`);
    return apiClient.delete(`/api/v1/regions/${id}`);
  },

  // Получение всех городов региона
  getCities: async (id: number): Promise<AxiosResponse<Region>> => {
    console.log(`Получение городов региона ${id}`);
    return apiClient.get(`/api/v1/regions/${id}/cities`);
  },

  getAllRegions: async (): Promise<Region[]> => {
    const response = await apiClient.get<Region[]>('/api/v1/regions');
    return response.data;
  },

  getRegionById: async (id: number): Promise<Region> => {
    const response = await apiClient.get<Region>(`/api/v1/regions/${id}`);
    return response.data;
  }
};
