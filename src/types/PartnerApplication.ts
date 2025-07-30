// Базовый интерфейс заявки партнера
export interface PartnerApplication {
  id: number;
  company_name: string;
  business_description: string;
  contact_person: string;
  email: string;
  phone: string;
  city: string;
  address?: string;
  region_id?: number;
  city_record_id?: number;
  website?: string;
  additional_info?: string;
  expected_service_points: number;
  status: PartnerApplicationStatus;
  processed_by_id?: number;
  admin_notes?: string;
  processed_at?: string;
  created_at: string;
  updated_at: string;
  
  // Вычисляемые поля от сериализатора
  status_label: string;
  status_color: string;
  full_address: string;
  region_name: string;
  city_name: string;
  processed: boolean;
  processing_duration?: number;
  
  // Связанные объекты (опционально)
  region?: {
    id: number;
    name: string;
  };
  city_record?: {
    id: number;
    name: string;
  };
  processed_by?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
}

// Статусы заявки
export type PartnerApplicationStatus = 
  | 'new' 
  | 'pending'
  | 'in_progress' 
  | 'approved' 
  | 'rejected' 
  | 'connected';

// Форма данных для создания заявки
export interface PartnerApplicationFormData {
  company_name: string;
  business_description: string;
  contact_person: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  region_id: number;
  city_record_id: number;
  website: string;
  additional_info: string;
  expected_service_points: number;
}

// Данные для обновления статуса
export interface UpdateApplicationStatusData {
  id: number;
  status: PartnerApplicationStatus;
  admin_notes?: string;
}

// Данные для обновления заметок администратора
export interface UpdateApplicationNotesData {
  id: number;
  admin_notes: string;
}

// Параметры для получения списка заявок
export interface GetPartnerApplicationsParams {
  page?: number;
  per_page?: number;
  status?: PartnerApplicationStatus;
  region_id?: number;
  query?: string;
  sort_by?: 'company_name' | 'status' | 'created_at';
  sort_direction?: 'asc' | 'desc';
}

// Ответ API со списком заявок
export interface PartnerApplicationsResponse {
  data: PartnerApplication[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_count: number;
    per_page: number;
  };
  meta: {
    filters: {
      status?: string;
      region_id?: number;
      query?: string;
    };
    sort: {
      sort_by: string;
      sort_direction: string;
    };
  };
}

// Ответ API с одной заявкой
export interface PartnerApplicationResponse {
  data: PartnerApplication;
}

// Ответ API при создании заявки
export interface CreatePartnerApplicationResponse {
  message: string;
  data: PartnerApplication;
}

// Ответ API при изменении статуса
export interface UpdateApplicationStatusResponse {
  message: string;
  data: PartnerApplication;
}

// Статистика по заявкам
export interface PartnerApplicationsStats {
  total: number;
  by_status: Record<PartnerApplicationStatus, number>;
  recent_count: number;
  processing_average: number;
}

// Ответ API со статистикой
export interface PartnerApplicationsStatsResponse {
  data: PartnerApplicationsStats;
}

// Опции для статуса (для UI компонентов)
export interface StatusOption {
  value: PartnerApplicationStatus;
  label: string;
  color: 'info' | 'warning' | 'success' | 'error' | 'default';
}

// Константы статусов
export const PARTNER_APPLICATION_STATUSES: StatusOption[] = [
  { value: 'new', label: 'Новая', color: 'info' },
  { value: 'in_progress', label: 'В работе', color: 'warning' },
  { value: 'approved', label: 'Одобрена', color: 'success' },
  { value: 'rejected', label: 'Отклонена', color: 'error' },
  { value: 'connected', label: 'Подключен', color: 'success' },
];

// Утилиты для работы со статусами
export const getStatusLabel = (status: PartnerApplicationStatus): string => {
  const statusOption = PARTNER_APPLICATION_STATUSES.find(s => s.value === status);
  return statusOption?.label || status;
};

export const getStatusColor = (status: PartnerApplicationStatus): string => {
  const statusOption = PARTNER_APPLICATION_STATUSES.find(s => s.value === status);
  return statusOption?.color || 'default';
};

// Валидация формы
export interface PartnerApplicationFormErrors {
  company_name?: string;
  business_description?: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  city?: string;
  address?: string;
  website?: string;
  additional_info?: string;
  expected_service_points?: string;
  region_id?: string;
  city_record_id?: string;
} 