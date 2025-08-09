import { baseApi } from './baseApi';

// Интерфейсы для исключений
export interface AgreementException {
  id: number;
  partner_supplier_agreement_id: number;
  tire_brand_id?: number;
  tire_diameter?: string;
  exception_type: 'fixed_amount' | 'percentage';
  exception_amount?: number;
  exception_percentage?: number;
  application_scope: 'per_order' | 'per_item';
  priority: number;
  active: boolean;
  description?: string;
  created_at: string;
  updated_at: string;
  
  // Дополнительная информация от сервера (совместимость)
  tire_brand_name?: string;
  exception_type_text?: string;
  application_scope_text?: string;
  tire_brand_text?: string;
  tire_diameter_text?: string;
  value_text?: string;
  full_description?: string;
  formatted_created_at?: string;
  formatted_updated_at?: string;
  
  // Новые поля для множественного выбора
  tire_brand_ids?: number[];
  tire_diameters?: string[];
  brands_description?: string;
  diameters_description?: string;
  full_description_with_multiple?: string;
  
  // Детальная информация о связях
  exception_brands?: ExceptionBrand[];
  exception_diameters?: ExceptionDiameter[];
}

export interface ExceptionBrand {
  id: number;
  tire_brand_id: number;
  tire_brand_name: string;
}

export interface ExceptionDiameter {
  id: number;
  tire_diameter: string;
  formatted_diameter: string;
}

export interface CreateExceptionRequest {
  exception: {
    tire_brand_id?: number;
    tire_diameter?: string;
    exception_type: 'fixed_amount' | 'percentage';
    exception_amount?: number;
    exception_percentage?: number;
    application_scope: 'per_order' | 'per_item';
    priority: number;
    active: boolean;
    description?: string;
    // Новые поля для множественного выбора
    tire_brand_ids?: number[];
    tire_diameters?: string[];
  };
}

export interface UpdateExceptionRequest {
  exception: Partial<CreateExceptionRequest['exception']>;
}

export interface TireBrand {
  id: number;
  name: string;
}

export interface TireDiameter {
  value: string;
  label: string;
}

export interface ExceptionQueryParams {
  page?: number;
  per_page?: number;
  active?: boolean;
  tire_brand_id?: number;
  tire_diameter?: string;
  exception_type?: 'fixed_amount' | 'percentage';
}

export interface ApiResponse<T> {
  data: T;
  meta?: {
    current_page: number;
    per_page: number;
    total_pages: number;
    total_count: number;
  };
  message?: string;
}

// API endpoints для исключений
export const agreementExceptionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Получение списка исключений для договоренности
    getAgreementExceptions: builder.query<ApiResponse<AgreementException[]>, { agreementId: number } & ExceptionQueryParams>({
      query: ({ agreementId, ...params }) => ({
        url: `agreements/${agreementId}/exceptions`,
        params: {
          ...params,
          locale: localStorage.getItem('language') || 'ru'
        }
      }),
      providesTags: (result, error, { agreementId }) =>
        result ? [
          ...result.data.map(({ id }) => ({ type: 'AgreementException' as const, id })),
          { type: 'AgreementException', id: `AGREEMENT_${agreementId}` }
        ] : [{ type: 'AgreementException', id: `AGREEMENT_${agreementId}` }],
    }),
    
    // Получение одного исключения
    getAgreementException: builder.query<ApiResponse<AgreementException>, { agreementId: number; id: number }>({
      query: ({ agreementId, id }) => ({
        url: `agreements/${agreementId}/exceptions/${id}`,
        params: {
          locale: localStorage.getItem('language') || 'ru'
        }
      }),
      providesTags: (result, error, { id }) => [{ type: 'AgreementException', id }],
    }),
    
    // Создание исключения
    createAgreementException: builder.mutation<ApiResponse<AgreementException>, { agreementId: number } & CreateExceptionRequest>({
      query: ({ agreementId, exception }) => ({
        url: `agreements/${agreementId}/exceptions`,
        method: 'POST',
        body: { exception },
      }),
      invalidatesTags: (result, error, { agreementId }) => [
        'AgreementException',
        { type: 'AgreementException', id: `AGREEMENT_${agreementId}` }
      ],
    }),
    
    // Обновление исключения
    updateAgreementException: builder.mutation<ApiResponse<AgreementException>, { agreementId: number; id: number } & UpdateExceptionRequest>({
      query: ({ agreementId, id, exception }) => ({
        url: `agreements/${agreementId}/exceptions/${id}`,
        method: 'PATCH',
        body: { exception },
      }),
      invalidatesTags: (result, error, { agreementId, id }) => [
        { type: 'AgreementException', id },
        { type: 'AgreementException', id: `AGREEMENT_${agreementId}` }
      ],
    }),
    
    // Удаление исключения
    deleteAgreementException: builder.mutation<{ message: string }, { agreementId: number; id: number }>({
      query: ({ agreementId, id }) => ({
        url: `agreements/${agreementId}/exceptions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { agreementId, id }) => [
        { type: 'AgreementException', id },
        { type: 'AgreementException', id: `AGREEMENT_${agreementId}` }
      ],
    }),
    
    // Получение брендов шин
    getExceptionTireBrands: builder.query<ApiResponse<TireBrand[]>, number>({
      query: (agreementId) => `agreements/${agreementId}/exceptions/tire_brands`,
      providesTags: ['TireBrand'],
    }),
    
    // Получение диаметров шин
    getExceptionTireDiameters: builder.query<ApiResponse<TireDiameter[]>, number>({
      query: (agreementId) => `agreements/${agreementId}/exceptions/tire_diameters`,
      providesTags: ['TireDiameter'],
    }),
  }),
});

export const {
  useGetAgreementExceptionsQuery,
  useGetAgreementExceptionQuery,
  useCreateAgreementExceptionMutation,
  useUpdateAgreementExceptionMutation,
  useDeleteAgreementExceptionMutation,
  useGetExceptionTireBrandsQuery,
  useGetExceptionTireDiametersQuery,
} = agreementExceptionsApi;