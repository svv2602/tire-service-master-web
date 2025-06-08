import { AppBarProps as MuiAppBarProps } from '@mui/material';

export interface AppBarProps extends Partial<MuiAppBarProps> {
  /** Заголовок в AppBar */
  title: string;
  /** Колбэк для открытия бокового меню */
  onMenuClick?: () => void;
  /** Дополнительные действия справа */
  actions?: React.ReactNode;
  /** Включить поддержку цвета в темной теме */
  enableColorOnDark?: boolean;
}