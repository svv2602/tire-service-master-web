import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Button,
  TextField,
  Divider,
  Snackbar,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
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
  const [isEditing, setIsEditing] = useState(false);
  
  // Вывод данных пользователя в консоль для отладки
  useEffect(() => {
    console.log('=== Данные пользователя в ProfilePage ===');
    console.log('user:', user);
    console.log('JSON.stringify(user):', JSON.stringify(user, null, 2));
    console.log('Данные формы:', formData);
  }, [user]);

  // Инициализация данных формы
  const [formData, setFormData] = useState<UserFormData>({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    position: getRoleLabel(user?.role),
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Обновление данных формы при изменении пользователя
  useEffect(() => {
    if (user) {
      setFormData(prevData => ({
        ...prevData,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone || '',
      }));
    }
  }, [user]);

  useEffect(() => {
    if (isEditing && user) {
      setFormData(prevData => ({
        ...prevData,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone || '',
      }));
    }
  }, [isEditing, user]);

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
  const handleSaveProfile = () => {
    setLoading(true);
    setError(null);

    // Проверка паролей при изменении
    if (changePassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        setError('Новий пароль та підтвердження не співпадають');
        setLoading(false);
        return;
      }
      if (formData.newPassword.length < 8) {
        setError('Новий пароль повинен містити мінімум 8 символів');
        setLoading(false);
        return;
      }
    }

    // Имитация отправки данных на сервер
    setTimeout(() => {
      // Сбрасываем поля пароля
      if (changePassword) {
        setFormData({
          ...formData,
          oldPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setChangePassword(false);
      }

      setLoading(false);
      setSaveSuccess(true);
    }, 1000);
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

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Профіль користувача
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 3fr' }, gap: 3 }}>
        {/* Карточка с информацией о профиле */}
        <Box>
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 3 }}>
              {/* Аватар пользователя */}
              <Avatar 
                sx={{ width: 100, height: 100, mb: 2, bgcolor: 'primary.main', fontSize: '2rem' }}
              >
                {getInitials()}
              </Avatar>
              
              <Typography variant="h6">
                {user?.first_name} {user?.last_name}
              </Typography>
              
              <Typography color="textSecondary" gutterBottom>
                {formData.position}
              </Typography>
              
              <Chip 
                icon={<RoleIcon />} 
                label={getRoleLabel(user?.role)}
                color={getRoleColor(user?.role) as 'default' | 'primary' | 'success' | 'error'} 
                sx={{ mt: 1 }}
              />
              
              <Divider sx={{ width: '100%', my: 2 }} />
              
              <List sx={{ width: '100%' }}>
                <ListItem>
                  <ListItemIcon>
                    <EmailIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Email" 
                    secondary={user?.email} 
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <PhoneIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Телефон" 
                    secondary={user?.phone} 
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <BusinessIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Організація" 
                    secondary="Твоя шина" 
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <CalendarIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Статус користувача" 
                    secondary={user?.is_active ? 'Активний' : 'Неактивний'} 
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Box>

        {/* Форма редактирования профиля */}
        <Box>
          <Paper sx={{ p: 3 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            
            <Typography variant="h6" gutterBottom>
              Редагування профілю
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Box component="form" sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              <Box>
                <TextField
                  fullWidth
                  label="Ім'я"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                />
              </Box>
              
              <Box>
                <TextField
                  fullWidth
                  label="Прізвище"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                />
              </Box>
              
              <Box>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </Box>
              
              <Box>
                <TextField
                  fullWidth
                  label="Телефон"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </Box>
              
              <Box sx={{ gridColumn: '1 / -1' }}>
                <TextField
                  fullWidth
                  label="Посада"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                />
              </Box>
              
              <Box sx={{ gridColumn: '1 / -1' }}>
                <Divider sx={{ my: 1 }} />
                <Button 
                  startIcon={<LockIcon />} 
                  onClick={toggleChangePassword}
                  color="primary"
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
                    />
                  </Box>
                </>
              )}
              
              <Box sx={{ gridColumn: '1 / -1' }}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                    onClick={handleSaveProfile}
                    disabled={loading}
                  >
                    Зберегти зміни
                  </Button>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* Уведомление об успешном сохранении */}
      <Snackbar
        open={saveSuccess}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          Дані профілю успішно оновлено!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProfilePage; 