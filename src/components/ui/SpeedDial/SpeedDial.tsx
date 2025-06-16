import React from 'react';
import MuiSpeedDial from '@mui/material/SpeedDial';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import { styled, useTheme } from '@mui/material/styles';
import { SpeedDialProps } from './types';
import { tokens } from '../../../styles/theme/tokens';

/**
 * Стилизованный компонент SpeedDial с поддержкой позиционирования
 */
const StyledSpeedDial = styled(MuiSpeedDial, {
  shouldForwardProp: (prop) => !['position', 'margin'].includes(prop as string),
})<{ position?: string; margin?: number }>(({ position = 'bottom-right', margin = 16, theme }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  const positions = {
    'top-left': { top: margin, left: margin },
    'top-right': { top: margin, right: margin },
    'bottom-left': { bottom: margin, left: margin },
    'bottom-right': { bottom: margin, right: margin },
  };

  return {
    position: 'fixed',
    ...positions[position as keyof typeof positions],
    '& .MuiSpeedDial-actions': {
      paddingBottom: tokens.spacing.md,
      gap: tokens.spacing.sm,
    },
    '& .MuiFab-primary': {
      backgroundColor: themeColors.primary,
      color: themeColors.white,
      '&:hover': {
        backgroundColor: theme.palette.mode === 'dark' ? themeColors.primaryDark : themeColors.primaryLight,
      },
      boxShadow: tokens.shadows.md,
      transition: `all ${tokens.transitions.duration.normal} ${tokens.transitions.easing.easeInOut}`,
    },
    '& .MuiSpeedDialAction-fab': {
      boxShadow: tokens.shadows.sm,
      transition: `all ${tokens.transitions.duration.normal} ${tokens.transitions.easing.easeInOut}`,
      '&:hover': {
        transform: 'scale(1.05)',
      },
    },
    '& .MuiSpeedDialAction-staticTooltipLabel': {
      fontFamily: tokens.typography.fontFamily,
      fontSize: tokens.typography.fontSize.sm,
      backgroundColor: theme.palette.mode === 'dark' ? themeColors.backgroundSecondary : themeColors.backgroundPaper,
      color: themeColors.textPrimary,
      boxShadow: tokens.shadows.sm,
      borderRadius: tokens.borderRadius.md,
      padding: `${tokens.spacing.xs} ${tokens.spacing.sm}`,
    },
  };
});

/**
 * Компонент SpeedDial - плавающая кнопка с выпадающим меню действий
 */
const SpeedDial: React.FC<SpeedDialProps> = ({
  actions,
  icon,
  position = 'bottom-right',
  margin = 16,
  direction = 'up',
  tooltipTitle,
  SpeedDialActionProps = {},
  ariaLabel = 'SpeedDial',
  ...muiProps
}) => {
  const theme = useTheme();
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return (
    <StyledSpeedDial
      {...muiProps}
      ariaLabel={ariaLabel}
      icon={icon ? icon : <SpeedDialIcon />}
      position={position}
      margin={margin}
      direction={direction}
      FabProps={{
        sx: {
          backgroundColor: themeColors.primary,
          '&:hover': {
            backgroundColor: theme.palette.mode === 'dark' ? themeColors.primaryDark : themeColors.primaryLight,
          },
        },
        ...muiProps.FabProps,
      }}
    >
      {actions.map((action) => (
        <SpeedDialAction
          key={action.id}
          icon={action.icon}
          tooltipTitle={action.tooltipTitle}
          onClick={action.onClick}
          tooltipOpen={muiProps.open}
          FabProps={{ 
            disabled: action.disabled,
            sx: {
              backgroundColor: action.color || (theme.palette.mode === 'dark' ? themeColors.backgroundSecondary : themeColors.backgroundPaper),
              color: action.color ? themeColors.white : themeColors.textPrimary,
            }
          }}
          {...SpeedDialActionProps}
        />
      ))}
    </StyledSpeedDial>
  );
};

export default SpeedDial; 