import { baseApi } from './baseApi';

// Новые типы для единой корзины
export interface UnifiedTireCartItem {
  id: number;
  quantity: number;
  price_at_add: number;
  current_price: number;
  total_price: number;
  formatted_price: string;
  formatted_total: string;
  price_changed: boolean;
  price_change_info?: {
    old_price: number;
    new_price: number;
    change: number;
    change_percent: number;
    increased: boolean;
  };
  product: {
    id: number;
    name: string;
    brand: string;
    model: string;
    size: string;
    season: string;
    image_url?: string;
    product_url?: string;
    in_stock: boolean;
    stock_status: string;
    current_price?: number;
  };
  available: boolean;
  availability_message: string;
}

export interface SupplierGroup {
  id: number;
  name: string;
  items: UnifiedTireCartItem[];
  items_count: number;
  total_amount: number;
}

export interface UnifiedTireCart {
  id: number;
  total_items_count: number;
  total_amount: number;
  formatted_total_amount: string;
  suppliers: SupplierGroup[];
  updated_at: string;
}

export interface SupplierSummary {
  supplier: {
    id: number;
    name: string;
    firm_id: string;
  };
  items_count: number;
  total_amount: number;
  formatted_total: string;
}

export interface UnifiedCartResponse {
  cart: UnifiedTireCart;
}

// Запросы
export interface AddToUnifiedCartRequest {
  supplier_tire_product_id: number;
  quantity: number;
}

export interface UpdateUnifiedCartItemRequest {
  item_id: number;
  quantity: number;
}

export interface CreateOrdersFromCartRequest {
  client_name: string;
  client_phone: string;
  comments_by_supplier?: Record<string, string>;
}

export interface CreatedOrder {
  id: number;
  status: string;
  status_display: string;
  supplier: {
    id: number;
    name: string;
    firm_id: string;
  };
  items_count: number;
  total_amount: number;
  formatted_total: string;
  client_name: string;
  client_phone: string;
  comment?: string;
  created_at: string;
}

export interface CreateOrdersResponse {
  message: string;
  orders: CreatedOrder[];
  cart: UnifiedTireCart;
}

// API для единой корзины
export const unifiedTireCartApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Получить единую корзину с группировкой по поставщикам
    getUnifiedTireCart: builder.query<UnifiedCartResponse, void>({
      query: () => 'unified_tire_cart',
      providesTags: ['UnifiedTireCart'],
      transformResponse: (response: any, meta) => {
        // Если получили успешный ответ, возвращаем как есть
        if (response && typeof response === 'object') {
          return response;
        }
        
        // Fallback для пустой корзины
        return {
          cart: {
            id: 0,
            total_items_count: 0,
            total_amount: 0,
            formatted_total: '0 UAH',
            empty: true,
            suppliers_count: 0,
            items_by_supplier: {},
            updated_at: new Date().toISOString()
          },
          suppliers_summary: {}
        };
      },
      transformErrorResponse: (response) => {
        // Для ошибки 404 (пустая корзина) не показываем ошибку
        if (response.status === 404) {
          return null;
        }
        return response;
      },
    }),

    // Добавить товар в единую корзину
    addToUnifiedCart: builder.mutation<UnifiedCartResponse, AddToUnifiedCartRequest>({
      query: (data) => ({
        url: 'unified_tire_cart/add_item',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['UnifiedTireCart'],
    }),

    // Обновить количество товара в корзине
    updateUnifiedCartItem: builder.mutation<UnifiedCartResponse, UpdateUnifiedCartItemRequest>({
      query: ({ item_id, quantity }) => ({
        url: `unified_tire_cart/update_item/${item_id}`,
        method: 'PUT',
        body: { quantity },
      }),
      invalidatesTags: ['UnifiedTireCart'],
    }),

    // Удалить товар из корзины
    removeUnifiedCartItem: builder.mutation<UnifiedCartResponse, { item_id: number }>({
      query: ({ item_id }) => ({
        url: `unified_tire_cart/remove_item/${item_id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['UnifiedTireCart'],
    }),

    // Очистить всю корзину
    clearUnifiedCart: builder.mutation<UnifiedCartResponse, void>({
      query: () => ({
        url: 'unified_tire_cart/clear',
        method: 'DELETE',
      }),
      invalidatesTags: ['UnifiedTireCart'],
    }),

    // Создать заказы для всех поставщиков
    createOrdersFromUnifiedCart: builder.mutation<CreateOrdersResponse, CreateOrdersFromCartRequest>({
      query: (data) => ({
        url: 'unified_tire_cart/create_orders',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['UnifiedTireCart', 'TireOrder'],
    }),
  }),
});

// Экспорт хуков
export const {
  useGetUnifiedTireCartQuery,
  useAddToUnifiedCartMutation,
  useUpdateUnifiedCartItemMutation,
  useRemoveUnifiedCartItemMutation,
  useClearUnifiedCartMutation,
  useCreateOrdersFromUnifiedCartMutation,
} = unifiedTireCartApi;