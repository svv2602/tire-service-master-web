export interface Region {
  id: string;
  name: string;
  code: string;
  createdAt: string;
  updatedAt: string;
}

export interface City {
  id: string;
  regionId: string;
  name: string;
  code: string;
  createdAt: string;
  updatedAt: string;
}

export interface RegionFormData {
  name: string;
  code: string;
}

export interface CityFormData {
  regionId: string;
  name: string;
  code: string;
} 