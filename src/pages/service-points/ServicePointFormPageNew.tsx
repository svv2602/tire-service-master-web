import React, { useState, useEffect, useMemo } from 'react';
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
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Save as SaveIcon } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';

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
  
  // Состояние
  const [activeStep, setActiveStep] = useState(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // API хуки
  const { data: servicePoint, isLoading } = useGetServicePointByIdQuery(
    { partner_id: Number(partnerId) || 0, id: id ?? '' },
    { skip: !isEditMode || !id || !partnerId }
  );
  
  const [createServicePoint, { isLoading: isCreating }] = useCreateServicePointMutation();
  const [updateServicePoint, { isLoading: isUpdating }] = useUpdateServicePointMutation();

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
    working_hours: isEditMode && servicePoint?.working_hours ? servicePoint.working_hours : emptyWorkingHours,
    services: servicePoint?.services || [],
    photos: servicePoint?.photos || [],
    service_posts: servicePoint?.service_posts || [],
  }), [servicePoint?.id, isEditMode]); // Пересчитываем только при изменении ID точки или режима

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
        const servicePointData: any = {
          name: values.name,
          description: values.description,
          address: values.address,
          city_id: values.city_id,
          partner_id: values.partner_id,
          latitude: values.latitude,
          longitude: values.longitude,
          contact_phone: values.contact_phone,
          is_active: values.is_active,
          work_status: values.work_status,
          working_hours: values.working_hours,
          service_posts_attributes: values.service_posts?.map(post => {
            const postData: any = {
              name: post.name,
              description: post.description,
              slot_duration: post.slot_duration,
              is_active: post.is_active,
              post_number: post.post_number,
              _destroy: post._destroy || false,
              has_custom_schedule: post.has_custom_schedule || false,
              working_days: post.working_days || null,
              custom_hours: post.custom_hours || null
            };
            
            // Если пост имеет реальный ID (существует в БД), добавляем его
            if (post.id && typeof post.id === 'number' && post.id > 0 && post.id < 1000000000) {
              postData.id = post.id;
            }
            
            return postData;
          }) || []
        };

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
          
          if (post.has_custom_schedule && post.working_days) {
            Object.entries(post.working_days).forEach(([day, isWorking]) => {
              formData.append(`service_point[service_posts_attributes][${index}][working_days][${day}]`, (isWorking as boolean).toString());
            });
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
            partnerId: partnerId || values.partner_id.toString(),
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
  }, [isEditMode]);

  // Загружаем существующие посты при редактировании
  useEffect(() => {
    console.log('=== useEffect для загрузки постов ===');
    console.log('isEditMode:', isEditMode);
    console.log('servicePoint?.service_posts?.length:', servicePoint?.service_posts?.length);
    console.log('formik.values.service_posts?.length:', formik.values.service_posts?.length);
    
    if (isEditMode && servicePoint?.service_posts && servicePoint.service_posts.length > 0) {
      // Проверяем, что посты еще не загружены в форму
      const currentPosts = formik.values.service_posts || [];
      
      // Загружаем посты только если форма пустая или если изменился состав постов (добавлены/удалены)
      const shouldLoadPosts = currentPosts.length === 0 || 
                             currentPosts.length !== servicePoint.service_posts.length ||
                             !currentPosts.every(post => servicePoint.service_posts?.some(sp => sp.id === post.id));
      
      console.log('shouldLoadPosts:', shouldLoadPosts);
      console.log('currentPosts.length:', currentPosts.length);
      console.log('servicePoint.service_posts.length:', servicePoint.service_posts.length);
      
      if (shouldLoadPosts) {
        console.log('=== Загружаем посты из API ===');
        console.log('servicePoint.service_posts:', servicePoint.service_posts);
        formik.setFieldValue('service_posts', servicePoint.service_posts);
      } else {
        console.log('=== Посты уже загружены, пропускаем перезагрузку ===');
      }
    }
  }, [isEditMode, servicePoint?.service_posts?.length]); // Убираем servicePoint?.service_posts из зависимостей

  // Загружаем существующие услуги при редактировании
  useEffect(() => {
    if (isEditMode && servicePoint?.services && servicePoint.services.length > 0) {
      // Проверяем, что услуги еще не загружены в форму
      const currentServices = formik.values.services || [];
      if (currentServices.length === 0 || currentServices[0]?.service_id !== servicePoint.services[0]?.service_id) {
        formik.setFieldValue('services', servicePoint.services);
      }
    }
  }, [isEditMode, servicePoint?.services]);

  // Загружаем существующие фотографии при редактировании
  useEffect(() => {
    if (isEditMode && servicePoint?.photos && servicePoint.photos.length > 0) {
      // Проверяем, что фотографии еще не загружены в форму
      const currentPhotos = formik.values.photos || [];
      if (currentPhotos.length === 0 || currentPhotos[0]?.id !== servicePoint.photos[0]?.id) {
        formik.setFieldValue('photos', servicePoint.photos);
      }
    }
  }, [isEditMode, servicePoint?.photos]);

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
    <Box>
      {/* Заголовок */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          {isEditMode ? 'Редактирование точки обслуживания' : 'Создание точки обслуживания'}
        </Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={handleGoBack}>
          Назад к списку
        </Button>
      </Box>

      <Paper sx={{ p: 3 }}>
        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {FORM_STEPS.map((step, index) => (
            <Step 
              key={step.id} 
              completed={index < activeStep || isStepValid(index)}
              onClick={() => handleStepClick(index)}
              sx={{ cursor: 'pointer' }}
            >
              <StepLabel 
                error={index <= activeStep && !isStepValid(index)}
              >
                {step.label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Содержимое шага */}
        <form onSubmit={formik.handleSubmit}>
          <Box sx={{ minHeight: 400, mb: 3 }}>
            {getCurrentStepComponent()}
          </Box>

          {/* Навигация */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              onClick={handleBack}
              disabled={isFirstStep}
            >
              Назад
            </Button>

            <Box sx={{ display: 'flex', gap: 2 }}>
              {!isLastStep ? (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={!isStepValid(activeStep)}
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
                >
                  {formik.isSubmitting ? 'Сохранение...' : 'Сохранить'}
                </Button>
              )}
            </Box>
          </Box>
        </form>
      </Paper>

      {/* Уведомления */}
      <Snackbar
        open={Boolean(successMessage)}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      </Snackbar>
      
      <Snackbar
        open={Boolean(errorMessage)}
        autoHideDuration={5000}
        onClose={() => setErrorMessage(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setErrorMessage(null)}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ServicePointFormPageNew; 