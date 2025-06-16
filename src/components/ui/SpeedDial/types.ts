import { SpeedDialProps as MuiSpeedDialProps } from '@mui/material/SpeedDial';
import { ReactNode } from 'react';
import { SxProps } from '@mui/material';
import { Theme } from '@mui/material/styles';

/**
 * Элемент меню в SpeedDial
 */
export interface SpeedDialAction {
  /**
   * Уникальный идентификатор действия
   */
  id?: string;
  
  /**
   * Название действия (отображается в тултипе)
   */
  name: string;
  
  /**
   * Иконка действия
   */
  icon: ReactNode;
  
  /**
   * Обработчик клика по действию
   */
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  
  /**
   * Флаг отключения действия
   */
  disabled?: boolean;
  
  /**
   * Цвет кнопки действия
   */
  color?: string;
  
  /**
   * Текст тултипа (для обратной совместимости)
   * @deprecated Используйте name вместо tooltipTitle
   */
  tooltipTitle?: string;
}

/**
 * Пропсы компонента SpeedDial
 */
export interface SpeedDialProps {
  /**
   * Список действий
   */
  actions?: SpeedDialAction[];
  
  /**
   * Иконка основной кнопки
   */
  icon?: ReactNode;
  
  /**
   * Направление открытия меню
   * @default 'up'
   */
  direction?: 'up' | 'down' | 'left' | 'right';
  
  /**
   * Флаг скрытия компонента
   * @default false
   */
  hidden?: boolean;
  
  /**
   * Текст для aria-label
   * @default 'Быстрые действия'
   */
  ariaLabel?: string;
  
  /**
   * Текст тултипа для основной кнопки
   */
  tooltipTitle?: string;
  
  /**
   * Флаг постоянного отображения тултипов
   * @default false
   */
  tooltipOpen?: boolean;
  
  /**
   * Позиция тултипа
   * @default 'left'
   */
  tooltipPlacement?: 'top' | 'right' | 'bottom' | 'left';
  
  /**
   * Позиция SpeedDial (для обратной совместимости)
   * @deprecated
   */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  
  /**
   * Флаг открытия SpeedDial
   */
  open?: boolean;
  
  /**
   * Обработчик закрытия
   */
  onClose?: () => void;
  
  /**
   * Обработчик открытия
   */
  onOpen?: () => void;
  
  /**
   * Дополнительные стили
   */
  sx?: SxProps<Theme>;
} 