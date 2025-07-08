import React from 'react';
import { Container, Paper, Typography, Box, Link } from '@mui/material';
import { ForgotPasswordForm } from '../../components/auth/ForgotPasswordForm';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom textAlign="center">
          {t('auth.forgotPasswordTitle')}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
          {t('auth.forgotPasswordDescription')}
        </Typography>
        
        <ForgotPasswordForm onBack={handleBackToLogin} />
        
        <Box textAlign="center" mt={2}>
          <Link 
            component="button"
            variant="body2"
            onClick={handleBackToLogin}
            sx={{ textDecoration: 'none' }}
          >
            {t('auth.backToLoginPage')}
          </Link>
        </Box>
      </Paper>
    </Container>
  );
};

export default ForgotPasswordPage; 