import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  useTheme,
  useMediaQuery
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { ActionConfig } from './types';

interface RowActionsProps {
  actions: ActionConfig[];
  row: any;
  index: number;
}

/**
 * Компонент действий над строкой таблицы
 */
export const RowActions: React.FC<RowActionsProps> = ({
  actions,
  row,
  index
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action?: ActionConfig;
  }>({ open: false });

  // Фильтруем видимые действия
  const visibleActions = actions.filter(action => 
    !action.isVisible || action.isVisible(row)
  );

  if (visibleActions.length === 0) {
    return null;
  }

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleActionClick = (action: ActionConfig) => {
    handleMenuClose();
    
    if (action.requireConfirmation) {
      setConfirmDialog({ open: true, action });
    } else {
      action.onClick(row, index);
    }
  };

  const handleConfirmAction = () => {
    if (confirmDialog.action) {
      confirmDialog.action.onClick(row, index);
    }
    setConfirmDialog({ open: false });
  };

  const handleCancelAction = () => {
    setConfirmDialog({ open: false });
  };

  // Если действий мало и не мобильная версия, показываем кнопки
  if (visibleActions.length <= 2 && !isMobile) {
    return (
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        {visibleActions.map((action) => {
          const isDisabled = action.isDisabled && action.isDisabled(row);
          
          return (
            <Tooltip key={action.id} title={action.label}>
              <span>
                <IconButton
                  size="small"
                  disabled={isDisabled}
                  onClick={() => handleActionClick(action)}
                  color={action.color || 'default'}
                  sx={{
                    '&:hover': {
                      backgroundColor: `${theme.palette[action.color || 'primary'].main}15`,
                    }
                  }}
                >
                  {action.icon}
                </IconButton>
              </span>
            </Tooltip>
          );
        })}
        
        {/* Диалог подтверждения */}
        <Dialog
          open={confirmDialog.open}
          onClose={handleCancelAction}
          maxWidth="sm"
        >
          <DialogTitle>
            Подтверждение действия
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              {confirmDialog.action?.confirmationText || 
               `Вы уверены, что хотите выполнить действие "${confirmDialog.action?.label}"?`}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelAction} color="inherit">
              Отмена
            </Button>
            <Button 
              onClick={handleConfirmAction} 
              color={confirmDialog.action?.color || 'primary'}
              variant="contained"
            >
              Подтвердить
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }

  // Для множества действий или мобильной версии используем меню
  return (
    <Box>
      <Tooltip title="Действия">
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
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            minWidth: 160,
            boxShadow: theme.shadows[8],
          }
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        {visibleActions.map((action) => {
          const isDisabled = action.isDisabled && action.isDisabled(row);
          
          return (
            <MenuItem
              key={action.id}
              onClick={() => handleActionClick(action)}
              disabled={isDisabled}
              sx={{
                color: action.color ? theme.palette[action.color].main : 'inherit',
                '&:hover': {
                  backgroundColor: action.color 
                    ? `${theme.palette[action.color].main}15`
                    : theme.palette.action.hover,
                }
              }}
            >
              <ListItemIcon sx={{ color: 'inherit' }}>
                {action.icon}
              </ListItemIcon>
              <ListItemText primary={action.label} />
            </MenuItem>
          );
        })}
      </Menu>

      {/* Диалог подтверждения */}
      <Dialog
        open={confirmDialog.open}
        onClose={handleCancelAction}
        maxWidth="sm"
      >
        <DialogTitle>
          Подтверждение действия
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirmDialog.action?.confirmationText || 
             `Вы уверены, что хотите выполнить действие "${confirmDialog.action?.label}"?`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelAction} color="inherit">
            Отмена
          </Button>
          <Button 
            onClick={handleConfirmAction} 
            color={confirmDialog.action?.color || 'primary'}
            variant="contained"
          >
            Подтвердить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RowActions; 