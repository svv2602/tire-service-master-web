import { baseApi } from './baseApi';
import { CarBrand, CarBrandFormData } from '../types/car';
import { ApiResponse } from '../types/models';

interface CarBrandFilter {
  query?: string;
  is_active?: boolean;
  page?: number;
  per_page?: number;
}

// Интерфейс для ответа API (как приходит с бэкенда)
interface ApiCarBrandsResponse {
  car_brands: Array<{
    id: number;
    name: string;
    logo: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    models_count?: number;
  }>;
  total_items: number;
}

export const carBrandsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCarBrands: build.query<ApiResponse<CarBrand>, CarBrandFilter>({
      query: (params = {}) => ({
        url: 'car_brands',
        params,
      }),
      transformResponse: (response: ApiCarBrandsResponse) => ({
        data: response.car_brands.map(brand => ({
          ...brand,
          models_count: brand.models_count ?? 0, // Берём из API, если есть
        })),
        meta: {
          current_page: 1,
          total_pages: 1,
          total_count: response.total_items,
          per_page: 25
        }
      }),
      providesTags: (result) =>
        result?.data && Array.isArray(result.data)
          ? [
              ...result.data.map(({ id }) => ({ type: 'CarBrands' as const, id })),
              'CarBrands',
            ]
          : ['CarBrands'],
    }),
    
    getCarBrandById: build.query<CarBrand, string>({
      query: (id: string) => `car_brands/${id}`,
      providesTags: (_result, _err, id) => [
        { type: 'CarBrands' as const, id }
      ],
    }),
    
    createCarBrand: build.mutation<CarBrand, CarBrandFormData>({
      query: (data) => {
        console.log('=== createCarBrand API query ===');
        console.log('Data:', data);
        console.log('Has logo file:', data.logo instanceof File);
        
        // Если есть файл логотипа, используем FormData
        if (data.logo instanceof File) {
          console.log('Using FormData because logo is a File');
          const formData = new FormData();
          formData.append('car_brand[name]', data.name);
          formData.append('car_brand[logo]', data.logo);
          if (data.is_active !== undefined) {
            formData.append('car_brand[is_active]', String(data.is_active));
          }
          return {
            url: 'car_brands',
            method: 'POST',
            body: formData,
          };
        } else {
          // Если нет файла, используем JSON
          console.log('Using JSON because no file upload');
          return {
            url: 'car_brands',
            method: 'POST',
            body: { 
              car_brand: {
                name: data.name,
                is_active: data.is_active
              }
            },
          };
        }
      },
      invalidatesTags: ['CarBrands'],
    }),
    
    updateCarBrand: build.mutation<CarBrand, { id: string; data: Partial<CarBrandFormData> }>({
      query: ({ id, data }) => {
        console.log('=== updateCarBrand API query ===');
        console.log('ID:', id);
        console.log('Data:', data);
        console.log('Has logo file:', data.logo instanceof File);
        
        // Если есть файл логотипа, используем FormData
        if (data.logo instanceof File) {
          console.log('Using FormData because logo is a File');
          const formData = new FormData();
          if (data.name !== undefined) {
            formData.append('car_brand[name]', data.name);
          }
          formData.append('car_brand[logo]', data.logo);
          if (data.is_active !== undefined) {
            formData.append('car_brand[is_active]', String(data.is_active));
          }
          return {
            url: `car_brands/${id}`,
            method: 'PATCH',
            body: formData,
          };
        } else if (data.logo === null) {
          // Если logo === null, значит нужно удалить логотип, используем FormData
          console.log('Using FormData to remove logo (logo === null)');
          const formData = new FormData();
          if (data.name !== undefined) {
            formData.append('car_brand[name]', data.name);
          }
          formData.append('car_brand[logo]', 'null'); // Отправляем строку 'null' для удаления
          if (data.is_active !== undefined) {
            formData.append('car_brand[is_active]', String(data.is_active));
          }
          return {
            url: `car_brands/${id}`,
            method: 'PATCH',
            body: formData,
          };
        } else {
          // Если нет изменений логотипа, используем JSON
          console.log('Using JSON because no logo changes');
          const jsonData: any = {};
          if (data.name !== undefined) {
            jsonData.name = data.name;
          }
          if (data.is_active !== undefined) {
            jsonData.is_active = data.is_active;
          }
          return {
            url: `car_brands/${id}`,
            method: 'PATCH',
            body: { car_brand: jsonData },
          };
        }
      },
      invalidatesTags: (_result, _err, { id }) => [
        { type: 'CarBrands' as const, id },
        'CarBrands',
      ],
    }),
    
    deleteCarBrand: build.mutation<void, string>({
      query: (id: string) => ({
        url: `car_brands/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['CarBrands'],
    }),
    
    toggleCarBrandActive: build.mutation<CarBrand, { id: string; is_active: boolean }>({
      query: ({ id, is_active }) => {
        const formData = new FormData();
        formData.append('car_brand[is_active]', String(is_active));
        return {
          url: `car_brands/${id}`,
          method: 'PATCH',
          body: formData,
          // Не указываем formData: true, так как это не нужно
        };
      },
      invalidatesTags: (_result, _err, { id }) => [
        { type: 'CarBrands' as const, id },
        'CarBrands',
      ],
    }),
  }),
});

// Экспортируем хуки для использования в компонентах
export const {
  useGetCarBrandsQuery,
  useGetCarBrandByIdQuery,
  useCreateCarBrandMutation,
  useUpdateCarBrandMutation,
  useDeleteCarBrandMutation,
  useToggleCarBrandActiveMutation,
} = carBrandsApi;