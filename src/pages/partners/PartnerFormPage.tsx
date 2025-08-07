import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Grid,
  FormControlLabel,
  Switch,
  useTheme,
  Tooltip,
  IconButton,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Chip,
  Snackbar,
  SelectChangeEvent,
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowBack as ArrowBackIcon, 
  Save as SaveIcon,
  Business as BusinessIcon,
  LocationOn as LocationOnIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Upload as UploadIcon,
  BrokenImage as BrokenImageIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useLocalizedName } from '../../utils/localizationHelpers';
import { 
  useGetPartnerByIdQuery, 
  useCreatePartnerMutation, 
  useUpdatePartnerMutation,
  useGetRegionsQuery,
  useGetCitiesQuery,
  useGetServicePointsByPartnerIdQuery,
  useUpdateServicePointMutation,
  useTogglePartnerActiveMutation,
} from '../../api';
import { getRoleId } from '../../utils/roles.utils';
import { PartnerFormData, ServicePoint } from '../../types/models';
// Импорт централизованной системы стилей
import { getCardStyles, getButtonStyles, getTextFieldStyles, SIZES, getTablePageStyles } from '../../styles';
// Импорт UI компонентов
import { TabPanel, Table, type Column, Pagination, PhoneField } from '../../components/ui';
import { phoneValidation } from '../../utils/validation';
import { useGetOperatorsByPartnerQuery, useCreateOperatorMutation, useUpdateOperatorMutation, useDeleteOperatorMutation, Operator, UpdateOperatorRequest } from '../../api/operators.api';
import { OperatorModal } from '../../components/partners/OperatorModal';
import { PartnerOperatorsManager } from '../../components/partners/PartnerOperatorsManager';

/**
 * Страница формы партнера - создание и редактирование партнеров
 * 
 * Функциональность:
 * - Создание нового партнера с данными пользователя
 * - Редактирование существующего партнера
 * - Валидация полей формы с помощью Yup
 * - Управление регионами и городами с каскадной загрузкой
 * - Интеграция с RTK Query для API операций
 * - Централизованная система стилей для консистентного UI
 * 
 * Разделы формы:
 * - Основная информация о компании (название, описание, контактное лицо, сайт, логотип)
 * - t('forms.partner.sections.legalInfo') (налоговый номер, юридический адрес)
 * - t('forms.partner.sections.location') (регион и город с каскадной загрузкой)
 * - Статус (активность партнера)
 * - t('forms.partner.sections.userInfo') (только при создании - имя, фамилия, email, телефон, пароль)
 */

// Определяем локальный интерфейс для формы пользователя
interface FormUserData {
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  password?: string;
}

interface FormValues {
  company_name: string;
  company_description: string | undefined;
  contact_person: string | undefined;
  logo_url: string | undefined;
  logo_file?: File | null;
  website: string | undefined;
  tax_number: string | undefined;
  legal_address: string | undefined;
  region_id: number | undefined;
  city_id: number | undefined;
  is_active: boolean;
  user: FormUserData | null;
  new_password?: string;
}

// Типы для formik.touched и formik.errors
interface FormikTouched {
  company_name?: boolean;
  company_description?: boolean;
  contact_person?: boolean;
  logo_url?: boolean;
  website?: boolean;
  tax_number?: boolean;
  legal_address?: boolean;
  region_id?: boolean;
  city_id?: boolean;
  is_active?: boolean;
  user?: {
    first_name?: boolean;
    last_name?: boolean;
    email?: boolean;
    phone?: boolean;
    password?: boolean;
  };
}

interface FormikErrors {
  company_name?: string;
  company_description?: string;
  contact_person?: string;
  logo_url?: string;
  website?: string;
  tax_number?: string;
  legal_address?: string;
  region_id?: string | number;
  city_id?: string | number;
  is_active?: string;
  user?: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    password?: string;
  };
}

// Определяем базовый интерфейс для атрибутов пользователя
interface UserAttributes {
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  password?: string;
  password_confirmation?: string;
  role_id?: number;
}

// Расширяем тип PartnerFormData для поддержки частичного обновления
interface ExtendedPartnerFormData extends Omit<PartnerFormData, 'user_attributes'> {
  user_attributes?: UserAttributes | Partial<UserAttributes>;
}

// Функция для создания схемы валидации в зависимости от режима
const createValidationSchema = (isEdit: boolean, t: any) => yup.object({
  company_name: yup.string()
    .required(t('forms.partner.validation.companyNameRequired'))
    .min(2, t('forms.partner.validation.companyNameMin'))
    .max(100, t('forms.partner.validation.companyNameMax')),
  
  company_description: yup.string()
    .max(2000, t('forms.partner.validation.descriptionMax'))
    .nullable(),
  
  contact_person: yup.string()
    .nullable()
    .min(2, t('forms.partner.validation.contactPersonMin')),
  
  website: yup.string()
    .url(t('forms.partner.validation.websiteUrlInvalid'))
    .nullable(),
  
  tax_number: yup.string()
    .nullable()
    .transform((value) => (value === '' ? null : value))
    .test('tax-number-format', t('forms.partner.validation.taxNumberInvalid'), function(value) {
      if (!value) return true; // Если поле пустое или null, то валидация проходит
      return /^[0-9-]{8,15}$/.test(value);
    }),
  
  legal_address: yup.string()
    .required(t('forms.partner.validation.legalAddressRequired'))
    .max(500, t('forms.partner.validation.legalAddressMax')),
  
  logo_url: yup.string()
    .url(t('forms.partner.validation.logoUrlInvalid'))
    .nullable(),
  
  region_id: yup.number()
    .typeError(t('forms.partner.validation.regionRequired'))
    .required(t('forms.partner.validation.regionRequired'))
    .min(1, t('forms.partner.validation.regionRequired')),
  
  city_id: yup.number()
    .typeError(t('forms.partner.validation.cityRequired'))
    .required(t('forms.partner.validation.cityRequired'))
    .min(1, t('forms.partner.validation.cityRequired')),
  
  is_active: yup.boolean(),
  
  new_password: yup.string()
    .nullable()
    .min(6, t('forms.partner.validation.passwordMin')),
  
  user: isEdit 
    ? yup.object().nullable()
    : yup.object().shape({
        email: yup.string()
          .email(t('forms.partner.validation.emailInvalid'))
          .required(t('forms.partner.validation.emailRequired')),
        phone: phoneValidation,
        first_name: yup.string()
          .required(t('forms.partner.validation.firstNameRequired'))
          .min(2, t('forms.partner.validation.firstNameMin')),
        last_name: yup.string()
          .required(t('forms.partner.validation.lastNameRequired'))
          .min(2, t('forms.partner.validation.lastNameMin')),
        password: yup.string()
          .min(6, t('forms.partner.validation.passwordMin'))
          .nullable(),
      }).required(t('forms.partner.validation.userInfoRequired')),
});

const PartnerFormPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const [selectedRegionId, setSelectedRegionId] = useState<number | undefined>();
  const [activeTab, setActiveTab] = useState<number>(0);
  
  // Хук для локализации названий
  const getLocalizedName = useLocalizedName();
  
  // Централизованная система стилей
  const theme = useTheme();
  const cardStyles = getCardStyles(theme, 'primary');
  const textFieldStyles = getTextFieldStyles(theme, 'filled');
  const primaryButtonStyles = getButtonStyles(theme, 'primary');
  const secondaryButtonStyles = getButtonStyles(theme, 'secondary');
  const tablePageStyles = getTablePageStyles(theme);

  // RTK Query хуки
  const { data: partner, isLoading: partnerLoading } = useGetPartnerByIdQuery(id ? parseInt(id) : 0, {
    skip: !id,
  });
  const { data: regionsData } = useGetRegionsQuery({});
  
  // Устанавливаем выбранный регион при загрузке данных партнера
  useEffect(() => {
    if (partner && isEdit && partner.region_id && !selectedRegionId) {
      console.log('Устанавливаем selectedRegionId:', partner.region_id);
      setSelectedRegionId(partner.region_id);
    }
  }, [partner, isEdit, selectedRegionId]);
  
  // Обновляем логику запроса городов
  const regionIdForCities = useMemo(() => {
    // При редактировании используем selectedRegionId, если он установлен, иначе region_id партнера
    if (isEdit && partner) {
      return selectedRegionId || partner.region_id;
    }
    // При создании используем только selectedRegionId
    return selectedRegionId;
  }, [partner, isEdit, selectedRegionId]);
  
  console.log('regionIdForCities:', regionIdForCities, 'selectedRegionId:', selectedRegionId, 'partner.region_id:', partner?.region_id);
  
  const { data: citiesData, isLoading: citiesLoading, isFetching: citiesFetching } = useGetCitiesQuery(
    { 
      region_id: regionIdForCities || undefined,
      page: 1,
      per_page: 100
    }, 
    { 
      skip: !regionIdForCities,
      // Принудительно обновляем при изменении regionIdForCities
      refetchOnMountOrArgChange: true
    }
  );
  
  const [createPartner, { isLoading: createLoading }] = useCreatePartnerMutation();
  const [updatePartner, { isLoading: updateLoading }] = useUpdatePartnerMutation();
  const [togglePartnerActive] = useTogglePartnerActiveMutation();

  // Загрузка сервисных точек партнера (только в режиме редактирования)
  const { data: servicePointsData, isLoading: servicePointsLoading, refetch: refetchServicePoints } = useGetServicePointsByPartnerIdQuery(
    { 
      partner_id: id ? parseInt(id) : 0,
      page: 1,
      per_page: 25
    }, 
    { skip: !isEdit || !id }
  );

  // Состояние для управления ошибками API и сообщениями успеха
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Состояние для отображения ошибок валидации
  const [showValidationErrors, setShowValidationErrors] = useState(false);

  // --- Сотрудники (операторы) ---
  const partnerId = id ? parseInt(id) : 0;
  const { data: operators = [], isLoading: operatorsLoading, refetch: refetchOperators } = useGetOperatorsByPartnerQuery(partnerId, { skip: !isEdit });
  const [createOperator] = useCreateOperatorMutation();
  const [updateOperator] = useUpdateOperatorMutation();
  const [deleteOperator] = useDeleteOperatorMutation();
  const [updateServicePoint] = useUpdateServicePointMutation();
  const [operatorModalOpen, setOperatorModalOpen] = useState(false);
  const [editingOperator, setEditingOperator] = useState<Operator | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  // Открыть модалку для добавления
  const handleAddOperator = () => {
    setEditingOperator(null);
    setOperatorModalOpen(true);
  };
  // Открыть модалку для редактирования
  const handleEditOperator = (operator: Operator) => {
    setEditingOperator(operator);
    setOperatorModalOpen(true);
  };
  // Удалить/деактивировать оператора
  const handleDeleteOperator = async (operator: Operator) => {
    try {
      console.log('Деактивация/удаление оператора:', operator.id, 'текущий статус:', operator.is_active);
      
      if (operator.is_active) {
        // Если оператор активен - деактивируем его
        const requestData = {
          user: {
            is_active: false
          },
          operator: {
            is_active: false
          }
        };
        
        await updateOperator({ 
          id: operator.id, 
          data: requestData
        }).unwrap();
        setSuccessMessage(t('forms.partner.messages.operatorDeactivated'));
      } else {
        // Если оператор неактивен - удаляем его
        await deleteOperator({ id: operator.id, partnerId }).unwrap();
        setSuccessMessage(t('forms.partner.messages.operatorDeleted'));
      }
      
      // Обновляем список операторов
      refetchOperators();
      
      // Скрываем сообщение через 3 секунды
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Ошибка при деактивации/удалении сотрудника:', error);
      setApiError(t('forms.partner.errors.operatorError'));
      setTimeout(() => setApiError(null), 3000);
    }
  };
  // Сохранить оператора (добавить/редактировать)
  const handleSaveOperator = async (data: any): Promise<void> => {
    try {
      if (editingOperator) {
        await updateOperator({ id: editingOperator.id, data }).unwrap();
      } else {
        await createOperator({ partnerId, data }).unwrap();
      }
      // Обновляем список операторов
      refetchOperators();
      // Модальное окно закроется автоматически через setTimeout в OperatorModal
    } catch (error) {
      // Пробрасываем ошибку для обработки в OperatorModal
      console.error('Ошибка при сохранении оператора в PartnerFormPage:', error);
      throw error;
    }
  };

  // --- Исправляем функцию для изменения статуса сервисной точки ---
  const handleToggleServicePointStatus = async (servicePoint: ServicePoint) => {
    // Проверяем, можно ли активировать сервисную точку
    if (!servicePoint.is_active && !formik.values.is_active) {
      setApiError(t('forms.partner.errors.cannotActivateServicePoint'));
      setTimeout(() => setApiError(null), 3000);
      return;
    }
    
    try {
      console.log('Изменение статуса сервисной точки:', servicePoint.id, 'на', !servicePoint.is_active);
      
      await updateServicePoint({ 
        id: servicePoint.id.toString(), 
        partnerId: partnerId,
        servicePoint: { 
          is_active: !servicePoint.is_active
        } 
      }).unwrap();
      
      // Обновляем список сервисных точек
      refetchServicePoints();
      
      // Отображаем сообщение об успехе
      setSuccessMessage(servicePoint.is_active 
                ? t('forms.partner.messages.servicePointDeactivated')
        : t('forms.partner.messages.servicePointActivated'));
      
      // Скрываем сообщение через 3 секунды
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      console.error('Ошибка при изменении статуса сервисной точки:', error);
      // Проверяем, есть ли сообщение об ошибке валидации
      const errorMessage = error?.data?.errors?.is_active?.[0] || 
                          error?.data?.message || 
                          t('forms.partner.errors.servicePointStatusError');
      setApiError(errorMessage);
      setTimeout(() => setApiError(null), 3000);
    }
  };

  // --- Исправляем функцию для изменения статуса оператора ---
  const handleToggleOperatorStatus = async (operator: Operator) => {
    // Проверяем, можно ли активировать оператора
    if (!operator.is_active && !formik.values.is_active) {
      setApiError(t('forms.partner.errors.cannotActivateOperator'));
      setTimeout(() => setApiError(null), 3000);
      return;
    }
    
    try {
      console.log('Изменение статуса оператора:', operator.id, 'на', !operator.is_active);
      
      const requestData = {
        user: {
          is_active: !operator.is_active
        },
        operator: {
          is_active: !operator.is_active
        }
      };
      
      await updateOperator({ 
        id: operator.id, 
        data: requestData
      }).unwrap();
      
      // Обновляем список операторов
      refetchOperators();
      
      // Отображаем сообщение об успехе
      setSuccessMessage(operator.is_active ? t('forms.partner.messages.operatorDeactivated') : t('forms.partner.messages.operatorActivated'));
      
      // Скрываем сообщение через 3 секунды
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      console.error('Ошибка при изменении статуса оператора:', error);
      // Проверяем, есть ли сообщение об ошибке валидации
      const errorMessage = error?.data?.errors?.is_active?.[0] || 
                          error?.data?.message || 
                          t('forms.partner.errors.operatorStatusError');
      setApiError(errorMessage);
      setTimeout(() => setApiError(null), 3000);
    }
  };

  // Функция для получения списка незаполненных обязательных полей
  const getRequiredFieldErrors = () => {
    const requiredFields = {
      company_name: t('forms.partner.fields.companyName'),
      legal_address: t('forms.partner.fields.legalAddress'),
      region_id: t('forms.partner.fields.region'),
      city_id: t('forms.partner.fields.city'),
      ...((!isEdit) && {
        'user.email': t('forms.partner.fields.email'),
        'user.phone': t('forms.partner.fields.phone'),
        'user.first_name': t('forms.partner.fields.firstName'),
        'user.last_name': t('forms.partner.fields.lastName')
      })
    };

    const errors: string[] = [];
    Object.entries(requiredFields).forEach(([field, label]) => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        if (parent === 'user') {
          const userValue = formik.values.user;
          if (!userValue || !userValue[child as keyof FormUserData] || 
              (typeof userValue[child as keyof FormUserData] === 'string' && 
               userValue[child as keyof FormUserData] === '')) {
            errors.push(label);
          }
        }
      } else {
        const value = formik.values[field as keyof FormValues];
        if (!value || 
            (typeof value === 'string' && value.trim() === '') ||
            (field === 'region_id' && !formik.values.region_id) ||
            (field === 'city_id' && !formik.values.city_id)) {
          errors.push(label);
        }
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
        if (field === 'user' && formik.values.user) {
          acc.user = Object.keys(formik.values.user).reduce((userAcc, userField) => {
            userAcc[userField] = true;
            return userAcc;
          }, {} as Record<string, boolean>);
        }
        return acc;
      }, {} as Record<string, any>);
      formik.setTouched(touchedFields);
      setShowValidationErrors(true);
    }
  };

  // Функция для форматирования данных перед отправкой
  const formatPartnerData = (values: FormValues): PartnerFormData => {
    console.log('🔧 formatPartnerData получил values:', values);
    console.log('🖼️ logo_file в values:', values.logo_file);
    console.log('🖼️ logo_file instanceof File:', values.logo_file instanceof File);
    
    // Автоматически генерируем contact_person из имени и фамилии пользователя
    const contactPerson = values.user 
      ? `${values.user.first_name} ${values.user.last_name}`.trim()
      : values.contact_person || '';

    const formattedData: PartnerFormData = {
      company_name: values.company_name,
      company_description: values.company_description || undefined,
      contact_person: contactPerson, // Используем автоматически сгенерированное значение
      logo_url: values.logo_url || undefined,
      website: values.website || undefined,
      tax_number: values.tax_number || undefined,
      legal_address: values.legal_address,
      region_id: values.region_id,
      city_id: values.city_id,
      is_active: values.is_active,
      // Добавляем файл логотипа, если он есть
      ...(values.logo_file && { logo_file: values.logo_file } as any),
    };
    
    console.log('📦 formattedData до добавления user_attributes:', formattedData);
    console.log('🖼️ logo_file в formattedData:', (formattedData as any).logo_file);

    // Добавляем данные пользователя при создании
    if (!isEdit && values.user) {
      formattedData.user_attributes = {
        email: values.user.email,
        phone: values.user.phone,
        first_name: values.user.first_name,
        last_name: values.user.last_name,
        password: values.user.password,
        role_id: getRoleId('partner'),
      };
    }

    // Всегда отправляем user_attributes с ролью Партнер при редактировании
    if (isEdit && partner?.user?.id && values.user) {
      formattedData.user_attributes = {
        id: partner.user.id,
        email: values.user.email,
        phone: values.user.phone,
        first_name: values.user.first_name,
        last_name: values.user.last_name,
        role_id: getRoleId('partner'), // Гарантируем роль Партнер
        ...(values.new_password?.trim()
          ? {
              password: values.new_password.trim(),
              password_confirmation: values.new_password.trim(),
            }
          : {}),
      };
    }

    console.log('Форматированные данные для отправки:', formattedData);
    return formattedData;
  };

  // Обработчик отправки формы
  const handleSubmit = async (values: FormValues, { setTouched }: any) => {
    console.log('🚀 handleSubmit вызван');
    console.log('📋 Значения формы:', values);
    console.log('✅ Форма валидна:', formik.isValid);
    console.log('📁 Файл логотипа:', values.logo_file);
    
    try {
      setApiError(null);
      setSuccessMessage(null);
      setShowValidationErrors(false);
      
      // Проверяем валидность формы
      if (!formik.isValid) {
        console.log('❌ Форма не валидна, ошибки:', formik.errors);
        const touchedFields = Object.keys(formik.values).reduce((acc, field) => {
          acc[field] = true;
          if (field === 'user' && formik.values.user) {
            acc.user = Object.keys(formik.values.user).reduce((userAcc, userField) => {
              userAcc[userField] = true;
              return userAcc;
            }, {} as Record<string, boolean>);
          }
          return acc;
        }, {} as Record<string, any>);
        setTouched(touchedFields);
        setShowValidationErrors(true);
        return;
      }
      
      console.log('📤 Начинаем форматирование данных...');
      const formattedData = formatPartnerData(values);
      console.log('📦 Данные отформатированы, отправляем на сервер...');
      
      if (isEdit && id) {
        console.log('🔄 Обновляем партнера ID:', id);
        const response = await updatePartner({ id: parseInt(id), partner: formattedData }).unwrap();
        console.log('✅ Ответ сервера при обновлении:', response);
        console.log('🖼️ Логотип в ответе сервера:', response.logo);
        console.log('🖼️ logo_url в ответе сервера:', response.logo_url);
        
        // Обновляем preview логотипа, если есть новый логотип
        if (response.logo) {
          console.log('🔄 Обновляем preview логотипа на:', response.logo);
          setLogoPreview(response.logo);
          // Очищаем файл, так как логотип уже загружен
          setLogoFile(null);
        }
        
        setSuccessMessage(t('forms.partner.messages.updateSuccess'));
        setTimeout(() => navigate('/admin/partners'), 1500);
      } else {
        console.log('➕ Создаем нового партнера');
        const response = await createPartner({ partner: formattedData }).unwrap();
        console.log('✅ Ответ сервера при создании:', response);
        setSuccessMessage(t('forms.partner.messages.createSuccess'));
        navigate('/admin/partners');
      }
    } catch (error: any) {
      console.log('Полная ошибка:', error);
      let errorMessage = t('forms.partner.errors.saveError');
      
      if (error.data?.errors) {
        errorMessage = Object.entries(error.data.errors)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ');
      } else if (error.error) {
        errorMessage = error.error;
      }
      
      setApiError(errorMessage);
    }
  };

  // Мемоизированные начальные значения
  const initialValues = useMemo(() => {
    if (partner && isEdit) {
      return {
        company_name: partner.company_name || '',
        company_description: partner.company_description || '',
        contact_person: partner.contact_person || '',
        logo_url: partner.logo_url || '',
        website: partner.website || '',
        tax_number: partner.tax_number || '',
        legal_address: partner.legal_address || '',
        region_id: partner.region_id || undefined,
        city_id: partner.city_id || undefined,
        is_active: partner.is_active ?? true,
        user: {
          email: partner.user?.email || '',
          phone: partner.user?.phone || '',
          first_name: partner.user?.first_name || '',
          last_name: partner.user?.last_name || '',
        },
        new_password: '',
      };
    }
    return {
      company_name: '',
      company_description: '',
      contact_person: '',
      logo_url: '',
      website: '',
      tax_number: '',
      legal_address: '',
      region_id: undefined,
      city_id: undefined,
      is_active: true,
      user: {
        email: '',
        phone: '',
        first_name: '',
        last_name: '',
        password: '',
      },
      new_password: '',
    };
  }, [partner, isEdit]);

  // Используем FormikProps для типизации
  const formik = useFormik<FormValues>({
    initialValues,
    enableReinitialize: true, // Позволяет переинициализировать форму при изменении initialValues
    validationSchema: useMemo(() => createValidationSchema(isEdit, t), [isEdit, t]),
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: handleSubmit,
  });

  // Вкладки для режима редактирования
  const tabs = useMemo(() => {
    const baseTabs = [
                  { label: t('forms.partner.tabs.basicInfo'), value: 0 },
    ];
          if (isEdit) {
        baseTabs.push({ label: t('forms.partner.tabs.servicePoints'), value: 1 });
        baseTabs.push({ label: t('forms.partner.tabs.operators'), value: 2 });
    }
    return baseTabs;
  }, [isEdit]);

  // Определяем колонки для таблицы сервисных точек
  const servicePointColumns: Column[] = useMemo(() => [
    {
      id: 'name',
      label: t('tables.columns.name'),
      format: (value, row: ServicePoint) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <BusinessIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="body2">{row.name}</Typography>
        </Box>
      ),
      minWidth: 150,
    },
    {
      id: 'address',
      label: t('tables.columns.address'),
      format: (value, row: ServicePoint) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <LocationOnIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="body2">{row.address}</Typography>
        </Box>
      ),
      minWidth: 200,
    },
    {
      id: 'city',
      label: t('tables.columns.city'),
      format: (value, row: ServicePoint) => {
        // Проверяем, что city существует и имеет свойство name
        return typeof row.city === 'object' && row.city ? getLocalizedName(row.city) : '-';
      },
      minWidth: 120,
    },
    {
      id: 'is_active',
      label: t('tables.columns.status'),
      format: (value, row: ServicePoint) => (
        <FormControlLabel
          control={
            <Switch
              checked={row.is_active}
              onChange={() => handleToggleServicePointStatus(row)}
              size="small"
            />
          }
          label=""
          sx={{ m: 0 }}
        />
      ),
      align: 'center',
      minWidth: 100,
    },
    {
      id: 'actions',
      label: t('tables.columns.actions'),
      format: (value, row: ServicePoint) => (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Tooltip title={t('tables.actions.edit')}>
            <Button
              size="small"
              onClick={() => handleEditServicePoint(row.id)}
              sx={{ minWidth: 'auto', p: 1 }}
            >
              <EditIcon fontSize="small" />
            </Button>
          </Tooltip>
          <Tooltip title={t('tables.actions.delete')}>
            <Button
              size="small"
              color="error"
              onClick={() => handleDeleteServicePoint(row)}
              sx={{ minWidth: 'auto', p: 1 }}
            >
              <DeleteIcon fontSize="small" />
            </Button>
          </Tooltip>
        </Box>
      ),
      align: 'center',
      minWidth: 120,
    },
  ], [t]);

  // Обработчики для сервисных точек
  const handleEditServicePoint = (servicePointId: number) => {
    if (id) {
      navigate(`/admin/partners/${id}/service-points/${servicePointId}/edit`, {
        state: { from: `/admin/partners/${id}/edit` }
      });
    }
  };

  const handleDeleteServicePoint = (servicePoint: any) => {
    // Здесь будет логика удаления или открытия диалога подтверждения
    console.log('Удаление сервисной точки:', servicePoint);
  };

  const handleAddServicePoint = () => {
    if (id) {
      navigate(`/admin/partners/${id}/service-points/new`, {
        state: { from: `/admin/partners/${id}/edit` }
      });
    }
  };

  // Обработчик изменения региона
  const handleRegionChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    const newRegionId = value === '' ? undefined : parseInt(value);
    setSelectedRegionId(newRegionId);
    formik.setFieldValue('region_id', newRegionId);
    formik.setFieldValue('city_id', undefined);
  };

  // Обработчик изменения города
  const handleCityChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    const newCityId = value === '' ? undefined : parseInt(value);
    formik.setFieldValue('city_id', newCityId);
  };

  // Функция для переключения активности партнера
  // Константы для работы с файлами
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ACCEPTED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  // Обработчик изменения логотипа
  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Валидация размера файла
      if (file.size > MAX_FILE_SIZE) {
        setApiError(t('forms.partner.errors.fileSizeError'));
        setTimeout(() => setApiError(null), 3000);
        return;
      }

      // Валидация типа файла
      if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
        setApiError(t('forms.partner.errors.fileFormatError'));
        setTimeout(() => setApiError(null), 3000);
        return;
      }

      setLogoFile(file);
      formik.setFieldValue('logo_file', file);
      
      // Создание предпросмотра
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Обработчик удаления логотипа
  const handleLogoDelete = () => {
    setLogoFile(null);
    setLogoPreview(null);
    formik.setFieldValue('logo_file', null);
    formik.setFieldValue('logo_url', '');
  };

  const handlePartnerActiveToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newActiveStatus = e.target.checked;
    
    // Если деактивируем партнера и это режим редактирования
    if (!newActiveStatus && isEdit && partnerId) {
      // Показываем диалог подтверждения
      if (window.confirm(
        t('forms.partner.confirmations.deactivatePartner')
      )) {
        try {
          // Вызываем API для деактивации партнера (это автоматически деактивирует связанные записи)
          await togglePartnerActive({ 
            id: partnerId, 
            isActive: false 
          }).unwrap();
          
          formik.setFieldValue('is_active', false);
          setSuccessMessage(t('forms.partner.messages.deactivateSuccess'));
          
          // Обновляем данные сервисных точек и операторов
          if (servicePointsData) {
            refetchServicePoints();
          }
          if (operators) {
            refetchOperators();
          }
        } catch (error: any) {
          setApiError(error?.data?.message || t('forms.partner.errors.deactivateError'));
          setTimeout(() => setApiError(null), 3000);
        }
      }
    } else {
      // Для активации или при создании просто меняем значение
      if (newActiveStatus && isEdit && partnerId) {
        try {
          await togglePartnerActive({ 
            id: partnerId, 
            isActive: true 
          }).unwrap();
          
          formik.setFieldValue('is_active', true);
          setSuccessMessage(t('forms.partner.messages.activateSuccess'));
          setTimeout(() => setSuccessMessage(null), 3000);
        } catch (error: any) {
          setApiError(error?.data?.message || t('forms.partner.errors.activateError'));
          setTimeout(() => setApiError(null), 3000);
        }
      } else {
        formik.setFieldValue('is_active', newActiveStatus);
      }
    }
  };

  // Эффект для установки предпросмотра логотипа при редактировании
  useEffect(() => {
    // Приоритет у нового поля logo (Active Storage), потом logo_url
    const logoToUse = partner?.logo || partner?.logo_url;
    if (logoToUse) {
      const logoUrl = logoToUse.startsWith('http') || logoToUse.startsWith('/storage/')
        ? logoToUse
        : `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}${logoToUse}`;
      setLogoPreview(logoUrl);
      console.log('🖼️ Установлен preview логотипа:', logoUrl);
    }
  }, [partner]);

  // Функция для смены вкладки
  const handleTabChange = (event: React.SyntheticEvent, value: any) => setActiveTab(Number(value));

  // Вкладка "Сотрудники" - новая улучшенная версия
  const renderOperatorsTab = () => (
    <Box sx={{ mt: 2 }}>
      <PartnerOperatorsManager
        partnerId={Number(id)}
        partnerName={partner?.company_name}
        onOperatorChange={() => {
          // Обновляем данные операторов при изменениях
          refetchOperators();
        }}
        onAddOperator={handleAddOperator}
      />
      
      {/* Сохраняем старую модальную форму для совместимости */}
      <OperatorModal 
        open={operatorModalOpen} 
        onClose={() => setOperatorModalOpen(false)} 
        onSave={handleSaveOperator} 
        operator={editingOperator} 
      />
    </Box>
  );

  if (partnerLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  const isLoading = createLoading || updateLoading;

  return (
    <Box sx={tablePageStyles.pageContainer}>
      {/* Заголовок и навигация */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: SIZES.spacing.lg 
      }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/admin/partners')}
          sx={{ 
            ...secondaryButtonStyles,
            mr: SIZES.spacing.md 
          }}
        >
          {t('common.back')}
        </Button>
        <Typography 
          variant="h4" 
          sx={{ fontSize: SIZES.fontSize.xl }}
        >
                        {isEdit ? t('forms.partner.title.edit') : t('forms.partner.title.create')}
        </Typography>
      </Box>
      
      {/* Вкладки (только в режиме редактирования) */}
      {isEdit && (
        <Box sx={{ mb: SIZES.spacing.md }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
          >
            {tabs.map((tab, index) => (
              <Tab key={index} label={tab.label} />
            ))}
          </Tabs>
        </Box>
      )}
          
      <form onSubmit={formik.handleSubmit}>
        {/* Вкладка основной информации */}
        <TabPanel value={activeTab} index={0}>
          <Paper sx={cardStyles}>
            <Grid container spacing={SIZES.spacing.lg}>
              {/* Основная информация о компании */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  {t('forms.partner.sections.companyInfo')}
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  name="company_name"
                  label={t("forms.partner.fields.companyName")}
                  value={formik.values.company_name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={(formik.touched.company_name || showValidationErrors) && Boolean(formik.errors.company_name)}
                  helperText={(formik.touched.company_name || showValidationErrors) && formik.errors.company_name}
                  sx={textFieldStyles}
                />
              </Grid>



              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  name="company_description"
                  label={t("forms.partner.fields.companyDescription")}
                  value={formik.values.company_description}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.company_description && Boolean(formik.errors.company_description)}
                  helperText={formik.touched.company_description && formik.errors.company_description}
                  sx={textFieldStyles}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="website"
                  label={t("forms.partner.fields.website")}
                  placeholder={t("forms.partner.placeholders.website")}
                  value={formik.values.website}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.website && Boolean(formik.errors.website)}
                  helperText={formik.touched.website && formik.errors.website}
                  sx={textFieldStyles}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={textFieldStyles}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    {t('forms.partner.fields.logo')}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {/* Предпросмотр логотипа */}
                    <Avatar
                      src={logoPreview || undefined}
                      variant="square"
                      sx={{
                        width: 80,
                        height: 80,
                        bgcolor: theme.palette.grey[200],
                      }}
                    >
                      {!logoPreview && <BrokenImageIcon />}
                    </Avatar>

                    {/* Кнопки управления логотипом */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <input
                        accept="image/*"
                        id="logo-upload"
                        type="file"
                        onChange={handleLogoChange}
                        style={{ display: 'none' }}
                      />
                      <label htmlFor="logo-upload">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}>
                          <IconButton color="primary" component="span">
                            <UploadIcon />
                          </IconButton>
                          <Typography variant="body2" color="primary">
                            {t('forms.partner.fields.uploadLogo')}
                          </Typography>
                        </Box>
                      </label>
                      
                      {logoPreview && (
                        <IconButton color="error" onClick={handleLogoDelete}>
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Box>
                  </Box>

                  <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
                    {t('forms.partner.messages.logoFormats')}
                  </Typography>
                </Box>
              </Grid>

              {/* t('forms.partner.sections.legalInfo') */}
              <Grid item xs={12}>
                <Typography 
                  variant="h6" 
                  gutterBottom 
                  sx={{ 
                    mt: SIZES.spacing.md,
                    fontSize: SIZES.fontSize.lg 
                  }}
                >
                  {t('forms.partner.sections.legalInfo')}
                </Typography>
                <Divider sx={{ mb: SIZES.spacing.md }} />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="tax_number"
                  label={t('forms.partner.fields.taxNumberOptional')}
                  placeholder={t("forms.partner.placeholders.taxNumber")}
                  value={formik.values.tax_number}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.tax_number && Boolean(formik.errors.tax_number)}
                  helperText={formik.touched.tax_number && formik.errors.tax_number}
                  sx={textFieldStyles}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  name="legal_address"
                  label={t("forms.partner.fields.legalAddress")}
                  value={formik.values.legal_address}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={(formik.touched.legal_address || showValidationErrors) && Boolean(formik.errors.legal_address)}
                  helperText={(formik.touched.legal_address || showValidationErrors) && formik.errors.legal_address}
                  sx={textFieldStyles}
                />
              </Grid>

              {/* t('forms.partner.sections.location') */}
              <Grid item xs={12}>
                <Typography 
                  variant="h6" 
                  gutterBottom 
                  sx={{ 
                    mt: SIZES.spacing.md,
                    fontSize: SIZES.fontSize.lg 
                  }}
                >
                  {t('forms.partner.sections.location')}
                </Typography>
                <Divider sx={{ mb: SIZES.spacing.md }} />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth required error={formik.touched.region_id && Boolean(formik.errors.region_id)}>
                  <InputLabel id="region-select-label">{t("forms.partner.fields.region")}</InputLabel>
                  <Select
                    id="region_id"
                    name="region_id"
                    value={formik.values.region_id?.toString() || ''}
                    label={t('forms.partner.fields.region')}
                    onChange={handleRegionChange}
                    error={formik.touched.region_id && Boolean(formik.errors.region_id)}
                    disabled={isLoading}
                  >
                    <MenuItem value="">{t('forms.partner.placeholders.selectRegion')}</MenuItem>
                    {regionsData?.data.map((region) => (
                      <MenuItem key={region.id} value={region.id}>
                        {getLocalizedName(region)}
                      </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.region_id && formik.errors.region_id && (
                    <Typography variant="caption" color="error">
                      {formik.errors.region_id}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl 
                  fullWidth 
                  required 
                  disabled={!formik.values.region_id}
                  error={formik.touched.city_id && Boolean(formik.errors.city_id)}
                >
                  <InputLabel id="city-select-label">{t("forms.partner.fields.city")}</InputLabel>
                  <Select
                    id="city_id"
                    name="city_id"
                    value={formik.values.city_id?.toString() || ''}
                    label={t('forms.partner.fields.city')}
                    onChange={handleCityChange}
                    error={formik.touched.city_id && Boolean(formik.errors.city_id)}
                    disabled={isLoading || !formik.values.region_id}
                  >
                    <MenuItem value="">{t('forms.partner.placeholders.selectCity')}</MenuItem>
                    {citiesData?.data.map((city) => (
                      <MenuItem key={city.id} value={city.id}>
                        {getLocalizedName(city)}
                      </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.city_id && formik.errors.city_id && (
                    <Typography variant="caption" color="error">
                      {formik.errors.city_id}
                    </Typography>
                  )}
                  {citiesLoading && (
                    <Typography variant="caption" color="text.secondary">
                      {t('forms.partner.messages.loadingCities')}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ ml: 2, mt: 1 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formik.values.is_active}
                        onChange={handlePartnerActiveToggle}
                        name="is_active"
                      />
                    }
                    label={t('forms.partner.fields.isActive')}
                  />
                  {!formik.values.is_active && (
                    <Typography variant="caption" color="warning.main" sx={{ display: 'block', mt: 1 }}>
                      {t('forms.partner.messages.deactivationWarning')}
                    </Typography>
                  )}
                </Box>
              </Grid>

              {/* Добавляем поле изменения пароля и данные пользователя в режиме редактирования */}
              {isEdit && (
                <Grid item xs={12}>
                  <Typography 
                    variant="h6" 
                    gutterBottom 
                    sx={{ 
                      mt: SIZES.spacing.md,
                      fontSize: SIZES.fontSize.lg 
                    }}
                  >
                    {t('forms.partner.sections.adminData')}
                  </Typography>
                  <Divider sx={{ mb: SIZES.spacing.md }} />
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        required
                        name="user.email"
                        label={t('forms.partner.fields.email')}
                        type="email"
                        value={formik.values.user?.email || ''}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={Boolean((formik.touched.user as any)?.email && (formik.errors.user as any)?.email)}
                        helperText={(formik.touched.user as any)?.email && (formik.errors.user as any)?.email}
                        sx={textFieldStyles}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <PhoneField
                        fullWidth
                        required
                        name="user.phone"
                        label={t('forms.partner.fields.phone')}
                        value={formik.values.user?.phone || ''}
                        onChange={(value) => formik.setFieldValue('user.phone', value)}
                        onBlur={() => formik.setFieldTouched('user.phone', true)}
                        error={Boolean((formik.touched.user as any)?.phone && (formik.errors.user as any)?.phone)}
                        helperText={(formik.touched.user as any)?.phone && (formik.errors.user as any)?.phone}
                        sx={textFieldStyles}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        required
                        name="user.first_name"
                        label={t('forms.partner.fields.firstName')}
                        value={formik.values.user?.first_name || ''}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={Boolean((formik.touched.user as any)?.first_name && (formik.errors.user as any)?.first_name)}
                        helperText={(formik.touched.user as any)?.first_name && (formik.errors.user as any)?.first_name}
                        sx={textFieldStyles}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        required
                        name="user.last_name"
                        label={t('forms.partner.fields.lastName')}
                        value={formik.values.user?.last_name || ''}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={Boolean((formik.touched.user as any)?.last_name && (formik.errors.user as any)?.last_name)}
                        helperText={(formik.touched.user as any)?.last_name && (formik.errors.user as any)?.last_name}
                        sx={textFieldStyles}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        name="new_password"
                        label={t('forms.partner.fields.newPassword')}
                        type="password"
                        value={formik.values.new_password || ''}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.new_password && Boolean(formik.errors.new_password)}
                        helperText={formik.touched.new_password && formik.errors.new_password}
                        sx={textFieldStyles}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">
                        {t('forms.partner.messages.passwordHint')}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              )}

              {/* t('forms.partner.sections.userInfo') (только при создании) */}
              {!isEdit && (
                <>
                  <Grid item xs={12}>
                    <Typography 
                      variant="h6" 
                      gutterBottom 
                      sx={{ 
                        mt: SIZES.spacing.md,
                        fontSize: SIZES.fontSize.lg 
                      }}
                    >
                      {t('forms.partner.sections.adminData')}
                    </Typography>
                    <Divider sx={{ mb: SIZES.spacing.md }} />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      required
                      name="user.first_name"
                      label={t('forms.partner.fields.firstName')}
                      value={formik.values.user?.first_name || ''}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={(formik.touched.user as FormikTouched['user'])?.first_name && Boolean((formik.errors.user as FormikErrors['user'])?.first_name)}
                      helperText={(formik.touched.user as FormikTouched['user'])?.first_name && (formik.errors.user as FormikErrors['user'])?.first_name}
                      sx={textFieldStyles}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      required
                      name="user.last_name"
                      label={t('forms.partner.fields.lastName')}
                      value={formik.values.user?.last_name || ''}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={(formik.touched.user as FormikTouched['user'])?.last_name && Boolean((formik.errors.user as FormikErrors['user'])?.last_name)}
                      helperText={(formik.touched.user as FormikTouched['user'])?.last_name && (formik.errors.user as FormikErrors['user'])?.last_name}
                      sx={textFieldStyles}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      required
                      name="user.email"
                      label={t('forms.partner.fields.email')}
                      type="email"
                      value={formik.values.user?.email || ''}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={(formik.touched.user as FormikTouched['user'])?.email && Boolean((formik.errors.user as FormikErrors['user'])?.email)}
                      helperText={(formik.touched.user as FormikTouched['user'])?.email && (formik.errors.user as FormikErrors['user'])?.email}
                      sx={textFieldStyles}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <PhoneField
                      fullWidth
                      required
                      name="user.phone"
                      label={t('forms.partner.fields.phone')}
                      value={formik.values.user?.phone || ''}
                      onChange={(value) => formik.setFieldValue('user.phone', value)}
                      onBlur={() => formik.setFieldTouched('user.phone', true)}
                      error={(formik.touched.user as FormikTouched['user'])?.phone && Boolean((formik.errors.user as FormikErrors['user'])?.phone)}
                      helperText={(formik.touched.user as FormikTouched['user'])?.phone && (formik.errors.user as FormikErrors['user'])?.phone}
                      sx={textFieldStyles}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      name="user.password"
                      label={t('forms.partner.fields.password')}
                      type="password"
                      value={formik.values.user?.password || ''}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={(formik.touched.user as FormikTouched['user'])?.password && Boolean((formik.errors.user as FormikErrors['user'])?.password)}
                      helperText={(formik.touched.user as FormikTouched['user'])?.password && (formik.errors.user as FormikErrors['user'])?.password}
                      sx={textFieldStyles}
                    />
                  </Grid>
                </>
              )}

              {/* Отображение ошибок и кнопки действий */}
              <Grid item xs={12}>
                <Divider sx={{ my: SIZES.spacing.md }} />
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mt: SIZES.spacing.md
                }}>
                  {/* Отображение ошибок */}
                  <Box>
                    {apiError && (
                      <Alert severity="error" sx={{ mb: 2 }}>
                        {apiError}
                      </Alert>
                    )}
                    {successMessage && (
                      <Alert severity="success" sx={{ mb: 2 }}>
                        {successMessage}
                      </Alert>
                    )}
                    {showValidationErrors && !formik.isValid && (
                      <Alert severity="error" sx={{ mb: 2 }}>
                        {t('forms.partner.validation.fixErrors')}
                      </Alert>
                    )}
                  </Box>

                  {/* Кнопки действий */}
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={() => navigate('/admin/partners')}
                      sx={secondaryButtonStyles}
                    >
                      {t('forms.common.cancel')}
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={createLoading || updateLoading}
                      startIcon={
                        (createLoading || updateLoading) ? 
                          <CircularProgress size={20} color="inherit" /> : 
                          <SaveIcon />
                      }
                      onClick={!formik.isValid ? handleDisabledButtonClick : undefined}
                      sx={primaryButtonStyles}
                    >
                      {(createLoading || updateLoading) ? t('forms.common.saving') : t('forms.common.save')}
                    </Button>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </TabPanel>

        {/* Вкладка сервисных точек (только в режиме редактирования) */}
        {isEdit && (
          <TabPanel value={activeTab} index={1}>
            <Paper sx={cardStyles}>
              {/* Заголовок и кнопка добавления */}
              <Box sx={tablePageStyles.pageHeader}>
                <Typography variant="h5">
                  {t('admin.partnerServicePoints.title')}
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddServicePoint}
                >
                  {t('admin.partnerServicePoints.addButton')}
                </Button>
              </Box>

              {/* Отображение состояний загрузки и ошибок */}
              {servicePointsLoading ? (
                <Box sx={tablePageStyles.loadingContainer}>
                  <CircularProgress />
                </Box>
              ) : servicePointsData?.data?.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body1" color="text.secondary">
                    {t('admin.partnerServicePoints.empty')}
                  </Typography>
                </Box>
              ) : (
                <>
                  {/* Статистика */}
                  <Box sx={{ mb: 2, display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      {t('admin.partnerServicePoints.stats.total', { count: servicePointsData?.pagination?.total_count || 0 })}
                    </Typography>
                    {servicePointsData?.data && servicePointsData.data.length > 0 && (
                      <>
                        <Typography variant="body2" color="success.main">
                          {t('admin.partnerServicePoints.stats.active', { count: servicePointsData.data.filter(sp => sp.is_active).length })}
                        </Typography>
                        {servicePointsData.data.filter(sp => !sp.is_active).length > 0 && (
                          <Typography variant="body2" color="error.main">
                            {t('admin.partnerServicePoints.stats.inactive', { count: servicePointsData.data.filter(sp => !sp.is_active).length })}
                          </Typography>
                        )}
                      </>
                    )}
                  </Box>
                  {/* Таблица сервисных точек */}
                  <Box sx={tablePageStyles.tableContainer}>
                    <Table 
                      columns={servicePointColumns}
                      rows={servicePointsData?.data || []}
                    />
                  </Box>
                  {/* Пагинация */}
                  {servicePointsData?.pagination && Math.ceil(servicePointsData.pagination.total_count / 25) > 1 && (
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      mt: 3
                    }}>
                      <Pagination
                        count={Math.ceil(servicePointsData.pagination.total_count / 25)}
                        page={1}
                        onChange={(newPage) => console.log('Переход на страницу:', newPage)}
                        color="primary"
                      />
                    </Box>
                  )}
                </>
              )}
            </Paper>
          </TabPanel>
        )}

        {/* Вкладка "Сотрудники" */}
        {isEdit && (
          <TabPanel value={activeTab} index={2}>
            {renderOperatorsTab()}
          </TabPanel>
        )}
      </form>
    </Box>
  );
};

export default PartnerFormPage;