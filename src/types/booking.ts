export interface Booking {
  id: string;
  servicePointId: string;
  clientId: string;
  carBrandId: string;
  carModelId: string;
  services: BookingService[];
  status: BookingStatus;
  startTime: string;
  endTime: string;
  totalPrice: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookingService {
  serviceId: string;
  price: number;
  duration: number;
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface BookingFormData {
  servicePointId: string;
  clientId: string;
  carBrandId: string;
  carModelId: string;
  services: BookingService[];
  startTime: string;
  endTime: string;
  notes?: string;
}

export interface BookingFilter {
  servicePointId?: string;
  clientId?: string;
  status?: BookingStatus;
  startDate?: string;
  endDate?: string;
} 