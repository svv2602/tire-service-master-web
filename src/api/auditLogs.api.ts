import { baseApi } from './baseApi';

// Типы для аудит логов
export interface AuditLog {
  id: number;
  user_id: number | null;
  user_name: string;
  user_email: string | null;
  action: string;
  action_description: string;
  resource_type: string | null;
  resource_id: number | null;
  resource_name: string | null;
  ip_address: string | null;
  created_at: string;
}

export interface AuditLogDetailed extends AuditLog {
  old_value: any;
  new_value: any;
  changes: any;
  additional_data: any;
  user_agent: string | null;
  updated_at: string;
}

export interface AuditLogsResponse {
  data: AuditLog[];
  meta: {
    current_page: number;
    total_pages: number;
    total_count: number;
    per_page: number;
    filters_applied: Record<string, any>;
  };
}

export interface AuditLogsQueryParams {
  page?: number;
  per_page?: number;
  user_id?: number;
  user_email?: string;
  action?: string;
  resource_type?: string;
  resource_id?: number;
  date_from?: string; // YYYY-MM-DD
  date_to?: string; // YYYY-MM-DD
  ip_address?: string;
}

export interface AuditStatsResponse {
  data: {
    period: {
      days: number;
      from: string;
      to: string;
    };
    total_logs: number;
    actions: Record<string, number>;
    top_users: Array<{
      email: string;
      actions_count: number;
    }>;
    resources: Array<{
      resource_type: string;
      changes_count: number;
    }>;
    daily_activity: Array<{
      date: string;
      count: number;
    }>;
    hourly_activity: Array<{
      hour: number;
      count: number;
    }>;
    top_ips: Array<{
      ip_address: string;
      requests_count: number;
    }>;
    action_resource_matrix: Record<string, Record<string, number>>;
  };
  generated_at: string;
}

export const auditLogsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAuditLogs: builder.query<AuditLogsResponse, AuditLogsQueryParams>({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        
        if (params.page) searchParams.append('page', params.page.toString());
        if (params.per_page) searchParams.append('per_page', params.per_page.toString());
        if (params.user_id) searchParams.append('user_id', params.user_id.toString());
        if (params.user_email) searchParams.append('user_email', params.user_email);
        if (params.action) searchParams.append('action', params.action);
        if (params.resource_type) searchParams.append('resource_type', params.resource_type);
        if (params.resource_id) searchParams.append('resource_id', params.resource_id.toString());
        if (params.date_from) searchParams.append('date_from', params.date_from);
        if (params.date_to) searchParams.append('date_to', params.date_to);
        if (params.ip_address) searchParams.append('ip_address', params.ip_address);
        
        return `audit_logs${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
      },
      providesTags: ['AuditLog'],
    }),

    getAuditLogDetail: builder.query<{ data: AuditLogDetailed }, number>({
      query: (logId) => `audit_logs/${logId}`,
      providesTags: (result, error, logId) => [
        { type: 'AuditLog', id: logId },
      ],
    }),

    getAuditStats: builder.query<AuditStatsResponse, { days?: number }>({
      query: ({ days = 30 } = {}) => `audit_logs/stats?days=${days}`,
      providesTags: ['AuditLog'],
    }),

    exportAuditLogs: builder.query<Blob, AuditLogsQueryParams>({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        
        if (params.user_id) searchParams.append('user_id', params.user_id.toString());
        if (params.user_email) searchParams.append('user_email', params.user_email);
        if (params.action) searchParams.append('action', params.action);
        if (params.resource_type) searchParams.append('resource_type', params.resource_type);
        if (params.resource_id) searchParams.append('resource_id', params.resource_id.toString());
        if (params.date_from) searchParams.append('date_from', params.date_from);
        if (params.date_to) searchParams.append('date_to', params.date_to);
        if (params.ip_address) searchParams.append('ip_address', params.ip_address);
        
        return {
          url: `audit_logs/export.csv${searchParams.toString() ? '?' + searchParams.toString() : ''}`,
          responseHandler: (response: Response) => response.blob(),
        };
      },
    }),
  }),
});

export const {
  useGetAuditLogsQuery,
  useGetAuditLogDetailQuery,
  useGetAuditStatsQuery,
  useLazyExportAuditLogsQuery,
} = auditLogsApi; 