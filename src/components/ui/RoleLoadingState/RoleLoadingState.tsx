import React from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  Alert,
  Skeleton,
  Card,
  CardContent,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

interface RoleLoadingStateProps {
  type: 'loading' | 'error' | 'empty' | 'skeleton';
  message?: string;
  error?: string;
  action?: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
  variant?: 'inline' | 'card' | 'fullscreen';
}

export const RoleLoadingState: React.FC<RoleLoadingStateProps> = ({
  type,
  message,
  error,
  action,
  size = 'medium',
  variant = 'inline',
}) => {
  const { t } = useTranslation();

  const getSize = () => {
    switch (size) {
      case 'small': return { spinner: 24, spacing: 2 };
      case 'large': return { spinner: 48, spacing: 4 };
      default: return { spinner: 32, spacing: 3 };
    }
  };

  const { spinner, spacing } = getSize();

  const renderContent = () => {
    switch (type) {
      case 'loading':
        return (
          <Box 
            display="flex" 
            flexDirection="column" 
            alignItems="center" 
            gap={spacing}
            py={spacing}
          >
            <CircularProgress size={spinner} />
            <Typography variant="body2" color="text.secondary">
              {message || t('common.loading')}
            </Typography>
          </Box>
        );

      case 'error':
        return (
          <Alert 
            severity="error" 
            action={action}
            sx={{ my: spacing }}
          >
            <Typography variant="body2">
              {error || message || t('common.error')}
            </Typography>
          </Alert>
        );

      case 'empty':
        return (
          <Box 
            display="flex" 
            flexDirection="column" 
            alignItems="center" 
            gap={spacing}
            py={spacing * 2}
          >
            <Typography variant="h6" color="text.secondary">
              {message || t('common.noData')}
            </Typography>
            {action && (
              <Box mt={2}>
                {action}
              </Box>
            )}
          </Box>
        );

      case 'skeleton':
        return (
          <Box>
            {Array.from({ length: size === 'small' ? 3 : size === 'large' ? 8 : 5 }).map((_, index) => (
              <Box key={index} mb={1}>
                <Skeleton variant="text" height={40} />
              </Box>
            ))}
          </Box>
        );

      default:
        return null;
    }
  };

  if (variant === 'card') {
    return (
      <Card>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>
    );
  }

  if (variant === 'fullscreen') {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
        width="100%"
      >
        {renderContent()}
      </Box>
    );
  }

  return renderContent();
};

// Специализированные компоненты для разных состояний
export const RoleLoadingSpinner: React.FC<{ message?: string; size?: 'small' | 'medium' | 'large' }> = ({ message, size }) => (
  <RoleLoadingState type="loading" message={message} size={size} />
);

export const RoleErrorState: React.FC<{ error?: string; action?: React.ReactNode }> = ({ error, action }) => (
  <RoleLoadingState type="error" error={error} action={action} />
);

export const RoleEmptyState: React.FC<{ message?: string; action?: React.ReactNode }> = ({ message, action }) => (
  <RoleLoadingState type="empty" message={message} action={action} />
);

export const RoleSkeleton: React.FC<{ size?: 'small' | 'medium' | 'large' }> = ({ size }) => (
  <RoleLoadingState type="skeleton" size={size} />
);

// Хук для удобного использования состояний загрузки
export const useRoleLoadingStates = () => {
  const { t } = useTranslation();

  return {
    loading: (message?: string) => <RoleLoadingSpinner message={message} />,
    error: (error?: string, action?: React.ReactNode) => <RoleErrorState error={error} action={action} />,
    empty: (message?: string, action?: React.ReactNode) => <RoleEmptyState message={message} action={action} />,
    skeleton: (size?: 'small' | 'medium' | 'large') => <RoleSkeleton size={size} />,
    
    // Специализированные сообщения для системы ролей
    loadingUsers: () => <RoleLoadingSpinner message={t('roles.loading.users')} />,
    loadingOperators: () => <RoleLoadingSpinner message={t('roles.loading.operators')} />,
    loadingPermissions: () => <RoleLoadingSpinner message={t('roles.loading.permissions')} />,
    loadingAuditLogs: () => <RoleLoadingSpinner message={t('roles.loading.auditLogs')} />,
    
    errorPermissions: (action?: React.ReactNode) => <RoleErrorState error={t('roles.errors.permissions')} action={action} />,
    errorUsers: (action?: React.ReactNode) => <RoleErrorState error={t('roles.errors.users')} action={action} />,
    
    emptyOperators: (action?: React.ReactNode) => <RoleEmptyState message={t('roles.empty.operators')} action={action} />,
    emptyAuditLogs: (action?: React.ReactNode) => <RoleEmptyState message={t('roles.empty.auditLogs')} action={action} />,
  };
}; 