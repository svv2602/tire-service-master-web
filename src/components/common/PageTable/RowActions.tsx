import React, { useState } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  Divider,
  Typography,
  useTheme,
  Theme
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { ActionConfig } from './index';
import { useTranslation } from 'react-i18next';

interface RowActionsProps {
  actions: ActionConfig[];
  row: any;
  index?: number;
}

// Типизация для цветов палитры
type PaletteColor = 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';

const getColorFromPalette = (theme: Theme, color: PaletteColor): string => {
  return theme.palette[color].main;
};

/**
 * Компонент действий над строкой таблицы
 * Отображает кнопки действий в виде выпадающего меню или отдельных кнопок
 */
export const RowActions: React.FC<RowActionsProps> = ({ actions, row, index = 0 }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action?: ActionConfig;
  }>({ open: false });

  // Фильтруем видимые действия
  const visibleActions = actions.filter(action => 
    action.isVisible ? action.isVisible(row) : true
  );

  if (visibleActions.length === 0) {
    return null;
  }

  // Обработчик открытия меню
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  // Обработчик закрытия меню
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Обработчик клика по действию
  const handleActionClick = (action: ActionConfig) => {
    handleMenuClose();
    
    if (action.requireConfirmation) {
      setConfirmDialog({ open: true, action });
    } else {
      action.onClick(row, index);
    }
  };

  // Обработчик подтверждения действия
  const handleConfirmAction = () => {
    if (confirmDialog.action) {
      confirmDialog.action.onClick(row, index);
    }
    setConfirmDialog({ open: false });
  };

  // Обработчик отмены действия
  const handleCancelAction = () => {
    setConfirmDialog({ open: false });
  };

  // Получение значения из функции или строки
  const getValue = <T,>(value: T | ((row: any) => T), defaultValue: T): T => {
    if (typeof value === 'function') {
      return (value as (row: any) => T)(row);
    }
    return value || defaultValue;
  };

  // Если действий мало, показываем их как отдельные кнопки
  if (visibleActions.length <= 3) {
    return (
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        {visibleActions.map((action, actionIndex) => {
          const isDisabled = action.isDisabled ? action.isDisabled(row) : false;
          const label = getValue(action.label, '');
          const icon = getValue(action.icon, null);
          const color = getValue(action.color, 'primary' as PaletteColor) as PaletteColor;
          const tooltip = getValue(action.tooltip, label);
          
          return (
            <Tooltip key={action.id || actionIndex} title={tooltip}>
              <span>
                <IconButton
                  size="small"
                  disabled={isDisabled}
                  onClick={() => handleActionClick(action)}
                  sx={{
                    color: getColorFromPalette(theme, color),
                    '&:hover': {
                      backgroundColor: `${getColorFromPalette(theme, color)}15`,
                    }
                  }}
                >
                  {icon}
                </IconButton>
              </span>
            </Tooltip>
          );
        })}
      </Box>
    );
  }

  // Если действий много, показываем выпадающее меню
  return (
    <>
        <IconButton
          size="small"
          onClick={handleMenuOpen}
          sx={{
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            }
          }}
        >
          <MoreVertIcon />
        </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            minWidth: 180,
            boxShadow: theme.shadows[8],
          }
        }}
      >
        {visibleActions.map((action, actionIndex) => {
          const isDisabled = action.isDisabled ? action.isDisabled(row) : false;
          const label = getValue(action.label, '');
          const icon = getValue(action.icon, null);
          const color = getValue(action.color, 'primary' as PaletteColor) as PaletteColor;
          
          return (
            <MenuItem
              key={action.id || actionIndex}
              onClick={() => handleActionClick(action)}
              disabled={isDisabled}
              sx={{
                color: isDisabled ? theme.palette.text.disabled : getColorFromPalette(theme, color),
                '&:hover': {
                  backgroundColor: isDisabled 
                    ? 'transparent' 
                    : `${getColorFromPalette(theme, color)}15`,
                }
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>
                {icon}
              </ListItemIcon>
              <ListItemText primary={label} />
            </MenuItem>
          );
        })}
      </Menu>

      {/* Диалог подтверждения */}
      <Dialog
        open={confirmDialog.open}
        onClose={handleCancelAction}
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
      >
        <DialogTitle id="confirm-dialog-title">
          {confirmDialog.action?.confirmationConfig?.title || t('components.confirmDialog.title')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-dialog-description">
            {confirmDialog.action?.confirmationConfig?.message || t('components.confirmDialog.message')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelAction} color="inherit">
            {confirmDialog.action?.confirmationConfig?.cancelLabel || t('components.confirmDialog.cancel')}
          </Button>
          <Button 
            onClick={handleConfirmAction} 
            color="error" 
            variant="contained"
            autoFocus
          >
            {confirmDialog.action?.confirmationConfig?.confirmLabel || t('components.confirmDialog.confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default RowActions; 