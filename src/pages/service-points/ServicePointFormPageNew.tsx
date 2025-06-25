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
import { useSelector } from 'react-redux';

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
  useUploadServicePointPhotoMutation,
  useUploadServicePointPhotoV2Mutation,
} from '../../api/servicePoints.api';
import { useDeleteServicePointPhotoMutation } from '../../api/service-point-photos.api';
import { useInvalidateCache } from '../../api/baseApi';

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

// Схема валидации с Yup
const validationSchema = yup.object({
  name: yup
    .string()
    .required('Название обязательно')
    .min(2, 'Название должно быть не менее 2 символов'),
  description: yup
    .string()
    .required('Описание обязательно')
    .min(10, 'Описание должно быть не менее 10 символов'),
  contact_phone: phoneValidation,
  address: yup
    .string()
    .required('Адрес обязателен')
    .min(5, 'Адрес должен быть не менее 5 символов'),
  city_id: yup
    .number()
    .required('Город обязателен'),
  partner_id: yup
    .number()
    .required('Партнер обязателен'),
  is_active: yup
    .boolean()
});

const ServicePointFormPageNew: React.FC = () => {
  const { partnerId, id } = useParams<{ partnerId: string; id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  
  // Получаем токен из Redux state
  const authToken = useSelector((state: any) => state.auth?.accessToken);
  
  // Отладочная информация для проверки параметров URL
  console.log('=== URL параметры ===');
  console.log('partnerId:', partnerId, 'type:', typeof partnerId);
  console.log('id:', id, 'type:', typeof id);
  console.log('isEditMode:', isEditMode);
  console.log('partnerId as number:', partnerId ? Number(partnerId) : null);
  
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
  
  // Состояние для уведомлений и UI
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
  const [uploadServicePointPhoto] = useUploadServicePointPhotoMutation();
  const [uploadServicePointPhotoV2] = useUploadServicePointPhotoV2Mutation();
  const [deleteServicePointPhoto] = useDeleteServicePointPhotoMutation();
  const { invalidateTag, invalidateList } = useInvalidateCache();

  // Функция для прямой загрузки фотографий через fetch API
  const uploadPhotoDirectly = async (servicePointId: string, file: File, isMain: boolean = false, description?: string) => {
    const formData = new FormData();
    // ИСПРАВЛЕНО: бэкенд ожидает поле 'file', а не 'photo'
    formData.append('file', file);
    formData.append('is_main', isMain.toString());
    if (description) {
      formData.append('description', description);
    }
    
    if (!authToken) {
      throw new Error('Токен авторизации не найден');
    }
    
    const url = `http://localhost:8000/api/v1/service_points/${servicePointId}/photos`;
    console.log('=== Прямая загрузка фотографии ===');
    console.log('URL:', url);
    console.log('servicePointId:', servicePointId);
    console.log('file:', file);
    console.log('file.name:', file.name);
    console.log('file.size:', file.size);
    console.log('file.type:', file.type);
    console.log('isMain:', isMain);
    console.log('FormData содержимое:');
    // Исправляем итерацию для совместимости с TypeScript
    Array.from(formData.entries()).forEach(([key, value]) => {
      console.log('  ', key, ':', value);
    });
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
      body: formData,
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error('Ошибка загрузки фотографии:', response.status, errorData);
      throw new Error(`Ошибка загрузки фотографии: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('Фотография загружена успешно:', result);
    
    // ИНВАЛИДАЦИЯ КЭША RTK Query после успешной загрузки
    console.log('Инвалидируем кэш RTK Query для фотографий и сервисной точки');
    invalidateTag('ServicePointPhoto', servicePointId);
    invalidateTag('ServicePoint', servicePointId);
    invalidateList('ServicePointPhoto');
    
    return result;
  };

  // Проверяем корректность данных
  useEffect(() => {
    if (isEditMode && !partnerId) {
      console.error('ОШИБКА: Попытка редактирования сервисной точки без partnerId в URL');
      alert('Ошибка: Некорректный URL для редактирования сервисной точки');
      navigate('/service-points');
      return;
    }
    
    // Проверяем partnerId при создании новой сервисной точки
    if (!isEditMode && !partnerId) {
      console.error('ОШИБКА: Попытка создания сервисной точки без partnerId в URL');
      alert('Ошибка: Для создания сервисной точки необходимо указать партнера в URL. Перейдите в раздел "Партнеры" и создайте сервисную точку оттуда.');
      navigate('/partners');
      return;
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
  const initialValues: ServicePointFormDataNew = useMemo(() => {
    const partnerIdNumber = partnerId ? Number(partnerId) : 0;
    
    console.log('=== Инициализация формы ===');
    console.log('partnerId:', partnerId);
    console.log('partnerIdNumber:', partnerIdNumber);
    console.log('servicePoint?.partner_id:', servicePoint?.partner_id);
    
    if (partnerIdNumber === 0 && !isEditMode) {
      console.error('КРИТИЧЕСКАЯ ОШИБКА: partnerIdNumber равен 0 при создании новой сервисной точки');
      // В этом случае система должна была уже перенаправить пользователя
    }
    
    return {
      name: servicePoint?.name || '',
      partner_id: servicePoint?.partner_id || partnerIdNumber,
      city_id: servicePoint?.city?.id || 0,
      region_id: servicePoint?.city?.region_id || 0, // Добавляем region_id
      address: servicePoint?.address || '',
      contact_phone: servicePoint?.contact_phone || '',
      description: servicePoint?.description || '',
      latitude: servicePoint?.latitude || null,
      longitude: servicePoint?.longitude || null,
      is_active: servicePoint?.is_active ?? true,
      work_status: servicePoint?.work_status || 'working',
      working_hours: normalizedWorkingHours,
      services: servicePoint?.services || [],
      photos: (servicePoint?.photos || []).filter(photo => !(photo as any)._destroy),
      service_posts: servicePoint?.service_posts || [],
    };
  }, [servicePoint, partnerId, normalizedWorkingHours]); // Правильные зависимости

  // Отладка загруженных данных
  useEffect(() => {
    if (servicePoint && isEditMode) {
      console.log('=== Загруженные данные сервисной точки ===');
      console.log('servicePoint:', servicePoint);
      console.log('service_posts:', servicePoint?.service_posts);
      if (servicePoint?.service_posts) {
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

        if (isEditMode && id) {
          // Для обновления всегда используем JSON, не отправляем фотографии в основном запросе
          const { photos_attributes, ...updateData } = servicePointData;
          
          console.log('Отправляемые данные для обновления:', JSON.stringify({ servicePoint: updateData }, null, 2));
          
          await updateServicePoint({
            id,
            partnerId: String(updateData.partner_id),
            servicePoint: updateData
          }).unwrap();
          
          // После успешного обновления основных данных обрабатываем фотографии
          
          // 1. Сначала удаляем фотографии помеченные для удаления
          const photosToDelete = formik.values.photos?.filter(photo => 
            photo.id && photo.id > 0 && (photo as any)._destroy
          ) || [];
          
          console.log('=== Проверка фотографий для удаления ===');
          console.log('Фотографии для удаления:', photosToDelete.length);
          
          if (photosToDelete.length > 0) {
            console.log('Удаляем фотографии:', photosToDelete.length);
            for (const photo of photosToDelete) {
              try {
                console.log('Удаляем фотографию с ID:', photo.id);
                await deleteServicePointPhoto({
                  servicePointId: String(id),
                  photoId: String(photo.id)
                }).unwrap();
                console.log('Фотография удалена успешно:', photo.id);
                
                // ИНВАЛИДАЦИЯ КЭША RTK Query после успешного удаления
                console.log('Инвалидируем кэш RTK Query после удаления фотографии');
                invalidateTag('ServicePointPhoto', String(id));
                invalidateTag('ServicePoint', String(id));
                invalidateList('ServicePointPhoto');
              } catch (deleteError) {
                console.error('Ошибка удаления фотографии:', photo.id, deleteError);
              }
            }
          } else {
            console.log('Нет фотографий для удаления');
          }
          
          // 2. Затем загружаем новые фотографии
          const newPhotosToUpload = formik.values.photos?.filter(photo => 
            photo.id === 0 && (photo as any).file
          ) || [];
          
          console.log('=== Проверка новых фотографий для загрузки при обновлении ===');
          console.log('Общее количество фотографий в formik:', formik.values.photos?.length || 0);
          console.log('Фотографии с id === 0:', formik.values.photos?.filter(p => p.id === 0).length || 0);
          console.log('Фотографии с файлами:', formik.values.photos?.filter(p => (p as any).file).length || 0);
          console.log('Новые фотографии для загрузки:', newPhotosToUpload.length);
          
          // Отладочная информация о каждой фотографии
          formik.values.photos?.forEach((photo, index) => {
            console.log(`Фотография ${index}:`, {
              id: photo.id,
              hasFile: !!(photo as any).file,
              fileName: (photo as any).file?.name,
              isMain: photo.is_main,
              _destroy: (photo as any)._destroy
            });
          });
          
          if (newPhotosToUpload.length > 0) {
            console.log('Загружаем новые фотографии:', newPhotosToUpload.length);
            console.log('ID для загрузки фотографий:', id);
            console.log('Тип ID:', typeof id);
            
            if (!id) {
              console.error('ОШИБКА: ID не определен для загрузки фотографий');
              throw new Error('ID сервисной точки не определен для загрузки фотографий');
            }
            
            for (const photo of newPhotosToUpload) {
              try {
                console.log('=== Перед вызовом uploadServicePointPhoto ===');
                console.log('id parameter:', id);
                console.log('typeof id:', typeof id);
                console.log('String(id):', String(id));
                console.log('photo.file:', (photo as any).file);
                console.log('photo.is_main:', photo.is_main);
                
                // Попробуем прямую загрузку через fetch API
                await uploadPhotoDirectly(String(id), (photo as any).file, photo.is_main, photo.description);
                console.log('Фотография загружена успешно через fetch API:', (photo as any).file.name);
              } catch (photoError) {
                console.error('Ошибка загрузки фотографии:', (photo as any).file.name, photoError);
              }
            }
          } else {
            console.log('Нет новых фотографий для загрузки при обновлении');
          }
          
          setSuccessMessage('Точка обслуживания успешно обновлена');
        } else {
          // Проверяем, что partnerId корректно передан
          if (!partnerId) {
            throw new Error('КРИТИЧЕСКАЯ ОШИБКА: partnerId не определен при создании сервисной точки');
          }
          
          // Для создания исключаем фотографии И услуги, добавим их отдельно после создания
          const { photos_attributes, services_attributes, ...createData } = servicePointData;
          
          // Проверяем, что partner_id в данных соответствует partnerId из URL
          if (createData.partner_id !== Number(partnerId)) {
            console.warn(`Несоответствие partnerId: URL=${partnerId}, данные=${createData.partner_id}. Используем значение из URL.`);
            createData.partner_id = Number(partnerId);
          }
          
          console.log('=== Создание сервисной точки ===');
          console.log('partnerId:', partnerId);
          console.log('createData.partner_id:', createData.partner_id);
          console.log('Отправляемые данные для создания:', JSON.stringify({ servicePoint: createData }, null, 2));
          
          const result = await createServicePoint({
            partnerId: partnerId,
            servicePoint: createData
          }).unwrap();
          
          // После успешного создания добавляем услуги если они есть
          const servicesToAdd = formik.values.services?.filter(service => 
            !service._destroy && service.service_id > 0
          ) || [];
          
          if (servicesToAdd.length > 0 && result?.id) {
            console.log('Добавляем услуги для новой точки:', servicesToAdd.length);
            // TODO: Реализовать добавление услуг через отдельный API endpoint
            // Пока что просто логируем, что услуги нужно добавить
            console.log('Услуги для добавления:', servicesToAdd);
          }
          
          // После успешного создания загружаем фотографии
          const newPhotosToUpload = formik.values.photos?.filter(photo => 
            photo.id === 0 && (photo as any).file
          ) || [];
          
          if (newPhotosToUpload.length > 0 && result?.id) {
            console.log('Загружаем фотографии для новой точки:', newPhotosToUpload.length);
            for (const photo of newPhotosToUpload) {
              try {
                console.log('=== Перед вызовом uploadServicePointPhoto ===');
                console.log('id parameter:', result.id);
                console.log('typeof id:', typeof result.id);
                console.log('String(id):', String(result.id));
                console.log('photo.file:', (photo as any).file);
                console.log('photo.is_main:', photo.is_main);
                
                // Попробуем прямую загрузку через fetch API
                await uploadPhotoDirectly(String(result.id), (photo as any).file, photo.is_main, photo.description);
                console.log('Фотография загружена успешно через fetch API:', (photo as any).file.name);
              } catch (photoError) {
                console.error('Ошибка загрузки фотографии:', (photo as any).file.name, photoError);
              }
            }
          }
          
          setSuccessMessage('Точка обслуживания успешно создана');
        }

        setTimeout(() => {
          navigate(partnerId ? `/admin/partners/${partnerId}/service-points` : '/admin/service-points');
        }, 1000);
      } catch (error: any) {
        console.error('Ошибка при сохранении:', error);
        console.error('Детали ошибки:', {
          status: error?.status,
          data: error?.data,
          message: error?.message,
          originalStatus: error?.originalStatus
        });
        
        // Выводим содержимое data отдельно для лучшей видимости
        if (error?.data) {
          console.error('Содержимое error.data:', JSON.stringify(error.data, null, 2));
        }
        
        // Выводим детальную информацию об ошибках валидации
        if (error?.data?.errors) {
          console.error('Ошибки валидации:', error.data.errors);
        }
        
        setErrorMessage(
          error?.data?.message || 
          error?.data?.error ||
          error?.message ||
          'Ошибка при сохранении точки обслуживания'
        );
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
  }, [isEditMode]); // Убираем formik.values.service_posts?.length из зависимостей

  // Инициализируем форму данными с сервера при первой загрузке
  useEffect(() => {
    if (isEditMode && servicePoint && !formik.dirty) {
      console.log('=== Инициализация формы данными с сервера ===');
      console.log('servicePoint данные:', servicePoint);
      
      // Отладочная информация о фотографиях
      const allPhotos = servicePoint?.photos || [];
      const photosToDelete = allPhotos.filter(photo => (photo as any)._destroy);
      const activePhotos = allPhotos.filter(photo => !(photo as any)._destroy);
      
      console.log('=== Анализ фотографий при инициализации ===');
      console.log('Всего фотографий с сервера:', allPhotos.length);
      console.log('Фотографии помеченные для удаления:', photosToDelete.length);
      console.log('Активные фотографии:', activePhotos.length);
      
      if (photosToDelete.length > 0) {
        console.log('Фотографии помеченные для удаления:', photosToDelete.map(p => ({
          id: p.id,
          url: p.url,
          _destroy: (p as any)._destroy
        })));
      }
      
      // Обновляем все поля формы
      formik.setValues({
        name: servicePoint?.name || '',
        partner_id: servicePoint?.partner_id || (partnerId ? Number(partnerId) : 0),
        city_id: servicePoint?.city?.id || 0,
        region_id: servicePoint?.city?.region_id || 0, // Добавляем region_id
        address: servicePoint?.address || '',
        contact_phone: servicePoint?.contact_phone || '',
        description: servicePoint?.description || '',
        latitude: servicePoint?.latitude || null,
        longitude: servicePoint?.longitude || null,
        is_active: servicePoint?.is_active ?? true,
        work_status: servicePoint?.work_status || 'working',
        working_hours: normalizedWorkingHours,
        services: servicePoint?.services || [],
        photos: (servicePoint?.photos || []).filter(photo => !(photo as any)._destroy),
        service_posts: servicePoint?.service_posts || [],
      });
    }
  }, [servicePoint?.id, isEditMode, normalizedWorkingHours, partnerId]); // Добавляем все нужные зависимости

  // Обработчики
  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleGoBack = () => {
    navigate(partnerId ? `/admin/partners/${partnerId}/service-points` : '/admin/service-points');
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
    // Для создания новой точки услуги не обязательны
    // Для редактирования услуги тоже не обязательны, но если добавлены, должны быть правильно заполнены
    if (activeServices.length === 0) {
      return true; // Нет услуг - это нормально
    }
    
    // Если услуги добавлены, проверяем их корректность
    return activeServices.every(service => 
      service.service_id > 0 && service.price >= 0 && service.duration > 0
    );
  };

  const isPhotosComplete = () => {
    // Фотографии не обязательны
    return true;
  };

  // Проверка готовности всей формы к сохранению
  const isFormReadyToSubmit = () => {
    return isBasicInfoComplete() && 
           isLocationComplete() && 
           isContactComplete() && 
           isSettingsComplete() && 
           isScheduleComplete() && 
           isPostsComplete() && 
           isServicesComplete();
  };

  // Получение списка незаполненных шагов
  const getIncompleteSteps = () => {
    const incompleteSteps: string[] = [];
    
    if (!isBasicInfoComplete()) incompleteSteps.push('Основная информация');
    if (!isLocationComplete()) incompleteSteps.push('Адрес и местоположение');
    if (!isContactComplete()) incompleteSteps.push('Контактная информация');
    if (!isSettingsComplete()) incompleteSteps.push('Настройки');
    if (!isScheduleComplete()) incompleteSteps.push('Расписание работы');
    if (!isPostsComplete()) incompleteSteps.push('Рабочие посты');
    // Услуги показываем как незаполненные только если они добавлены, но заполнены некорректно
    const activeServices = formik.values.services?.filter(service => !service._destroy) || [];
    if (activeServices.length > 0 && !isServicesComplete()) {
      incompleteSteps.push('Услуги (некорректно заполнены)');
    }
    
    return incompleteSteps;
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
            fontSize: SIZES.fontSize.xl, // Используем стандартный размер как на странице партнеров
            fontWeight: 600,
            color: theme.palette.text.primary,
            lineHeight: 1.2,
            maxWidth: isMobile ? '100%' : '70%', // Ограничиваем ширину заголовка
          }}
        >
          {isEditMode 
            ? `Редактирование точки: ${servicePoint?.name || 'Загрузка...'}` 
            : 'Создание точки обслуживания'
          }
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
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: isMobile ? 'stretch' : 'flex-end' }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    startIcon={<SaveIcon />}
                    disabled={formik.isSubmitting || !isFormReadyToSubmit()}
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
                  
                  {/* Индикатор незаполненных шагов */}
                  {!isFormReadyToSubmit() && (
                    <Box sx={{ 
                      mt: 1, 
                      p: 1.5,
                      backgroundColor: theme.palette.warning.light,
                      borderRadius: SIZES.borderRadius.sm,
                      border: `1px solid ${theme.palette.warning.main}`,
                      maxWidth: isMobile ? '100%' : 300,
                    }}>
                      <Typography variant="caption" sx={{ 
                        color: theme.palette.warning.dark,
                        fontWeight: 600,
                        display: 'block',
                        mb: 0.5,
                      }}>
                        Для сохранения заполните:
                      </Typography>
                      {getIncompleteSteps().map((step, index) => (
                        <Typography key={index} variant="caption" sx={{ 
                          color: theme.palette.warning.dark,
                          display: 'block',
                          fontSize: SIZES.fontSize.xs,
                        }}>
                          • {step}
                        </Typography>
                      ))}
                    </Box>
                  )}
                </Box>
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