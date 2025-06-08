/**
 * Состояние загрузки файла
 */
export type FileUploadStatus = 'idle' | 'uploading' | 'success' | 'error';

/**
 * Информация о загружаемом файле
 */
export interface FileInfo {
  /**
   * Имя файла
   */
  name: string;
  
  /**
   * Размер файла в байтах
   */
  size: number;
  
  /**
   * MIME-тип файла
   */
  type: string;
  
  /**
   * Прогресс загрузки (0-100)
   */
  progress?: number;
}

/**
 * Пропсы компонента FileUpload
 */
export interface FileUploadProps {
  /**
   * Разрешенные типы файлов (например, '.jpg,.png')
   */
  accept?: string;
  
  /**
   * Максимальный размер файла в байтах
   */
  maxSize?: number;
  
  /**
   * Разрешить выбор нескольких файлов
   * @default false
   */
  multiple?: boolean;
  
  /**
   * Текст для зоны перетаскивания
   * @default 'Перетащите файлы сюда или нажмите для выбора'
   */
  dropzoneText?: string;
  
  /**
   * Колбэк при успешной загрузке файла
   */
  onUploadSuccess?: (file: FileInfo) => void;
  
  /**
   * Колбэк при ошибке загрузки
   */
  onUploadError?: (error: Error, file?: FileInfo) => void;
  
  /**
   * Колбэк при изменении прогресса загрузки
   */
  onProgress?: (progress: number, file: FileInfo) => void;
  
  /**
   * Дополнительные стили
   */
  sx?: Record<string, any>;

  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  label?: string;
} 