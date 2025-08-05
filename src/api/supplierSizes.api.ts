import { baseApi } from './baseApi';

// Тип для размера шины из прайсов поставщиков
export interface SupplierTireSize {
  width: number;
  height: number;
  diameter: number;
  display: string;
  size_key: string;
}

// Ответ API для получения размеров по диаметру
export interface SupplierSizesByDiameterResponse {
  success: boolean;
  diameter: string;
  sizes: SupplierTireSize[];
  total_sizes: number;
  data_source: string;
  filter_applied?: boolean;
  original_sizes_count?: number;
  error?: string;
}

// Параметры для фильтрации размеров
export interface SizeFilter {
  width: number;
  height: number;
}

// Параметры запроса размеров по диаметру
export interface GetSizesByDiameterParams {
  diameter: string;
  sizes?: SizeFilter[]; // Фильтр по конкретным размерам
}

// API для работы с размерами шин поставщиков
export const supplierSizesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Получение доступных размеров по диаметру из прайсов поставщиков
    getSupplierSizesByDiameter: builder.query<SupplierSizesByDiameterResponse, GetSizesByDiameterParams>({
      query: ({ diameter, sizes }) => {
        // Нормализуем диаметр (убираем R если есть)
        const normalizedDiameter = diameter.replace(/[^0-9]/g, '');
        
        const url = `supplier_products_search/available_sizes/${normalizedDiameter}`;
        
        // Если есть фильтр по размерам, добавляем параметры
        if (sizes && sizes.length > 0) {
          const params = new URLSearchParams();
          params.append('sizes', JSON.stringify(sizes));
          return `${url}?${params.toString()}`;
        }
        
        return url;
      },
      providesTags: (result, error, { diameter, sizes }) => {
        const baseTag = { type: 'SupplierSizes' as const, id: diameter };
        const filterTag = sizes?.length 
          ? { type: 'SupplierSizes' as const, id: `${diameter}:filtered` }
          : baseTag;
        
        return [baseTag, filterTag, 'SupplierSizes'];
      },
      transformResponse: (response: SupplierSizesByDiameterResponse) => {
        // Сортируем размеры по ширине и высоте
        if (response.success && response.sizes) {
          response.sizes.sort((a, b) => {
            if (a.width !== b.width) return a.width - b.width;
            return a.height - b.height;
          });
        }
        return response;
      },
    }),
  }),
  overrideExisting: false,
});

// Экспорт хуков
export const {
  useGetSupplierSizesByDiameterQuery,
  useLazyGetSupplierSizesByDiameterQuery,
} = supplierSizesApi;