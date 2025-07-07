#!/usr/bin/env node

/**
 * Скрипт для исправления украинских переводов UI компонентов
 * Исправляет оставшиеся русские тексты в украинском файле переводов
 */

const fs = require('fs');
const path = require('path');

// Путь к украинскому файлу переводов
const ukFilePath = path.join(__dirname, '../../src/i18n/locales/uk.json');

// Исправления для украинских переводов UI компонентов
const fixes = [
  // datePicker
  {
    old: '"label": "Выберите дату"',
    new: '"label": "Виберіть дату"'
  },
  {
    old: '"helperText": "Формат: дд.мм.гггг"',
    new: '"helperText": "Формат: дд.мм.рррр"'
  },
  
  // select
  {
    old: '"placeholder": "Выберите..."',
    new: '"placeholder": "Виберіть..."'
  },
  
  // autoComplete
  {
    old: '"label": "Выберите значение"',
    new: '"label": "Виберіть значення"'
  },
  {
    old: '"placeholder": "Начните вводить..."',
    new: '"placeholder": "Почніть вводити..."'
  },
  {
    old: '"noOptionsText": "Ні доступных вариантов"',
    new: '"noOptionsText": "Немає доступних варіантів"'
  },
  
  // stepper
  {
    old: '"next": "Продолжить"',
    new: '"next": "Далі"'
  },
  {
    old: '"back": "Назад"',
    new: '"back": "Назад"'
  },
  
  // fileUpload errors
  {
    old: '"tooLarge": "Файл занадто великий. Пожалуйста, выберите файл меньшего размера."',
    new: '"tooLarge": "Файл занадто великий. Будь ласка, виберіть файл меншого розміру."'
  },
  {
    old: '"unsupportedType": "Непідтримуваний тип файлу. Пожалуйста, выберите другой файл."',
    new: '"unsupportedType": "Непідтримуваний тип файлу. Будь ласка, виберіть інший файл."'
  },
  
  // forms.client
  {
    old: '"create": "Новый клиент"',
    new: '"create": "Новий клієнт"'
  },
  {
    old: '"isActive": "Активний клиент"',
    new: '"isActive": "Активний клієнт"'
  },
  {
    old: '"emailPlaceholder": "example@email.com (необязательно)"',
    new: '"emailPlaceholder": "example@email.com (необов\'язково)"'
  },
  {
    old: '"canCreate": "Можете создать клиента"',
    new: '"canCreate": "Можете створити клієнта"'
  },
  
  // forms.clientCar
  {
    old: '"create": "Новый автомобиль"',
    new: '"create": "Новий автомобіль"'
  },
  {
    old: '"year": "Год выпуска"',
    new: '"year": "Рік випуску"'
  },
  {
    old: '"licensePlate": "Номер автомобиля"',
    new: '"licensePlate": "Номер автомобіля"'
  },
  {
    old: '"color": "Цвет"',
    new: '"color": "Колір"'
  },
  {
    old: '"brandRequired": "Марка обязательна"',
    new: '"brandRequired": "Марка обов\'язкова"'
  },
  {
    old: '"modelRequired": "Модель обязательна"',
    new: '"modelRequired": "Модель обов\'язкова"'
  },
  {
    old: '"yearRequired": "Год выпуска обязателен"',
    new: '"yearRequired": "Рік випуску обов\'язковий"'
  },
  {
    old: '"licensePlateRequired": "Номер автомобиля обязателен"',
    new: '"licensePlateRequired": "Номер автомобіля обов\'язковий"'
  },
  {
    old: '"selectBrand": "Выберите марку"',
    new: '"selectBrand": "Виберіть марку"'
  },
  {
    old: '"selectModel": "Выберите модель"',
    new: '"selectModel": "Виберіть модель"'
  },
  {
    old: '"selectTypeOptional": "Выберите тип (необязательно)"',
    new: '"selectTypeOptional": "Виберіть тип (необов\'язково)"'
  },
  
  // tireCalculator
  {
    old: '"currentWidth": "Текущая ширина"',
    new: '"currentWidth": "Поточна ширина"'
  },
  {
    old: '"currentProfile": "Текущий профиль"',
    new: '"currentProfile": "Поточний профіль"'
  },
  {
    old: '"currentDiameter": "Текущий диаметр"',
    new: '"currentDiameter": "Поточний діаметр"'
  },
  {
    old: '"newWidth": "Новая ширина"',
    new: '"newWidth": "Нова ширина"'
  },
  {
    old: '"newProfile": "Новый профиль"',
    new: '"newProfile": "Новий профіль"'
  },
  {
    old: '"newDiameter": "Новый диаметр"',
    new: '"newDiameter": "Новий діаметр"'
  },
  {
    old: '"calculate": "Рассчитать"',
    new: '"calculate": "Розрахувати"'
  },
  {
    old: '"reset": "Сбросить"',
    new: '"reset": "Скинути"'
  },
  
  // review
  {
    old: '"create": "Новый отзыв"',
    new: '"create": "Новий відгук"'
  },
  {
    old: '"edit": "Редактирование отзыва"',
    new: '"edit": "Редагування відгуку"'
  },
  {
    old: '"createAdmin": "Создание/редактирование отзыва (режим администратора)"',
    new: '"createAdmin": "Створення/редагування відгуку (режим адміністратора)"'
  },
  {
    old: '"editAdmin": "Редактирование отзыва (режим администратора)"',
    new: '"editAdmin": "Редагування відгуку (режим адміністратора)"'
  },
  {
    old: '"servicePoint": "Точка обслуживания"',
    new: '"servicePoint": "Точка обслуговування"'
  },
  {
    old: '"yourRating": "Ваша оценка"',
    new: '"yourRating": "Ваша оцінка"'
  },
  {
    old: '"reviewText": "Текст отзыва"',
    new: '"reviewText": "Текст відгуку"'
  },
  {
    old: '"selectClient": "Выберите клиента"',
    new: '"selectClient": "Виберіть клієнта"'
  },
  {
    old: '"selectBooking": "Выберите бронирование"',
    new: '"selectBooking": "Виберіть бронювання"'
  },
  {
    old: '"withoutBooking": "Без бронирования"',
    new: '"withoutBooking": "Без бронювання"'
  },
  {
    old: '"selectServicePoint": "Выберите точку"',
    new: '"selectServicePoint": "Виберіть точку"'
  },
  {
    old: '"allFieldsFilled": "Всі обязательные поля заполнены. Можете сохранить отзыв."',
    new: '"allFieldsFilled": "Всі обов\'язкові поля заповнені. Можете зберегти відгук."'
  }
];

async function fixUkrainianUITranslations() {
  try {
    console.log('🔧 Исправление украинских переводов UI компонентов...');
    
    // Читаем файл
    let content = fs.readFileSync(ukFilePath, 'utf8');
    let changesCount = 0;
    
    // Применяем исправления
    fixes.forEach(fix => {
      if (content.includes(fix.old)) {
        content = content.replace(fix.old, fix.new);
        changesCount++;
        console.log(`✅ Исправлено: ${fix.old} → ${fix.new}`);
      }
    });
    
    // Сохраняем файл
    fs.writeFileSync(ukFilePath, content, 'utf8');
    
    console.log(`\n🎯 РЕЗУЛЬТАТ: Исправлено ${changesCount} переводов из ${fixes.length} возможных`);
    console.log('✅ Украинские переводы UI компонентов обновлены!');
    
  } catch (error) {
    console.error('❌ Ошибка при исправлении переводов:', error);
    process.exit(1);
  }
}

// Запускаем скрипт
fixUkrainianUITranslations(); 