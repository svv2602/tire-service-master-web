export interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration: number; // в минутах
  categoryId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceFormData {
  name: string;
  description?: string;
  price: number;
  duration: number;
  categoryId: string;
  isActive: boolean;
}

export interface ServiceCategoryFormData {
  name: string;
  description?: string;
}

// Тип для связи сервиса с точкой обслуживания
export interface ServicePointService {
  id: string;
  servicePointId: string;
  serviceId: string;
  price?: number; // Опциональная цена, если отличается от базовой
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
} 