import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
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
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useSelector } from 'react-redux';

// Импорты стилей
import { SIZES, getButtonStyles, getCardStyles, getTablePageStyles } from '../../styles';

// Импорт валидации
import { phoneValidation } from '../../utils/validation';

// Компоненты шагов
import BasicInfoStep from './components/BasicInfoStep';
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
const getFormSteps = (t: any) => [
  { id: 'basic', label: t('forms.servicePoint.steps.basic'), component: BasicInfoStep },
  { id: 'contact', label: t('forms.servicePoint.steps.contact'), component: ContactStep },
  { id: 'schedule', label: t('forms.servicePoint.steps.schedule'), component: ScheduleStep },
  { id: 'posts', label: t('forms.servicePoint.steps.posts'), component: PostsStep },
  { id: 'services', label: t('forms.servicePoint.steps.services'), component: ServicesStep },
  { id: 'photos', label: t('forms.servicePoint.steps.photos'), component: PhotosStep },
  { id: 'settings', label: t('forms.servicePoint.steps.settings'), component: SettingsStep },
];

// Начальное расписание для быстрого заполнения
const defaultWorkingHours: WorkingHoursSchedule = DAYS_OF_WEEK.reduce<WorkingHoursSchedule>((acc, day) => {
  const workingHours: WorkingHours = {
    start: '09:00',
    end: '18:00',
    is_working_day: day.id >= 1 && day.id <= 5 // Mon-Fri working days (id: 1-5)
  };
  acc[day.key] = workingHours;
  return acc;
}, {} as WorkingHoursSchedule);

// Пустое расписание для новых точек
const emptyWorkingHours: WorkingHoursSchedule = DAYS_OF_WEEK.reduce<WorkingHoursSchedule>((acc, day) => {
  const workingHours: WorkingHours = {
    start: '09:00',
    end: '18:00',
    is_working_day: false // All days initially disabled
  };
  acc[day.key] = workingHours;
  return acc;
}, {} as WorkingHoursSchedule);

// Схема валидации
const createValidationSchema = (t: any) => yup.object({
  // Локализованные поля - русский язык обязателен
  name_ru: yup.string().required(t('forms.servicePoint.validation.nameRuRequired')),
  description_ru: yup.string().nullable(),
  address_ru: yup.string().required(t('forms.servicePoint.validation.addressRuRequired')),
  
  // Локализованные поля - украинский язык обязателен
  name_uk: yup.string().required(t('forms.servicePoint.validation.nameUkRequired')),
  description_uk: yup.string().nullable(),
  address_uk: yup.string().required(t('forms.servicePoint.validation.addressUkRequired')),
  
  // Остальные поля
  partner_id: yup.number().required(t('forms.servicePoint.validation.partnerRequired')).min(1, t('forms.servicePoint.selectPartner')),
  region_id: yup.number().required(t('forms.servicePoint.validation.regionRequired')).min(1, t('forms.servicePoint.selectRegion')),
  city_id: yup.number().required(t('forms.servicePoint.validation.cityRequired')).min(1, t('forms.servicePoint.selectCity')),
  contact_phone: yup.string().required(t('forms.servicePoint.validation.phoneRequired')),
  is_active: yup.boolean().required(),
  work_status: yup.string().required(t('forms.servicePoint.validation.workStatusRequired')),
});

const ServicePointFormPage: React.FC = () => {
  const { t } = useTranslation();
  const FORM_STEPS = getFormSteps(t);
  const { partnerId, id } = useParams<{ partnerId: string; id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get token and user info from Redux state
  const authToken = useSelector((state: any) => state.auth?.accessToken);
  const currentUser = useSelector((state: any) => state.auth?.user);
  
  // Определяем откуда пришел пользователь для правильного возврата
  const getReturnPath = () => {
    // Check referrer or state from location
    const referrer = location.state?.from || document.referrer;
    const userRole = currentUser?.role;
    
    console.log('=== Return path determination ===');
    console.log('location.state?.from:', location.state?.from);
    console.log('document.referrer:', document.referrer);
    console.log('partnerId:', partnerId);
    console.log('userRole:', userRole);
    
    // If came from partner edit page
    if (referrer && referrer.includes(`/admin/partners/${partnerId}/edit`)) {
      return `/admin/partners/${partnerId}/edit`;
    }
    
    // If came from partner service points list
    if (referrer && referrer.includes(`/admin/partners/${partnerId}/service-points`)) {
      return `/admin/partners/${partnerId}/service-points`;
    }
    
    // If came from general service points list (admins only)
    if (referrer && referrer.includes('/admin/service-points') && userRole === 'admin') {
      return '/admin/service-points';
    }
    
    // Return logic based on user role
    if (userRole === 'partner' && currentUser.partner_id) {
      // Partners return to their edit page
      return `/admin/partners/${currentUser.partner_id}/edit`;
    }
    
    if (userRole === 'operator' && currentUser.operator?.partner_id) {
      // Operators return to their partner's service points list
      return `/admin/partners/${currentUser.operator.partner_id}/service-points`;
    }
    
    // If partnerId exists, return to partner's service points list by default
    if (partnerId) {
      return `/admin/partners/${partnerId}/service-points`;
    }
    
    // Return to general list by default (admins only)
    return userRole === 'admin' ? '/admin/service-points' : '/admin';
  };
  
  // Debug info for URL parameters
  console.log('=== URL parameters ===');
  console.log('partnerId:', partnerId, 'type:', typeof partnerId);
  console.log('id:', id, 'type:', typeof id);
  console.log('isEditMode:', isEditMode);
  console.log('partnerId as number:', partnerId ? Number(partnerId) : null);
  
  // Хуки для темы и адаптивности
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // < 900px - Mobile devices
  const isTablet = useMediaQuery(theme.breakpoints.down('lg')); // < 1200px - Tablets  
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm')); // < 600px - Small mobile
  const isVerySmallMobile = useMediaQuery(theme.breakpoints.down('sm')); // < 600px
  const isMediumMobile = useMediaQuery(theme.breakpoints.down('md')); // < 900px
  const isLargeTablet = useMediaQuery(theme.breakpoints.down('xl')); // < 1536px - Large tablets
  
  // Состояние
  const [activeStep, setActiveStep] = useState(0);
  
  // Состояние для уведомлений и UI
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Ref для контейнера чипов степпера
  const chipContainerRef = useRef<HTMLDivElement>(null);
  
  // API хуки
  const { data: servicePoint, isLoading } = useGetServicePointByIdQuery(
    isEditMode && id ? (partnerId ? { partner_id: Number(partnerId), id } : id) : '',
    { skip: !isEditMode || !id }
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
    // FIXED: backend expects 'file' field, not 'photo'
    formData.append('file', file);
    formData.append('is_main', isMain.toString());
    if (description) {
      formData.append('description', description);
    }
    
    if (!authToken) {
      throw new Error(t('errors.authTokenNotFound'));
    }
    
    const url = `http://localhost:8000/api/v1/service_points/${servicePointId}/photos`;
    console.log('=== Direct photo upload ===');
    console.log('URL:', url);
    console.log('servicePointId:', servicePointId);
    console.log('file:', file);
    console.log('file.name:', file.name);
    console.log('file.size:', file.size);
    console.log('file.type:', file.type);
    console.log('isMain:', isMain);
    console.log('FormData содержимое:');
    // Fix iteration for TypeScript compatibility
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
      console.error(t('errors.photoUploadError'), response.status, errorData);
              throw new Error(`Photo upload error: ${response.status}`);
    }
    
    const result = await response.json();
    console.log(t('forms.servicePoint.photoUploadSuccess'), result);
    
    // RTK Query cache invalidation after successful upload
    console.log(t('forms.servicePoint.cacheInvalidation'));
    invalidateTag('ServicePointPhoto');
    invalidateTag('ServicePoint');
    invalidateList(['ServicePointPhoto']);
    
    return result;
  };

  // Проверяем корректность данных и права доступа
  useEffect(() => {
    const userRole = currentUser?.role;
    
    // Для администраторов разрешаем редактирование без partnerId в URL
    if (isEditMode && !partnerId && userRole !== 'admin') {
      console.error('ERROR: Editing service point without partnerId in URL');
      alert(t('errors.invalidEditUrl'));
      navigate('/service-points');
      return;
    }
    
    // Проверяем partnerId при создании новой сервисной точки
    if (!isEditMode && !partnerId) {
      console.error('ERROR: Creating service point without partnerId in URL');
      alert(t('errors.partnerRequiredForCreation'));
      navigate('/partners');
      return;
    }
    
    // Проверяем права доступа для партнеров и операторов
    if (currentUser && partnerId) {
      const userRole = currentUser.role;
      console.log('=== Проверка прав доступа ===');
      console.log('Роль пользователя:', userRole);
      console.log('partnerId из URL:', partnerId);
      console.log('ID партнера пользователя:', currentUser.partner_id);
      console.log('ID оператора пользователя:', currentUser.operator_id);
      
      // Если пользователь - партнер, может работать только со своими сервисными точками
      if (userRole === 'partner' && currentUser.partner_id !== Number(partnerId)) {
        console.warn('Access denied: Partner can only work with their own service points');
        alert(t('errors.noPermissionForPartner'));
        navigate('/service-points');
        return;
      }

      // Для операторов проверяем права через operator_id
      if (userRole === 'operator' && !currentUser.operator_id) {
        console.warn('Access denied: Operator has no access');
        alert(t('errors.noPermissionForPartner'));
        navigate('/service-points');
        return;
      }
    }
  }, [isEditMode, partnerId, navigate, currentUser]);

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
      // Локализованные поля
      name_ru: servicePoint?.name_ru || '',
      name_uk: servicePoint?.name_uk || '',
      description_ru: servicePoint?.description_ru || '',
      description_uk: servicePoint?.description_uk || '',
      address_ru: servicePoint?.address_ru || '',
      address_uk: servicePoint?.address_uk || '',
      
      // Остальные поля
      partner_id: servicePoint?.partner_id || partnerIdNumber,
      city_id: servicePoint?.city?.id || 0,
      region_id: servicePoint?.city?.region_id || 0, // Добавляем region_id
      contact_phone: servicePoint?.contact_phone || '',
      latitude: servicePoint?.latitude || null,
      longitude: servicePoint?.longitude || null,
      is_active: servicePoint?.is_active ?? true,
      work_status: servicePoint?.work_status || 'working',
      service_point_category_settings: servicePoint?.category_confirmation_settings 
        ? Object.entries(servicePoint.category_confirmation_settings).map(([categoryId, autoConfirmation]) => ({
            service_category_id: parseInt(categoryId),
            auto_confirmation: autoConfirmation,
            service_point_id: servicePoint.id
          }))
        : [],
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
    validationSchema: createValidationSchema(t),
    onSubmit: async (values: ServicePointFormDataNew) => {
      try {
        // Подготавливаем данные для отправки
        const servicePointData = {
          // Локализованные поля
          name_ru: values.name_ru,
          name_uk: values.name_uk,
          description_ru: values.description_ru,
          description_uk: values.description_uk,
          address_ru: values.address_ru,
          address_uk: values.address_uk,
          
          // Остальные поля
          partner_id: values.partner_id,
          city_id: values.city_id,
          contact_phone: values.contact_phone,
          latitude: values.latitude,
          longitude: values.longitude,
          is_active: values.is_active,
          work_status: values.work_status,
          working_hours: values.working_hours,
          service_point_category_settings_attributes: (values.service_point_category_settings || []).map(setting => ({
            id: setting.id && typeof setting.id === 'number' && setting.id > 0 ? setting.id : undefined,
            service_category_id: setting.service_category_id,
            auto_confirmation: setting.auto_confirmation,
            _destroy: setting._destroy || false,
          })),
          service_posts_attributes: (values.service_posts || []).map(post => ({
            id: post.id && typeof post.id === 'number' && post.id > 0 && post.id < 1000000000 ? post.id : undefined,
            name: post.name,
            description: post.description || '',
            slot_duration: post.slot_duration,
            is_active: post.is_active,
            post_number: post.post_number,
            service_category_id: post.service_category_id,
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
                invalidateTag('ServicePointPhoto');
                invalidateTag('ServicePoint');
                invalidateList(['ServicePointPhoto']);
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
                console.error(t('errors.photoUploadError'), (photo as any).file.name, photoError);
              }
            }
          } else {
            console.log('Нет новых фотографий для загрузки при обновлении');
          }
          
          setSuccessMessage(t('forms.servicePoints.messages.updateSuccess'));
          
          // ПРИНУДИТЕЛЬНОЕ ОБНОВЛЕНИЕ КЭША после успешного обновления
          console.log('Принудительно обновляем кэш всех списков сервисных точек');
          invalidateTag('ServicePoint');
          invalidateList(['ServicePoint']);
          if (partnerId) {
            invalidateTag('ServicePoint');
          }
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
                console.error(t('errors.photoUploadError'), (photo as any).file.name, photoError);
              }
            }
          }
          
          setSuccessMessage(isEditMode ? t('forms.servicePoints.messages.updateSuccess') : t('forms.servicePoints.messages.createSuccess'));
          
          // ПРИНУДИТЕЛЬНОЕ ОБНОВЛЕНИЕ КЭША после успешного создания
          console.log('Принудительно обновляем кэш всех списков сервисных точек после создания');
          invalidateList(['ServicePoint']);
          if (partnerId) {
            invalidateTag('ServicePoint');
          }
          if (result?.id) {
            invalidateTag('ServicePoint');
          }
        }

        setTimeout(() => {
          const returnPath = getReturnPath();
          console.log('=== Возврат после сохранения ===');
          console.log('Возвращаемся на:', returnPath);
          navigate(returnPath);
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
          t('forms.servicePoints.messages.saveError')
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
        name: t('forms.servicePoints.messages.defaultPostName'),
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
        // Локализованные поля
        name_ru: servicePoint?.name_ru || '',
        name_uk: servicePoint?.name_uk || '',
        description_ru: servicePoint?.description_ru || '',
        description_uk: servicePoint?.description_uk || '',
        address_ru: servicePoint?.address_ru || '',
        address_uk: servicePoint?.address_uk || '',
        
        // Остальные поля
        partner_id: servicePoint?.partner_id || (partnerId ? Number(partnerId) : 0),
        city_id: servicePoint?.city?.id || 0,
        region_id: servicePoint?.city?.region_id || 0, // Добавляем region_id
        contact_phone: servicePoint?.contact_phone || '',
        latitude: servicePoint?.latitude || null,
        longitude: servicePoint?.longitude || null,
        is_active: servicePoint?.is_active ?? true,
        work_status: servicePoint?.work_status || 'working',
        service_point_category_settings: servicePoint?.category_confirmation_settings 
          ? Object.entries(servicePoint.category_confirmation_settings).map(([categoryId, autoConfirmation]) => ({
              service_category_id: parseInt(categoryId),
              auto_confirmation: autoConfirmation,
              service_point_id: servicePoint.id
            }))
          : [],
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
    const returnPath = getReturnPath();
    console.log('=== Возврат через кнопку "Назад" ===');
    console.log('Возвращаемся на:', returnPath);
    navigate(returnPath);
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
    return formik.values.name_ru.trim().length > 0 && 
           formik.values.name_uk.trim().length > 0 && 
           formik.values.partner_id > 0;
  };

  const isLocationComplete = () => {
    return formik.values.city_id > 0 && 
           formik.values.address_ru.trim().length > 0 && 
           formik.values.address_uk.trim().length > 0;
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
    
    if (!isBasicInfoComplete()) incompleteSteps.push(t('forms.servicePoint.steps.basic'));
    if (!isLocationComplete()) incompleteSteps.push(t('forms.servicePoints.form.incompleteSteps.addressAndLocation'));
    if (!isContactComplete()) incompleteSteps.push(t('forms.servicePoints.form.incompleteSteps.contactInfo'));
    if (!isSettingsComplete()) incompleteSteps.push(t('forms.servicePoint.steps.settings'));
    if (!isScheduleComplete()) incompleteSteps.push(t('forms.servicePoints.form.incompleteSteps.schedule'));
    if (!isPostsComplete()) incompleteSteps.push(t('forms.servicePoints.form.incompleteSteps.workingPosts'));
    // Услуги показываем как незаполненные только если они добавлены, но заполнены некорректно
    const activeServices = formik.values.services?.filter(service => !service._destroy) || [];
    if (activeServices.length > 0 && !isServicesComplete()) {
      incompleteSteps.push(t('forms.servicePoints.form.incompleteSteps.servicesIncorrect'));
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
        <Box sx={{ mb: 2 }}> {/* Уменьшаем отступ снизу */}
          {/* Компактный индикатор прогресса */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 1.5, // Уменьшаем отступ снизу
            p: isVerySmallMobile ? 1 : 1.5, // Уменьшаем внутренние отступы
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
{t('forms.servicePoints.form.stepCounter', { current: activeStep + 1, total: FORM_STEPS.length })}:
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
            mb: 1.5, // Уменьшаем отступ снизу
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
            mb: 2, // Уменьшаем отступ снизу
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

  // Получаем стандартные стили страницы
  const tablePageStyles = getTablePageStyles(theme);

  return (
    <Box sx={{ 
      ...tablePageStyles.pageContainer, // Используем стандартные отступы
      maxWidth: '100%',
      overflow: 'hidden',
    }}>
      {/* Адаптивный заголовок */}
      <Box sx={{ 
        ...tablePageStyles.pageHeader, // Используем стандартные стили заголовка
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'flex-start' : 'center', 
        gap: isMobile ? 1 : 0,
      }}>
        <Typography 
          variant={isMobile ? "h5" : "h4"}
          sx={{
            ...tablePageStyles.pageTitle, // Используем стандартные стили заголовка
            fontSize: SIZES.fontSize.xl,
            lineHeight: 1.2,
            maxWidth: isMobile ? '100%' : '70%',
          }}
        >
          {isEditMode 
            ? `${t('forms.servicePoints.form.editingPoint')} ${servicePoint?.name || t('common.loading')}` 
            : t('forms.servicePoints.form.creatingPoint')
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
          {t('forms.servicePoints.form.backToList')}
        </Button>
      </Box>

      <Paper sx={{ 
        ...tablePageStyles.card, // Используем стандартные стили карточки
        borderRadius: SIZES.borderRadius.lg,
      }}>
        {renderAdaptiveStepper()}

        {/* Содержимое шага */}
        <form onSubmit={formik.handleSubmit}>
          <Box sx={{ 
            minHeight: isMobile ? 'auto' : 300, // Уменьшаем минимальную высоту
            mb: 2, // Уменьшаем отступ снизу
          }}>
            {getCurrentStepComponent()}
          </Box>

          {/* Адаптивная навигация */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            gap: isMobile ? 1.5 : 1.5, // Уменьшаем gap между кнопками
            alignItems: isMobile ? 'stretch' : 'center',
            mt: 2, // Уменьшаем отступ сверху
            pt: 1.5, // Уменьшаем внутренний отступ сверху
            borderTop: `1px solid ${theme.palette.divider}`,
          }}>
            <Button
              onClick={handleBack}
              disabled={isFirstStep}
              variant={isMobile ? 'outlined' : 'text'}
              size={isMobile ? 'large' : 'medium'}
              sx={{
                ...getButtonStyles(theme, 'secondary'),
                order: isMobile ? 2 : 1,
                minHeight: isMobile ? 44 : 40, // Уменьшаем высоту кнопок
                px: isMobile ? 2 : 1.5, // Уменьшаем горизонтальный padding
                minWidth: isMobile ? '100%' : 100,
              }}
            >
              {t('common.back')}
            </Button>

            <Box sx={{ 
              display: 'flex', 
              gap: isMobile ? 1.5 : 1.5, // Уменьшаем gap между кнопками
              order: isMobile ? 1 : 2,
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: isMobile ? 'stretch' : 'center',
            }}>
              {!isLastStep ? (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={!isStepValid(activeStep)}
                  size={isMobile ? 'large' : 'medium'}
                  sx={{
                    ...getButtonStyles(theme, 'primary'),
                    minHeight: isMobile ? 44 : 40, // Уменьшаем высоту кнопок
                    minWidth: isMobile ? '100%' : 140,
                    px: isMobile ? 2 : 2, // Уменьшаем горизонтальный padding
                  }}
                >
                  {t('common.next')}
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
                      minHeight: isMobile ? 44 : 40, // Уменьшаем высоту кнопок
                      minWidth: isMobile ? '100%' : 160,
                      px: isMobile ? 2 : 2, // Уменьшаем горизонтальный padding
                    }}
                  >
                    {formik.isSubmitting ? t('common.saving') : t('common.save')}
                  </Button>
                  
                  {/* Индикатор незаполненных шагов */}
                  {!isFormReadyToSubmit() && (
                    <Box sx={{ 
                      mt: 1, 
                      p: 1, // Уменьшаем внутренние отступы
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

export default ServicePointFormPage; 