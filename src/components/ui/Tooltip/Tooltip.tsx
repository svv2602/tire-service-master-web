import React from 'react';
import {
  Tooltip as MuiTooltip,
  TooltipProps as MuiTooltipProps,
  Fade,
  Box,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { SIZES, ANIMATIONS, getThemeColors } from '../../../styles/theme';

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
))(({ theme }) => ({
  '& .MuiTooltip-tooltip': {
    backgroundColor: theme.palette.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.9)' 
      : 'rgba(0, 0, 0, 0.9)',
    color: theme.palette.mode === 'dark' ? '#000' : '#fff',
    fontSize: 12,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(1, 1.5),
    boxShadow: theme.shadows[1],
    maxWidth: 300,
    wordWrap: 'break-word',
  },
  '& .MuiTooltip-arrow': {
    color: theme.palette.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.9)' 
      : 'rgba(0, 0, 0, 0.9)',
  },
}));

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
      TransitionProps={{ timeout: parseInt(ANIMATIONS.transition.fast) }}
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