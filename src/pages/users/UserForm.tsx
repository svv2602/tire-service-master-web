import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
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
  RadioGroup,
  Radio,
  FormLabel,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Save as SaveIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { 
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
} from '../../api';

import { UserFormData } from '../../types/user';
import { PhoneField } from '../../components/ui/PhoneField';
import { phoneValidation } from '../../utils/validation';

// Импорт централизованной системы стилей
import { getCardStyles, getButtonStyles, getTextFieldStyles, SIZES, getTablePageStyles } from '../../styles';

/**
 * Страница формы пользователя - создание и редактирование пользователей
 * 
 * Функциональность:
 * - Создание нового пользователя
 * - Редактирование существующего пользователя
 * - Валидация полей формы с помощью Yup
 * - Управление ролями пользователей
 * - Интеграция с RTK Query для API операций
 * - Централизованная система стилей для консистентного UI
 * - Выбор типа входа: email или телефон
 * 
 * Разделы формы:
 * - t('forms.user.sections.loginType') (email или телефон)
 * - t('forms.user.sections.basicInfo') (имя, фамилия, отчество, email, телефон)
 * - t('forms.user.sections.roleAndStatus') (роль пользователя, активность)
 * - Пароль (обязательный при создании, опциональный при редактировании)
 */
const UserForm: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const userId = isEdit ? parseInt(id!, 10) : 0;

  const navigate = useNavigate();
  const theme = useTheme();
  const [apiError, setApiError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  
  // Состояние для типа входа (email или телефон)
  const [loginType, setLoginType] = React.useState<'email' | 'phone'>('email');

  // Централизованная система стилей
  const cardStyles = getCardStyles(theme, 'primary');
  const textFieldStyles = getTextFieldStyles(theme, 'filled');
  const primaryButtonStyles = getButtonStyles(theme, 'primary');
  const secondaryButtonStyles = getButtonStyles(theme, 'secondary');
  const tablePageStyles = getTablePageStyles(theme);

  // RTK Query хуки
  const { 
    data: userData,
    isLoading: isLoadingUser,
  } = useGetUserByIdQuery(userId.toString(), {
    skip: !isEdit
  });

  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  const isLoading = isLoadingUser || isCreating || isUpdating;

  // Состояние для отображения ошибок валидации
  const [showValidationErrors, setShowValidationErrors] = React.useState(false);

  // Динамическая схема валидации в зависимости от типа входа
  const getValidationSchema = (loginType: 'email' | 'phone', t: any) => {
    return yup.object({
      email: loginType === 'email' 
        ? yup.string().email(t('forms.user.validation.emailInvalid')).required(t('forms.user.validation.emailRequired'))
        : yup.string().email(t('forms.user.validation.emailInvalid')).nullable(),
      phone: loginType === 'phone' 
        ? phoneValidation.required(t('forms.user.validation.phoneRequired'))
        : phoneValidation,
      first_name: yup
        .string()
        .required(t('forms.user.validation.firstNameRequired'))
        .min(2, t('forms.user.validation.firstNameMin')),
      last_name: yup
        .string()
        .required(t('forms.user.validation.lastNameRequired'))
        .min(2, t('forms.user.validation.lastNameMin')),
      middle_name: yup
        .string()
        .nullable(),
      role_id: yup
        .number()
        .required(t('forms.user.validation.roleRequired')),
      is_active: yup
        .boolean(),
      password: isEdit
        ? yup.string().min(6, t('forms.user.validation.passwordMin')).nullable()
        : yup.string().min(6, t('forms.user.validation.passwordMin')).required(t('forms.user.validation.passwordRequired')),
      password_confirmation: yup
        .string()
        .oneOf([yup.ref('password')], t('forms.user.validation.passwordsNotMatch'))
        .nullable()
    });
  };

  // Функция для получения списка незаполненных обязательных полей
  const getRequiredFieldErrors = () => {
    const requiredFields = {
      ...(loginType === 'email' && { email: t('forms.user.fields.email') }),
      ...(loginType === 'phone' && { phone: t('forms.user.fields.phone') }),
      first_name: t('forms.user.fields.firstName'), 
      last_name: t('forms.user.fields.lastName'),
      role_id: t('forms.user.fields.role'),
      ...((!isEdit) && { password: t('forms.user.fields.password') })
    };

    const errors: string[] = [];
    Object.entries(requiredFields).forEach(([field, label]) => {
      if (!formik.values[field as keyof UserFormData] || 
          (field === 'role_id' && !formik.values.role_id)) {
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
      }, {} as Record<string, boolean>);
      formik.setTouched(touchedFields);
      setShowValidationErrors(true);
    }
  };

  // Функция для извлечения сообщения об ошибке
  const extractErrorMessage = (error: any): string => {
    if (error?.data?.message) {
      return error.data.message;
    }
    if (error?.data?.errors) {
      const errors = Object.values(error.data.errors).flat();
      return errors.join(', ');
    }
    if (error?.message) {
      return error.message;
    }
    return 'Произошла неизвестная ошибка';
  };

  // Начальные значения формы
  const initialFormValues: UserFormData = {
    email: '',
    first_name: '',
    last_name: '',
    middle_name: '',
    phone: '',
    role_id: 5, // По умолчанию клиент (role_id = 5)
    is_active: true,
    password: '',
    password_confirmation: ''
  };
  
  // Formik хук для управления формой
  const formik = useFormik({
    initialValues: initialFormValues,
    validationSchema: React.useMemo(() => getValidationSchema(loginType, t), [loginType, isEdit, t]),
    validateOnChange: true,
    validateOnBlur: true,
    enableReinitialize: true,
    onSubmit: async (values, { setTouched }) => {
      try {
        setApiError(null);
        setSuccessMessage(null);
        setShowValidationErrors(false);
        
        // Проверяем валидность формы
        if (!formik.isValid) {
          // Помечаем все поля как затронутые для показа ошибок
          const touchedFields = Object.keys(formik.values).reduce((acc, field) => {
            acc[field] = true;
            return acc;
          }, {} as Record<string, boolean>);
          setTouched(touchedFields);
          setShowValidationErrors(true);
          return;
        }
        
        // Подготавливаем данные для API
        const userData: UserFormData = {
          email: values.email,
          first_name: values.first_name,
          last_name: values.last_name,
          middle_name: values.middle_name || '',
          phone: values.phone || '',
          role_id: values.role_id || 5,
          is_active: values.is_active,
          password: values.password || '',
          password_confirmation: values.password_confirmation || ''
        };

        console.log('Отправляемые данные пользователя:', userData);
        
        if (isEdit) {
          await updateUser({ id: userId.toString(), data: userData }).unwrap();
          setSuccessMessage(t('forms.user.messages.updateSuccess'));
        } else {
          await createUser(userData).unwrap();
          setSuccessMessage(t('forms.user.messages.createSuccess'));
        }
        
        // Переходим к списку пользователей через небольшую задержку
                  setTimeout(() => {
            navigate('/admin/users');
          }, 1500);
      } catch (error: any) {
        console.error('Ошибка при сохранении пользователя:', error);
        console.error('Детали ошибки:', {
          status: error.status,
          data: error.data,
          message: error.message
        });
        setApiError(extractErrorMessage(error));
      }
    },
  });

  // Функция для обработки смены типа входа
  const handleLoginTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newLoginType = event.target.value as 'email' | 'phone';
    setLoginType(newLoginType);
    
    // Очищаем ошибки валидации при смене типа
    formik.setErrors({});
    setShowValidationErrors(false);
    
    // Валидируем форму заново с новой схемой
    setTimeout(() => {
      formik.validateForm();
    }, 0);
  };
  
  // Обновление значений формы при получении данных пользователя
  useEffect(() => {
    if (isEdit && userData?.data) {
      const user = userData.data;
      
      // Определяем тип входа на основе заполненности полей
      if (user.email && !user.phone) {
        setLoginType('email');
      } else if (user.phone && !user.email) {
        setLoginType('phone');
      } else if (user.email && user.phone) {
        // Если оба поля заполнены, приоритет email
        setLoginType('email');
      }
      
      formik.setValues({
        email: user.email || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        middle_name: user.middle_name || '',
        phone: user.phone || '',
        role_id: user.role_id,
        is_active: user.is_active === true,
        password: '',
        password_confirmation: ''
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, userData]);

  // Повторная валидация при изменении loginType
  useEffect(() => {
    if (formik.values) {
      formik.validateForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loginType]);

  // Показываем индикатор загрузки при получении данных пользователя
  if (isLoadingUser) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={tablePageStyles.pageContainer}>
      {/* Заголовок с кнопкой "t('forms.common.back')" */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: SIZES.spacing.lg 
      }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/admin/users')}
          sx={{ 
            ...secondaryButtonStyles,
            mr: SIZES.spacing.md 
          }}
        >
          {t('forms.common.back')}
        </Button>
        <Typography 
          variant="h4" 
          sx={{ fontSize: SIZES.fontSize.xl }}
        >
          {isEdit ? t('forms.user.title.edit') : t('forms.user.title.create')}
        </Typography>
      </Box>
          
      <form onSubmit={formik.handleSubmit} autoComplete="off">
        <Paper sx={cardStyles}>
          <Grid container spacing={SIZES.spacing.lg}>
            {/* t('forms.user.sections.loginType') - только для создания нового пользователя */}
            {!isEdit && (
              <>
                <Grid item xs={12}>
                  <Typography 
                    variant="h6" 
                    gutterBottom 
                    sx={{ fontSize: SIZES.fontSize.lg }}
                  >
                    {t('forms.user.sections.loginType')}
                  </Typography>
                  <Divider sx={{ mb: SIZES.spacing.md }} />
                </Grid>

                <Grid item xs={12}>
                  <FormControl component="fieldset">
                    <FormLabel component="legend">{t('forms.loginType.selectMethod')}</FormLabel>
                    <RadioGroup
                      row
                      value={loginType}
                      onChange={handleLoginTypeChange}
                      sx={{ mt: 1 }}
                    >
                      <FormControlLabel 
                        value="email" 
                        control={<Radio />} 
                        label={t("forms.loginType.email")} 
                      />
                      <FormControlLabel 
                        value="phone" 
                        control={<Radio />} 
                        label={t("forms.loginType.phone")} 
                      />
                    </RadioGroup>
                  </FormControl>
                </Grid>
              </>
            )}

            {/* t('forms.user.sections.basicInfo') */}
            <Grid item xs={12}>
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ fontSize: SIZES.fontSize.lg }}
              >
                {t('forms.user.sections.basicInfo')}
              </Typography>
              <Divider sx={{ mb: SIZES.spacing.md }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required={loginType === 'email'}
                name="email"
                label={loginType === 'email' ? t('forms.user.fields.email') : t('forms.user.fields.emailOptional')}
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={(formik.touched.email || showValidationErrors) && Boolean(formik.errors.email)}
                helperText={(formik.touched.email || showValidationErrors) && formik.errors.email}
                sx={textFieldStyles}
                autoComplete="off"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <PhoneField
                fullWidth
                required={loginType === 'phone'}
                name="phone"
                label={loginType === 'phone' ? t('forms.user.fields.phone') : t('forms.user.fields.phoneOptional')}
                value={formik.values.phone}
                onChange={(value) => formik.setFieldValue('phone', value)}
                onBlur={() => formik.setFieldTouched('phone', true)}
                error={formik.touched.phone && Boolean(formik.errors.phone)}
                helperText={formik.touched.phone && formik.errors.phone}
                sx={textFieldStyles}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                name="first_name"
                label={t("forms.user.fields.firstName")}
                value={formik.values.first_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={(formik.touched.first_name || showValidationErrors) && Boolean(formik.errors.first_name)}
                helperText={(formik.touched.first_name || showValidationErrors) && formik.errors.first_name}
                sx={textFieldStyles}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                name="last_name"
                label={t("forms.user.fields.lastName")}
                value={formik.values.last_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={(formik.touched.last_name || showValidationErrors) && Boolean(formik.errors.last_name)}
                helperText={(formik.touched.last_name || showValidationErrors) && formik.errors.last_name}
                sx={textFieldStyles}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="middle_name"
                label={t("forms.user.fields.middleName")}
                value={formik.values.middle_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={(formik.touched.middle_name || showValidationErrors) && Boolean(formik.errors.middle_name)}
                helperText={(formik.touched.middle_name || showValidationErrors) && formik.errors.middle_name}
                sx={textFieldStyles}
              />
            </Grid>

            {/* t('forms.user.sections.roleAndStatus') */}
            <Grid item xs={12}>
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ 
                  mt: SIZES.spacing.md,
                  fontSize: SIZES.fontSize.lg 
                }}
              >
                {t('forms.user.sections.roleAndStatus')}
              </Typography>
              <Divider sx={{ mb: SIZES.spacing.md }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required error={(formik.touched.role_id || showValidationErrors) && Boolean(formik.errors.role_id)}>
                <InputLabel>{t('forms.user.fields.role')}</InputLabel>
                <Select
                  name="role_id"
                  value={formik.values.role_id}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={(formik.touched.role_id || showValidationErrors) && Boolean(formik.errors.role_id)}
                >
                  <MenuItem value={1}>{t('forms.user.roles.admin')}</MenuItem>
                  <MenuItem value={2}>{t('forms.user.roles.manager')}</MenuItem>
                  <MenuItem value={3}>{t('forms.user.roles.partner')}</MenuItem>
                  <MenuItem value={4}>{t('forms.user.roles.operator')}</MenuItem>
                  <MenuItem value={5}>{t('forms.user.roles.client')}</MenuItem>
                </Select>
                {(formik.touched.role_id || showValidationErrors) && formik.errors.role_id && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                    {formik.errors.role_id}
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
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => formik.setFieldValue('is_active', e.target.checked)}
                      name="is_active"
                    />
                  }
                  label={t("forms.user.fields.isActive")}
                />
              </Box>
            </Grid>

            {/* Пароль */}
            <Grid item xs={12}>
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ 
                  mt: SIZES.spacing.md,
                  fontSize: SIZES.fontSize.lg 
                }}
              >
                {isEdit ? t('forms.user.fields.changePassword') : t('forms.user.fields.password')}
              </Typography>
              <Divider sx={{ mb: SIZES.spacing.md }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required={!isEdit}
                type="password"
                name="password"
                label={isEdit ? t('forms.user.fields.newPassword') : t('forms.user.fields.password')}
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={(formik.touched.password || showValidationErrors) && Boolean(formik.errors.password)}
                helperText={(formik.touched.password || showValidationErrors) && formik.errors.password}
                sx={textFieldStyles}
                autoComplete="off"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required={!isEdit && Boolean(formik.values.password)}
                type="password"
                name="password_confirmation"
                label={t("forms.user.fields.confirmPassword")}
                value={formik.values.password_confirmation}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={(formik.touched.password_confirmation || showValidationErrors) && Boolean(formik.errors.password_confirmation)}
                helperText={(formik.touched.password_confirmation || showValidationErrors) && formik.errors.password_confirmation}
                sx={textFieldStyles}
                autoComplete="off"
              />
            </Grid>

            {/* Кнопки действий */}
            <Grid item xs={12}>
              {apiError && (
                <Alert severity="error" sx={{ mb: 2 }}>{apiError}</Alert>
              )}
              
              {successMessage && (
                <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>
              )}

              {/* Уведомление о незаполненных обязательных полях */}
              {(!formik.isValid && showValidationErrors) && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {t('forms.common.fillAllRequiredFields')}:
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
                <Alert severity="info" sx={{ mb: 2 }}>
                  {t('forms.common.fillRequiredFieldsToActivate')}
                </Alert>
              )}
              
              <Box sx={{ 
                display: 'flex', 
                gap: SIZES.spacing.md, 
                justifyContent: 'flex-end', 
                mt: SIZES.spacing.lg 
              }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/admin/users')}
                  disabled={isLoading}
                  sx={secondaryButtonStyles}
                >
                  {t('forms.common.cancel')}
                </Button>
                <Button
                  type={formik.isValid ? "submit" : "button"}
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={isLoading}
                  onClick={!formik.isValid ? handleDisabledButtonClick : undefined}
                  sx={{
                    ...primaryButtonStyles,
                    ...((!formik.isValid && !isLoading) && {
                      backgroundColor: theme.palette.warning.main,
                      '&:hover': {
                        backgroundColor: theme.palette.warning.dark,
                      }
                    })
                  }}
                >
                  {isLoading ? t('forms.common.saving') : (isEdit ? t('forms.common.update') : t('forms.common.create'))}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </form>
    </Box>
  );
};

export default UserForm;