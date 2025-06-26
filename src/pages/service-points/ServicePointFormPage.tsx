import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  FormControlLabel,
  InputAdornment,
  FormHelperText,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
  Alert,
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { 
  ArrowBack as ArrowBackIcon, 
  Save as SaveIcon, 
  Delete as DeleteIcon, 
  AddPhotoAlternate as AddPhotoIcon, 
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Settings as SettingsIcon,
  Build as BuildIcon,
  MonetizationOn as PriceIcon,
  Photo as PhotoIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetServicesQuery } from '../../api/servicesList.api';
import {
  useGetServicePointBasicInfoQuery,
  useGetServicePointByIdQuery,
  useCreateServicePointMutation,
  useUpdateServicePointMutation,
  useGetWorkStatusesQuery,
  useGetServicePostsQuery,
  useGetServicePointServicesQuery,
  useGetServicePointPhotosQuery,
  type WorkStatus,
} from '../../api/servicePoints.api';
import { useUploadServicePointPhotoMutation } from '../../api/service-point-photos.api';
import { useGetPartnersQuery } from '../../api/partners.api';
import { useGetRegionsQuery } from '../../api/regions.api';
import { useGetCitiesQuery } from '../../api/cities.api';
import type { 
  ServicePoint, 
  ServicePointPhoto,
  Partner,
  Region,
  City,
  ServicePointFormData,
  Photo,
  ServicePost,
} from '../../types/models';
import type { Service } from '../../types/service';
import { DAYS_OF_WEEK } from '../../types/working-hours';
import type { DayOfWeek, WorkingHoursSchedule, WorkingHours } from '../../types/working-hours';

// Импорты централизованной системы стилей для консистентного дизайна
import { 
  getCardStyles, 
  getButtonStyles, 
  getTextFieldStyles
} from '../../styles/components';
import { SIZES } from '../../styles/theme';

// Импорты UI компонентов
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/TextField';
import { Snackbar } from '../../components/ui/Snackbar';
// import { Select } from '../../components/ui/Select'; // Заменено на стандартный MUI Select
import { Switch } from '../../components/ui/Switch';
import { Card } from '../../components/ui/Card';

// Определяем типы для FormikTouched и FormikErrors
interface ServiceFormData {
  id?: number; // ID записи ServicePointService для обновления существующих
  service_id: number;
  price: number;
  duration: number;
  is_available: boolean;
  _destroy?: boolean; // Поле для помечения услуги для удаления
}

interface ServiceFormErrors {
  service_id?: string;
  price?: string;
  duration?: string;
  is_available?: string;
}

interface FormValues extends Omit<ServicePointFormData, 'services' | 'working_hours' | 'status_id' | 'post_count' | 'default_slot_duration'> {
  is_active: boolean;
  work_status: string;
  working_hours: WorkingHoursSchedule;
  services: ServiceFormData[];
  service_posts: ServicePost[];
}

// Добавляем интерфейс для загрузки файлов
interface PhotoUpload {
  file: File;
  description?: string;
  is_main: boolean;
  sort_order?: number;
  preview?: string;
}

// Определяем начальное расписание в правильном формате
const defaultWorkingHours: WorkingHoursSchedule = DAYS_OF_WEEK.reduce<WorkingHoursSchedule>((acc, day) => {
  const workingHours: WorkingHours = {
    start: '09:00',
    end: '18:00',
    is_working_day: day.id < 6
  };
  acc[day.key] = workingHours;
  return acc;
}, {} as WorkingHoursSchedule);

// Создаем схему валидации для рабочих часов
const workingHoursShape = DAYS_OF_WEEK.reduce<Record<keyof WorkingHoursSchedule, yup.ObjectSchema<any>>>((acc, day) => {
  acc[day.key] = yup.object().shape({
    start: yup.string().required('Время начала работы обязательно'),
    end: yup.string().required('Время окончания работы обязательно'),
    is_working_day: yup.boolean().required('Укажите, является ли день рабочим')
  }) as yup.ObjectSchema<WorkingHours>;
  return acc;
}, {} as Record<keyof WorkingHoursSchedule, yup.ObjectSchema<any>>);

/**
 * Компонент формы создания и редактирования точек обслуживания
 * Поддерживает создание новых точек и редактирование существующих
 * Включает разделы: основная информация, местоположение, контакты, настройки, 
 * посты обслуживания, услуги, фотографии и расписание работы
 */
const ServicePointFormPage: React.FC = () => {
  const { partnerId, id } = useParams<{ partnerId: string; id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const theme = useTheme();

  // Состояние для уведомлений и UI
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  
  // Состояние для отображения ошибок валидации
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  
  // Добавляем состояние для предпросмотра фотографий
  const [photoUploads, setPhotoUploads] = useState<PhotoUpload[]>([]);

  // Получаем стили из централизованной системы для консистентного дизайна
  const cardStyles = getCardStyles(theme, 'primary');
  const buttonStyles = getButtonStyles(theme, 'primary');
  const secondaryButtonStyles = getButtonStyles(theme, 'secondary');
  const textFieldStyles = getTextFieldStyles(theme, 'filled');

  // Состояние для управления аккордеонами
  const [expandedAccordions, setExpandedAccordions] = useState<Record<string, boolean>>({
    location: false,
    contact: false,
    settings: false,
    posts: true, // Посты обслуживания развернуты по умолчанию как важный раздел
    services: false,
    photos: false,
    schedule: false,
  });

  // RTK Query хуки
  const { data: partners, isLoading: partnersLoading } = useGetPartnersQuery({});
  const { data: regions, isLoading: regionsLoading } = useGetRegionsQuery({});
  
  // Сначала получаем информацию о сервисной точке чтобы узнать region_id
  const { data: basicInfo } = useGetServicePointBasicInfoQuery(id ?? '', {
    skip: !id
  });
  const { data: servicePoint, isLoading: servicePointLoading } = useGetServicePointByIdQuery(
    { 
      partner_id: basicInfo?.partner_id || Number(partnerId) || 0,
      id: id ?? ''
    },
    { 
      skip: !id || (!basicInfo?.partner_id && !partnerId),
      refetchOnMountOrArgChange: true
    }
  );

  // Определяем region_id для загрузки городов: из selectedRegionId, servicePoint или 0
  const regionIdForCities = selectedRegionId || servicePoint?.city?.region_id || 0;
  
  const { data: cities, isLoading: citiesLoading } = useGetCitiesQuery(
    { region_id: regionIdForCities },
    { 
      skip: !regionIdForCities, // Загружаем города если есть region_id
      refetchOnMountOrArgChange: true
    }
  );
  const { data: workStatusesData, isLoading: workStatusesLoading } = useGetWorkStatusesQuery();
  const { data: servicePostsData, isLoading: servicePostsLoading } = useGetServicePostsQuery(
    id ?? '',
    { skip: !isEditMode || !id }
  );
  const workStatuses: WorkStatus[] = workStatusesData || [];
  // Мемоизируем servicePosts для оптимизации производительности
  const servicePosts: ServicePost[] = useMemo(() => servicePostsData || [], [servicePostsData]);
  const [createServicePoint, { isLoading: isCreating }] = useCreateServicePointMutation();
  const [updateServicePoint, { isLoading: isUpdating }] = useUpdateServicePointMutation();
  const [uploadServicePointPhoto] = useUploadServicePointPhotoMutation();


  const { data: services } = useGetServicesQuery({});
  const servicePointServicesQueryResult = useGetServicePointServicesQuery(
    id ?? '',
    { skip: !isEditMode || !id }
  );
  const { data: photosData } = useGetServicePointPhotosQuery(
    id ?? '',
    { skip: !isEditMode || !id }
  ) as { data: ServicePointPhoto[] | undefined };

  // Извлекаем данные из результатов запросов
  const partnersData = partners?.data || [];
  const regionsData = regions?.data || [];
  const citiesData = cities?.data || [];

  const servicePointServicesData = servicePointServicesQueryResult.data;

  // Преобразуем данные сервисов в нужный формат
  const servicesData = React.useMemo(() => {
    if (!services) return [];
    return services.data || [];
  }, [services]);

  const loading = partnersLoading || regionsLoading || citiesLoading || servicePointLoading || 
                 isCreating || isUpdating || workStatusesLoading || servicePostsLoading;
  const error = null; // Ошибки теперь обрабатываются в каждом хуке отдельно

  const initialValues: FormValues = useMemo(() => ({
    name: servicePoint?.name || '',
    partner_id: servicePoint?.partner_id || (partnerId ? Number(partnerId) : 0),
    city_id: servicePoint?.city?.id || 0,
    region_id: selectedRegionId || servicePoint?.city?.region_id || 0,
    address: servicePoint?.address || '',
    contact_phone: servicePoint?.contact_phone || '',
    description: servicePoint?.description || '',
    latitude: servicePoint?.latitude || null,
    longitude: servicePoint?.longitude || null,
    working_hours: servicePoint?.working_hours || defaultWorkingHours,
    services: (servicePointServicesData || []).map(service => ({
      id: service.id,
      service_id: service.service_id,
      price: service.price || service.current_price || 0,
      duration: service.duration || 60,
      is_available: service.is_available !== undefined ? service.is_available : true
    })),
    photos: (photosData || []).map(photo => ({
      id: typeof photo.id === 'string' ? Number(photo.id) : photo.id,
      url: photo.url,
      description: photo.description || '',
      is_main: photo.is_main,
      sort_order: photo.sort_order,
      created_at: photo.created_at,
      updated_at: photo.updated_at,
      service_point_id: typeof photo.service_point_id === 'string' ? 
        Number(photo.service_point_id) : 
        photo.service_point_id
    } as Photo)),
    is_active: servicePoint?.is_active ?? true,
    work_status: servicePoint?.work_status || 'working',
    service_posts: servicePosts || [],
  }), [servicePoint, selectedRegionId, partnerId, servicePointServicesData, photosData, servicePosts]);

  useEffect(() => {
    if (servicePoint) {
      console.log('Loaded service point:', servicePoint);
      console.log('Services:', servicePointServicesData);
      console.log('Photos:', photosData);
      console.log('Initial values:', initialValues);
    }
  }, [servicePoint, servicePointServicesData, photosData, initialValues]);

  const handleSubmit = async (values: FormValues, { setTouched }: any) => {
    try {
      setErrorMessage(null);
      setSuccessMessage(null);
      setShowValidationErrors(false);
      
      // Проверяем валидность формы
      if (!formik.isValid) {
        // Помечаем все поля как затронутые для показа ошибок
        const touchedFields = Object.keys(formik.values).reduce((acc, field) => {
          acc[field] = true;
          return acc;
        }, {} as Record<string, any>);
        setTouched(touchedFields);
        setShowValidationErrors(true);
        return;
      }
      
      // Всегда используем JSON для основных данных, фотографии загружаем отдельно
      const servicePointData = {
        name: values.name,
        description: values.description,
        address: values.address,
        city_id: values.city_id,
        partner_id: values.partner_id,
        is_active: values.is_active,
        work_status: values.work_status,
        contact_phone: values.contact_phone,
        latitude: values.latitude,
        longitude: values.longitude,
        working_hours: values.working_hours,
        services_attributes: values.services.map(service => ({
          id: service.id,
          service_id: service.service_id,
          price: service.price,
          duration: service.duration,
          is_available: service.is_available,
          _destroy: service._destroy || false
        })),
        service_posts_attributes: values.service_posts.map(post => ({
          id: post.id && post.id < 1000000000000 ? post.id : undefined,
          name: post.name,
          description: post.description,
          slot_duration: post.slot_duration,
          is_active: post.is_active,
          post_number: post.post_number,
          _destroy: post._destroy || false
        }))
      };

      console.log('Отправляемые данные:', JSON.stringify({ servicePoint: servicePointData }, null, 2));

      let servicePointResult: ServicePoint;
      
      if (isEditMode && id) {
        servicePointResult = await updateServicePoint({
          id,
          servicePoint: servicePointData
        }).unwrap();
        setSuccessMessage('Точка обслуживания успешно обновлена');
      } else {
        servicePointResult = await createServicePoint({
          partnerId: partnerId || values.partner_id.toString(),
          servicePoint: servicePointData
        }).unwrap();
        setSuccessMessage('Точка обслуживания успешно создана');
      }

      // Загружаем фотографии после успешного сохранения основных данных
      if (photoUploads.length > 0) {
        console.log('Начинаем загрузку фотографий...');
        try {
          for (let i = 0; i < photoUploads.length; i++) {
            const photo = photoUploads[i];
            console.log(`Загружаем фото ${i + 1}/${photoUploads.length}:`, photo.file.name);
            
            await uploadServicePointPhoto({
              servicePointId: servicePointResult.id.toString(),
              file: photo.file,
              description: photo.description
            }).unwrap();
          }
          console.log('Все фотографии успешно загружены');
          setPhotoUploads([]); // Очищаем загруженные фотографии
        } catch (photoError) {
          console.error('Ошибка при загрузке фотографий:', photoError);
          setErrorMessage('Данные сохранены, но произошла ошибка при загрузке фотографий');
        }
      }

      setTimeout(() => {
        navigate(partnerId ? `/partners/${partnerId}/service-points` : '/service-points');
      }, 1000);
    } catch (error: any) {
      console.error('Error submitting form:', error);
      const errorMessage = error?.data?.message || error?.message || 'Ошибка при сохранении точки обслуживания';
      setErrorMessage(errorMessage);
    }
  };

  const validationSchema = useMemo(() => yup.object({
    name: yup.string().required('Название точки обязательно'),
    partner_id: yup.number()
      .required('Партнер обязателен')
      .min(1, 'Выберите партнера'),
    description: yup.string(),
    address: yup.string().required('Адрес обязателен'),
    contact_phone: yup.string().required('Контактный телефон обязателен'),
    city_id: yup.number()
      .required('Город обязателен')
      .min(1, 'Пожалуйста, выберите город'),
    region_id: yup.number()
      .required('Регион обязателен')
      .min(1, 'Пожалуйста, выберите регион'),
    is_active: yup.boolean().required('Статус активности обязателен'),
    work_status: yup.string()
      .required('Статус работы обязателен')
      .oneOf(['working', 'temporarily_closed', 'maintenance', 'suspended'], 'Выберите корректный статус работы'),
    latitude: yup.number().nullable()
      .test('coordinates', 'Если указана широта, должна быть указана и долгота', function(value) {
        const { longitude } = this.parent;
        if (value === null || value === undefined) return longitude === null || longitude === undefined;
        return longitude !== null && longitude !== undefined;
      })
      .test('latitude-range', 'Широта должна быть между -90 и 90', function(value) {
        if (value === null || value === undefined) return true;
        return value >= -90 && value <= 90;
      }),
    longitude: yup.number().nullable()
      .test('coordinates', 'Если указана долгота, должна быть указана и широта', function(value) {
        const { latitude } = this.parent;
        if (value === null || value === undefined) return latitude === null || latitude === undefined;
        return latitude !== null && latitude !== undefined;
      })
      .test('longitude-range', 'Долгота должна быть между -180 и 180', function(value) {
        if (value === null || value === undefined) return true;
        return value >= -180 && value <= 180;
      }),
    working_hours: yup.object().shape(workingHoursShape),
    services: yup.array().of(
      yup.object().shape({
        service_id: yup.number()
          .required('Услуга обязательна')
          .min(1, 'Выберите услугу'),
        price: yup.number()
          .min(0, 'Цена не может быть отрицательной')
          .required('Цена обязательна'),
        duration: yup.number()
          .min(5, 'Длительность должна быть не менее 5 минут')
          .required('Длительность обязательна'),
        is_available: yup.boolean()
          .required('Укажите доступность услуги'),
      })
    ).test('unique-service-ids', 'Каждая услуга может быть добавлена только один раз', function(services) {
      if (!services) return true;
      const serviceIds = services.map(service => service.service_id).filter(id => id > 0);
      return serviceIds.length === new Set(serviceIds).size;
    }),
    photos: yup.array()
      .max(10, 'Максимальное количество фотографий - 10')
      .of(
        yup.object().shape({
          file: yup.mixed(),
          description: yup.string(),
          is_main: yup.boolean(),
          sort_order: yup.number().nullable(),
        })
      ),
    service_posts: yup.array()
      .test('min-active-posts', 'Необходимо добавить хотя бы один пост обслуживания', function(value) {
        if (!value) return false;
        const activePosts = value.filter((post: any) => !post._destroy);
        return activePosts.length >= 1;
      })
      .of(
        yup.object().shape({
          name: yup.string().required('Название поста обязательно'),
          description: yup.string(),
          slot_duration: yup.number()
            .min(5, 'Длительность слота должна быть не менее 5 минут')
            .max(480, 'Длительность слота должна быть не более 480 минут')
            .required('Длительность слота обязательна'),
          is_active: yup.boolean().required('Укажите активность поста'),
        })
      ),
  }), []);

  // Функция для получения списка незаполненных обязательных полей
  const getRequiredFieldErrors = () => {
    const requiredFields = {
      name: 'Название точки',
      partner_id: 'Партнер',
      address: 'Адрес',
      region_id: 'Регион',
      city_id: 'Город',
      contact_phone: 'Контактный телефон',
      work_status: 'Статус работы'
    };

    const errors: string[] = [];
    Object.entries(requiredFields).forEach(([field, label]) => {
      const value = formik.values[field as keyof FormValues];
      if (!value || (typeof value === 'number' && value === 0) || 
          (typeof value === 'string' && value.trim() === '')) {
        errors.push(label);
      }
    });
    return errors;
  };

  // Функция для обработки клика по заблокированной кнопке
  const handleDisabledButtonClick = () => {
    if (!formik.isValid) {
      // Помечаем все поля как затронутые для показа ошибок
      const touchedFields = Object.keys(formik.values).reduce((acc, field) => {
        acc[field] = true;
        return acc;
      }, {} as Record<string, any>);
      formik.setTouched(touchedFields);
      setShowValidationErrors(true);
    }
  };

  const formik = useFormik<FormValues>({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: handleSubmit,
  });

  // Эффект для установки региона при загрузке точки обслуживания
  useEffect(() => {
    if (servicePoint?.city?.region_id && !selectedRegionId) {
      setSelectedRegionId(servicePoint.city.region_id);
      formik.setFieldValue('region_id', servicePoint.city.region_id);
    }
  }, [servicePoint, formik, selectedRegionId]);

  const handleCloseSnackbar = useCallback(() => {
    setSuccessMessage(null);
  }, []);

  const handleBack = useCallback(() => {
    navigate(partnerId ? `/partners/${partnerId}/service-points` : '/service-points');
  }, [navigate, partnerId]);

  // Обработчик загрузки фотографий
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newPhotos = Array.from(files).map((file): PhotoUpload => ({
      file,
      is_main: false,
      preview: URL.createObjectURL(file)
    }));

    if (photoUploads.length + newPhotos.length > 10) {
      // Показываем ошибку
      setSnackbarMessage('Максимальное количество фотографий - 10');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    setPhotoUploads([...photoUploads, ...newPhotos]);
  };

  // Обработчик удаления фотографии
  const handlePhotoDelete = (index: number) => {
    const newPhotos = [...photoUploads];
    if (newPhotos[index].preview) {
      URL.revokeObjectURL(newPhotos[index].preview!);
    }
    newPhotos.splice(index, 1);
    setPhotoUploads(newPhotos);
  };

  // Обработчик установки главной фотографии
  const handleSetMainPhoto = (index: number) => {
    const newPhotos = photoUploads.map((photo, i) => ({
      ...photo,
      is_main: i === index
    }));
    setPhotoUploads(newPhotos);
  };

  // Функции для управления постами
  const addNewPost = useCallback(() => {
    const activePosts = (formik.values.service_posts || []).filter(post => !post._destroy);
    const newPost: ServicePost = {
      id: Date.now(), // Временный ID для новых постов
      service_point_id: Number(id) || 0,
      post_number: activePosts.length + 1,
      name: `Пост ${activePosts.length + 1}`,
      description: '',
      slot_duration: 30,
      is_active: true,
      service_category_id: 1, // Устанавливаем категорию по умолчанию (можно будет изменить в админке)
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    formik.setFieldValue('service_posts', [...(formik.values.service_posts || []), newPost]);
  }, [formik, id]);

  // Автоматически добавляем первый пост при создании новой сервисной точки
  useEffect(() => {
    if (!isEditMode && (!formik.values.service_posts || formik.values.service_posts.length === 0)) {
      addNewPost();
    }
  }, [isEditMode, formik.values.service_posts, addNewPost]);

  const removePost = (index: number) => {
    const updatedPosts = [...(formik.values.service_posts || [])];
    const postToRemove = updatedPosts[index];
    
    // Если пост имеет реальный ID (не временный), помечаем его для удаления
    if (postToRemove.id && postToRemove.id < 1000000000000) {
      // Добавляем _destroy: true к существующему посту
      updatedPosts[index] = { ...postToRemove, _destroy: true };
    } else {
      // Для новых постов с временными ID просто удаляем из массива
      updatedPosts.splice(index, 1);
    }
    
    // НЕ перенумеровываем посты - это будет сделано на бэкенде после сохранения
    formik.setFieldValue('service_posts', updatedPosts);
  };

  // Функция для переключения состояния аккордеона
  const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedAccordions(prev => ({
      ...prev,
      [panel]: isExpanded
    }));
  };

  // Функции для проверки заполненности разделов
  const isLocationComplete = () => {
    return (formik.values.region_id ?? 0) > 0 && 
           (formik.values.city_id ?? 0) > 0 && 
           formik.values.address?.trim().length > 0;
  };

  const isContactComplete = () => {
    return formik.values.contact_phone?.trim().length > 0;
  };

  const isSettingsComplete = () => {
    return (formik.values.work_status?.length ?? 0) > 0;
  };

  const isPostsComplete = () => {
    const activePosts = formik.values.service_posts?.filter(post => !post._destroy) || [];
    return activePosts.length > 0 && activePosts.every(post => 
      post.name?.trim().length > 0 && post.slot_duration > 0
    );
  };

  const isServicesComplete = () => {
    const activeServices = formik.values.services?.filter(service => !service._destroy) || [];
    return activeServices.length > 0 && activeServices.every(service => 
      service.service_id > 0 && service.price >= 0 && service.duration > 0
    );
  };

  const isPhotosComplete = () => {
    return photoUploads.length > 0;
  };

  const isScheduleComplete = () => {
    const hasWorkingDays = DAYS_OF_WEEK.some(day => 
      formik.values.working_hours?.[day.key]?.is_working_day
    );
    return hasWorkingDays;
  };

  // Компонент для индикатора завершения
  const CompletionIndicator: React.FC<{ isComplete: boolean }> = ({ isComplete }) => (
    <Box 
      sx={{ 
        width: 8, 
        height: 8, 
        borderRadius: '50%', 
        backgroundColor: isComplete ? 'success.main' : 'grey.400',
        ml: 1
      }} 
    />
  );

  // Функция для получения доступных услуг для конкретного индекса
  const getAvailableServices = useCallback((currentIndex: number) => {
    if (!servicesData) return [];
    
    // Получаем уже выбранные service_id, исключая текущий индекс и удаленные услуги
    const selectedServiceIds = formik.values.services
      ?.filter((service, index) => index !== currentIndex && !service._destroy)
      ?.map(service => service.service_id)
      ?.filter(id => id && id > 0) || [];
    
    // Возвращаем все услуги с информацией о том, доступны ли они
    return servicesData.map((service: Service) => ({
      ...service,
      isDisabled: selectedServiceIds.includes(service.id)
    }));
  }, [servicesData, formik.values.services]);

  return (
    <Box>
      {/* Заголовок страницы с кнопкой возврата */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: SIZES.spacing.lg 
      }}>
        <Typography 
          variant="h4"
          sx={{
            fontSize: SIZES.fontSize.xl, // Используем стандартный размер как на странице партнеров
            fontWeight: 600,
            color: theme.palette.text.primary,
          }}
        >
          {isEditMode 
            ? `Редактирование точки: ${servicePoint?.name || 'Загрузка...'}` 
            : 'Создание точки обслуживания'
          }
        </Typography>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={handleBack}
          sx={secondaryButtonStyles}
        >
          Назад к списку
        </Button>
      </Box>

      {/* Отображение ошибок */}
      {error && (
        <Alert severity="error">
                    ❌ 
          ❌ {error}
        </Alert>
      )}

      {/* Основная форма с централизованными стилями */}
      <Box sx={cardStyles}>
        {loading ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            p: SIZES.spacing.xl 
          }}>
            <CircularProgress />
          </Box>
        ) : (
          <form onSubmit={(e) => {
            e.preventDefault();
            console.log('Form submit event triggered');
            console.log('Form is valid:', formik.isValid);
            console.log('Form errors:', formik.errors);
            formik.handleSubmit(e);
          }}>
            {/* Основная информация - остается без аккордеона для быстрого доступа */}
            <Box >
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ 
                  mb: SIZES.spacing.md,
                  fontSize: SIZES.fontSize.lg,
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                }}
              >
                Основная информация
              </Typography>
              <Grid container spacing={SIZES.spacing.lg}>
                <Grid item xs={12} md={6}>                  <TextField
                    fullWidth
                    id="name"
                    name="name"
                    label="Название точки"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.name && Boolean(formik.errors.name)}
                    helperText={formik.touched.name && formik.errors.name}
                    required
                    sx={textFieldStyles}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl 
                    fullWidth 
                    error={formik.touched.partner_id && Boolean(formik.errors.partner_id)}
                    sx={{
                      ...textFieldStyles,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: SIZES.borderRadius.sm,
                      },
                    }}
                  >
                    <InputLabel id="partner-id-label">Партнер</InputLabel>
                    <Select
                    labelId="partner-id-label"
                    id="partner_id"
                    name="partner_id"
                    value={(formik.values.partner_id || 0).toString()}
                    onChange={(event) => {
                      formik.setFieldValue('partner_id', Number(event.target.value));
                    }}
                    onBlur={formik.handleBlur}
                    label="Партнер"
                  >
                    <MenuItem value="0" disabled>Выберите партнера</MenuItem>
                    {partnersData.map((partner: Partner) => (
                      <MenuItem key={partner.id} value={partner.id.toString()}>
                        {partner.company_name}
                      </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.partner_id && formik.errors.partner_id && (
                    <FormHelperText>{formik.errors.partner_id}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="description"
                    name="description"
                    label="Описание"
                    multiline
                    rows={3}
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.description && Boolean(formik.errors.description)}
                    helperText={formik.touched.description && formik.errors.description}
                    sx={textFieldStyles}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Аккордеон: Адрес и местоположение */}
            <Accordion 
              expanded={expandedAccordions.location} 
              onChange={handleAccordionChange('location')}
              
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="location-content"
                id="location-header"
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocationIcon sx={{ 
                    mr: SIZES.spacing.xs, 
                    color: 'primary.main' 
                  }} />
                  <Typography 
                    variant="h6"
                    sx={{
                      fontSize: SIZES.fontSize.lg,
                      fontWeight: 600,
                    }}
                  >
                    Адрес и местоположение
                  </Typography>
                  <CompletionIndicator isComplete={isLocationComplete()} />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={SIZES.spacing.lg}>
                  <Grid item xs={12} md={6}>
                    <FormControl 
                      fullWidth 
                      error={formik.touched.region_id && Boolean(formik.errors.region_id)}
                      required
                      sx={{
                        ...textFieldStyles,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: SIZES.borderRadius.sm,
                        },
                      }}
                    >
                      <InputLabel id="region-id-label">Регион</InputLabel>
                  <Select
                    labelId="region-id-label"
                    id="region_id"
                    name="region_id"
                    value={formik.values.region_id?.toString() || '0'}
                    onChange={(event) => {
                      const regionId = Number(event.target.value);
                      setSelectedRegionId(regionId);
                      formik.setFieldValue('region_id', regionId);
                    }}
                    onBlur={formik.handleBlur}
                    label="Регион"
                  >
                    <MenuItem value="0" disabled>Выберите регион</MenuItem>
                    {regionsData.map((region: Region) => (
                      <MenuItem key={region.id} value={region.id.toString()}>
                        {region.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.region_id && formik.errors.region_id && (
                    <FormHelperText error>{formik.errors.region_id as string}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl 
                  fullWidth 
                  error={formik.touched.city_id && Boolean(formik.errors.city_id)}
                  required
                >
                  <InputLabel id="city-id-label">Город</InputLabel>
                  <Select
                    labelId="city-id-label"
                    id="city_id"
                    name="city_id"
                    value={formik.values.city_id?.toString() || '0'}
                    onChange={(event) => {
                      const cityId = Number(event.target.value);
                      formik.setFieldValue('city_id', cityId);
                    }}
                    onBlur={formik.handleBlur}
                    label="Город"
                    disabled={!formik.values.region_id}
                  >
                    <MenuItem value="0" disabled>Выберите город</MenuItem>
                    {citiesData.map((city: City) => (
                      <MenuItem key={city.id} value={city.id.toString()}>
                        {city.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.city_id && formik.errors.city_id && (
                    <FormHelperText error>{formik.errors.city_id as string}</FormHelperText>
                  )}
                  {!formik.values.region_id && (
                    <FormHelperText>Сначала выберите регион</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="address"
                  name="address"
                  label="Адрес"
                  value={formik.values.address}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.address && Boolean(formik.errors.address)}
                  helperText={formik.touched.address && formik.errors.address}
                  placeholder="Введите полный адрес сервисной точки"
                  required
                  sx={textFieldStyles}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="latitude"
                  name="latitude"
                  label="Широта"
                  type="number"
                  value={formik.values.latitude || ''}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.latitude && Boolean(formik.errors.latitude)}
                  helperText={formik.touched.latitude && formik.errors.latitude}
                  placeholder="Например: 55.7558"
                  InputProps={{
                    inputProps: { 
                      step: "0.000001",
                      min: -90,
                      max: 90
                    }
                  }}
                  sx={textFieldStyles}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="longitude"
                  name="longitude"
                  label="Долгота"
                  type="number"
                  value={formik.values.longitude || ''}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.longitude && Boolean(formik.errors.longitude)}
                  helperText={formik.touched.longitude && formik.errors.longitude}
                  InputProps={{
                    inputProps: { 
                      step: "0.000001",
                      min: -180,
                      max: 180
                    }
                  }}
                />
              </Grid>
              </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Контактная информация - раздел для указания телефонов и других контактов */}
            <Accordion 
              expanded={expandedAccordions.contact} 
              onChange={handleAccordionChange('contact')}
              sx={{ 
                mb: SIZES.spacing.md,
                borderRadius: SIZES.borderRadius.sm,
                '&:before': { display: 'none' }
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="contact-content"
                id="contact-header"
                sx={{ 
                  py: SIZES.spacing.xs,
                  px: SIZES.spacing.lg,
                  '& .MuiAccordionSummary-content': {
                    my: SIZES.spacing.xs
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PhoneIcon sx={{ mr: SIZES.spacing.xs, color: 'primary.main' }} />
                  <Typography variant="h6" sx={{ fontSize: SIZES.fontSize.lg }}>
                    Контактная информация
                  </Typography>
                  <CompletionIndicator isComplete={isContactComplete()} />
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ px: SIZES.spacing.lg, pb: SIZES.spacing.lg }}>
                <Grid container spacing={SIZES.spacing.md}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth sx={textFieldStyles}>
                      <TextField
                        fullWidth
                        id="contact_phone"
                        name="contact_phone"
                        label="Контактный телефон"
                        value={formik.values.contact_phone}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.contact_phone && Boolean(formik.errors.contact_phone)}
                        helperText={formik.touched.contact_phone && formik.errors.contact_phone}
                        placeholder="Например: +7 (999) 123-45-67"
                        sx={{
                          ...textFieldStyles,
                          '& .MuiOutlinedInput-root': {
                            borderRadius: SIZES.borderRadius.sm
                          }
                        }}
                      />
                    </FormControl>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Параметры работы - настройки активности и статуса точки обслуживания */}
            <Accordion 
              expanded={expandedAccordions.settings} 
              onChange={handleAccordionChange('settings')}
              sx={{ 
                mb: SIZES.spacing.md,
                borderRadius: SIZES.borderRadius.sm,
                '&:before': { display: 'none' }
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="settings-content"
                id="settings-header"
                sx={{ 
                  py: SIZES.spacing.xs,
                  px: SIZES.spacing.lg,
                  '& .MuiAccordionSummary-content': {
                    my: SIZES.spacing.xs
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <SettingsIcon sx={{ mr: SIZES.spacing.xs, color: 'primary.main' }} />
                  <Typography variant="h6" sx={{ fontSize: SIZES.fontSize.lg }}>
                    Параметры работы
                  </Typography>
                  <CompletionIndicator isComplete={isSettingsComplete()} />
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ px: SIZES.spacing.lg, pb: SIZES.spacing.lg }}>
                <Grid container spacing={SIZES.spacing.md}>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formik.values.is_active}
                          onChange={(e) => {
                            formik.setFieldValue('is_active', e.target.checked);
                          }}
                          name="is_active"
                        />
                      }
                      label="Точка активна"
                      sx={{ fontSize: SIZES.fontSize.md }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl 
                      fullWidth 
                      error={formik.touched.work_status && Boolean(formik.errors.work_status)}
                      sx={{
                        ...textFieldStyles,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: SIZES.borderRadius.sm
                        }
                      }}
                    >
                      <InputLabel id="work-status-label">Статус работы</InputLabel>
                      <Select
                        labelId="work-status-label"
                        id="work_status"
                        name="work_status"
                        value={formik.values.work_status || 'working'}
                        onChange={(event) => {
                          formik.setFieldValue('work_status', event.target.value);
                        }}
                        label="Статус работы"
                        disabled={workStatusesLoading}
                      >
                        {workStatuses.map((status) => (
                          <MenuItem key={status.value} value={status.value}>
                            {status.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {workStatusesLoading && (
                        <FormHelperText>
                          Загрузка статусов работы...
                        </FormHelperText>
                      )}
                      {formik.touched.work_status && formik.errors.work_status && (
                        <FormHelperText error>
                          {formik.errors.work_status as string}
                        </FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Посты обслуживания - управление рабочими постами точки обслуживания */}
            <Accordion 
              expanded={expandedAccordions.posts} 
              onChange={handleAccordionChange('posts')}
              sx={{ 
                mb: SIZES.spacing.md,
                borderRadius: SIZES.borderRadius.sm,
                '&:before': { display: 'none' }
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="posts-content"
                id="posts-header"
                sx={{ 
                  py: SIZES.spacing.xs,
                  px: SIZES.spacing.lg,
                  '& .MuiAccordionSummary-content': {
                    my: SIZES.spacing.xs
                  }
                }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  width: '100%' 
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <BuildIcon sx={{ mr: SIZES.spacing.xs, color: 'primary.main' }} />
                    <Typography variant="h6" sx={{ fontSize: SIZES.fontSize.lg }}>
                      Посты обслуживания
                    </Typography>
                    <CompletionIndicator isComplete={isPostsComplete()} />
                  </Box>
                  <Button
                    variant="outlined"
                    onClick={(e) => {
                      e.stopPropagation(); // Предотвращаем свертывание аккордеона
                      addNewPost();
                    }}
                    startIcon={<AddIcon />}
                    size="small"
                    sx={{ 
                      ...secondaryButtonStyles,
                      mr: SIZES.spacing.md,
                      borderRadius: SIZES.borderRadius.sm
                    }}
                  >
                    Добавить пост
                  </Button>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ px: SIZES.spacing.lg, pb: SIZES.spacing.lg }}>
                {formik.values.service_posts && formik.values.service_posts.length > 0 ? (
                  <Grid container spacing={SIZES.spacing.md}>
                    {formik.values.service_posts
                      .filter(post => !post._destroy) // Фильтруем посты помеченные для удаления
                      .map((post, index) => {
                        // Находим оригинальный индекс в полном массиве для правильного обновления
                        const originalIndex = formik.values.service_posts.findIndex(p => p.id === post.id);
                        return (
                          <Grid item xs={12} md={6} key={post.id}>
                            <Card sx={{ 
                              ...cardStyles,
                              p: SIZES.spacing.md,
                              borderRadius: SIZES.borderRadius.sm
                            }}>
                              <Box sx={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center', 
                                mb: SIZES.spacing.md 
                              }}>
                                <Typography variant="h6" sx={{ fontSize: SIZES.fontSize.lg }}>
                                  Пост {post.post_number}
                                </Typography>
                                <IconButton
                                  color="error"
                                  onClick={() => removePost(originalIndex)}
                                  size="small"
                                  disabled={formik.values.service_posts.filter(p => !p._destroy).length === 1}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Box>
                              
                              <TextField
                                fullWidth
                                label="Название поста"
                                value={post.name}
                                onChange={(e) => {
                                  const updatedPosts = [...formik.values.service_posts];
                                  updatedPosts[originalIndex] = { ...post, name: e.target.value };
                                  formik.setFieldValue('service_posts', updatedPosts);
                                }}
                                margin="normal"
                                sx={{
                                  ...textFieldStyles,
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: SIZES.borderRadius.sm
                                  }
                                }}
                              />
                              
                              <TextField
                                fullWidth
                                label="Описание"
                                value={post.description || ''}
                                onChange={(e) => {
                                  const updatedPosts = [...formik.values.service_posts];
                                  updatedPosts[originalIndex] = { ...post, description: e.target.value };
                                  formik.setFieldValue('service_posts', updatedPosts);
                                }}
                                multiline
                                rows={2}
                                margin="normal"
                                sx={{
                                  ...textFieldStyles,
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: SIZES.borderRadius.sm
                                  }
                                }}
                              />
                              
                              <TextField
                                fullWidth
                                type="number"
                                label="Длительность слота (мин)"
                                value={post.slot_duration}
                                onChange={(e) => {
                                  const updatedPosts = [...formik.values.service_posts];
                                  updatedPosts[originalIndex] = { ...post, slot_duration: Number(e.target.value) };
                                  formik.setFieldValue('service_posts', updatedPosts);
                                }}
                                InputProps={{
                                  inputProps: { min: 5, max: 480 },
                                  endAdornment: <InputAdornment position="end">мин</InputAdornment>
                                }}
                                margin="normal"
                                sx={{
                                  ...textFieldStyles,
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: SIZES.borderRadius.sm
                                  }
                                }}
                              />
                              
                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={post.is_active}
                                    onChange={(e) => {
                                      const updatedPosts = [...formik.values.service_posts];
                                      updatedPosts[originalIndex] = { ...post, is_active: e.target.checked };
                                      formik.setFieldValue('service_posts', updatedPosts);
                                    }}
                                  />
                                }
                                label="Пост активен"
                                sx={{ 
                                  mt: SIZES.spacing.xs,
                                  fontSize: SIZES.fontSize.md
                                }}
                              />

                              {/* Настройки индивидуального расписания */}
                              <Box sx={{ 
                                mt: SIZES.spacing.md, 
                                p: SIZES.spacing.md, 
                                border: '1px solid #e0e0e0', 
                                borderRadius: SIZES.borderRadius.sm, 
                                backgroundColor: 'grey.50' 
                              }}>
                                <FormControlLabel
                                  control={
                                    <Switch
                                      checked={post.has_custom_schedule || false}
                                      onChange={(e) => {
                                        const updatedPosts = [...formik.values.service_posts];
                                        const updatedPost = { ...post, has_custom_schedule: e.target.checked };
                                        
                                        // При включении собственного расписания устанавливаем значения по умолчанию
                                        if (e.target.checked && !post.working_days) {
                                          updatedPost.working_days = {
                                            monday: true,
                                            tuesday: true,
                                            wednesday: true,
                                            thursday: true,
                                            friday: true,
                                            saturday: false,
                                            sunday: false,
                                          };
                                          updatedPost.custom_hours = {
                                            start: '09:00',
                                            end: '18:00',
                                          };
                                        }
                                        
                                        updatedPosts[originalIndex] = updatedPost;
                                        formik.setFieldValue('service_posts', updatedPosts);
                                      }}
                                      color="secondary"
                                    />
                                  }
                                  label="Индивидуальное расписание"
                                />
                                
                                {post.has_custom_schedule && (
                                  <Box sx={{ mt: SIZES.spacing.md }}>
                                    <Typography variant="subtitle2" gutterBottom sx={{ fontSize: SIZES.fontSize.md }}>
                                      Рабочие дни:
                                    </Typography>
                                    
                                    <Grid container spacing={SIZES.spacing.xs} >
                                      {Object.entries({
                                        monday: 'Пн',
                                        tuesday: 'Вт', 
                                        wednesday: 'Ср',
                                        thursday: 'Чт',
                                        friday: 'Пт',
                                        saturday: 'Сб',
                                        sunday: 'Вс'
                                      }).map(([day, label]) => (
                                        <Grid item key={day}>
                                          <FormControlLabel
                                            control={
                                              <Switch
                                                size="small"
                                                checked={post.working_days?.[day as keyof typeof post.working_days] || false}
                                                onChange={(e) => {
                                                  const updatedPosts = [...formik.values.service_posts];
                                                  const updatedWorkingDays = {
                                                    monday: false,
                                                    tuesday: false,
                                                    wednesday: false,
                                                    thursday: false,
                                                    friday: false,
                                                    saturday: false,
                                                    sunday: false,
                                                    ...post.working_days,
                                                    [day]: e.target.checked
                                                  };
                                                  updatedPosts[originalIndex] = { 
                                                    ...post, 
                                                    working_days: updatedWorkingDays 
                                                  };
                                                  formik.setFieldValue('service_posts', updatedPosts);
                                                }}
                                              />
                                            }
                                            label={label}
                                            sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.75rem' } }}
                                          />
                                        </Grid>
                                      ))}
                                    </Grid>

                                    <Grid container spacing={SIZES.spacing.md}>
                                      <Grid item xs={6}>
                                        <TextField
                                          fullWidth
                                          type="time"
                                          label="Начало работы"
                                          value={post.custom_hours?.start || '09:00'}
                                          onChange={(e) => {
                                            const updatedPosts = [...formik.values.service_posts];
                                            const updatedHours = {
                                              start: e.target.value,
                                              end: post.custom_hours?.end || '18:00'
                                            };
                                            updatedPosts[originalIndex] = { 
                                              ...post, 
                                              custom_hours: updatedHours 
                                            };
                                            formik.setFieldValue('service_posts', updatedPosts);
                                          }}
                                          size="small"
                                          InputLabelProps={{ shrink: true }}
                                          sx={{
                                            ...textFieldStyles,
                                            '& .MuiOutlinedInput-root': {
                                              borderRadius: SIZES.borderRadius.sm
                                            }
                                          }}
                                        />
                                      </Grid>
                                      <Grid item xs={6}>
                                        <TextField
                                          fullWidth
                                          type="time"
                                          label="Конец работы"
                                          value={post.custom_hours?.end || '18:00'}
                                          onChange={(e) => {
                                            const updatedPosts = [...formik.values.service_posts];
                                            const updatedHours = {
                                              start: post.custom_hours?.start || '09:00',
                                              end: e.target.value
                                            };
                                            updatedPosts[originalIndex] = { 
                                              ...post, 
                                              custom_hours: updatedHours 
                                            };
                                            formik.setFieldValue('service_posts', updatedPosts);
                                          }}
                                          size="small"
                                          InputLabelProps={{ shrink: true }}
                                          sx={{
                                            ...textFieldStyles,
                                            '& .MuiOutlinedInput-root': {
                                              borderRadius: SIZES.borderRadius.sm
                                            }
                                          }}
                                        />
                                      </Grid>
                                    </Grid>
                                  </Box>
                                )}
                              </Box>
                            </Card>
                          </Grid>
                        );
                      })}
                  </Grid>
                ) : (
                  <Alert severity="info">
                    💡 
                    💡 {isEditMode 
                      ? "У данной сервисной точки пока нет постов обслуживания. Нажмите 'Добавить пост' для создания первого поста." 
                      : "Посты обслуживания будут созданы после сохранения сервисной точки. Добавьте хотя бы один пост."
                    }
                  </Alert>
                )}
              </AccordionDetails>
            </Accordion>

            {/* Услуги и цены - управление доступными услугами и их стоимостью */}
            <Accordion 
              expanded={expandedAccordions.services} 
              onChange={handleAccordionChange('services')}
              sx={{ 
                mb: SIZES.spacing.md,
                borderRadius: SIZES.borderRadius.sm,
                '&:before': { display: 'none' }
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="services-content"
                id="services-header"
                sx={{ 
                  py: SIZES.spacing.xs,
                  px: SIZES.spacing.lg,
                  '& .MuiAccordionSummary-content': {
                    my: SIZES.spacing.xs
                  }
                }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  width: '100%' 
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PriceIcon sx={{ mr: SIZES.spacing.xs, color: 'primary.main' }} />
                    <Typography variant="h6" sx={{ fontSize: SIZES.fontSize.lg }}>
                      Услуги и цены
                    </Typography>
                    <CompletionIndicator isComplete={isServicesComplete()} />
                  </Box>
                  <Button
                    variant="outlined"
                    onClick={(e) => {
                      e.stopPropagation(); // Предотвращаем свертывание аккордеона
                      
                      // Проверяем, есть ли еще доступные услуги
                      const activeServices = formik.values.services?.filter(s => !s._destroy) || [];
                      const selectedServiceIds = activeServices.map(s => s.service_id);
                      const availableServices = servicesData?.filter((service: Service) => 
                        !selectedServiceIds.includes(service.id)
                      ) || [];
                      
                      if (availableServices.length === 0) {
                        setSnackbarMessage('Все доступные услуги уже добавлены');
                        setSnackbarSeverity('error');
                        setSnackbarOpen(true);
                        return;
                      }
                      
                      formik.setFieldValue('services', [
                        ...(formik.values.services || []),
                        {
                          service_id: 0,
                          price: 0,
                          duration: 30,
                          is_available: true
                        }
                      ]);
                    }}
                    size="small"
                    sx={{ 
                      ...secondaryButtonStyles,
                      mr: SIZES.spacing.md,
                      borderRadius: SIZES.borderRadius.sm
                    }}
                  >
                    Добавить услугу
                  </Button>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ px: SIZES.spacing.lg, pb: SIZES.spacing.lg }}>
                {formik.values.services && formik.values.services.filter(service => !service._destroy).length > 0 ? (
                  <Grid container spacing={SIZES.spacing.md}>
                    {formik.values.services
                      .filter(service => !service._destroy) // Фильтруем услуги помеченные для удаления
                      .map((service, filteredIndex) => {
                        // Находим оригинальный индекс в полном массиве для правильного обновления
                        const originalIndex = formik.values.services.findIndex(s => 
                          s.id === service.id && s.service_id === service.service_id
                        );
                        return (
                          <Grid item xs={12} md={6} key={service.id}>
                            <Box sx={{ 
                              ...cardStyles,
                              p: SIZES.spacing.md, 
                              border: '1px solid #e0e0e0', 
                              borderRadius: SIZES.borderRadius.sm 
                            }}>
                              <Grid container spacing={SIZES.spacing.md}>
                                <Grid item xs={12}>
                                  <FormControl 
                                    fullWidth 
                                    error={Boolean(
                                      formik.touched.services?.[originalIndex]?.service_id && 
                                      typeof formik.errors.services?.[originalIndex] === 'object' &&
                                      (formik.errors.services[originalIndex] as ServiceFormErrors)?.service_id
                                    )}
                                    sx={{
                                      ...textFieldStyles,
                                      '& .MuiOutlinedInput-root': {
                                        borderRadius: SIZES.borderRadius.sm
                                      }
                                    }}
                                  >
                                    <InputLabel>Услуга</InputLabel>
                                    <Select
                                      value={service.service_id ? String(service.service_id) : '0'}
                                      onChange={(event) => {
                                        const selectedServiceId = Number(event.target.value);
                                        const selectedService = servicesData?.find((s: Service) => s.id === selectedServiceId);
                                        if (selectedService) {
                                          formik.setFieldValue(`services.${originalIndex}`, {
                                            ...service,
                                            service_id: selectedServiceId,
                                            duration: service.duration || 30, // Используем текущую длительность или значение по умолчанию
                                            price: service.price,
                                          });
                                        }
                                      }}
                                      label="Услуга"
                                    >
                                      <MenuItem value="0" disabled>Выберите услугу</MenuItem>
                                      {getAvailableServices(filteredIndex).map((serviceItem: any) => (
                                        <MenuItem 
                                          key={serviceItem.id} 
                                          value={String(serviceItem.id)}
                                          disabled={serviceItem.isDisabled}
                                        >
                                          {serviceItem.name} ({serviceItem.category?.name || 'Без категории'})
                                          {serviceItem.isDisabled && ' (уже выбрана)'}
                                        </MenuItem>
                                      ))}
                                    </Select>
                                    {formik.touched.services?.[originalIndex]?.service_id && 
                                     typeof formik.errors.services?.[originalIndex] === 'object' &&
                                     (formik.errors.services[originalIndex] as ServiceFormErrors)?.service_id && (
                                      <FormHelperText>
                                        {(formik.errors.services[originalIndex] as ServiceFormErrors).service_id}
                                      </FormHelperText>
                                    )}
                                  </FormControl>
                                </Grid>

                                <Grid item xs={6}>
                                  <TextField
                                    fullWidth
                                    type="number"
                                    label="Цена"
                                    value={service.price}
                                    onChange={(e) => {
                                      formik.setFieldValue(`services.${originalIndex}.price`, Number(e.target.value));
                                    }}
                                    InputProps={{
                                      endAdornment: <InputAdornment position="end">₽</InputAdornment>,
                                      inputProps: { min: 0 }
                                    }}
                                    sx={{
                                      ...textFieldStyles,
                                      '& .MuiOutlinedInput-root': {
                                        borderRadius: SIZES.borderRadius.sm
                                      }
                                    }}
                                  />
                                </Grid>

                                <Grid item xs={6}>
                                  <TextField
                                    fullWidth
                                    type="number"
                                    label="Длительность"
                                    value={service.duration}
                                    onChange={(e) => {
                                      formik.setFieldValue(`services.${originalIndex}.duration`, Number(e.target.value));
                                    }}
                                    InputProps={{
                                      endAdornment: <InputAdornment position="end">мин</InputAdornment>,
                                      inputProps: { min: 5 }
                                    }}
                                    sx={{
                                      ...textFieldStyles,
                                      '& .MuiOutlinedInput-root': {
                                        borderRadius: SIZES.borderRadius.sm
                                      }
                                    }}
                                  />
                                </Grid>

                                <Grid item xs={12}>
                                  <Box sx={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center' 
                                  }}>
                                    <FormControlLabel
                                      control={
                                        <Switch
                                          checked={service.is_available}
                                          onChange={(e) => {
                                            formik.setFieldValue(`services.${originalIndex}.is_available`, e.target.checked);
                                          }}
                                          name={`services.${originalIndex}.is_available`}
                                        />
                                      }
                                      label="Услуга доступна"
                                    />
                                    <Button
                                      color="error"
                                      onClick={() => {
                                        const newServices = [...(formik.values.services || [])];
                                        const serviceToRemove = newServices[originalIndex];
                                        
                                        // Если услуга имеет реальный ID (существует в БД), помечаем для удаления
                                        if (serviceToRemove.id && serviceToRemove.id > 0) {
                                          newServices[originalIndex] = { ...serviceToRemove, _destroy: true };
                                        } else {
                                          // Если это новая услуга без ID, просто удаляем из массива
                                          newServices.splice(originalIndex, 1);
                                        }
                                        
                                        formik.setFieldValue('services', newServices);
                                      }}
                                      size="small"
                                      sx={{
                                        ...secondaryButtonStyles,
                                        borderRadius: SIZES.borderRadius.sm
                                      }}
                                    >
                                      Удалить
                                    </Button>
                                  </Box>
                                </Grid>
                              </Grid>
                            </Box>
                          </Grid>
                        );
                      })}
                  </Grid>
                ) : (
                  <Alert severity="info">
                    💡 
                    Нажмите "Добавить услугу" для создания первой услуги.
                  </Alert>
                )}
              </AccordionDetails>
            </Accordion>

            {/* Фотографии - управление галереей изображений точки обслуживания */}
            <Accordion 
              expanded={expandedAccordions.photos} 
              onChange={handleAccordionChange('photos')}
              sx={{ 
                mb: SIZES.spacing.md,
                borderRadius: SIZES.borderRadius.sm,
                '&:before': { display: 'none' }
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="photos-content"
                id="photos-header"
                sx={{ 
                  py: SIZES.spacing.xs,
                  px: SIZES.spacing.lg,
                  '& .MuiAccordionSummary-content': {
                    my: SIZES.spacing.xs
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PhotoIcon sx={{ mr: SIZES.spacing.xs, color: 'primary.main' }} />
                  <Typography variant="h6" sx={{ fontSize: SIZES.fontSize.lg }}>
                    Фотографии
                  </Typography>
                  <CompletionIndicator isComplete={isPhotosComplete()} />
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ px: SIZES.spacing.lg, pb: SIZES.spacing.lg }}>
                <Box >
                  <Box
                    component="input"
                    sx={{ display: 'none' }}
                    accept="image/*"
                    id="photo-upload"
                    multiple
                    type="file"
                    onChange={handlePhotoUpload}
                  />
                  <label htmlFor="photo-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<AddPhotoIcon />}
                      disabled={photoUploads.length >= 10}
                      sx={{ 
                        ...secondaryButtonStyles,
                        borderRadius: SIZES.borderRadius.sm
                      }}
                    >
                      Добавить фотографии
                    </Button>
                  </label>
                  {photoUploads.length >= 10 && (
                    <FormHelperText error>
                      Достигнуто максимальное количество фотографий (10)
                    </FormHelperText>
                  )}
                </Box>

                {photoUploads.length > 0 ? (
                  <Grid container spacing={SIZES.spacing.md}>
                    {photoUploads.map((photo, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Card sx={{ 
                          ...cardStyles,
                          borderRadius: SIZES.borderRadius.sm 
                        }}>
                          <Box
                            component="img"
                            src={photo.preview}
                            alt={`Фото ${index + 1}`}
                            sx={{
                              width: '100%',
                              height: 200,
                              objectFit: 'cover',
                              borderRadius: SIZES.borderRadius.sm
                            }}
                          />
                          <TextField
                            fullWidth
                            margin="normal"
                            label="Описание"
                            value={photo.description || ''}
                            onChange={(e) => {
                              const newPhotos = [...photoUploads];
                              newPhotos[index].description = e.target.value;
                              setPhotoUploads(newPhotos);
                            }}
                            sx={{
                              ...textFieldStyles,
                              '& .MuiOutlinedInput-root': {
                                borderRadius: SIZES.borderRadius.sm
                              }
                            }}
                          />
                          <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            pt: SIZES.spacing.md
                          }}>
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={photo.is_main}
                                  onChange={() => handleSetMainPhoto(index)}
                                />
                              }
                              label="Главное фото"
                            />
                            <IconButton
                              color="error"
                              onClick={() => handlePhotoDelete(index)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Alert severity="info">
                    💡 
                    Загрузите фотографии сервисной точки для лучшего представления.
                  </Alert>
                )}
              </AccordionDetails>
            </Accordion>

            {/* График работы - настройка расписания работы по дням недели */}
            <Accordion 
              expanded={expandedAccordions.schedule} 
              onChange={handleAccordionChange('schedule')}
              sx={{ 
                mb: SIZES.spacing.md,
                borderRadius: SIZES.borderRadius.sm,
                '&:before': { display: 'none' }
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="schedule-content"
                id="schedule-header"
                sx={{ 
                  py: SIZES.spacing.xs,
                  px: SIZES.spacing.lg,
                  '& .MuiAccordionSummary-content': {
                    my: SIZES.spacing.xs
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ScheduleIcon sx={{ mr: SIZES.spacing.xs, color: 'primary.main' }} />
                  <Typography variant="h6" sx={{ fontSize: SIZES.fontSize.lg }}>
                    График работы
                  </Typography>
                  <CompletionIndicator isComplete={isScheduleComplete()} />
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ px: SIZES.spacing.lg, pb: SIZES.spacing.lg }}>
                <Grid container spacing={SIZES.spacing.md}>
                  {DAYS_OF_WEEK.map((day: DayOfWeek) => (
                    <Grid item xs={12} md={6} key={day.id}>
                      <Box sx={{ 
                        ...cardStyles,
                        p: SIZES.spacing.md, 
                        border: '1px solid #e0e0e0', 
                        borderRadius: SIZES.borderRadius.sm 
                      }}>
                        <Typography variant="subtitle1" gutterBottom sx={{ fontSize: SIZES.fontSize.lg }}>
                          {day.name}
                        </Typography>
                        
                        <Grid container spacing={SIZES.spacing.md}>
                          <Grid item xs={12}>
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={formik.values.working_hours[day.key]?.is_working_day ?? false}
                                  onChange={(e) => {
                                    formik.setFieldValue(`working_hours.${day.key}`, {
                                      ...formik.values.working_hours[day.key],
                                      is_working_day: e.target.checked
                                    } as WorkingHours);
                                  }}
                                  name={`working_hours.${day.key}.is_working_day`}
                                />
                              }
                              label="Рабочий день"
                            />
                          </Grid>

                          {formik.values.working_hours[day.key]?.is_working_day && (
                            <>
                              <Grid item xs={6}>
                                <TextField
                                  fullWidth
                                  type="time"
                                  label="Начало работы"
                                  value={formik.values.working_hours[day.key]?.start ?? '09:00'}
                                  onChange={(e) => {
                                    formik.setFieldValue(`working_hours.${day.key}`, {
                                      ...formik.values.working_hours[day.key],
                                      start: e.target.value
                                    } as WorkingHours);
                                  }}
                                  InputLabelProps={{ shrink: true }}
                                  error={Boolean(
                                    formik.touched.working_hours?.[day.key]?.start && 
                                    formik.errors.working_hours?.[day.key]?.start
                                  )}
                                  helperText={
                                    formik.touched.working_hours?.[day.key]?.start && 
                                    formik.errors.working_hours?.[day.key]?.start
                                  }
                                  sx={{
                                    ...textFieldStyles,
                                    '& .MuiOutlinedInput-root': {
                                      borderRadius: SIZES.borderRadius.sm
                                    }
                                  }}
                                />
                              </Grid>
                              <Grid item xs={6}>
                                <TextField
                                  fullWidth
                                  type="time"
                                  label="Конец работы"
                                  value={formik.values.working_hours[day.key]?.end ?? '18:00'}
                                  onChange={(e) => {
                                    formik.setFieldValue(`working_hours.${day.key}`, {
                                      ...formik.values.working_hours[day.key],
                                      end: e.target.value
                                    } as WorkingHours);
                                  }}
                                  InputLabelProps={{ shrink: true }}
                                  error={Boolean(
                                    formik.touched.working_hours?.[day.key]?.end && 
                                    formik.errors.working_hours?.[day.key]?.end
                                  )}
                                  helperText={
                                    formik.touched.working_hours?.[day.key]?.end && 
                                    formik.errors.working_hours?.[day.key]?.end
                                  }
                                  sx={{
                                    ...textFieldStyles,
                                    '& .MuiOutlinedInput-root': {
                                      borderRadius: SIZES.borderRadius.sm
                                    }
                                  }}
                                />
                              </Grid>
                            </>
                          )}
                        </Grid>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Кнопки управления формой - применение централизованных стилей для кнопок */}
            
            {/* Уведомления */}
            {errorMessage && (
              <Alert severity="error" >
                {errorMessage}
              </Alert>
            )}
            
            {successMessage && (
              <Alert severity="success" >
                {successMessage}
              </Alert>
            )}

            {/* Уведомление о незаполненных обязательных полях */}
            {(!formik.isValid && showValidationErrors) && (
              <Alert severity="warning" >
                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Заполните все обязательные поля:
                </Typography>
                <Box component="ul" sx={{ pl: 2, mb: 0, mt: 1 }}>
                  {getRequiredFieldErrors().map((field, index) => (
                    <Typography variant="body2" component="li" key={index}>
                      {field}
                    </Typography>
                  ))}
                </Box>
              </Alert>
            )}

            {/* Информационное сообщение о блокировке кнопки */}
            {!formik.isValid && !showValidationErrors && (
              <Alert severity="info" >
                Заполните все обязательные поля для активации кнопки сохранения
              </Alert>
            )}
            
            <Box sx={{ 
              display: 'flex', 
              gap: SIZES.spacing.md, 
              justifyContent: 'flex-end', 
              mt: SIZES.spacing.xl 
            }}>
              <Button 
                onClick={handleBack}
                sx={{
                  ...secondaryButtonStyles,
                  borderRadius: SIZES.borderRadius.sm
                }}
              >
                Отмена
              </Button>
              <Button
                type={formik.isValid ? "submit" : "button"}
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                disabled={formik.isSubmitting}
                onClick={!formik.isValid ? handleDisabledButtonClick : undefined}
                sx={{
                  ...buttonStyles,
                  borderRadius: SIZES.borderRadius.sm,
                  ...((!formik.isValid && !formik.isSubmitting) && {
                    backgroundColor: theme.palette.warning.main,
                    '&:hover': {
                      backgroundColor: theme.palette.warning.dark,
                    }
                  })
                }}
              >
                {formik.isSubmitting ? 'Сохранение...' : 'Сохранить'}
              </Button>
            </Box>
          </form>
        )}
      </Box>

      <Snackbar
        open={Boolean(successMessage)}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        message={successMessage || ''}
        severity="success"
      />
      
      <Snackbar
        open={Boolean(errorMessage)}
        autoHideDuration={5000}
        onClose={() => setErrorMessage(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        message={errorMessage || ''}
        severity="error"
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        message={snackbarMessage || ''}
        severity={snackbarSeverity}
      />
    </Box>
  );
};

export default ServicePointFormPage;