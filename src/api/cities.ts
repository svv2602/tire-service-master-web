import apiClient from './api';
import { City } from '../types/models';

export const citiesApi = {
  getAll: async (regionId?: number): Promise<City[]> => {
    const params = regionId ? { region_id: regionId } : {};
    const response = await apiClient.get<City[]>('/api/v1/cities', { params });
    return response.data;
  },

  getById: async (id: number): Promise<City> => {
    const response = await apiClient.get<City>(`/api/v1/cities/${id}`);
    return response.data;
  }
}; 