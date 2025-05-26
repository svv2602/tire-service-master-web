import apiClient from './api';

// Интерфейсы для дашборда
export interface DashboardStats {
  partners_count: number;
  service_points_count: number;
  clients_count: number;
  bookings_count: number;
  completed_bookings_count: number;
  canceled_bookings_count: number;
  bookings_by_month: number[];
  revenue_by_month: number[];
}

export interface DashboardResponse {
  data: {
    data: DashboardStats;
  };
}

// API методы для дашборда
export const dashboardApi = {
  // Получить статистику дашборда
  getStats: (): Promise<DashboardResponse> => {
    return apiClient.get('/api/v1/dashboard/stats');
  }
}; 