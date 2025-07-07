#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Локализация остальных форм (Этап 4)...');

// Список форм для локализации
const formsToLocalize = [
  {
    file: 'src/pages/bookings/BookingFormPage.tsx',
    name: 'BookingFormPage'
  },
  {
    file: 'src/pages/bookings/BookingFormPageWithAvailability.tsx', 
    name: 'BookingFormPageWithAvailability'
  },
  {
    file: 'src/pages/regions/RegionFormPage.tsx',
    name: 'RegionFormPage'
  },
  {
    file: 'src/pages/clients/ClientFormPage.tsx',
    name: 'ClientFormPage'
  },
  {
    file: 'src/pages/clients/ClientCarFormPage.tsx',
    name: 'ClientCarFormPage'
  },
  {
    file: 'src/pages/service-points/ServicePointFormPage.tsx',
    name: 'ServicePointFormPage'
  },
  {
    file: 'src/pages/car-brands/CarBrandFormPage.tsx',
    name: 'CarBrandFormPage'
  },
  {
    file: 'src/pages/tire-calculator/components/TireInputForm.tsx',
    name: 'TireInputForm'
  }
];

// Массивы замен для каждого типа текста
const commonReplacements = [
  // Кнопки
  [/'Назад'/g, "t('common.back')"],
  [/'Отмена'/g, "t('common.cancel')"],
  [/'Сохранить'/g, "t('common.save')"],
  [/'Создать'/g, "t('common.create')"],
  [/'Редактировать'/g, "t('common.edit')"],
  [/'Сохранение\.\.\.'/g, "t('common.saving')"],
  [/'Загрузка\.\.\.'/g, "t('common.loading')"],
  
  // Валидация
  [/'обязательно'/g, "t('forms.common.required')"],
  [/'Обязательное поле'/g, "t('forms.common.required')"],
  [/'необязательно'/g, "t('forms.common.optional')"],
  [/'Выберите'/g, "t('common.select')"],
  [/'выберите'/g, "t('common.select')"],
  
  // Общие сообщения
  [/'Все обязательные поля заполнены'/g, "t('forms.common.allFieldsFilled')"],
  [/'Заполните все обязательные поля'/g, "t('forms.common.fillAllRequiredFields')"],
];

// Специфичные замены для каждой формы
const specificReplacements = {
  'BookingFormPage': [
    [/'Выберите точку обслуживания'/g, "t('forms.booking.validation.servicePointRequired')"],
    [/'Выберите тип автомобиля'/g, "t('forms.booking.validation.carTypeRequired')"],
    [/'Выберите категорию услуг'/g, "t('forms.booking.validation.categoryRequired')"],
    [/'Выберите дату'/g, "t('forms.booking.validation.dateRequired')"],
    [/'Выберите время начала'/g, "t('forms.booking.validation.startTimeRequired')"],
    [/'Имя получателя услуги обязательно'/g, "t('forms.booking.validation.serviceRecipientFirstNameRequired')"],
    [/'Фамилия получателя услуги обязательна'/g, "t('forms.booking.validation.serviceRecipientLastNameRequired')"],
    [/'Телефон получателя услуги обязателен'/g, "t('forms.booking.validation.serviceRecipientPhoneRequired')"],
    [/'Выберите дату и время записи'/g, "t('forms.booking.selectDateTime')"],
    [/'Назад к списку'/g, "t('forms.booking.backToList')"],
  ],
  'RegionFormPage': [
    [/'Название региона обязательно'/g, "t('forms.region.validation.nameRequired')"],
    [/'Новый регион'/g, "t('forms.region.title.create')"],
    [/'Редактировать регион'/g, "t('forms.region.title.edit')"],
    [/'Загрузка региона\.\.\.'/g, "t('forms.region.loading')"],
  ],
  'ClientFormPage': [
    [/'Имя обязательно'/g, "t('forms.client.validation.firstNameRequired')"],
    [/'example@email\.com \(необязательно\)'/g, "t('forms.client.emailPlaceholder')"],
    [/'Можете создать клиента'/g, "t('forms.client.canCreate')"],
  ],
  'ClientCarFormPage': [
    [/'Выберите марку'/g, "t('forms.clientCar.selectBrand')"],
    [/'Выберите модель'/g, "t('forms.clientCar.selectModel')"],
    [/'Выберите тип \(необязательно\)'/g, "t('forms.clientCar.selectTypeOptional')"],
  ],
  'ServicePointFormPage': [
    [/'Название точки обязательно'/g, "t('forms.servicePoint.validation.nameRequired')"],
    [/'Партнер обязателен'/g, "t('forms.servicePoint.validation.partnerRequired')"],
    [/'Регион обязателен'/g, "t('forms.servicePoint.validation.regionRequired')"],
    [/'Город обязателен'/g, "t('forms.servicePoint.validation.cityRequired')"],
    [/'Выберите партнера'/g, "t('forms.servicePoint.selectPartner')"],
    [/'Выберите регион'/g, "t('forms.servicePoint.selectRegion')"],
    [/'Выберите город'/g, "t('forms.servicePoint.selectCity')"],
    [/'Назад к списку'/g, "t('forms.servicePoint.backToList')"],
  ],
  'CarBrandFormPage': [
    [/'Название бренда обязательно'/g, "t('forms.carBrand.validation.nameRequired')"],
    [/'Новый бренд автомобиля'/g, "t('forms.carBrand.title.create')"],
    [/'Редактировать бренд автомобиля'/g, "t('forms.carBrand.title.edit')"],
    [/'Загрузка бренда\.\.\.'/g, "t('forms.carBrand.loading')"],
  ]
};

// Функция для добавления useTranslation импорта
function addUseTranslationImport(content) {
  // Проверяем, есть ли уже импорт useTranslation
  if (content.includes('useTranslation')) {
    return content;
  }

  // Ищем строку с импортом React
  const reactImportRegex = /import React[^;]+;/;
  const match = content.match(reactImportRegex);
  
  if (match) {
    const reactImport = match[0];
    const newImport = `${reactImport}\nimport { useTranslation } from 'react-i18next';`;
    return content.replace(reactImport, newImport);
  }
  
  // Если не нашли импорт React, добавляем в начало
  return `import { useTranslation } from 'react-i18next';\n${content}`;
}

// Функция для добавления хука useTranslation
function addUseTranslationHook(content) {
  // Проверяем, есть ли уже хук
  if (content.includes('const { t } = useTranslation()')) {
    return content;
  }

  // Ищем начало компонента
  const componentRegex = /const\s+\w+(?:Page|Form)?\s*:\s*React\.FC.*?=.*?\(\)\s*=>\s*{/;
  const match = content.match(componentRegex);
  
  if (match) {
    const componentStart = match[0];
    const newComponentStart = `${componentStart}\n  const { t } = useTranslation();`;
    return content.replace(componentStart, newComponentStart);
  }
  
  return content;
}

// Функция для применения замен
function applyReplacements(content, replacements) {
  let modifiedContent = content;
  let replacementCount = 0;
  
  replacements.forEach(([regex, replacement]) => {
    const matches = modifiedContent.match(regex);
    if (matches) {
      replacementCount += matches.length;
      modifiedContent = modifiedContent.replace(regex, replacement);
    }
  });
  
  return { content: modifiedContent, count: replacementCount };
}

// Функция для исправления JSX синтаксиса
function fixJSXSyntax(content) {
  // Исправляем атрибуты JSX
  content = content.replace(/(\w+)=t\(/g, '$1={t(');
  content = content.replace(/title=t\(/g, 'title={t(');
  content = content.replace(/label=t\(/g, 'label={t(');
  content = content.replace(/placeholder=t\(/g, 'placeholder={t(');
  content = content.replace(/helperText=t\(/g, 'helperText={t(');
  
  return content;
}

// Основная функция локализации
function localizeForm(formConfig) {
  const filePath = formConfig.file;
  const formName = formConfig.name;
  
  console.log(`\n📝 Локализация ${formName}...`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ Файл не найден: ${filePath}`);
    return { success: false, count: 0 };
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Добавляем импорт и хук useTranslation
  content = addUseTranslationImport(content);
  content = addUseTranslationHook(content);
  
  // Применяем общие замены
  let totalReplacements = 0;
  const commonResult = applyReplacements(content, commonReplacements);
  content = commonResult.content;
  totalReplacements += commonResult.count;
  
  // Применяем специфичные замены для данной формы
  if (specificReplacements[formName]) {
    const specificResult = applyReplacements(content, specificReplacements[formName]);
    content = specificResult.content;
    totalReplacements += specificResult.count;
  }
  
  // Исправляем JSX синтаксис
  content = fixJSXSyntax(content);
  
  // Сохраняем файл
  fs.writeFileSync(filePath, content, 'utf8');
  
  console.log(`✅ ${formName}: ${totalReplacements} замен выполнено`);
  return { success: true, count: totalReplacements };
}

// Выполняем локализацию всех форм
console.log('🎯 Начинаем локализацию остальных форм...\n');

let totalFiles = 0;
let successfulFiles = 0;
let totalReplacements = 0;

formsToLocalize.forEach(formConfig => {
  totalFiles++;
  const result = localizeForm(formConfig);
  if (result.success) {
    successfulFiles++;
    totalReplacements += result.count;
  }
});

// Итоговая статистика
console.log(`\n🎉 Локализация завершена!`);
console.log(`📊 Обработано файлов: ${successfulFiles}/${totalFiles}`);
console.log(`🔄 Всего замен: ${totalReplacements}`);
console.log(`\n✅ Этап 4 локализации форм завершен!`); 