import { ToolbarProps as MuiToolbarProps } from '@mui/material/Toolbar';

/**
 * Пропсы для компонента Toolbar
 * Расширяет стандартные пропсы MUI Toolbar
 */
export interface ToolbarProps extends MuiToolbarProps {
  // Здесь можно добавить дополнительные пропсы
  className?: string;
} 