import { DrawerProps as MuiDrawerProps } from '@mui/material/Drawer';
import { ReactNode } from 'react';
import { SxProps } from '@mui/material';
import { Theme } from '@mui/material/styles';

/**
 * Элемент меню в Drawer
 */
export interface DrawerItem {
  /**
   * Уникальный идентификатор элемента
   */
  id?: string | number;
  
  /**
   * Текст элемента
   */
  text: string;
  
  /**
   * Иконка элемента
   */
  icon?: ReactNode;
  
  /**
   * URL для ссылки
   */
  href?: string;
  
  /**
   * Обработчик клика
   */
  onClick?: () => void;
  
  /**
   * Флаг отключения элемента
   */
  disabled?: boolean;
}

/**
 * Пропсы для компонента Drawer
 */
export interface DrawerProps extends Omit<MuiDrawerProps, 'variant'> {
  /**
   * Вариант отображения
   * @default 'temporary'
   */
  variant?: 'temporary' | 'persistent' | 'mini';

  /**
   * Ширина drawer в пикселях
   * @default 240
   */
  width?: number;

  /**
   * Ширина mini-варианта в пикселях
   * @default 56
   */
  miniWidth?: number;

  /**
   * Показывать оверлей при открытии (только для temporary)
   * @default true
   */
  overlay?: boolean;
  
  /**
   * Показывать заголовок
   * @default true
   */
  header?: boolean;
  
  /**
   * Элементы меню
   */
  items?: DrawerItem[];
  
  /**
   * ID активного элемента
   */
  activeItemId?: string | number;
  
  /**
   * Обработчик клика по элементу
   */
  onItemClick?: (item: DrawerItem) => void;
  
  /**
   * Содержимое заголовка
   */
  headerContent?: ReactNode;
  
  /**
   * Содержимое футера
   */
  footerContent?: ReactNode;
  
  /**
   * Дополнительные стили
   */
  sx?: SxProps<Theme>;
} 