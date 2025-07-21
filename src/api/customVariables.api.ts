import { baseApi } from './baseApi';

// Типы для Custom Variables
export interface CustomVariable {
  id: number;
  name: string;
  description?: string;
  example_value?: string;
  category: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  variable_placeholder: string;
  category_name: string;
  created_by: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
  };
}

export interface CreateCustomVariableRequest {
  name: string;
  description?: string;
  example_value?: string;
  category: string;
  is_active: boolean;
}

export interface UpdateCustomVariableRequest {
  name?: string;
  description?: string;
  example_value?: string;
  category?: string;
  is_active?: boolean;
}

export interface CustomVariableFilters {
  search?: string;
  category?: string;
  active?: boolean;
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
}

export interface CategoryOption {
  value: string;
  label: string;
}

export interface VariablesByCategory {
  category: string;
  category_name: string;
  variables: CustomVariable[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    per_page: number;
    total_items: number;
    total_pages: number;
  };
}

// API endpoints
export const customVariablesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCustomVariables: builder.query<PaginatedResponse<CustomVariable>, CustomVariableFilters | void>({
      query: (filters: CustomVariableFilters = {}) => {
        const params = new URLSearchParams();
        
        if (filters.search) params.append('search', filters.search);
        if (filters.category) params.append('category', filters.category);
        if (filters.active !== undefined) params.append('active', filters.active.toString());
        if (filters.page) params.append('page', filters.page.toString());
        if (filters.per_page) params.append('per_page', filters.per_page.toString());
        if (filters.sort_by) params.append('sort_by', filters.sort_by);
        if (filters.sort_direction) params.append('sort_direction', filters.sort_direction);

        return `custom_variables?${params.toString()}`;
      },
      providesTags: ['CustomVariable'],
    }),

    getCustomVariable: builder.query<CustomVariable, number>({
      query: (id) => `custom_variables/${id}`,
      providesTags: (result, error, id) => [{ type: 'CustomVariable', id }],
    }),

    createCustomVariable: builder.mutation<CustomVariable, CreateCustomVariableRequest>({
      query: (data) => ({
        url: 'custom_variables',
        method: 'POST',
        body: { custom_variable: data },
      }),
      invalidatesTags: ['CustomVariable'],
    }),

    updateCustomVariable: builder.mutation<CustomVariable, { id: number; data: UpdateCustomVariableRequest }>({
      query: ({ id, data }) => ({
        url: `custom_variables/${id}`,
        method: 'PUT',
        body: { custom_variable: data },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'CustomVariable', id }],
    }),

    deleteCustomVariable: builder.mutation<void, number>({
      query: (id) => ({
        url: `custom_variables/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['CustomVariable'],
    }),

    getVariablesByCategory: builder.query<{ data: VariablesByCategory[] }, void>({
      query: () => 'custom_variables/by_category',
      providesTags: ['CustomVariable'],
    }),

    getVariableCategories: builder.query<{ data: CategoryOption[] }, void>({
      query: () => 'custom_variables/categories',
    }),

    // Методы для работы с переменными в шаблонах
    addVariableToTemplate: builder.mutation<any, { templateId: number; customVariableId: number }>({
      query: ({ templateId, customVariableId }) => ({
        url: `email_templates/${templateId}/add_custom_variable`,
        method: 'POST',
        body: { custom_variable_id: customVariableId },
      }),
      invalidatesTags: ['EmailTemplate', 'CustomVariable'],
    }),

    removeVariableFromTemplate: builder.mutation<any, { templateId: number; customVariableId: number }>({
      query: ({ templateId, customVariableId }) => ({
        url: `email_templates/${templateId}/remove_custom_variable/${customVariableId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['EmailTemplate', 'CustomVariable'],
    }),
  }),
});

export const {
  useGetCustomVariablesQuery,
  useGetCustomVariableQuery,
  useCreateCustomVariableMutation,
  useUpdateCustomVariableMutation,
  useDeleteCustomVariableMutation,
  useGetVariablesByCategoryQuery,
  useGetVariableCategoriesQuery,
  useAddVariableToTemplateMutation,
  useRemoveVariableFromTemplateMutation,
} = customVariablesApi; 