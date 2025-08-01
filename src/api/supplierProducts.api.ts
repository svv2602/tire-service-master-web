import { baseApi } from './baseApi';

// Типы для поиска товаров поставщиков
export interface SupplierProductSearchParams {
  brand?: string;
  season?: 'winter' | 'summer' | 'all_season';
  width?: number;
  height?: number;
  diameter?: string;
  min_price?: number;
  max_price?: number;
  in_stock_only?: boolean;
  limit?: number;
  offset?: number;
}

export interface SupplierInfo {
  id: number;
  name: string;
  priority: number;
}

export interface SupplierProduct {
  id: number;
  external_id: string;
  supplier: SupplierInfo;
  brand: string;
  model: string;
  name: string;
  size: string;
  load_speed_index: string;
  season: string;
  season_display: string;
  price_uah: string;
  formatted_price: string;
  stock_status: string;
  in_stock: boolean;
  image_url?: string;
  product_url?: string;
  country?: string;
  year_week?: string;
}

export interface TireGroup {
  tire_key: string;
  tire_params: {
    brand: string;
    model: string;
    width: number;
    height: number;
    diameter: string;
    load_index: string;
    speed_index: string;
    season: string;
  };
  title: string;
  suppliers_count: number;
  products_count: number;
  price_range: {
    min: string;
    max: string;
  };
  products: SupplierProduct[];
}

export interface GroupedSearchResponse {
  success: boolean;
  groups: TireGroup[];
  total_groups: number;
  total_products: number;
  show_all_offers: boolean;
}

export interface SimpleSearchResponse {
  success: boolean;
  products: SupplierProduct[];
  total: number;
  page_info: {
    limit: number;
    offset: number;
    has_more: boolean;
  };
}

export interface SearchFilters {
  brands: string[];
  seasons: Array<{
    value: string;
    label: string;
  }>;
  diameters: number[];
  size_ranges: {
    width: { min: number; max: number };
    height: { min: number; max: number };
  };
}

export interface ProductDetails extends SupplierProduct {
  description?: string;
  raw_data?: any;
  created_at: string;
  updated_at: string;
}

// API эндпоинты
export const supplierProductsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Поиск с группировкой для аккордиона
    searchSupplierProductsGrouped: builder.mutation<GroupedSearchResponse, SupplierProductSearchParams>({
      query: (params) => ({
        url: 'supplier_products_search/grouped',
        method: 'POST',
        body: params,
      }),
      invalidatesTags: ['SupplierProducts'],
    }),

    // Обычный поиск товаров
    searchSupplierProducts: builder.mutation<SimpleSearchResponse, SupplierProductSearchParams>({
      query: (params) => ({
        url: 'supplier_products_search',
        method: 'POST',
        body: params,
      }),
      invalidatesTags: ['SupplierProducts'],
    }),

    // Получение доступных фильтров
    getSupplierProductsFilters: builder.query<SearchFilters, void>({
      query: () => 'supplier_products_search/filters',
      providesTags: ['SupplierFilters'],
    }),

    // Детали конкретного товара
    getSupplierProductDetails: builder.query<{ product: ProductDetails }, number>({
      query: (productId) => `supplier_products_search/product/${productId}`,
      providesTags: (result, error, productId) => [
        { type: 'SupplierProduct', id: productId },
      ],
    }),
  }),
});

// Экспорт хуков
export const {
  useSearchSupplierProductsGroupedMutation,
  useSearchSupplierProductsMutation,
  useGetSupplierProductsFiltersQuery,
  useGetSupplierProductDetailsQuery,
} = supplierProductsApi;