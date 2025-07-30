import { baseApi } from './baseApi';
import {
  PartnerApplication,
  PartnerApplicationFormData,
  PartnerApplicationsResponse,
  PartnerApplicationResponse,
  CreatePartnerApplicationResponse,
  UpdateApplicationStatusResponse,
  UpdateApplicationStatusData,
  UpdateApplicationNotesData,
  GetPartnerApplicationsParams,
  PartnerApplicationsStatsResponse,
} from '../types/PartnerApplication';

// API для работы с заявками партнеров
export const partnerApplicationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Получение списка заявок (для админов/менеджеров)
    getPartnerApplications: builder.query<
      PartnerApplicationsResponse,
      GetPartnerApplicationsParams
    >({
      query: (params) => ({
        url: 'partner_applications',
        params: {
          page: params.page || 1,
          per_page: params.per_page || 10,
          ...(params.status && { status: params.status }),
          ...(params.region_id && { region_id: params.region_id }),
          ...(params.query && { query: params.query }),
          ...(params.sort_by && { sort_by: params.sort_by }),
          ...(params.sort_direction && { sort_direction: params.sort_direction }),
        },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'PartnerApplication' as const, id })),
              { type: 'PartnerApplication', id: 'LIST' },
            ]
          : [{ type: 'PartnerApplication', id: 'LIST' }],
    }),

    // Получение конкретной заявки по ID
    getPartnerApplicationById: builder.query<PartnerApplicationResponse, number>({
      query: (id) => ({
        url: `partner_applications/${id}`,
      }),
      providesTags: (result, error, id) => [{ type: 'PartnerApplication', id }],
    }),

    // Создание новой заявки (публичный endpoint)
    createPartnerApplication: builder.mutation<
      CreatePartnerApplicationResponse,
      PartnerApplicationFormData
    >({
      query: (data) => ({
        url: 'partner_applications',
        method: 'POST',
        body: { partner_application: data },
      }),
      invalidatesTags: [{ type: 'PartnerApplication', id: 'LIST' }],
    }),

    // Обновление заметок администратора
    updatePartnerApplicationNotes: builder.mutation<
      UpdateApplicationStatusResponse,
      UpdateApplicationNotesData
    >({
      query: ({ id, admin_notes }) => ({
        url: `partner_applications/${id}`,
        method: 'PATCH',
        body: { partner_application: { admin_notes } },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'PartnerApplication', id },
        { type: 'PartnerApplication', id: 'LIST' },
      ],
    }),

    // Изменение статуса заявки
    updatePartnerApplicationStatus: builder.mutation<
      UpdateApplicationStatusResponse,
      UpdateApplicationStatusData
    >({
      query: ({ id, status, admin_notes }) => ({
        url: `partner_applications/${id}/update_status`,
        method: 'PATCH',
        body: {
          status,
          ...(admin_notes && { admin_notes }),
        },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'PartnerApplication', id },
        { type: 'PartnerApplication', id: 'LIST' },
        { type: 'PartnerApplication', id: 'STATS' },
      ],
    }),

    // Удаление заявки (только для админов)
    deletePartnerApplication: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `partner_applications/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'PartnerApplication', id },
        { type: 'PartnerApplication', id: 'LIST' },
        { type: 'PartnerApplication', id: 'STATS' },
      ],
    }),

    // Получение статистики по заявкам
    getPartnerApplicationsStats: builder.query<PartnerApplicationsStatsResponse, void>({
      query: () => ({
        url: 'partner_applications/stats',
      }),
      providesTags: [{ type: 'PartnerApplication', id: 'STATS' }],
    }),
  }),
});

// Экспорт хуков для использования в компонентах
export const {
  useGetPartnerApplicationsQuery,
  useGetPartnerApplicationByIdQuery,
  useCreatePartnerApplicationMutation,
  useUpdatePartnerApplicationNotesMutation,
  useUpdatePartnerApplicationStatusMutation,
  useDeletePartnerApplicationMutation,
  useGetPartnerApplicationsStatsQuery,
  useLazyGetPartnerApplicationsQuery,
  useLazyGetPartnerApplicationByIdQuery,
} = partnerApplicationsApi; 