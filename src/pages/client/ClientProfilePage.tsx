import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box,
  Container,
  Typography,
  Avatar,
  Grid,
  Tab,
  Tabs,
  Alert,
  Chip,
  FormControlLabel,
  Switch,
  useTheme,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Card,
  Button,
  TextField,
} from '@mui/material';
import {
  Person as PersonIcon,
  DirectionsCar as CarIcon,
  BarChart as StatsIcon,
  Settings as SettingsIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';

// Типы
import { RootState } from '../../store';
import { useUpdateProfileMutation } from '../../api/auth.api';

// Импорты компонентов
import ClientLayout from '../../components/client/ClientLayout';
import { PhoneField } from '../../components/ui/PhoneField';
import Notification from '../../components/Notification';

// Валидация
import { useFormik } from 'formik';
import * as Yup from 'yup';

// Интерфейс для формы профиля
interface ProfileFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

// Компонент TabPanel
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

// Основной компонент
const ClientProfilePage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  // Состояния
  const [activeTab, setActiveTab] = useState(0);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  // Redux стейт
  const { user, isAuthenticated, isInitialized } = useSelector((state: RootState) => state.auth);

  // RTK Query мутации
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();

  // Схема валидации
  const validationSchema = Yup.object({
    first_name: Yup.string()
      .min(2, 'Имя должно содержать минимум 2 символа')
      .max(50, 'Имя не должно превышать 50 символов')
      .required('Имя обязательно для заполнения'),
    last_name: Yup.string()
      .min(2, 'Фамилия должна содержать минимум 2 символа')
      .max(50, 'Фамилия не должна превышать 50 символов')
      .required('Фамилия обязательна для заполнения'),
    email: Yup.string()
      .email('Неверный формат email')
      .required('Email обязателен для заполнения'),
    phone: Yup.string()
      .min(10, 'Номер телефона должен содержать минимум 10 цифр')
      .matches(/^[\d\s\+\-\(\)]+$/, 'Номер телефона может содержать только цифры, пробелы и символы +, -, (, )')
      .required('Номер телефона обязателен'),
  });

  // Formik для управления формой
  const formik = useFormik<ProfileFormData>({
    initialValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await updateProfile({
          first_name: values.first_name,
          last_name: values.last_name,
          email: values.email,
          phone: values.phone,
        }).unwrap();

        setNotification({
          open: true,
          message: 'Профиль успешно обновлен',
          severity: 'success',
        });

        // Редирект на главную страницу через 1.5 секунды
        setTimeout(() => {
          navigate('/client');
        }, 1500);

      } catch (error) {
        setNotification({
          open: true,
          message: 'Ошибка при обновлении профиля',
          severity: 'error',
        });
      }
    },
  });

  // Обработчики
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  // Получение инициалов для аватара
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  // Проверка авторизации после всех хуков
  if (!isInitialized) {
    return (
      <ClientLayout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Typography>Загрузка...</Typography>
        </Container>
      </ClientLayout>
    );
  }

  if (!isAuthenticated || !user) {
    navigate('/login');
    return null;
  }

  return (
    <ClientLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Заголовок страницы */}
        <Typography variant="h4" sx={{ mb: 4, color: 'text.primary' }}>
          Мой профиль
        </Typography>

        {/* Основная информация пользователя */}
        <Card sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: 'primary.main',
                  fontSize: '1.5rem',
                }}
              >
                {getInitials(user.first_name || '', user.last_name || '')}
              </Avatar>
            </Grid>
            <Grid item xs>
              <Typography variant="h5" sx={{ color: 'text.primary', mb: 1 }}>
                {user.first_name} {user.last_name}
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', mb: 1 }}>
                {user.email}
              </Typography>
              <Chip
                label={user.role === 'client' ? 'Клиент' : 'Администратор'}
                color="primary"
                size="small"
              />
            </Grid>
          </Grid>
        </Card>

        {/* Вкладки */}
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={activeTab} onChange={handleTabChange} aria-label="profile tabs">
              <Tab
                icon={<PersonIcon />}
                label="Личные данные"
                id="profile-tab-0"
                aria-controls="profile-tabpanel-0"
              />
              <Tab
                icon={<CarIcon />}
                label="Мои автомобили"
                id="profile-tab-1"
                aria-controls="profile-tabpanel-1"
              />
              <Tab
                icon={<StatsIcon />}
                label="Статистика"
                id="profile-tab-2"
                aria-controls="profile-tabpanel-2"
              />
              <Tab
                icon={<SettingsIcon />}
                label="Настройки"
                id="profile-tab-3"
                aria-controls="profile-tabpanel-3"
              />
            </Tabs>
          </Box>

          {/* Вкладка "Личные данные" */}
          <TabPanel value={activeTab} index={0}>
            <form onSubmit={formik.handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    id="first_name"
                    name="first_name"
                    label="Имя"
                    value={formik.values.first_name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.first_name && Boolean(formik.errors.first_name)}
                    helperText={formik.touched.first_name && formik.errors.first_name}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    id="last_name"
                    name="last_name"
                    label="Фамилия"
                    value={formik.values.last_name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.last_name && Boolean(formik.errors.last_name)}
                    helperText={formik.touched.last_name && formik.errors.last_name}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    id="email"
                    name="email"
                    label="Email"
                    type="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.email && Boolean(formik.errors.email)}
                    helperText={formik.touched.email && formik.errors.email}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <PhoneField
                    fullWidth
                    id="phone"
                    name="phone"
                    label="Номер телефона"
                    value={formik.values.phone}
                    onChange={(value) => formik.setFieldValue('phone', value)}
                    onBlur={formik.handleBlur}
                    error={formik.touched.phone && Boolean(formik.errors.phone)}
                    helperText={formik.touched.phone && formik.errors.phone}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={isUpdating}
                    >
                      {isUpdating ? 'Сохранение...' : 'Сохранить изменения'}
                    </Button>
                    <Button
                      type="button"
                      variant="outlined"
                      onClick={() => formik.resetForm()}
                    >
                      Отменить
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </TabPanel>

          {/* Вкладка "Мои автомобили" */}
          <TabPanel value={activeTab} index={1}>
            <Typography variant="h6" sx={{ mb: 2, color: 'text.primary' }}>
              Мои автомобили
            </Typography>
            <Alert severity="info">
              Функционал управления автомобилями будет добавлен в следующих версиях.
            </Alert>
          </TabPanel>

          {/* Вкладка "Статистика" */}
          <TabPanel value={activeTab} index={2}>
            <Typography variant="h6" sx={{ mb: 3, color: 'text.primary' }}>
              Статистика использования
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ color: 'primary.main', mb: 1 }}>
                    0
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Всего бронирований
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ color: 'success.main', mb: 1 }}>
                    0
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Выполненных услуг
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ color: 'info.main', mb: 1 }}>
                    0
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Активных бронирований
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Вкладка "Настройки" */}
          <TabPanel value={activeTab} index={3}>
            <Typography variant="h6" sx={{ mb: 3, color: 'text.primary' }}>
              Настройки уведомлений
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <EmailIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Email уведомления"
                  secondary="Получать уведомления о статусе бронирований на email"
                />
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label=""
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <NotificationsIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Push уведомления"
                  secondary="Получать push-уведомления в браузере"
                />
                <FormControlLabel
                  control={<Switch />}
                  label=""
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <SecurityIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Двухфакторная аутентификация"
                  secondary="Дополнительная защита аккаунта"
                />
                <FormControlLabel
                  control={<Switch />}
                  label=""
                />
              </ListItem>
            </List>
          </TabPanel>
        </Card>
      </Container>

      {/* Уведомления */}
      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={handleCloseNotification}
      />
    </ClientLayout>
  );
};

export default ClientProfilePage; 