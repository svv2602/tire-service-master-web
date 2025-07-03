import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Divider,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  useTheme,
  Alert,
} from '@mui/material';
import {
  Save as SaveIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Lock as LockIcon,
  CalendarMonth as CalendarIcon,
  AdminPanelSettings as RoleIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { UserRole } from '../../types';
import { phoneValidation } from '../../utils/validation';
import * as yup from 'yup';
import { useChangePasswordMutation } from '../../api/auth.api';

// Импорты UI компонентов
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/TextField';
import { PhoneField } from '../../components/ui/PhoneField';
import { Chip } from '../../components/ui/Chip';
import { Snackbar } from '../../components/ui/Snackbar';
import { Card } from '../../components/ui/Card';

import {
  SIZES,
  getCardStyles,
  getButtonStyles,
  getTextFieldStyles,
  getChipStyles,
  getFormStyles,
} from '../../styles';

// Интерфейс для данных формы
interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ProfilePage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [changePassword, setChangePassword] = useState(false);
  
  // Хук для смены пароля
  const [changePasswordApi, { isLoading: isChangingPassword }] = useChangePasswordMutation();
  
  // Вывод данных пользователя в консоль для отладки
  useEffect(() => {
    if (user) {
      console.log('=== Данные пользователя в ProfilePage ===');
      console.log('user:', user);
      console.log('JSON.stringify(user):', JSON.stringify(user, null, 2));
    }
  }, [user]);

  // Инициализация данных формы
  const [formData, setFormData] = useState<UserFormData>({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    position: user ? getRoleLabel(user.role) : 'Користувач',
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Обновление данных формы при изменении пользователя
  useEffect(() => {
    if (user) {
      setFormData(prevData => ({
        ...prevData,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        phone: user.phone || '',
        position: getRoleLabel(user.role),
      }));
    }
  }, [user]);

  // Получение инициалов для аватара
  const getInitials = () => {
    if (!user) return '';
    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`;
  };

  // Обработчик изменения полей формы
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Переключение режима изменения пароля
  const toggleChangePassword = () => {
    setChangePassword(!changePassword);
    if (!changePassword) {
      setFormData({
        ...formData,
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
  };

  // Сохранение данных профиля
  const handleSaveProfile = async () => {
    setLoading(true);
    setError(null);

    // Проверка паролей при изменении
    if (changePassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        setError('Новый пароль и подтверждение не совпадают');
        setLoading(false);
        return;
      }
      if (formData.newPassword.length < 8) {
        setError('Новый пароль должен содержать минимум 8 символов');
        setLoading(false);
        return;
      }
      try {
        // Отправляем запрос на смену пароля
        if (user?.id) {
          await changePasswordApi({
            id: user.id,
            password: formData.newPassword,
            password_confirmation: formData.confirmPassword,
          }).unwrap();
        }
        setSaveSuccess(true);
        setChangePassword(false);
        setFormData({
          ...formData,
          oldPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } catch (err: any) {
        setError(err?.data || 'Ошибка смены пароля');
      } finally {
        setLoading(false);
      }
      return;
    }
    // ... здесь может быть логика обновления других данных профиля ...
    setLoading(false);
    setSaveSuccess(true);
  };

  // Обработчик закрытия уведомления
  const handleCloseSnackbar = () => {
    setSaveSuccess(false);
  };

  // Получение метки роли
  function getRoleLabel(role?: string): string {
    if (!role) return 'Користувач';
    
    switch (role) {
      case UserRole.ADMIN:
        return 'Адміністратор';
      case UserRole.PARTNER:
        return 'Партнер';
      case UserRole.MANAGER:
        return 'Менеджер';
      case UserRole.CLIENT:
        return 'Клієнт';
      default:
        return 'Користувач';
    }
  }

  // Получение цвета метки роли
  const getRoleColor = (role?: string) => {
    if (!role) return 'default';
    
    switch (role) {
      case UserRole.ADMIN:
        return 'error';
      case UserRole.PARTNER:
        return 'warning';
      case UserRole.MANAGER:
        return 'primary';
      case UserRole.CLIENT:
        return 'success';
      default:
        return 'default';
    }
  };

  // Инициализация темы и стилей
  const theme = useTheme();
  const cardStyles = getCardStyles(theme);
  const formCardStyles = getCardStyles(theme, 'secondary');
  const primaryButtonStyles = getButtonStyles(theme, 'primary');
  const textFieldStyles = getTextFieldStyles(theme);
  const chipStyles = getChipStyles(theme);
  const formStyles = getFormStyles(theme);

  // Схема валидации с Yup
  const validationSchema = yup.object({
    email: yup
      .string()
      .email('Введите корректный email')
      .required('Email обязателен'),
    first_name: yup
      .string()
      .required('Имя обязательно')
      .min(2, 'Имя должно быть не менее 2 символов'),
    last_name: yup
      .string()
      .required('Фамилия обязательна')
      .min(2, 'Фамилия должна быть не менее 2 символов'),
    phone: phoneValidation,
    current_password: yup
      .string()
      .min(6, 'Пароль должен содержать минимум 6 символов')
      .test('required-if-new-password', 'Введите текущий пароль', function(value) {
        return !this.parent.new_password || (this.parent.new_password && value);
      }),
    new_password: yup
      .string()
      .min(6, 'Пароль должен содержать минимум 6 символов'),
    new_password_confirmation: yup
      .string()
      .test('passwords-match', 'Пароли не совпадают', function(value) {
        return !this.parent.new_password || this.parent.new_password === value;
      })
  });

  return (
    <Box sx={{ p: SIZES.spacing.lg }}>
      <Typography variant="h4" gutterBottom sx={{ 
        mb: SIZES.spacing.lg,
        fontSize: SIZES.fontSize.xl,
        fontWeight: 600
      }}>
        Профіль користувача
      </Typography>

      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', md: '1fr 3fr' }, 
        gap: SIZES.spacing.lg 
      }}>
        {/* Карточка с информацией о профиле */}
        <Box>
          <Card 
            sx={{ 
              mb: SIZES.spacing.lg, 
              ...cardStyles,
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              pt: SIZES.spacing.lg,
              p: SIZES.spacing.lg
            }}
          >
            {/* Аватар пользователя */}
            <Avatar 
              sx={{ 
                width: 100, 
                height: 100, 
                mb: SIZES.spacing.md, 
                bgcolor: theme.palette.primary.main, 
                fontSize: SIZES.fontSize.xl 
              }}
            >
              {getInitials()}
            </Avatar>
            
            <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
              {user?.first_name} {user?.last_name}
            </Typography>
            
            <Typography 
              color="textSecondary" 
              gutterBottom 
              sx={{ mb: SIZES.spacing.xs }}
            >
              {formData.position}
            </Typography>
            
            <Chip 
              icon={<RoleIcon />} 
              label={getRoleLabel(user?.role)}
              color={getRoleColor(user?.role) as 'default' | 'primary' | 'success' | 'error'} 
              sx={{ 
                mt: SIZES.spacing.xs,
                ...chipStyles
              }}
            />
            
            <Divider sx={{ width: '100%', my: SIZES.spacing.md }} />
            
            <List sx={{ width: '100%' }}>
              <ListItem sx={{ 
                py: SIZES.spacing.sm,
                '&:hover': { 
                  bgcolor: theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.05)'
                    : 'rgba(0, 0, 0, 0.02)',
                  borderRadius: SIZES.borderRadius.sm
                }
              }}>
                <ListItemIcon>
                  <EmailIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary={<Typography variant="body2" color="textSecondary">Email</Typography>}
                  secondary={<Typography variant="body1">{user?.email}</Typography>}
                />
              </ListItem>
              
              {/* Телефон */}
              <ListItem>
                <ListItemIcon>
                  <PhoneIcon />
                </ListItemIcon>
                <ListItemText 
                  primary={
                    <PhoneField
                      fullWidth
                      name="phone"
                      value={formData.phone}
                      onChange={(value) => setFormData(prev => ({ ...prev, phone: value }))}
                      disabled={loading}
                      sx={textFieldStyles}
                    />
                  }
                />
              </ListItem>
              
              <ListItem sx={{ 
                py: SIZES.spacing.sm,
                '&:hover': { 
                  bgcolor: theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.05)'
                    : 'rgba(0, 0, 0, 0.02)',
                  borderRadius: SIZES.borderRadius.sm
                }
              }}>
                <ListItemIcon>
                  <BusinessIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary={<Typography variant="body2" color="textSecondary">Організація</Typography>}
                  secondary={<Typography variant="body1">Твоя шина</Typography>}
                />
              </ListItem>
              
              <ListItem sx={{ 
                py: SIZES.spacing.sm,
                '&:hover': { 
                  bgcolor: theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.05)'
                    : 'rgba(0, 0, 0, 0.02)',
                  borderRadius: SIZES.borderRadius.sm
                }
              }}>
                <ListItemIcon>
                  <CalendarIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary={<Typography variant="body2" color="textSecondary">Статус користувача</Typography>}
                  secondary={
                    <Chip 
                      size="small"
                      label={user?.is_active ? 'Активний' : 'Неактивний'} 
                      color={user?.is_active ? 'success' : 'error'}
                      sx={{
                        mt: SIZES.spacing.xs,
                        height: 24
                      }}
                    />
                  }
                />
              </ListItem>
            </List>
          </Card>
        </Box>

        {/* Форма редактирования профиля */}
        <Box>
          <Box sx={{ 
            p: SIZES.spacing.lg,
            ...formCardStyles,
            borderRadius: SIZES.borderRadius.md
          }}>
            {error && (
              <Alert severity="error" sx={{ mb: SIZES.spacing.lg }}>
                ❌ {error}
              </Alert>
            )}
            
            <Typography 
              variant="h6" 
              gutterBottom
              sx={{ fontWeight: 'medium', mb: SIZES.spacing.sm }}
            >
              Редагування профілю
            </Typography>
            <Divider sx={{ mb: SIZES.spacing.lg }} />
            
            <Box 
              component="form" 
              sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
                gap: SIZES.spacing.md,
                ...formStyles
              }}
            >
              <Box>
                <TextField
                  fullWidth
                  label="Ім'я"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  sx={textFieldStyles}
                />
              </Box>
              
              <Box>
                <TextField
                  fullWidth
                  label="Прізвище"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  sx={textFieldStyles}
                />
              </Box>
              
              <Box>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  sx={textFieldStyles}
                />
              </Box>
              
              <Box>
                <PhoneField
                  fullWidth
                  name="phone"
                  value={formData.phone}
                  onChange={(value) => setFormData(prev => ({ ...prev, phone: value }))}
                  sx={textFieldStyles}
                />
              </Box>
              
              <Box sx={{ gridColumn: '1 / -1' }}>
                <TextField
                  fullWidth
                  label="Посада"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  sx={textFieldStyles}
                />
              </Box>
              
              <Box sx={{ gridColumn: '1 / -1' }}>
                <Divider sx={{ my: SIZES.spacing.md }} />
                <Button 
                  startIcon={<LockIcon />} 
                  onClick={toggleChangePassword}
                  color="primary"
                  sx={{
                    ...getButtonStyles(theme, 'secondary'),
                    mb: changePassword ? SIZES.spacing.md : 0
                  }}
                >
                  {changePassword ? 'Скасувати зміну пароля' : 'Змінити пароль'}
                </Button>
              </Box>
              
              {changePassword && (
                <>
                  <Box sx={{ gridColumn: '1 / -1' }}>
                    <TextField
                      fullWidth
                      label="Поточний пароль"
                      name="oldPassword"
                      type="password"
                      value={formData.oldPassword}
                      onChange={handleInputChange}
                      sx={textFieldStyles}
                    />
                  </Box>
                  
                  <Box>
                    <TextField
                      fullWidth
                      label="Новий пароль"
                      name="newPassword"
                      type="password"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      sx={textFieldStyles}
                    />
                  </Box>
                  
                  <Box>
                    <TextField
                      fullWidth
                      label="Підтвердіть пароль"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      sx={textFieldStyles}
                    />
                  </Box>
                </>
              )}
              
              <Box sx={{ gridColumn: '1 / -1' }}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: SIZES.spacing.md }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={loading || isChangingPassword ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                    onClick={handleSaveProfile}
                    disabled={loading || isChangingPassword}
                    sx={primaryButtonStyles}
                  >
                    Зберегти зміни
                  </Button>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Уведомление об успешном сохранении */}
      <Snackbar
        open={saveSuccess}
        message="Дані профілю успішно оновлено!"
        severity="success"
        onClose={handleCloseSnackbar}
      />
    </Box>
  );
};

export default ProfilePage;