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
    const response: AxiosResponse<PaginatedResponse<ServicePoint>> = await api.get('/service-points', {
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
    const response: AxiosResponse<ServicePoint> = await api.get(`/service-points/${id}`);
    return response.data;
  },

  // Создание сервисной точки
  create: async (partnerId: number, data: Partial<ServicePoint>): Promise<ServicePoint> => {
    const response: AxiosResponse<ServicePoint> = await api.post(`/partners/${partnerId}/service-points`, data);
    return response.data;
  },

  // Обновление сервисной точки
  update: async (id: number, data: Partial<ServicePoint>): Promise<ServicePoint> => {
    const response: AxiosResponse<ServicePoint> = await api.put(`/service-points/${id}`, data);
    return response.data;
  },

  // Удаление сервисной точки
  delete: async (id: number): Promise<void> => {
    await api.delete(`/service-points/${id}`);
  },

  // Получение ближайших сервисных точек
  getNearby: async (latitude: number, longitude: number, distance: number = 10): Promise<ServicePoint[]> => {
    const response: AxiosResponse<ServicePoint[]> = await api.get('/service-points/nearby', {
      params: { latitude, longitude, distance }
    });
    return response.data;
  },

  // Загрузка фотографий
  uploadPhotos: async (id: number, photos: FormData): Promise<ServicePointPhoto[]> => {
    const response: AxiosResponse<ServicePointPhoto[]> = await api.post(
      `/service-points/${id}/photos`,
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
    await api.delete(`/service-points/${servicePointId}/photos/${photoId}`);
  },

  // Получение фотографий сервисной точки
  getPhotos: async (id: number): Promise<ServicePointPhoto[]> => {
    const response: AxiosResponse<ServicePointPhoto[]> = await api.get(`/service-points/${id}/photos`);
    return response.data;
  },

  // Обновление рабочих часов
  updateWorkingHours: async (id: number, workingHours: ServicePoint['working_hours']): Promise<ServicePoint> => {
    const response: AxiosResponse<ServicePoint> = await api.put(`/service-points/${id}/working-hours`, {
      working_hours: workingHours
    });
    return response.data;
  },

  // Обновление статуса
  updateStatus: async (id: number, statusId: number): Promise<ServicePoint> => {
    const response: AxiosResponse<ServicePoint> = await api.put(`/service-points/${id}/status`, {
      status_id: statusId
    });
    return response.data;
  }
}; 