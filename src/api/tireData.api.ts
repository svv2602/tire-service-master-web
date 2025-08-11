import { baseApi } from './baseApi';

// Типы для работы с данными шин
export interface TireDataStats {
  configurations_count: number;
  active_configurations: number;
  current_version: string;
  last_update: string;
  available_versions: Array<{
    version: string;
    imported_at: string;
  }>;
}

export interface FileValidation {
  valid: boolean;
  exists: boolean;
  readable: boolean;
  errors: string[];
  warnings: string[];
  statistics: {
    rows_count: number;
    columns_count: number;
    file_size: number;
    encoding: string;
    [key: string]: any;
  };
}

export interface ValidationResult {
  valid: boolean;
  files: Record<string, FileValidation>;
  errors: string[];
  warnings: string[];
  statistics: Record<string, any>;
}

export interface UploadResult {
  upload_session_id: string;
  upload_path: string;
  uploaded_files: Record<string, {
    filename: string;
    path: string;
    size: number;
  }>;
}

export interface ImportOptions {
  skip_invalid_rows?: boolean;
  fix_suspicious_sizes?: boolean;
  encoding_fallback?: string;
  force_reload?: boolean;
}

export interface ValidationError {
  record_index: number;
  brand: string;
  model: string;
  tire_size_index?: number;
  tire_size?: {
    width: number;
    height: number;
    diameter: number;
  };
  error: string;
}

export interface ImportResult {
  status: 'success' | 'warning' | 'error';
  message?: string;
  data?: {
    version: string;
    statistics: Record<string, number>;
    warnings?: string[];
    skipped_rows?: number;
    validation_errors?: ValidationError[];
    has_validation_errors?: boolean;
  };
}

// API endpoints для управления данными шин
export const tireDataApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Получение статистики
    getTireDataStats: builder.query<{ status: string; data: TireDataStats }, void>({
      query: () => ({
        url: 'admin/tire_data/status',
        credentials: 'include',
      }),
    }),

    // Загрузка CSV файлов
    uploadTireDataFiles: builder.mutation<{ status: string; data: UploadResult }, FormData>({
      query: (formData) => ({
        url: 'admin/tire_data/upload_files',
        method: 'POST',
        body: formData,
        credentials: 'include',
      }),
    }),

    // Валидация файлов
    validateTireDataFiles: builder.mutation<{ status: string; data: ValidationResult }, { csv_path: string }>({
      query: (data) => ({
        url: 'admin/tire_data/validate_files',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include',
      }),
    }),

    // Импорт данных
    importTireData: builder.mutation<ImportResult, { csv_path: string; version?: string; options?: ImportOptions }>({
      query: (data) => ({
        url: 'admin/tire_data/import',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include',
      }),
    }),

    // Удаление версии
    deleteTireDataVersion: builder.mutation<{ status: string; message: string }, string>({
      query: (version) => ({
        url: `admin/tire_data/version/${version}`,
        method: 'DELETE',
        credentials: 'include',
      }),
    }),

    // Откат к версии
    rollbackTireDataVersion: builder.mutation<{ status: string; message: string }, string>({
      query: (version) => ({
        url: `admin/tire_data/rollback/${version}`,
        method: 'POST',
        credentials: 'include',
      }),
    }),
  }),
});

export const {
  useGetTireDataStatsQuery,
  useUploadTireDataFilesMutation,
  useValidateTireDataFilesMutation,
  useImportTireDataMutation,
  useDeleteTireDataVersionMutation,
  useRollbackTireDataVersionMutation,
} = tireDataApi;