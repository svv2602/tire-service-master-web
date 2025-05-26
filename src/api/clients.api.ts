import { EndpointBuilder } from '@reduxjs/toolkit/dist/query/endpointDefinitions';
import { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { baseApi } from './baseApi';
import { Client, ClientFormData, ClientFilter, ClientCar, ClientCarFormData } from '../types/client';

type BuilderType = EndpointBuilder<BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, never, 'api'>;

export const clientsApi = baseApi.injectEndpoints({
  endpoints: (build: BuilderType) => ({
    // Клиенты
    getClients: build.query<Client[], ClientFilter>({
      query: (filter: ClientFilter) => ({
        url: 'clients',
        params: filter,
      }),
      providesTags: (result: Client[] | undefined) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Clients' as const, id })),
              'Clients',
            ]
          : ['Clients'],
    }),
    
    getClientById: build.query<Client, string>({
      query: (id: string) => `clients/${id}`,
      providesTags: (_result: Client | undefined, _err: FetchBaseQueryError | undefined, id: string) => [
        { type: 'Clients' as const, id }
      ],
    }),
    
    createClient: build.mutation<Client, ClientFormData>({
      query: (data: ClientFormData) => ({
        url: 'clients',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Clients'],
    }),
    
    updateClient: build.mutation<Client, { id: string; data: Partial<ClientFormData> }>({
      query: ({ id, data }: { id: string; data: Partial<ClientFormData> }) => ({
        url: `clients/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result: Client | undefined, _err: FetchBaseQueryError | undefined, { id }: { id: string }) => [
        { type: 'Clients' as const, id },
        'Clients',
      ],
    }),
    
    deleteClient: build.mutation<void, string>({
      query: (id: string) => ({
        url: `clients/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Clients'],
    }),

    // Автомобили клиентов
    getClientCars: build.query<ClientCar[], string>({
      query: (clientId: string) => `clients/${clientId}/cars`,
      providesTags: (result: ClientCar[] | undefined, _err, clientId) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'ClientCars' as const, id })),
              { type: 'ClientCars' as const, id: clientId },
            ]
          : [{ type: 'ClientCars' as const, id: clientId }],
    }),

    addClientCar: build.mutation<ClientCar, { clientId: string; data: ClientCarFormData }>({
      query: ({ clientId, data }) => ({
        url: `clients/${clientId}/cars`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _err, { clientId }) => [
        { type: 'ClientCars' as const, id: clientId },
        'Clients',
      ],
    }),

    updateClientCar: build.mutation<ClientCar, { clientId: string; carId: string; data: Partial<ClientCarFormData> }>({
      query: ({ clientId, carId, data }) => ({
        url: `clients/${clientId}/cars/${carId}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _err, { clientId, carId }) => [
        { type: 'ClientCars' as const, id: carId },
        { type: 'ClientCars' as const, id: clientId },
        'Clients',
      ],
    }),

    deleteClientCar: build.mutation<void, { clientId: string; carId: string }>({
      query: ({ clientId, carId }) => ({
        url: `clients/${clientId}/cars/${carId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _err, { clientId, carId }) => [
        { type: 'ClientCars' as const, id: carId },
        { type: 'ClientCars' as const, id: clientId },
        'Clients',
      ],
    }),
  }),
});

// Экспортируем хуки для использования в компонентах
export const {
  // Клиенты
  useGetClientsQuery,
  useGetClientByIdQuery,
  useCreateClientMutation,
  useUpdateClientMutation,
  useDeleteClientMutation,
  // Автомобили клиентов
  useGetClientCarsQuery,
  useAddClientCarMutation,
  useUpdateClientCarMutation,
  useDeleteClientCarMutation,
} = clientsApi; 