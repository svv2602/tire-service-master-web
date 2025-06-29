// Шаг 3: Информация о клиенте

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  InputAdornment,
  FormControlLabel,
  Checkbox,
  Alert,
  Divider,
  Switch,
} from '@mui/material';
import {
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  ContactPage as ContactPageIcon,
  PersonAdd as PersonAddIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../../store';

// Импорт UI компонентов
import TextField from '../../../components/ui/TextField';
import PhoneField from '../../../components/ui/PhoneField';
import ExistingUserDialog from '../../../components/booking/ExistingUserDialog';

// Импорт API
import { useCheckUserExistsQuery } from '../../../api/users.api';
import { login } from '../../../store/slices/authSlice';

// Импорт типов
import { BookingFormData } from '../NewBookingWithAvailabilityPage';

interface ClientInfoStepProps {
  formData: any; // Используем any для совместимости с локальным BookingFormData
  setFormData: React.Dispatch<React.SetStateAction<any>>;
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
  const dispatch = useDispatch<AppDispatch>();
  
  const [errors, setErrors] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
  });
  
  const [recipientErrors, setRecipientErrors] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
  });
  
  const [receiveNotifications, setReceiveNotifications] = useState(true);
  const [isSelfService, setIsSelfService] = useState(true); // По умолчанию заказчик и получатель - одно лицо
  
  // Состояния для проверки существующих пользователей
  const [existingUserDialogOpen, setExistingUserDialogOpen] = useState(false);
  const [existingUser, setExistingUser] = useState<any>(null);
  const [checkUserData, setCheckUserData] = useState<{ phone?: string; email?: string } | null>(null);
  const [lastCheckedData, setLastCheckedData] = useState<{ phone?: string; email?: string } | null>(null);
  
  // API для проверки существующих пользователей
  const { data: userCheckResult, isLoading: isCheckingUser } = useCheckUserExistsQuery(
    checkUserData || { phone: '', email: '' },
    { 
      skip: !checkUserData || (!checkUserData.phone && !checkUserData.email),
      refetchOnMountOrArgChange: true,
    }
  );
  
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
  const handleFieldChange = (field: string) => (value: string) => {
    setFormData((prev: any) => ({
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
    
    // Проверяем существующих пользователей при изменении телефона или email
    if (field === 'phone' || field === 'email') {
      const phone = field === 'phone' ? value : formData.client.phone;
      const email = field === 'email' ? value : formData.client.email;
      
      // Debounce проверку на 1 секунду
      setTimeout(() => {
        checkExistingUser(phone, email);
      }, 1000);
    }
  };
  
  // Обработчик изменения чекбокса уведомлений
  const handleNotificationsChange = (checked: boolean) => {
    setReceiveNotifications(checked);
  };
  
  // Обработчик изменения полей получателя услуги
  const handleRecipientFieldChange = (field: string) => (value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      service_recipient: {
        ...prev.service_recipient,
        [field]: value,
      }
    }));
    
    // Валидация поля получателя
    const error = validateField(field, value);
    setRecipientErrors(prev => ({
      ...prev,
      [field]: error,
    }));
  };
  
  // Обработчик переключения "самообслуживание"
  const handleSelfServiceToggle = (checked: boolean) => {
    setIsSelfService(checked);
    
    if (checked) {
      // Копируем данные заказчика в поля получателя
      setFormData((prev: any) => ({
        ...prev,
        service_recipient: {
          first_name: prev.client.first_name,
          last_name: prev.client.last_name || '',
          phone: prev.client.phone,
          email: prev.client.email,
        }
      }));
      
      // Очищаем ошибки получателя
      setRecipientErrors({
        first_name: '',
        last_name: '',
        phone: '',
        email: '',
      });
    }
  };
  
  // Проверка существующих пользователей (debounced)
  const checkExistingUser = useCallback((phone: string, email: string) => {
    // Проверяем только если есть валидные данные
    const normalizedPhone = phone?.replace(/[^\d+]/g, '');
    const trimmedEmail = email?.trim();
    
    if ((normalizedPhone && normalizedPhone.length >= 10) || 
        (trimmedEmail && trimmedEmail.includes('@'))) {
      
      const newCheckData = {
        phone: normalizedPhone || undefined,
        email: trimmedEmail || undefined,
      };
      
      // Проверяем, изменились ли данные
      const dataChanged = JSON.stringify(newCheckData) !== JSON.stringify(lastCheckedData);
      
      if (dataChanged) {
        setCheckUserData(newCheckData);
        setLastCheckedData(newCheckData);
      }
    }
  }, [lastCheckedData]);
  
  // Обработчик успешного входа
  const handleLoginSuccess = useCallback(async (loginResult: any) => {
    try {
      // Предзаполняем форму данными авторизованного пользователя
      if (loginResult.user) {
        setFormData((prev: any) => ({
          ...prev,
          client: {
            first_name: loginResult.user.first_name,
            last_name: loginResult.user.last_name,
            phone: loginResult.user.phone,
            email: loginResult.user.email,
          },
          client_id: loginResult.user.client_id || null,
        }));
      }
      
      setExistingUserDialogOpen(false);
    } catch (error) {
      console.error('Ошибка при входе:', error);
    }
  }, [setFormData]);
  
  // Обработчик продолжения как гость
  const handleContinueAsGuest = useCallback(() => {
    setExistingUserDialogOpen(false);
    // Пользователь решил продолжить как гость - ничего не делаем
  }, []);
  
  // Проверка всех ошибок при изменении formData
  useEffect(() => {
    if (!formData.client) {
      setFormData((prev: any) => ({
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
  }, [formData.client, setFormData]);
  
  // Синхронизация данных получателя при самообслуживании
  useEffect(() => {
    if (isSelfService && formData.client) {
      setFormData((prev: any) => ({
        ...prev,
        service_recipient: {
          first_name: prev.client.first_name,
          last_name: prev.client.last_name || '',
          phone: prev.client.phone,
          email: prev.client.email,
        }
      }));
    }
  }, [isSelfService, formData.client.first_name, formData.client.last_name, formData.client.phone, formData.client.email, setFormData]);
  
  // Инициализация данных получателя при первом монтировании
  useEffect(() => {
    // Если данные получателя пустые и включено самообслуживание, копируем данные клиента
    if (isSelfService && 
        !formData.service_recipient.first_name && 
        !formData.service_recipient.phone &&
        (formData.client.first_name || formData.client.phone)) {
      setFormData((prev: any) => ({
        ...prev,
        service_recipient: {
          first_name: prev.client.first_name,
          last_name: prev.client.last_name || '',
          phone: prev.client.phone,
          email: prev.client.email,
        }
      }));
    }
  }, [setFormData]); // Выполняется только при монтировании
  
  // Валидация полей получателя услуги
  useEffect(() => {
    if (!isSelfService && formData.service_recipient) {
      const newRecipientErrors = {
        first_name: validateField('first_name', formData.service_recipient.first_name),
        last_name: validateField('last_name', formData.service_recipient.last_name),
        phone: validateField('phone', formData.service_recipient.phone),
        email: validateField('email', formData.service_recipient.email),
      };
      setRecipientErrors(newRecipientErrors);
    }
  }, [formData.service_recipient, isSelfService]);
  
  // Обработка результатов проверки пользователя
  useEffect(() => {
    if (userCheckResult?.exists && userCheckResult.user && !isAuthenticated) {
      setExistingUser(userCheckResult.user);
      setExistingUserDialogOpen(true);
    }
  }, [userCheckResult, isAuthenticated]);
  
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
      
      {/* Информация о клиенте */}
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
        
        {/* Телефон - блок 1 поднят выше */}
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
        
        {/* Блок "Получатель услуги" - блок 2 опущен ниже, выровнен по левому краю поля Имя */}
        <Grid item xs={12} sm={6}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'flex-start',
            mt: 1,
            p: 2,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            bgcolor: 'background.paper'
          }}>
            <PersonAddIcon sx={{ mr: 2, fontSize: 24, color: 'primary.main' }} />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                Получатель услуги
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Кто будет получать услугу
              </Typography>
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={isSelfService}
                  onChange={(e) => handleSelfServiceToggle(e.target.checked)}
                  color="primary"
                />
              }
              label="Получаю услугу сам"
              labelPlacement="start"
            />
          </Box>
        </Grid>
      </Grid>
      
      {/* Разделитель */}
      <Divider sx={{ my: 4 }} />
      
      {/* Поля получателя услуги (показываются только если не самообслуживание) */}
      {!isSelfService && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 2 }}>
            Данные получателя услуги
          </Typography>
          
          <Grid container spacing={3}>
            {/* Имя получателя */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Имя получателя *"
                value={formData.service_recipient.first_name}
                onChange={(e) => handleRecipientFieldChange('first_name')(e.target.value)}
                placeholder="Например: Анна"
                required
                error={!!recipientErrors.first_name}
                helperText={recipientErrors.first_name || 'Минимум 2 символа'}
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

            {/* Фамилия получателя */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Фамилия получателя *"
                value={formData.service_recipient.last_name}
                onChange={(e) => handleRecipientFieldChange('last_name')(e.target.value)}
                placeholder="Например: Петрова"
                required
                error={!!recipientErrors.last_name}
                helperText={recipientErrors.last_name || 'Минимум 2 символа'}
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
            
            {/* Телефон получателя */}
            <Grid item xs={12} sm={6}>
              <PhoneField
                label="Телефон получателя *"
                value={formData.service_recipient.phone}
                onChange={(value) => handleRecipientFieldChange('phone')(value)}
                required
                error={!!recipientErrors.phone}
                helperText={recipientErrors.phone || 'Формат: +380 67 123-45-67'}
              />
            </Grid>
            
            {/* Email получателя */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Email получателя"
                value={formData.service_recipient.email}
                onChange={(e) => handleRecipientFieldChange('email')(e.target.value)}
                error={!!recipientErrors.email}
                helperText={recipientErrors.email || 'Необязательно'}
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
        </Box>
      )}
      
      {/* Информация при самообслуживании */}
      {isSelfService && (
        <Alert severity="success" sx={{ mt: 2 }}>
          ✅ Вы получите услугу сами. Будут использованы ваши контактные данные.
        </Alert>
      )}

      {/* Уведомление о незаполненных обязательных полях */}
      {(!isValid) && (
        <Alert severity="warning" sx={{ mt: 3 }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
            Заполните все обязательные поля:
          </Typography>
          <Box component="ul" sx={{ pl: 2, mb: 0, mt: 1 }}>
            {!formData.client.first_name && (
              <Typography variant="body2" component="li">
                Имя заказчика
              </Typography>
            )}
            {!formData.client.phone && (
              <Typography variant="body2" component="li">
                Телефон заказчика
              </Typography>
            )}
            {!isSelfService && !formData.service_recipient.first_name && (
              <Typography variant="body2" component="li">
                Имя получателя услуги
              </Typography>
            )}
            {!isSelfService && !formData.service_recipient.last_name && (
              <Typography variant="body2" component="li">
                Фамилия получателя услуги
              </Typography>
            )}
            {!isSelfService && !formData.service_recipient.phone && (
              <Typography variant="body2" component="li">
                Телефон получателя услуги
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
      
      {/* Диалог для существующих пользователей */}
      {existingUser && (
        <ExistingUserDialog
          open={existingUserDialogOpen}
          onClose={() => setExistingUserDialogOpen(false)}
          user={existingUser}
          onLoginSuccess={handleLoginSuccess}
          onContinueAsGuest={handleContinueAsGuest}
        />
      )}
    </Box>
  );
};

export default ClientInfoStep;
