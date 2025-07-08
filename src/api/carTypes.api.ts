import { baseApi } from './baseApi';
import { CarType } from '../types/car';

export const carTypesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCarTypes: builder.query<CarType[], { locale?: string }>({
      query: ({ locale = 'ru' } = {}) => ({
        url: 'car_types',
        headers: {
          'Accept-Language': locale,
        },
      }),
      providesTags: ['CarType'],
      transformResponse: (response: any[]) => {
        // Используем локализованные названия если они есть
        return response.map(carType => ({
          ...carType,
          name: carType.localized_name || carType.name,
          description: carType.localized_description || carType.description,
        }));
      },
    }),
    
    getCarTypeById: builder.query<CarType, { id: string; locale?: string }>({
      query: ({ id, locale = 'ru' }) => ({
        url: `car_types/${id}`,
        headers: {
          'Accept-Language': locale,
        },
      }),
      providesTags: (_result, _error, { id }) => [{ type: 'CarType', id }],
      transformResponse: (response: any) => ({
        ...response,
        name: response.localized_name || response.name,
        description: response.localized_description || response.description,
      }),
    }),
    
    createCarType: builder.mutation<CarType, Partial<CarType>>({
      query: (carType) => ({
        url: 'car_types',
        method: 'POST',
        body: carType,
      }),
      invalidatesTags: ['CarType'],
    }),
    
    updateCarType: builder.mutation<CarType, { id: string; carType: Partial<CarType> }>({
      query: ({ id, carType }) => ({
        url: `car_types/${id}`,
        method: 'PUT',
        body: carType,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'CarType', id },
        { type: 'CarType', id: 'LIST' },
      ],
    }),
    
    deleteCarType: builder.mutation<void, string>({
      query: (id) => ({
        url: `car_types/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['CarType'],
    }),
  }),
});

export const {
  useGetCarTypesQuery,
  useGetCarTypeByIdQuery,
  useCreateCarTypeMutation,
  useUpdateCarTypeMutation,
  useDeleteCarTypeMutation,
} = carTypesApi; 