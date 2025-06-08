import { ListProps as MuiListProps } from '@mui/material/List';
import { ListItemProps as MuiListItemProps } from '@mui/material/ListItem';

/**
 * Пропсы для компонента List
 */
export interface ListProps extends Omit<MuiListProps, 'dense'> {
  /**
   * Компактный вид списка
   */
  compact?: boolean;

  /**
   * Отключить отступы между элементами
   */
  disableGutters?: boolean;
}

/**
 * Пропсы для компонента ListItem
 */
export interface ListItemProps extends Omit<MuiListItemProps, 'dense'> {
  /**
   * Компактный вид элемента
   */
  compact?: boolean;

  /**
   * Отключить отступы
   */
  disableGutters?: boolean;

  /**
   * Иконка слева
   */
  startIcon?: React.ReactNode;

  /**
   * Иконка справа
   */
  endIcon?: React.ReactNode;

  /**
   * Дополнительный текст
   */
  secondaryText?: string;
} 