import { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { baseApi } from './baseApi';
import { Client, ClientCar, ClientCarFormData } from '../types/client';
import { ApiResponse, ClientFilter } from '../types/models';

// Типы для форм
interface ClientFormData {
  first_name: string;
  last_name: string;
  middle_name?: string;
  phone?: string;
  email?: string;
  is_active?: boolean;
}

// Тип для создания клиента (соответствует ожиданиям бэкенда)
interface ClientCreateData {
  user: {
    first_name: string;
    last_name: string;
    middle_name?: string;
    phone?: string;
    email?: string;
    password: string;
    password_confirmation: string;
  };
  client: {
    preferred_notification_method?: string;
    marketing_consent?: boolean;
  };
}

// Тип для обновления клиента (соответствует ожиданиям бэкенда)
interface ClientUpdateData {
  user?: {
    first_name?: string;
    last_name?: string;
    middle_name?: string;
    phone?: string;
    email?: string;
    is_active?: boolean;
  };
  client?: {
    preferred_notification_method?: string;
    marketing_consent?: boolean;
  };
}

export const clientsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getClients: builder.query<ApiResponse<Client>, ClientFilter>({
      query: (params) => ({
        url: 'clients',
        method: 'GET',
        params,
      }),
      providesTags: (result, error, arg) => {
        if (result?.data && Array.isArray(result.data)) {
          return [
            ...result.data.map(({ id }) => ({ type: 'Client' as const, id })),
            'Client',
          ];
        }
        return ['Client'];
      },
    }),

    getClientById: builder.query<Client, string>({
      query: (id) => ({
        url: `clients/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Client', id }],
    }),

    createClient: builder.mutation<Client, ClientCreateData>({
      query: (client) => ({
        url: 'clients',
        method: 'POST',
        body: client,
      }),
      invalidatesTags: ['Client'],
    }),

    updateClient: builder.mutation<Client, { id: string; client: ClientUpdateData }>({
      query: ({ id, client }) => ({
        url: `clients/${id}`,
        method: 'PUT',
        body: client,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Client', id },
        'Client',
      ],
    }),

    deleteClient: builder.mutation<void, string>({
      query: (id) => ({
        url: `clients/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Client', id },
        'Client',
      ],
    }),

    getClientCars: builder.query<ClientCar[], string>({
      query: (clientId: string) => `clients/${clientId}/cars`,
      providesTags: (result: ClientCar[] | undefined, _err: FetchBaseQueryError | undefined, clientId: string) => {
        if (result && Array.isArray(result)) {
          return [
            ...result.map(({ id }) => ({ type: 'ClientCars' as const, id })),
            { type: 'ClientCars' as const, id: clientId },
            'ClientCars',
          ];
        }
        return [{ type: 'ClientCars' as const, id: clientId }, 'ClientCars'];
      },
    }),

    getClientCarById: builder.query<ClientCar, { clientId: string; carId: string }>({
      query: ({ clientId, carId }: { clientId: string; carId: string }) => `clients/${clientId}/cars/${carId}`,
      providesTags: (_result: ClientCar | undefined, _err: FetchBaseQueryError | undefined, args: { clientId: string; carId: string }) => [
        { type: 'ClientCars' as const, id: args.carId },
        { type: 'ClientCars' as const, id: args.clientId },
        'ClientCars',
      ],
    }),

    createClientCar: builder.mutation<ClientCar, { clientId: string; data: { car: ClientCarFormData } }>({
      query: ({ clientId, data }: { clientId: string; data: { car: ClientCarFormData } }) => ({
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
      { clientId: string; carId: string; data: { car: Partial<ClientCarFormData> } }
    >({
      query: ({ clientId, carId, data }: { clientId: string; carId: string; data: { car: Partial<ClientCarFormData> } }) => ({
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

    // Получение автомобилей текущего авторизованного клиента
    getMyClientCars: builder.query<ClientCar[], void>({
      query: () => 'auth/me/cars',
      providesTags: (result: ClientCar[] | undefined) => {
        if (result && Array.isArray(result)) {
          return [
            ...result.map(({ id }) => ({ type: 'ClientCars' as const, id })),
            { type: 'ClientCars' as const, id: 'MY_CARS' },
            'ClientCars',
          ];
        }
        return [{ type: 'ClientCars' as const, id: 'MY_CARS' }, 'ClientCars'];
      },
    }),

    // Создание автомобиля для текущего клиента
    createMyClientCar: builder.mutation<ClientCar, ClientCarFormData>({
      query: (data: ClientCarFormData) => ({
        url: 'auth/me/cars',
        method: 'POST',
        body: { car: data },
      }),
      invalidatesTags: () => [
        { type: 'ClientCars' as const, id: 'MY_CARS' },
        'ClientCars',
      ],
    }),

    // Обновление автомобиля текущего клиента
    updateMyClientCar: builder.mutation<ClientCar, { carId: string; data: Partial<ClientCarFormData> }>({
      query: ({ carId, data }: { carId: string; data: Partial<ClientCarFormData> }) => ({
        url: `auth/me/cars/${carId}`,
        method: 'PATCH',
        body: { car: data },
      }),
      invalidatesTags: (_result: ClientCar | undefined, _err: FetchBaseQueryError | undefined, args: { carId: string }) => [
        { type: 'ClientCars' as const, id: args.carId },
        { type: 'ClientCars' as const, id: 'MY_CARS' },
        'ClientCars',
      ],
    }),

    // Удаление автомобиля текущего клиента
    deleteMyClientCar: builder.mutation<void, string>({
      query: (carId: string) => ({
        url: `auth/me/cars/${carId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result: void | undefined, _err: FetchBaseQueryError | undefined, carId: string) => [
        { type: 'ClientCars' as const, id: carId },
        { type: 'ClientCars' as const, id: 'MY_CARS' },
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
  useGetMyClientCarsQuery,
  useCreateMyClientCarMutation,
  useUpdateMyClientCarMutation,
  useDeleteMyClientCarMutation,
} = clientsApi; 