import * as yup from 'yup';

/**
 * Валидация номера телефона в формате +38XXXXXXXXXX
 * Примеры: +380671234567, +380991234567
 */
export const phoneValidation = yup
  .string()
  .matches(/^\+380\d{9}$/, 'Телефон должен быть в формате +380XXXXXXXXX')
  .nullable();

/**
 * Функция для валидации номера телефона
 * @param value строка для проверки
 * @returns true если номер валидный, false если нет
 */
export const validatePhoneNumber = (value: string): boolean => {
  if (!value) return false;
  const phoneRegex = /^\+380\d{9}$/;
  return phoneRegex.test(value);
};

/**
 * Функция для форматирования номера телефона
 * @param value строка для форматирования
 * @returns отформатированный номер телефона
 */
export const formatPhoneNumber = (value: string): string => {
  if (!value) return '';
  // Убираем все нецифры и +
  const digits = value.replace(/[^\d+]/g, '');
  // Если номер начинается с 0, добавляем +38
  if (digits.startsWith('0')) {
    return '+38' + digits;
  }
  // Если номер начинается с 380, добавляем +
  if (digits.startsWith('380')) {
    return '+' + digits;
  }
  // Если номер начинается с +, оставляем как есть
  if (digits.startsWith('+')) {
    return digits;
  }
  // В остальных случаях добавляем +380
  return '+380' + digits;
}; 