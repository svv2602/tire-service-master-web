import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Grid,
  FormControlLabel,
  Checkbox,
  InputAdornment,
  FormControl,
  FormHelperText
} from '@mui/material';
import { useTheme } from '@mui/material';
import { getThemeColors } from '../../styles';
import { 
  Person as PersonIcon,
  Email as EmailIcon,
  Comment as CommentIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { PhoneField } from '../ui';

interface ClientInfoFormProps {
  clientInfo: {
    name: string;
    phone: string;
    email: string;
    notes: string;
    receive_notifications: boolean;
  };
  setClientInfo: React.Dispatch<React.SetStateAction<{
    name: string;
    phone: string;
    email: string;
    notes: string;
    receive_notifications: boolean;
  }>>;
  isAuthenticated: boolean;
}

const ClientInfoForm: React.FC<ClientInfoFormProps> = ({ clientInfo, setClientInfo, isAuthenticated }) => {
  const theme = useTheme();
  const colors = getThemeColors(theme);
  const { t } = useTranslation('components');
  
  const [errors, setErrors] = useState({
    name: '',
    phone: '',
    email: '',
  });
  
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Обработчики изменения полей
  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setClientInfo(prev => ({ ...prev, name: value }));
    validateField('name', value);
  };

  const handlePhoneChange = (value: string) => {
    setClientInfo(prev => ({ ...prev, phone: value }));
    validateField('phone', value);
  };

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setClientInfo(prev => ({ ...prev, email: value }));
    validateField('email', value);
  };

  const handleNotesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setClientInfo(prev => ({ ...prev, notes: event.target.value }));
  };

  const handleReceiveNotificationsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setClientInfo(prev => ({ ...prev, receive_notifications: event.target.checked }));
  };

  // Валидация полей
  const validateField = (field: string, value: string) => {
    let errorMessage = '';

    switch (field) {
      case 'name':
        errorMessage = !value ? t('clientInfoForm.validation.nameRequired') : '';
        if (value && value.length < 2) {
          errorMessage = t('clientInfoForm.validation.nameMinLength');
        }
        break;
      case 'phone':
        errorMessage = !value ? t('clientInfoForm.validation.phoneRequired') : '';
        if (value && value.length < 10) {
          errorMessage = t('clientInfoForm.validation.phoneInvalid');
        }
        break;
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errorMessage = t('clientInfoForm.validation.emailInvalid');
        }
        break;
      default:
        break;
    }

    setErrors(prev => ({ ...prev, [field]: errorMessage }));
  };

  // Форматирование телефона для отображения
  const formatPhoneForDisplay = (phone: string) => {
    if (!phone) return '';
    
    if (phone.length <= 4) {
      return `+7 (${phone}`;
    } else if (phone.length <= 7) {
      return `+7 (${phone.slice(0, 3)}) ${phone.slice(3)}`;
    } else if (phone.length <= 9) {
      return `+7 (${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6)}`;
    } else {
      return `+7 (${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6, 8)}-${phone.slice(8, 10)}`;
    }
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: colors.textPrimary }}>
        {t('clientInfoForm.title')}
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            id="client-name"
            label={t('clientInfoForm.fields.name')}
            variant="outlined"
            fullWidth
            required
            value={clientInfo.name}
            onChange={handleNameChange}
            error={!!errors.name}
            helperText={errors.name}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <PhoneField
            id="client-phone"
            value={clientInfo.phone}
            onChange={handlePhoneChange}
            error={!!errors.phone}
            helperText={errors.phone}
            required
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <FormControl fullWidth error={!!errors.email}>
            <TextField
              id="client-email"
              label={t('clientInfoForm.fields.email')}
              variant="outlined"
              fullWidth
              value={clientInfo.email}
              onChange={handleEmailChange}
              error={!!errors.email}
              helperText={errors.email || t('clientInfoForm.fields.emailOptional')}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon />
                  </InputAdornment>
                ),
              }}
            />
          </FormControl>
          <FormHelperText>{errors.email}</FormHelperText>
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            id="client-notes"
            label={t('clientInfoForm.fields.notes')}
            variant="outlined"
            fullWidth
            multiline
            rows={4}
            value={clientInfo.notes}
            onChange={handleNotesChange}
            placeholder={t('clientInfoForm.fields.notesPlaceholder')}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CommentIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox 
                checked={acceptTerms} 
                onChange={(e) => setAcceptTerms(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                {t('clientInfoForm.agreements.termsAcceptance')}
              </Typography>
            }
          />
        </Grid>

        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                name="receive_notifications"
                checked={clientInfo.receive_notifications}
                onChange={handleReceiveNotificationsChange}
                color="primary"
              />
            }
            label={t('clientInfoForm.agreements.notifications')}
            sx={{ mt: 2 }}
          />
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 4, p: 2, bgcolor: colors.backgroundSecondary, borderRadius: 2 }}>
        <Typography variant="body2" sx={{ color: colors.textSecondary }}>
          {t('clientInfoForm.privacyNotice')}
        </Typography>
      </Box>
    </Box>
  );
};

export default ClientInfoForm; 