import React, { useState } from 'react';
import {
  SpeedDial as MuiSpeedDial,
  SpeedDialIcon,
  SpeedDialAction,
  styled,
  useTheme,
} from '@mui/material';
import { SpeedDialProps, SpeedDialAction as SpeedDialActionType } from './types';
import { tokens } from '../../../styles/theme/tokens';

/**
 * Стилизованный компонент SpeedDial с поддержкой позиционирования
 */
const StyledSpeedDial = styled(MuiSpeedDial)(({ theme }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    position: 'fixed',
    bottom: tokens.spacing.lg,
    right: tokens.spacing.lg,
    
    '& .MuiSpeedDial-fab': {
      backgroundColor: tokens.colors.primary.main,
      color: themeColors.white,
      
      '&:hover': {
        backgroundColor: tokens.colors.primary.dark,
      },
    },
    
    '& .MuiSpeedDialAction-fab': {
      width: 40,
      height: 40,
      fontSize: tokens.typography.fontSize.sm,
    },
  };
});

/**
 * Компонент SpeedDial - плавающая кнопка с выпадающими действиями
 * 
 * @example
 * <SpeedDial
 *   actions={[
 *     { icon: <AddIcon />, name: 'Создать', onClick: handleCreate },
 *     { icon: <EditIcon />, name: 'Редактировать', onClick: handleEdit },
 *   ]}
 * />
 */
export const SpeedDial: React.FC<SpeedDialProps> = ({
  actions = [],
  icon,
  ariaLabel = 'Быстрые действия',
  direction = 'up',
  hidden = false,
  tooltipTitle,
  tooltipOpen = false,
  tooltipPlacement = 'left',
  sx,
  ...props
}) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <StyledSpeedDial
      ariaLabel={ariaLabel}
      icon={icon || <SpeedDialIcon />}
      onClose={handleClose}
      onOpen={handleOpen}
      open={open}
      direction={direction}
      hidden={hidden}
      sx={sx}
      {...props}
    >
      {actions.map((action) => (
        <SpeedDialAction
          key={action.id || action.name}
          icon={action.icon}
          tooltipTitle={action.name}
          tooltipOpen={tooltipOpen}
          onClick={(e) => {
            handleClose();
            if (action.onClick) action.onClick(e);
          }}
          FabProps={{
            disabled: action.disabled,
            sx: {
              backgroundColor: action.color || (theme.palette.mode === 'dark' ? themeColors.backgroundSecondary : themeColors.backgroundCard),
              color: action.color ? themeColors.white : themeColors.textPrimary,
            }
          }}
        />
      ))}
    </StyledSpeedDial>
  );
};

export default SpeedDial; 