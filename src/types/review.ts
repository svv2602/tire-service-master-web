import { User, ServicePoint, Booking } from './models';

export type ReviewStatus = 'pending' | 'published' | 'rejected';

export interface Review {
  id: number;
  user_id: number;
  service_point_id: number;
  booking_id: number;
  rating: number;
  comment: string;
  status: ReviewStatus;
  response?: string;
  created_at: string;
  updated_at: string;
  user?: User;
  service_point?: {
    id: number;
    name: string;
  };
  booking?: {
    id: number;
    scheduled_at: string;
  };
}

export interface ReviewFormData {
  service_point_id: string;
  rating: number;
  comment: string;
}

export interface ReviewResponseData {
  response: string;
}

export interface ReviewFilter {
  service_point_id?: number;
  user_id?: number;
  rating?: number;
  status?: ReviewStatus;
  date_from?: string;
  date_to?: string;
} 