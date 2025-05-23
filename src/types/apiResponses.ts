// API Response types
export interface PaginatedResponse<T> {
  items: T[];
  total_items: number;
}

export interface CarBrandResponse {
  car_brand: {
    id: number;
    name: string;
    code: string;
    logo_url?: string;
    is_active: boolean;
    is_popular: boolean;
    models_count: number;
    car_models?: Array<{
      id: number;
      brand_id: number;
      name: string;
      code: string;
      is_active: boolean;
      is_popular: boolean;
      year_start?: number;
      year_end?: number;
    }>;
  };
}

export interface CarBrandsResponse extends PaginatedResponse<CarBrandResponse['car_brand']> {
  car_brands: Array<CarBrandResponse['car_brand']>;
}

export interface CarModelResponse {
  car_model: {
    id: number;
    brand_id: number;
    name: string;
    code: string;
    is_active: boolean;
    is_popular: boolean;
    year_start?: number;
    year_end?: number;
    brand?: CarBrandResponse['car_brand'];
  };
}

export interface CarModelsResponse extends PaginatedResponse<CarModelResponse['car_model']> {
  car_models: Array<CarModelResponse['car_model']>;
}

export interface CarBrandCreateRequest {
  car_brand: {
    name: string;
    code?: string;
    logo_url?: string;
    is_active?: boolean;
  };
}

export interface CarBrandUpdateRequest {
  car_brand: Partial<CarBrandCreateRequest['car_brand']>;
}

export type CarBrandRequest = CarBrandCreateRequest | CarBrandUpdateRequest;

export interface CarModelCreateRequest {
  car_model: {
    name: string;
    brand_id: number;
    code?: string;
    is_active?: boolean;
  };
}

export interface CarModelUpdateRequest {
  car_model: Partial<CarModelCreateRequest['car_model']>;
}

export type CarModelRequest = CarModelCreateRequest | CarModelUpdateRequest;
