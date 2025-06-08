import { SxProps, Theme } from '@mui/material';
import { TabProps } from '@mui/material/Tab';
import { ReactNode, ReactElement } from 'react';

/**
 * Описание отдельной вкладки
 */
export interface TabItem {
  /** Уникальный идентификатор вкладки */
  id: string;
  /** Текст вкладки */
  label: string;
  /** Иконка вкладки (опционально) */
  icon?: string | ReactElement;
  /** Позиция иконки (опционально) */
  iconPosition?: 'top' | 'bottom' | 'start' | 'end';
  /** Содержимое вкладки */
  content?: ReactNode;
  /** Отключена ли вкладка */
  disabled?: boolean;
}

/**
 * Свойства компонента Tabs
 */
export interface TabsProps {
  /** Массив вкладок */
  tabs: TabItem[];
  /** Индекс активной вкладки */
  value: number;
  /** Обработчик изменения активной вкладки */
  onChange: (event: React.SyntheticEvent, newValue: number) => void;
  /** Вариант отображения */
  variant?: 'standard' | 'scrollable' | 'fullWidth';
  /** Ориентация вкладок */
  orientation?: 'horizontal' | 'vertical';
  /** Центрировать вкладки */
  centered?: boolean;
  /** Отображение кнопок прокрутки */
  scrollButtons?: 'auto' | true | false;
  /** Разрешить кнопки прокрутки на мобильных */
  allowScrollButtonsMobile?: boolean;
  /** Дополнительные стили */
  sx?: SxProps<Theme>;
}