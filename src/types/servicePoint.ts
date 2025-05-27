export interface ServicePoint {
  id: number;
  name: string;
  address: string;
  phone: string;
  working_hours: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface ServicePointPhoto {
  id: number;
  service_point_id: number;
  photo_url: string;
  created_at: string;
  updated_at: string;
}

export interface WorkingHours {
  monday: TimeRange;
  tuesday: TimeRange;
  wednesday: TimeRange;
  thursday: TimeRange;
  friday: TimeRange;
  saturday: TimeRange;
  sunday: TimeRange;
}

export interface TimeRange {
  start: string;
  end: string;
  isWorkingDay: boolean;
}

export interface Location {
  latitude: number;
  longitude: number;
}

export interface ServicePointFormData {
  partnerId: string;
  name: string;
  address: string;
  phone: string;
  description?: string;
  workingHours: WorkingHours;
  location: Location;
  services: string[];
} 