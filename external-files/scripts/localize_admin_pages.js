#!/usr/bin/env node

/**
 * Скрипт для автоматической локализации админских страниц
 * Заменяет захардкоженные тексты на переводы из i18n
 */

const fs = require('fs');
const path = require('path');

// Маппинг замен для локализации
const REPLACEMENTS = {
  // Общие тексты
  'Управление пользователями': 'admin.users.title',
  'Создать пользователя': 'admin.users.createUser',
  'Редактировать пользователя': 'admin.users.editUser',
  'Поиск по email, имени, фамилии или номеру телефона...': 'admin.users.searchPlaceholder',
  'Только активные': 'admin.users.onlyActive',
  'Все пользователи': 'admin.users.allUsers',
  'Статус пользователей': 'admin.users.userStatus',
  
  // Партнеры
  'Партнеры': 'admin.partners.title',
  'Добавить партнера': 'admin.partners.createPartner',
  'Создать партнера': 'admin.partners.createPartner',
  'Редактировать партнера': 'admin.partners.editPartner',
  'Поиск по названию компании, контактному лицу или номеру телефона...': 'admin.partners.searchPlaceholder',
  'Партнеры не найдены': 'admin.partners.partnersNotFound',
  'Нет партнеров': 'admin.partners.noPartners',
  
  // Сервисные точки
  'Точки обслуживания': 'admin.servicePoints.title',
  'Создать точку обслуживания': 'admin.servicePoints.createServicePoint',
  'Редактировать точку обслуживания': 'admin.servicePoints.editServicePoint',
  'Поиск по названию точки обслуживания...': 'admin.servicePoints.searchPlaceholder',
  
  // Бренды автомобилей
  'Бренды автомобилей': 'admin.carBrands.title',
  'Добавить бренд': 'admin.carBrands.createBrand',
  'Редактировать бренд': 'admin.carBrands.editBrand',
  'Поиск по названию бренда...': 'admin.carBrands.searchPlaceholder',
  
  // Регионы
  'Регионы': 'admin.regions.title',
  'Добавить регион': 'admin.regions.createRegion',
  'Редактировать регион': 'admin.regions.editRegion',
  'Поиск по названию региона...': 'admin.regions.searchPlaceholder',
  
  // Города
  'Города': 'admin.cities.title',
  'Добавить город': 'admin.cities.createCity',
  'Редактировать город': 'admin.cities.editCity',
  'Поиск по названию города...': 'admin.cities.searchPlaceholder',
  
  // Отзывы
  'Отзывы': 'admin.reviews.title',
  'Создать отзыв': 'admin.reviews.createReview',
  'Редактировать отзыв': 'admin.reviews.editReview',
  'Поиск по тексту отзыва...': 'admin.reviews.searchPlaceholder',
  
  // Бронирования
  'Бронирования': 'admin.bookings.title',
  'Создать бронирование': 'admin.bookings.createBooking',
  'Редактировать бронирование': 'admin.bookings.editBooking',
  'Поиск по номеру бронирования...': 'admin.bookings.searchPlaceholder',
  
  // Статьи
  'Статьи': 'admin.articles.title',
  'Создать статью': 'admin.articles.createArticle',
  'Редактировать статью': 'admin.articles.editArticle',
  'Поиск по заголовку статьи...': 'admin.articles.searchPlaceholder',
  
  // Управление контентом
  'Управление контентом': 'admin.pageContent.title',
  'Создать контент': 'admin.pageContent.createContent',
  'Редактировать контент': 'admin.pageContent.editContent',
  'Поиск по заголовку...': 'admin.pageContent.searchPlaceholder',
  
  // Категории услуг
  'Категории услуг': 'admin.services.title',
  'Добавить категорию': 'admin.services.createCategory',
  'Редактировать категорию': 'admin.services.editCategory',
  'Поиск по названию категории...': 'admin.services.searchPlaceholder',
  
  // Колонки таблиц
  'Пользователь': 'tables.columns.user',
  'Email': 'tables.columns.email',
  'Телефон': 'tables.columns.phone',
  'Роль': 'tables.columns.role',
  'Статус': 'tables.columns.status',
  'Действия': 'tables.columns.actions',
  'Название': 'tables.columns.name',
  'Описание': 'tables.columns.description',
  'Адрес': 'tables.columns.address',
  'Город': 'tables.columns.city',
  'Регион': 'tables.columns.region',
  'Дата создания': 'tables.columns.createdAt',
  'Дата обновления': 'tables.columns.updatedAt',
  
  // Действия
  'Редактировать': 'tables.actions.edit',
  'Удалить': 'tables.actions.delete',
  'Просмотреть': 'tables.actions.view',
  'Активировать': 'tables.actions.activate',
  'Деактивировать': 'tables.actions.deactivate',
  'Одобрить': 'tables.actions.approve',
  'Отклонить': 'tables.actions.reject',
  
  // Статусы
  'Активный': 'statuses.active',
  'Неактивный': 'statuses.inactive',
  'Активен': 'statuses.active',
  'Деактивирован': 'statuses.inactive',
  'Ожидает': 'statuses.pending',
  'Одобрено': 'statuses.approved',
  'Отклонено': 'statuses.rejected',
  
  // Сообщения об ошибках
  'Ошибка при загрузке данных': 'notifications.error.loadingFailed',
  'Ошибка при сохранении': 'notifications.error.savingFailed',
  'Ошибка при удалении': 'notifications.error.deletingFailed',
  'Ошибка сети': 'notifications.error.networkError',
  'Ошибка сервера': 'notifications.error.serverError',
  
  // Сообщения об успехе
  'Успешно создано': 'notifications.success.created',
  'Успешно обновлено': 'notifications.success.updated',
  'Успешно удалено': 'notifications.success.deleted',
  'Успешно активировано': 'notifications.success.activated',
  'Успешно деактивировано': 'notifications.success.deactivated',
  
  // Общие кнопки
  'Сохранить': 'common.save',
  'Отмена': 'common.cancel',
  'Закрыть': 'common.close',
  'Подтвердить': 'common.confirm',
  'Назад': 'common.back',
  'Далее': 'common.next',
  'Поиск': 'common.search',
  'Фильтр': 'common.filter',
  'Очистить': 'common.clear',
  
  // Empty states
  'Данные не найдены': 'notifications.info.noData',
  'Нет данных': 'notifications.info.noData',
  'Загрузка...': 'notifications.info.loading',
  'Сохранение...': 'notifications.info.saving',
  'Удаление...': 'notifications.info.deleting',
  'Обработка...': 'notifications.info.processing'
};

// Файлы для обработки
const ADMIN_PAGES = [
  'src/pages/partners/PartnersPage.tsx',
  'src/pages/service-points/ServicePointsPage.tsx',
  'src/pages/car-brands/CarBrandsPage.tsx',
  'src/pages/regions/RegionsPage.tsx',
  'src/pages/cities/CitiesPage.tsx',
  'src/pages/reviews/ReviewsPage.tsx',
  'src/pages/bookings/BookingsPage.tsx',
  'src/pages/articles/ArticlesPage.tsx',
  'src/pages/page-content/PageContentPage.tsx',
  'src/pages/services/ServicesPage.tsx'
];

function addUseTranslationImport(content) {
  if (content.includes('useTranslation')) {
    return content;
  }
  
  // Найти последний импорт из @mui/material
  const muiImportRegex = /} from '@mui\/material';/;
  const match = content.match(muiImportRegex);
  
  if (match) {
    return content.replace(
      muiImportRegex,
      `} from '@mui/material';\nimport { useTranslation } from 'react-i18next';`
    );
  }
  
  // Если не найден импорт MUI, добавить в начало
  const firstImport = content.indexOf('import');
  if (firstImport !== -1) {
    return content.slice(0, firstImport) + 
           `import { useTranslation } from 'react-i18next';\n` +
           content.slice(firstImport);
  }
  
  return content;
}

function addUseTranslationHook(content) {
  if (content.includes('const { t } = useTranslation();')) {
    return content;
  }
  
  // Найти начало компонента
  const componentRegex = /const \w+Page: React\.FC = \(\) => \{[\s\S]*?const navigate = useNavigate\(\);/;
  const match = content.match(componentRegex);
  
  if (match) {
    return content.replace(
      /const navigate = useNavigate\(\);/,
      `const navigate = useNavigate();\n  const { t } = useTranslation();`
    );
  }
  
  return content;
}

function replaceHardcodedTexts(content) {
  let updatedContent = content;
  
  for (const [hardcoded, translationKey] of Object.entries(REPLACEMENTS)) {
    // Заменяем строки в кавычках
    const quotedRegex = new RegExp(`'${escapeRegex(hardcoded)}'`, 'g');
    updatedContent = updatedContent.replace(quotedRegex, `t('${translationKey}')`);
    
    const doubleQuotedRegex = new RegExp(`"${escapeRegex(hardcoded)}"`, 'g');
    updatedContent = updatedContent.replace(doubleQuotedRegex, `t('${translationKey}')`);
  }
  
  return updatedContent;
}

function updateUseMemoHooks(content) {
  // Обновляем зависимости useMemo хуков, добавляя 't'
  return content.replace(
    /\], \[([^\]]*)\]\);/g,
    (match, deps) => {
      if (!deps.includes('t') && deps.trim() !== '') {
        return `], [${deps}, t]);`;
      } else if (deps.trim() === '') {
        return `], [t]);`;
      }
      return match;
    }
  );
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function localizeFile(filePath) {
  try {
    const fullPath = path.join(__dirname, '../..', filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`❌ Файл не найден: ${filePath}`);
      return false;
    }
    
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // 1. Добавить импорт useTranslation
    content = addUseTranslationImport(content);
    
    // 2. Добавить хук useTranslation
    content = addUseTranslationHook(content);
    
    // 3. Заменить захардкоженные тексты
    content = replaceHardcodedTexts(content);
    
    // 4. Обновить зависимости useMemo
    content = updateUseMemoHooks(content);
    
    // Записать обновленный файл
    fs.writeFileSync(fullPath, content, 'utf8');
    
    console.log(`✅ Локализован: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`❌ Ошибка при обработке ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  console.log('🚀 Начинаю автоматическую локализацию админских страниц...\n');
  
  let successCount = 0;
  let totalCount = ADMIN_PAGES.length;
  
  for (const filePath of ADMIN_PAGES) {
    if (localizeFile(filePath)) {
      successCount++;
    }
  }
  
  console.log(`\n📊 Результат: ${successCount}/${totalCount} файлов успешно локализованы`);
  
  if (successCount === totalCount) {
    console.log('🎉 Все админские страницы успешно локализованы!');
  } else {
    console.log('⚠️ Некоторые файлы не удалось локализовать. Проверьте ошибки выше.');
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  localizeFile,
  REPLACEMENTS,
  ADMIN_PAGES
}; 