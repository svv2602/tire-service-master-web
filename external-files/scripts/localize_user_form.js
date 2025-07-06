#!/usr/bin/env node

/**
 * Скрипт для локализации UserForm.tsx
 * Заменяет все захардкоженные тексты на переводы из i18n
 */

const fs = require('fs');
const path = require('path');

const USER_FORM_PATH = 'src/pages/users/UserForm.tsx';

// Карта замен для локализации UserForm
const TRANSLATIONS_MAP = [
  // Импорт useTranslation
  {
    search: "import { ArrowBack as ArrowBackIcon, Save as SaveIcon } from '@mui/icons-material';",
    replace: "import { ArrowBack as ArrowBackIcon, Save as SaveIcon } from '@mui/icons-material';\nimport { useTranslation } from 'react-i18next';"
  },
  
  // Добавление хука useTranslation
  {
    search: "const UserForm: React.FC = () => {",
    replace: "const UserForm: React.FC = () => {\n  const { t } = useTranslation();"
  },
  
  // Заголовки страницы
  {
    search: "{isEdit ? 'Редактировать пользователя' : 'Создать пользователя'}",
    replace: "{isEdit ? t('forms.user.title.edit') : t('forms.user.title.create')}"
  },
  
  // Кнопка "Назад"
  {
    search: "Назад",
    replace: "t('forms.common.back')"
  },
  
  // Секции формы
  {
    search: "Тип входа",
    replace: "t('forms.sections.loginType')"
  },
  {
    search: "Основная информация",
    replace: "t('forms.sections.basicInfo')"
  },
  {
    search: "Роль и статус",
    replace: "t('forms.sections.roleAndStatus')"
  },
  {
    search: "{isEdit ? 'Изменить пароль' : 'Пароль'}",
    replace: "{isEdit ? t('forms.sections.changePassword') : t('forms.sections.password')}"
  },
  
  // Тип входа
  {
    search: "Выберите основной способ входа",
    replace: "t('forms.loginType.selectMethod')"
  },
  {
    search: 'label="Email"',
    replace: 'label={t("forms.loginType.email")}'
  },
  {
    search: 'label="Телефон"',
    replace: 'label={t("forms.loginType.phone")}'
  },
  
  // Поля формы
  {
    search: "label={loginType === 'email' ? 'Email' : 'Email (необязательно)'}",
    replace: "label={loginType === 'email' ? t('forms.user.fields.email') : t('forms.user.fields.emailOptional')}"
  },
  {
    search: "label={loginType === 'phone' ? 'Телефон' : 'Телефон (необязательно)'}",
    replace: "label={loginType === 'phone' ? t('forms.user.fields.phone') : t('forms.user.fields.phoneOptional')}"
  },
  {
    search: 'label="Имя"',
    replace: 'label={t("forms.user.fields.firstName")}'
  },
  {
    search: 'label="Фамилия"',
    replace: 'label={t("forms.user.fields.lastName")}'
  },
  {
    search: 'label="Отчество"',
    replace: 'label={t("forms.user.fields.middleName")}'
  },
  {
    search: '<InputLabel>Роль *</InputLabel>',
    replace: '<InputLabel>{t("forms.user.fields.role")} *</InputLabel>'
  },
  {
    search: 'label="Активный пользователь"',
    replace: 'label={t("forms.user.fields.isActive")}'
  },
  {
    search: 'label={isEdit ? "Новый пароль (оставьте пустым, если не хотите менять)" : "Пароль"}',
    replace: 'label={isEdit ? t("forms.user.fields.newPassword") : t("forms.user.fields.password")}'
  },
  {
    search: 'label="Подтверждение пароля"',
    replace: 'label={t("forms.user.fields.confirmPassword")}'
  },
  
  // Роли
  {
    search: '<MenuItem value={1}>Администратор</MenuItem>',
    replace: '<MenuItem value={1}>{t("forms.user.roles.admin")}</MenuItem>'
  },
  {
    search: '<MenuItem value={2}>Менеджер</MenuItem>',
    replace: '<MenuItem value={2}>{t("forms.user.roles.manager")}</MenuItem>'
  },
  {
    search: '<MenuItem value={3}>Партнер</MenuItem>',
    replace: '<MenuItem value={3}>{t("forms.user.roles.partner")}</MenuItem>'
  },
  {
    search: '<MenuItem value={4}>Оператор</MenuItem>',
    replace: '<MenuItem value={4}>{t("forms.user.roles.operator")}</MenuItem>'
  },
  {
    search: '<MenuItem value={5}>Клиент</MenuItem>',
    replace: '<MenuItem value={5}>{t("forms.user.roles.client")}</MenuItem>'
  },
  
  // Валидация
  {
    search: "'Email обязателен'",
    replace: "t('forms.user.validation.emailRequired')"
  },
  {
    search: "'Телефон обязателен'",
    replace: "t('forms.user.validation.phoneRequired')"
  },
  {
    search: "'Введите корректный email'",
    replace: "t('forms.user.validation.emailInvalid')"
  },
  {
    search: "'Имя обязательно'",
    replace: "t('forms.user.validation.firstNameRequired')"
  },
  {
    search: "'Имя должно быть не менее 2 символов'",
    replace: "t('forms.user.validation.firstNameMin')"
  },
  {
    search: "'Фамилия обязательна'",
    replace: "t('forms.user.validation.lastNameRequired')"
  },
  {
    search: "'Фамилия должна быть не менее 2 символов'",
    replace: "t('forms.user.validation.lastNameMin')"
  },
  {
    search: "'Роль обязательна'",
    replace: "t('forms.user.validation.roleRequired')"
  },
  {
    search: "'Пароль обязателен'",
    replace: "t('forms.user.validation.passwordRequired')"
  },
  {
    search: "'Пароль должен содержать минимум 6 символов'",
    replace: "t('forms.user.validation.passwordMin')"
  },
  {
    search: "'Пароли не совпадают'",
    replace: "t('forms.user.validation.passwordsNotMatch')"
  },
  
  // Сообщения
  {
    search: "Заполните все обязательные поля:",
    replace: "{t('forms.common.fillAllRequiredFields')}:"
  },
  {
    search: "Заполните все обязательные поля для активации кнопки сохранения",
    replace: "t('forms.common.fillRequiredFieldsToActivate')"
  },
  
  // Кнопки
  {
    search: 'Отмена',
    replace: "t('forms.common.cancel')"
  },
  {
    search: "{isLoading ? 'Сохранение...' : (isEdit ? 'Обновить' : 'Создать')}",
    replace: "{isLoading ? t('forms.common.saving') : (isEdit ? t('forms.common.update') : t('forms.common.create'))}"
  }
];

function localizeUserForm() {
  console.log('🚀 Начинаем локализацию UserForm.tsx...');
  
  if (!fs.existsSync(USER_FORM_PATH)) {
    console.error(`❌ Файл ${USER_FORM_PATH} не найден!`);
    return;
  }
  
  let content = fs.readFileSync(USER_FORM_PATH, 'utf8');
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
  
  // Добавляем 't' в зависимости useMemo для валидации
  content = content.replace(
    'React.useMemo(() => getValidationSchema(loginType), [loginType, isEdit])',
    'React.useMemo(() => getValidationSchema(loginType), [loginType, isEdit, t])'
  );
  
  // Сохраняем файл
  fs.writeFileSync(USER_FORM_PATH, content, 'utf8');
  
  console.log(`✅ Локализация UserForm.tsx завершена!`);
  console.log(`📊 Применено замен: ${changesCount} из ${TRANSLATIONS_MAP.length}`);
  console.log(`📁 Файл сохранен: ${USER_FORM_PATH}`);
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&');
}

// Запускаем локализацию
localizeUserForm(); 