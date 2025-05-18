import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Button,
  TextField,
  Grid,
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
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Lock as LockIcon,
  Badge as BadgeIcon,
  CalendarMonth as CalendarIcon,
  AdminPanelSettings as RoleIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';

// Демо-данные для профиля пользователя
const mockUserData = {
  id: 1,
  firstName: 'Александр',
  lastName: 'Иванов',
  email: 'a.ivanov@example.com',
  phone: '+7 (900) 123-45-67',
  position: 'Администратор',
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
        setError('Новый пароль и подтверждение не совпадают');
        setLoading(false);
        return;
      }
      if (formData.newPassword.length < 8) {
        setError('Новый пароль должен содержать минимум 8 символов');
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
        return 'Администратор';
      case 'manager':
        return 'Менеджер';
      case 'operator':
        return 'Оператор';
      default:
        return 'Пользователь';
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
        Профиль пользователя
      </Typography>

      <Grid container spacing={3}>
        {/* Карточка с информацией о профиле */}
        <Grid item xs={12} md={4}>
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
                    primary="Компания" 
                    secondary={userData.company} 
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <CalendarIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Дата регистрации" 
                    secondary={userData.dateRegistered} 
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <CalendarIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Последний вход" 
                    secondary={userData.lastLogin} 
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Форма редактирования профиля */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Редактирование профиля
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            {error && (
              <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Имя"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: (
                      <PersonIcon color="action" sx={{ mr: 1 }} />
                    )
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Фамилия"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: (
                      <BadgeIcon color="action" sx={{ mr: 1 }} />
                    )
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: (
                      <EmailIcon color="action" sx={{ mr: 1 }} />
                    )
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Телефон"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: (
                      <PhoneIcon color="action" sx={{ mr: 1 }} />
                    )
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Должность"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: (
                      <BusinessIcon color="action" sx={{ mr: 1 }} />
                    )
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Button 
                  startIcon={<LockIcon />} 
                  onClick={toggleChangePassword}
                  sx={{ mb: 2 }}
                >
                  {changePassword ? 'Отменить изменение пароля' : 'Изменить пароль'}
                </Button>
              </Grid>

              {changePassword && (
                <>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Текущий пароль"
                      name="oldPassword"
                      type="password"
                      value={formData.oldPassword}
                      onChange={handleInputChange}
                      required
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Новый пароль"
                      name="newPassword"
                      type="password"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      required
                      helperText="Минимум 8 символов"
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Подтвердите пароль"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                      error={formData.newPassword !== formData.confirmPassword}
                      helperText={formData.newPassword !== formData.confirmPassword ? 'Пароли не совпадают' : ''}
                    />
                  </Grid>
                </>
              )}

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                    onClick={handleSaveProfile}
                    disabled={loading}
                  >
                    Сохранить изменения
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Уведомление об успешном сохранении */}
      <Snackbar
        open={saveSuccess}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          Данные профиля успешно обновлены!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProfilePage; 