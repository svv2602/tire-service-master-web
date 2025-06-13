import React from 'react';
import { Paper, Typography, Button, Box, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';

interface ReviewLoginPromptProps {
  servicePointId?: string | number;
}

const ReviewLoginPrompt: React.FC<ReviewLoginPromptProps> = ({ servicePointId }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
  };

  const handleRegister = () => {
    navigate('/register');
  };

  return (
    <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
      <Grid container spacing={3} alignItems="center">
        <Grid item xs={12} md={8}>
          <Box display="flex" alignItems="center" mb={2}>
            <RateReviewOutlinedIcon fontSize="large" color="primary" sx={{ mr: 2 }} />
            <Typography variant="h5" component="h2">
              {t('Войдите, чтобы оставить отзыв')}
            </Typography>
          </Box>
          
          <Typography variant="body1" color="textSecondary" paragraph>
            {t('Для того чтобы оставить отзыв о сервисе, необходимо войти в систему или зарегистрироваться.')}
          </Typography>
          
          <Typography variant="body1" paragraph>
            {t('Почему стоит оставить отзыв:')}
          </Typography>
          
          <Box component="ul" sx={{ pl: 2 }}>
            <Typography component="li" variant="body1" gutterBottom>
              {t('Помочь другим клиентам выбрать хороший сервис')}
            </Typography>
            <Typography component="li" variant="body1" gutterBottom>
              {t('Отметить качественное обслуживание')}
            </Typography>
            <Typography component="li" variant="body1" gutterBottom>
              {t('Поделиться своим опытом')}
            </Typography>
            <Typography component="li" variant="body1" gutterBottom>
              {t('Помочь сервису стать лучше')}
            </Typography>
          </Box>
          
          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<LockOutlinedIcon />}
              onClick={handleLogin}
            >
              {t('Войти')}
            </Button>
            
            <Button
              variant="outlined"
              color="primary"
              startIcon={<PersonAddOutlinedIcon />}
              onClick={handleRegister}
            >
              {t('Зарегистрироваться')}
            </Button>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={4} sx={{ display: { xs: 'none', md: 'block' } }}>
          <Box
            component="img"
            src="/assets/images/review-prompt.svg"
            alt={t('Иллюстрация отзыва')}
            sx={{ width: '100%', height: 'auto' }}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ReviewLoginPrompt; 