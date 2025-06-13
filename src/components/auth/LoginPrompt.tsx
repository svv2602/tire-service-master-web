import React from 'react';
import { Container, Paper, Typography, Button, Box, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';

const LoginPrompt: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
  };

  const handleRegister = () => {
    navigate('/register');
  };

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={7}>
            <Typography variant="h5" component="h1" gutterBottom>
              {t('Войдите в систему для доступа к вашим записям')}
            </Typography>
            
            <Typography variant="body1" color="textSecondary" paragraph>
              {t('Для просмотра истории записей и управления вашими бронированиями необходимо войти в систему или зарегистрироваться.')}
            </Typography>
            
            <Typography variant="body1" paragraph>
              {t('Преимущества регистрации:')}
            </Typography>
            
            <Box component="ul" sx={{ pl: 2 }}>
              <Typography component="li" variant="body1" gutterBottom>
                {t('Просмотр истории всех ваших записей')}
              </Typography>
              <Typography component="li" variant="body1" gutterBottom>
                {t('Удобное управление бронированиями')}
              </Typography>
              <Typography component="li" variant="body1" gutterBottom>
                {t('Возможность переносить и отменять записи')}
              </Typography>
              <Typography component="li" variant="body1" gutterBottom>
                {t('Быстрое бронирование без повторного ввода данных')}
              </Typography>
            </Box>
            
            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<LockOutlinedIcon />}
                onClick={handleLogin}
              >
                {t('Войти')}
              </Button>
              
              <Button
                variant="outlined"
                color="primary"
                size="large"
                startIcon={<PersonAddOutlinedIcon />}
                onClick={handleRegister}
              >
                {t('Зарегистрироваться')}
              </Button>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={5} sx={{ display: { xs: 'none', md: 'block' } }}>
            <Box
              component="img"
              src="/assets/images/login-prompt.svg"
              alt={t('Иллюстрация входа')}
              sx={{ width: '100%', height: 'auto' }}
            />
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default LoginPrompt; 