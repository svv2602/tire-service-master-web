import React from 'react';
import {
  Tooltip as MuiTooltip,
  TooltipProps as MuiTooltipProps,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { tokens } from '../../../styles/theme/tokens';

export interface TooltipProps extends Omit<MuiTooltipProps, 'title'> {
  /** Текст подсказки */
  title: string;
  /** Элемент, к которому привязан тултип */
  children: React.ReactElement;
  /** Задержка появления (мс) */
  enterDelay?: number;
  /** Задержка исчезновения (мс) */
  leaveDelay?: number;
  /** Максимальная ширина */
  maxWidth?: number;
  /** Вариант внешнего вида */
  variant?: 'light' | 'dark';
  /** Показывать стрелку */
  arrow?: boolean;
}

const StyledTooltip = styled(MuiTooltip, {
  // Исключаем кастомные пропы из передачи в DOM
  shouldForwardProp: (prop) => prop !== 'variant' && prop !== 'maxWidth',
})<TooltipProps>(({ theme, variant = 'dark', maxWidth = 300 }) => ({
  '& .MuiTooltip-tooltip': {
    backgroundColor: variant === 'light' 
      ? 'rgba(255, 255, 255, 0.95)' 
      : 'rgba(33, 33, 33, 0.95)',
    color: variant === 'light' ? '#333' : '#fff',
    fontSize: tokens.typography.fontSize.xs,
    fontFamily: tokens.typography.fontFamily,
    fontWeight: tokens.typography.fontWeight.medium,
    lineHeight: tokens.typography.lineHeight.md,
    borderRadius: tokens.borderRadius.md,
    padding: `${tokens.spacing.xs} ${tokens.spacing.sm}`,
    boxShadow: variant === 'light' 
      ? '0 2px 8px rgba(0,0,0,0.15)' 
      : '0 2px 8px rgba(0,0,0,0.3)',
    maxWidth: maxWidth,
    wordWrap: 'break-word',
    border: variant === 'light' ? '1px solid rgba(0,0,0,0.12)' : 'none',
  },
  '& .MuiTooltip-arrow': {
    color: variant === 'light' 
      ? 'rgba(255, 255, 255, 0.95)' 
      : 'rgba(33, 33, 33, 0.95)',
    '&::before': {
      border: variant === 'light' ? '1px solid rgba(0,0,0,0.12)' : 'none',
    },
  },
}));

/**
 * Централизованный компонент подсказки (Tooltip)
 * 
 * @example
 * // Простая подсказка
 * <Tooltip title="Это подсказка">
 *   <Button>Наведи на меня</Button>
 * </Tooltip>
 * 
 * // Светлая тема
 * <Tooltip title="Светлая подсказка" variant="light">
 *   <IconButton><EditIcon /></IconButton>
 * </Tooltip>
 * 
 * // Кастомная задержка
 * <Tooltip title="Быстрая подсказка" enterDelay={100}>
 *   <Chip label="Быстро" />
 * </Tooltip>
 */
export const Tooltip: React.FC<TooltipProps> = ({
  children,
  title,
  enterDelay = 200,
  leaveDelay = 0,
  maxWidth = 300,
  variant = 'dark',
  arrow = true,
  placement = 'top',
  ...props
}) => {
  // Если title пустой, возвращаем просто children без tooltip
  if (!title || title.trim() === '') {
    return children;
  }

  return (
    <StyledTooltip
      title={title}
      placement={placement}
      arrow={arrow}
      enterDelay={enterDelay}
      leaveDelay={leaveDelay}
      variant={variant}
      maxWidth={maxWidth}
      {...props}
    >
      {children}
    </StyledTooltip>
  );
};

export default Tooltip;
