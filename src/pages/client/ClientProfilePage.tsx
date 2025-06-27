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
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
} from '@mui/icons-material';

// Типы
import { RootState } from '../../store';
import { useUpdateProfileMutation } from '../../api/auth.api';
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

  // Состояния для автомобилей
  const [carDialogOpen, setCarDialogOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<ClientCar | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [carToDelete, setCarToDelete] = useState<ClientCar | null>(null);

  // Redux стейт
  const { user, isAuthenticated, isInitialized } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  // RTK Query мутации
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();

  // API хуки для автомобилей
  const { data: cars = [], isLoading: carsLoading, refetch: refetchCars } = useGetMyClientCarsQuery();
  const [createCar, { isLoading: isCreating }] = useCreateMyClientCarMutation();
  const [updateCar, { isLoading: isUpdatingCar }] = useUpdateMyClientCarMutation();
  const [deleteCar, { isLoading: isDeleting }] = useDeleteMyClientCarMutation();

  // API для справочников
  const { data: brandsData } = useGetCarBrandsQuery({});
  const { data: carTypesData } = useGetCarTypesQuery();

  // Схема валидации для профиля
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

  // Схема валидации для автомобиля
  const carValidationSchema = Yup.object({
    brand_id: Yup.number()
      .required('Марка автомобиля обязательна'),
    model_id: Yup.number()
      .required('Модель автомобиля обязательна'),
    year: Yup.number()
      .min(1900, 'Год не может быть меньше 1900')
      .max(new Date().getFullYear() + 1, 'Год не может быть больше следующего года')
      .required('Год выпуска обязателен'),
    license_plate: Yup.string()
      .required('Номер автомобиля обязателен'),
    car_type_id: Yup.number()
      .nullable(),
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
            message: 'Автомобиль успешно обновлен',
            severity: 'success',
          });
        } else {
          await createCar(values).unwrap();
          setNotification({
            open: true,
            message: 'Автомобиль успешно добавлен',
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
          message: 'Ошибка при сохранении автомобиля',
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
    carFormik.setFieldValue('model_id', 0); // Сбрасываем модель при смене бренда
  };

  const handleDeleteCar = async () => {
    if (!carToDelete) return;

    try {
      await deleteCar(carToDelete.id.toString()).unwrap();
      setNotification({
        open: true,
        message: 'Автомобиль успешно удален',
        severity: 'success',
      });
      setDeleteDialogOpen(false);
      setCarToDelete(null);
      refetchCars();
    } catch (error) {
      setNotification({
        open: true,
        message: 'Ошибка при удалении автомобиля',
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ color: 'text.primary' }}>
                Мои автомобили
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenCarDialog()}
              >
                Добавить автомобиль
              </Button>
            </Box>

            {carsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : cars.length === 0 ? (
              <Alert severity="info" sx={{ mb: 2 }}>
                У вас пока нет добавленных автомобилей. Добавьте первый автомобиль для удобного бронирования услуг.
              </Alert>
            ) : (
              <Grid container spacing={2}>
                {cars.map((car) => (
                  <Grid item xs={12} md={6} key={car.id}>
                    <Card sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CarIcon color="primary" />
                          <Typography variant="h6">
                            {car.brand?.name} {car.model?.name}
                          </Typography>
                          {car.is_primary && (
                            <Chip
                              icon={<StarIcon />}
                              label="Основной"
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          )}
                        </Box>
                        <Box>
                          <Tooltip title="Редактировать">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenCarDialog(car)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Удалить">
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
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Год: {car.year}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Номер: {car.license_plate}
                      </Typography>
                      {car.car_type_id && (
                        <Typography variant="body2" color="text.secondary">
                          Тип: {car.car_type_id}
                        </Typography>
                      )}
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
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

      {/* Диалог создания/редактирования автомобиля */}
      <Dialog open={carDialogOpen} onClose={handleCloseCarDialog} maxWidth="md" fullWidth>
        <form onSubmit={carFormik.handleSubmit}>
          <DialogTitle>
            {editingCar ? 'Редактировать автомобиль' : 'Добавить автомобиль'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  label="Марка автомобиля"
                  name="brand_id"
                  value={carFormik.values.brand_id || ''}
                  onChange={(e) => handleBrandChange(Number(e.target.value))}
                  onBlur={carFormik.handleBlur}
                  error={carFormik.touched.brand_id && Boolean(carFormik.errors.brand_id)}
                  helperText={carFormik.touched.brand_id && carFormik.errors.brand_id}
                >
                  <MenuItem value="">Выберите марку</MenuItem>
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
                  label="Модель автомобиля"
                  name="model_id"
                  value={carFormik.values.model_id || ''}
                  onChange={carFormik.handleChange}
                  onBlur={carFormik.handleBlur}
                  error={carFormik.touched.model_id && Boolean(carFormik.errors.model_id)}
                  helperText={carFormik.touched.model_id && carFormik.errors.model_id}
                  disabled={!selectedBrandId}
                >
                  <MenuItem value="">Выберите модель</MenuItem>
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
                  label="Год выпуска"
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
                  label="Номер автомобиля"
                  name="license_plate"
                  value={carFormik.values.license_plate}
                  onChange={carFormik.handleChange}
                  onBlur={carFormik.handleBlur}
                  error={carFormik.touched.license_plate && Boolean(carFormik.errors.license_plate)}
                  helperText={carFormik.touched.license_plate && carFormik.errors.license_plate}
                  placeholder="А123БВ777"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  label="Тип автомобиля (необязательно)"
                  name="car_type_id"
                  value={carFormik.values.car_type_id || ''}
                  onChange={carFormik.handleChange}
                  onBlur={carFormik.handleBlur}
                >
                  <MenuItem value="">Не указан</MenuItem>
                  {carTypesData?.map((type) => (
                    <MenuItem key={type.id} value={type.id}>
                      {type.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseCarDialog}>
              Отмена
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isCreating || isUpdatingCar}
            >
              {isCreating || isUpdatingCar ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Диалог подтверждения удаления */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Удалить автомобиль?</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить автомобиль{' '}
            <strong>
              {carToDelete?.brand?.name} {carToDelete?.model?.name} ({carToDelete?.license_plate})
            </strong>
            ?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Это действие нельзя отменить.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>
            Отмена
          </Button>
          <Button
            onClick={handleDeleteCar}
            color="error"
            variant="contained"
            disabled={isDeleting}
          >
            {isDeleting ? 'Удаление...' : 'Удалить'}
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