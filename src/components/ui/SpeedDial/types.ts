import { SpeedDialProps as MuiSpeedDialProps } from '@mui/material/SpeedDial';
import { SpeedDialActionProps as MuiSpeedDialActionProps } from '@mui/material/SpeedDialAction';
import { SvgIconProps } from '@mui/material/SvgIcon';

/**
 * Действие для SpeedDial
 */
export interface SpeedDialAction {
  /**
   * Уникальный идентификатор действия
   */
  id: string | number;

  /**
   * Иконка действия
   */
  icon: React.ReactElement<SvgIconProps>;

  /**
   * Подпись к действию
   */
  tooltipTitle: string;

  /**
   * Callback при клике на действие
   */
  onClick?: () => void;

  /**
   * Отключено ли действие
   * @default false
   */
  disabled?: boolean;
}

/**
 * Пропсы компонента SpeedDial
 */
export interface SpeedDialProps extends Omit<MuiSpeedDialProps, 'children'> {
  /**
   * Список действий
   */
  actions: SpeedDialAction[];

  /**
   * Иконка основной кнопки
   */
  icon?: React.ReactElement<SvgIconProps>;

  /**
   * Позиция на экране
   * @default 'bottom-right'
   */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

  /**
   * Отступы от краев экрана
   * @default 16
   */
  margin?: number;

  /**
   * Направление открытия меню
   * @default 'up'
   */
  direction?: 'up' | 'down' | 'left' | 'right';

  /**
   * Подпись к основной кнопке
   */
  tooltipTitle?: string;

  /**
   * Пропсы для каждого SpeedDialAction
   */
  SpeedDialActionProps?: Partial<MuiSpeedDialActionProps>;
} 