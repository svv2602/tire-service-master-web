import React from 'react';
import { Container, Paper, Typography, Button, Box, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import CloseIcon from '@mui/icons-material/Close';

const LoginPrompt: React.FC = () => {
  const { t } = useTranslation('components');
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
  };

  const handleRegister = () => {
    navigate('/register');
  };

  const handleContinueWithoutAuth = () => {
    // Возвращаемся на предыдущую страницу или на главную
    navigate(-1);
  };

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={7}>
            <Typography variant="h5" component="h1" gutterBottom>
              {t('loginPrompt.title')}
            </Typography>
            
            <Typography variant="body1" color="textSecondary" paragraph>
              {t('loginPrompt.description')}
            </Typography>
            
            <Typography variant="body1" paragraph>
              {t('loginPrompt.benefitsTitle')}
            </Typography>
            
            <Box component="ul" sx={{ pl: 2 }}>
              <Typography component="li" variant="body1" gutterBottom>
                {t('loginPrompt.benefits.historyAccess')}
              </Typography>
              <Typography component="li" variant="body1" gutterBottom>
                {t('loginPrompt.benefits.manageBookings')}
              </Typography>
              <Typography component="li" variant="body1" gutterBottom>
                {t('loginPrompt.benefits.rescheduleCancel')}
              </Typography>
              <Typography component="li" variant="body1" gutterBottom>
                {t('loginPrompt.benefits.quickBooking')}
              </Typography>
            </Box>
            
            <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={<LockOutlinedIcon />}
                  onClick={handleLogin}
                >
                  {t('loginPrompt.buttons.login')}
                </Button>
                
                <Button
                  variant="outlined"
                  color="primary"
                  size="large"
                  startIcon={<PersonAddOutlinedIcon />}
                  onClick={handleRegister}
                >
                  {t('loginPrompt.buttons.register')}
                </Button>
              </Box>
              
              <Button
                variant="text"
                color="secondary"
                size="medium"
                startIcon={<CloseIcon />}
                onClick={handleContinueWithoutAuth}
                sx={{ alignSelf: 'center', mt: 1 }}
              >
                {t('loginPrompt.buttons.continueWithout')}
              </Button>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={5} sx={{ display: { xs: 'none', md: 'block' } }}>
            <Box
              component="img"
              src="/assets/images/login-prompt.svg"
              alt={t('loginPrompt.imageAlt')}
              sx={{ width: '100%', height: 'auto' }}
            />
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default LoginPrompt; 