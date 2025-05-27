import { baseApi } from './baseApi';
import { Car } from '../types/car';

export const carsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCars: build.query<Car[], void>({
      query: () => 'cars',
      providesTags: (result) => {
        if (result && Array.isArray(result)) {
          return [
            ...result.map(({ id }) => ({ type: 'ClientCars' as const, id })),
            { type: 'ClientCars', id: 'LIST' },
          ];
        }
        return [{ type: 'ClientCars', id: 'LIST' }];
      },
    }),
    
    getCarById: build.query<Car, string>({
      query: (id) => `cars/${id}`,
      providesTags: (_result, _err, id) => [{ type: 'ClientCars', id }],
    }),
    
    createCar: build.mutation<Car, Partial<Car>>({
      query: (data) => ({
        url: 'cars',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ClientCars'],
    }),
    
    updateCar: build.mutation<Car, { id: string; data: Partial<Car> }>({
      query: ({ id, data }) => ({
        url: `cars/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _err, { id }) => [{ type: 'ClientCars', id }, 'ClientCars'],
    }),
    
    deleteCar: build.mutation<void, string>({
      query: (id) => ({
        url: `cars/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ClientCars'],
    }),
  }),
});

export const {
  useGetCarsQuery,
  useGetCarByIdQuery,
  useCreateCarMutation,
  useUpdateCarMutation,
  useDeleteCarMutation,
} = carsApi; 