import { AxiosResponse } from 'axios';
import apiClient from './api';
import { CarBrand } from '../types';
import { CarBrandsResponse, CarBrandResponse, CarBrandRequest } from '../types/apiResponses';

interface GetAllParams {
  page?: number;
  per_page?: number;
  query?: string;
  popular?: boolean;
}

// API methods for working with car brands
export const carBrandsApi = {
  // Get all car brands with optional filters
  getAll: async (params?: GetAllParams): Promise<AxiosResponse<CarBrandsResponse>> => {
    console.log('Получение списка марок автомобилей');
    return apiClient.get('/api/v1/car_brands', { params });
  },

  // Get car brand by ID
  getById: async (id: number): Promise<AxiosResponse<CarBrandResponse>> => {
    console.log(`Получение марки автомобиля ${id}`);
    return apiClient.get(`/api/v1/car_brands/${id}`);
  },

  // Create new car brand
  create: async (data: CarBrandRequest): Promise<AxiosResponse<CarBrandResponse>> => {
    console.log('Создание новой марки автомобиля');
    return apiClient.post('/api/v1/car_brands', data);
  },

  // Update existing car brand
  update: async (id: number, data: CarBrandRequest): Promise<AxiosResponse<CarBrandResponse>> => {
    console.log(`Обновление марки автомобиля ${id}`);
    return apiClient.put(`/api/v1/car_brands/${id}`, data);
  },

  // Delete car brand
  delete: async (id: number): Promise<AxiosResponse<void>> => {
    console.log(`Удаление марки автомобиля ${id}`);
    return apiClient.delete(`/api/v1/car_brands/${id}`);
  }
};
