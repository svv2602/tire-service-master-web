import { baseApi } from './baseApi';

// Типы данных для договоренностей
export interface Agreement {
  id: number;
  partner_id: number;
  supplier_id: number;
  start_date: string;
  end_date?: string;
  commission_type: 'custom' | 'percentage' | 'fixed_amount';
  commission_amount?: number;
  commission_percentage?: number;
  commission_unit?: 'per_order' | 'per_item';
  order_types: 'cart_orders' | 'pickup_orders' | 'both';
  active: boolean;
  description?: string;
  created_at: string;
  updated_at: string;
  
  // Дополнительные поля из сериализатора
  partner_info: {
    id: number;
    company_name: string;
    contact_person: string;
    phone: string;
    is_active: boolean;
  } | null;
  supplier_info: {
    id: number;
    name: string;
    firm_id: string;
    is_active: boolean;
    priority: number;
  } | null;
  order_types_text: string;
  active_text: string;
  formatted_start_date: string;
  formatted_end_date?: string;
  formatted_created_at: string;
  formatted_updated_at: string;
  duration_text: string;
  status_text: string;
  can_be_edited: boolean;
  reward_rules_count: number;
  active_reward_rules_count: number;
  display_name: string;
  supports_cart_orders: boolean;
  supports_pickup_orders: boolean;
}

export interface AgreementQueryParams {
  page?: number;
  per_page?: number;
  active?: boolean;
  partner_id?: number;
  supplier_id?: number;
  order_types?: 'cart_orders' | 'pickup_orders' | 'both';
}

export interface CreateAgreementRequest {
  agreement: {
    partner_id: number;
    supplier_id: number;
    start_date: string;
    end_date?: string;
    commission_type: 'custom' | 'percentage' | 'fixed_amount';
    commission_amount?: number;
    commission_percentage?: number;
    commission_unit?: 'per_order' | 'per_item';
    order_types: 'cart_orders' | 'pickup_orders' | 'both';
    active: boolean;
    description?: string;
  };
}

export interface UpdateAgreementRequest {
  agreement: Partial<CreateAgreementRequest['agreement']>;
}

export interface PartnerOption {
  id: number;
  company_name: string;
  contact_person: string;
  phone: string;
  is_active: boolean;
}

export interface SupplierOption {
  id: number;
  name: string;
  firm_id: string;
  is_active: boolean;
  priority: number;
}

export interface ApiResponse<T> {
  data: T;
  meta?: {
    total_count: number;
    page: number;
    per_page: number;
    total_pages: number;
  };
  message?: string;
}

// API endpoints
export const agreementsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Получение списка договоренностей
    getAgreements: builder.query<ApiResponse<Agreement[]>, AgreementQueryParams>({
      query: (params) => ({ 
        url: 'agreements', 
        params: {
          ...params,
          locale: localStorage.getItem('language') || 'ru'
        }
      }),
      providesTags: (result) =>
        result ? [...result.data.map(({ id }) => ({ type: 'Agreement' as const, id })), 'Agreement'] : ['Agreement'],
    }),
    
    // Получение одной договоренности
    getAgreement: builder.query<ApiResponse<Agreement>, number>({
      query: (id) => ({ 
        url: `agreements/${id}`,
        params: {
          locale: localStorage.getItem('language') || 'ru'
        }
      }),
      providesTags: (result, error, id) => [{ type: 'Agreement', id }],
    }),
    
    // Создание договоренности
    createAgreement: builder.mutation<ApiResponse<Agreement>, CreateAgreementRequest>({
      query: (data) => ({
        url: 'agreements',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Agreement'],
    }),
    
    // Обновление договоренности
    updateAgreement: builder.mutation<ApiResponse<Agreement>, { id: string; agreement: Partial<CreateAgreementRequest['agreement']> }>({
      query: ({ id, agreement }) => ({
        url: `agreements/${id}`,
        method: 'PATCH',
        body: { agreement },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Agreement', id }],
    }),
    
    // Удаление договоренности
    deleteAgreement: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `agreements/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Agreement', id }],
    }),
    
    // Получение списка партнеров для селекта (все партнеры для редактирования)
    getAgreementPartners: builder.query<ApiResponse<PartnerOption[]>, void>({
      query: () => 'agreements/partners',
      providesTags: ['AgreementPartner'],
    }),
    
    // Получение только активных партнеров для создания новых договоренностей
    getActiveAgreementPartners: builder.query<ApiResponse<PartnerOption[]>, void>({
      query: () => 'agreements/partners?only_active=true',
      providesTags: ['AgreementPartner'],
    }),
    
    // Получение списка поставщиков для селекта
    getAgreementSuppliers: builder.query<ApiResponse<SupplierOption[]>, void>({
      query: () => 'agreements/suppliers',
      providesTags: ['AgreementSupplier'],
    }),
  }),
});

// Интерфейс для исключений в договоренностях
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
  
  // Дополнительная информация
  tire_brand_name?: string;
  exception_type_text?: string;
  application_scope_text?: string;
  tire_brand_text?: string;
  tire_diameter_text?: string;
  value_text?: string;
  full_description?: string;
}

export interface TireBrand {
  id: number;
  name: string;
  is_active: boolean;
}

export const {
  useGetAgreementsQuery,
  useGetAgreementQuery,
  useCreateAgreementMutation,
  useUpdateAgreementMutation,
  useDeleteAgreementMutation,
  useGetAgreementPartnersQuery,
  useGetActiveAgreementPartnersQuery,
  useGetAgreementSuppliersQuery,
} = agreementsApi;