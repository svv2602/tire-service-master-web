import { baseApi } from './baseApi';
import { CarType } from '../types/car';

export const carTypesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCarTypes: builder.query<CarType[], void>({
      query: () => 'car_types',
      providesTags: ['CarType'],
    }),
    
    getCarTypeById: builder.query<CarType, string>({
      query: (id) => `car_types/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'CarType', id }],
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