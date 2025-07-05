import React from 'react';
import { Container, Paper, Typography, Box, Link } from '@mui/material';
import { ForgotPasswordForm } from '../../components/auth/ForgotPasswordForm';
import { useNavigate } from 'react-router-dom';

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom textAlign="center">
          Восстановление пароля
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
          Введите email или телефон, указанные при регистрации, и мы отправим инструкции по восстановлению пароля.
        </Typography>
        
        <ForgotPasswordForm onBack={handleBackToLogin} />
        
        <Box textAlign="center" mt={2}>
          <Link 
            component="button"
            variant="body2"
            onClick={handleBackToLogin}
            sx={{ textDecoration: 'none' }}
          >
            Вернуться на страницу входа
          </Link>
        </Box>
      </Paper>
    </Container>
  );
};

export default ForgotPasswordPage; 