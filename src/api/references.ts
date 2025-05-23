import { AxiosResponse } from 'axios';
import api from './api';
import { Service, ServiceCategory, Amenity } from '../types/models';
import { PaginatedResponse } from '../types/api';
import { CreateServiceRequest, UpdateServiceRequest, CreateServiceCategoryRequest, UpdateServiceCategoryRequest } from '../types/api-requests';

export interface ServiceFilters {
  category_id?: number;
  search?: string;
  is_active?: boolean;
}

export const referencesApi = {
  // Услуги
  services: {
    getAll: async (filters?: ServiceFilters, page = 1, per_page = 10): Promise<PaginatedResponse<Service>> => {
      const response: AxiosResponse<PaginatedResponse<Service>> = await api.get('/services', {
        params: {
          ...filters,
          page,
          per_page
        }
      });
      return response.data;
    },

    getById: async (id: number): Promise<Service> => {
      const response: AxiosResponse<Service> = await api.get(`/services/${id}`);
      return response.data;
    },

    create: async (data: CreateServiceRequest): Promise<Service> => {
      const response: AxiosResponse<Service> = await api.post('/services', data);
      return response.data;
    },

    update: async (id: number, data: UpdateServiceRequest): Promise<Service> => {
      const response: AxiosResponse<Service> = await api.put(`/services/${id}`, data);
      return response.data;
    },

    delete: async (id: number): Promise<void> => {
      await api.delete(`/services/${id}`);
    }
  },

  // Категории услуг
  serviceCategories: {
    getAll: async (page = 1, per_page = 10): Promise<PaginatedResponse<ServiceCategory>> => {
      const response: AxiosResponse<PaginatedResponse<ServiceCategory>> = await api.get('/service-categories', {
        params: { page, per_page }
      });
      return response.data;
    },

    getById: async (id: number): Promise<ServiceCategory> => {
      const response: AxiosResponse<ServiceCategory> = await api.get(`/service-categories/${id}`);
      return response.data;
    },

    create: async (data: CreateServiceCategoryRequest): Promise<ServiceCategory> => {
      const response: AxiosResponse<ServiceCategory> = await api.post('/service-categories', data);
      return response.data;
    },

    update: async (id: number, data: UpdateServiceCategoryRequest): Promise<ServiceCategory> => {
      const response: AxiosResponse<ServiceCategory> = await api.put(`/service-categories/${id}`, data);
      return response.data;
    },

    delete: async (id: number): Promise<void> => {
      await api.delete(`/service-categories/${id}`);
    }
  },

  // Удобства
  amenities: {
    getAll: async (): Promise<Amenity[]> => {
      const response: AxiosResponse<Amenity[]> = await api.get('/amenities');
      return response.data;
    },

    getById: async (id: number): Promise<Amenity> => {
      const response: AxiosResponse<Amenity> = await api.get(`/amenities/${id}`);
      return response.data;
    }
  }
}; 