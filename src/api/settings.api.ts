import { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { baseApi } from './baseApi';

// Тип настроек системы
export interface SystemSettings {
  systemName: string;
  contactEmail: string;
  supportPhone: string;
  defaultCityId: string;
  slotDuration: number;
  workdayStart: string;
  workdayEnd: string;
  maxBookingsPerDay: number;
  enableNotifications: boolean;
  enableSmsNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  dateFormat: string;
  timeFormat: string;
  bookingLeadTimeHours?: number;
  workingHoursStart?: string;
  workingHoursEnd?: string;
  allowWeekendBookings?: boolean;
  maintenanceMode?: boolean;
  defaultCurrency?: string;
  paymentGateway?: string;
  maxBookingsPerServicePoint?: number;
  timeSlotDurationMinutes?: number;
}

export const settingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSettings: builder.query<SystemSettings, void>({
      query: () => 'settings',
      providesTags: ['Settings'],
    }),

    updateSettings: builder.mutation<SystemSettings, Partial<SystemSettings>>({
      query: (data: Partial<SystemSettings>) => ({
        url: 'settings',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Settings'],
    }),
  }),
});

// Экспортируем сгенерированные хуки
export const { 
  useGetSettingsQuery,
  useUpdateSettingsMutation
} = settingsApi;
