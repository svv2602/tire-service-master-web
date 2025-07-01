import { baseApi } from './baseApi';
import type { User } from '../types/user';

export interface OperatorUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  is_active: boolean;
}

export interface Operator {
  id: number;
  user: OperatorUser;
  position: string;
  access_level: number;
  is_active: boolean;
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

export const operatorsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
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
      ],
    }),
    deleteOperator: build.mutation<{ message: string }, { id: number; partnerId: number }>({
      query: ({ id }) => ({
        url: `/operators/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { partnerId }) => [
        { type: 'Partner', id: partnerId },
      ],
    }),
  }),
});

export const {
  useGetOperatorsByPartnerQuery,
  useCreateOperatorMutation,
  useUpdateOperatorMutation,
  useDeleteOperatorMutation,
} = operatorsApi;
