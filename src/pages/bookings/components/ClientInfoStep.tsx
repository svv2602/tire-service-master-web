// ✅ Шаг 3: {t('bookingSteps.clientInfo.title')} (упрощенный для гостевых бронирований)

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Grid,
  InputAdornment,
  Alert,
  Divider,
  Paper,
  FormControlLabel,
  Checkbox,
  Chip,
} from '@mui/material';
import {
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  ContactPage as ContactPageIcon,
  AccountCircle as AccountCircleIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { useTheme } from '@mui/material/styles';

// Импорт UI компонентов
import TextField from '../../../components/ui/TextField';
import PhoneField from '../../../components/ui/PhoneField';

// Импорт типов
import { BookingFormData } from '../../../types/booking';

// Импорт стилей
import { getCardStyles } from '../../../styles/components';

interface ClientInfoStepProps {
  formData: BookingFormData;
  setFormData: React.Dispatch<React.SetStateAction<BookingFormData>>;
  onNext: () => void;
  onBack: () => void;
  isValid: boolean;
}

const ClientInfoStep: React.FC<ClientInfoStepProps> = ({
  formData,
  setFormData,
  isValid,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  
  // Состояние для чекбокса "Я получатель услуг"
  const [isUserRecipient, setIsUserRecipient] = useState(false);
  
  const [errors, setErrors] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
  });
  
  // Валидация полей
  const validateField = (field: string, value: string | undefined): string => {
    if (!value) {
      if (field === 'first_name') {
        return t('bookingSteps.clientInfo.validation.firstNameRequired');
      }
      if (field === 'last_name') {
        return t('bookingSteps.clientInfo.validation.lastNameRequired');
      }
      if (field === 'phone') {
        return t('bookingSteps.clientInfo.validation.phoneRequired');
      }
      return '';
    }

    switch (field) {
      case 'first_name':
      case 'last_name':
        if (value.trim().length < 2) {
          return field === 'first_name' 
            ? t('bookingSteps.clientInfo.validation.firstNameMinLength')
            : t('bookingSteps.clientInfo.validation.lastNameMinLength');
        }
        return '';
        
      case 'phone':
        // Проверяем, что все символы маски заполнены и номер начинается с +380
        const phoneDigits = value.replace(/[^\d+]/g, '');
        if (!phoneDigits.startsWith('+380')) {
          return t('bookingSteps.clientInfo.validation.phoneStartsWith');
        }
        if (phoneDigits.length !== 13) { // +380 + 9 цифр
          return t('bookingSteps.clientInfo.validation.phoneLength');
        }
        return '';
        
      case 'email':
        if (value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return t('bookingSteps.clientInfo.validation.emailFormat');
        }
        return '';
        
      default:
        return '';
    }
  };
  
  // Обработчик изменения полей получателя услуги
  const handleFieldChange = (field: string) => (value: string) => {
    setFormData((prev: BookingFormData) => ({
      ...prev,
      service_recipient: {
        ...prev.service_recipient,
        [field]: value,
      }
    }));
    
    // Валидация поля получателя
    const error = validateField(field, value);
    setErrors(prev => ({
      ...prev,
      [field]: error,
    }));
  };

  // Обработчик чекбокса "Я получатель услуг"
  const handleUserRecipientChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setIsUserRecipient(checked);
    
    if (checked && user) {
      // Копируем данные пользователя в поля получателя
      setFormData((prev: BookingFormData) => ({
        ...prev,
        service_recipient: {
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          phone: user.phone || '',
          email: user.email || '',
        }
      }));
      
      // Сбрасываем ошибки
      setErrors({
        first_name: '',
        last_name: '',
        phone: '',
        email: '',
      });
    } else {
      // Очищаем поля получателя
      setFormData((prev: BookingFormData) => ({
        ...prev,
        service_recipient: {
          first_name: '',
          last_name: '',
          phone: '',
          email: '',
        }
      }));
    }
  };
  
  // Проверяем все поля на валидность для отображения ошибок
  const getRequiredFieldErrors = () => {
    const requiredFields = [];
    
    if (!formData.service_recipient.first_name?.trim()) {
      requiredFields.push(`${t('bookingSteps.clientInfo.firstName')}`);
    }
    if (!formData.service_recipient.last_name?.trim()) {
      requiredFields.push(`${t('bookingSteps.clientInfo.lastName')}`);
    }
    if (!formData.service_recipient.phone?.trim()) {
      requiredFields.push(t('bookingSteps.clientInfo.phone'));
    }
    
    return requiredFields;
  };
  
  const isFormValid = () => {
    return isValid;
  };
  
  const requiredFieldErrors = getRequiredFieldErrors();
  
  return (
    <Box>
      {/* Заголовок */}
      <Typography variant="h5" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
        {t('bookingSteps.clientInfo.title')}
      </Typography>

      {/* Статус пользователя */}
      {isAuthenticated ? (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            {t('bookingSteps.clientInfo.status.authenticated')} <strong>{user?.first_name} {user?.last_name}</strong>. 
            {t('bookingSteps.clientInfo.status.dataPrefilledFromProfile')}
          </Typography>
        </Alert>
      ) : (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            {t('components:clientInfoStep.guestBookingPrefix')} <strong>{t('bookingSteps.clientInfo.status.guestBooking')}</strong>. 
            {t('bookingSteps.clientInfo.status.guestBookingInfo')}
          </Typography>
        </Alert>
      )}

      {/* Секция для авторизованного пользователя */}
      {isAuthenticated && user && (
        <>
          {/* Данные заказчика (только для чтения) */}
          <Paper sx={{ ...getCardStyles(theme), p: 2, mb: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccountCircleIcon color="primary" />
              Данные заказчика
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Имя и фамилия"
                  value={`${user.first_name} ${user.last_name}`}
                  disabled
                  fullWidth
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  label="Телефон"
                  value={user.phone}
                  disabled
                  fullWidth
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              {user.email && (
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Email"
                    value={user.email}
                    disabled
                    fullWidth
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              )}
            </Grid>
          </Paper>

          {/* Получатель услуг */}
          <Paper sx={{ ...getCardStyles(theme), p: 2, mb: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonAddIcon color="primary" />
              Получатель услуг
            </Typography>
            
            {/* Чекбокс "Я получатель услуг" */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={isUserRecipient}
                  onChange={handleUserRecipientChange}
                  color="primary"
                />
              }
              label="Я получатель услуг"
              sx={{ mb: 2 }}
            />
            
            {/* Поля получателя услуг */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  label={t('bookingSteps.clientInfo.firstName')}
                  value={formData.service_recipient.first_name}
                  onChange={(e) => handleFieldChange('first_name')(e.target.value)}
                  error={!!errors.first_name}
                  helperText={errors.first_name}
                  required
                  disabled={isUserRecipient}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  placeholder={t('bookingSteps.clientInfo.placeholders.firstName')}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label={t('bookingSteps.clientInfo.lastName')}
                  value={formData.service_recipient.last_name}
                  onChange={(e) => handleFieldChange('last_name')(e.target.value)}
                  error={!!errors.last_name}
                  helperText={errors.last_name}
                  required
                  disabled={isUserRecipient}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  placeholder={t('bookingSteps.clientInfo.placeholders.lastName')}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <PhoneField
                  label={t('bookingSteps.clientInfo.phone')}
                  value={formData.service_recipient.phone}
                  onChange={handleFieldChange('phone')}
                  error={!!errors.phone}
                  helperText={errors.phone || t('bookingSteps.clientInfo.helperText.phoneFormat')}
                  placeholder={t('bookingSteps.clientInfo.placeholders.phone', '+38 (067) 123-45-67')}
                  required
                  disabled={isUserRecipient}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label={t('bookingSteps.clientInfo.email')}
                  type="email"
                  value={formData.service_recipient.email || ''}
                  onChange={(e) => handleFieldChange('email')(e.target.value)}
                  error={!!errors.email}
                  helperText={errors.email || t('bookingSteps.clientInfo.helperText.email')}
                  disabled={isUserRecipient}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  placeholder={t('bookingSteps.clientInfo.placeholders.email')}
                />
              </Grid>
            </Grid>
          </Paper>
        </>
      )}

      {/* Секция для неавторизованного пользователя (как было раньше) */}
      {!isAuthenticated && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              label={t('bookingSteps.clientInfo.firstName')}
              value={formData.service_recipient.first_name}
              onChange={(e) => handleFieldChange('first_name')(e.target.value)}
              error={!!errors.first_name}
              helperText={errors.first_name}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="action" />
                  </InputAdornment>
                ),
              }}
              placeholder={t('bookingSteps.clientInfo.placeholders.firstName')}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label={t('bookingSteps.clientInfo.lastName')}
              value={formData.service_recipient.last_name}
              onChange={(e) => handleFieldChange('last_name')(e.target.value)}
              error={!!errors.last_name}
              helperText={errors.last_name}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="action" />
                  </InputAdornment>
                ),
              }}
              placeholder={t('bookingSteps.clientInfo.placeholders.lastName')}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <PhoneField
              label={t('bookingSteps.clientInfo.phone')}
              value={formData.service_recipient.phone}
              onChange={handleFieldChange('phone')}
              error={!!errors.phone}
              helperText={errors.phone || t('bookingSteps.clientInfo.helperText.phoneFormat')}
              placeholder={t('bookingSteps.clientInfo.placeholders.phone', '+38 (067) 123-45-67')}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label={t('bookingSteps.clientInfo.email')}
              type="email"
              value={formData.service_recipient.email || ''}
              onChange={(e) => handleFieldChange('email')(e.target.value)}
              error={!!errors.email}
              helperText={errors.email || t('bookingSteps.clientInfo.helperText.email')}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
              placeholder={t('bookingSteps.clientInfo.placeholders.email')}
            />
          </Grid>
        </Grid>
      )}

      {/* Информация о конфиденциальности */}
      <Divider sx={{ my: 3 }} />
      
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>{t('bookingSteps.clientInfo.privacy')}:</strong> {t('bookingSteps.clientInfo.privacyText')}
        </Typography>
      </Alert>

      {/* Валидация формы */}
      {(!isFormValid()) && (
        <Alert severity="warning" sx={{ mt: 3 }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
            {t('bookingSteps.clientInfo.requiredFieldsWarning')}:
          </Typography>
          <Box component="ul" sx={{ pl: 2, mb: 0, mt: 1 }}>
            {requiredFieldErrors.map((field, index) => (
              <li key={index}>{field}</li>
            ))}
          </Box>
        </Alert>
      )}

      {isFormValid() && (
        <Alert severity="success" sx={{ mt: 3 }}>
          {t('bookingSteps.clientInfo.allRequiredFieldsFilled')}
        </Alert>
      )}
    </Box>
  );
};

export default ClientInfoStep;
