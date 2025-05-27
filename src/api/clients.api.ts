import { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { baseApi } from './baseApi';
import { Client, ClientCar, ClientFilter, ApiResponse } from '../types/models';

// Типы для форм
interface ClientFormData {
  first_name: string;
  last_name: string;
  middle_name?: string;
  phone?: string;
  email?: string;
  is_active?: boolean;
}

interface ClientCarFormData {
  brand: string;
  model: string;
  year: number;
  vin: string;
  license_plate: string;
}

export const clientsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getClients: builder.query<ApiResponse<Client>, ClientFilter>({
      query: (params) => ({
        url: 'clients',
        method: 'GET',
        params,
      }),
      providesTags: ['Client'],
    }),

    getClientById: builder.query<Client, string>({
      query: (id) => ({
        url: `clients/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Client', id }],
    }),

    createClient: builder.mutation<Client, ClientFormData>({
      query: (client) => ({
        url: 'clients',
        method: 'POST',
        body: client,
      }),
      invalidatesTags: ['Client'],
    }),

    updateClient: builder.mutation<Client, { id: string; client: Partial<ClientFormData> }>({
      query: ({ id, client }) => ({
        url: `clients/${id}`,
        method: 'PUT',
        body: client,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Client', id }],
    }),

    deleteClient: builder.mutation<void, string>({
      query: (id) => ({
        url: `clients/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Client'],
    }),

    getClientCars: builder.query<ClientCar[], string>({
      query: (clientId: string) => `clients/${clientId}/cars`,
      providesTags: (result: ClientCar[] | undefined, _err: FetchBaseQueryError | undefined, clientId: string) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'ClientCars' as const, id })),
              { type: 'ClientCars' as const, id: clientId },
              'ClientCars',
            ]
          : [{ type: 'ClientCars' as const, id: clientId }, 'ClientCars'],
    }),

    getClientCarById: builder.query<ClientCar, { clientId: string; carId: string }>({
      query: ({ clientId, carId }: { clientId: string; carId: string }) => `clients/${clientId}/cars/${carId}`,
      providesTags: (_result: ClientCar | undefined, _err: FetchBaseQueryError | undefined, args: { clientId: string; carId: string }) => [
        { type: 'ClientCars' as const, id: args.carId },
        { type: 'ClientCars' as const, id: args.clientId },
        'ClientCars',
      ],
    }),

    createClientCar: builder.mutation<ClientCar, { clientId: string; data: ClientCarFormData }>({
      query: ({ clientId, data }: { clientId: string; data: ClientCarFormData }) => ({
        url: `clients/${clientId}/cars`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result: ClientCar | undefined, _err: FetchBaseQueryError | undefined, args: { clientId: string }) => [
        { type: 'ClientCars' as const, id: args.clientId },
        'ClientCars',
      ],
    }),

    updateClientCar: builder.mutation<
      ClientCar,
      { clientId: string; carId: string; data: Partial<ClientCarFormData> }
    >({
      query: ({ clientId, carId, data }: { clientId: string; carId: string; data: Partial<ClientCarFormData> }) => ({
        url: `clients/${clientId}/cars/${carId}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result: ClientCar | undefined, _err: FetchBaseQueryError | undefined, args: { clientId: string; carId: string }) => [
        { type: 'ClientCars' as const, id: args.carId },
        { type: 'ClientCars' as const, id: args.clientId },
        'ClientCars',
      ],
    }),

    deleteClientCar: builder.mutation<void, { clientId: string; carId: string }>({
      query: ({ clientId, carId }: { clientId: string; carId: string }) => ({
        url: `clients/${clientId}/cars/${carId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result: void | undefined, _err: FetchBaseQueryError | undefined, args: { clientId: string }) => [
        { type: 'ClientCars' as const, id: args.clientId },
        'ClientCars',
      ],
    }),
  }),
});

export const {
  useGetClientsQuery,
  useGetClientByIdQuery,
  useCreateClientMutation,
  useUpdateClientMutation,
  useDeleteClientMutation,
  useGetClientCarsQuery,
  useGetClientCarByIdQuery,
  useCreateClientCarMutation,
  useUpdateClientCarMutation,
  useDeleteClientCarMutation,
} = clientsApi; 