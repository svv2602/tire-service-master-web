import { GridProps as MuiGridProps } from '@mui/material';
import { ReactNode } from 'react';
import { SxProps, Theme } from '@mui/material/styles';

/**
 * Свойства компонента Grid
 */
export interface GridProps extends Omit<MuiGridProps, 'xs' | 'sm' | 'md' | 'lg' | 'xl'> {
  /** Дочерние элементы */
  children?: ReactNode;
  /** CSS класс */
  className?: string;
  /** Является ли компонент контейнером */
  container?: boolean;
  /** Является ли компонент элементом сетки */
  item?: boolean;
  /** Расстояние между элементами (0-10) */
  spacing?: number | { xs?: number; sm?: number; md?: number; lg?: number; xl?: number };
  /** Выравнивание по горизонтали */
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
  /** Выравнивание по вертикали */
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
  /** Направление flex-контейнера */
  direction?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
  /** Перенос элементов */
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  /** Размер для xs брейкпоинта (0-12 или 'auto') */
  xs?: number | boolean;
  /** Размер для sm брейкпоинта (0-12 или 'auto') */
  sm?: number | boolean;
  /** Размер для md брейкпоинта (0-12 или 'auto') */
  md?: number | boolean;
  /** Размер для lg брейкпоинта (0-12 или 'auto') */
  lg?: number | boolean;
  /** Размер для xl брейкпоинта (0-12 или 'auto') */
  xl?: number | boolean;
  /** Дополнительные стили */
  sx?: SxProps<Theme>;
}