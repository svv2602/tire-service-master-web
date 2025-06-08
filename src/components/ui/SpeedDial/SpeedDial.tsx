import React from 'react';
import MuiSpeedDial from '@mui/material/SpeedDial';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import { styled } from '@mui/material/styles';
import { SpeedDialProps } from './types';

/**
 * Стилизованный компонент SpeedDial с поддержкой позиционирования
 */
const StyledSpeedDial = styled(MuiSpeedDial, {
  shouldForwardProp: (prop) => !['position', 'margin'].includes(prop as string),
})<{ position?: string; margin?: number }>(({ position = 'bottom-right', margin = 16, theme }) => {
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
      paddingBottom: theme.spacing(1),
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
  return (
    <StyledSpeedDial
      {...muiProps}
      ariaLabel={ariaLabel}
      icon={icon ? icon : <SpeedDialIcon />}
      position={position}
      margin={margin}
      direction={direction}
    >
      {actions.map((action) => (
        <SpeedDialAction
          key={action.id}
          icon={action.icon}
          tooltipTitle={action.tooltipTitle}
          onClick={action.onClick}
          FabProps={{ disabled: action.disabled }}
          {...SpeedDialActionProps}
        />
      ))}
    </StyledSpeedDial>
  );
};

export default SpeedDial; 