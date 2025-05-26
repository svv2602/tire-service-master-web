export interface Review {
  id: number;
  service_point_id: number;
  user_id: number;
  booking_id?: number;
  rating: number;
  comment: string;
  response?: string;
  status: ReviewStatus;
  created_at: string;
  updated_at: string;
  service_point?: {
    id: number;
    name: string;
  };
  user?: {
    id: number;
    first_name: string;
    last_name: string;
  };
}

export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface ReviewFormData {
  service_point_id: number;
  user_id: number;
  booking_id?: number;
  rating: number;
  comment: string;
}

export interface ReviewResponse {
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