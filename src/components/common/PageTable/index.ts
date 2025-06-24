import React from 'react';

export { PageTable } from './PageTable';
export { PageHeader } from './PageHeader';
export { SearchAndFilters } from './SearchAndFilters';
export { RowActions } from './RowActions';

// Типы PageTable
/** Колонка таблицы */
export interface Column<T = any> {
  /** Уникальный идентификатор колонки */
  id: string;
  /** Название колонки */
  label: string;
  /** Минимальная ширина */
  minWidth?: number;
  /** Максимальная ширина */
  maxWidth?: number;
  /** Выравнивание содержимого */
  align?: 'left' | 'center' | 'right';
  /** Сортируемая колонка */
  sortable?: boolean;
  /** Скрывать на мобильных устройствах */
  hideOnMobile?: boolean;
  /** Перенос текста */
  wrap?: boolean;
  /** Функция форматирования значения */
  format?: (value: any, row: T, index?: number) => React.ReactNode | { type: 'chip'; label: string; color?: string; size?: string; };
  /** Функция рендеринга (альтернатива format) */
  render?: (row: T, index?: number) => React.ReactNode;
}

/** Конфигурация действия над строкой */
export interface ActionConfig<T = any> {
  /** Уникальный идентификатор действия */
  id?: string;
  /** Название действия */
  label: string | ((row: T) => string);
  /** Иконка действия */
  icon: React.ReactNode | ((row: T) => React.ReactNode);
  /** Цвет кнопки */
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' | ((row: T) => 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success');
  /** Вариант кнопки */
  variant?: 'text' | 'outlined' | 'contained';
  /** Функция для определения видимости действия */
  isVisible?: (row: T) => boolean;
  /** Функция для определения доступности действия */
  isDisabled?: (row: T) => boolean;
  /** Обработчик клика */
  onClick: (row: T, index?: number) => void;
  /** Подсказка */
  tooltip?: string | ((row: T) => string);
  /** Подтверждение перед выполнением */
  requireConfirmation?: boolean;
  /** Конфигурация диалога подтверждения */
  confirmationConfig?: ConfirmationDialogConfig;
  /** Текст подтверждения (устаревшее, используйте confirmationConfig) */
  confirmationText?: string;
}

/** Конфигурация диалога подтверждения */
export interface ConfirmationDialogConfig {
  /** Заголовок диалога */
  title: string;
  /** Сообщение диалога */
  message: string;
  /** Текст кнопки подтверждения */
  confirmLabel?: string;
  /** Текст кнопки отмены */
  cancelLabel?: string;
}

/** Конфигурация фильтра */
export interface FilterConfig {
  /** Идентификатор фильтра */
  id: string;
  /** Название фильтра */
  label: string;
  /** Тип фильтра */
  type: 'select' | 'multiselect' | 'date' | 'dateRange' | 'text';
  /** Опции для select/multiselect */
  options?: Array<{ value: string | number; label: string }>;
  /** Текущее значение */
  value?: any;
  /** Плейсхолдер */
  placeholder?: string;
  /** Обработчик изменения */
  onChange: (value: any) => void;
}

/** Конфигурация заголовка страницы */
export interface PageHeaderConfig {
  /** Заголовок страницы */
  title: string;
  /** Подзаголовок */
  subtitle?: string;
  /** Кнопки действий */
  actions?: Array<{
    id?: string;
    label: string;
    icon?: React.ReactNode;
    color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
    variant?: 'text' | 'outlined' | 'contained';
    onClick: () => void;
  }>;
}

/** Конфигурация поиска */
export interface SearchConfig {
  /** Плейсхолдер для поиска */
  placeholder?: string;
  /** Текущее значение поиска */
  value: string;
  /** Обработчик изменения поиска */
  onChange: (value: string) => void;
  /** Обработчик очистки поиска */
  onClear?: () => void;
  /** Показать кнопку очистки */
  showClearButton?: boolean;
}

/** Пропсы PageTable */
export interface PageTableProps<T = any> {
  /** Конфигурация заголовка */
  header?: PageHeaderConfig;
  /** Конфигурация поиска */
  search?: SearchConfig;
  /** Конфигурация фильтров */
  filters?: FilterConfig[];
  /** Колонки таблицы */
  columns: Column<T>[];
  /** Данные таблицы */
  rows: T[];
  /** Действия над строками */
  actions?: ActionConfig<T>[];
  /** Состояние загрузки */
  loading?: boolean;
  /** Кастомное пустое состояние */
  empty?: React.ReactNode;
  /** Конфигурация пустого состояния */
  emptyState?: {
    title?: string;
    description?: string;
    icon?: React.ReactNode;
    action?: {
      label: string;
      icon?: React.ReactNode;
      onClick: () => void;
    };
  };
  /** Адаптивность */
  responsive?: boolean;
  /** Обработчик клика по строке */
  onRowClick?: (row: T, index: number) => void;
  /** Конфигурация пагинации */
  pagination?: {
    page: number;
    rowsPerPage: number;
    totalItems: number;
    onPageChange: (page: number) => void;
    onRowsPerPageChange?: (rowsPerPage: number) => void;
    rowsPerPageOptions?: number[];
  };
  /** Дополнительные пропсы для Table */
  tableProps?: Record<string, any>;
}

// Алиасы для обратной совместимости
export type HeaderConfig = PageHeaderConfig; 