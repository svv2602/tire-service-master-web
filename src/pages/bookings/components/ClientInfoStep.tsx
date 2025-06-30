// ✅ Шаг 3: Контактная информация (упрощенный для гостевых бронирований)

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  InputAdornment,
  Alert,
  Divider,
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
import TextField from '../../../components/ui/TextField';
import PhoneField from '../../../components/ui/PhoneField';

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
  
  // Валидация полей
  const validateField = (field: string, value: string | undefined): string => {
    if (!value) {
      if (field === 'first_name') {
        return 'Имя обязательно для заполнения';
      }
      if (field === 'last_name') {
        return 'Фамилия обязательна для заполнения';
      }
      if (field === 'phone') {
        return 'Телефон обязателен для заполнения';
      }
      return '';
    }

    switch (field) {
      case 'first_name':
      case 'last_name':
        if (value.trim().length < 2) {
          return `${field === 'first_name' ? 'Имя' : 'Фамилия'} должно быть не менее 2 символов`;
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
  
  // Проверяем все поля на валидность для отображения ошибок
  const getRequiredFieldErrors = () => {
    const requiredFields = [];
    
    if (!formData.service_recipient.first_name?.trim()) {
      requiredFields.push('Имя');
    }
    if (!formData.service_recipient.last_name?.trim()) {
      requiredFields.push('Фамилия');
    }
    if (!formData.service_recipient.phone?.trim()) {
      requiredFields.push('Телефон');
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
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" component="h2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <ContactPageIcon color="primary" />
          Контактная информация
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {isAuthenticated 
            ? "Проверьте и при необходимости измените контактную информацию"
            : "Укажите контактную информацию для связи и уведомлений о бронировании"
          }
        </Typography>
      </Box>

      {/* Статус пользователя */}
      {isAuthenticated ? (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Вы авторизованы как <strong>{user?.first_name} {user?.last_name}</strong>. 
            Данные предзаполнены из вашего профиля.
          </Typography>
        </Alert>
      ) : (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Вы создаете <strong>гостевое бронирование</strong>. 
            Информация о бронировании будет отправлена на указанный номер телефона.
          </Typography>
        </Alert>
      )}

      {/* Форма контактной информации */}
      <Grid container spacing={3}>
        {/* Имя */}
        <Grid item xs={12} md={6}>
          <TextField
            label="Имя"
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
            placeholder="Введите имя"
          />
        </Grid>

        {/* Фамилия */}
        <Grid item xs={12} md={6}>
          <TextField
            label="Фамилия"
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
            placeholder="Введите фамилию"
          />
        </Grid>

        {/* Телефон */}
        <Grid item xs={12} md={6}>
          <PhoneField
            label="Телефон"
            value={formData.service_recipient.phone}
            onChange={handleFieldChange('phone')}
            error={!!errors.phone}
            helperText={errors.phone || "Формат: +380 XX XXX XX XX"}
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

        {/* Email */}
        <Grid item xs={12} md={6}>
          <TextField
            label="Email (необязательно)"
            type="email"
            value={formData.service_recipient.email || ''}
            onChange={(e) => handleFieldChange('email')(e.target.value)}
            error={!!errors.email}
            helperText={errors.email || "Для получения уведомлений на email"}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon color="action" />
                </InputAdornment>
              ),
            }}
            placeholder="example@mail.com"
          />
        </Grid>
      </Grid>

      {/* Информация о конфиденциальности */}
      <Divider sx={{ my: 3 }} />
      
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>Конфиденциальность:</strong> Ваши персональные данные используются только для обработки бронирования 
          и связи с вами. Мы не передаем ваши данные третьим лицам.
        </Typography>
      </Alert>

      {/* Валидация формы */}
      {(!isFormValid()) && (
        <Alert severity="warning" sx={{ mt: 3 }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
            Заполните все обязательные поля:
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
          <Typography variant="body2">
            ✅ Контактная информация заполнена корректно. Можете переходить к следующему шагу.
          </Typography>
        </Alert>
      )}
    </Box>
  );
};

export default ClientInfoStep;
