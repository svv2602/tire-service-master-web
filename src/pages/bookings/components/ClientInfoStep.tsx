// Шаг 3: Информация о клиенте

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  InputAdornment,
  FormControlLabel,
  Checkbox,
  Alert,
} from '@mui/material';
import {
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  ContactPage as ContactPageIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';

// Импорт UI компонентов
import { TextField } from '../../../components/ui/TextField';

// Импорт типов
import { BookingFormData } from '../NewBookingWithAvailabilityPage';

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
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  
  const [errors, setErrors] = useState({
    client_name: '',
    client_phone: '',
    client_email: '',
  });
  
  const [receiveNotifications, setReceiveNotifications] = useState(true);
  
  // Валидация полей
  const validateField = (field: string, value: string) => {
    switch (field) {
      case 'client_name':
        if (!value.trim()) {
          return 'Имя обязательно для заполнения';
        }
        if (value.trim().length < 2) {
          return 'Имя должно содержать минимум 2 символа';
        }
        return '';
        
      case 'client_phone':
        if (!value.trim()) {
          return 'Телефон обязателен для заполнения';
        }
        // Простая валидация телефона
        const phoneRegex = /^[+]?[0-9\s\-()]{10,}$/;
        if (!phoneRegex.test(value.replace(/\s/g, ''))) {
          return 'Введите корректный номер телефона';
        }
        return '';
        
      case 'client_email':
        if (value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Введите корректный email адрес';
        }
        return '';
        
      default:
        return '';
    }
  };
  
  // Обработчик изменения поля
  const handleFieldChange = (field: keyof typeof formData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Валидация поля
    const error = validateField(field, value);
    setErrors(prev => ({
      ...prev,
      [field]: error,
    }));
  };
  
  // Обработчик изменения чекбокса уведомлений
  const handleNotificationsChange = (checked: boolean) => {
    setReceiveNotifications(checked);
    // Можно сохранить это в formData если нужно
  };
  
  // Проверка всех ошибок при изменении formData
  useEffect(() => {
    const newErrors = {
      client_name: validateField('client_name', formData.client_name),
      client_phone: validateField('client_phone', formData.client_phone),
      client_email: validateField('client_email', formData.client_email),
    };
    setErrors(newErrors);
  }, [formData.client_name, formData.client_phone, formData.client_email]);
  
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <ContactPageIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
        <Box>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 600, mb: 0.5 }}>
            Контактная информация
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Шаг 3 из 4: Укажите ваши контактные данные для связи
          </Typography>
        </Box>
      </Box>
      
      {/* Информация для аутентифицированных пользователей */}
      {isAuthenticated && user && (
        <Alert severity="info" sx={{ mb: 3 }}>
          👤 Вы вошли как {user.first_name} {user.last_name}. 
          Данные предзаполнены из вашего профиля, но вы можете их изменить.
        </Alert>
      )}
      
      {/* Информация для неаутентифицированных пользователей */}
      {!isAuthenticated && (
        <Alert severity="info" sx={{ mb: 3 }}>
          💡 Регистрация не требуется. Вы можете записаться без регистрации. 
          Укажите ваши контактные данные для связи и подтверждения бронирования.
        </Alert>
      )}
      
      <Grid container spacing={3}>
        {/* Имя и фамилия */}
        <Grid item xs={12}>
          <TextField
            label="Имя и фамилия *"
            value={formData.client_name}
            onChange={handleFieldChange('client_name')}
            placeholder="Например: Иван Иванов"
            required
            error={!!errors.client_name}
            helperText={errors.client_name || 'Ваше полное имя для записи'}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon color="action" />
                </InputAdornment>
              ),
            }}
            fullWidth
          />
        </Grid>
        
        {/* Телефон */}
        <Grid item xs={12} sm={6}>
          <TextField
            label="Телефон *"
            value={formData.client_phone}
            onChange={handleFieldChange('client_phone')}
            placeholder="+380 67 123 45 67"
            required
            error={!!errors.client_phone}
            helperText={errors.client_phone || 'Для связи и подтверждения записи'}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneIcon color="action" />
                </InputAdornment>
              ),
            }}
            fullWidth
          />
        </Grid>
        
        {/* Email */}
        <Grid item xs={12} sm={6}>
          <TextField
            label="Email"
            value={formData.client_email}
            onChange={handleFieldChange('client_email')}
            placeholder="your.email@example.com"
            type="email"
            error={!!errors.client_email}
            helperText={errors.client_email || 'Необязательно. Для отправки подтверждения'}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon color="action" />
                </InputAdornment>
              ),
            }}
            fullWidth
          />
        </Grid>
      </Grid>
      
      {/* Настройки уведомлений */}
      <Alert severity="info" sx={{ mt: 3 }}>
        📧 Настройки уведомлений
        <FormControlLabel
          control={
            <Checkbox
              checked={receiveNotifications}
              onChange={(e) => handleNotificationsChange(e.target.checked)}
              color="primary"
            />
          }
          label="Получать SMS и email уведомления о статусе записи"
          sx={{ mt: 1, display: 'block' }}
        />
      </Alert>
      
      {/* Информация о конфиденциальности */}
      <Alert severity="info" sx={{ mt: 3 }}>
        🔒 Ваши персональные данные используются только для обработки бронирования 
        и не передаются третьим лицам. Подробнее в{' '}
        <Typography component="span" color="primary" sx={{ cursor: 'pointer', textDecoration: 'underline' }}>
          политике конфиденциальности
        </Typography>
      </Alert>
      
      {/* Уведомление о незаполненных обязательных полях */}
      {(!isValid) && (
        <Alert severity="warning" sx={{ mt: 3 }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
            Заполните все обязательные поля:
          </Typography>
          <Box component="ul" sx={{ pl: 2, mb: 0, mt: 1 }}>
            {!formData.client_name && (
              <Typography variant="body2" component="li">
                Имя и фамилия
              </Typography>
            )}
            {!formData.client_phone && (
              <Typography variant="body2" component="li">
                Телефон
              </Typography>
            )}
          </Box>
        </Alert>
      )}
      
      {/* Информационное сообщение */}
      {isValid && (
        <Alert severity="info" sx={{ mt: 3 }}>
          Все обязательные поля заполнены. Можете перейти к следующему шагу.
        </Alert>
      )}
    </Box>
  );
};

export default ClientInfoStep;
