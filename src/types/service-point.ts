import { Partner } from './partner';

export interface ServicePoint {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  working_hours: {
    [key: string]: {
      start: string;
      end: string;
    };
  };
  is_active: boolean;
  partner_id: number;
  created_at: string;
  updated_at: string;
  partner?: Partner;
}

export interface ServicePointFormData {
  name: string;
  address: string;
  phone: string;
  email: string;
  working_hours: {
    [key: string]: {
      start: string;
      end: string;
    };
  };
  partner_id: number;
} 