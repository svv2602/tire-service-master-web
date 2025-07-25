import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  Chip,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Security as SecurityIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

type ActionType = 
  | 'suspendUser' 
  | 'unsuspendUser' 
  | 'deleteOperator' 
  | 'assignOperator' 
  | 'unassignOperator' 
  | 'changeRole'
  | 'deleteUser'
  | 'deactivatePartner';

interface RoleConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  action: ActionType;
  target?: {
    name: string;
    email?: string;
    role?: string;
    details?: string[];
  };
  isLoading?: boolean;
  customTitle?: string;
  customMessage?: string;
  showWarnings?: boolean;
}

export const RoleConfirmationDialog: React.FC<RoleConfirmationDialogProps> = ({
  open,
  onClose,
  onConfirm,
  action,
  target,
  isLoading = false,
  customTitle,
  customMessage,
  showWarnings = true,
}) => {
  const { t } = useTranslation();

  // Получение конфигурации для каждого типа действия
  const getActionConfig = (actionType: ActionType) => {
    const configs = {
      suspendUser: {
        title: t('roles.confirmations.suspendUser'),
        message: 'Пользователь будет заблокирован и не сможет войти в систему',
        icon: <BlockIcon color="warning" />,
        severity: 'warning' as const,
        confirmText: 'Заблокировать',
        warnings: [
          'Пользователь потеряет доступ ко всем функциям',
          'Активные сессии будут завершены',
          'Операции пользователя будут приостановлены'
        ]
      },
      unsuspendUser: {
        title: t('roles.confirmations.unsuspendUser'),
        message: 'Пользователь будет разблокирован и сможет войти в систему',
        icon: <CheckCircleIcon color="success" />,
        severity: 'info' as const,
        confirmText: 'Разблокировать',
        warnings: []
      },
      deleteOperator: {
        title: t('roles.confirmations.deleteOperator'),
        message: 'Оператор будет удален из системы навсегда',
        icon: <DeleteIcon color="error" />,
        severity: 'error' as const,
        confirmText: 'Удалить',
        warnings: [
          'Все назначения оператора будут отменены',
          'История действий оператора сохранится',
          'Восстановление будет невозможно'
        ]
      },
      assignOperator: {
        title: t('roles.confirmations.assignOperator'),
        message: 'Оператор будет назначен на выбранные сервисные точки',
        icon: <PersonIcon color="primary" />,
        severity: 'info' as const,
        confirmText: 'Назначить',
        warnings: []
      },
      unassignOperator: {
        title: t('roles.confirmations.unassignOperator'),
        message: 'Назначение оператора будет отменено',
        icon: <PersonIcon color="warning" />,
        severity: 'warning' as const,
        confirmText: 'Отменить назначение',
        warnings: [
          'Оператор потеряет доступ к сервисным точкам',
          'Текущие операции могут быть прерваны'
        ]
      },
      changeRole: {
        title: t('roles.confirmations.changeRole'),
        message: 'Роль пользователя будет изменена',
        icon: <SecurityIcon color="warning" />,
        severity: 'warning' as const,
        confirmText: 'Изменить роль',
        warnings: [
          'Права доступа пользователя изменятся',
          'Может потребоваться повторный вход',
          'Некоторые функции могут стать недоступны'
        ]
      },
      deleteUser: {
        title: 'Удалить пользователя?',
        message: 'Пользователь будет удален из системы навсегда',
        icon: <DeleteIcon color="error" />,
        severity: 'error' as const,
        confirmText: 'Удалить',
        warnings: [
          'Все данные пользователя будут удалены',
          'Связанные записи будут деактивированы',
          'Восстановление будет невозможно'
        ]
      },
      deactivatePartner: {
        title: 'Деактивировать партнера?',
        message: 'Партнер и все его операторы будут деактивированы',
        icon: <BusinessIcon color="warning" />,
        severity: 'warning' as const,
        confirmText: 'Деактивировать',
        warnings: [
          'Все операторы партнера будут деактивированы',
          'Сервисные точки станут недоступны',
          'Новые бронирования будут запрещены'
        ]
      },
    };

    return configs[actionType];
  };

  const config = getActionConfig(action);
  const title = customTitle || config.title;
  const message = customMessage || config.message;

  return (
    <Dialog 
      open={open} 
      onClose={!isLoading ? onClose : undefined}
      maxWidth="sm" 
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          {config.icon}
          <Typography variant="h6">
            {title}
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {/* Информация о цели действия */}
        {target && (
          <Box mb={3}>
            <Typography variant="subtitle2" gutterBottom>
              Цель действия:
            </Typography>
            <Box display="flex" flexDirection="column" gap={1}>
              <Typography variant="body1" fontWeight="bold">
                {target.name}
              </Typography>
              {target.email && (
                <Typography variant="body2" color="text.secondary">
                  {target.email}
                </Typography>
              )}
              {target.role && (
                <Chip 
                  label={target.role} 
                  size="small" 
                  variant="outlined" 
                />
              )}
              {target.details && target.details.length > 0 && (
                <Box mt={1}>
                  {target.details.map((detail, index) => (
                    <Typography key={index} variant="caption" display="block">
                      {detail}
                    </Typography>
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        )}

        {/* Основное сообщение */}
        <Alert severity={config.severity} sx={{ mb: 2 }}>
          <Typography variant="body2">
            {message}
          </Typography>
        </Alert>

        {/* Предупреждения */}
        {showWarnings && config.warnings.length > 0 && (
          <Box>
            <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
              <WarningIcon sx={{ verticalAlign: 'middle', mr: 1, fontSize: 20 }} />
              Последствия действия:
            </Typography>
            <List dense>
              {config.warnings.map((warning, index) => (
                <ListItem key={index} sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <WarningIcon color="warning" sx={{ fontSize: 16 }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={warning}
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button 
          onClick={onClose} 
          disabled={isLoading}
          color="inherit"
        >
          {t('common.cancel')}
        </Button>
        <Button 
          onClick={onConfirm}
          disabled={isLoading}
          variant="contained"
          color={config.severity === 'error' ? 'error' : 'primary'}
          startIcon={isLoading ? <CircularProgress size={16} /> : undefined}
        >
          {isLoading ? t('common.processing', { defaultValue: 'Обработка...' }) : config.confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Хук для удобного использования диалогов подтверждения
export const useRoleConfirmation = () => {
  const [dialogState, setDialogState] = React.useState<{
    open: boolean;
    action?: ActionType;
    target?: any;
    onConfirm?: () => void;
    isLoading?: boolean;
  }>({
    open: false,
  });

  const showConfirmation = React.useCallback((
    action: ActionType,
    target: any,
    onConfirm: () => void
  ) => {
    setDialogState({
      open: true,
      action,
      target,
      onConfirm,
      isLoading: false,
    });
  }, []);

  const closeDialog = React.useCallback(() => {
    setDialogState(prev => ({ ...prev, open: false }));
  }, []);

  const handleConfirm = React.useCallback(async () => {
    if (dialogState.onConfirm) {
      setDialogState(prev => ({ ...prev, isLoading: true }));
      try {
        await dialogState.onConfirm();
        closeDialog();
      } catch (error) {
        console.error('Confirmation action failed:', error);
        setDialogState(prev => ({ ...prev, isLoading: false }));
      }
    }
  }, [dialogState.onConfirm, closeDialog]);

  const ConfirmationDialog = React.useMemo(() => {
    if (!dialogState.action) return null;

    return (
      <RoleConfirmationDialog
        open={dialogState.open}
        onClose={closeDialog}
        onConfirm={handleConfirm}
        action={dialogState.action}
        target={dialogState.target}
        isLoading={dialogState.isLoading}
      />
    );
  }, [dialogState, closeDialog, handleConfirm]);

  return {
    showConfirmation,
    ConfirmationDialog,
    isLoading: dialogState.isLoading,
  };
};

// Специализированные хуки для конкретных действий
export const useSuspensionConfirmation = () => {
  const { showConfirmation, ConfirmationDialog, isLoading } = useRoleConfirmation();

  const confirmSuspension = React.useCallback((user: any, onConfirm: () => void) => {
    showConfirmation('suspendUser', {
      name: user.full_name || `${user.first_name} ${user.last_name}`,
      email: user.email,
      role: user.role?.name,
    }, onConfirm);
  }, [showConfirmation]);

  const confirmUnsuspension = React.useCallback((user: any, onConfirm: () => void) => {
    showConfirmation('unsuspendUser', {
      name: user.full_name || `${user.first_name} ${user.last_name}`,
      email: user.email,
      role: user.role?.name,
    }, onConfirm);
  }, [showConfirmation]);

  return {
    confirmSuspension,
    confirmUnsuspension,
    ConfirmationDialog,
    isLoading,
  };
};

export const useOperatorConfirmation = () => {
  const { showConfirmation, ConfirmationDialog, isLoading } = useRoleConfirmation();

  const confirmDelete = React.useCallback((operator: any, onConfirm: () => void) => {
    showConfirmation('deleteOperator', {
      name: `${operator.user.first_name} ${operator.user.last_name}`,
      email: operator.user.email,
      details: [`Позиция: ${operator.position}`, `Уровень доступа: ${operator.access_level}`],
    }, onConfirm);
  }, [showConfirmation]);

  const confirmAssignment = React.useCallback((operator: any, servicePoints: any[], onConfirm: () => void) => {
    showConfirmation('assignOperator', {
      name: `${operator.user.first_name} ${operator.user.last_name}`,
      email: operator.user.email,
      details: servicePoints.map(sp => `Точка: ${sp.name}`),
    }, onConfirm);
  }, [showConfirmation]);

  return {
    confirmDelete,
    confirmAssignment,
    ConfirmationDialog,
    isLoading,
  };
}; 