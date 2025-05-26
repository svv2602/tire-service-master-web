export interface Review {
  id: string;
  servicePointId: string;
  clientId: string;
  bookingId?: string;
  rating: number; // 1-5
  comment: string;
  response?: string; // Ответ от сервиса
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewFormData {
  servicePointId: string;
  clientId: string;
  bookingId?: string;
  rating: number;
  comment: string;
}

export interface ReviewResponse {
  response: string;
}

export interface ReviewFilter {
  servicePointId?: string;
  clientId?: string;
  rating?: number;
  isPublished?: boolean;
  startDate?: string;
  endDate?: string;
} 