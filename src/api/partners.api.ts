import { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { baseApi } from './baseApi';
import { 
  Partner, 
  PartnerFormData, 
  PartnerFilter, 
  ApiResponse,
} from '../types/models';
import { transformPaginatedResponse } from './apiUtils';

export const partnersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getPartners: build.query<ApiResponse<Partner>, PartnerFilter>({
      query: (params = {}) => ({
        url: 'partners',
        params,
      }),
      transformResponse: (response: ApiResponse<Partner>) => transformPaginatedResponse(response),
      providesTags: (result) =>
        result?.data && Array.isArray(result.data)
          ? [
              ...result.data.map(({ id }: Partner) => ({ type: 'Partners' as const, id })),
              'Partners',
            ]
          : ['Partners'],
    }),
    
    getPartnerById: build.query<Partner, number>({
      query: (id) => `partners/${id}`,
      providesTags: (_result, _err, id) => [{ type: 'Partners' as const, id }],
    }),
    
    createPartner: build.mutation<Partner, { partner: PartnerFormData }>({
      query: (data) => {
        console.log('=== createPartner API query ===');
        console.log('Partner data:', data.partner);
        console.log('Has logo file:', (data.partner as any).logo_file instanceof File);
        
        // Если есть файл логотипа, используем FormData
        if ((data.partner as any).logo_file instanceof File) {
          console.log('Using FormData because logo_file is a File');
          const formData = new FormData();
          
          // Добавляем все поля партнера
          Object.entries(data.partner).forEach(([key, value]) => {
            if (key === 'logo_file' && value instanceof File) {
              formData.append('partner[logo]', value);
            } else if (key === 'user_attributes' && value) {
              // Обрабатываем вложенные атрибуты пользователя
              Object.entries(value as any).forEach(([userKey, userValue]) => {
                if (userValue !== undefined && userValue !== null) {
                  formData.append(`partner[user_attributes][${userKey}]`, String(userValue));
                }
              });
            } else if (value !== undefined && value !== null && key !== 'logo_url') {
              formData.append(`partner[${key}]`, String(value));
            }
          });
          
          return {
            url: 'partners',
            method: 'POST',
            body: formData,
          };
        } else {
          // Если нет файла, используем JSON
          console.log('Using JSON because no file upload');
          return {
            url: 'partners',
            method: 'POST',
            body: data,
          };
        }
      },
      invalidatesTags: ['Partners'],
    }),
    
    updatePartner: build.mutation<Partner, { id: number; partner: Partial<PartnerFormData> }>({
      query: ({ id, partner }) => {
        console.log('=== updatePartner API query ===');
        console.log('ID:', id);
        console.log('Partner data:', partner);
        console.log('Has logo file:', (partner as any).logo_file instanceof File);
        
        // Если есть файл логотипа, используем FormData
        if ((partner as any).logo_file instanceof File) {
          console.log('Using FormData because logo_file is a File');
          const formData = new FormData();
          
          // Добавляем все поля партнера
          Object.entries(partner).forEach(([key, value]) => {
            if (key === 'logo_file' && value instanceof File) {
              formData.append('partner[logo]', value);
            } else if (key === 'user_attributes' && value) {
              // Обрабатываем вложенные атрибуты пользователя
              Object.entries(value as any).forEach(([userKey, userValue]) => {
                if (userValue !== undefined && userValue !== null) {
                  formData.append(`partner[user_attributes][${userKey}]`, String(userValue));
                }
              });
            } else if (value !== undefined && value !== null && key !== 'logo_url') {
              formData.append(`partner[${key}]`, String(value));
            }
          });
          
          return {
            url: `partners/${id}`,
            method: 'PATCH',
            body: formData,
          };
        } else {
          // Если нет файла, используем JSON
          console.log('Using JSON because no file upload');
          return {
            url: `partners/${id}`,
            method: 'PATCH',
            body: { partner },
          };
        }
      },
      invalidatesTags: (_result, _err, { id }) => [
        { type: 'Partners' as const, id },
        'Partners',
      ],
    }),
    
    deletePartner: build.mutation<{ action?: string; message?: string; partner?: Partner } | void, number>({
      query: (id) => ({
        url: `partners/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Partners'],
    }),

    togglePartnerActive: build.mutation<Partner, { id: number; isActive: boolean }>({
      query: ({ id, isActive }) => ({
        url: `partners/${id}/toggle_active`,
        method: 'PATCH',
        body: { partner: { is_active: isActive } },
      }),
      invalidatesTags: (_result, _err, { id }) => [
        { type: 'Partners' as const, id },
        'Partners',
      ],
    }),

    getPartnerRelatedData: build.query<{
      service_points_count: number;
      operators_count: number;
      service_points: Array<{ 
        id: number; 
        name: string; 
        address: string;
        is_active: boolean;
        work_status: string;
      }>;
      operators: Array<{ 
        id: number; 
        is_active: boolean;
        position: string;
        user: { 
          id: number;
          first_name: string; 
          last_name: string; 
          email: string;
          is_active: boolean;
        } 
      }>;
    }, number>({
      query: (id) => `partners/${id}/related_data`,
      providesTags: (_result, _err, id) => [{ type: 'Partners' as const, id }],
    }),
    
    // Создание тестового партнера
    createTestPartner: build.mutation<Partner, void>({
      query: () => ({
        url: 'partners/create_test',
        method: 'POST',
      }),
      invalidatesTags: ['Partners'],
    }),
  }),
});

export const {
  useGetPartnersQuery,
  useGetPartnerByIdQuery,
  useCreatePartnerMutation,
  useUpdatePartnerMutation,
  useDeletePartnerMutation,
  useTogglePartnerActiveMutation,
  useGetPartnerRelatedDataQuery,
  useCreateTestPartnerMutation,
} = partnersApi; 