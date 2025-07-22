import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  MenuItem,
  IconButton,
  Tooltip,
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
  Lock as LockIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  Favorite as FavoriteIcon,
} from '@mui/icons-material';

// Типы
import { RootState } from '../../store';
import { useUpdateProfileMutation, useChangePasswordMutation, useGetCurrentUserQuery } from '../../api/auth.api';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../store/slices/authSlice';
import { User } from '../../types/user';
import { UserRole } from '../../types';
import { 
  useGetMyClientCarsQuery, 
  useCreateMyClientCarMutation, 
  useUpdateMyClientCarMutation, 
  useDeleteMyClientCarMutation 
} from '../../api/clients.api';
import { useGetCarBrandsQuery } from '../../api/carBrands.api';
import { useGetCarModelsByBrandIdQuery } from '../../api/carModels.api';
import { useGetCarTypesQuery } from '../../api/carTypes.api';
import { ClientCar, ClientCarFormData } from '../../types/client';

// Импорты компонентов
import ClientLayout from '../../components/client/ClientLayout';
import { PhoneField } from '../../components/ui/PhoneField';
import Notification from '../../components/Notification';
import FavoritePointsTab from '../../components/profile/FavoritePointsTab';
import PushSubscriptionManager from '../../components/notifications/PushSubscriptionManager';

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

// Интерфейс для формы изменения пароля
interface PasswordFormData {
  current_password: string;
  new_password: string;
  confirm_password: string;
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
  const { t } = useTranslation();
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

  // Состояния для автомобилей
  const [carDialogOpen, setCarDialogOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<ClientCar | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [carToDelete, setCarToDelete] = useState<ClientCar | null>(null);

  // Состояния для безопасности
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  // Redux стейт
  const { user, isAuthenticated, isInitialized } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  // RTK Query мутации и запросы
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();
  
  // Загружаем актуальные данные пользователя с API (включая статистику клиента)
  const { data: currentUserData, isLoading: isLoadingUserData, error: userDataError } = useGetCurrentUserQuery();

  // API хуки для автомобилей
  const { data: cars = [], isLoading: carsLoading, refetch: refetchCars } = useGetMyClientCarsQuery();
  const [createCar, { isLoading: isCreating }] = useCreateMyClientCarMutation();
  const [updateCar, { isLoading: isUpdatingCar }] = useUpdateMyClientCarMutation();
  const [deleteCar, { isLoading: isDeleting }] = useDeleteMyClientCarMutation();

  // API для справочников
  const { data: brandsData } = useGetCarBrandsQuery({});
  const { data: carTypesData } = useGetCarTypesQuery({});

  // Схема валидации для профиля
  const validationSchema = Yup.object({
    first_name: Yup.string()
      .min(2, t('forms.profile.validation.firstNameMin'))
      .max(50, t('forms.profile.validation.firstNameMax'))
      .required(t('forms.profile.validation.firstNameRequired')),
    last_name: Yup.string()
      .min(2, t('forms.profile.validation.lastNameMin'))
      .max(50, t('forms.profile.validation.lastNameMax'))
      .required(t('forms.profile.validation.lastNameRequired')),
    email: Yup.string()
      .email(t('forms.profile.validation.emailInvalid'))
      .test('email-or-phone', t('forms.profile.validation.emailOrPhoneRequired'), function(value) {
        return value || this.parent.phone;
      }),
    phone: Yup.string()
      .min(10, t('forms.profile.validation.phoneMin'))
      .matches(/^[\d\s\+\-\(\)]+$/, t('forms.profile.validation.phonePattern'))
      .test('phone-or-email', t('forms.profile.validation.emailOrPhoneRequired'), function(value) {
        return value || this.parent.email;
      }),
  });

  // Схема валидации для автомобиля
  const carValidationSchema = Yup.object({
    brand_id: Yup.number()
      .required(t('forms.profile.validation.carBrandRequired')),
    model_id: Yup.number()
      .required(t('forms.profile.validation.carModelRequired')),
    year: Yup.number()
      .min(1900, t('forms.profile.validation.yearMin'))
      .max(new Date().getFullYear() + 1, t('forms.profile.validation.yearMax'))
      .required(t('forms.profile.validation.yearRequired')),
    license_plate: Yup.string()
      .required(t('forms.profile.validation.licensePlateRequired')),
    car_type_id: Yup.number()
      .nullable(),
    is_primary: Yup.boolean(),
  });

  // Схема валидации для изменения пароля
  const passwordValidationSchema = Yup.object({
    current_password: Yup.string()
      .required(t('forms.profile.validation.currentPasswordRequired')),
    new_password: Yup.string()
      .min(6, t('forms.profile.validation.passwordMin'))
      .required(t('forms.profile.validation.passwordRequired')),
    confirm_password: Yup.string()
      .oneOf([Yup.ref('new_password')], t('forms.profile.validation.passwordsMatch'))
      .required(t('forms.profile.validation.confirmPasswordRequired')),
  });

  // Formik для управления формой профиля
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
        const updatedUser = await updateProfile({
          first_name: values.first_name,
          last_name: values.last_name,
          email: values.email,
          phone: values.phone,
        }).unwrap();

        // Обновляем Redux store с новыми данными пользователя
        // Преобразуем CurrentUserResponse в User тип
        const userForRedux: User = {
          ...updatedUser,
          role: user?.role || UserRole.CLIENT, // Сохраняем текущую роль из Redux
          role_id: updatedUser.role_id || user?.role_id || 1, // Используем role_id из ответа или текущий
        };

        dispatch(setCredentials({
          user: userForRedux,
          accessToken: null, // Токен остается в куки
        }));

        setNotification({
          open: true,
          message: t('forms.profile.messages.profileUpdated'),
          severity: 'success',
        });

        // Редирект на главную страницу через 1.5 секунды
        setTimeout(() => {
          navigate('/client');
        }, 1500);

      } catch (error) {
        setNotification({
          open: true,
          message: t('forms.profile.messages.profileUpdateError'),
          severity: 'error',
        });
      }
    },
  });

  // Состояние для выбранного бренда (для загрузки моделей)
  const [selectedBrandId, setSelectedBrandId] = useState<number | null>(null);

  // API для моделей выбранного бренда
  const { data: modelsData } = useGetCarModelsByBrandIdQuery(
    { brandId: selectedBrandId?.toString() || '' },
    { skip: !selectedBrandId }
  );

  // Formik для управления формой автомобиля
  const carFormik = useFormik<ClientCarFormData>({
    initialValues: {
      brand_id: 0,
      model_id: 0,
      year: new Date().getFullYear(),
      license_plate: '',
      car_type_id: 0,
      is_primary: false,
    },
    validationSchema: carValidationSchema,
    onSubmit: async (values) => {
      try {
        if (editingCar) {
          await updateCar({
            carId: editingCar.id.toString(),
            data: values,
          }).unwrap();
          setNotification({
            open: true,
            message: t('forms.profile.messages.carUpdated'),
            severity: 'success',
          });
        } else {
          await createCar(values).unwrap();
          setNotification({
            open: true,
            message: t('forms.profile.messages.carAdded'),
            severity: 'success',
          });
        }
        
        setCarDialogOpen(false);
        setEditingCar(null);
        carFormik.resetForm();
        refetchCars();
      } catch (error) {
        setNotification({
          open: true,
          message: t('forms.profile.messages.carSaveError'),
          severity: 'error',
        });
      }
    },
  });

  // Formik для изменения пароля
  const passwordFormik = useFormik<PasswordFormData>({
    initialValues: {
      current_password: '',
      new_password: '',
      confirm_password: '',
    },
    validationSchema: passwordValidationSchema,
    onSubmit: async (values) => {
      try {
        if (!user?.id) {
          throw new Error(t('forms.profile.messages.userIdNotFound'));
        }
        
        await changePassword({
          id: user.id,
          password: values.new_password,
          password_confirmation: values.confirm_password,
        }).unwrap();

        setNotification({
          open: true,
          message: t('forms.profile.messages.passwordChanged'),
          severity: 'success',
        });

        setPasswordDialogOpen(false);
        passwordFormik.resetForm();
      } catch (error: any) {
        setNotification({
          open: true,
          message: error?.data || t('forms.profile.messages.passwordChangeError'),
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

  // Обработчики для автомобилей
  const handleOpenCarDialog = (car?: ClientCar) => {
    if (car) {
      setEditingCar(car);
      setSelectedBrandId(car.brand_id);
      carFormik.setValues({
        brand_id: car.brand_id,
        model_id: car.model_id,
        year: car.year,
        license_plate: car.license_plate,
        car_type_id: car.car_type_id || 0,
        is_primary: car.is_primary || false,
      });
    } else {
      setEditingCar(null);
      setSelectedBrandId(null);
      carFormik.resetForm();
    }
    setCarDialogOpen(true);
  };

  const handleCloseCarDialog = () => {
    setCarDialogOpen(false);
    setEditingCar(null);
    carFormik.resetForm();
    setSelectedBrandId(null);
  };

  const handleBrandChange = (brandId: number) => {
    setSelectedBrandId(brandId);
    carFormik.setFieldValue('brand_id', brandId);
          carFormik.setFieldValue('model_id', 0);
  };

  const handleDeleteCar = async () => {
    if (!carToDelete) return;

    try {
      await deleteCar(carToDelete.id.toString()).unwrap();
      setNotification({
        open: true,
        message: t('forms.profile.messages.carDeleted'),
        severity: 'success',
      });
      setDeleteDialogOpen(false);
      setCarToDelete(null);
      refetchCars();
    } catch (error) {
      setNotification({
        open: true,
        message: t('forms.profile.messages.carDeleteError'),
        severity: 'error',
      });
    }
  };

  const handleOpenDeleteDialog = (car: ClientCar) => {
    setCarToDelete(car);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setCarToDelete(null);
  };

  // Обработчики для изменения пароля
  const handleOpenPasswordDialog = () => {
    setPasswordDialogOpen(true);
    passwordFormik.resetForm();
  };

  const handleClosePasswordDialog = () => {
    setPasswordDialogOpen(false);
    passwordFormik.resetForm();
  };

  // Проверка авторизации после всех хуков
  if (!isInitialized) {
    return (
      <ClientLayout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Typography>{t('forms.profile.messages.loading')}</Typography>
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
          {t('forms.profile.title')}
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
                label={user.role === 'client' ? t('forms.profile.status.client') : t('forms.profile.status.administrator')}
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
              label={t('forms.profile.sections.personalData')}
              id="profile-tab-0"
              aria-controls="profile-tabpanel-0"
            />
            <Tab
              icon={<CarIcon />}
              label={t('forms.profile.sections.myCars')}
              id="profile-tab-1"
              aria-controls="profile-tabpanel-1"
            />
            <Tab
              icon={<FavoriteIcon />}
              label={t('forms.profile.sections.favoritePoints')}
              id="profile-tab-2"
              aria-controls="profile-tabpanel-2"
            />
            <Tab
              icon={<StatsIcon />}
              label={t('forms.profile.sections.statistics')}
              id="profile-tab-3"
              aria-controls="profile-tabpanel-3"
            />
            <Tab
              icon={<LockIcon />}
              label={t('forms.profile.sections.security')}
              id="profile-tab-4"
              aria-controls="profile-tabpanel-4"
            />
            <Tab
              icon={<SettingsIcon />}
              label={t('forms.profile.sections.settings')}
              id="profile-tab-5"
              aria-controls="profile-tabpanel-5"
            />
            </Tabs>
          </Box>

          {/* Вкладка t('client.profile.personalData') */}
          <TabPanel value={activeTab} index={0}>
            <form onSubmit={formik.handleSubmit}>
              <Alert severity="info" sx={{ mb: 3 }}>
                Для связи с вами необходимо указать хотя бы одно из контактных данных: email или номер телефона. 
                Рекомендуем заполнить оба поля для более удобного взаимодействия с сервисом.
              </Alert>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                                      <TextField
                      fullWidth
                      id="first_name"
                      name="first_name"
                      label={t('forms.profile.fields.firstName')}
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
                      label={t('forms.profile.fields.lastName')}
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
                    label={t('forms.profile.fields.email')}
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
                    label={t('forms.profile.fields.phone')}
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
                      {isUpdating ? t('forms.profile.buttons.saving') : t('forms.profile.buttons.saveChanges')}
                    </Button>
                    <Button
                      type="button"
                      variant="outlined"
                      onClick={() => formik.resetForm()}
                    >
                      {t('forms.profile.buttons.cancel')}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </TabPanel>

          {/* Вкладка t('client.profile.myCars') */}
          <TabPanel value={activeTab} index={1}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ color: 'text.primary' }}>
                {t('forms.profile.sections.myCars')}
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenCarDialog()}
              >
                {t('forms.profile.cars.addCar')}
              </Button>
            </Box>

            {carsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : cars.length === 0 ? (
              <Alert severity="info" sx={{ mb: 2 }}>
                {t('forms.profile.cars.noCars')}. {t('forms.profile.hints.addFirstCarHint')}
              </Alert>
            ) : (
              <Grid container spacing={2}>
                {cars.map((car) => (
                  <Grid item xs={12} md={6} key={car.id}>
                    <Card sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CarIcon color="primary" />
                          <Box>
                            <Typography variant="h6" sx={{ mb: 0.5 }}>
                              {car.brand?.name || t('forms.profile.cars.unknownBrand')} {car.model?.name || t('forms.profile.cars.unknownModel')}
                            </Typography>
                            {car.is_primary && (
                              <Chip
                                icon={<StarIcon />}
                                label={t('forms.profile.cars.primaryCar')}
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                            )}
                          </Box>
                        </Box>
                        <Box>
                          <Tooltip title={t('forms.profile.buttons.editCar')}>
                            <IconButton
                              size="small"
                              onClick={() => handleOpenCarDialog(car)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={t('forms.profile.buttons.deleteCar')}>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleOpenDeleteDialog(car)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          <strong>{t('forms.profile.cars.brand')}:</strong> {car.brand?.name || t('forms.profile.cars.notSpecified')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <strong>{t('forms.profile.cars.model')}:</strong> {car.model?.name || t('forms.profile.cars.notSpecified')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <strong>{t('forms.profile.cars.year')}:</strong> {car.year || t('forms.profile.cars.notSpecified')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <strong>{t('forms.profile.cars.licensePlate')}:</strong> {car.license_plate || t('forms.profile.cars.notSpecified')}
                        </Typography>
                        {car.car_type && (
                          <Typography variant="body2" color="text.secondary">
                            <strong>{t('forms.profile.cars.carType')}:</strong> {car.car_type.name}
                          </Typography>
                        )}
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </TabPanel>

          {/* Вкладка любимых точек */}
          <TabPanel value={activeTab} index={2}>
            <FavoritePointsTab 
              onNotify={(message: string, type: 'success' | 'error' | 'warning' | 'info') => 
                setNotification({ open: true, message, severity: type })
              }
            />
          </TabPanel>

          {/* Вкладка t('client.profile.statistics') */}
          <TabPanel value={activeTab} index={3}>
            <Typography variant="h6" sx={{ mb: 3, color: 'text.primary' }}>
              {t('forms.profile.statistics.statisticsUsage')}
            </Typography>
            {isLoadingUserData ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : userDataError ? (
              <Alert severity="error" sx={{ mb: 3 }}>
                Ошибка загрузки статистики
              </Alert>
            ) : (
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Card sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ color: 'primary.main', mb: 1 }}>
                      {currentUserData?.client?.total_bookings || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {t('forms.profile.statistics.totalBookings')}
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ color: 'success.main', mb: 1 }}>
                      {currentUserData?.client?.completed_bookings || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {t('forms.profile.statistics.completedServices')}
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card 
                    sx={{ 
                      p: 2, 
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 3
                      }
                    }}
                    onClick={() => navigate('/client/bookings')}
                  >
                    <Typography variant="h4" sx={{ color: 'info.main', mb: 1 }}>
                      {currentUserData?.client ? (currentUserData.client.total_bookings - currentUserData.client.completed_bookings) : 0}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {t('forms.profile.statistics.activeBookings')}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'info.main', mt: 1, display: 'block' }}>
                      {t('forms.profile.statistics.clickToView')}
                    </Typography>
                  </Card>
                </Grid>
              </Grid>
            )}
          </TabPanel>

          {/* Вкладка t('client.profile.security') */}
          <TabPanel value={activeTab} index={4}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3, color: 'text.primary' }}>
              <LockIcon />
              {t('forms.profile.security.securityAccount')}
            </Typography>
            
            <List>
              <ListItem>
                <ListItemIcon>
                  <LockIcon />
                </ListItemIcon>
                <ListItemText
                  primary={t('forms.profile.buttons.changePassword')}
                  secondary={t('forms.profile.security.changePasswordHint')}
                />
                <Button
                  variant="outlined"
                  onClick={handleOpenPasswordDialog}
                >
                  {t('forms.profile.buttons.editCar')}
                </Button>
              </ListItem>
              
              <Divider />
              
              <ListItem>
                <ListItemIcon>
                  <PersonIcon />
                </ListItemIcon>
                <ListItemText
                  primary={t('forms.profile.security.reviewLogin')}
                  secondary={t('forms.profile.security.reviewLoginHint')}
                />
                <Button
                  variant="outlined"
                  disabled
                >
                  {t('forms.profile.security.comingSoon')}
                </Button>
              </ListItem>
              
              <Divider />
              
              <ListItem>
                <ListItemIcon>
                  <SecurityIcon />
                </ListItemIcon>
                <ListItemText
                  primary={t('forms.profile.security.twoFactorAuth')}
                  secondary={t('forms.profile.security.twoFactorAuthHint')}
                />
                <FormControlLabel
                  control={<Switch disabled />}
                  label={t('forms.profile.security.comingSoon')}
                />
              </ListItem>
            </List>
          </TabPanel>

          {/* Вкладка t('client.profile.settings') */}
          <TabPanel value={activeTab} index={5}>
            <Typography variant="h6" sx={{ mb: 3, color: 'text.primary' }}>
              {t('forms.profile.settings.settingsNotifications')}
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <EmailIcon />
                </ListItemIcon>
                <ListItemText
                  primary={t('forms.profile.settings.emailNotifications')}
                  secondary={t('forms.profile.settings.emailNotificationsHint')}
                />
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label=""
                />
              </ListItem>
              <Divider />
              <ListItem sx={{ flexDirection: 'column', alignItems: 'stretch', p: 0 }}>
                <Box sx={{ p: 2 }}>
                  <PushSubscriptionManager 
                    onSubscriptionChange={(isSubscribed) => {
                      console.log('Клиент изменил статус Push подписки:', isSubscribed);
                    }}
                  />
                </Box>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <SecurityIcon />
                </ListItemIcon>
                <ListItemText
                  primary={t('forms.profile.security.twoFactorAuth')}
                  secondary={t('forms.profile.security.twoFactorAuthHint')}
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

      {/* Диалог создания/редактирования автомобиля */}
      <Dialog open={carDialogOpen} onClose={handleCloseCarDialog} maxWidth="md" fullWidth>
        <form onSubmit={carFormik.handleSubmit}>
          <DialogTitle>
            {editingCar ? t('forms.profile.cars.editCar') : t('forms.profile.cars.addCar')}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  label={t('forms.profile.cars.carBrand')}
                  name="brand_id"
                  value={carFormik.values.brand_id || ''}
                  onChange={(e) => handleBrandChange(Number(e.target.value))}
                  onBlur={carFormik.handleBlur}
                  error={carFormik.touched.brand_id && Boolean(carFormik.errors.brand_id)}
                  helperText={carFormik.touched.brand_id && carFormik.errors.brand_id}
                >
                  <MenuItem value="">{t('forms.profile.cars.selectBrand')}</MenuItem>
                  {brandsData?.data?.map((brand) => (
                    <MenuItem key={brand.id} value={brand.id}>
                      {brand.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  label={t('forms.profile.cars.carModel')}
                  name="model_id"
                  value={carFormik.values.model_id || ''}
                  onChange={carFormik.handleChange}
                  onBlur={carFormik.handleBlur}
                  error={carFormik.touched.model_id && Boolean(carFormik.errors.model_id)}
                  helperText={carFormik.touched.model_id && carFormik.errors.model_id}
                  disabled={!selectedBrandId}
                >
                  <MenuItem value="">{t('forms.profile.cars.selectModel')}</MenuItem>
                  {modelsData?.car_models?.map((model) => (
                    <MenuItem key={model.id} value={model.id}>
                      {model.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={t('forms.profile.cars.yearOfManufacture')}
                  name="year"
                  type="number"
                  value={carFormik.values.year}
                  onChange={carFormik.handleChange}
                  onBlur={carFormik.handleBlur}
                  error={carFormik.touched.year && Boolean(carFormik.errors.year)}
                  helperText={carFormik.touched.year && carFormik.errors.year}
                  inputProps={{ min: 1900, max: new Date().getFullYear() + 1 }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={t('forms.profile.cars.licensePlate')}
                  name="license_plate"
                  value={carFormik.values.license_plate}
                  onChange={carFormik.handleChange}
                  onBlur={carFormik.handleBlur}
                  error={carFormik.touched.license_plate && Boolean(carFormik.errors.license_plate)}
                  helperText={carFormik.touched.license_plate && carFormik.errors.license_plate}
                  placeholder={t('forms.profile.cars.licensePlatePlaceholder')}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  label={t('forms.profile.cars.carType')}
                  name="car_type_id"
                  value={carFormik.values.car_type_id || ''}
                  onChange={carFormik.handleChange}
                  onBlur={carFormik.handleBlur}
                >
                  <MenuItem value="">{t('forms.profile.cars.notSpecified')}</MenuItem>
                  {carTypesData?.map((type) => (
                    <MenuItem key={type.id} value={type.id}>
                      {type.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={carFormik.values.is_primary || false}
                      onChange={(e) => carFormik.setFieldValue('is_primary', e.target.checked)}
                      name="is_primary"
                      color="primary"
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <StarIcon color={carFormik.values.is_primary ? 'primary' : 'disabled'} />
                      <Typography variant="body2">
                        {t('forms.profile.cars.makePrimaryCar')}
                      </Typography>
                    </Box>
                  }
                />
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  {t('forms.profile.cars.primaryCarHint')}
                </Typography>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseCarDialog}>
              {t('forms.profile.buttons.cancel')}
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isCreating || isUpdatingCar}
            >
              {isCreating || isUpdatingCar ? t('forms.profile.buttons.saving') : t('forms.profile.buttons.save')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Диалог изменения пароля */}
      <Dialog open={passwordDialogOpen} onClose={handleClosePasswordDialog} maxWidth="sm" fullWidth>
        <form onSubmit={passwordFormik.handleSubmit}>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LockIcon />
              {t('forms.profile.buttons.changePassword')}
            </Box>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="password"
                  label={t('forms.profile.fields.currentPassword')}
                  name="current_password"
                  value={passwordFormik.values.current_password}
                  onChange={passwordFormik.handleChange}
                  onBlur={passwordFormik.handleBlur}
                  error={passwordFormik.touched.current_password && Boolean(passwordFormik.errors.current_password)}
                  helperText={passwordFormik.touched.current_password && passwordFormik.errors.current_password}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="password"
                  label={t('forms.profile.fields.newPassword')}
                  name="new_password"
                  value={passwordFormik.values.new_password}
                  onChange={passwordFormik.handleChange}
                  onBlur={passwordFormik.handleBlur}
                  error={passwordFormik.touched.new_password && Boolean(passwordFormik.errors.new_password)}
                  helperText={passwordFormik.touched.new_password && passwordFormik.errors.new_password}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="password"
                  label={t('forms.profile.fields.confirmPassword')}
                  name="confirm_password"
                  value={passwordFormik.values.confirm_password}
                  onChange={passwordFormik.handleChange}
                  onBlur={passwordFormik.handleBlur}
                  error={passwordFormik.touched.confirm_password && Boolean(passwordFormik.errors.confirm_password)}
                  helperText={passwordFormik.touched.confirm_password && passwordFormik.errors.confirm_password}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClosePasswordDialog}>
              {t('forms.profile.buttons.cancel')}
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isChangingPassword}
            >
              {isChangingPassword ? t('forms.profile.buttons.changing') : t('forms.profile.buttons.changePassword')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Диалог подтверждения удаления */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>{t('forms.profile.cars.deleteCarConfirm')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('forms.profile.cars.deleteCarMessage')}{' '}
            <strong>
              {carToDelete?.brand?.name} {carToDelete?.model?.name} ({carToDelete?.license_plate})
            </strong>
            ?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {t('forms.profile.cars.deleteCarWarning')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>
            {t('forms.profile.buttons.cancel')}
          </Button>
          <Button
            onClick={handleDeleteCar}
            color="error"
            variant="contained"
            disabled={isDeleting}
          >
            {isDeleting ? t('forms.profile.buttons.deleting') : t('forms.profile.buttons.delete')}
          </Button>
        </DialogActions>
      </Dialog>

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