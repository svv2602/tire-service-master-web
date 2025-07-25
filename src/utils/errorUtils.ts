/**
 * Утилиты для обработки ошибок API
 */

interface ApiError {
  status?: number;
  data?: {
    error?: string;
    message?: string;
    details?: Record<string, string[]>;
  };
  message?: string;
}

/**
 * Извлекает читаемое сообщение об ошибке из объекта ошибки API
 * @param error - Объект ошибки от API
 * @returns Строка с сообщением об ошибке
 */
export const extractErrorMessage = (error: any): string => {
  // Если это простая строка
  if (typeof error === 'string') {
    return error;
  }

  // Если это объект ошибки Error
  if (error instanceof Error) {
    return error.message;
  }

  // Обработка ошибок RTK Query / API
  const apiError = error as ApiError;

  // Проверяем наличие детализированных ошибок валидации
  if (apiError.data?.details && typeof apiError.data.details === 'object') {
    const details = apiError.data.details;
    const fieldErrors: string[] = [];
    
    // Собираем все ошибки полей
    Object.entries(details).forEach(([field, errors]) => {
      if (Array.isArray(errors) && errors.length > 0) {
        const fieldName = getFieldDisplayName(field);
        fieldErrors.push(`${fieldName}: ${errors.join(', ')}`);
      }
    });
    
    if (fieldErrors.length > 0) {
      return fieldErrors.join('; ');
    }
  }

  // Основное сообщение об ошибке
  if (apiError.data?.error) {
    return apiError.data.error;
  }

  if (apiError.data?.message) {
    return apiError.data.message;
  }

  if (apiError.message) {
    return apiError.message;
  }

  // Стандартные HTTP ошибки
  switch (apiError.status) {
    case 400:
      return 'Некорректный запрос';
    case 401:
      return 'Необходима авторизация';
    case 403:
      return 'Доступ запрещен';
    case 404:
      return 'Ресурс не найден';
    case 422:
      return 'Ошибка валидации данных';
    case 500:
      return 'Внутренняя ошибка сервера';
    case 503:
      return 'Сервис временно недоступен';
    default:
      return apiError.status 
        ? `Ошибка ${apiError.status}`
        : 'Произошла неизвестная ошибка';
  }
};

/**
 * Переводит техническое название поля в читаемое
 * @param fieldName - Техническое название поля
 * @returns Читаемое название поля
 */
const getFieldDisplayName = (fieldName: string): string => {
  const fieldNames: Record<string, string> = {
    email: 'E-mail',
    phone: 'Телефон',
    password: 'Пароль',
    password_confirmation: 'Подтверждение пароля',
    first_name: 'Имя',
    last_name: 'Фамилия',
    middle_name: 'Отчество',
    role_id: 'Роль',
    is_active: 'Статус активности',
    name: 'Название',
    address: 'Адрес',
    city_id: 'Город',
    partner_id: 'Партнер',
    work_status: 'Статус работы',
  };

  return fieldNames[fieldName] || fieldName;
};

/**
 * Проверяет, является ли ошибка ошибкой валидации
 * @param error - Объект ошибки
 * @returns true если это ошибка валидации
 */
export const isValidationError = (error: any): boolean => {
  return error?.status === 422 || 
         (error?.data?.details && typeof error.data.details === 'object');
};

/**
 * Извлекает детали ошибок валидации для отображения в форме
 * @param error - Объект ошибки
 * @returns Объект с ошибками полей
 */
export const extractValidationErrors = (error: any): Record<string, string> => {
  if (!isValidationError(error)) {
    return {};
  }

  const details = error.data?.details;
  if (!details || typeof details !== 'object') {
    return {};
  }

  const validationErrors: Record<string, string> = {};
  
  Object.entries(details).forEach(([field, errors]) => {
    if (Array.isArray(errors) && errors.length > 0) {
      validationErrors[field] = errors.join(', ');
    }
  });

  return validationErrors;
}; 