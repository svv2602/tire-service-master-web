import { baseApi } from './baseApi';
import type { User } from '../types/user';

export interface OperatorUser {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string;
  is_active: boolean;
}

export interface Operator {
  id: number;
  partner_id: number;
  partner_name?: string;
  user: OperatorUser;
  position?: string;
  access_level: number;
  is_active: boolean;
  service_point_ids?: number[];
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
    position: string;
    access_level: number;
  };
}

export interface UpdateOperatorRequest {
  user?: Partial<OperatorUser & { password?: string }>;
  operator?: Partial<Omit<Operator, 'user'>>;
}

// Типы для управления привязками операторов к сервисным точкам
export interface OperatorServicePoint {
  id: number;
  operator_id: number;
  service_point_id: number;
  service_point_name: string;
  service_point_address: string;
  partner_id: number;
  partner_name: string;
  is_active: boolean;
  assigned_at: string;
  created_at: string;
  updated_at: string;
}

export interface OperatorServicePointDetailed {
  id: number;
  operator_id: number;
  service_point_id: number;
  is_active: boolean;
  assigned_at: string;
  created_at: string;
  updated_at: string;
  operator_info: {
    id: number;
    user_id: number;
    first_name: string;
    last_name: string;
    full_name: string;
    email: string;
    phone: string;
    is_active: boolean;
  };
  service_point_info: {
    id: number;
    name: string;
    address: string;
    city_id: number;
    city_name: string;
    region_name: string;
    phone: string;
    work_status: string;
    is_active: boolean;
  };
  partner_info: {
    id: number;
    name: string;
    email: string;
    phone: string;
  };
}

export interface OperatorServicePointsResponse {
  data: OperatorServicePoint[];
  meta: {
    total: number;
    active: number;
    inactive: number;
  };
}

export interface CreateAssignmentRequest {
  service_point_id: number;
}

export interface BulkAssignmentRequest {
  service_point_ids: number[];
}

export interface BulkAssignmentResponse {
  data: OperatorServicePoint[];
  errors: Array<{
    service_point_id: number;
    service_point_name: string;
    error: string;
  }>;
  meta: {
    total_requested: number;
    successful: number;
    failed: number;
  };
  message: string;
}

export interface UpdateAssignmentRequest {
  is_active: boolean;
}

export const operatorsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Получить всех операторов (для админов)
    getAllOperators: build.query<{
      data: Operator[];
      pagination: {
        current_page: number;
        total_pages: number;
        total_count: number;
        per_page: number;
      };
    }, {
      page?: number;
      per_page?: number;
      search?: string;
      partner_id?: number;
      is_active?: boolean;
    }>({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.page) searchParams.append('page', params.page.toString());
        if (params.per_page) searchParams.append('per_page', params.per_page.toString());
        if (params.search) searchParams.append('search', params.search);
        if (params.partner_id) searchParams.append('partner_id', params.partner_id.toString());
        if (params.is_active !== undefined) searchParams.append('is_active', params.is_active.toString());
        
        return `operators${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
      },
      providesTags: [{ type: 'Operator', id: 'LIST' }],
    }),
    
    getOperatorsByPartner: build.query<Operator[], number>({
      query: (partnerId) => `/partners/${partnerId}/operators`,
      providesTags: (result, error, partnerId) => [
        { type: 'Partner', id: partnerId },
      ],
    }),
    createOperator: build.mutation<Operator, { partnerId: number; data: CreateOperatorRequest }>({
      query: ({ partnerId, data }) => ({
        url: `/partners/${partnerId}/operators`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { partnerId }) => [
        { type: 'Partner', id: partnerId },
        { type: 'Operator', id: 'LIST' },
      ],
    }),
    updateOperator: build.mutation<Operator, { id: number; data: UpdateOperatorRequest }>({
      query: ({ id, data }) => ({
        url: `/operators/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Partner', id: 'LIST' },
        { type: 'Operator', id: 'LIST' },
      ],
    }),
    deleteOperator: build.mutation<{ message: string }, { id: number; partnerId: number }>({
      query: ({ id }) => ({
        url: `/operators/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { partnerId }) => [
        { type: 'Partner', id: partnerId },
        { type: 'Operator', id: 'LIST' },
      ],
    }),

    // API для управления привязками операторов к сервисным точкам
    getOperatorServicePoints: build.query<OperatorServicePointsResponse, { operatorId: number; active?: boolean }>({
      query: ({ operatorId, active }) => {
        const params = new URLSearchParams();
        if (active !== undefined) params.append('active', active.toString());
        return `/operators/${operatorId}/service_points${params.toString() ? '?' + params.toString() : ''}`;
      },
      providesTags: (result, error, { operatorId }) => [
        { type: 'OperatorAssignment', id: operatorId },
        { type: 'OperatorAssignment', id: 'LIST' },
      ],
    }),

    assignOperatorToPoint: build.mutation<{ data: OperatorServicePoint; message: string }, { operatorId: number; data: CreateAssignmentRequest }>({
      query: ({ operatorId, data }) => ({
        url: `/operators/${operatorId}/service_points`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { operatorId }) => [
        { type: 'OperatorAssignment', id: operatorId },
        { type: 'OperatorAssignment', id: 'LIST' },
        { type: 'ServicePoint', id: 'LIST' },
      ],
    }),

    bulkAssignOperator: build.mutation<BulkAssignmentResponse, { operatorId: number; data: BulkAssignmentRequest }>({
      query: ({ operatorId, data }) => ({
        url: `/operators/${operatorId}/service_points/bulk_assign`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { operatorId }) => [
        { type: 'OperatorAssignment', id: operatorId },
        { type: 'OperatorAssignment', id: 'LIST' },
        { type: 'ServicePoint', id: 'LIST' },
      ],
    }),

    getOperatorServicePointDetail: build.query<{ data: OperatorServicePointDetailed }, number>({
      query: (assignmentId) => `/operator_service_points/${assignmentId}`,
      providesTags: (result, error, assignmentId) => [
        { type: 'OperatorAssignment', id: assignmentId },
      ],
    }),

    updateOperatorServicePoint: build.mutation<{ data: OperatorServicePoint; message: string }, { assignmentId: number; data: UpdateAssignmentRequest }>({
      query: ({ assignmentId, data }) => ({
        url: `/operator_service_points/${assignmentId}`,
        method: 'PATCH',
        body: { operator_service_point: data },
      }),
      invalidatesTags: (result, error, { assignmentId }) => [
        { type: 'OperatorAssignment', id: assignmentId },
        { type: 'OperatorAssignment', id: 'LIST' },
      ],
    }),

    unassignOperatorFromPoint: build.mutation<{ data: OperatorServicePoint; message: string }, number>({
      query: (assignmentId) => ({
        url: `/operator_service_points/${assignmentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, assignmentId) => [
        { type: 'OperatorAssignment', id: 'LIST' },
        { type: 'ServicePoint', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetAllOperatorsQuery,
  useGetOperatorsByPartnerQuery,
  useCreateOperatorMutation,
  useUpdateOperatorMutation,
  useDeleteOperatorMutation,
  
  // Хуки для управления привязками операторов к сервисным точкам
  useGetOperatorServicePointsQuery,
  useAssignOperatorToPointMutation,
  useBulkAssignOperatorMutation,
  useGetOperatorServicePointDetailQuery,
  useUpdateOperatorServicePointMutation,
  useUnassignOperatorFromPointMutation,
} = operatorsApi;
