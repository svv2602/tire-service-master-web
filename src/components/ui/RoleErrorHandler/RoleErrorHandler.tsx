import React from 'react';
import {
  Alert,
  AlertTitle,
  Button,
  Box,
  Typography,
  Collapse,
  IconButton,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
  Security as SecurityIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface RoleError {
  code?: string;
  message?: string;
  status?: number;
  details?: string;
  type?: 'permission' | 'network' | 'validation' | 'server' | 'unknown';
}

interface RoleErrorHandlerProps {
  error: RoleError | Error | string | null;
  onRetry?: () => void;
  onClose?: () => void;
  showDetails?: boolean;
  variant?: 'inline' | 'modal' | 'toast';
}

export const RoleErrorHandler: React.FC<RoleErrorHandlerProps> = ({
  error,
  onRetry,
  onClose,
  showDetails = false,
  variant = 'inline',
}) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = React.useState(false);

  if (!error) return null;

  // Нормализация ошибки
  const normalizeError = (err: any): RoleError => {
    if (typeof err === 'string') {
      return { message: err, type: 'unknown' };
    }

    if (err instanceof Error) {
      return { 
        message: err.message, 
        details: err.stack,
        type: 'unknown' 
      };
    }

    // Обработка ошибок API
    if (err.status) {
      const type = err.status === 403 ? 'permission' : 
                   err.status >= 500 ? 'server' : 
                   err.status >= 400 ? 'validation' : 'network';
      
      return {
        code: err.code,
        message: err.message || err.error,
        status: err.status,
        details: err.details,
        type,
      };
    }

    return {
      message: err.message || 'Unknown error',
      type: 'unknown',
    };
  };

  const normalizedError = normalizeError(error);

  // Получение локализованного сообщения
  const getLocalizedMessage = (err: RoleError): string => {
    // Специфичные сообщения для системы ролей
    if (err.status === 403) {
      return t('roles.errors.accessDenied');
    }

    if (err.code) {
      const translationKey = `roles.errors.${err.code}`;
      const translated = t(translationKey);
      if (translated !== translationKey) {
        return translated;
      }
    }

    // Общие сообщения по типу ошибки
    switch (err.type) {
      case 'permission':
        return t('roles.errors.insufficientRights');
      case 'network':
        return t('common.networkError', { defaultValue: 'Ошибка сети' });
      case 'validation':
        return t('common.validationError', { defaultValue: 'Ошибка валидации' });
      case 'server':
        return t('common.serverError', { defaultValue: 'Ошибка сервера' });
      default:
        return err.message || t('common.error');
    }
  };

  // Получение иконки по типу ошибки
  const getErrorIcon = (type?: string) => {
    switch (type) {
      case 'permission':
        return <SecurityIcon />;
      default:
        return <ErrorIcon />;
    }
  };

  // Получение severity по типу ошибки
  const getSeverity = (type?: string) => {
    switch (type) {
      case 'permission':
        return 'warning' as const;
      case 'validation':
        return 'info' as const;
      default:
        return 'error' as const;
    }
  };

  const message = getLocalizedMessage(normalizedError);
  const severity = getSeverity(normalizedError.type);

  const actionButtons = (
    <Box display="flex" gap={1} alignItems="center">
      {showDetails && normalizedError.details && (
        <IconButton
          size="small"
          onClick={() => setExpanded(!expanded)}
          sx={{
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s',
          }}
        >
          <ExpandMoreIcon />
        </IconButton>
      )}
      {onRetry && (
        <Button
          size="small"
          startIcon={<RefreshIcon />}
          onClick={onRetry}
          variant="outlined"
        >
          {t('common.retry', { defaultValue: 'Повторить' })}
        </Button>
      )}
    </Box>
  );

  const alertContent = (
    <>
      <Alert 
        severity={severity}
        action={actionButtons}
        onClose={onClose}
        icon={getErrorIcon(normalizedError.type)}
      >
        <AlertTitle>
          {normalizedError.status && `${normalizedError.status} - `}
          {t('common.error')}
        </AlertTitle>
        <Typography variant="body2">
          {message}
        </Typography>
        
        {showDetails && normalizedError.details && (
          <Collapse in={expanded}>
            <Box mt={2} p={2} bgcolor="rgba(0,0,0,0.05)" borderRadius={1}>
              <Typography variant="caption" component="pre" sx={{ 
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                fontFamily: 'monospace',
              }}>
                {normalizedError.details}
              </Typography>
            </Box>
          </Collapse>
        )}
      </Alert>
    </>
  );

  if (variant === 'modal') {
    return (
      <Box p={3}>
        {alertContent}
      </Box>
    );
  }

  if (variant === 'toast') {
    return (
      <Box position="fixed" top={20} right={20} zIndex={9999} maxWidth={400}>
        {alertContent}
      </Box>
    );
  }

  return alertContent;
};

// Хук для удобной обработки ошибок в системе ролей
export const useRoleErrorHandler = () => {
  const { t } = useTranslation();

  const handleError = React.useCallback((error: any, onRetry?: () => void) => {
    return (
      <RoleErrorHandler 
        error={error} 
        onRetry={onRetry}
        showDetails={process.env.NODE_ENV === 'development'}
      />
    );
  }, []);

  const handlePermissionError = React.useCallback((onRetry?: () => void) => {
    return (
      <RoleErrorHandler 
        error={{
          type: 'permission' as const,
          status: 403,
          message: t('roles.errors.accessDenied')
        }}
        onRetry={onRetry}
      />
    );
  }, [t]);

  const handleNetworkError = React.useCallback((onRetry?: () => void) => {
    return (
      <RoleErrorHandler 
        error={{
          type: 'network' as const,
          message: t('common.networkError', { defaultValue: 'Ошибка сети' })
        }}
        onRetry={onRetry}
      />
    );
  }, [t]);

  return {
    handleError,
    handlePermissionError,
    handleNetworkError,
  };
};

// Компонент для отображения ошибок доступа
export const AccessDeniedError: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => {
  const { t } = useTranslation();
  
  return (
    <RoleErrorHandler
      error={{
        type: 'permission',
        status: 403,
        message: t('roles.errors.accessDenied')
      }}
      onRetry={onRetry}
    />
  );
};

// Компонент для отображения ошибок загрузки
export const LoadingError: React.FC<{ error: any; onRetry?: () => void }> = ({ error, onRetry }) => {
  return (
    <RoleErrorHandler
      error={error}
      onRetry={onRetry}
      showDetails={process.env.NODE_ENV === 'development'}
    />
  );
}; 