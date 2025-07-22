import { baseApi } from './baseApi';

// Типы для Email Templates (теперь унифицированные для всех каналов)
export interface EmailTemplate {
  id: number;
  name: string;
  subject?: string; // Опциональное для Telegram и Push
  body: string;
  template_type: string;
  language: string;
  channel_type: 'email' | 'telegram' | 'push';
  channel_name: string;
  is_active: boolean;
  variables_array: string[];
  description?: string;
  created_at: string;
  updated_at: string;
  template_type_name: string;
  status_text: string;
}

// Тип для ответа API при получении одного шаблона
export interface EmailTemplateResponse {
  data: EmailTemplate;
  available_variables?: string[];
  usage_stats?: any;
}

export interface CreateEmailTemplateRequest {
  name: string;
  subject?: string; // Опциональное для Telegram и Push
  body: string;
  template_type: string;
  language: string;
  channel_type?: 'email' | 'telegram' | 'push'; // Опциональное, по умолчанию 'email'
  is_active?: boolean;
  variables?: string[];
  description?: string;
}

export interface UpdateEmailTemplateRequest {
  name?: string;
  subject?: string;
  body?: string;
  template_type?: string;
  language?: string;
  channel_type?: 'email' | 'telegram' | 'push';
  is_active?: boolean;
  variables?: string[];
  description?: string;
}

export interface EmailTemplateFilters {
  active?: boolean;
  template_type?: string;
  language?: string;
  channel_type?: 'email' | 'telegram' | 'push';
  search?: string;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

export interface PreviewResponse {
  subject: string;
  body: string;
  variables: string[];
}

export interface TemplateType {
  value: string;
  label: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_count: number;
    per_page: number;
  };
  stats?: {
    total: number;
    active: number;
    inactive: number;
    by_language: Record<string, number>;
    by_type: Record<string, number>;
    by_channel: Record<string, number>;
  };
  available_types?: Array<{ value: string; label: string; }>;
  available_languages?: string[];
  available_channels?: Record<string, string>;
}

// API endpoints
export const emailTemplatesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Получение списка шаблонов с фильтрацией
    getEmailTemplates: builder.query<PaginatedResponse<EmailTemplate>, EmailTemplateFilters | void>({
      query: (filters: EmailTemplateFilters = {}) => {
        const params = new URLSearchParams();
        
        if (filters.active !== undefined) {
          params.append('active', String(filters.active));
        }
        if (filters.template_type) {
          params.append('template_type', filters.template_type);
        }
        if (filters.language) {
          params.append('language', filters.language);
        }
        if (filters.channel_type) {
          params.append('channel_type', filters.channel_type);
        }
        if (filters.search) {
          params.append('search', filters.search);
        }
        if (filters.sort_by) {
          params.append('sort_by', filters.sort_by);
        }
        if (filters.sort_direction) {
          params.append('sort_direction', filters.sort_direction);
        }
        if (filters.page) {
          params.append('page', String(filters.page));
        }
        if (filters.per_page) {
          params.append('per_page', String(filters.per_page));
        }

        return `email_templates?${params.toString()}`;
      },
      providesTags: ['EmailTemplate'],
    }),

    // Получение одного шаблона по ID
    getEmailTemplate: builder.query<EmailTemplateResponse, number>({
      query: (id) => `email_templates/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'EmailTemplate' as const, id }],
    }),

    // Создание нового шаблона
    createEmailTemplate: builder.mutation<EmailTemplate, CreateEmailTemplateRequest>({
      query: (data) => ({
        url: 'email_templates',
        method: 'POST',
        body: { email_template: data },
      }),
      invalidatesTags: ['EmailTemplate'],
    }),

    // Обновление шаблона
    updateEmailTemplate: builder.mutation<EmailTemplate, { id: number; data: UpdateEmailTemplateRequest }>({
      query: ({ id, data }) => ({
        url: `email_templates/${id}`,
        method: 'PUT',
        body: { email_template: data },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'EmailTemplate' as const, id },
        'EmailTemplate',
      ],
    }),

    // Удаление шаблона
    deleteEmailTemplate: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `email_templates/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['EmailTemplate'],
    }),

    // Предварительный просмотр шаблона
    previewEmailTemplate: builder.mutation<PreviewResponse, { id: number; variables: Record<string, string> }>({
      query: ({ id, variables }) => ({
        url: `email_templates/${id}/preview`,
        method: 'POST',
        body: { variables },
      }),
    }),

    // Получение типов шаблонов
    getTemplateTypes: builder.query<{ data: TemplateType[]; channel_type?: string }, { channel_type?: string } | void>({
      query: (params = {}) => {
        const urlParams = new URLSearchParams();
        if (params && 'channel_type' in params && params.channel_type) {
          urlParams.append('channel_type', params.channel_type);
        }
        return `email_templates/template_types${urlParams.toString() ? `?${urlParams.toString()}` : ''}`;
      },
    }),
  }),
});

// Экспорт хуков
export const {
  useGetEmailTemplatesQuery,
  useGetEmailTemplateQuery,
  useCreateEmailTemplateMutation,
  useUpdateEmailTemplateMutation,
  useDeleteEmailTemplateMutation,
  usePreviewEmailTemplateMutation,
  useGetTemplateTypesQuery,
} = emailTemplatesApi; 