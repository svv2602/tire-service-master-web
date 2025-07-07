const fs = require('fs');
const path = require('path');

// Словарь замен для ServicePointFormPage
const replacements = [
  // FORM_STEPS
  { from: "'Основная информация'", to: "t('forms.servicePoint.steps.basic')" },
  { from: "'Местоположение'", to: "t('forms.servicePoint.steps.location')" },
  { from: "'Контакты'", to: "t('forms.servicePoint.steps.contact')" },
  { from: "'Расписание'", to: "t('forms.servicePoint.steps.schedule')" },
  { from: "'Посты обслуживания'", to: "t('forms.servicePoint.steps.posts')" },
  { from: "'Услуги'", to: "t('forms.servicePoint.steps.services')" },
  { from: "'Фотографии'", to: "t('forms.servicePoint.steps.photos')" },
  { from: "'Настройки'", to: "t('forms.servicePoint.steps.settings')" },
  
  // Validation messages
  { from: "'Название точки обязательно'", to: "t('forms.servicePoint.validation.nameRequired')" },
  { from: "'Партнер обязателен'", to: "t('forms.servicePoint.validation.partnerRequired')" },
  { from: "'Регион обязателен'", to: "t('forms.servicePoint.validation.regionRequired')" },
  { from: "'Город обязателен'", to: "t('forms.servicePoint.validation.cityRequired')" },
  { from: "'Адрес обязателен'", to: "t('forms.servicePoint.validation.addressRequired')" },
  { from: "'Контактный телефон обязателен'", to: "t('forms.servicePoint.validation.phoneRequired')" },
  { from: "'Статус работы обязателен'", to: "t('forms.servicePoint.validation.workStatusRequired')" },
  
  // Console messages
  { from: "'=== Определение пути возврата ==='", to: "'=== Return path determination ==='" },
  { from: "'=== URL параметры ==='", to: "'=== URL parameters ==='" },
  { from: "'=== Прямая загрузка фотографии ==='", to: "'=== Direct photo upload ==='" },
  
  // Error messages
  { from: "'Токен авторизации не найден'", to: "t('errors.authTokenNotFound')" },
  { from: "'Ошибка загрузки фотографии:'", to: "t('errors.photoUploadError')" },
  { from: "'Ошибка загрузки фотографии: '", to: "t('errors.photoUploadError') + ': '" },
  
  // Success messages
  { from: "'Фотография загружена успешно:'", to: "t('forms.servicePoint.photoUploadSuccess')" },
  { from: "'Инвалидируем кэш RTK Query для фотографий и сервисной точки'", to: "t('forms.servicePoint.cacheInvalidation')" },
  
  // Comments
  { from: "// Пн-Пт рабочие дни (id: 1-5)", to: "// Mon-Fri working days (id: 1-5)" },
  { from: "// Все дни изначально выключены", to: "// All days initially disabled" },
  { from: "// Получаем токен и информацию о пользователе из Redux state", to: "// Get token and user info from Redux state" },
  { from: "// Проверяем referrer или state из location", to: "// Check referrer or state from location" },
  { from: "// Если пришли из страницы редактирования партнера", to: "// If came from partner edit page" },
  { from: "// Если пришли из списка сервисных точек партнера", to: "// If came from partner service points list" },
  { from: "// Если пришли из общего списка сервисных точек (только для админов)", to: "// If came from general service points list (admins only)" },
  { from: "// Логика возврата в зависимости от роли пользователя", to: "// Return logic based on user role" },
  { from: "// Партнеры возвращаются на свою страницу редактирования", to: "// Partners return to their edit page" },
  { from: "// Операторы возвращаются к списку сервисных точек своего партнера", to: "// Operators return to their partner's service points list" },
  { from: "// Если есть partnerId, по умолчанию возвращаемся к списку сервисных точек партнера", to: "// If partnerId exists, return to partner's service points list by default" },
  { from: "// По умолчанию возвращаемся к общему списку (только для админов)", to: "// Return to general list by default (admins only)" },
  { from: "// Отладочная информация для проверки параметров URL", to: "// Debug info for URL parameters" },
  { from: "// < 900px - Мобильные устройства", to: "// < 900px - Mobile devices" },
  { from: "// < 1200px - Планшеты", to: "// < 1200px - Tablets" },
  { from: "// < 600px - Маленькие мобильные", to: "// < 600px - Small mobile" },
  { from: "// < 1536px - Большие планшеты", to: "// < 1536px - Large tablets" },
  { from: "// ИСПРАВЛЕНО: бэкенд ожидает поле 'file', а не 'photo'", to: "// FIXED: backend expects 'file' field, not 'photo'" },
  { from: "// Исправляем итерацию для совместимости с TypeScript", to: "// Fix iteration for TypeScript compatibility" },
  { from: "// ИНВАЛИДАЦИЯ КЭША RTK Query после успешной загрузки", to: "// RTK Query cache invalidation after successful upload" },
];

function localizeServicePointForm() {
  const filePath = path.join(__dirname, '../../src/pages/service-points/ServicePointFormPage.tsx');
  
  console.log('🔧 Локализую ServicePointFormPage.tsx...');
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let replacementCount = 0;
    
    // Нужно изменить FORM_STEPS чтобы использовать t() функцию
    // Сначала заменим const FORM_STEPS на функцию
    const formStepsPattern = /const FORM_STEPS = \[[\s\S]*?\];/;
    const newFormSteps = `const getFormSteps = (t: any) => [
  { id: 'basic', label: t('forms.servicePoint.steps.basic'), component: BasicInfoStep },
  { id: 'location', label: t('forms.servicePoint.steps.location'), component: LocationStep },
  { id: 'contact', label: t('forms.servicePoint.steps.contact'), component: ContactStep },
  { id: 'schedule', label: t('forms.servicePoint.steps.schedule'), component: ScheduleStep },
  { id: 'posts', label: t('forms.servicePoint.steps.posts'), component: PostsStep },
  { id: 'services', label: t('forms.servicePoint.steps.services'), component: ServicesStep },
  { id: 'photos', label: t('forms.servicePoint.steps.photos'), component: PhotosStep },
  { id: 'settings', label: t('forms.servicePoint.steps.settings'), component: SettingsStep },
];`;
    
    if (content.match(formStepsPattern)) {
      content = content.replace(formStepsPattern, newFormSteps);
      replacementCount++;
      console.log('✅ Заменен FORM_STEPS на функцию getFormSteps');
    }
    
    // Добавляем переменную FORM_STEPS внутри компонента
    const componentStartPattern = /const ServicePointFormPage: React\.FC = \(\) => \{[\s\S]*?const \{ t \} = useTranslation\(\);/;
    const componentReplacement = `const ServicePointFormPage: React.FC = () => {
  const { t } = useTranslation();
  const FORM_STEPS = getFormSteps(t);`;
    
    if (content.match(componentStartPattern)) {
      content = content.replace(componentStartPattern, componentReplacement);
      replacementCount++;
      console.log('✅ Добавлена переменная FORM_STEPS в компонент');
    }
    
    // Применяем остальные замены
    replacements.forEach(({ from, to }) => {
      const regex = new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      const matches = content.match(regex);
      if (matches) {
        content = content.replace(regex, to);
        replacementCount += matches.length;
        console.log(`✅ Заменено: ${from} → ${to} (${matches.length} раз)`);
      }
    });
    
    // Сохраняем файл
    fs.writeFileSync(filePath, content, 'utf8');
    
    console.log(`\n🎉 ServicePointFormPage.tsx локализован!`);
    console.log(`📊 Всего замен: ${replacementCount}`);
    console.log(`📁 Файл: ${filePath}`);
    
  } catch (error) {
    console.error('❌ Ошибка при локализации:', error);
    process.exit(1);
  }
}

// Запускаем локализацию
localizeServicePointForm(); 