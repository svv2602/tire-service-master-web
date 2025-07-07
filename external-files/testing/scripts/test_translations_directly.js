// Тест переводов в браузере
// Запустить в консоли браузера на странице приложения

console.log('=== Тест переводов колонок таблицы ===');

// Проверяем доступность i18n
if (typeof window !== 'undefined' && window.i18n) {
  const i18n = window.i18n;
  
  console.log('Текущий язык:', i18n.language);
  console.log('Доступные языки:', i18n.languages);
  
  // Тестируем переводы колонок
  const translations = {
    'tables.columns.name': i18n.t('tables.columns.name'),
    'tables.columns.partner': i18n.t('tables.columns.partner'),
    'tables.columns.city': i18n.t('tables.columns.city'),
    'tables.columns.status': i18n.t('tables.columns.status'),
    'tables.columns.actions': i18n.t('tables.columns.actions')
  };
  
  console.log('Переводы колонок:', translations);
  
  // Проверяем наличие секции tables
  const tablesSection = i18n.getResourceBundle(i18n.language, 'translation').tables;
  console.log('Секция tables:', tablesSection);
  
  // Проверяем прямой доступ к объекту переводов
  const resource = i18n.getResourceBundle(i18n.language, 'translation');
  console.log('Полный ресурс:', resource);
  
  // Тестируем простой перевод
  console.log('Простой перевод (common.save):', i18n.t('common.save'));
  
} else {
  console.error('i18n не найден в window объекте');
  console.log('Попробуйте:', window);
}

// Проверяем React хук переводов через элемент
const element = document.querySelector('[data-testid]') || document.querySelector('div');
if (element && element._owner) {
  console.log('React fiber найден, попробуйте получить доступ к хукам');
} else {
  console.log('React компоненты не найдены');
}

console.log('=== Конец теста ==='); 