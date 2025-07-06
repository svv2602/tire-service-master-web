#!/usr/bin/env node

/**
 * Скрипт для локализации PageContentFormPage.tsx
 * Заменяет основные захардкоженные тексты на переводы из i18n
 */

const fs = require('fs');
const path = require('path');

const PAGE_CONTENT_FORM_PATH = 'src/pages/page-content/PageContentFormPage.tsx';

// Основные замены для локализации PageContentFormPage
const TRANSLATIONS_MAP = [
  // Импорт useTranslation
  {
    search: "} from '@mui/icons-material';",
    replace: "} from '@mui/icons-material';\nimport { useTranslation } from 'react-i18next';"
  },
  
  // Добавление хука useTranslation
  {
    search: "const PageContentFormPage: React.FC = () => {",
    replace: "const PageContentFormPage: React.FC = () => {\n  const { t } = useTranslation();"
  },
  
  // Сообщения об успехе
  {
    search: "setSuccessMessage('Контент успешно обновлен');",
    replace: "setSuccessMessage(t('forms.pageContent.messages.updateSuccess'));"
  },
  {
    search: "setSuccessMessage('Контент успешно создан');",
    replace: "setSuccessMessage(t('forms.pageContent.messages.createSuccess'));"
  },
  
  // Заголовки страницы
  {
    search: "'Редактирование контента'",
    replace: "t('forms.pageContent.title.edit')"
  },
  {
    search: "'Создание контента'",
    replace: "t('forms.pageContent.title.create')"
  },
  
  // Кнопки заголовка
  {
    search: "Отмена",
    replace: "{t('forms.pageContent.buttons.cancel')}"
  },
  {
    search: "'Обновить'",
    replace: "t('forms.pageContent.buttons.update')"
  },
  {
    search: "'Создать'",
    replace: "t('forms.pageContent.buttons.create')"
  },
  
  // Сообщение об ошибке загрузки
  {
    search: "Ошибка при загрузке данных страницы",
    replace: "{t('forms.pageContent.messages.loadError')}"
  },
  
  // Лейблы полей
  {
    search: 'label="Секция"',
    replace: 'label={t("forms.pageContent.fields.section")}'
  },
  {
    search: 'label="Тип контента"',
    replace: 'label={t("forms.pageContent.fields.contentType")}'
  },
  {
    search: 'label="Заголовок"',
    replace: 'label={t("forms.pageContent.fields.title")}'
  },
  {
    search: 'label="Контент"',
    replace: 'label={t("forms.pageContent.fields.content")}'
  },
  {
    search: 'label="Позиция"',
    replace: 'label={t("forms.pageContent.fields.position")}'
  },
  {
    search: 'label="Активный"',
    replace: 'label={t("forms.pageContent.fields.active")}'
  },
  {
    search: 'label="Или URL изображения"',
    replace: 'label={t("forms.pageContent.fields.orImageUrl")}'
  },
  
  // Опции селектов - секции
  {
    search: ">Главная страница клиента</MenuItem>",
    replace: ">{t('forms.pageContent.sections.client')}</MenuItem>"
  },
  {
    search: ">Панель администратора</MenuItem>",
    replace: ">{t('forms.pageContent.sections.admin')}</MenuItem>"
  },
  {
    search: ">Страница услуг</MenuItem>",
    replace: ">{t('forms.pageContent.sections.service')}</MenuItem>"
  },
  {
    search: ">О нас</MenuItem>",
    replace: ">{t('forms.pageContent.sections.about')}</MenuItem>"
  },
  
  // Опции селектов - типы контента
  {
    search: ">Главный баннер</MenuItem>",
    replace: ">{t('forms.pageContent.contentTypes.hero')}</MenuItem>"
  },
  {
    search: ">Услуга</MenuItem>",
    replace: ">{t('forms.pageContent.contentTypes.service')}</MenuItem>"
  },
  {
    search: ">Город</MenuItem>",
    replace: ">{t('forms.pageContent.contentTypes.city')}</MenuItem>"
  },
  {
    search: ">Статья</MenuItem>",
    replace: ">{t('forms.pageContent.contentTypes.article')}</MenuItem>"
  },
  {
    search: ">Призыв к действию</MenuItem>",
    replace: ">{t('forms.pageContent.contentTypes.cta')}</MenuItem>"
  },
  {
    search: ">Подвал</MenuItem>",
    replace: ">{t('forms.pageContent.contentTypes.footer')}</MenuItem>"
  },
  
  // Заголовок секции изображения
  {
    search: "Изображение",
    replace: "{t('forms.pageContent.fields.image')}"
  },
  
  // Кнопки загрузки и удаления изображения
  {
    search: "Загрузить изображение",
    replace: "{t('forms.pageContent.buttons.uploadImage')}"
  },
  {
    search: "Удалить",
    replace: "{t('forms.pageContent.buttons.deleteImage')}"
  },
  
  // Альт текст и подсказки
  {
    search: "alt=\"Превью изображения\"",
    replace: "alt={t('forms.pageContent.messages.imagePreview')}"
  },
  {
    search: "\"Очистите загруженное изображение для использования URL\"",
    replace: "t('forms.pageContent.messages.clearUploadedImage')"
  },
  {
    search: "\"Альтернатива загрузке файла\"",
    replace: "t('forms.pageContent.messages.urlAlternative')"
  },
  
  // Сообщения в обработчиках
  {
    search: "alert('Пожалуйста, выберите изображение');",
    replace: "alert(t('forms.pageContent.messages.selectImage'));"
  },
  {
    search: "alert('Размер файла не должен превышать 5MB');",
    replace: "alert(t('forms.pageContent.messages.fileSizeError'));"
  }
];

function localizePageContentForm() {
  try {
    console.log('🌐 Начинаем локализацию PageContentFormPage.tsx...');
    
    // Читаем файл
    const filePath = path.join(process.cwd(), PAGE_CONTENT_FORM_PATH);
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
    
    console.log(`\n📊 РЕЗУЛЬТАТ ЛОКАЛИЗАЦИИ PageContentFormPage.tsx:`);
    console.log(`✅ Успешных замен: ${replacementCount}/${TRANSLATIONS_MAP.length}`);
    if (failedReplacements.length > 0) {
      console.log(`❌ Неудачных замен: ${failedReplacements.join(', ')}`);
    }
    console.log(`📁 Файл обновлен: ${PAGE_CONTENT_FORM_PATH}`);
    
  } catch (error) {
    console.error('❌ Ошибка при локализации PageContentFormPage:', error.message);
  }
}

// Запускаем локализацию
localizePageContentForm();
