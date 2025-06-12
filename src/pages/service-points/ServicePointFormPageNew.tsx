import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Snackbar,
  useMediaQuery,
  useTheme,
  StepContent,
  Chip,
  Stack,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Save as SaveIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';

// Импорты стилей
import { SIZES, getButtonStyles, getCardStyles } from '../../styles';

// Компоненты шагов
import BasicInfoStep from './components/BasicInfoStep';
import LocationStep from './components/LocationStep';
import ContactStep from './components/ContactStep';
import SettingsStep from './components/SettingsStep';
import PostsStep from './components/PostsStep';
import ServicesStep from './components/ServicesStep';
import PhotosStep from './components/PhotosStep';
import ScheduleStep from './components/ScheduleStep';

// API хуки
import {
  useGetServicePointByIdQuery,
  useCreateServicePointMutation,
  useUpdateServicePointMutation,
} from '../../api/servicePoints.api';

// Типы
import type { ServicePointFormDataNew, ServicePoint } from '../../types/models';
import { DAYS_OF_WEEK } from '../../types/working-hours';
import type { WorkingHoursSchedule, WorkingHours } from '../../types/working-hours';

// Шаги формы
const FORM_STEPS = [
  { id: 'basic', label: 'Основная информация', component: BasicInfoStep },
  { id: 'location', label: 'Местоположение', component: LocationStep },
  { id: 'contact', label: 'Контакты', component: ContactStep },
  { id: 'schedule', label: 'Расписание', component: ScheduleStep },
  { id: 'posts', label: 'Посты обслуживания', component: PostsStep },
  { id: 'services', label: 'Услуги', component: ServicesStep },
  { id: 'photos', label: 'Фотографии', component: PhotosStep },
  { id: 'settings', label: 'Настройки', component: SettingsStep },
];

// Начальное расписание для быстрого заполнения
const defaultWorkingHours: WorkingHoursSchedule = DAYS_OF_WEEK.reduce<WorkingHoursSchedule>((acc, day) => {
  const workingHours: WorkingHours = {
    start: '09:00',
    end: '18:00',
    is_working_day: day.id >= 1 && day.id <= 5 // Пн-Пт рабочие дни (id: 1-5)
  };
  acc[day.key] = workingHours;
  return acc;
}, {} as WorkingHoursSchedule);

// Пустое расписание для новых точек
const emptyWorkingHours: WorkingHoursSchedule = DAYS_OF_WEEK.reduce<WorkingHoursSchedule>((acc, day) => {
  const workingHours: WorkingHours = {
    start: '09:00',
    end: '18:00',
    is_working_day: false // Все дни изначально выключены
  };
  acc[day.key] = workingHours;
  return acc;
}, {} as WorkingHoursSchedule);

// Схема валидации
const validationSchema = yup.object({
  name: yup.string().required('Название точки обязательно'),
  partner_id: yup.number().required('Партнер обязателен').min(1, 'Выберите партнера'),
  city_id: yup.number().required('Город обязателен').min(1, 'Выберите город'),
  address: yup.string().required('Адрес обязателен'),
  contact_phone: yup.string().required('Контактный телефон обязателен'),
  is_active: yup.boolean().required(),
  work_status: yup.string().required('Статус работы обязателен'),
});

const ServicePointFormPageNew: React.FC = () => {
  const { partnerId, id } = useParams<{ partnerId: string; id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  
  // Хуки для темы и адаптивности
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // < 900px - Мобильные устройства
  const isTablet = useMediaQuery(theme.breakpoints.down('lg')); // < 1200px - Планшеты  
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm')); // < 600px - Маленькие мобильные
  const isVerySmallMobile = useMediaQuery(theme.breakpoints.down('sm')); // < 600px
  const isMediumMobile = useMediaQuery(theme.breakpoints.down('md')); // < 900px
  const isLargeTablet = useMediaQuery(theme.breakpoints.down('xl')); // < 1536px - Большие планшеты
  
  // Состояние
  const [activeStep, setActiveStep] = useState(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Ref для контейнера чипов степпера
  const chipContainerRef = useRef<HTMLDivElement>(null);

  // API хуки
  const { data: servicePoint, isLoading } = useGetServicePointByIdQuery(
    { partner_id: Number(partnerId) || 0, id: id ?? '' },
    { skip: !isEditMode || !id || !partnerId }
  );
  
  const [createServicePoint, { isLoading: isCreating }] = useCreateServicePointMutation();
  const [updateServicePoint, { isLoading: isUpdating }] = useUpdateServicePointMutation();

  // Проверяем корректность данных
  useEffect(() => {
    if (isEditMode && !partnerId) {
      console.error('ОШИБКА: Попытка редактирования сервисной точки без partnerId в URL');
      alert('Ошибка: Некорректный URL для редактирования сервисной точки');
      navigate('/service-points');
    }
  }, [isEditMode, partnerId, navigate]);

  // Нормализуем данные расписания (конвертируем строки в булевы значения)
  const normalizedWorkingHours = useMemo(() => {
    if (!isEditMode || !servicePoint?.working_hours) {
      return emptyWorkingHours;
    }

    const normalized: WorkingHoursSchedule = {} as WorkingHoursSchedule;
    
    // Проходим по каждому дню недели
    DAYS_OF_WEEK.forEach(day => {
      const hours = servicePoint.working_hours[day.key];
      if (hours) {
        normalized[day.key] = {
          start: hours.start || '09:00',
          end: hours.end || '18:00',
          is_working_day: hours.is_working_day === true || (hours.is_working_day as any) === 'true'
        };
      } else {
        normalized[day.key] = {
          start: '09:00',
          end: '18:00',
          is_working_day: false
        };
      }
    });

    return normalized;
  }, [servicePoint?.working_hours, isEditMode]);

  // Начальные значения формы (мемоизированные)
  const initialValues: ServicePointFormDataNew = useMemo(() => ({
    name: servicePoint?.name || '',
    partner_id: servicePoint?.partner_id || (partnerId ? Number(partnerId) : 0),
    city_id: servicePoint?.city?.id || 0,
    address: servicePoint?.address || '',
    contact_phone: servicePoint?.contact_phone || '',
    description: servicePoint?.description || '',
    latitude: servicePoint?.latitude || null,
    longitude: servicePoint?.longitude || null,
    is_active: servicePoint?.is_active ?? true,
    work_status: servicePoint?.work_status || 'working',
    working_hours: normalizedWorkingHours,
    services: servicePoint?.services || [],
    photos: servicePoint?.photos || [],
    service_posts: servicePoint?.service_posts || [],
  }), [servicePoint, partnerId, normalizedWorkingHours]); // Правильные зависимости

  // Отладка загруженных данных
  useEffect(() => {
    if (servicePoint && isEditMode) {
      console.log('=== Загруженные данные сервисной точки ===');
      console.log('servicePoint:', servicePoint);
      console.log('service_posts:', servicePoint.service_posts);
      if (servicePoint.service_posts) {
        servicePoint.service_posts.forEach((post, index) => {
          console.log(`Post ${index + 1}:`, {
            id: post.id,
            name: post.name,
            has_custom_schedule: post.has_custom_schedule,
            working_days: post.working_days,
            custom_hours: post.custom_hours
          });
        });
      }
    }
  }, [servicePoint, isEditMode]);

  // Formik
  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values: ServicePointFormDataNew) => {
      try {
        // Подготавливаем данные для отправки
        const servicePointData = {
          name: values.name,
          partner_id: values.partner_id,
          city_id: values.city_id,
          address: values.address,
          contact_phone: values.contact_phone,
          description: values.description,
          latitude: values.latitude,
          longitude: values.longitude,
          is_active: values.is_active,
          work_status: values.work_status,
          working_hours: values.working_hours,
          service_posts_attributes: (values.service_posts || []).map(post => ({
            id: post.id && typeof post.id === 'number' && post.id > 0 && post.id < 1000000000 ? post.id : undefined,
            name: post.name,
            description: post.description || '',
            slot_duration: post.slot_duration,
            is_active: post.is_active,
            post_number: post.post_number,
            _destroy: post._destroy || false,
            has_custom_schedule: post.has_custom_schedule || false,
            working_days: post.has_custom_schedule ? post.working_days : undefined,
            custom_hours: post.has_custom_schedule ? post.custom_hours : undefined,
          })),
          services_attributes: (values.services || []).map(service => ({
            id: service.id && typeof service.id === 'number' && service.id > 0 ? service.id : undefined,
            service_id: service.service_id,
            price: service.price,
            duration: service.duration,
            is_available: service.is_available,
            _destroy: service._destroy || false,
          })),
          photos_attributes: (values.photos || []).map(photo => ({
            id: photo.id && typeof photo.id === 'number' && photo.id > 0 ? photo.id : undefined,
            description: photo.description || '',
            is_main: photo.is_main,
            sort_order: photo.sort_order || 0,
            _destroy: (photo as any)._destroy || false,
            file: (photo as any).file instanceof File ? (photo as any).file : undefined,
          })),
        };

        console.log('=== Подготовленные данные servicePointData ===');
        console.log('servicePointData:', servicePointData);
        console.log('service_posts_attributes:', servicePointData.service_posts_attributes);
        
        // Проверяем каждый пост отдельно
        servicePointData.service_posts_attributes.forEach((post, index) => {
          console.log(`Пост ${index}:`, {
            name: post.name,
            has_custom_schedule: post.has_custom_schedule,
            working_days: post.working_days,
            custom_hours: post.custom_hours,
            working_days_count: post.working_days ? Object.values(post.working_days).filter(Boolean).length : 0
          });
        });

        // Создаем FormData для отправки файлов
        const formData = new FormData();
        
        // Добавляем основные поля напрямую в FormData (не как JSON)
        formData.append('service_point[name]', servicePointData.name);
        formData.append('service_point[description]', servicePointData.description || '');
        formData.append('service_point[address]', servicePointData.address);
        formData.append('service_point[city_id]', servicePointData.city_id.toString());
        formData.append('service_point[partner_id]', servicePointData.partner_id.toString());
        formData.append('service_point[contact_phone]', servicePointData.contact_phone);
        formData.append('service_point[is_active]', servicePointData.is_active.toString());
        formData.append('service_point[work_status]', servicePointData.work_status);
        
        if (servicePointData.latitude) {
          formData.append('service_point[latitude]', servicePointData.latitude.toString());
        }
        if (servicePointData.longitude) {
          formData.append('service_point[longitude]', servicePointData.longitude.toString());
        }
        
        // Добавляем расписание работы
        Object.entries(servicePointData.working_hours).forEach(([day, hours]) => {
          const workingHours = hours as WorkingHours;
          formData.append(`service_point[working_hours][${day}][start]`, workingHours.start);
          formData.append(`service_point[working_hours][${day}][end]`, workingHours.end);
          formData.append(`service_point[working_hours][${day}][is_working_day]`, workingHours.is_working_day.toString());
        });
        
        // Добавляем посты обслуживания
        servicePointData.service_posts_attributes.forEach((post: any, index: number) => {
          formData.append(`service_point[service_posts_attributes][${index}][name]`, post.name);
          formData.append(`service_point[service_posts_attributes][${index}][description]`, post.description || '');
          formData.append(`service_point[service_posts_attributes][${index}][slot_duration]`, post.slot_duration.toString());
          formData.append(`service_point[service_posts_attributes][${index}][is_active]`, post.is_active.toString());
          formData.append(`service_point[service_posts_attributes][${index}][post_number]`, post.post_number.toString());
          formData.append(`service_point[service_posts_attributes][${index}][_destroy]`, post._destroy.toString());
          
          // Добавляем поля индивидуального расписания
          formData.append(`service_point[service_posts_attributes][${index}][has_custom_schedule]`, (post.has_custom_schedule || false).toString());
          
          // Отправляем working_days и custom_hours только если включено индивидуальное расписание
          if (post.has_custom_schedule && post.working_days) {
            // Проверяем что есть хотя бы один рабочий день
            const hasWorkingDays = Object.values(post.working_days).some((isWorking: any) => isWorking === true);
            
            if (hasWorkingDays) {
              Object.entries(post.working_days).forEach(([day, isWorking]) => {
                formData.append(`service_point[service_posts_attributes][${index}][working_days][${day}]`, (isWorking as boolean).toString());
              });
            } else {
              // Если нет рабочих дней, отключаем индивидуальное расписание
              formData.set(`service_point[service_posts_attributes][${index}][has_custom_schedule]`, 'false');
              console.warn(`Пост ${post.name}: отключено индивидуальное расписание из-за отсутствия рабочих дней`);
            }
          }
          
          if (post.has_custom_schedule && post.custom_hours) {
            formData.append(`service_point[service_posts_attributes][${index}][custom_hours][start]`, post.custom_hours.start);
            formData.append(`service_point[service_posts_attributes][${index}][custom_hours][end]`, post.custom_hours.end);
          }
          
          if (post.id && typeof post.id === 'number' && post.id > 0 && post.id < 1000000000) {
            formData.append(`service_point[service_posts_attributes][${index}][id]`, post.id.toString());
          }
        });

        // Добавляем существующие услуги в FormData
        if (values.services && values.services.length > 0) {
          values.services.forEach((service, index) => {
            formData.append(`service_point[services_attributes][${index}][service_id]`, service.service_id.toString());
            formData.append(`service_point[services_attributes][${index}][price]`, service.price.toString());
            formData.append(`service_point[services_attributes][${index}][duration]`, service.duration.toString());
            formData.append(`service_point[services_attributes][${index}][is_available]`, service.is_available.toString());
            formData.append(`service_point[services_attributes][${index}][_destroy]`, (service._destroy || false).toString());
            
            if (service.id && typeof service.id === 'number' && service.id > 0) {
              formData.append(`service_point[services_attributes][${index}][id]`, service.id.toString());
            }
          });
        }

        // Добавляем фотографии в FormData
        if (values.photos && values.photos.length > 0) {
          values.photos.forEach((photo, index) => {
            // Если фотография имеет реальный ID (существует в БД), добавляем его
            if (photo.id && typeof photo.id === 'number' && photo.id > 0) {
              formData.append(`service_point[photos_attributes][${index}][id]`, photo.id.toString());
              formData.append(`service_point[photos_attributes][${index}][description]`, photo.description || '');
              formData.append(`service_point[photos_attributes][${index}][is_main]`, photo.is_main.toString());
              formData.append(`service_point[photos_attributes][${index}][sort_order]`, (photo.sort_order || 0).toString());
              formData.append(`service_point[photos_attributes][${index}][_destroy]`, ((photo as any)._destroy || false).toString());
            } else if ((photo as any).file && (photo as any).file instanceof File) {
              // Для новых фотографий отправляем файл и метаданные
              formData.append(`service_point[photos_attributes][${index}][file]`, (photo as any).file);
              formData.append(`service_point[photos_attributes][${index}][description]`, photo.description || '');
              formData.append(`service_point[photos_attributes][${index}][is_main]`, photo.is_main.toString());
              formData.append(`service_point[photos_attributes][${index}][sort_order]`, (photo.sort_order || 0).toString());
            }
          });
        }

        // Отладочная информация
        console.log('=== Отправляемые данные ===');
        console.log('servicePointData object:', servicePointData);
        console.log('FormData содержимое:');
        // Используем более совместимый способ итерации FormData
        const entries: string[] = [];
        formData.forEach((value, key) => {
          entries.push(`${key}: ${value instanceof File ? `[File: ${value.name}]` : value}`);
        });
        console.log(entries.join('\n'));

        if (isEditMode && id) {
          await updateServicePoint({
            id,
            servicePoint: formData
          }).unwrap();
          setSuccessMessage('Точка обслуживания успешно обновлена');
        } else {
          await createServicePoint({
            partnerId: partnerId || '1', // fallback на партнера с ID 1
            servicePoint: formData
          }).unwrap();
          setSuccessMessage('Точка обслуживания успешно создана');
        }

        setTimeout(() => {
          navigate(partnerId ? `/partners/${partnerId}/service-points` : '/service-points');
        }, 1000);
      } catch (error: any) {
        console.error('Ошибка при сохранении:', error);
        setErrorMessage(error?.data?.message || 'Ошибка при сохранении точки обслуживания');
      }
    },
  });

  // Автоматически добавляем первый пост при создании новой сервисной точки
  useEffect(() => {
    if (!isEditMode && (!formik.values.service_posts || formik.values.service_posts.length === 0)) {
      const defaultPost = {
        id: Date.now(),
        post_number: 1,
        name: 'Пост 1',
        description: '',
        slot_duration: 30,
        is_active: true,
      };
      formik.setFieldValue('service_posts', [defaultPost]);
    }
  }, [isEditMode, formik.values.service_posts?.length]); // Добавляем зависимость чтобы избежать повторных вызовов

  // Инициализируем форму данными с сервера при первой загрузке
  useEffect(() => {
    if (isEditMode && servicePoint && !formik.dirty) {
      console.log('=== Инициализация формы данными с сервера ===');
      console.log('servicePoint данные:', servicePoint);
      
      // Обновляем все поля формы
      formik.setValues({
        name: servicePoint.name || '',
        partner_id: servicePoint.partner_id || (partnerId ? Number(partnerId) : 0),
        city_id: servicePoint.city?.id || 0,
        address: servicePoint.address || '',
        contact_phone: servicePoint.contact_phone || '',
        description: servicePoint.description || '',
        latitude: servicePoint.latitude || null,
        longitude: servicePoint.longitude || null,
        is_active: servicePoint.is_active ?? true,
        work_status: servicePoint.work_status || 'working',
        working_hours: normalizedWorkingHours,
        services: servicePoint.services || [],
        photos: servicePoint.photos || [],
        service_posts: servicePoint.service_posts || [],
      });
    }
  }, [servicePoint?.id, isEditMode]); // Выполняем только при изменении ID точки

  // Обработчики
  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleGoBack = () => {
    navigate(partnerId ? `/partners/${partnerId}/service-points` : '/service-points');
  };

  const handleStepClick = (stepIndex: number) => {
    setActiveStep(stepIndex);
    
    // Автопрокрутка к выбранному чипу в мобильной версии
    if (chipContainerRef.current && (isMediumMobile || isTablet)) {
      const container = chipContainerRef.current;
      const chips = container.querySelectorAll('[data-chip-index]');
      const targetChip = chips[stepIndex] as HTMLElement;
      
      if (targetChip) {
        const containerRect = container.getBoundingClientRect();
        const chipRect = targetChip.getBoundingClientRect();
        
        // Вычисляем позицию для прокрутки так, чтобы выбранный чип и следующий были видны
        const chipWidth = chipRect.width;
        const gap = 8; // Размер gap между чипами
        const padding = 16; // Отступ от края
        
        // Позиция для центрирования текущего чипа с учетом следующего
        const scrollPosition = targetChip.offsetLeft - padding - (chipWidth + gap);
        
        container.scrollTo({
          left: Math.max(0, scrollPosition),
          behavior: 'smooth'
        });
      }
    }
  };

  // Функции для проверки заполненности разделов
  const isBasicInfoComplete = () => {
    return formik.values.name.trim().length > 0 && 
           formik.values.partner_id > 0;
  };

  const isLocationComplete = () => {
    return formik.values.city_id > 0 && 
           formik.values.address.trim().length > 0;
  };

  const isContactComplete = () => {
    return formik.values.contact_phone.trim().length > 0;
  };

  const isSettingsComplete = () => {
    return formik.values.work_status.length > 0;
  };

  const isScheduleComplete = () => {
    return Object.values(formik.values.working_hours).some(hours => hours.is_working_day);
  };

  const isPostsComplete = () => {
    const activePosts = formik.values.service_posts?.filter(post => !post._destroy) || [];
    return activePosts.length > 0 && activePosts.every(post => 
      post.name.trim().length > 0 && post.slot_duration > 0
    );
  };

  const isServicesComplete = () => {
    const activeServices = formik.values.services?.filter(service => !service._destroy) || [];
    // Услуги не обязательны, но если добавлены, должны быть правильно заполнены
    return activeServices.every(service => 
      service.service_id > 0 && service.price >= 0 && service.duration > 0
    );
  };

  const isPhotosComplete = () => {
    // Фотографии не обязательны
    return true;
  };

  // Проверка валидности текущего шага
  const isStepValid = (stepIndex: number): boolean => {
    const step = FORM_STEPS[stepIndex];
    switch (step.id) {
      case 'basic':
        return isBasicInfoComplete();
      case 'location':
        return isLocationComplete();
      case 'contact':
        return isContactComplete();
      case 'settings':
        return isSettingsComplete();
      case 'posts':
        return isPostsComplete();
      case 'services':
        return isServicesComplete();
      case 'photos':
        return isPhotosComplete();
      case 'schedule':
        return isScheduleComplete();
      default:
        return true;
    }
  };

  // Получение компонента текущего шага
  const getCurrentStepComponent = () => {
    const StepComponent = FORM_STEPS[activeStep].component;
    return (
      <StepComponent
        formik={formik}
        isEditMode={isEditMode}
        servicePoint={servicePoint}
      />
    );
  };

  // Адаптивный рендер степпера
  const renderAdaptiveStepper = () => {
    // Определяем какую версию степпера показывать
    // Мобильную версию показываем для экранов меньше 1200px (lg)
    const shouldUseMobileVersion = isTablet; // < 1200px
    
    if (shouldUseMobileVersion) {
      // Мобильная/планшетная версия - компактный индикатор прогресса
      return (
        <Box sx={{ mb: 3 }}>
          {/* Компактный индикатор прогресса */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 2,
            p: isVerySmallMobile ? 1.5 : 2,
            backgroundColor: theme.palette.background.default,
            borderRadius: SIZES.borderRadius.md,
            border: `1px solid ${theme.palette.divider}`,
          }}>
            <Typography variant="body2" sx={{ 
              color: theme.palette.text.secondary,
              fontSize: isVerySmallMobile ? SIZES.fontSize.xs : SIZES.fontSize.sm,
              mr: 1,
              flexShrink: 0, // Не сжимаем текст
            }}>
              Шаг {activeStep + 1} из {FORM_STEPS.length}:
            </Typography>
            <Typography variant="subtitle2" sx={{ 
              fontWeight: 600,
              fontSize: isVerySmallMobile ? SIZES.fontSize.sm : SIZES.fontSize.md,
              color: theme.palette.primary.main,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {FORM_STEPS[activeStep].label}
            </Typography>
          </Box>

          {/* Прогресс-бар */}
          <Box sx={{ 
            width: '100%', 
            height: isVerySmallMobile ? 3 : 4, 
            backgroundColor: theme.palette.divider,
            borderRadius: 2,
            mb: 2,
            overflow: 'hidden',
          }}>
            <Box sx={{
              width: `${((activeStep + 1) / FORM_STEPS.length) * 100}%`,
              height: '100%',
              backgroundColor: theme.palette.primary.main,
              borderRadius: 2,
              transition: theme.transitions.create('width', {
                duration: theme.transitions.duration.standard,
              }),
            }} />
          </Box>

          {/* Мини-навигация по шагам */}
          <Box sx={{
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              right: 0,
              width: 20,
              height: '100%',
              background: `linear-gradient(to left, ${theme.palette.background.paper}, transparent)`,
              pointerEvents: 'none',
              zIndex: 1,
            },
          }}>
            <Stack direction="row" spacing={1} sx={{ 
              overflowX: 'auto',
              pb: 1,
              pr: 3, // Увеличиваем отступ справа
              pl: 0.5, // Небольшой отступ слева
              '&::-webkit-scrollbar': {
                height: 3,
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.3)' 
                  : 'rgba(0, 0, 0, 0.3)',
                borderRadius: 2,
              },
            }}
            ref={chipContainerRef}
            >
              {FORM_STEPS.map((step, index) => (
                <Chip
                  key={step.id}
                  label={isVerySmallMobile ? `${index + 1}` : 
                    (step.label.length > 8 ? `${step.label.substring(0, 8)}...` : step.label)}
                  onClick={() => handleStepClick(index)}
                  color={index === activeStep ? 'primary' : 'default'}
                  variant={index === activeStep ? 'filled' : 'outlined'}
                  size={isVerySmallMobile ? 'small' : 'medium'}
                  icon={isStepValid(index) && index < activeStep ? <CheckCircleIcon /> : undefined}
                  data-chip-index={index}
                  sx={{
                    minWidth: isVerySmallMobile ? 36 : 48,
                    fontSize: isVerySmallMobile ? SIZES.fontSize.xs : SIZES.fontSize.sm,
                    cursor: 'pointer',
                    flexShrink: 0, // Не сжимаем чипы
                    transition: theme.transitions.create(['background-color', 'transform', 'box-shadow'], {
                      duration: theme.transitions.duration.short,
                    }),
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: theme.shadows[2],
                    },
                    // Особые стили для активного и завершенных шагов
                    ...(index === activeStep && {
                      boxShadow: theme.shadows[3],
                      fontWeight: 600,
                    }),
                    ...(isStepValid(index) && index < activeStep && {
                      backgroundColor: theme.palette.success.light,
                      color: theme.palette.success.contrastText,
                    }),
                  }}
                />
              ))}
            </Stack>
          </Box>
        </Box>
      );
    } else {
      // Десктопная версия - горизонтальный степпер с улучшенной адаптивностью
      return (
        <Stepper 
          activeStep={activeStep} 
          sx={{ 
            mb: 4,
            '& .MuiStepLabel-root': {
              cursor: 'pointer',
            },
            '& .MuiStepLabel-label': {
              fontSize: SIZES.fontSize.md,
              fontWeight: 500,
              transition: theme.transitions.create('color', {
                duration: theme.transitions.duration.short,
              }),
            },
            '& .MuiStep-root': {
              transition: theme.transitions.create('transform', {
                duration: theme.transitions.duration.short,
              }),
              '&:hover': {
                transform: 'translateY(-1px)',
              },
              // Адаптивная ширина шагов
              flex: '1 1 auto',
              minWidth: 0,
            },
            '& .MuiStepLabel-labelContainer': {
              overflow: 'visible', // Показываем полный текст
            },
            '& .MuiStepIcon-root': {
              fontSize: '1.5rem',
            },
          }}
        >
          {FORM_STEPS.map((step, index) => (
            <Step 
              key={step.id} 
              completed={index < activeStep || isStepValid(index)}
              onClick={() => handleStepClick(index)}
            >
              <StepLabel 
                error={index <= activeStep && !isStepValid(index)}
                sx={{
                  '& .MuiStepLabel-labelContainer': {
                    width: '100%',
                    overflow: 'visible',
                  },
                  '& .MuiStepLabel-label': {
                    // Делаем текст адаптивным
                    fontSize: SIZES.fontSize.sm,
                    lineHeight: 1.2,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '100%',
                  },
                }}
              >
                {step.label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      );
    }
  };

  const isLastStep = activeStep === FORM_STEPS.length - 1;
  const isFirstStep = activeStep === 0;

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        Загрузка...
      </Box>
    );
  }

  return (
    <Box sx={{ 
      padding: isMobile ? 1.5 : 3,
      paddingRight: isMobile ? 2 : 3, // Увеличиваем отступ справа на мобильных
      maxWidth: '100%',
      overflow: 'hidden',
    }}>
      {/* Адаптивный заголовок */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between', 
        alignItems: isMobile ? 'flex-start' : 'center', 
        mb: isMobile ? 2.5 : 3,
        gap: isMobile ? 1.5 : 0,
        pr: isMobile ? 1 : 0, // Добавляем отступ справа на мобильных
      }}>
        <Typography 
          variant={isMobile ? "h5" : "h4"}
          sx={{
            fontSize: isMobile ? SIZES.fontSize.xl : '32px',
            fontWeight: 600,
            color: theme.palette.text.primary,
            lineHeight: 1.2,
            maxWidth: isMobile ? '100%' : '70%', // Ограничиваем ширину заголовка
          }}
        >
          {isEditMode ? 'Редактирование точки обслуживания' : 'Создание точки обслуживания'}
        </Typography>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={handleGoBack}
          variant={isMobile ? 'outlined' : 'text'}
          size={isMobile ? 'medium' : 'large'}
          sx={{
            ...getButtonStyles(theme, 'secondary'),
            minWidth: isMobile ? '100%' : 'auto',
            justifyContent: isMobile ? 'center' : 'flex-start',
            px: isMobile ? 2.5 : 2, // Увеличиваем padding
            flexShrink: 0, // Не сжимаем кнопку
          }}
        >
          Назад к списку
        </Button>
      </Box>

      <Paper sx={{ 
        ...getCardStyles(theme),
        p: isMobile ? 1.5 : 3,
        pr: isMobile ? 2 : 3, // Увеличиваем отступ справа
        borderRadius: SIZES.borderRadius.lg,
      }}>
        {renderAdaptiveStepper()}

        {/* Содержимое шага */}
        <form onSubmit={formik.handleSubmit}>
          <Box sx={{ 
            minHeight: isMobile ? 'auto' : 400, 
            mb: 3,
            // Для мобильных устройств убираем фиксированную высоту
            // чтобы контент естественно растягивался
          }}>
            {getCurrentStepComponent()}
          </Box>

          {/* Адаптивная навигация */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            gap: isMobile ? 2.5 : 2, // Увеличиваем gap между кнопками
            alignItems: isMobile ? 'stretch' : 'center',
            mt: 4, // Увеличиваем отступ сверху
            pt: 2, // Добавляем внутренний отступ сверху
            borderTop: `1px solid ${theme.palette.divider}`, // Добавляем разделитель
            pl: isMobile ? 0 : 0, // Убираем отступ слева
            pr: isMobile ? 0 : 0, // Убираем отступ справа
          }}>
            <Button
              onClick={handleBack}
              disabled={isFirstStep}
              variant={isMobile ? 'outlined' : 'text'}
              size={isMobile ? 'large' : 'medium'}
              sx={{
                ...getButtonStyles(theme, 'secondary'),
                order: isMobile ? 2 : 1,
                minHeight: isMobile ? 48 : 42,
                px: isMobile ? 3 : 2, // Уменьшаем горизонтальный padding
                mr: isMobile ? 0 : 3, // Увеличиваем отступ справа на десктопе
                minWidth: isMobile ? '100%' : 100,
                // Уменьшаем отступ слева на мобильных
                ml: isMobile ? 0 : 0,
              }}
            >
              Назад
            </Button>

            <Box sx={{ 
              display: 'flex', 
              gap: isMobile ? 2 : 2.5, // Увеличиваем gap между кнопками
              order: isMobile ? 1 : 2,
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: isMobile ? 'stretch' : 'center',
              // Убираем отступы по краям
              ml: isMobile ? 0 : 0,
              mr: isMobile ? 0 : 0,
            }}>
              {!isLastStep ? (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={!isStepValid(activeStep)}
                  size={isMobile ? 'large' : 'medium'}
                  sx={{
                    ...getButtonStyles(theme, 'primary'),
                    minHeight: isMobile ? 48 : 42,
                    minWidth: isMobile ? '100%' : 140,
                    px: isMobile ? 3 : 2.5, // Уменьшаем горизонтальный padding
                    mr: isMobile ? 0 : 1, // Уменьшаем отступ справа
                  }}
                >
                  Далее
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  disabled={formik.isSubmitting || !formik.isValid}
                  size={isMobile ? 'large' : 'medium'}
                  sx={{
                    ...getButtonStyles(theme, 'primary'),
                    minHeight: isMobile ? 48 : 42,
                    minWidth: isMobile ? '100%' : 160,
                    px: isMobile ? 3 : 2.5, // Уменьшаем горизонтальный padding
                    mr: isMobile ? 0 : 1, // Уменьшаем отступ справа
                  }}
                >
                  {formik.isSubmitting ? 'Сохранение...' : 'Сохранить'}
                </Button>
              )}
            </Box>
          </Box>
        </form>
      </Paper>

      {/* Адаптивные уведомления */}
      <Snackbar
        open={Boolean(successMessage)}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{ 
          vertical: isMobile ? 'bottom' : 'top', 
          horizontal: 'center' 
        }}
        sx={{
          '& .MuiAlert-root': {
            width: isMobile ? '90vw' : 'auto',
            maxWidth: isMobile ? 400 : 600,
            fontSize: SIZES.fontSize.md,
          },
        }}
      >
        <Alert 
          severity="success" 
          onClose={() => setSuccessMessage(null)}
          sx={{
            borderRadius: SIZES.borderRadius.md,
          }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
      
      <Snackbar
        open={Boolean(errorMessage)}
        autoHideDuration={5000}
        onClose={() => setErrorMessage(null)}
        anchorOrigin={{ 
          vertical: isMobile ? 'bottom' : 'top', 
          horizontal: 'center' 
        }}
        sx={{
          '& .MuiAlert-root': {
            width: isMobile ? '90vw' : 'auto',
            maxWidth: isMobile ? 400 : 600,
            fontSize: SIZES.fontSize.md,
          },
        }}
      >
        <Alert 
          severity="error" 
          onClose={() => setErrorMessage(null)}
          sx={{
            borderRadius: SIZES.borderRadius.md,
          }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ServicePointFormPageNew; 