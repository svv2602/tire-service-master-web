import { MenuProps as MuiMenuProps } from '@mui/material/Menu';
import { MenuItemProps as MuiMenuItemProps } from '@mui/material/MenuItem';

/**
 * Элемент меню
 */
export interface MenuItem {
  /**
   * Уникальный идентификатор элемента
   */
  id: string | number;
  
  /**
   * Текст элемента меню
   */
  label: string;
  
  /**
   * Иконка элемента меню
   */
  icon?: React.ReactNode;
  
  /**
   * Отключен ли элемент
   */
  disabled?: boolean;
  
  /**
   * Разделитель после элемента
   */
  divider?: boolean;
}

/**
 * Пропсы для компонента Menu
 */
export interface MenuProps {
  /**
   * Список элементов меню
   */
  items: MenuItem[];
  
  /**
   * Колбэк при выборе элемента
   */
  onSelect: (item: MenuItem) => void;
  
  /**
   * Элемент, относительно которого открывается меню
   */
  anchorEl: HTMLElement | null;

  /**
   * Открыто ли меню
   */
  open: boolean;

  /**
   * Колбэк при закрытии меню
   */
  onClose?: MuiMenuProps['onClose'];
}

/**
 * Пропсы для компонента MenuItem
 */
export interface MenuItemComponentProps {
  /**
   * Данные элемента меню
   */
  item: MenuItem;
  
  /**
   * Колбэк при клике
   */
  onSelect: (item: MenuItem) => void;

  /**
   * Отключен ли элемент
   */
  disabled?: boolean;
} 