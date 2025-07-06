#!/usr/bin/env node

/**
 * Скрипт для локализации ReviewFormPage.tsx
 * Заменяет основные захардкоженные тексты на переводы из i18n
 */

const fs = require('fs');
const path = require('path');

const REVIEW_FORM_PATH = 'src/pages/reviews/ReviewFormPage.tsx';

// Основные замены для локализации ReviewFormPage
const TRANSLATIONS_MAP = [
  // Импорт useTranslation
  {
    search: "} from '@mui/icons-material';",
    replace: "} from '@mui/icons-material';\nimport { useTranslation } from 'react-i18next';"
  },
  
  // Добавление хука useTranslation
  {
    search: "const ReviewFormPage: React.FC = () => {",
    replace: "const ReviewFormPage: React.FC = () => {\n  const { t } = useTranslation();"
  },
  
  // Функция getRequiredFieldErrors - заменяем тексты полей
  {
    search: "errors.push('Клиент');",
    replace: "errors.push(t('forms.review.requiredFields.client'));"
  },
  {
    search: "errors.push('Бронирование или сервисная точка');",
    replace: "errors.push(t('forms.review.requiredFields.bookingOrServicePoint'));"
  },
  {
    search: "errors.push('Оценка');",
    replace: "errors.push(t('forms.review.requiredFields.rating'));"
  },
  {
    search: "errors.push('Текст отзыва');",
    replace: "errors.push(t('forms.review.requiredFields.reviewText'));"
  },
  
  // Основные сообщения об ошибках и успехе
  {
    search: "setFormError('Заполните все обязательные поля');",
    replace: "setFormError(t('forms.review.validation.fillAllFields'));"
  },
  {
    search: "setFormError(error?.data?.message || 'Ошибка при сохранении отзыва');",
    replace: "setFormError(error?.data?.message || t('forms.review.messages.saveError'));"
  },
  {
    search: "setFormError(error?.data?.message || 'Ошибка при удалении отзыва');",
    replace: "setFormError(error?.data?.message || t('forms.review.messages.deleteError'));"
  },
  
  // Заголовки страницы
  {
    search: "'Редактирование отзыва (режим администратора)'",
    replace: "t('forms.review.title.editAdmin')"
  },
  {
    search: "'Создание/редактирование отзыва (режим администратора)'",
    replace: "t('forms.review.title.createAdmin')"
  },
  {
    search: "'Новый отзыв'",
    replace: "t('forms.review.title.create')"
  },
  
  // Сообщения успеха
  {
    search: "'Отзыв успешно обновлён!'",
    replace: "t('forms.review.messages.updateSuccess')"
  },
  {
    search: "'Отзыв успешно создан!'",
    replace: "t('forms.review.messages.createSuccess')"
  },
  {
    search: "Перенаправление на список отзывов...",
    replace: "{t('forms.review.messages.redirecting')}"
  },
  
  // Лейблы полей
  {
    search: 'label="Клиент"',
    replace: 'label={t("forms.review.fields.client")}'
  },
  {
    search: 'label="Бронирование"',
    replace: 'label={t("forms.review.fields.booking")}'
  },
  {
    search: 'label="Сервисная точка"',
    replace: 'label={t("forms.review.fields.servicePoint")}'
  },
  {
    search: 'label="Статус"',
    replace: 'label={t("forms.review.fields.status")}'
  },
  {
    search: 'label="Текст отзыва"',
    replace: 'label={t("forms.review.fields.reviewText")}'
  },
  {
    search: 'label="Выберите бронирование"',
    replace: 'label={t("forms.review.placeholders.selectBooking")}'
  },
  
  // Опции селектов
  {
    search: ">Выберите клиента</MenuItem>",
    replace: ">{t('forms.review.placeholders.selectClient')}</MenuItem>"
  },
  {
    search: ">Без бронирования</MenuItem>",
    replace: ">{t('forms.review.placeholders.withoutBooking')}</MenuItem>"
  },
  {
    search: ">Выберите точку</MenuItem>",
    replace: ">{t('forms.review.placeholders.selectServicePoint')}</MenuItem>"
  },
  {
    search: ">Опубликован</MenuItem>",
    replace: ">{t('forms.review.statuses.published')}</MenuItem>"
  },
  {
    search: ">На модерации</MenuItem>",
    replace: ">{t('forms.review.statuses.pending')}</MenuItem>"
  },
  {
    search: ">Отклонён</MenuItem>",
    replace: ">{t('forms.review.statuses.rejected')}</MenuItem>"
  },
  
  // Заголовки секций
  {
    search: "Оценка",
    replace: "{t('forms.review.fields.rating')}"
  },
  {
    search: "Ваша оценка",
    replace: "{t('forms.review.fields.yourRating')}"
  },
  
  // Сообщения валидации
  {
    search: "Заполните все обязательные поля:",
    replace: "{t('forms.review.validation.fillAllFields')}:"
  },
  {
    search: "Все обязательные поля заполнены. Можете сохранить отзыв.",
    replace: "{t('forms.review.validation.allFieldsFilled')}"
  },
  
  // Кнопки
  {
    search: ">Отмена</Button>",
    replace: ">{t('forms.review.buttons.cancel')}</Button>"
  },
  {
    search: ">Назад</Button>",
    replace: ">{t('forms.review.buttons.back')}</Button>"
  },
  {
    search: "'Удаление...'",
    replace: "t('forms.review.messages.deleting')"
  },
  {
    search: "'Удалить'",
    replace: "t('forms.review.buttons.delete')"
  },
  {
    search: "'Сохранение...'",
    replace: "t('forms.review.messages.saving')"
  },
  {
    search: "'Сохранить изменения'",
    replace: "t('forms.review.buttons.saveChanges')"
  },
  {
    search: "'Сохранить отзыв'",
    replace: "t('forms.review.buttons.save')"
  },
  {
    search: "'Опубликовать отзыв'",
    replace: "t('forms.review.buttons.publish')"
  },
  
  // Диалог удаления
  {
    search: "Подтверждение удаления",
    replace: "{t('common.confirmDelete')}"
  },
  {
    search: "Вы действительно хотите удалить этот отзыв?",
    replace: "{t('forms.review.messages.deleteConfirm')}"
  },
  
  // Сообщение об отсутствии бронирований
  {
    search: "У вас пока нет завершенных бронирований. После завершения обслуживания вы сможете оставить отзыв.",
    replace: "{t('forms.review.messages.noBookings')}"
  }
];

function localizeReviewForm() {
  try {
    console.log('🌐 Начинаем локализацию ReviewFormPage.tsx...');
    
    // Читаем файл
    const filePath = path.join(process.cwd(), REVIEW_FORM_PATH);
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
    
    // Сохраняем файл
    fs.writeFileSync(filePath, content, 'utf8');
    
    console.log(`\n📊 РЕЗУЛЬТАТ ЛОКАЛИЗАЦИИ ReviewFormPage.tsx:`);
    console.log(`✅ Успешных замен: ${replacementCount}/${TRANSLATIONS_MAP.length}`);
    if (failedReplacements.length > 0) {
      console.log(`❌ Неудачных замен: ${failedReplacements.join(', ')}`);
    }
    console.log(`📁 Файл обновлен: ${REVIEW_FORM_PATH}`);
    
  } catch (error) {
    console.error('❌ Ошибка при локализации ReviewFormPage:', error.message);
  }
}

// Запускаем локализацию
localizeReviewForm(); 