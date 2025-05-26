export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  cars: ClientCar[];
  createdAt: string;
  updatedAt: string;
}

export interface ClientCar {
  id: string;
  clientId: string;
  carBrandId: string;
  carModelId: string;
  year?: number;
  registrationNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientFormData {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  cars?: ClientCarFormData[];
}

export interface ClientCarFormData {
  carBrandId: string;
  carModelId: string;
  year?: number;
  registrationNumber?: string;
  notes?: string;
}

export interface ClientFilter {
  search?: string; // Поиск по имени, фамилии или телефону
  carBrandId?: string;
  carModelId?: string;
} 