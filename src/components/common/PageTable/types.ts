import React from 'react';
import { Column } from '../../ui/Table/Table';

/** Конфигурация действия над строкой */
export interface ActionConfig {
  /** Уникальный идентификатор действия */
  id: string;
  /** Название действия */
  label: string;
  /** Иконка действия */
  icon: React.ReactNode;
  /** Цвет кнопки */
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  /** Вариант кнопки */
  variant?: 'text' | 'outlined' | 'contained';
  /** Функция для определения видимости действия */
  isVisible?: (row: any) => boolean;
  /** Функция для определения доступности действия */
  isDisabled?: (row: any) => boolean;
  /** Обработчик клика */
  onClick: (row: any, index: number) => void;
  /** Подтверждение перед выполнением */
  requireConfirmation?: boolean;
  /** Текст подтверждения */
  confirmationText?: string;
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
    id: string;
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
  columns: Column[];
  /** Данные таблицы */
  rows: T[];
  /** Действия над строками */
  actions?: ActionConfig[];
  /** Состояние загрузки */
  loading?: boolean;
  /** Кастомное пустое состояние */
  empty?: React.ReactNode;
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