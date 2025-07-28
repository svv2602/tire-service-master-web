import { baseApi } from './baseApi';
import { Order, OrderCreateData, OrderFilters, OrderUpdateData, OrderResponse } from '../types/order';

export const ordersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Получение списка заказов
    getOrders: builder.query<OrderResponse, OrderFilters & { page?: number; per_page?: number }>({
      query: (params) => ({
        url: 'orders',
        params,
      }),
      providesTags: ['Order'],
    }),

    // Получение заказов для конкретной сервисной точки
    getOrdersByServicePoint: builder.query<OrderResponse, { 
      service_point_id: number; 
      filters?: OrderFilters; 
      page?: number; 
      per_page?: number 
    }>({
      query: ({ service_point_id, filters = {}, page, per_page }) => ({
        url: `service_points/${service_point_id}/orders`,
        params: { ...filters, page, per_page },
      }),
      providesTags: ['Order'],
    }),

    // Получение детальной информации о заказе
    getOrderById: builder.query<{ order: Order }, number>({
      query: (id) => `orders/${id}`,
      providesTags: (result, error, id) => [{ type: 'Order', id }],
    }),

    // Создание заказа из JSON данных интернет-магазина
    createOrder: builder.mutation<{ order: Order }, { order: OrderCreateData; service_point_id?: number }>({
      query: ({ order, service_point_id }) => ({
        url: service_point_id ? `service_points/${service_point_id}/orders` : 'orders',
        method: 'POST',
        body: { order },
      }),
      invalidatesTags: ['Order'],
    }),

    // Обновление заказа
    updateOrder: builder.mutation<{ order: Order }, { id: number; data: OrderUpdateData }>({
      query: ({ id, data }) => ({
        url: `orders/${id}`,
        method: 'PATCH',
        body: { order: data },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Order', id }, 'Order'],
    }),

    // Удаление заказа
    deleteOrder: builder.mutation<void, number>({
      query: (id) => ({
        url: `orders/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Order'],
    }),

    // Отметить заказ как готовый к выдаче
    markOrderAsReady: builder.mutation<{ order: Order }, number>({
      query: (id) => ({
        url: `orders/${id}/mark_as_ready`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Order', id }, 'Order'],
    }),

    // Отметить заказ как выданный
    markOrderAsDelivered: builder.mutation<{ order: Order }, number>({
      query: (id) => ({
        url: `orders/${id}/mark_as_delivered`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Order', id }, 'Order'],
    }),

    // Отменить заказ
    cancelOrder: builder.mutation<{ order: Order }, { id: number; reason?: string }>({
      query: ({ id, reason }) => ({
        url: `orders/${id}/cancel`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Order', id }, 'Order'],
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useGetOrdersByServicePointQuery,
  useGetOrderByIdQuery,
  useCreateOrderMutation,
  useUpdateOrderMutation,
  useDeleteOrderMutation,
  useMarkOrderAsReadyMutation,
  useMarkOrderAsDeliveredMutation,
  useCancelOrderMutation,
} = ordersApi; 