import { EndpointBuilder } from '@reduxjs/toolkit/dist/query/endpointDefinitions';
import { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { baseApi } from './baseApi';
import { Partner, PartnerFormData } from '../types/partner';

type BuilderType = EndpointBuilder<BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, never, 'api'>;

export const partnersApi = baseApi.injectEndpoints({
  endpoints: (build: BuilderType) => ({
    getPartners: build.query<Partner[], void>({
      query: () => 'partners',
      providesTags: ['Partners'],
    }),
    
    getPartnerById: build.query<Partner, string>({
      query: (id: string) => `partners/${id}`,
      providesTags: (_result: Partner | undefined, _err: FetchBaseQueryError | undefined, id: string) => [
        { type: 'Partners' as const, id }
      ],
    }),
    
    createPartner: build.mutation<Partner, PartnerFormData>({
      query: (data: PartnerFormData) => ({
        url: 'partners',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Partners'],
    }),
    
    updatePartner: build.mutation<Partner, { id: string; data: Partial<PartnerFormData> }>({
      query: ({ id, data }: { id: string; data: Partial<PartnerFormData> }) => ({
        url: `partners/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result: Partner | undefined, _err: FetchBaseQueryError | undefined, { id }: { id: string }) => [
        { type: 'Partners' as const, id },
        'Partners',
      ],
    }),
    
    deletePartner: build.mutation<void, string>({
      query: (id: string) => ({
        url: `partners/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Partners'],
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
} = partnersApi; 