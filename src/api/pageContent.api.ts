import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

// Интерфейсы
export interface PageContent {
  id: number;
  section: string;
  content_type: string;
  title: string;
  content: string;
  image_url?: string;
  gallery_image_urls?: string[];
  settings: Record<string, any>;
  position: number;
  active: boolean;
  created_at: string;
  updated_at: string;
  available_settings_fields?: string[];
  content_type_name?: string;
  section_name?: string;
  dynamic_data?: any; // Автоматические данные из базы
}

export interface PageContentFilters {
  section?: string;
  content_type?: string;
  search?: string;
  active?: boolean;
}

export interface PageContentListResponse {
  data: PageContent[];
  total: number;
}

export interface CreatePageContentRequest {
  section: string;
  content_type: string;
  title: string;
  content: string;
  image_url?: string;
  image?: File;
  gallery_images?: File[];
  settings?: Record<string, any>;
  position?: number;
  active?: boolean;
}

export interface UpdatePageContentRequest extends Partial<CreatePageContentRequest> {
  id: number;
}

export interface Section {
  key: string;
  name: string;
  count: number;
}

export interface ContentType {
  key: string;
  name: string;
  description: string;
  settings_fields: string[];
}

// Константы типов контента
export const CONTENT_TYPES: Record<string, ContentType> = {
  'hero': {
    key: 'hero',
    name: 'Героїчна секція',
    description: 'Головний банер сторінки',
    settings_fields: ['subtitle', 'button_text', 'search_placeholder', 'city_placeholder']
  },
  'text_block': {
    key: 'text_block',
    name: 'Текстовий блок',
    description: 'Блок з текстовим контентом',
    settings_fields: ['type', 'alignment']
  },
  'service': {
    key: 'service',
    name: 'Послуга',
    description: 'Опис послуги',
    settings_fields: ['category', 'icon']
  },
  'city': {
    key: 'city',
    name: 'Місто',
    description: 'Інформація про місто',
    settings_fields: ['region', 'service_points_count']
  },
  'article': {
    key: 'article',
    name: 'Стаття',
    description: 'Стаття бази знань',
    settings_fields: ['read_time', 'author', 'category']
  },
  'cta': {
    key: 'cta',
    name: 'Заклик до дії',
    description: 'Блок з кнопками дій',
    settings_fields: ['primary_button_text', 'secondary_button_text']
  },
  'footer': {
    key: 'footer',
    name: 'Підвал',
    description: 'Контент підвалу сторінки',
    settings_fields: ['contact_info', 'social_links']
  }
};

// API
export const pageContentApi = createApi({
  reducerPath: 'pageContentApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/page_contents`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['PageContent', 'Section'],
  endpoints: (builder) => ({
    // Получение списка контента
    getPageContents: builder.query<PageContentListResponse, PageContentFilters>({
      query: (filters = {}) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, String(value));
          }
        });
        return `?${params.toString()}`;
      },
      providesTags: ['PageContent'],
    }),

    // Получение секций с количеством контента
    getSections: builder.query<{ data: Section[] }, void>({
      query: () => 'sections',
      providesTags: ['Section'],
    }),

    // Получение конкретного контента
    getPageContentById: builder.query<PageContent, number>({
      query: (id) => `${id}`,
      providesTags: (result, error, id) => [{ type: 'PageContent', id }],
    }),

    // Создание контента
    createPageContent: builder.mutation<PageContent, CreatePageContentRequest>({
      query: (data) => {
        // Если есть файлы, используем FormData
        if (data.image || data.gallery_images) {
          const formData = new FormData();
          
          // Добавляем основные поля
          Object.entries(data).forEach(([key, value]) => {
            if (key === 'image' || key === 'gallery_images') return;
            
            if (key === 'settings' && typeof value === 'object') {
              Object.entries(value).forEach(([settingKey, settingValue]) => {
                formData.append(`page_content[settings][${settingKey}]`, String(settingValue));
              });
            } else if (value !== undefined && value !== null) {
              formData.append(`page_content[${key}]`, String(value));
            }
          });

          // Добавляем файлы
          if (data.image) {
            formData.append('page_content[image]', data.image);
          }
          
          if (data.gallery_images) {
            data.gallery_images.forEach((file) => {
              formData.append('page_content[gallery_images][]', file);
            });
          }

          return {
            url: '',
            method: 'POST',
            body: formData,
          };
        }

        // Если файлов нет, используем JSON
        return {
          url: '',
          method: 'POST',
          body: { page_content: data },
        };
      },
      invalidatesTags: ['PageContent', 'Section'],
    }),

    // Обновление контента
    updatePageContent: builder.mutation<PageContent, UpdatePageContentRequest>({
      query: ({ id, ...data }) => {
        // Если есть файлы, используем FormData
        if (data.image || data.gallery_images) {
          const formData = new FormData();
          
          // Добавляем основные поля
          Object.entries(data).forEach(([key, value]) => {
            if (key === 'image' || key === 'gallery_images') return;
            
            if (key === 'settings' && typeof value === 'object') {
              Object.entries(value).forEach(([settingKey, settingValue]) => {
                formData.append(`page_content[settings][${settingKey}]`, String(settingValue));
              });
            } else if (value !== undefined && value !== null) {
              formData.append(`page_content[${key}]`, String(value));
            }
          });

          // Добавляем файлы
          if (data.image) {
            formData.append('page_content[image]', data.image);
          }
          
          if (data.gallery_images) {
            data.gallery_images.forEach((file) => {
              formData.append('page_content[gallery_images][]', file);
            });
          }

          return {
            url: `${id}`,
            method: 'PATCH',
            body: formData,
          };
        }

        // Если файлов нет, используем JSON
        return {
          url: `${id}`,
          method: 'PATCH',
          body: { page_content: data },
        };
      },
      invalidatesTags: (result, error, { id }) => [
        { type: 'PageContent', id },
        'PageContent',
        'Section'
      ],
    }),

    // Удаление контента
    deletePageContent: builder.mutation<void, number>({
      query: (id) => ({
        url: `${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['PageContent', 'Section'],
    }),

    // Переключение активности
    togglePageContentActive: builder.mutation<PageContent, number>({
      query: (id) => ({
        url: `${id}/toggle_active`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'PageContent', id },
        'PageContent',
        'Section'
      ],
    }),
  }),
});

// Экспорт хуков
export const {
  useGetPageContentsQuery,
  useGetPageContentByIdQuery,
  useGetSectionsQuery,
  useCreatePageContentMutation,
  useUpdatePageContentMutation,
  useDeletePageContentMutation,
  useTogglePageContentActiveMutation,
} = pageContentApi;

// Алиас для совместимости
export const useGetPageContentQuery = useGetPageContentByIdQuery; 