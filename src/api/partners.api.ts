import { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { baseApi } from './baseApi';
import { 
  Partner, 
  PartnerFormData, 
  PartnerFilter, 
  ApiResponse,
} from '../types/models';
import { transformPaginatedResponse } from './apiUtils';

export const partnersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getPartners: build.query<ApiResponse<Partner>, PartnerFilter>({
      query: (params = {}) => ({
        url: 'partners',
        params,
      }),
      transformResponse: (response: ApiResponse<Partner>) => transformPaginatedResponse(response),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }: Partner) => ({ type: 'Partners' as const, id })),
              'Partners',
            ]
          : ['Partners'],
    }),
    
    getPartnerById: build.query<Partner, number>({
      query: (id) => `partners/${id}`,
      providesTags: (_result, _err, id) => [{ type: 'Partners' as const, id }],
    }),
    
    createPartner: build.mutation<Partner, { partner: PartnerFormData }>({
      query: (data) => ({
        url: 'partners',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Partners'],
    }),
    
    updatePartner: build.mutation<Partner, { id: number; partner: Partial<PartnerFormData> }>({
      query: ({ id, partner }) => ({
        url: `partners/${id}`,
        method: 'PATCH',
        body: { partner },
      }),
      invalidatesTags: (_result, _err, { id }) => [
        { type: 'Partners' as const, id },
        'Partners',
      ],
    }),
    
    deletePartner: build.mutation<void, number>({
      query: (id) => ({
        url: `partners/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Partners'],
    }),

    togglePartnerActive: build.mutation<Partner, { id: number; isActive: boolean }>({
      query: ({ id, isActive }) => ({
        url: `partners/${id}/toggle_active`,
        method: 'PATCH',
        body: { partner: { is_active: isActive } },
      }),
      invalidatesTags: (_result, _err, { id }) => [
        { type: 'Partners' as const, id },
        'Partners',
      ],
    }),
    
    // Создание тестового партнера
    createTestPartner: build.mutation<Partner, void>({
      query: () => ({
        url: 'partners/create_test',
        method: 'POST',
      }),
      invalidatesTags: ['Partners'],
    }),
  }),
});

export const {
  useGetPartnersQuery,
  useGetPartnerByIdQuery,
  useCreatePartnerMutation,
  useUpdatePartnerMutation,
  useDeletePartnerMutation,
  useTogglePartnerActiveMutation,
  useCreateTestPartnerMutation,
} = partnersApi; 