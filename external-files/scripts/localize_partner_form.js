#!/usr/bin/env node

/**
 * Скрипт для локализации PartnerFormPage.tsx
 * Заменяет основные захардкоженные тексты на переводы из i18n
 */

const fs = require('fs');
const path = require('path');

const PARTNER_FORM_PATH = 'src/pages/partners/PartnerFormPage.tsx';

// Основные замены для локализации PartnerFormPage
const TRANSLATIONS_MAP = [
  // Импорт useTranslation
  {
    search: "} from '@mui/icons-material';",
    replace: "} from '@mui/icons-material';\nimport { useTranslation } from 'react-i18next';"
  },
  
  // Добавление хука useTranslation
  {
    search: "const PartnerFormPage: React.FC = () => {",
    replace: "const PartnerFormPage: React.FC = () => {\n  const { t } = useTranslation();"
  },
  
  // Заголовки страницы
  {
    search: "{isEdit ? 'Редактировать партнера' : 'Создать партнера'}",
    replace: "{isEdit ? t('forms.partner.title.edit') : t('forms.partner.title.create')}"
  },
  
  // Секции формы
  {
    search: "Информация о компании",
    replace: "t('forms.partner.sections.companyInfo')"
  },
  {
    search: "Юридическая информация",
    replace: "t('forms.partner.sections.legalInfo')"
  },
  {
    search: "Местоположение",
    replace: "t('forms.partner.sections.location')"
  },
  {
    search: "Данные пользователя",
    replace: "t('forms.partner.sections.userInfo')"
  },
  
  // Поля формы - основные
  {
    search: 'label="Название компании"',
    replace: 'label={t("forms.partner.fields.companyName")}'
  },
  {
    search: 'label="Описание компании"',
    replace: 'label={t("forms.partner.fields.companyDescription")}'
  },
  {
    search: 'label="Веб-сайт"',
    replace: 'label={t("forms.partner.fields.website")}'
  },
  {
    search: 'label="Налоговый номер (необязательно)"',
    replace: 'label={t("forms.partner.fields.taxNumber")}'
  },
  {
    search: 'label="Юридический адрес"',
    replace: 'label={t("forms.partner.fields.legalAddress")}'
  },
  {
    search: 'label="Контактное лицо"',
    replace: 'label={t("forms.partner.fields.contactPerson")}'
  },
  
  // Селекты регионов и городов
  {
    search: '<InputLabel id="region-select-label">Регион</InputLabel>',
    replace: '<InputLabel id="region-select-label">{t("forms.partner.fields.region")}</InputLabel>'
  },
  {
    search: '<InputLabel id="city-select-label">Город</InputLabel>',
    replace: '<InputLabel id="city-select-label">{t("forms.partner.fields.city")}</InputLabel>'
  },
  {
    search: 'Выберите регион',
    replace: "t('forms.partner.placeholders.selectRegion')"
  },
  {
    search: 'Выберите город',
    replace: "t('forms.partner.placeholders.selectCity')"
  },
  
  // Плейсхолдеры
  {
    search: 'placeholder="https://example.com"',
    replace: 'placeholder={t("forms.partner.placeholders.website")}'
  },
  {
    search: 'placeholder="12345678"',
    replace: 'placeholder={t("forms.partner.placeholders.taxNumber")}'
  },
  
  // Логотип
  {
    search: "Логотип партнера",
    replace: "t('forms.partner.fields.logo')"
  },
  {
    search: "Загрузить лого",
    replace: "t('forms.partner.fields.uploadLogo')"
  },
  {
    search: "Поддерживаются форматы: JPEG, PNG, GIF, WebP. Максимальный размер: 5MB",
    replace: "t('forms.partner.messages.logoFormats')"
  },
  
  // Кнопки
  {
    search: "t('forms.common.back')",
    replace: "t('forms.common.back')"
  },
  {
    search: "t('forms.common.cancel')",
    replace: "t('forms.common.cancel')"
  },
  
  // Валидация - основные сообщения
  {
    search: "'Название компании обязательно'",
    replace: "t('forms.partner.validation.companyNameRequired')"
  },
  {
    search: "'Название должно быть не менее 2 символов'",
    replace: "t('forms.partner.validation.companyNameMin')"
  },
  {
    search: "'Название должно быть не более 100 символов'",
    replace: "t('forms.partner.validation.companyNameMax')"
  },
  {
    search: "'Описание должно быть не более 2000 символов'",
    replace: "t('forms.partner.validation.descriptionMax')"
  },
  {
    search: "'ФИО должно быть не менее 2 символов'",
    replace: "t('forms.partner.validation.contactPersonMin')"
  },
  {
    search: "'Введите корректный URL (например, https://example.com)'",
    replace: "t('forms.partner.validation.websiteInvalid')"
  },
  {
    search: "'Налоговый номер должен содержать от 8 до 15 цифр и дефисов'",
    replace: "t('forms.partner.validation.taxNumberInvalid')"
  },
  {
    search: "'Юридический адрес обязателен'",
    replace: "t('forms.partner.validation.legalAddressRequired')"
  },
  {
    search: "'Адрес должен быть не более 500 символов'",
    replace: "t('forms.partner.validation.legalAddressMax')"
  },
  {
    search: "'Введите корректный URL логотипа'",
    replace: "t('forms.partner.validation.logoUrlInvalid')"
  },
  {
    search: "'Регион обязателен'",
    replace: "t('forms.partner.validation.regionRequired')"
  },
  {
    search: "'Город обязателен'",
    replace: "t('forms.partner.validation.cityRequired')"
  },
  
  // Сообщения об успехе
  {
    search: "'Партнер успешно создан'",
    replace: "t('forms.partner.messages.createSuccess')"
  },
  {
    search: "'Партнер успешно обновлен'",
    replace: "t('forms.partner.messages.updateSuccess')"
  },
  
  // Вкладки
  {
    search: '"Общая информация"',
    replace: 't("forms.partner.tabs.general")'
  },
  {
    search: '"Точки обслуживания"',
    replace: 't("forms.partner.tabs.servicePoints")'
  },
  {
    search: '"Операторы"',
    replace: 't("forms.partner.tabs.operators")'
  }
];

function localizePartnerForm() {
  console.log('🚀 Начинаем локализацию PartnerFormPage.tsx...');
  
  if (!fs.existsSync(PARTNER_FORM_PATH)) {
    console.error(`❌ Файл ${PARTNER_FORM_PATH} не найден!`);
    return;
  }
  
  let content = fs.readFileSync(PARTNER_FORM_PATH, 'utf8');
  let changesCount = 0;
  
  // Применяем все замены
  TRANSLATIONS_MAP.forEach((translation, index) => {
    if (content.includes(translation.search)) {
      content = content.replace(new RegExp(escapeRegExp(translation.search), 'g'), translation.replace);
      changesCount++;
      console.log(`✅ Замена ${index + 1}: ${translation.search.substring(0, 50)}...`);
    } else {
      console.log(`⚠️  Не найдено: ${translation.search.substring(0, 50)}...`);
    }
  });
  
  // Исправляем функцию валидации - добавляем параметр t
  content = content.replace(
    'const createValidationSchema = (isEdit: boolean) => yup.object({',
    'const createValidationSchema = (isEdit: boolean, t: any) => yup.object({'
  );
  
  // Исправляем вызов функции валидации
  content = content.replace(
    'validationSchema: createValidationSchema(isEdit),',
    'validationSchema: useMemo(() => createValidationSchema(isEdit, t), [isEdit, t]),'
  );
  
  // Добавляем useMemo в импорты
  content = content.replace(
    'import React, { useEffect, useState, useMemo } from \'react\';',
    'import React, { useEffect, useState, useMemo } from \'react\';'
  );
  
  // Сохраняем файл
  fs.writeFileSync(PARTNER_FORM_PATH, content, 'utf8');
  
  console.log(`✅ Локализация PartnerFormPage.tsx завершена!`);
  console.log(`📊 Применено замен: ${changesCount} из ${TRANSLATIONS_MAP.length}`);
  console.log(`📁 Файл сохранен: ${PARTNER_FORM_PATH}`);
  console.log(`⚠️  Внимание: Возможны дополнительные ошибки компиляции. Проверьте файл вручную.`);
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&');
}

// Запускаем локализацию
localizePartnerForm(); 