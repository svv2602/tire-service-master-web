import { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { baseApi } from './baseApi';
import { Partner, PartnerFormData, PartnerFilter, ApiResponse } from '../types/models';

export const partnersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getPartners: build.query<ApiResponse<Partner>, PartnerFilter>({
      query: (params: PartnerFilter = {}) => ({
        url: 'partners',
        params,
      }),
      providesTags: (result: ApiResponse<Partner> | undefined) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Partners' as const, id })),
              'Partners',
            ]
          : ['Partners'],
    }),
    
    getPartnerById: build.query<Partner, number>({
      query: (id: number) => `partners/${id}`,
      providesTags: (_result: Partner | undefined, _err: FetchBaseQueryError | undefined, id: number) => [
        { type: 'Partners' as const, id }
      ],
    }),
    
    createPartner: build.mutation<Partner, PartnerFormData>({
      query: (data: PartnerFormData) => ({
        url: 'partners',
        method: 'POST',
        body: { partner: data },
      }),
      invalidatesTags: ['Partners'],
    }),
    
    updatePartner: build.mutation<Partner, { id: number; partner: Partial<PartnerFormData> }>({
      query: ({ id, partner }: { id: number; partner: Partial<PartnerFormData> }) => ({
        url: `partners/${id}`,
        method: 'PUT',
        body: { partner },
      }),
      invalidatesTags: (_result: Partner | undefined, _err: FetchBaseQueryError | undefined, { id }: { id: number }) => [
        { type: 'Partners' as const, id },
        'Partners',
      ],
    }),
    
    deletePartner: build.mutation<void, number>({
      query: (id: number) => ({
        url: `partners/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Partners'],
    }),

    togglePartnerActive: build.mutation<Partner, { id: number; isActive: boolean }>({
      query: ({ id, isActive }: { id: number; isActive: boolean }) => ({
        url: `partners/${id}/toggle-active`,
        method: 'PATCH',
        body: { is_active: isActive },
      }),
      invalidatesTags: (_result: Partner | undefined, _err: FetchBaseQueryError | undefined, { id }: { id: number }) => [
        { type: 'Partners' as const, id },
        'Partners',
      ],
    }),
  }),
});

// Экспортируем хуки для использования в компонентах
export const {
  useGetPartnersQuery,
  useGetPartnerByIdQuery,
  useCreatePartnerMutation,
  useUpdatePartnerMutation,
  useDeletePartnerMutation,
  useTogglePartnerActiveMutation,
} = partnersApi; 