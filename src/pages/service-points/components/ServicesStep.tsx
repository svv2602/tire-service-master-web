import React, { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  IconButton,
  InputAdornment,
  Alert,
  Chip,
  Tooltip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Stack,
  Badge,
  useTheme,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  ListItemIcon,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  MonetizationOn as PriceIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Category as CategoryIcon,
  ExpandMore as ExpandMoreIcon,
  Timer as TimerIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
} from '@mui/icons-material';
import { FormikProps } from 'formik';
import { useGetServicesQuery } from '../../../api/servicesList.api';
import type { ServicePointFormDataNew, ServicePointService, ServicePoint } from '../../../types/models';
import { 
  SIZES, 
  getCardStyles, 
  getButtonStyles, 
  getTextFieldStyles, 
  getChipStyles, 
  getFormStyles,
} from '../../../styles';
import { useTranslation } from 'react-i18next';

interface ServicesStepProps {
  formik: FormikProps<ServicePointFormDataNew>;
  isEditMode: boolean;
  servicePoint?: ServicePoint;
}

// Интерфейс для TabPanel
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`services-tabpanel-${index}`}
      aria-labelledby={`services-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `services-tab-${index}`,
    'aria-controls': `services-tabpanel-${index}`,
  };
}

const ServicesStep: React.FC<ServicesStepProps> = ({ formik, isEditMode, servicePoint }) => {
  const { t } = useTranslation();
  // Хук темы для использования централизованных стилей
  const theme = useTheme();
  
  // Получаем стили из централизованной системы
  const cardStyles = getCardStyles(theme);
  const cardStylesSecondary = getCardStyles(theme, 'secondary');
  const buttonStyles = getButtonStyles(theme);
  const textFieldStyles = getTextFieldStyles(theme);
  const chipStyles = getChipStyles(theme);
  const formStyles = getFormStyles(theme);

  // Состояние для вкладок и поиска
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Загружаем список всех доступных услуг с учетом текущего языка
  const { data: servicesResponse, isLoading: servicesLoading } = useGetServicesQuery({
    locale: localStorage.getItem('i18nextLng') || 'ru'
  });
  
  // Мемоизируем availableServices для оптимизации
  const availableServices = useMemo(() => {
    return servicesResponse?.data || [];
  }, [servicesResponse?.data]);

  // Получаем услуги из формы (исключая помеченные для удаления)
  const activeServices = useMemo(() => {
    return formik.values.services?.filter(service => !service._destroy) || [];
  }, [formik.values.services]);

  // Анализируем категории из постов сервисной точки
  const categoriesFromPosts = useMemo(() => {
    const categoryIds = new Set<number>();
    
    // Получаем категории из постов
    formik.values.service_posts?.forEach(post => {
      if (post.service_category_id && !post._destroy) {
        categoryIds.add(post.service_category_id);
      }
    });

    // Находим полную информацию о категориях из доступных услуг
    const categoriesMap = new Map();
    availableServices.forEach(service => {
      if (service.category && categoryIds.has(service.category.id)) {
        categoriesMap.set(service.category.id, service.category);
      }
    });

    return Array.from(categoriesMap.values()).sort((a, b) => (a.localized_name || a.name).localeCompare(b.localized_name || b.name));
  }, [formik.values.service_posts, availableServices]);

  // Группируем услуги по категориям
  const servicesByCategory = useMemo(() => {
    const grouped: Record<number, any[]> = {};
    
    categoriesFromPosts.forEach(category => {
      grouped[category.id] = availableServices.filter(service => 
        service.category?.id === category.id &&
        (!searchQuery || 
          (service.localized_name || service.name).toLowerCase().includes(searchQuery.toLowerCase()) ||
          (service.localized_description || service.description || '').toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    });
    
    return grouped;
  }, [categoriesFromPosts, availableServices, searchQuery]);

  // Получаем выбранные услуги по категориям
  const selectedServicesByCategory = useMemo(() => {
    const grouped: Record<number, ServicePointService[]> = {};
    
    categoriesFromPosts.forEach(category => {
      grouped[category.id] = activeServices.filter(service => {
        const serviceInfo = availableServices.find(s => s.id === service.service_id);
        return serviceInfo?.category?.id === category.id;
      });
    });
    
    return grouped;
  }, [categoriesFromPosts, activeServices, availableServices]);

  // Функция добавления услуги
  const addServiceById = (serviceId: number) => {
    const service = availableServices.find(s => s.id === serviceId);
    if (!service) return;

    // Проверяем, не добавлена ли уже эта услуга
    const existingServices = formik.values.services || [];
    const isAlreadyAdded = existingServices.some(s => 
      s.service_id === serviceId && !(s as any)._destroy
    );
    
    if (isAlreadyAdded) {
      console.warn(`Услуга с ID ${serviceId} уже добавлена`);
      return;
    }

    const newService: ServicePointService = {
      service_id: serviceId,
      price: service.price || 0,
      duration: service.duration || 30,
      is_available: true,
    };
    
    formik.setFieldValue('services', [
      ...existingServices, 
      newService
    ]);
  };

  // Функция удаления услуги
  const removeService = (index: number) => {
    const updatedServices = [...(formik.values.services || [])];
    const serviceToRemove = updatedServices[index];
    
    // Если услуга имеет реальный ID (существует в БД), помечаем для удаления
    if ((serviceToRemove as any).id && (serviceToRemove as any).id > 0) {
      updatedServices[index] = { ...serviceToRemove, _destroy: true };
    } else {
      // Для новых услуг без ID просто удаляем из массива
      updatedServices.splice(index, 1);
    }
    
    formik.setFieldValue('services', updatedServices);
  };

  // Функция обновления услуги
  const updateService = (index: number, field: keyof ServicePointService, value: any) => {
    const updatedServices = [...(formik.values.services || [])];
    updatedServices[index] = { ...updatedServices[index], [field]: value };
    
    formik.setFieldValue('services', updatedServices);
  };

  // Функция получения информации об услуге по ID
  const getServiceInfo = (serviceId: number) => {
    return availableServices.find(s => s.id === serviceId);
  };

  // Функция получения индекса услуги в общем массиве
  const getServiceGlobalIndex = (categoryId: number, localIndex: number) => {
    const servicesBeforeCategory = activeServices.slice(0, 
      activeServices.findIndex(service => {
        const serviceInfo = availableServices.find(s => s.id === service.service_id);
        return serviceInfo?.category?.id === categoryId;
      })
    );
    
    const servicesInCategory = selectedServicesByCategory[categoryId] || [];
    const targetService = servicesInCategory[localIndex];
    
    return formik.values.services?.findIndex(service => service === targetService) || 0;
  };

  // Обработка смены вкладки
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTabIndex(newValue);
  };

  // Если нет категорий из постов, показываем предупреждение
  if (categoriesFromPosts.length === 0) {
    return (
      <Box sx={formStyles.container}>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            {t('forms.servicePoint.services.noPostsWarningTitle')}
          </Typography>
          <Typography variant="body2">
            {t('forms.servicePoint.services.noPostsWarningDescription')}
            {t('forms.servicePoint.services.noPostsWarningDescriptionLink')}
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={formStyles.container}>
      {/* Заголовок секции */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CategoryIcon color="primary" />
          {t('forms.servicePoint.services.title')}
          <Chip 
            label={`${activeServices.length} ${t('forms.servicePoint.services.totalServices')}`}
            color="primary" 
            size="small"
          />
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('forms.servicePoint.services.description')}
        </Typography>
      </Box>

      {/* Поиск услуг */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder={t('forms.servicePoint.services.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={textFieldStyles}
        />
      </Box>

      {/* Вкладки по категориям */}
      <Paper sx={{ ...cardStyles, overflow: 'hidden' }}>
        <Tabs
          value={activeTabIndex}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              minHeight: 64,
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 500,
            },
          }}
        >
          {categoriesFromPosts.map((category, index) => {
            const selectedCount = selectedServicesByCategory[category.id]?.length || 0;
            const availableCount = servicesByCategory[category.id]?.length || 0;
            
            return (
              <Tab
                key={category.id}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CategoryIcon fontSize="small" />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'inherit' }}>
                        {category.localized_name || category.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {selectedCount} {t('forms.servicePoint.services.selectedFromAvailable', { count: availableCount })}
                      </Typography>
                    </Box>
                    {selectedCount > 0 && (
                      <Chip 
                        label={selectedCount} 
                        size="small" 
                        color="primary"
                        sx={{ ml: 1 }}
                      />
                    )}
                  </Box>
                }
                {...a11yProps(index)}
              />
            );
          })}
        </Tabs>

        {/* Содержимое вкладок */}
        {categoriesFromPosts.map((category, index) => (
          <CustomTabPanel key={category.id} value={activeTabIndex} index={index}>
            <Box sx={{ px: 3 }}>
              {/* Заголовок категории */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {category.localized_name || category.name}
                </Typography>
                {(category.localized_description || category.description) && (
                  <Typography variant="body2" color="text.secondary">
                    {category.localized_description || category.description}
                  </Typography>
                )}
              </Box>

              {/* Выбранные услуги */}
              {selectedServicesByCategory[category.id]?.length > 0 && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                    {t('forms.servicePoint.services.selectedServicesTitle', { count: selectedServicesByCategory[category.id].length })}
                  </Typography>
                  <Grid container spacing={2}>
                    {selectedServicesByCategory[category.id].map((service, localIndex) => {
                      const globalIndex = getServiceGlobalIndex(category.id, localIndex);
                      const serviceInfo = getServiceInfo(service.service_id);
                      
                      return (
                        <Grid item xs={12} md={6} key={`selected-${service.service_id}-${localIndex}`}>
                          <Card sx={{ ...cardStylesSecondary, border: '2px solid', borderColor: 'primary.main' }}>
                            <CardContent>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                <Typography variant="h6" sx={{ color: 'primary.main' }}>
                                  {serviceInfo?.localized_name || serviceInfo?.name || `${t('forms.servicePoint.services.service')} #${service.service_id}`}
                                </Typography>
                                <IconButton
                                  onClick={() => removeService(globalIndex)}
                                  size="small"
                                  color="error"
                                  sx={{ ml: 1 }}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Box>

                              <Stack spacing={2}>
                                {/* Цена */}
                                <TextField
                                  label={t('forms.servicePoint.services.priceLabel')}
                                  type="number"
                                  value={service.price || ''}
                                  onChange={(e) => updateService(globalIndex, 'price', Number(e.target.value))}
                                  InputProps={{
                                    startAdornment: (
                                      <InputAdornment position="start">
                                        <PriceIcon fontSize="small" />
                                      </InputAdornment>
                                    ),
                                  }}
                                  sx={textFieldStyles}
                                />

                                {/* Длительность */}
                                <TextField
                                  label={t('forms.servicePoint.services.durationLabel')}
                                  type="number"
                                  value={service.duration || ''}
                                  onChange={(e) => updateService(globalIndex, 'duration', Number(e.target.value))}
                                  InputProps={{
                                    startAdornment: (
                                      <InputAdornment position="start">
                                        <TimerIcon fontSize="small" />
                                      </InputAdornment>
                                    ),
                                  }}
                                  sx={textFieldStyles}
                                />

                                {/* Доступность */}
                                <FormControlLabel
                                  control={
                                    <Switch
                                      checked={service.is_available}
                                      onChange={(e) => updateService(globalIndex, 'is_available', e.target.checked)}
                                      color="primary"
                                    />
                                  }
                                  label={t('forms.servicePoint.services.availabilityLabel')}
                                />
                              </Stack>
                            </CardContent>
                          </Card>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Box>
              )}

              {/* Доступные услуги для добавления */}
              <Box>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                  {t('forms.servicePoint.services.availableServicesTitle')}
                </Typography>
                
                {servicesByCategory[category.id]?.length > 0 ? (
                  <Grid container spacing={2}>
                    {servicesByCategory[category.id]
                      .filter(service => !activeServices.some(s => s.service_id === service.id))
                      .map((service) => (
                        <Grid item xs={12} sm={6} md={4} key={service.id}>
                          <Card sx={{ ...cardStylesSecondary, cursor: 'pointer', '&:hover': { boxShadow: 4 } }}>
                            <CardContent>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                <Typography variant="h6" sx={{ flex: 1 }}>
                                  {service.localized_name || service.name}
                                </Typography>
                                <IconButton
                                  onClick={() => addServiceById(service.id)}
                                  size="small"
                                  color="primary"
                                  sx={{ ml: 1 }}
                                >
                                  <AddIcon />
                                </IconButton>
                              </Box>

                              {(service.localized_description || service.description) && (
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                  {service.localized_description || service.description}
                                </Typography>
                              )}

                              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                                {service.price && (
                                  <Chip
                                    icon={<PriceIcon />}
                                    label={`${service.price} ${t('forms.servicePoint.services.currency')}`}
                                    size="small"
                                    variant="outlined"
                                  />
                                )}
                                {service.duration && (
                                  <Chip
                                    icon={<TimerIcon />}
                                    label={`${service.duration} ${t('forms.servicePoint.services.minutes')}`}
                                    size="small"
                                    variant="outlined"
                                  />
                                )}
                              </Stack>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                  </Grid>
                ) : (
                  <Alert severity="info">
                    {searchQuery 
                      ? t('forms.servicePoint.services.noServicesFound', { category: category.localized_name || category.name, query: searchQuery })
                      : t('forms.servicePoint.services.noServicesAvailable', { category: category.localized_name || category.name })
                    }
                  </Alert>
                )}
              </Box>
            </Box>
          </CustomTabPanel>
        ))}
      </Paper>

      {/* Итоговая статистика */}
      <Box sx={{ mt: 3 }}>
        <Paper sx={{ ...cardStylesSecondary, p: 2 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
            {t('forms.servicePoint.services.totalStatsTitle')}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary.main">
                  {activeServices.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('forms.servicePoint.services.totalServicesLabel')}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main">
                  {activeServices.filter(s => s.is_available).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('forms.servicePoint.services.availableServicesLabel')}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="info.main">
                  {categoriesFromPosts.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('forms.servicePoint.services.categoriesLabel')}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Box>
  );
};

export default ServicesStep; 