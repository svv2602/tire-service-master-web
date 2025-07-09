import React from 'react';
import { Paper, Typography, Button, Box, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import CloseIcon from '@mui/icons-material/Close';

interface ReviewLoginPromptProps {
  servicePointId?: string | number;
}

const ReviewLoginPrompt: React.FC<ReviewLoginPromptProps> = ({ servicePointId }) => {
  const { t } = useTranslation('components');
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
  };

  const handleRegister = () => {
    navigate('/register');
  };

  const handleSkipAuth = () => {
    // Возвращаемся на предыдущую страницу или на главную
    navigate(-1);
  };

  return (
    <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
      <Grid container spacing={3} alignItems="center">
        <Grid item xs={12} md={8}>
          <Box display="flex" alignItems="center" mb={2}>
            <RateReviewOutlinedIcon fontSize="large" color="primary" sx={{ mr: 2 }} />
            <Typography variant="h5" component="h2">
              {t('reviewLoginPrompt.title')}
            </Typography>
          </Box>
          
          <Typography variant="body1" color="textSecondary" paragraph>
            {t('reviewLoginPrompt.description')}
          </Typography>
          
          <Typography variant="body1" paragraph>
            {t('reviewLoginPrompt.whyReview')}
          </Typography>
          
          <Box component="ul" sx={{ pl: 2 }}>
            <Typography component="li" variant="body1" gutterBottom>
              {t('reviewLoginPrompt.benefits.helpOthers')}
            </Typography>
            <Typography component="li" variant="body1" gutterBottom>
              {t('reviewLoginPrompt.benefits.recognizeQuality')}
            </Typography>
            <Typography component="li" variant="body1" gutterBottom>
              {t('reviewLoginPrompt.benefits.shareExperience')}
            </Typography>
            <Typography component="li" variant="body1" gutterBottom>
              {t('reviewLoginPrompt.benefits.helpImprove')}
            </Typography>
          </Box>
          
          <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<LockOutlinedIcon />}
                onClick={handleLogin}
              >
                {t('reviewLoginPrompt.buttons.login')}
              </Button>
              
              <Button
                variant="outlined"
                color="primary"
                startIcon={<PersonAddOutlinedIcon />}
                onClick={handleRegister}
              >
                {t('reviewLoginPrompt.buttons.register')}
              </Button>
            </Box>
            
            <Button
              variant="text"
              color="secondary"
              size="small"
              startIcon={<CloseIcon />}
              onClick={handleSkipAuth}
              sx={{ alignSelf: 'center', mt: 1 }}
            >
              {t('reviewLoginPrompt.buttons.skip')}
            </Button>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={4} sx={{ display: { xs: 'none', md: 'block' } }}>
          <Box
            component="img"
            src="/assets/images/review-prompt.svg"
            alt={t('reviewLoginPrompt.imageAlt')}
            sx={{ width: '100%', height: 'auto' }}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ReviewLoginPrompt; 