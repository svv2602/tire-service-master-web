/**
 * ActionsMenu - Универсальный компонент меню действий
 * 
 * Функциональность:
 * - Автоматический выбор между отдельными кнопками (≤3 действий) и выпадающим меню (>3 действий)
 * - Поддержка условной видимости и доступности действий
 * - Встроенные диалоги подтверждения
 * - Поддержка динамических значений (функции для label, icon, color)
 * - Цветовая индикация действий
 * - Адаптивность и доступность
 * 
 * Использование:
 * <ActionsMenu
 *   actions={[
 *     {
 *       id: 'edit',
 *       label: 'Редактировать',
 *       icon: <EditIcon />,
 *       onClick: (item) => navigate(`/edit/${item.id}`),
 *       color: 'primary'
 *     },
 *     {
 *       id: 'delete',
 *       label: 'Удалить',
 *       icon: <DeleteIcon />,
 *       onClick: (item) => handleDelete(item),
 *       color: 'error',
 *       requireConfirmation: true,
 *       confirmationConfig: {
 *         title: 'Подтверждение удаления',
 *         message: 'Вы действительно хотите удалить этот элемент?'
 *       }
 *     }
 *   ]}
 *   item={currentItem}
 * />
 */

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
  useTheme,
  Theme
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';

// Типы для конфигурации действий
export interface ActionItem<T = any> {
  /** Уникальный идентификатор действия */
  id?: string;
  /** Название действия (может быть функцией для динамических значений) */
  label: string | ((item: T) => string);
  /** Иконка действия (может быть функцией для динамических значений) */
  icon: React.ReactNode | ((item: T) => React.ReactNode);
  /** Цвет кнопки (может быть функцией для динамических значений) */
  color?: PaletteColor | ((item: T) => PaletteColor);
  /** Функция для определения видимости действия */
  isVisible?: (item: T) => boolean;
  /** Функция для определения доступности действия */
  isDisabled?: (item: T) => boolean;
  /** Обработчик клика */
  onClick: (item: T, index?: number) => void;
  /** Подсказка (может быть функцией для динамических значений) */
  tooltip?: string | ((item: T) => string);
  /** Подтверждение перед выполнением */
  requireConfirmation?: boolean;
  /** Конфигурация диалога подтверждения */
  confirmationConfig?: ConfirmationConfig;
}

export interface ConfirmationConfig {
  /** Заголовок диалога */
  title: string;
  /** Сообщение диалога */
  message: string;
  /** Текст кнопки подтверждения */
  confirmLabel?: string;
  /** Текст кнопки отмены */
  cancelLabel?: string;
}

export interface ActionsMenuProps<T = any> {
  /** Список действий */
  actions: ActionItem<T>[];
  /** Объект, над которым выполняются действия */
  item: T;
  /** Индекс элемента (опционально) */
  index?: number;
  /** Размер кнопок */
  size?: 'small' | 'medium' | 'large';
  /** Порог для переключения между кнопками и меню */
  menuThreshold?: number;
  /** Дополнительные стили для контейнера */
  sx?: any;
}

// Типизация для цветов палитры
type PaletteColor = 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';

const getColorFromPalette = (theme: Theme, color: PaletteColor): string => {
  return theme.palette[color].main;
};

/**
 * ActionsMenu - Универсальный компонент меню действий
 */
export const ActionsMenu = <T,>({
  actions,
  item,
  index = 0,
  size = 'small',
  menuThreshold = 3,
  sx = {}
}: ActionsMenuProps<T>) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action?: ActionItem<T>;
  }>({ open: false });

  // Фильтруем видимые действия
  const visibleActions = actions.filter(action => 
    action.isVisible ? action.isVisible(item) : true
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
  const handleActionClick = (action: ActionItem<T>) => {
    handleMenuClose();
    
    if (action.requireConfirmation) {
      setConfirmDialog({ open: true, action });
    } else {
      action.onClick(item, index);
    }
  };

  // Обработчик подтверждения действия
  const handleConfirmAction = () => {
    if (confirmDialog.action) {
      confirmDialog.action.onClick(item, index);
    }
    setConfirmDialog({ open: false });
  };

  // Обработчик отмены действия
  const handleCancelAction = () => {
    setConfirmDialog({ open: false });
  };

  // Получение значения из функции или константы
  const getValue = <V,>(value: V | ((item: T) => V), defaultValue: V): V => {
    if (typeof value === 'function') {
      return (value as (item: T) => V)(item);
    }
    return value || defaultValue;
  };

  // Если действий мало, показываем их как отдельные кнопки
  if (visibleActions.length <= menuThreshold) {
    return (
      <Box sx={{ display: 'flex', gap: 0.5, ...sx }}>
        {visibleActions.map((action, actionIndex) => {
          const isDisabled = action.isDisabled ? action.isDisabled(item) : false;
          const label = getValue(action.label, '');
          const icon = getValue(action.icon, null);
          const color = getValue(action.color, 'primary' as PaletteColor) as PaletteColor;
          const tooltip = getValue(action.tooltip, label);
          
          return (
            <Tooltip key={action.id || actionIndex} title={tooltip}>
              <span>
                <IconButton
                  size={size}
                  disabled={isDisabled}
                  onClick={() => handleActionClick(action)}
                  sx={{
                    color: getColorFromPalette(theme, color),
                    '&:hover': {
                      backgroundColor: `${getColorFromPalette(theme, color)}15`,
                    },
                    '&:disabled': {
                      color: theme.palette.text.disabled,
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
    <Box sx={sx}>
      <IconButton
        size={size}
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
          const isDisabled = action.isDisabled ? action.isDisabled(item) : false;
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
        aria-labelledby="actions-confirm-dialog-title"
        aria-describedby="actions-confirm-dialog-description"
      >
        <DialogTitle id="actions-confirm-dialog-title">
          {confirmDialog.action?.confirmationConfig?.title || 'Подтверждение'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="actions-confirm-dialog-description">
            {confirmDialog.action?.confirmationConfig?.message || 'Вы уверены, что хотите выполнить это действие?'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelAction} color="inherit">
            {confirmDialog.action?.confirmationConfig?.cancelLabel || 'Отмена'}
          </Button>
          <Button 
            onClick={handleConfirmAction} 
            color="error" 
            variant="contained"
            autoFocus
          >
            {confirmDialog.action?.confirmationConfig?.confirmLabel || 'Подтвердить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ActionsMenu; 