import { AxiosResponse } from 'axios';
import api from './api';
import { ServicePoint, ServicePointPhoto } from '../types/models';
import { PaginatedResponse } from '../types/api';

export interface ServicePointFilters {
  city_id?: number;
  partner_id?: number;
  search?: string;
  is_active?: boolean;
  latitude?: number;
  longitude?: number;
  distance?: number;
}

export const servicePointsApi = {
  // Получение списка сервисных точек с фильтрацией и пагинацией
  getAll: async (filters?: ServicePointFilters, page = 1, per_page = 10): Promise<PaginatedResponse<ServicePoint>> => {
    const response: AxiosResponse<PaginatedResponse<ServicePoint>> = await api.get('/api/v1/service_points', {
      params: {
        ...filters,
        page,
        per_page
      }
    });
    return response.data;
  },

  // Получение конкретной сервисной точки
  getById: async (id: number): Promise<ServicePoint> => {
    const response: AxiosResponse<ServicePoint> = await api.get(`/api/v1/service_points/${id}`);
    return response.data;
  },

  // Создание сервисной точки
  create: async (partnerId: number, data: Partial<ServicePoint>): Promise<ServicePoint> => {
    const response: AxiosResponse<ServicePoint> = await api.post(`/api/v1/partners/${partnerId}/service_points`, data);
    return response.data;
  },

  // Обновление сервисной точки
  update: async (partnerId: number, id: number, data: Partial<ServicePoint>): Promise<ServicePoint> => {
    const response: AxiosResponse<ServicePoint> = await api.put(`/api/v1/partners/${partnerId}/service_points/${id}`, data);
    return response.data;
  },

  // Удаление сервисной точки
  delete: async (partnerId: number, id: number): Promise<void> => {
    await api.delete(`/api/v1/partners/${partnerId}/service_points/${id}`);
  },

  // Получение ближайших сервисных точек
  getNearby: async (latitude: number, longitude: number, distance: number = 10): Promise<ServicePoint[]> => {
    const response: AxiosResponse<ServicePoint[]> = await api.get('/api/v1/service_points/nearby', {
      params: { latitude, longitude, distance }
    });
    return response.data;
  },

  // Загрузка фотографий
  uploadPhotos: async (id: number, photos: FormData): Promise<ServicePointPhoto[]> => {
    const response: AxiosResponse<ServicePointPhoto[]> = await api.post(
      `/api/v1/service_points/${id}/photos`,
      photos,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data;
  },

  // Удаление фотографии
  deletePhoto: async (servicePointId: number, photoId: number): Promise<void> => {
    await api.delete(`/api/v1/service_points/${servicePointId}/photos/${photoId}`);
  },

  // Получение фотографий сервисной точки
  getPhotos: async (id: number): Promise<ServicePointPhoto[]> => {
    const response: AxiosResponse<ServicePointPhoto[]> = await api.get(`/api/v1/service_points/${id}/photos`);
    return response.data;
  },

  // Обновление рабочих часов
  updateWorkingHours: async (partnerId: number, id: number, workingHours: ServicePoint['working_hours']): Promise<ServicePoint> => {
    const response: AxiosResponse<ServicePoint> = await api.put(`/api/v1/partners/${partnerId}/service_points/${id}`, {
      working_hours: workingHours
    });
    return response.data;
  },

  // Обновление статуса
  updateStatus: async (partnerId: number, id: number, statusId: number): Promise<ServicePoint> => {
    const response: AxiosResponse<ServicePoint> = await api.put(`/api/v1/partners/${partnerId}/service_points/${id}`, {
      status_id: statusId
    });
    return response.data;
  }
}; 