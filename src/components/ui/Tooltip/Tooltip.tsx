import React from 'react';
import {
  Tooltip as MuiTooltip,
  TooltipProps as MuiTooltipProps,
  Fade,
  Box,
  Typography,
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import { tokens } from '../../../styles/theme/tokens';

export interface TooltipProps extends MuiTooltipProps {
  /** Контент тултипа */
  title: React.ReactNode;
  /** Элемент, к которому привязан тултип */
  children: React.ReactElement;
  /** Описание (опционально) */
  description?: React.ReactNode;
  /** Задержка появления (мс) */
  enterDelay?: number;
  /** Задержка исчезновения (мс) */
  leaveDelay?: number;
  /** Максимальная ширина */
  maxWidth?: number | string;
  /** Вариант внешнего вида */
  variant?: 'light' | 'dark';
  /** Показывать стрелку */
  arrow?: boolean;
}

const StyledTooltip = styled(({ className, ...props }: TooltipProps) => (
  <MuiTooltip {...props} classes={{ popper: className }} />
))(({ theme }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    '& .MuiTooltip-tooltip': {
      backgroundColor: theme.palette.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.95)' 
        : 'rgba(33, 33, 33, 0.95)',
      color: theme.palette.mode === 'dark' ? themeColors.textPrimary : '#fff',
      fontSize: tokens.typography.fontSize.xs,
      fontFamily: tokens.typography.fontFamily,
      fontWeight: tokens.typography.fontWeight.medium,
      lineHeight: tokens.typography.lineHeight.md,
      borderRadius: tokens.borderRadius.md,
      padding: `${tokens.spacing.xs} ${tokens.spacing.sm}`,
      boxShadow: tokens.shadows.md,
      maxWidth: 300,
      wordWrap: 'break-word',
      transition: `opacity ${tokens.transitions.duration.fast} ${tokens.transitions.easing.easeInOut}`,
    },
    '& .MuiTooltip-arrow': {
      color: theme.palette.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.95)' 
        : 'rgba(33, 33, 33, 0.95)',
      transition: tokens.transitions.duration.fast,
    },
  };
});

/**
 * Компонент тултипа
 * 
 * @example
 * <Tooltip title="Подсказка">
 *   <Button>Наведи на меня</Button>
 * </Tooltip>
 */
export const Tooltip: React.FC<TooltipProps> = ({
  children,
  title,
  description,
  enterDelay = 200,
  leaveDelay = 0,
  maxWidth = 300,
  variant = 'dark',
  arrow = true,
  placement = 'top',
  ...props
}) => {
  const tooltipContent = (
    <Box>
      {typeof title === 'string' ? (
        <Typography variant="subtitle2" component="div" gutterBottom={!!description}>
          {title}
        </Typography>
      ) : (
        title
      )}
      {description && (
        typeof description === 'string' ? (
          <Typography variant="body2" color="textSecondary">
            {description}
          </Typography>
        ) : (
          description
        )
      )}
    </Box>
  );

  return (
    <StyledTooltip
      title={tooltipContent}
      placement={placement}
      arrow={arrow}
      TransitionProps={{ timeout: parseInt(tokens.transitions.duration.fast) }}
      {...props}
      sx={{
        '& .MuiTooltip-tooltip': {
          maxWidth,
        },
        ...props.sx,
      }}
    >
      {children}
    </StyledTooltip>
  );
};

export default Tooltip;
