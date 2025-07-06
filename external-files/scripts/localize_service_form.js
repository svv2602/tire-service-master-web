#!/usr/bin/env node

/**
 * Скрипт для локализации ServiceFormPage.tsx
 * Заменяет все захардкоженные тексты на переводы из i18n
 */

const fs = require('fs');
const path = require('path');

const SERVICE_FORM_PATH = 'src/pages/services/ServiceFormPage.tsx';

// Карта замен для локализации ServiceFormPage
const TRANSLATIONS_MAP = [
  // Импорт useTranslation
  {
    search: "} from '@mui/icons-material';",
    replace: "} from '@mui/icons-material';\nimport { useTranslation } from 'react-i18next';"
  },
  
  // Добавление хука useTranslation
  {
    search: "export const ServiceFormPage: React.FC = () => {",
    replace: "export const ServiceFormPage: React.FC = () => {\n  const { t } = useTranslation();"
  },
  
  // Схема валидации - создание функции с параметром t
  {
    search: "const validationSchema = Yup.object({",
    replace: "const createValidationSchema = (t: any) => Yup.object({"
  },
  
  // Валидация полей
  {
    search: ".required('Название обязательно')",
    replace: ".required(t('forms.service.validation.nameRequired'))"
  },
  {
    search: ".min(2, 'Название должно содержать минимум 2 символа')",
    replace: ".min(2, t('forms.service.validation.nameMin'))"
  },
  {
    search: ".max(100, 'Название не должно превышать 100 символов')",
    replace: ".max(100, t('forms.service.validation.nameMax'))"
  },
  {
    search: ".max(500, 'Описание не должно превышать 500 символов')",
    replace: ".max(500, t('forms.service.validation.descriptionMax'))"
  },
  {
    search: ".min(0, 'Порядок сортировки должен быть неотрицательным')",
    replace: ".min(0, t('forms.service.validation.sortOrderMin'))"
  },
  {
    search: ".max(9999, 'Порядок сортировки не должен превышать 9999')",
    replace: ".max(9999, t('forms.service.validation.sortOrderMax'))"
  },
  
  // Использование схемы валидации
  {
    search: "validationSchema,",
    replace: "validationSchema: React.useMemo(() => createValidationSchema(t), [t]),"
  },
  
  // Сообщения успеха и ошибок
  {
    search: "setSuccessMessage('Категория услуг успешно обновлена');",
    replace: "setSuccessMessage(t('forms.service.messages.updateSuccess'));"
  },
  {
    search: "setSuccessMessage('Категория услуг успешно создана');",
    replace: "setSuccessMessage(t('forms.service.messages.createSuccess'));"
  },
  {
    search: "setSubmitError(error?.data?.message || 'Произошла ошибка при сохранении');",
    replace: "setSubmitError(error?.data?.message || t('forms.service.messages.saveError'));"
  },
  
  // Текст загрузки
  {
    search: "Загрузка категории...",
    replace: "{t('forms.service.messages.loading')}"
  },
  
  // Кнопка "Назад"
  {
    search: ">\n          Назад\n        </Button>",
    replace: ">\n          {t('forms.service.buttons.back')}\n        </Button>"
  },
  
  // Заголовки страницы
  {
    search: "{isEditing ? 'Редактировать категорию услуг' : 'Новая категория услуг'}",
    replace: "{isEditing ? t('forms.service.title.edit') : t('forms.service.title.create')}"
  },
  
  // Заголовок секции
  {
    search: "Информация о категории",
    replace: "{t('forms.service.sections.categoryInfo')}"
  },
  
  // Лейблы полей
  {
    search: 'label="Название"',
    replace: 'label={t("forms.service.fields.name")}'
  },
  {
    search: 'label="Описание"',
    replace: 'label={t("forms.service.fields.description")}'
  },
  {
    search: 'label="Порядок сортировки"',
    replace: 'label={t("forms.service.fields.sortOrder")}'
  },
  {
    search: 'label="Активна"',
    replace: 'label={t("forms.service.fields.isActive")}'
  },
  
  // Кнопка сохранения
  {
    search: "{isEditing ? 'Сохранить' : 'Создать'}",
    replace: "{isEditing ? t('forms.service.buttons.save') : t('forms.service.buttons.create')}"
  }
];

function localizeServiceForm() {
  try {
    console.log('🌐 Начинаем локализацию ServiceFormPage.tsx...');
    
    // Читаем файл
    const filePath = path.join(process.cwd(), SERVICE_FORM_PATH);
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Файл не найден: ${filePath}`);
      return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let replacementCount = 0;
    let failedReplacements = [];
    
    // Применяем замены
    TRANSLATIONS_MAP.forEach((replacement, index) => {
      const beforeContent = content;
      content = content.replace(replacement.search, replacement.replace);
      
      if (beforeContent !== content) {
        replacementCount++;
        console.log(`✅ Замена ${index + 1}: ${replacement.search.substring(0, 50)}...`);
      } else {
        failedReplacements.push(index + 1);
        console.log(`❌ Не удалось выполнить замену ${index + 1}: ${replacement.search.substring(0, 50)}...`);
      }
    });
    
    // Добавляем импорт React для useMemo
    if (!content.includes('import React,')) {
      content = content.replace(
        "import React, { useState } from 'react';",
        "import React, { useState, useMemo } from 'react';"
      );
      console.log('✅ Добавлен импорт useMemo');
    }
    
    // Сохраняем файл
    fs.writeFileSync(filePath, content, 'utf8');
    
    console.log(`\n📊 РЕЗУЛЬТАТ ЛОКАЛИЗАЦИИ ServiceFormPage.tsx:`);
    console.log(`✅ Успешных замен: ${replacementCount}/${TRANSLATIONS_MAP.length}`);
    if (failedReplacements.length > 0) {
      console.log(`❌ Неудачных замен: ${failedReplacements.join(', ')}`);
    }
    console.log(`📁 Файл обновлен: ${SERVICE_FORM_PATH}`);
    
  } catch (error) {
    console.error('❌ Ошибка при локализации ServiceFormPage:', error.message);
  }
}

// Запускаем локализацию
localizeServiceForm(); 