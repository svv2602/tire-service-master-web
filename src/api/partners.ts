import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';
import type { Partner, PartnerFormData } from '../types/models';

export const partnersApi = createApi({
  reducerPath: 'partnersApi',
  baseQuery,
  tagTypes: ['Partners'],
  endpoints: (builder) => ({
    getPartners: builder.query<Partner[], void>({
      query: () => 'partners',
      providesTags: ['Partners'],
    }),
    getPartner: builder.query<Partner, number>({
      query: (id) => `partners/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Partners', id }],
    }),
    createPartner: builder.mutation<Partner, PartnerFormData>({
      query: (data) => ({
        url: 'partners',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Partners'],
    }),
    updatePartner: builder.mutation<Partner, { id: number; data: Partial<PartnerFormData> }>({
      query: ({ id, data }) => ({
        url: `partners/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Partners', id }],
    }),
    deletePartner: builder.mutation<void, number>({
      query: (id) => ({
        url: `partners/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Partners'],
    }),
    toggleActive: builder.mutation<Partner, number>({
      query: (id) => ({
        url: `partners/${id}/toggle_active`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Partners', id }],
    }),
  }),
});

export const {
  useGetPartnersQuery,
  useGetPartnerQuery,
  useCreatePartnerMutation,
  useUpdatePartnerMutation,
  useDeletePartnerMutation,
  useToggleActiveMutation,
} = partnersApi;