// types/availability.ts - Типы для системы динамической доступности

export interface AvailableTimeSlot {
  time: string; // "14:30"
  available_posts: number;
  total_posts: number;
  can_book: boolean;
}

export interface AvailabilityResponse {
  service_point_id: number;
  date: string;
  min_duration_minutes?: number;
  available_times: AvailableTimeSlot[];
  total_intervals: number;
}

export interface TimeCheckResponse {
  service_point_id: number;
  date: string;
  time: string;
  duration_minutes: number;
  available: boolean;
  available_posts: number;
  total_posts: number;
  conflicts?: string[];
  message?: string;
}

export interface NextAvailableResponse {
  service_point_id: number;
  requested_date: string;
  requested_after_time?: string;
  duration_minutes: number;
  found: boolean;
  next_available?: {
    date: string;
    time: string;
    available_posts: number;
  };
  message?: string;
}

export interface DayDetailsResponse {
  service_point_id: number;
  service_point_name: string;
  date: string;
  is_working: boolean;
  total_posts: number;
  working_hours?: {
    start_time: string;
    end_time: string;
  };
  summary?: {
    total_slots: number;
    occupied_slots: number;
    available_slots: number;
    occupancy_percentage: number;
  };
  hourly_breakdown?: Array<{
    hour: number;
    available_posts: number;
    total_posts: number;
    occupancy_percentage: number;
  }>;
}

export interface WeekDayOverview {
  date: string;
  weekday: string;
  is_working: boolean;
  total_posts: number;
  summary?: {
    total_slots?: number;
    occupied_slots?: number;
    available_slots?: number;
    occupancy_percentage?: number;
  };
}

export interface WeekOverviewResponse {
  service_point_id: number;
  service_point_name: string;
  week_start: string;
  week_end: string;
  days: WeekDayOverview[];
}

// Параметры для API запросов
export interface AvailabilityParams {
  date: string;
  min_duration_minutes?: number;
  duration?: number;
}

export interface TimeCheckParams {
  date: string;
  time: string;
  duration_minutes?: number;
}

export interface NextAvailableParams {
  date: string;
  after_time?: string;
  duration_minutes?: number;
}

export interface WeekOverviewParams {
  start_date?: string;
} 