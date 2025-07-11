#!/usr/bin/env node

/**
 * Скрипт для создания правильного украинского файла переводов
 * на основе русского файла с переводом всех значений
 */

const fs = require('fs');

// Словарь переводов с русского на украинский
const translations = {
  // Общие
  "Сохранить": "Зберегти",
  "Отменить": "Скасувати",
  "Удалить": "Видалити",
  "Редактировать": "Редагувати",
  "Добавить": "Додати",
  "Закрыть": "Закрити",
  "Отправить": "Надіслати",
  "Поиск": "Пошук",
  "Загрузка...": "Завантаження...",
  "Ошибка": "Помилка",
  "Успешно": "Успішно",
  "Подтвердить": "Підтвердити",
  "Да": "Так",
  "Нет": "Ні",
  "Назад": "Назад",
  "Далее": "Далі",
  "Предыдущий": "Попередній",
  "Фильтр": "Фільтр",
  "Очистить": "Очистити",
  "Выбрать": "Вибрати",
  "Обязательное поле": "Обов'язкове поле",
  "Подтверждение удаления": "Підтвердження видалення",
  "Действия": "Дії",
  "Просмотреть": "Переглянути",
  "Активировать": "Активувати",
  "Деактивировать": "Деактивувати",
  "Изменить": "Змінити",
  
  // Навигация
  "Главная": "Головна",
  "Админ панель": "Адмін панель",
  "Пользователи": "Користувачі",
  "Партнеры": "Партнери",
  "Точки обслуживания": "Точки обслуговування",
  "Марки автомобилей": "Марки автомобілів",
  "Регионы": "Регіони",
  "Города": "Міста",
  "Услуги": "Послуги",
  "Контент страниц": "Контент сторінок",
  "Отзывы": "Відгуки",
  "Бронирования": "Бронювання",
  "Статьи": "Статті",
  "Выйти": "Вийти",
  
  // Авторизация
  "Вход": "Вхід",
  "Email": "Email",
  "Пароль": "Пароль",
  "Войти": "Увійти",
  "Забыли пароль?": "Забули пароль?",
  "Неверный email или пароль": "Невірний email або пароль",
  "Пожалуйста, заполните все поля": "Будь ласка, заповніть всі поля",
  
  // Язык
  "Украинский": "Українська",
  "Русский": "Російська",
  "Выбор языка": "Вибір мови",
  
  // Статусы
  "Активный": "Активний",
  "Неактивный": "Неактивний",
  "Ожидает": "Очікує",
  "Одобрено": "Схвалено",
  "Отклонено": "Відхилено",
  "Опубликовано": "Опубліковано",
  "Черновик": "Чернетка",
  "Архивировано": "Архівовано",
  "Работает": "Працює",
  "Временно закрыто": "Тимчасово закрито",
  "Приостановлено": "Призупинено",
  "Подтверждено": "Підтверджено",
  "Отменено": "Скасовано",
  "Завершено": "Завершено",
  
  // Формы
  "Создать": "Створити",
  "Обновить": "Оновити",
  "Новый пользователь": "Новий користувач",
  "Редактировать пользователя": "Редагувати користувача",
  "Имя": "Ім'я",
  "Фамилия": "Прізвище",
  "Телефон": "Телефон",
  "Роль": "Роль",
  "Администратор": "Адміністратор",
  "Партнер": "Партнер",
  "Клиент": "Клієнт",
  "Активный пользователь": "Активний користувач",
  
  // Ошибки
  "Это поле обязательно": "Це поле обов'язкове",
  "Некорректный формат email": "Некоректний формат email",
  "Некорректный формат телефона": "Некоректний формат телефону",
  "Пароль слишком короткий": "Пароль занадто короткий",
  "Пароли не совпадают": "Паролі не співпадають",
  "Поле слишком длинное": "Поле занадто довге",
  "Поле слишком короткое": "Поле занадто коротке",
  "Некорректный формат": "Некоректний формат",
  "Должно быть числом": "Має бути числом",
  "Должно быть положительным числом": "Має бути позитивним числом"
};

/**
 * Переводит строку с русского на украинский
 */
function translateText(text) {
  return translations[text] || text;
}

/**
 * Рекурсивно переводит объект
 */
function translateObject(obj) {
  if (typeof obj === 'string') {
    return translateText(obj);
  } else if (Array.isArray(obj)) {
    return obj.map(translateObject);
  } else if (typeof obj === 'object' && obj !== null) {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = translateObject(value);
    }
    return result;
  }
  return obj;
}

/**
 * Основная функция
 */
function main() {
  console.log('🚀 Создаю правильный украинский файл переводов...\n');
  
  try {
    // Читаем русский файл
    const ruContent = fs.readFileSync('src/i18n/locales/ru.json', 'utf8');
    const ruData = JSON.parse(ruContent);
    
    console.log('✅ Русский файл успешно прочитан');
    
    // Переводим на украинский
    const ukData = translateObject(ruData);
    
    // Сохраняем украинский файл
    const ukContent = JSON.stringify(ukData, null, 2);
    fs.writeFileSync('src/i18n/locales/uk.json', ukContent, 'utf8');
    
    console.log('✅ Украинский файл успешно создан');
    
    // Проверяем валидность
    JSON.parse(ukContent);
    console.log('✅ Украинский JSON валиден');
    
    console.log('\n🎉 Украинский файл переводов успешно создан!');
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { translateText, translateObject }; 