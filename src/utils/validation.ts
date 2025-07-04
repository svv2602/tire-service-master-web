import * as yup from 'yup';

/**
 * Валидация номера телефона в формате +38XXXXXXXXXX
 * Примеры: +380671234567, +380991234567
 */
export const phoneValidation = yup
  .string()
  .matches(/^\+38\d{10}$/, 'Телефон должен быть в формате +38 (0ХХ)ХХХ-ХХ-ХХ')
  .nullable();

/**
 * Функция для валидации номера телефона
 * @param value строка для проверки
 * @returns true если номер валидный, false если нет
 */
export const validatePhoneNumber = (value: string): boolean => {
  if (!value) return false;
  const phoneRegex = /^\+38\d{10}$/;
  return phoneRegex.test(value);
};

/**
 * Функция для форматирования номера телефона
 * @param value строка для форматирования
 * @returns отформатированный номер телефона в формате +38XXXXXXXXXX
 */
export const formatPhoneNumber = (value: string): string => {
  if (!value) return '';
  // Убираем все символы кроме цифр
  const digits = value.replace(/\D/g, '');
  
  // Если номер начинается с 0 (например, 0671234567)
  if (digits.startsWith('0') && digits.length === 10) {
    return '+38' + digits;
  }
  
  // Если номер начинается с 380 (например, 380671234567)
  if (digits.startsWith('380') && digits.length === 12) {
    return '+38' + digits.substring(3);
  }
  
  // Если номер начинается с 38 (например, 38671234567)
  if (digits.startsWith('38') && digits.length === 11) {
    return '+' + digits;
  }
  
  // Если уже есть + в начале, сохраняем только цифры после +38
  if (value.startsWith('+38') && digits.length >= 10) {
    return '+38' + digits.substring(2, 12);
  }
  
  // В остальных случаях добавляем +38 к первым 10 цифрам
  if (digits.length >= 9) {
    return '+38' + digits.substring(0, 10);
  }
  
  return '+38' + digits;
}; 