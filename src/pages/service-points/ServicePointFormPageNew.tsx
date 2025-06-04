import React, { useState, useEffect } from 'react';
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
  { id: 'settings', label: 'Настройки', component: SettingsStep },
  { id: 'posts', label: 'Посты обслуживания', component: PostsStep },
  { id: 'services', label: 'Услуги', component: ServicesStep },
  { id: 'photos', label: 'Фотографии', component: PhotosStep },
  { id: 'schedule', label: 'Расписание', component: ScheduleStep },
];

// Начальное расписание
const defaultWorkingHours: WorkingHoursSchedule = DAYS_OF_WEEK.reduce<WorkingHoursSchedule>((acc, day) => {
  const workingHours: WorkingHours = {
    start: '09:00',
    end: '18:00',
    is_working_day: day.id < 6
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

  // Начальные значения формы
  const initialValues: ServicePointFormDataNew = {
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
    working_hours: servicePoint?.working_hours || defaultWorkingHours,
    services: servicePoint?.services || [],
    photos: servicePoint?.photos || [],
    service_posts: servicePoint?.service_posts || [],
  };

  // Formik
  const formik = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        const servicePointData = {
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
          services_attributes: values.services?.map(service => {
            const serviceData: any = {
              service_id: service.service_id,
              price: service.price,
              duration: service.duration,
              is_available: service.is_available,
              _destroy: service._destroy || false
            };
            
            // Если услуга имеет реальный ID (существует в БД), добавляем его
            if ((service as any).id && typeof (service as any).id === 'number' && (service as any).id > 0) {
              serviceData.id = (service as any).id;
            }
            
            return serviceData;
          }) || [],
          service_posts_attributes: values.service_posts?.map(post => {
            const postData: any = {
              name: post.name,
              description: post.description,
              slot_duration: post.slot_duration,
              is_active: post.is_active,
              post_number: post.post_number,
              _destroy: post._destroy || false
            };
            
            // Если пост имеет реальный ID (существует в БД), добавляем его
            if (post.id && typeof post.id === 'number' && post.id > 0 && post.id < 1000000000) {
              postData.id = post.id;
            }
            
            return postData;
          }) || []
        };

        // Отладочная информация
        console.log('=== Отправляемые данные ===');
        console.log('service_posts_attributes:', servicePointData.service_posts_attributes);
        console.log('Полные данные:', servicePointData);

        if (isEditMode && id) {
          await updateServicePoint({
            id,
            servicePoint: servicePointData
          }).unwrap();
          setSuccessMessage('Точка обслуживания успешно обновлена');
        } else {
          await createServicePoint({
            partnerId: partnerId || values.partner_id.toString(),
            servicePoint: servicePointData
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
    if (isEditMode && servicePoint?.service_posts && servicePoint.service_posts.length > 0) {
      // Проверяем, что посты еще не загружены в форму
      const currentPosts = formik.values.service_posts || [];
      if (currentPosts.length === 0 || currentPosts[0]?.id !== servicePoint.service_posts[0]?.id) {
        formik.setFieldValue('service_posts', servicePoint.service_posts);
      }
    }
  }, [isEditMode, servicePoint?.service_posts]);

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