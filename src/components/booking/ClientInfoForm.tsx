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
  Phone as PhoneIcon,
  Email as EmailIcon,
  Comment as CommentIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  
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

  const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    // Простая маска для телефона
    const formattedValue = value
      .replace(/\D/g, '') // Удаляем все нецифровые символы
      .slice(0, 11); // Ограничиваем длину
    
    setClientInfo(prev => ({ ...prev, phone: formattedValue }));
    validateField('phone', formattedValue);
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
        errorMessage = !value ? 'Введите ваше имя' : '';
        if (value && value.length < 2) {
          errorMessage = 'Имя должно содержать не менее 2 символов';
        }
        break;
      case 'phone':
        errorMessage = !value ? 'Введите номер телефона' : '';
        if (value && value.length < 10) {
          errorMessage = 'Введите корректный номер телефона';
        }
        break;
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errorMessage = 'Введите корректный email';
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
        Контактные данные
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            id="client-name"
            label="Ваше имя"
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
          <TextField
            id="client-phone"
            label="Номер телефона"
            variant="outlined"
            fullWidth
            required
            value={formatPhoneForDisplay(clientInfo.phone)}
            onChange={handlePhoneChange}
            error={!!errors.phone}
            helperText={errors.phone || 'Формат: +7 (XXX) XXX-XX-XX'}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <FormControl fullWidth error={!!errors.email}>
            <TextField
              id="client-email"
              label="Email"
              variant="outlined"
              fullWidth
              value={clientInfo.email}
              onChange={handleEmailChange}
              error={!!errors.email}
              helperText={errors.email || 'Необязательно'}
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
            label="Комментарий к записи"
            variant="outlined"
            fullWidth
            multiline
            rows={4}
            value={clientInfo.notes}
            onChange={handleNotesChange}
            placeholder="Укажите дополнительную информацию, которая может быть полезна специалистам (необязательно)"
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
                Я согласен на обработку персональных данных и принимаю условия пользовательского соглашения
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
            label={t('Получать уведомления на email')}
            sx={{ mt: 2 }}
          />
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 4, p: 2, bgcolor: colors.backgroundSecondary, borderRadius: 2 }}>
        <Typography variant="body2" sx={{ color: colors.textSecondary }}>
          На указанный номер телефона придет SMS с подтверждением записи.
          Мы не передаем ваши данные третьим лицам и не используем их для рассылки рекламы.
        </Typography>
      </Box>
    </Box>
  );
};

export default ClientInfoForm; 