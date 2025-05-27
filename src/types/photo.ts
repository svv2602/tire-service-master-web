export interface Photo {
  id: number;
  url: string;
  service_point_id: number;
  description?: string;
  is_main?: boolean;
  created_at: string;
  updated_at: string;
} 