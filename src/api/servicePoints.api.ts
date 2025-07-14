import type { 
  ServicePoint, 
  ApiResponse, 
  ServicePointCreateRequest,
  ServicePointUpdateRequest,
  ServicePointFormData,
  ServicePointStatus,
  ServicePost,
  CategoryContact,
  Region,
  City
} from '../types/models';
import { baseApi } from './baseApi';

// Добавляем тип для work status
export interface WorkStatus {
  value: string;
  label: string;
  description: string;
}

// Типы для предварительного просмотра слотов
export interface SchedulePreviewSlot {
  time: string;
  available_posts: number;
  total_posts: number;
  is_available: boolean;
  post_details: {
    name: string;
    number: number;
    duration_minutes: number;
    end_time: string;
  }[];
}

export interface SchedulePreviewResponse {
  service_point_id: number;
  date: string;
  day_key: string;
  is_working_day: boolean;
  preview_slots: SchedulePreviewSlot[];
  total_active_posts: number;
  raw_available_slots: any[]; // Оригинальные слоты
}

// Инжектируем эндпоинты в baseApi
// Тип для поиска сервисных точек
export interface ServicePointSearchParams {
  city?: string;
  query?: string;
  latitude?: number;
  longitude?: number;
  category_id?: number; // Фильтр по категории услуг
  service_id?: number;  // Фильтр по конкретной услуге
  page?: number;        // Пагинация
  per_page?: number;    // Количество элементов на странице
}

export interface ServicePointSearchResponse {
  data: ServicePoint[];
  total: number;
  city_found: boolean;
}

export const servicePointsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Поиск сервисных точек по городу (для клиентского интерфейса)
    searchServicePoints: builder.query<ServicePointSearchResponse, ServicePointSearchParams>({
      query: (params) => ({
        url: 'service_points/search',
        method: 'GET',
        params,
      }),
      providesTags: ['ServicePoint'],
      // Кэширование на 5 минут
      keepUnusedDataFor: 300,
    }),

    // Получение списка сервисных точек
    getServicePoints: builder.query<ApiResponse<ServicePoint>, { 
      query?: string;
      city_id?: number;
      region_id?: number;
      partner_id?: number;
      page?: number;
      per_page?: number;
    } | void>({
      query: (params) => ({
        url: '/service_points',
        params: {
          ...params,
          include: 'city.region,working_hours,status,partner'
        }
      }),
      providesTags: (result) =>
        result?.data && Array.isArray(result.data)
          ? [
              ...result.data.map(({ id }) => ({ type: 'ServicePoint' as const, id })),
              'ServicePoint',
            ]
          : ['ServicePoint'],
      // Кэширование на 5 минут
      keepUnusedDataFor: 300,
    }),

    // Получение списка сервисных точек по ID партнера
    getServicePointsByPartnerId: builder.query<ApiResponse<ServicePoint>, { 
      partner_id: number;
      query?: string;
      page?: number;
      per_page?: number;
    }>({
      query: (params) => ({
        url: `/partners/${params.partner_id}/service_points`,
        params: {
          query: params.query,
          page: params.page,
          per_page: params.per_page,
          include: 'city.region,working_hours,status,partner'
        }
      }),
      providesTags: (result, _error, { partner_id }) =>
        result?.data && Array.isArray(result.data)
          ? [
              ...result.data.map(({ id }) => ({ type: 'ServicePoint' as const, id })),
              { type: 'ServicePoint' as const, id: 'LIST' },
              { type: 'ServicePoint' as const, id: `PARTNER_${partner_id}` },
            ]
          : [
              { type: 'ServicePoint' as const, id: 'LIST' },
              { type: 'ServicePoint' as const, id: `PARTNER_${partner_id}` },
            ],
      // Кэширование на 5 минут
      keepUnusedDataFor: 300,
    }),

    // Получение базовой информации о сервисной точке
    getServicePointBasicInfo: builder.query<ServicePoint, string>({
      query: (id) => ({
        url: `/service_points/${id}/basic`,
      }),
      providesTags: (_result, _error, id) => [{ type: 'ServicePoint' as const, id }],
      // Кэширование на 10 минут
      keepUnusedDataFor: 600,
    }),

    // Получение сервисной точки по ID
    getServicePointById: builder.query<ServicePoint, { partner_id: number; id: string; locale?: string } | string | { id: string; locale?: string }>({
      query: (arg) => {
        // Если передана строка, используем ее как ID
        if (typeof arg === 'string') {
          return {
            url: `/service_points/${arg}`,
            params: {
              locale: localStorage.getItem('i18nextLng') || 'ru'
            }
          };
        }
        
        // Если объект с только id и locale
        if ('id' in arg && !('partner_id' in arg)) {
          return {
            url: `/service_points/${arg.id}`,
            params: {
              locale: arg.locale || localStorage.getItem('i18nextLng') || 'ru'
            }
          };
        }
        
        // Иначе используем объект с partner_id и id
        const { partner_id, id, locale } = arg as { partner_id: number; id: string; locale?: string };
        return {
          url: `/partners/${partner_id}/service_points/${id}`,
          params: {
            locale: locale || localStorage.getItem('i18nextLng') || 'ru'
          }
        };
      },
      providesTags: (_result, _error, arg) => {
        const id = typeof arg === 'string' ? arg : arg.id;
        return [{ type: 'ServicePoint' as const, id }];
      },
      // Кэширование на 10 минут
      keepUnusedDataFor: 600,
    }),

    // Создание новой сервисной точки
    createServicePoint: builder.mutation<ServicePoint, { partnerId: string | number; servicePoint: FormData | any }>({
      query: ({ partnerId, servicePoint }) => {
        if (servicePoint instanceof FormData) {
          return {
            url: `/partners/${partnerId}/service_points`,
            method: 'POST',
            body: servicePoint,
          };
        } else {
          return {
            url: `/partners/${partnerId}/service_points`,
            method: 'POST',
            body: { service_point: servicePoint },
          };
        }
      },
      invalidatesTags: [
        { type: 'ServicePoint' as const, id: 'LIST' },
        { type: 'Partners' as const, id: 'LIST' }
      ],
    }),

    // Обновление сервисной точки
    updateServicePoint: builder.mutation<ServicePoint, { id: string; partnerId?: string | number; servicePoint: FormData | any }>({
      query: ({ id, partnerId, servicePoint }) => {
        // Извлекаем partner_id из FormData или объекта
        let finalPartnerId = partnerId;
        if (servicePoint instanceof FormData) {
          // Для FormData partner_id теперь в основных полях
          const formPartnerId = servicePoint.get('service_point[partner_id]');
          finalPartnerId = finalPartnerId || (formPartnerId ? String(formPartnerId) : undefined);
          console.log('partner_id from FormData:', finalPartnerId);
          
          return {
            url: `/partners/${finalPartnerId}/service_points/${id}`,
            method: 'PATCH',
            body: servicePoint,
          };
        } else {
          finalPartnerId = finalPartnerId || servicePoint.partner_id;
          const url = `/partners/${finalPartnerId}/service_points/${id}`;
          console.log('updateServicePoint URL:', url);
          console.log('updateServicePoint body:', { service_point: servicePoint });
          return {
            url,
            method: 'PATCH',
            body: { service_point: servicePoint },
          };
        }
      },
      invalidatesTags: (_result, _error, { id, partnerId, servicePoint }) => {
        const tags = [
          { type: 'ServicePoint' as const, id },
          { type: 'ServicePoint' as const, id: 'LIST' },
        ];
        
        // Добавляем тег для партнера если известен
        const finalPartnerId = partnerId || (servicePoint instanceof FormData 
          ? servicePoint.get('service_point[partner_id]')
          : servicePoint?.partner_id);
        
        if (finalPartnerId) {
          tags.push({ type: 'ServicePoint' as const, id: `PARTNER_${finalPartnerId}` });
        }
        
        return tags;
      },
    }),

    // Умное удаление сервисной точки (деактивация или полное удаление)
    deleteServicePoint: builder.mutation<{ message: string; action: 'deactivated' | 'deleted' }, { partner_id: number; id: number }>({
      query: ({ partner_id, id }) => ({
        url: `/partners/${partner_id.toString()}/service_points/${id.toString()}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { id, partner_id }) => [
        { type: 'ServicePoint' as const, id },
        { type: 'ServicePoint' as const, id: 'LIST' },
        { type: 'Partners' as const, id: partner_id },
        { type: 'Partners' as const, id: 'LIST' }
      ],
    }),

    // Добавление фотографии
    uploadServicePointPhoto: builder.mutation<void, { id: string; file: File; is_main?: boolean; description?: string }>({
      query: ({ id, file, is_main, description }) => {
        console.log('=== uploadServicePointPhoto query start ===');
        console.log('Received id:', id);
        console.log('Type of id:', typeof id);
        console.log('File name:', file.name);
        console.log('File size:', file.size);
        console.log('Is main:', is_main);
        console.log('Description:', description);
        
        if (!id || id === 'undefined' || id === 'null') {
          console.error('КРИТИЧЕСКАЯ ОШИБКА: Некорректный ID для загрузки фотографии:', id);
          throw new Error(`Некорректный ID для загрузки фотографии: ${id}`);
        }
        
        const formData = new FormData();
        formData.append('file', file);  // ИСПРАВЛЕНО: используем 'file' вместо 'photo'
        if (description) {
          formData.append('description', description);
        }
        if (is_main !== undefined) {
          formData.append('is_main', is_main.toString());
        }
        
        // Строим URL более явно
        const servicePointId = String(id);
        const url = `service_points/${servicePointId}/photos`;
        console.log('servicePointId after String():', servicePointId);
        console.log('uploadServicePointPhoto final URL:', url);
        console.log('=== uploadServicePointPhoto query end ===');
        
        return {
          url: url,
          method: 'POST' as const,
          body: formData,
        };
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'ServicePoint' as const, id },
        { type: 'ServicePointPhoto' as const, id: `LIST_${id}` }
      ],
    }),

    // Добавление фотографии (версия 2 для тестирования)
    uploadServicePointPhotoV2: builder.mutation<void, { servicePointId: string; file: File; is_main?: boolean; description?: string }>({
      query: ({ servicePointId, file, is_main, description }) => {
        console.log('=== uploadServicePointPhotoV2 query start ===');
        console.log('Received servicePointId:', servicePointId);
        console.log('Type of servicePointId:', typeof servicePointId);
        console.log('File name:', file.name);
        console.log('File size:', file.size);
        console.log('Is main:', is_main);
        console.log('Description:', description);
        
        if (!servicePointId || servicePointId === 'undefined' || servicePointId === 'null') {
          console.error('КРИТИЧЕСКАЯ ОШИБКА V2: Некорректный ID для загрузки фотографии:', servicePointId);
          throw new Error(`Некорректный ID для загрузки фотографии: ${servicePointId}`);
        }
        
        const formData = new FormData();
        formData.append('file', file);  // ИСПРАВЛЕНО: используем 'file' вместо 'photo'
        if (description) {
          formData.append('description', description);
        }
        if (is_main !== undefined) {
          formData.append('is_main', is_main.toString());
        }
        
        const url = `service_points/${servicePointId}/photos`;
        console.log('uploadServicePointPhotoV2 final URL:', url);
        console.log('=== uploadServicePointPhotoV2 query end ===');
        
        return {
          url: url,
          method: 'POST' as const,
          body: formData,
        };
      },
      invalidatesTags: (_result, _error, { servicePointId }) => [
        { type: 'ServicePoint' as const, id: servicePointId },
        { type: 'ServicePointPhoto' as const, id: `LIST_${servicePointId}` }
      ],
    }),

    getServicePointStatuses: builder.query<ApiResponse<ServicePointStatus>, void>({
      query: () => ({
        url: '/service_point_statuses',
        method: 'GET',
      }),
      // Кэширование на 1 час, так как статусы редко меняются
      keepUnusedDataFor: 3600,
    }),
    
    // Новый endpoint для получения work statuses
    getWorkStatuses: builder.query<WorkStatus[], void>({
      query: () => ({
        url: '/service_points/work_statuses',
        method: 'GET',
      }),
      // Кэширование на 1 час, так как статусы редко меняются
      keepUnusedDataFor: 3600,
    }),

    // Новый endpoint для получения service posts
    getServicePosts: builder.query<ServicePost[], string>({
      query: (servicePointId) => ({
        url: `/service_points/${servicePointId}/service_posts`,
        method: 'GET',
      }),
      providesTags: (result, error, servicePointId) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'ServicePost' as const, id })),
              { type: 'ServicePost' as const, id: `LIST_${servicePointId}` },
            ]
          : [{ type: 'ServicePost' as const, id: `LIST_${servicePointId}` }],
      // Кэширование на 5 минут
      keepUnusedDataFor: 300,
    }),

    // Новый endpoint для обновления service post
    updateServicePost: builder.mutation<ServicePost, { servicePointId: string; id: number; data: Partial<ServicePost> }>({
      query: ({ servicePointId, id, data }) => ({
        url: `/service_points/${servicePointId}/service_posts/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { servicePointId, id }) => [
        { type: 'ServicePost' as const, id },
        { type: 'ServicePost' as const, id: `LIST_${servicePointId}` },
        { type: 'ServicePoint' as const, id: servicePointId },
        { type: 'SchedulePreview' as const, id: servicePointId }
      ],
    }),

    // Новый endpoint для получения услуг сервисной точки
    getServicePointServices: builder.query<any[], { servicePointId: string; locale?: string }>({
      query: ({ servicePointId, locale }) => ({
        url: `/service_points/${servicePointId}/services`,
        method: 'GET',
        params: locale ? { locale } : {}
      }),
      providesTags: (result, error, { servicePointId }) =>
        result
          ? [
              ...result.map((_, index) => ({ type: 'ServicePointService' as const, id: `${servicePointId}_${index}` })),
              { type: 'ServicePointService' as const, id: `LIST_${servicePointId}` },
            ]
          : [{ type: 'ServicePointService' as const, id: `LIST_${servicePointId}` }],
      // Кэширование на 10 минут
      keepUnusedDataFor: 600,
    }),

    // Новый endpoint для получения фотографий сервисной точки
    getServicePointPhotos: builder.query<any[], string>({
      query: (servicePointId) => ({
        url: `/service_points/${servicePointId}/photos`,
        method: 'GET',
      }),
      providesTags: (result, error, servicePointId) =>
        result
          ? [
              ...result.map((_, index) => ({ type: 'ServicePointPhoto' as const, id: `${servicePointId}_${index}` })),
              { type: 'ServicePointPhoto' as const, id: `LIST_${servicePointId}` },
            ]
          : [{ type: 'ServicePointPhoto' as const, id: `LIST_${servicePointId}` }],
      // Кэширование на 10 минут
      keepUnusedDataFor: 600,
    }),

    // Новый endpoint для предварительного просмотра слотов
    getSchedulePreview: builder.query<SchedulePreviewResponse, { servicePointId: string; date: string }>({
      query: ({ servicePointId, date }) => ({
        url: `/service_points/${servicePointId}/schedule_preview`,
        method: 'GET',
        params: { date },
      }),
      providesTags: (result, error, { servicePointId, date }) => [
        { type: 'SchedulePreview' as const, id: `${servicePointId}_${date}` },
      ],
      // Кэширование на 2 минуты, так как расписание может часто меняться
      keepUnusedDataFor: 120,
    }),

    // Новый endpoint для расчета предварительного просмотра с данными формы
    calculateSchedulePreview: builder.mutation<SchedulePreviewResponse, { 
      servicePointId: string; 
      date: string; 
      formData: any 
    }>({
      query: ({ servicePointId, date, formData }) => ({
        url: `/service_points/${servicePointId}/calculate_schedule_preview`,
        method: 'POST',
        params: { date },
        body: { service_point: formData },
      }),
      // Не кешируем мутацию, так как это предварительный просмотр
    }),

    // Получение сервисных точек по категории
    getServicePointsByCategory: builder.query<
      { data: ServicePoint[]; total_count: number }, 
      { categoryId: number; cityId?: number; page?: number; per_page?: number }
    >({
      query: ({ categoryId, cityId, page = 1, per_page = 10 }) => ({
        url: 'service_points/by_category',
        params: { 
          category_id: categoryId, 
          city_id: cityId,
          page,
          per_page
        }
      }),
      providesTags: ['ServicePoint'],
      // Кэширование на 5 минут
      keepUnusedDataFor: 300,
    }),

    // Получение постов сервисной точки по категории
    getPostsByCategory: builder.query<
      { 
        data: ServicePost[]; 
        category_contact: { phone?: string; email?: string };
        posts_count: number;
      }, 
      { servicePointId: number; categoryId: number }
    >({
      query: ({ servicePointId, categoryId }) => 
        `service_points/${servicePointId}/posts_by_category?category_id=${categoryId}`,
      providesTags: ['ServicePost'],
      // Кэширование на 10 минут
      keepUnusedDataFor: 600,
    }),

    // Обновление контактов по категориям
    updateCategoryContacts: builder.mutation<
      { success: boolean; category_contacts: Record<string, CategoryContact> },
      { id: number; category_contacts: Record<string, CategoryContact> }
    >({
      query: ({ id, category_contacts }) => ({
        url: `service_points/${id}/category_contacts`,
        method: 'PATCH',
        body: { category_contacts }
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'ServicePoint', id },
        { type: 'ServicePoint', id: 'LIST' }
      ],
    }),

    // Динамические списки регионов и городов с учетом фильтров
    getRegionsWithServicePoints: builder.query<ApiResponse<Region>, { category_id?: number; service_id?: number }>({
      query: (params = {}) => ({
        url: 'service_points/regions',
        params: Object.fromEntries(Object.entries(params).filter(([_, v]) => v != null))
      }),
      providesTags: ['ServicePoint', 'Region'],
    }),

    getCitiesWithServicePoints: builder.query<ApiResponse<City>, { category_id?: number; service_id?: number; region_id?: number; locale?: string }>({
      query: (params = {}) => {
        const filteredParams = Object.fromEntries(
          Object.entries(params).filter(([_, v]) => v !== null && v !== undefined)
        );
        console.log('🔍 getCitiesWithServicePoints API params:', params);
        console.log('🔍 getCitiesWithServicePoints filtered params:', filteredParams);
        
        const finalUrl = 'service_points/cities';
        console.log('🔍 Final API URL:', finalUrl);
        console.log('🔍 Final API params:', filteredParams);
        
        return {
          url: finalUrl, 
          params: filteredParams
        };
      },
      // Создаем уникальный ключ кэша для каждой комбинации параметров
      providesTags: (result, error, params) => [
        'ServicePoint', 
        'City',
        { type: 'City', id: `cities-${params.region_id || 'all'}-${params.category_id || 'all'}-${params.service_id || 'all'}` }
      ],
      // Отключаем кэширование для отладки
      keepUnusedDataFor: 0,
    }),
  }),
  // Установка автоматического обновления при монтировании компонентов
  overrideExisting: false,
});

export const {
  useSearchServicePointsQuery,
  useGetServicePointsQuery,
  useGetServicePointsByPartnerIdQuery,
  useGetServicePointBasicInfoQuery,
  useGetServicePointByIdQuery,
  useCreateServicePointMutation,
  useUpdateServicePointMutation,
  useDeleteServicePointMutation,
  useUploadServicePointPhotoMutation,
  useUploadServicePointPhotoV2Mutation,
  useGetServicePointStatusesQuery,
  useGetWorkStatusesQuery,
  useGetServicePostsQuery,
  useUpdateServicePostMutation,
  useGetServicePointServicesQuery,
  useGetServicePointPhotosQuery,
  useGetSchedulePreviewQuery,
  useCalculateSchedulePreviewMutation,
  useGetServicePointsByCategoryQuery,
  useGetPostsByCategoryQuery,
  useUpdateCategoryContactsMutation,
  useGetRegionsWithServicePointsQuery,
  useGetCitiesWithServicePointsQuery,
} = servicePointsApi;