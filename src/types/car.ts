export interface CarBrand {
  id: string;
  name: string;
  code: string;
  createdAt: string;
  updatedAt: string;
}

export interface CarModel {
  id: string;
  brandId: string;
  name: string;
  code: string;
  yearStart?: number;
  yearEnd?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CarBrandFormData {
  name: string;
  code: string;
}

export interface CarModelFormData {
  brandId: string;
  name: string;
  code: string;
  yearStart?: number;
  yearEnd?: number;
} 