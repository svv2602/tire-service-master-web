export interface Service {
  id: string | number;
  name: string;
  description?: string;
  price?: number;
  duration?: number; // в минутах (для обратной совместимости)
  default_duration?: number; // поле из API
  category_id?: number; // поле из API
  categoryId?: string; // для обратной совместимости
  is_active?: boolean; // поле из API
  isActive?: boolean; // для обратной совместимости
  sort_order?: number;
  created_at?: string; // поле из API
  updated_at?: string; // поле из API
  createdAt?: string; // для обратной совместимости
  updatedAt?: string; // для обратной совместимости
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