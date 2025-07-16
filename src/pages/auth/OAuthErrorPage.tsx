import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTheme, Paper } from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  Container,
  Box,
  Typography,
  Button
} from '../../components/ui';
import {
  getContainerStyles
} from '../../styles';
import ClientLayout from '../../components/client/ClientLayout';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const OAuthErrorPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  const theme = useTheme();
  const { t } = useTranslation();
  const containerStyles = getContainerStyles(theme);

  useEffect(() => {
    const message = searchParams.get('message');
    if (message) {
      setErrorMessage(decodeURIComponent(message));
    } else {
      setErrorMessage('Произошла ошибка при авторизации через Google');
    }
  }, [searchParams]);

  const handleReturnToLogin = () => {
    navigate('/login');
  };

  const handleGoHome = () => {
    navigate('/client');
  };

  return (
    <ClientLayout>
      <Container 
        maxWidth="sm" 
        sx={containerStyles.centerContent}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            textAlign: 'center',
            borderRadius: 2,
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <Box sx={{ mb: 3 }}>
            <ErrorOutlineIcon 
              sx={{ 
                fontSize: 64, 
                color: theme.palette.error.main,
                mb: 2
              }} 
            />
            <Typography variant="h4" color="error" gutterBottom>
              Ошибка авторизации
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {errorMessage}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              onClick={handleReturnToLogin}
              sx={{ minWidth: 140 }}
            >
              Попробовать снова
            </Button>
            <Button
              variant="outlined"
              onClick={handleGoHome}
              sx={{ minWidth: 140 }}
            >
              На главную
            </Button>
          </Box>

          <Box sx={{ mt: 3, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="body2" color="text.secondary">
              Если проблема повторяется, попробуйте:
            </Typography>
            <Typography variant="body2" color="text.secondary" component="ul" sx={{ textAlign: 'left', mt: 1 }}>
              <li>Очистить cookies и кэш браузера</li>
              <li>Попробовать другой браузер</li>
              <li>Проверить настройки блокировки всплывающих окон</li>
              <li>Связаться с поддержкой</li>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </ClientLayout>
  );
};

export default OAuthErrorPage; 