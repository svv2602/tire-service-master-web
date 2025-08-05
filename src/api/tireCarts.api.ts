import { baseApi } from './baseApi';

// Типы для корзины и заказов
export interface TireOrderItem {
  id: number;
  quantity: number;
  price_at_order: number;
  total_price: number;
  supplier_tire_product: {
    id: number;
    name: string;
    brand: string;
    model: string;
    size: string;
    season: string;
    price_uah: number;
    in_stock: boolean;
    description?: string;
  };
  available: boolean;
}

export interface TireCart {
  id: number;
  supplier: {
    id: number;
    name: string;
    contact_info?: string;
  };
  items: TireOrderItem[];
  items_count: number;
  total_amount: number;
  status: 'draft';
  created_at: string;
  updated_at: string;
}

export interface TireOrder {
  id: number;
  status: 'draft' | 'submitted' | 'confirmed' | 'processing' | 'completed' | 'cancelled' | 'archived';
  status_display: string;
  supplier: {
    id: number;
    name: string;
    contact_info?: string;
  };
  items: TireOrderItem[];
  items_count: number;
  total_amount: number;
  client_name: string;
  client_phone: string;
  comment?: string;
  created_at: string;
  updated_at: string;
}

// Запросы для добавления товара в корзину
export interface AddToCartRequest {
  supplier_tire_product_id: number;
  quantity: number;
  supplier_id: number;
}

// Запрос для обновления количества товара
export interface UpdateCartItemRequest {
  quantity: number;
}

// Запрос для создания заказа
export interface CreateOrderRequest {
  client_name: string;
  client_phone: string;
  comment?: string;
}

// API для корзины
export const tireCartsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Получить все корзины пользователя
    getTireCarts: builder.query<TireCart[], void>({
      query: () => 'tire_carts',
      providesTags: ['TireCart'],
    }),

    // Получить конкретную корзину
    getTireCart: builder.query<TireCart, number>({
      query: (id) => `tire_carts/${id}`,
      providesTags: (result, error, id) => [{ type: 'TireCart', id }],
    }),

    // Добавить товар в корзину
    addToCart: builder.mutation<TireCart, AddToCartRequest>({
      query: ({ supplier_tire_product_id, quantity, supplier_id }) => ({
        url: `tire_carts/${supplier_id}/items`,
        method: 'POST',
        body: {
          supplier_tire_product_id,
          quantity,
        },
      }),
      invalidatesTags: ['TireCart'],
    }),

    // Обновить количество товара в корзине
    updateCartItem: builder.mutation<TireCart, { cartId: number; itemId: number; quantity: number }>({
      query: ({ cartId, itemId, quantity }) => ({
        url: `tire_carts/${cartId}/items/${itemId}`,
        method: 'PUT',
        body: { quantity },
      }),
      invalidatesTags: ['TireCart'],
    }),

    // Удалить товар из корзины
    removeCartItem: builder.mutation<void, { cartId: number; itemId: number }>({
      query: ({ cartId, itemId }) => ({
        url: `tire_carts/${cartId}/items/${itemId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['TireCart'],
    }),

    // Очистить корзину
    clearCart: builder.mutation<TireCart, number>({
      query: (cartId) => ({
        url: `tire_carts/${cartId}/clear`,
        method: 'DELETE',
      }),
      invalidatesTags: ['TireCart'],
    }),

    // Удалить корзину
    deleteCart: builder.mutation<void, number>({
      query: (cartId) => ({
        url: `tire_carts/${cartId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['TireCart'],
    }),
  }),
});

// API для заказов
export const tireOrdersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Получить заказы пользователя
    getTireOrders: builder.query<{ orders: TireOrder[]; total: number }, { page?: number; per_page?: number; status?: string }>({
      query: ({ page = 1, per_page = 20, status }) => ({
        url: 'tire_orders',
        params: { page, per_page, status },
      }),
      providesTags: ['TireOrder'],
    }),

    // Получить все заказы (для админов)
    getAllTireOrders: builder.query<{ orders: TireOrder[]; total: number }, { page?: number; per_page?: number; status?: string }>({
      query: ({ page = 1, per_page = 20, status }) => ({
        url: 'tire_orders/all',
        params: { page, per_page, status },
      }),
      providesTags: ['TireOrder'],
    }),

    // Получить конкретный заказ
    getTireOrder: builder.query<TireOrder, number>({
      query: (id) => `tire_orders/${id}`,
      providesTags: (result, error, id) => [{ type: 'TireOrder', id }],
    }),

    // Создать заказы из корзин
    createTireOrders: builder.mutation<{ orders: TireOrder[]; message: string }, CreateOrderRequest>({
      query: (orderData) => ({
        url: 'tire_orders',
        method: 'POST',
        body: orderData,
      }),
      invalidatesTags: ['TireOrder', 'TireCart'],
    }),

    // Отменить заказ
    cancelTireOrder: builder.mutation<TireOrder, number>({
      query: (id) => ({
        url: `tire_orders/${id}/cancel`,
        method: 'PATCH',
      }),
      invalidatesTags: ['TireOrder'],
    }),

    // Архивировать заказ
    archiveTireOrder: builder.mutation<TireOrder, number>({
      query: (id) => ({
        url: `tire_orders/${id}/archive`,
        method: 'PATCH',
      }),
      invalidatesTags: ['TireOrder'],
    }),

    // Подтвердить заказ (админ)
    confirmTireOrder: builder.mutation<TireOrder, number>({
      query: (id) => ({
        url: `tire_orders/${id}/confirm`,
        method: 'PATCH',
      }),
      invalidatesTags: ['TireOrder'],
    }),

    // Взять в обработку (админ)
    startProcessingTireOrder: builder.mutation<TireOrder, number>({
      query: (id) => ({
        url: `tire_orders/${id}/start_processing`,
        method: 'PATCH',
      }),
      invalidatesTags: ['TireOrder'],
    }),

    // Завершить заказ (админ)
    completeTireOrder: builder.mutation<TireOrder, number>({
      query: (id) => ({
        url: `tire_orders/${id}/complete`,
        method: 'PATCH',
      }),
      invalidatesTags: ['TireOrder'],
    }),
  }),
});

// Экспорт хуков
export const {
  useGetTireCartsQuery,
  useGetTireCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
  useClearCartMutation,
  useDeleteCartMutation,
} = tireCartsApi;

export const {
  useGetTireOrdersQuery,
  useGetAllTireOrdersQuery,
  useGetTireOrderQuery,
  useCreateTireOrdersMutation,
  useCancelTireOrderMutation,
  useArchiveTireOrderMutation,
  useConfirmTireOrderMutation,
  useStartProcessingTireOrderMutation,
  useCompleteTireOrderMutation,
} = tireOrdersApi;