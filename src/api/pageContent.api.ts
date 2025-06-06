import { baseApi } from './baseApi';
import { 
  PageContent, 
  PageContentBlock, 
  ServiceItem,
  HeroContent,
  CTAContent
} from '../types';

// Интерфейсы для запросов
export interface CreatePageContentRequest {
  pageName: string;
  pageTitle: string;
  pageDescription: string;
  blocks: Omit<PageContentBlock, 'id' | 'createdAt' | 'updatedAt'>[];
}

export interface UpdatePageContentRequest {
  pageTitle?: string;
  pageDescription?: string;
  blocks?: Omit<PageContentBlock, 'id' | 'createdAt' | 'updatedAt'>[];
  isActive?: boolean;
}

export interface PageContentFilters {
  page?: number;
  per_page?: number;
  pageName?: string;
  isActive?: boolean;
}

export interface PageContentListResponse {
  data: PageContent[];
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
}

export interface CreateServiceItemRequest {
  title: string;
  description: string;
  icon: string;
  price: { min: number; max: number };
  duration: string;
  features: string[];
  isPopular: boolean;
  category: string;
  order: number;
}

export interface ServiceItemsResponse {
  data: ServiceItem[];
  total: number;
}

export const pageContentApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Получение списка страниц контента
    getPageContent: build.query<PageContentListResponse, PageContentFilters>({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.per_page) queryParams.append('per_page', params.per_page.toString());
        if (params.pageName) queryParams.append('page_name', params.pageName);
        if (params.isActive !== undefined) queryParams.append('is_active', params.isActive.toString());
        
        const queryString = queryParams.toString();
        return `page_content${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'PageContent' as const, id })),
              'PageContent',
            ]
          : ['PageContent'],
    }),

    // Получение контента конкретной страницы
    getPageContentByName: build.query<PageContent, string>({
      query: (pageName) => `page_content/by_name/${pageName}`,
      providesTags: (_result, _err, pageName) => [{ type: 'PageContent' as const, id: pageName }],
    }),

    // Получение контента страницы по ID
    getPageContentById: build.query<PageContent, string | number>({
      query: (id) => `page_content/${id}`,
      providesTags: (_result, _err, id) => [{ type: 'PageContent' as const, id }],
    }),

    // Создание нового контента страницы
    createPageContent: build.mutation<PageContent, CreatePageContentRequest>({
      query: (contentData) => ({
        url: 'page_content',
        method: 'POST',
        body: {
          page_content: contentData,
        },
      }),
      invalidatesTags: ['PageContent'],
    }),

    // Обновление контента страницы
    updatePageContent: build.mutation<PageContent, { id: string | number; content: UpdatePageContentRequest }>({
      query: ({ id, content }) => ({
        url: `page_content/${id}`,
        method: 'PATCH',
        body: {
          page_content: content,
        },
      }),
      invalidatesTags: (_result, _err, { id }) => [
        { type: 'PageContent' as const, id },
        'PageContent',
      ],
    }),

    // Удаление контента страницы
    deletePageContent: build.mutation<void, string | number>({
      query: (id) => ({
        url: `page_content/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['PageContent'],
    }),

    // Получение активных услуг для клиентской страницы
    getActiveServices: build.query<ServiceItemsResponse, { category?: string; limit?: number }>({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        
        if (params.category) queryParams.append('category', params.category);
        if (params.limit) queryParams.append('limit', params.limit.toString());
        queryParams.append('is_active', 'true');
        
        const queryString = queryParams.toString();
        return `client_services${queryString ? `?${queryString}` : '?is_active=true'}`;
      },
      providesTags: ['ServiceItem'],
    }),

    // Создание новой услуги для клиентской страницы
    createServiceItem: build.mutation<ServiceItem, CreateServiceItemRequest>({
      query: (serviceData) => ({
        url: 'client_services',
        method: 'POST',
        body: {
          service_item: serviceData,
        },
      }),
      invalidatesTags: ['ServiceItem'],
    }),

    // Обновление услуги
    updateServiceItem: build.mutation<ServiceItem, { id: string; service: Partial<CreateServiceItemRequest> }>({
      query: ({ id, service }) => ({
        url: `client_services/${id}`,
        method: 'PATCH',
        body: {
          service_item: service,
        },
      }),
      invalidatesTags: (_result, _err, { id }) => [
        { type: 'ServiceItem' as const, id },
        'ServiceItem',
      ],
    }),

    // Удаление услуги
    deleteServiceItem: build.mutation<void, string>({
      query: (id) => ({
        url: `client_services/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ServiceItem'],
    }),

    // Получение Hero контента
    getHeroContent: build.query<HeroContent, string>({
      query: (pageName) => `page_content/hero/${pageName}`,
      providesTags: (_result, _err, pageName) => [{ type: 'HeroContent' as const, id: pageName }],
    }),

    // Обновление Hero контента
    updateHeroContent: build.mutation<HeroContent, { pageName: string; content: Partial<HeroContent> }>({
      query: ({ pageName, content }) => ({
        url: `page_content/hero/${pageName}`,
        method: 'PATCH',
        body: {
          hero_content: content,
        },
      }),
      invalidatesTags: (_result, _err, { pageName }) => [
        { type: 'HeroContent' as const, id: pageName },
        'PageContent',
      ],
    }),

    // Получение CTA контента
    getCTAContent: build.query<CTAContent, string>({
      query: (pageName) => `page_content/cta/${pageName}`,
      providesTags: (_result, _err, pageName) => [{ type: 'CTAContent' as const, id: pageName }],
    }),

    // Обновление CTA контента
    updateCTAContent: build.mutation<CTAContent, { pageName: string; content: Partial<CTAContent> }>({
      query: ({ pageName, content }) => ({
        url: `page_content/cta/${pageName}`,
        method: 'PATCH',
        body: {
          cta_content: content,
        },
      }),
      invalidatesTags: (_result, _err, { pageName }) => [
        { type: 'CTAContent' as const, id: pageName },
        'PageContent',
      ],
    }),

    // Переупорядочивание блоков контента
    reorderContentBlocks: build.mutation<PageContent, { pageId: string | number; blockIds: string[] }>({
      query: ({ pageId, blockIds }) => ({
        url: `page_content/${pageId}/reorder_blocks`,
        method: 'PATCH',
        body: {
          block_ids: blockIds,
        },
      }),
      invalidatesTags: (_result, _err, { pageId }) => [
        { type: 'PageContent' as const, id: pageId },
        'PageContent',
      ],
    }),

    // Переключение активности страницы
    togglePageContentActive: build.mutation<PageContent, string | number>({
      query: (id) => ({
        url: `page_content/${id}/toggle_active`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _err, id) => [
        { type: 'PageContent' as const, id },
        'PageContent',
      ],
    }),
  }),
});

// Экспорт хуков
export const {
  useGetPageContentQuery,
  useGetPageContentByNameQuery,
  useGetPageContentByIdQuery,
  useCreatePageContentMutation,
  useUpdatePageContentMutation,
  useDeletePageContentMutation,
  useGetActiveServicesQuery,
  useCreateServiceItemMutation,
  useUpdateServiceItemMutation,
  useDeleteServiceItemMutation,
  useGetHeroContentQuery,
  useUpdateHeroContentMutation,
  useGetCTAContentQuery,
  useUpdateCTAContentMutation,
  useReorderContentBlocksMutation,
  useTogglePageContentActiveMutation,
} = pageContentApi; 