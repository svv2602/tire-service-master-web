export interface Partner {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PartnerFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  description?: string;
} 