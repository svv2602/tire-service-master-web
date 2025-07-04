/**
 * Утилиты для работы с номерами телефонов
 */

/**
 * Извлекает только цифры из номера телефона, убирая код страны
 * @param phoneNumber - номер телефона в любом формате
 * @returns строка с цифрами без кода страны
 * 
 * @example
 * extractPhoneDigits('+38(050)123-45-67') // '0501234567'
 * extractPhoneDigits('+380501234567') // '0501234567'
 * extractPhoneDigits('050-123-45-67') // '0501234567'
 */
export const extractPhoneDigits = (phoneNumber: string): string => {
  if (!phoneNumber) return '';
  
  // Убираем все нецифровые символы
  const digitsOnly = phoneNumber.replace(/\D/g, '');
  
  // Если номер начинается с 38 (код Украины), убираем его
  if (digitsOnly.startsWith('38') && digitsOnly.length === 12) {
    return digitsOnly.substring(2);
  }
  
  // Если номер начинается с 380, убираем 380
  if (digitsOnly.startsWith('380') && digitsOnly.length === 13) {
    return digitsOnly.substring(3);
  }
  
  // Возвращаем как есть для других случаев
  return digitsOnly;
};

/**
 * Генерирует пароль из номера телефона (цифры без кода страны)
 * @param phoneNumber - номер телефона в любом формате
 * @returns пароль из цифр номера телефона
 * 
 * @example
 * generatePasswordFromPhone('+38(050)123-45-67') // '0501234567'
 */
export const generatePasswordFromPhone = (phoneNumber: string): string => {
  return extractPhoneDigits(phoneNumber);
};

/**
 * Форматирует номер телефона для отображения
 * @param phoneNumber - номер телефона
 * @returns отформатированный номер телефона
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  const digits = extractPhoneDigits(phoneNumber);
  
  if (digits.length === 10) {
    // Формат: 0XX XXX XX XX
    return `${digits.substring(0, 3)} ${digits.substring(3, 6)} ${digits.substring(6, 8)} ${digits.substring(8)}`;
  }
  
  return phoneNumber; // Возвращаем как есть, если формат не подходит
};

/**
 * Проверяет, является ли номер телефона валидным украинским номером
 * @param phoneNumber - номер телефона
 * @returns true, если номер валидный
 */
export const isValidUkrainianPhone = (phoneNumber: string): boolean => {
  const digits = extractPhoneDigits(phoneNumber);
  
  // Украинские номера должны начинаться с 0 и содержать 10 цифр
  return digits.length === 10 && digits.startsWith('0');
}; 