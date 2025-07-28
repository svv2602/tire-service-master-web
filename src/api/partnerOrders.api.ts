import { baseApi } from './baseApi';
import { Order, OrderFilters, OrderResponse } from '../types/order';

export interface PartnerOrdersResponse extends OrderResponse {
  stats: {
    total_orders: number;
    active_orders: number;
    ready_orders: number;
    delivered_orders: number;
    canceled_orders: number;
    total_revenue: number;
    today_orders: number;
  };
}

export interface PartnerOrdersStats {
  overview: {
    total_orders: number;
    total_revenue: number;
    active_service_points: number;
    total_service_points: number;
  };
  status_breakdown: Record<string, number>;
  period_stats: {
    today: number;
    week: number;
    month: number;
  };
  service_points_stats: Array<{
    id: number;
    name: string;
    city: string;
    total_orders: number;
    active_orders: number;
    revenue: number;
  }>;
  recent_orders: Array<{
    id: number;
    ttn: string;
    customer_name: string;
    status: string;
    status_label: string;
    total_amount: number;
    service_point_name: string;
    created_at: string;
  }>;
}

export const partnerOrdersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Получение заказов партнера
    getPartnerOrders: builder.query<PartnerOrdersResponse, {
      partner_id: number;
      filters?: OrderFilters;
      page?: number;
      per_page?: number;
    }>({
      query: ({ partner_id, filters = {}, page, per_page }) => ({
        url: `partners/${partner_id}/orders`,
        params: { ...filters, page, per_page },
      }),
      providesTags: ['Order'],
    }),

    // Получение детальной информации о заказе партнера
    getPartnerOrderById: builder.query<{ order: Order }, { partner_id: number; id: number }>({
      query: ({ partner_id, id }) => `partners/${partner_id}/orders/${id}`,
      providesTags: (result, error, { id }) => [{ type: 'Order', id }],
    }),

    // Отметить заказ как готовый к выдаче
    markPartnerOrderAsReady: builder.mutation<{ order: Order }, { partner_id: number; id: number }>({
      query: ({ partner_id, id }) => ({
        url: `partners/${partner_id}/orders/${id}/mark_as_ready`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Order', id }, 'Order'],
    }),

    // Отметить заказ как выданный
    markPartnerOrderAsDelivered: builder.mutation<{ order: Order }, { partner_id: number; id: number }>({
      query: ({ partner_id, id }) => ({
        url: `partners/${partner_id}/orders/${id}/mark_as_delivered`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Order', id }, 'Order'],
    }),

    // Отменить заказ
    cancelPartnerOrder: builder.mutation<{ order: Order }, { 
      partner_id: number; 
      id: number; 
      reason?: string;
    }>({
      query: ({ partner_id, id, reason }) => ({
        url: `partners/${partner_id}/orders/${id}/cancel`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Order', id }, 'Order'],
    }),

    // Добавить заметку к заказу
    addPartnerOrderNote: builder.mutation<{ order: Order }, { 
      partner_id: number; 
      id: number; 
      note: string;
    }>({
      query: ({ partner_id, id, note }) => ({
        url: `partners/${partner_id}/orders/${id}/add_note`,
        method: 'POST',
        body: { note },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Order', id }, 'Order'],
    }),

    // Получение детальной статистики партнера
    getPartnerOrdersStats: builder.query<PartnerOrdersStats, number>({
      query: (partner_id) => `partners/${partner_id}/orders/stats`,
      providesTags: ['Order'],
    }),

    // Экспорт заказов в CSV
    exportPartnerOrders: builder.mutation<Blob, {
      partner_id: number;
      filters?: OrderFilters;
    }>({
      query: ({ partner_id, filters = {} }) => ({
        url: `partners/${partner_id}/orders/export`,
        params: filters,
        responseHandler: (response: Response) => response.blob(),
      }),
    }),
  }),
});

export const {
  useGetPartnerOrdersQuery,
  useGetPartnerOrderByIdQuery,
  useMarkPartnerOrderAsReadyMutation,
  useMarkPartnerOrderAsDeliveredMutation,
  useCancelPartnerOrderMutation,
  useAddPartnerOrderNoteMutation,
  useGetPartnerOrdersStatsQuery,
  useExportPartnerOrdersMutation,
} = partnerOrdersApi; 