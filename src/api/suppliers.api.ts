import { baseApi } from './baseApi';

// Типы для поставщиков
export interface Supplier {
  id: number;
  firm_id: string;
  name: string;
  api_key: string;
  is_active: boolean;
  priority: number;
  last_sync_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SupplierFormData {
  firm_id: string;
  name: string;
  is_active: boolean;
  priority: number;
}

export interface SupplierStatistics {
  products_count: number;
  in_stock_products_count: number;
  last_version: string | null;
  sync_status: 'never' | 'success' | 'failed' | 'syncing';
  last_sync_ago: string | null;
}

export interface SupplierWithStats extends Supplier {
  statistics: SupplierStatistics;
}

export interface SupplierPriceVersion {
  id: number;
  version: string;
  file_checksum: string | null;
  products_count: number;
  processed_count: number;
  errors_count: number;
  processing_time_ms: number | null;
  uploaded_at: string;
  created_at: string;
  updated_at: string;
  success_rate: number;
  error_rate: number;
  processing_time_seconds: number | null;
  status: 'processing' | 'completed' | 'failed';
}

export interface SupplierProduct {
  id: number;
  external_id: string;
  brand: string;
  model: string;
  name: string;
  width: number;
  height: number;
  diameter: string;
  load_index: string | null;
  speed_index: string | null;
  size: string; // tire_size от API
  load_speed_index: string; // объединенные индексы
  season: string;
  price_uah: string | null;
  stock_status: string | null;
  in_stock: boolean;
  description: string | null;
  image_url: string | null;
  product_url: string | null;
  country: string | null;
  year_week: string | null;
  updated_at: string;
  supplier?: {
    id: number;
    name: string;
    firm_id: string;
    priority: number;
    is_active: boolean;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    total_pages: number;
    total_count: number;
    per_page: number;
  };
}

export interface UploadPriceStatistics {
  total_items: number;
  processed_items: number;
  created_items: number;
  updated_items: number;
  error_items: number;
  processing_time_ms: number;
}

export interface NormalizationStatistics {
  total_products: number;
  processed: number;
  normalized_brands: number;
  normalized_countries: number;
  normalized_models: number;
  failed: number;
  processing_time_ms: number;
  summary: string;
  error?: string;
}

export interface UploadPriceResponse {
  success: boolean;
  message: string;
  version?: string;
  processing_started?: boolean;
  supplier_id?: number;
  statistics?: UploadPriceStatistics;
  normalization?: NormalizationStatistics;
}

// API эндпоинты для поставщиков
export const suppliersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Получение списка поставщиков
    getSuppliers: builder.query<PaginatedResponse<SupplierWithStats>, { 
      page?: number; 
      per_page?: number; 
      active_only?: boolean;
      search?: string;
    }>({
      query: (params = {}) => ({
        url: 'suppliers',
        params: {
          page: params.page || 1,
          per_page: params.per_page || 20,
          active_only: params.active_only,
          search: params.search,
        },
      }),
      transformResponse: (response: any) => ({
        data: (response.suppliers || []).map((supplier: any) => ({
          ...supplier,
          statistics: {
            products_count: supplier.products_count || 0,
            in_stock_products_count: supplier.in_stock_products_count || 0,
            last_version: supplier.last_version || null,
            sync_status: supplier.sync_status || 'never',
            last_sync_ago: supplier.last_sync_ago || null,
          },
        })),
        meta: {
          current_page: response.pagination?.current_page || 1,
          total_pages: response.pagination?.total_pages || 1,
          total_count: response.pagination?.total_count || 0,
          per_page: response.pagination?.per_page || 20,
        },
      }),
      providesTags: ['Supplier'],
    }),

    // Получение поставщика по ID
    getSupplierById: builder.query<{ supplier: SupplierWithStats }, number>({
      query: (id) => `suppliers/${id}`,
      transformResponse: (response: any) => ({
        supplier: {
          ...response.supplier,
          statistics: {
            products_count: response.supplier.products_count || 0,
            in_stock_products_count: response.supplier.in_stock_products_count || 0,
            last_version: response.supplier.last_version || null,
            sync_status: response.supplier.sync_status || 'never',
            last_sync_ago: response.supplier.last_sync_ago || null,
          },
        },
      }),
      providesTags: (result, error, id) => [
        { type: 'Supplier', id },
      ],
    }),

    // Создание поставщика
    createSupplier: builder.mutation<{ supplier: Supplier }, SupplierFormData>({
      query: (data) => ({
        url: 'suppliers',
        method: 'POST',
        body: { supplier: data },
      }),
      invalidatesTags: ['Supplier'],
    }),

    // Обновление поставщика
    updateSupplier: builder.mutation<{ supplier: Supplier }, { id: number; data: SupplierFormData }>({
      query: ({ id, data }) => ({
        url: `suppliers/${id}`,
        method: 'PATCH',
        body: { supplier: data },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Supplier', id },
        'Supplier',
      ],
    }),

    // Удаление поставщика
    deleteSupplier: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `suppliers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Supplier'],
    }),

    // Получение товаров поставщика
    getSupplierProducts: builder.query<PaginatedResponse<SupplierProduct>, {
      id: number;
      page?: number;
      per_page?: number;
      in_stock_only?: boolean;
      search?: string;
      updated_after?: string;
      updated_before?: string;
      sort_by?: string;
    }>({
      query: ({ id, ...params }) => ({
        url: `suppliers/${id}/products`,
        params: {
          page: params.page || 1,
          per_page: params.per_page || 20,
          in_stock_only: params.in_stock_only,
          search: params.search,
          updated_after: params.updated_after,
          updated_before: params.updated_before,
          sort_by: params.sort_by,
        },
      }),
      transformResponse: (response: any) => ({
        data: response.products || [],
        meta: {
          current_page: response.pagination?.current_page || 1,
          total_pages: response.pagination?.total_pages || 1,
          total_count: response.pagination?.total_count || 0,
          per_page: response.pagination?.per_page || 20,
        },
      }),
      providesTags: (result, error, { id }) => [
        { type: 'SupplierProducts', id },
      ],
    }),

    // Получение статистики поставщика
    getSupplierStatistics: builder.query<SupplierStatistics, number>({
      query: (id) => `suppliers/${id}/statistics`,
      providesTags: (result, error, id) => [
        { type: 'Supplier', id },
      ],
    }),

    // Получение версий прайсов поставщика
    getSupplierPriceVersions: builder.query<PaginatedResponse<SupplierPriceVersion>, {
      id: number;
      page?: number;
      per_page?: number;
    }>({
      query: ({ id, ...params }) => ({
        url: `suppliers/${id}/price_versions`,
        params: {
          page: params.page || 1,
          per_page: params.per_page || 10,
        },
      }),
      transformResponse: (response: any): PaginatedResponse<SupplierPriceVersion> => ({
        data: response.data || [],
        meta: response.meta || { current_page: 1, total_pages: 1, total_count: 0, per_page: 10 },
      }),
      providesTags: (result, error, { id }) => [
        { type: 'Supplier', id },
        { type: 'SupplierPriceVersions', id },
      ],
    }),

    // Загрузка прайса поставщика администратором
    uploadSupplierPrice: builder.mutation<UploadPriceResponse, {
      supplier_id: number;
      file?: File;
      xml_content?: string;
    }>({
      query: ({ supplier_id, file, xml_content }) => {
        const formData = new FormData();
        
        if (file) {
          formData.append('file', file);
        } else if (xml_content) {
          formData.append('xml_content', xml_content);
        }

        return {
          url: `suppliers/${supplier_id}/admin_upload_price`,
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['Supplier', 'SupplierProducts'],
    }),

    // Переключение активности поставщика
    toggleSupplierActive: builder.mutation<{ supplier: Supplier }, number>({
      query: (id) => ({
        url: `suppliers/${id}/toggle_active`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Supplier', id },
        'Supplier',
      ],
    }),

    // Регенерация API ключа поставщика
    regenerateSupplierApiKey: builder.mutation<{ supplier: Supplier }, number>({
      query: (id) => ({
        url: `suppliers/${id}/regenerate_api_key`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Supplier', id },
      ],
    }),

    // Получение товаров всех поставщиков (для клиентов)
    getAllSupplierProducts: builder.query<PaginatedResponse<SupplierProduct>, {
      page?: number;
      per_page?: number;
      search?: string;
      in_stock_only?: boolean;
      sort_by?: string;
      width?: number;
      height?: number;
      diameter?: string;
      season?: string;
      brand?: string;
    }>({
      query: (params) => ({
        url: 'suppliers/products/all',
        params: {
          page: params.page || 1,
          per_page: params.per_page || 20,
          search: params.search,
          in_stock_only: params.in_stock_only,
          sort_by: params.sort_by,
          width: params.width,
          height: params.height,
          diameter: params.diameter,
          season: params.season,
          brand: params.brand,
        },
      }),
      transformResponse: (response: any) => ({
        data: response.products || [],
        meta: {
          current_page: response.pagination?.current_page || 1,
          total_pages: response.pagination?.total_pages || 1,
          total_count: response.pagination?.total_count || 0,
          per_page: response.pagination?.per_page || 20,
        },
      }),
      providesTags: ['SupplierProducts'],
    }),
  }),
});

// Экспорт хуков
export const {
  useGetSuppliersQuery,
  useGetSupplierByIdQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
  useGetSupplierProductsQuery,
  useGetSupplierStatisticsQuery,
  useGetSupplierPriceVersionsQuery,
  useUploadSupplierPriceMutation,
  useToggleSupplierActiveMutation,
  useRegenerateSupplierApiKeyMutation,
  useGetAllSupplierProductsQuery,
} = suppliersApi;