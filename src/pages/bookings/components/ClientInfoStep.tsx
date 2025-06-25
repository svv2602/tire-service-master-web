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
import InputMask from 'react-input-mask';

// Импорт UI компонентов
import { TextField } from '../../../components/ui/TextField';
import { PhoneField } from '../../../components/ui/PhoneField';

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
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
  });
  
  const [receiveNotifications, setReceiveNotifications] = useState(true);
  
  // Валидация полей
  const validateField = (field: string, value: string | undefined): string => {
    if (!value) {
      if (field === 'first_name') {
        return 'Имя обязательно для заполнения';
      }
      if (field === 'phone') {
        return 'Телефон обязателен для заполнения';
      }
      return '';
    }

    switch (field) {
      case 'first_name':
        if (value.trim().length < 2) {
          return 'Имя должно быть не менее 2 символов';
        }
        return '';

      case 'last_name':
        if (value.trim() && value.trim().length < 2) {
          return 'Фамилия должна быть не менее 2 символов';
        }
        return '';
        
      case 'phone':
        // Проверяем, что все символы маски заполнены и номер начинается с +380
        const phoneDigits = value.replace(/[^\d+]/g, '');
        if (!phoneDigits.startsWith('+380')) {
          return 'Телефон должен начинаться с +380';
        }
        if (phoneDigits.length !== 13) { // +380 + 9 цифр
          return 'Телефон должен содержать 12 цифр после +';
        }
        return '';
        
      case 'email':
        if (value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Введите корректный email адрес';
        }
        return '';
        
      default:
        return '';
    }
  };
  
  // Обработчик изменения поля
  const handleFieldChange = (field: keyof BookingFormData['client']) => (value: string) => {
    setFormData(prev => ({
      ...prev,
      client: {
        ...prev.client,
        [field]: value,
      }
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
  };
  
  // Проверка всех ошибок при изменении formData
  useEffect(() => {
    if (!formData.client) {
      setFormData(prev => ({
        ...prev,
        client: {
          first_name: '',
          last_name: '',
          phone: '',
          email: '',
        }
      }));
      return;
    }

    const newErrors = {
      first_name: validateField('first_name', formData.client.first_name),
      last_name: validateField('last_name', formData.client.last_name),
      phone: validateField('phone', formData.client.phone),
      email: validateField('email', formData.client.email),
    };
    setErrors(newErrors);
  }, [formData.client]);
  
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
        {/* Имя */}
        <Grid item xs={12} sm={6}>
          <TextField
            label="Имя *"
            value={formData.client.first_name}
            onChange={(e) => handleFieldChange('first_name')(e.target.value)}
            placeholder="Например: Иван"
            required
            error={!!errors.first_name}
            helperText={errors.first_name || 'Минимум 2 символа'}
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

        {/* Фамилия */}
        <Grid item xs={12} sm={6}>
          <TextField
            label="Фамилия"
            value={formData.client.last_name}
            onChange={(e) => handleFieldChange('last_name')(e.target.value)}
            placeholder="Например: Иванов"
            error={!!errors.last_name}
            helperText={errors.last_name || 'Необязательно'}
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
          <PhoneField
            value={formData.client.phone}
            onChange={(value) => handleFieldChange('phone')(value)}
            required
            error={!!errors.phone}
            helperText={errors.phone || 'Формат: +380 67 123-45-67'}
          />
        </Grid>
        
        {/* Email */}
        <Grid item xs={12} sm={6}>
          <TextField
            label="Email"
            value={formData.client.email}
            onChange={(e) => handleFieldChange('email')(e.target.value)}
            error={!!errors.email}
            helperText={errors.email || 'Необязательно'}
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
            {!formData.client.first_name && (
              <Typography variant="body2" component="li">
                Имя
              </Typography>
            )}
            {!formData.client.last_name && (
              <Typography variant="body2" component="li">
                Фамилия
              </Typography>
            )}
            {!formData.client.phone && (
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
