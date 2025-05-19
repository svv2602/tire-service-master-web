import React, { useState } from 'react';
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

// Демо-данные для профиля пользователя
const mockUserData = {
  id: 1,
  firstName: 'Олександр',
  lastName: 'Петренко',
  email: 'o.petrenko@tireservice.ua',
  phone: '+380 67 123 45 67',
  position: 'Адміністратор',
  company: 'Твоя шина',
  role: 'admin',
  dateRegistered: '10.05.2022',
  lastLogin: '15.06.2023 14:30',
  avatar: null, // URL для аватара
};

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
  const [userData, setUserData] = useState(mockUserData);
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [changePassword, setChangePassword] = useState(false);
  
  // Инициализация данных формы
  const [formData, setFormData] = useState<UserFormData>({
    firstName: userData.firstName,
    lastName: userData.lastName,
    email: userData.email,
    phone: userData.phone,
    position: userData.position,
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Получение инициалов для аватара
  const getInitials = () => {
    return `${userData.firstName.charAt(0)}${userData.lastName.charAt(0)}`;
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
      // Обновляем локальные данные
      setUserData({
        ...userData,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        position: formData.position,
      });

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
  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Адміністратор';
      case 'manager':
        return 'Менеджер';
      case 'operator':
        return 'Оператор';
      default:
        return 'Користувач';
    }
  };

  // Получение цвета метки роли
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'manager':
        return 'primary';
      case 'operator':
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
              {userData.avatar ? (
                <Avatar 
                  src={userData.avatar} 
                  alt={`${userData.firstName} ${userData.lastName}`}
                  sx={{ width: 100, height: 100, mb: 2, bgcolor: 'primary.main', fontSize: '2rem' }}
                />
              ) : (
                <Avatar 
                  sx={{ width: 100, height: 100, mb: 2, bgcolor: 'primary.main', fontSize: '2rem' }}
                >
                  {getInitials()}
                </Avatar>
              )}
              
              <Typography variant="h6">
                {userData.firstName} {userData.lastName}
              </Typography>
              
              <Typography color="textSecondary" gutterBottom>
                {userData.position}
              </Typography>
              
              <Chip 
                icon={<RoleIcon />} 
                label={getRoleLabel(userData.role)}
                color={getRoleColor(userData.role) as 'default' | 'primary' | 'success' | 'error'} 
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
                    secondary={userData.email} 
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <PhoneIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Телефон" 
                    secondary={userData.phone} 
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <BusinessIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Компанія" 
                    secondary={userData.company} 
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <CalendarIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Дата реєстрації" 
                    secondary={userData.dateRegistered} 
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <CalendarIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Останній вхід" 
                    secondary={userData.lastLogin} 
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