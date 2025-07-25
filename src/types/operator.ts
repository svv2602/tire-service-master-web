export interface OperatorUser {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone?: string;
  is_active: boolean;
}

export interface Operator {
  id: number;
  user: OperatorUser;
  partner_id: number;
  partner_name?: string;
  position?: string;
  access_level: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Назначенные сервисные точки
  service_point_ids?: number[];
}

export interface OperatorServicePoint {
  id: number;
  operator_id: number;
  service_point_id: number;
  service_point: {
    id: number;
    name: string;
    address: string;
    partner_id: number;
    partner_name?: string;
  };
  is_active: boolean;
  assigned_at: string;
  created_at: string;
  updated_at: string;
}

export interface CreateOperatorRequest {
  user: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    password: string;
  };
  operator: {
    partner_id: number;
    position?: string;
    access_level: number;
  };
}

export interface UpdateOperatorRequest {
  id: number;
  user?: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    password?: string;
  };
  operator?: {
    position?: string;
    access_level?: number;
    is_active?: boolean;
  };
}

// Ответы API
export interface OperatorsResponse {
  data: Operator[];
  meta: {
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
  };
}

export interface OperatorServicePointsResponse {
  data: OperatorServicePoint[];
  meta: {
    total: number;
  };
}

// Запросы для назначений
export interface CreateAssignmentRequest {
  operatorId: number;
  servicePointIds: number[];
}

export interface BulkAssignmentRequest {
  operatorId: number;
  servicePointIds: number[];
}

export interface BulkAssignmentResponse {
  success: number[];
  failed: number[];
  errors: string[];
}

export interface UpdateAssignmentRequest {
  operatorId: number;
  servicePointId: number;
  is_active: boolean;
} 