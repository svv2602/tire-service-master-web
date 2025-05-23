import { AxiosResponse } from 'axios';
import apiClient from './api';
import { CarModel } from '../types';
import { CarModelsResponse, CarModelResponse, CarModelRequest } from '../types/apiResponses';

export interface CarModelFilters {
  brand_id?: number;
  query?: string;
  popular?: boolean;
  page?: number;
  per_page?: number;
}

// API methods for working with car models
export const carModelsApi = {
  // Get all car models with optional filters
  getAll: async (params?: CarModelFilters): Promise<AxiosResponse<CarModelsResponse>> => {
    console.log('Получение списка моделей автомобилей');
    return apiClient.get('/api/v1/car_models', { params });
  },

  // Get car model by ID
  getById: async (id: number): Promise<AxiosResponse<CarModelResponse>> => {
    console.log(`Получение модели автомобиля ${id}`);
    return apiClient.get(`/api/v1/car_models/${id}`);
  },

  // Get car models by brand ID
  getByBrandId: async (brandId: number, params?: Omit<CarModelFilters, 'brand_id'>): Promise<AxiosResponse<CarModelResponse>> => {
    console.log(`Получение моделей для марки ${brandId}`);
    return apiClient.get(`/api/v1/car_brands/${brandId}/car_models`, { params });
  },

  // Create new car model
  create: async (data: CarModelRequest): Promise<AxiosResponse<CarModelResponse>> => {
    console.log('Создание новой модели автомобиля');
    return apiClient.post('/api/v1/car_models', data);
  },

  // Update existing car model
  update: async (id: number, data: CarModelRequest): Promise<AxiosResponse<CarModelResponse>> => {
    console.log(`Обновление модели автомобиля ${id}`);
    return apiClient.put(`/api/v1/car_models/${id}`, data);
  },

  // Delete car model
  delete: async (id: number): Promise<AxiosResponse<void>> => {
    console.log(`Удаление модели автомобиля ${id}`);
    return apiClient.delete(`/api/v1/car_models/${id}`);
  }
};
