import React from 'react';
import { Container, Paper, Typography, Box } from '../../components/ui';
import { Link } from '@mui/material';;
import { ForgotPasswordForm } from '../../components/auth/ForgotPasswordForm';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();

  const fromParam = searchParams.get('from');

  const handleBackToLogin = () => {
    if (fromParam === 'booking') {
      // Если пришли из процесса бронирования, закрываем вкладку
      window.close();
    } else {
      // Иначе идем на страницу логина
      navigate('/login');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom textAlign="center">
          {t('forms.auth.forgotPasswordTitle')}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
          {t('forms.auth.forgotPasswordDescription')}
        </Typography>
        
        <ForgotPasswordForm onBack={handleBackToLogin} from={fromParam || undefined} />
        
        <Box textAlign="center" mt={2}>
          <Link 
            component="button"
            variant="body2"
            onClick={handleBackToLogin}
            sx={{ textDecoration: 'none' }}
          >
            {t('forms.auth.backToLoginPage')}
          </Link>
        </Box>
      </Paper>
    </Container>
  );
};

export default ForgotPasswordPage; 