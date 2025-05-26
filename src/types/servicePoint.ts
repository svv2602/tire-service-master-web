export interface ServicePoint {
  id: string;
  partnerId: string;
  name: string;
  address: string;
  phone: string;
  description?: string;
  workingHours: WorkingHours;
  location: Location;
  services: string[];
  photos: string[];
  createdAt: string;
  updatedAt: string;
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