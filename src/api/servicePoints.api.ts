import { EndpointBuilder } from '@reduxjs/toolkit/dist/query/endpointDefinitions';
import { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { baseApi } from './baseApi';
import { ServicePoint, ServicePointFormData } from '../types/servicePoint';

type BuilderType = EndpointBuilder<BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, never, 'api'>;

export const servicePointsApi = baseApi.injectEndpoints({
  endpoints: (build: BuilderType) => ({
    getServicePoints: build.query<ServicePoint[], void>({
      query: () => 'service-points',
      providesTags: ['ServicePoints'],
    }),

    getServicePointsByPartnerId: build.query<ServicePoint[], string>({
      query: (partnerId: string) => `service-points?partnerId=${partnerId}`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'ServicePoints' as const, id })),
              'ServicePoints',
            ]
          : ['ServicePoints'],
    }),
    
    getServicePointById: build.query<ServicePoint, string>({
      query: (id: string) => `service-points/${id}`,
      providesTags: (_result: ServicePoint | undefined, _err: FetchBaseQueryError | undefined, id: string) => [
        { type: 'ServicePoints' as const, id }
      ],
    }),
    
    createServicePoint: build.mutation<ServicePoint, ServicePointFormData>({
      query: (data: ServicePointFormData) => ({
        url: 'service-points',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ServicePoints'],
    }),
    
    updateServicePoint: build.mutation<ServicePoint, { id: string; data: Partial<ServicePointFormData> }>({
      query: ({ id, data }: { id: string; data: Partial<ServicePointFormData> }) => ({
        url: `service-points/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result: ServicePoint | undefined, _err: FetchBaseQueryError | undefined, { id }: { id: string }) => [
        { type: 'ServicePoints' as const, id },
        'ServicePoints',
      ],
    }),
    
    deleteServicePoint: build.mutation<void, string>({
      query: (id: string) => ({
        url: `service-points/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ServicePoints'],
    }),
  }),
});

// Экспортируем хуки для использования в компонентах
export const {
  useGetServicePointsQuery,
  useGetServicePointsByPartnerIdQuery,
  useGetServicePointByIdQuery,
  useCreateServicePointMutation,
  useUpdateServicePointMutation,
  useDeleteServicePointMutation,
} = servicePointsApi; 