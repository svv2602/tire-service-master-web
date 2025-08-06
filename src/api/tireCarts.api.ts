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

export interface TireCartItem {
  id: number;
  quantity: number;
  current_price: number;
  supplier_tire_product: {
    id: number;
    name: string;
    brand: string;
    model: string;
    size: string;
    season: string;
    supplier: {
      id: number;
      name: string;
    };
  };
}

export interface TireCart {
  id: number;
  user?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
  };
  tire_cart_items: TireCartItem[];
  total_items_count: number;
  total_amount: number;
  suppliers?: Array<{
    id: number;
    name: string;
  }>;
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
    firm_id?: string;
  };
  user?: {
    id: number;
    full_name: string;
    email: string;
    phone?: string;
  };
  items: TireOrderItem[];
  items_count: number;
  total_amount: number;
  formatted_total: string;
  client_name: string;
  client_phone: string;
  comment?: string;
  created_at: string;
  updated_at: string;
  can_be_cancelled?: boolean;
  can_be_archived?: boolean;
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
      transformResponse: (response: { carts: TireCart[]; total_carts: number; total_items: number }) => {
        return response.carts || [];
      },
      providesTags: ['TireCart'],
    }),

    // Получить все корзины (для админов) - используем unified_tire_cart
    getAllTireCarts: builder.query<{ carts: TireCart[]; pagination: { total_count: number; current_page: number; per_page: number; total_pages: number } }, { page?: number; per_page?: number; search?: string }>({
      query: ({ page = 1, per_page = 20, search }) => ({
        url: 'unified_tire_cart',
        params: { page, per_page, search },
      }),
      transformResponse: (response: any, meta, arg) => {
        // Получаем параметры из аргументов запроса
        const { page = 1, per_page = 20 } = arg;
        
        // Адаптируем ответ unified_tire_cart под формат getAllTireCarts
        const unifiedCart = response.cart;
        
        if (!unifiedCart) {
          return {
            carts: [],
            pagination: {
              total_count: 0,
              current_page: page,
              per_page: per_page,
              total_pages: 0
            }
          };
        }
        
        // Создаем общую корзину с информацией о пользователе
        // Информация о пользователе должна быть получена из auth state или отдельным запросом
        const cart: any = {
          id: unifiedCart.id,
          user: {
            id: 35, // TODO: получать динамически из auth state
            first_name: "Тестовый",
            last_name: "Админ", 
            email: "admin@test.com",
            phone: "+380672220000"
          },
          tire_cart_items: [],
          total_items_count: unifiedCart.total_items_count || 0,
          total_amount: unifiedCart.total_amount || 0,
          suppliers: unifiedCart.suppliers?.map((supplier: any) => ({
            id: supplier.id,
            name: supplier.name,
            firm_id: supplier.firm_id
          })) || [],
          created_at: unifiedCart.updated_at,
          updated_at: unifiedCart.updated_at
        };

        // Собираем все товары из всех поставщиков
        unifiedCart.suppliers?.forEach((supplier: any) => {
          if (supplier.items) {
            cart.tire_cart_items.push(...supplier.items.map((item: any) => ({
              id: item.id,
              quantity: item.quantity,
              price_at_add: item.price_at_add,
              current_price: item.current_price,
              total_price: item.total_price,
              formatted_price: item.formatted_price,
              formatted_total: item.formatted_total,
              price_changed: item.price_changed,
              price_change_info: item.price_change_info,
              available: item.available,
              availability_message: item.availability_message,
              supplier_id: supplier.id,
              supplier_name: supplier.name,
              // Правильно структурируем информацию о товаре согласно интерфейсу TireCartItem
              supplier_tire_product: {
                id: item.product?.id || 0,
                name: item.product?.name || 'Товар не найден',
                brand: item.product?.brand || 'Неизвестный бренд',
                model: item.product?.model || 'Неизвестная модель',
                size: item.product?.size || 'Размер не указан',
                season: item.product?.season || 'unknown',
                supplier: {
                  id: supplier.id,
                  name: supplier.name
                }
              }
            })));
          }
        });
        
        return {
          carts: [cart], // Возвращаем массив с одной корзиной
          pagination: {
            total_count: 1,
            current_page: page,
            per_page: per_page,
            total_pages: 1
          }
        };
      },
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
    getAllTireOrders: builder.query<{ orders: TireOrder[]; pagination: { total_count: number; current_page: number; per_page: number; total_pages: number } }, { page?: number; per_page?: number; status?: string; search?: string }>({
      query: ({ page = 1, per_page = 20, status, search }) => ({
        url: 'tire_orders/all',
        params: { page, per_page, status, search },
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
  useGetAllTireCartsQuery,
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