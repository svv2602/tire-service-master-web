import React from 'react';
import {
  Tooltip,
  IconButton,
  Chip,
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Info as InfoIcon,
  Security as SecurityIcon,
  Warning as WarningIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  AdminPanelSettings as AdminIcon,
  Business as PartnerIcon,
  Person as OperatorIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useUserRole } from '../../../hooks/useUserRole';
import { useSelector } from 'react-redux';

type TooltipType = 
  | 'adminOnly' 
  | 'partnerRestricted' 
  | 'operatorLimited'
  | 'suspendedUser'
  | 'inactiveUser'
  | 'roleInfo'
  | 'permissionInfo'
  | 'accessDenied';

interface RoleTooltipProps {
  type: TooltipType;
  children: React.ReactElement;
  customMessage?: string;
  userRole?: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  interactive?: boolean;
  showIcon?: boolean;
}

export const RoleTooltip: React.FC<RoleTooltipProps> = ({
  type,
  children,
  customMessage,
  userRole,
  placement = 'top',
  interactive = false,
  showIcon = true,
}) => {
  const { t } = useTranslation();
  const { isAdmin, isPartner, isOperator, isManager } = useUserRole();

  // Получение конфигурации для каждого типа tooltip
  const getTooltipConfig = (tooltipType: TooltipType) => {
    const configs = {
      adminOnly: {
        title: 'Только для администраторов',
        message: t('roles.tooltips.adminOnly'),
        icon: <AdminIcon sx={{ fontSize: 16 }} />,
        color: 'error' as const,
        details: [
          'Функция доступна только администраторам системы',
          'Требуется максимальный уровень доступа',
          'Обратитесь к администратору для получения прав'
        ]
      },
      partnerRestricted: {
        title: 'Ограничено для партнеров',
        message: t('roles.tooltips.partnerRestricted'),
        icon: <PartnerIcon sx={{ fontSize: 16 }} />,
        color: 'warning' as const,
        details: [
          'Партнеры видят только свои данные',
          'Доступ ограничен собственными ресурсами',
          'Невозможно просматривать данные других партнеров'
        ]
      },
      operatorLimited: {
        title: 'Ограниченный доступ оператора',
        message: t('roles.tooltips.operatorLimited'),
        icon: <OperatorIcon sx={{ fontSize: 16 }} />,
        color: 'info' as const,
        details: [
          'Доступ только к назначенным сервисным точкам',
          'Ограниченный набор функций',
          'Невозможно управлять другими пользователями'
        ]
      },
      suspendedUser: {
        title: 'Пользователь заблокирован',
        message: t('roles.tooltips.suspendedUser'),
        icon: <BlockIcon sx={{ fontSize: 16 }} />,
        color: 'error' as const,
        details: [
          'Доступ к системе заблокирован',
          'Все операции приостановлены',
          'Обратитесь к администратору для разблокировки'
        ]
      },
      inactiveUser: {
        title: 'Неактивный пользователь',
        message: t('roles.tooltips.inactiveUser'),
        icon: <WarningIcon sx={{ fontSize: 16 }} />,
        color: 'warning' as const,
        details: [
          'Пользователь деактивирован',
          'Вход в систему невозможен',
          'Требуется активация учетной записи'
        ]
      },
      roleInfo: {
        title: 'Информация о роли',
        message: 'Роль определяет уровень доступа к функциям системы',
        icon: <SecurityIcon sx={{ fontSize: 16 }} />,
        color: 'info' as const,
        details: [
          'Администратор: полный доступ ко всем функциям',
          'Менеджер: управление контентом и мониторинг',
          'Партнер: управление своими ресурсами',
          'Оператор: работа с назначенными точками'
        ]
      },
      permissionInfo: {
        title: 'Информация о правах',
        message: 'Права доступа контролируют возможные действия',
        icon: <InfoIcon sx={{ fontSize: 16 }} />,
        color: 'info' as const,
        details: [
          'Права назначаются автоматически на основе роли',
          'Изменение роли влияет на доступные функции',
          'Некоторые действия требуют подтверждения'
        ]
      },
      accessDenied: {
        title: 'Доступ запрещен',
        message: 'У вас недостаточно прав для выполнения этого действия',
        icon: <ErrorIcon sx={{ fontSize: 16 }} />,
        color: 'error' as const,
        details: [
          'Требуется более высокий уровень доступа',
          'Обратитесь к администратору',
          'Проверьте свою роль в системе'
        ]
      },
    };

    return configs[tooltipType];
  };

  const config = getTooltipConfig(type);
  const message = customMessage || config.message;

  // Создание расширенного контента для интерактивных tooltip'ов
  const createInteractiveContent = () => (
    <Paper sx={{ p: 2, maxWidth: 300 }}>
      <Box display="flex" alignItems="center" gap={1} mb={1}>
        {showIcon && config.icon}
        <Typography variant="subtitle2" fontWeight="bold">
          {config.title}
        </Typography>
      </Box>
      
      <Typography variant="body2" sx={{ mb: 2 }}>
        {message}
      </Typography>

      {userRole && (
        <Box mb={2}>
          <Chip 
            label={`Ваша роль: ${userRole}`}
            size="small"
            color={config.color}
            variant="outlined"
          />
        </Box>
      )}

      <List dense>
        {config.details.map((detail, index) => (
          <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
            <ListItemIcon sx={{ minWidth: 20 }}>
              <CheckCircleIcon sx={{ fontSize: 12 }} color="action" />
            </ListItemIcon>
            <ListItemText 
              primary={detail}
              primaryTypographyProps={{ variant: 'caption' }}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );

  // Простой контент для обычных tooltip'ов
  const createSimpleContent = () => (
    <Box display="flex" alignItems="center" gap={1}>
      {showIcon && config.icon}
      <Typography variant="body2">
        {message}
      </Typography>
    </Box>
  );

  return (
    <Tooltip
      title={interactive ? createInteractiveContent() : createSimpleContent()}
      placement={placement}
      arrow
      PopperProps={{
        sx: interactive ? {
          '& .MuiTooltip-tooltip': {
            backgroundColor: 'transparent',
            padding: 0,
            maxWidth: 'none',
          }
        } : undefined
      }}
    >
      {children}
    </Tooltip>
  );
};

// Специализированные компоненты для часто используемых случаев
export const AdminOnlyTooltip: React.FC<{ children: React.ReactElement }> = ({ children }) => (
  <RoleTooltip type="adminOnly" interactive>
    {children}
  </RoleTooltip>
);

export const PartnerRestrictedTooltip: React.FC<{ children: React.ReactElement }> = ({ children }) => (
  <RoleTooltip type="partnerRestricted" interactive>
    {children}
  </RoleTooltip>
);

export const OperatorLimitedTooltip: React.FC<{ children: React.ReactElement }> = ({ children }) => (
  <RoleTooltip type="operatorLimited" interactive>
    {children}
  </RoleTooltip>
);

export const SuspendedUserTooltip: React.FC<{ children: React.ReactElement }> = ({ children }) => (
  <RoleTooltip type="suspendedUser">
    {children}
  </RoleTooltip>
);

// Хук для создания tooltip'ов на основе текущей роли пользователя
export const useRoleTooltips = () => {
  const { isAdmin, isPartner, isOperator } = useUserRole();
  const user = useSelector((state: any) => state.auth.user);
  const userRole = user?.role?.name || 'guest';

  const createTooltip = React.useCallback((
    type: TooltipType, 
    children: React.ReactElement,
    options?: {
      interactive?: boolean;
      customMessage?: string;
      placement?: 'top' | 'bottom' | 'left' | 'right';
    }
  ) => (
    <RoleTooltip 
      type={type} 
      userRole={userRole}
      interactive={options?.interactive}
      customMessage={options?.customMessage}
      placement={options?.placement}
    >
      {children}
    </RoleTooltip>
  ), [userRole]);

  const wrapWithAccessTooltip = React.useCallback((
    children: React.ReactElement,
    requiredRole: 'admin' | 'manager' | 'partner'
  ) => {
    // Определяем, имеет ли пользователь необходимые права
    const hasAccess = requiredRole === 'admin' ? isAdmin :
                     requiredRole === 'partner' ? (isAdmin || isPartner) :
                     true; // manager - пока не реализован

    if (!hasAccess) {
      return createTooltip('accessDenied', children, { interactive: true });
    }

    return children;
  }, [isAdmin, isPartner, createTooltip]);

  return {
    createTooltip,
    wrapWithAccessTooltip,
    adminOnly: (children: React.ReactElement) => createTooltip('adminOnly', children, { interactive: true }),
    partnerRestricted: (children: React.ReactElement) => createTooltip('partnerRestricted', children, { interactive: true }),
    operatorLimited: (children: React.ReactElement) => createTooltip('operatorLimited', children, { interactive: true }),
  };
};

// Компонент для отображения иконки с информацией о роли
export const RoleInfoIcon: React.FC<{ 
  type?: TooltipType; 
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
}> = ({ 
  type = 'roleInfo', 
  size = 'small',
  color = 'info' 
}) => {
  const iconSize = size === 'small' ? 16 : size === 'large' ? 24 : 20;

  return (
    <RoleTooltip type={type} interactive>
      <IconButton size={size} color={color}>
        <InfoIcon sx={{ fontSize: iconSize }} />
      </IconButton>
    </RoleTooltip>
  );
}; 