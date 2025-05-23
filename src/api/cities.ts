import { AxiosResponse } from 'axios';
import apiClient from './api';

export interface City {
  id: number;
  region_id: number;
  name: string;
  code?: string;
  is_active: boolean;
  region?: {
    id: number;
    name: string;
    code?: string;
    is_active: boolean;
  };
}

interface ApiCityResponse {
  city: City;
  message?: string;
}

interface ApiCitiesResponse {
  cities: City[];
  total_items: number;
  message?: string;
}

export type CityResponse = ApiCityResponse;
export type CitiesResponse = ApiCitiesResponse;

interface GetAllParams {
  page?: number;
  per_page?: number;
  region_id?: number;
  query?: string;
  active?: boolean;
}

// API для работы с городами
export const citiesApi = {
  // Получение списка городов с фильтрацией
  getAll: async (params?: GetAllParams): Promise<AxiosResponse<CitiesResponse>> => {
    console.log('Получение списка городов');
    return apiClient.get('/api/v1/cities', { params });
  },

  // Получение города по ID
  getById: async (id: number): Promise<AxiosResponse<CityResponse>> => {
    console.log(`Получение города ${id}`);
    return apiClient.get(`/api/v1/cities/${id}`);
  },

  // Создание нового города
  create: async (data: Omit<City, 'id'>): Promise<AxiosResponse<CityResponse>> => {
    console.log('Создание нового города');
    return apiClient.post('/api/v1/cities', { city: data });
  },

  // Обновление города
  update: async (id: number, data: Partial<Omit<City, 'id'>>): Promise<AxiosResponse<CityResponse>> => {
    console.log(`Обновление города ${id}`);
    return apiClient.put(`/api/v1/cities/${id}`, { city: data });
  },

  // Удаление города
  delete: async (id: number): Promise<AxiosResponse<void>> => {
    console.log(`Удаление города ${id}`);
    return apiClient.delete(`/api/v1/cities/${id}`);
  },

  // Получение городов по региону
  getByRegion: async (regionId: number): Promise<AxiosResponse<CitiesResponse>> => {
    console.log(`Получение городов региона ${regionId}`);
    return apiClient.get(`/api/v1/regions/${regionId}/cities`);
  }
};
