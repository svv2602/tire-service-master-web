const fs = require('fs');
const path = require('path');

// Функция для локализации MainLayout.tsx
function localizeMainLayout() {
  const filePath = path.join(__dirname, '../../src/components/layouts/MainLayout.tsx');
  
  console.log('🔧 Локализую MainLayout.tsx...');
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let replacementCount = 0;
    
    // Добавляем импорт useTranslation если его нет
    if (!content.includes('useTranslation')) {
      const importReactIndex = content.indexOf("import React");
      const importLines = content.substring(0, importReactIndex).split('\n');
      const newImportLine = "import { useTranslation } from 'react-i18next';";
      
      // Вставляем импорт после React импорта
      const reactImportEnd = content.indexOf('\n', importReactIndex);
      content = content.slice(0, reactImportEnd + 1) + newImportLine + '\n' + content.slice(reactImportEnd + 1);
      replacementCount++;
      console.log('✅ Добавлен импорт useTranslation');
    }
    
    // Добавляем хук useTranslation в компонент
    if (!content.includes('const { t } = useTranslation();')) {
      const componentStart = content.indexOf('const MainLayout: React.FC = () => {');
      const nextLine = content.indexOf('\n', componentStart);
      content = content.slice(0, nextLine + 1) + '  const { t } = useTranslation();\n' + content.slice(nextLine + 1);
      replacementCount++;
      console.log('✅ Добавлен хук useTranslation');
    }
    
    // Заменяем getMenuSections на функцию с t параметром
    const menuSectionsPattern = /const getMenuSections = \(\): MenuSection\[\] => \{/;
    if (content.match(menuSectionsPattern)) {
      content = content.replace(menuSectionsPattern, 'const getMenuSections = (t: any): MenuSection[] => {');
      replacementCount++;
      console.log('✅ Обновлена сигнатура getMenuSections');
    }
    
    // Обновляем вызов getMenuSections
    const menuSectionsCall = /getFilteredMenuSections\(\)/g;
    if (content.match(menuSectionsCall)) {
      content = content.replace(/getFilteredMenuSections\(\)/g, 'getFilteredMenuSections(t)');
      replacementCount++;
      console.log('✅ Обновлен вызов getFilteredMenuSections');
    }
    
    // Обновляем getFilteredMenuSections
    const filteredMenuPattern = /const getFilteredMenuSections = \(\) => \{/;
    if (content.match(filteredMenuPattern)) {
      content = content.replace(filteredMenuPattern, 'const getFilteredMenuSections = (t: any) => {');
      replacementCount++;
      console.log('✅ Обновлена сигнатура getFilteredMenuSections');
    }
    
    // Обновляем вызов getMenuSections внутри getFilteredMenuSections
    const innerMenuCall = /const menuSections = getMenuSections\(\);/;
    if (content.match(innerMenuCall)) {
      content = content.replace(innerMenuCall, 'const menuSections = getMenuSections(t);');
      replacementCount++;
      console.log('✅ Обновлен внутренний вызов getMenuSections');
    }
    
    // Заменяем захардкоженные тексты на переводы
    const replacements = [
      // Заголовки разделов
      { from: "title: 'Обзор',", to: "title: t('navigation.sections.overview')," },
      { from: "title: 'Управление',", to: "title: t('navigation.sections.management')," },
      { from: "title: 'Сервис',", to: "title: t('navigation.sections.service')," },
      { from: "title: 'Контент',", to: "title: t('navigation.sections.content')," },
      { from: "title: 'Бронирования',", to: "title: t('navigation.sections.bookings')," },
      { from: "title: 'Отзывы',", to: "title: t('navigation.sections.reviews')," },
      { from: "title: 'Справочники',", to: "title: t('navigation.sections.references')," },
      { from: "title: 'Настройки',", to: "title: t('navigation.sections.settings')," },
      
      // Пункты меню
      { from: "text: 'Дашборд',", to: "text: t('navigation.dashboard')," },
      { from: "text: 'Главная страница',", to: "text: t('navigation.homepage')," },
      { from: "text: 'Пользователи',", to: "text: t('navigation.users')," },
      { from: "text: 'Партнеры',", to: "text: t('navigation.partners')," },
      { from: "text: 'Клиенты',", to: "text: t('navigation.clients')," },
      { from: "text: 'Сервисные точки',", to: "text: t('navigation.servicePoints')," },
      { from: "text: 'Мои точки',", to: "text: t('navigation.myServicePoints')," },
      { from: "text: 'Статьи',", to: "text: t('navigation.articles')," },
      { from: "text: 'Весь контент',", to: "text: t('navigation.allContent')," },
      { from: "text: 'Создать контент',", to: "text: t('navigation.createContent')," },
      { from: "text: 'Расширенное управление',", to: "text: t('navigation.advancedManagement')," },
      { from: "text: 'SEO настройки',", to: "text: t('navigation.seoSettings')," },
      { from: "text: 'StyleGuide',", to: "text: t('navigation.styleGuide')," },
      { from: "text: 'Все бронирования',", to: "text: t('navigation.allBookings')," },
      { from: "text: '📅 Календарь записей',", to: "text: t('navigation.bookingCalendar')," },
      { from: "text: '📊 Аналитика и отчеты',", to: "text: t('navigation.analyticsReports')," },
      { from: "text: 'Мои бронирования',", to: "text: t('navigation.myBookings')," },
      { from: "text: 'Все отзывы',", to: "text: t('navigation.allReviews')," },
      { from: "text: 'Регионы и города',", to: "text: t('navigation.regionsAndCities')," },
      { from: "text: 'Автомобили',", to: "text: t('navigation.vehicles')," },
      { from: "text: 'Профиль',", to: "text: t('navigation.profile')," },
      { from: "text: 'Системные настройки',", to: "text: t('navigation.systemSettings')," },
      
      // Описания
      { from: "description: 'Общая статистика и показатели',", to: "description: t('navigation.descriptions.dashboard')," },
      { from: "description: 'Ваша персональная панель',", to: "description: t('navigation.descriptions.homepage')," },
      { from: "description: 'Управление пользователями системы',", to: "description: t('navigation.descriptions.users')," },
      { from: "description: 'Управление партнерами',", to: "description: t('navigation.descriptions.partners')," },
      { from: "description: 'Управление клиентами',", to: "description: t('navigation.descriptions.clients')," },
      { from: "description: 'Управление точками обслуживания',", to: "description: t('navigation.descriptions.servicePoints')," },
      { from: "description: 'Управление собственными точками',", to: "description: t('navigation.descriptions.myServicePoints')," },
      { from: "description: 'Управление статьями базы знаний',", to: "description: t('navigation.descriptions.articles')," },
      { from: "description: 'Просмотр всего контента страниц',", to: "description: t('navigation.descriptions.allContent')," },
      { from: "description: 'Создание нового контента',", to: "description: t('navigation.descriptions.createContent')," },
      { from: "description: 'Продвинутые инструменты управления контентом',", to: "description: t('navigation.descriptions.advancedManagement')," },
      { from: "description: 'Управление SEO-параметрами',", to: "description: t('navigation.descriptions.seoSettings')," },
      { from: "description: 'Руководство по стилям и компонентам UI',", to: "description: t('navigation.descriptions.styleGuide')," },
      { from: "description: 'Управление бронированиями',", to: "description: t('navigation.descriptions.allBookings')," },
      { from: "description: 'Календарное представление бронирований',", to: "description: t('navigation.descriptions.bookingCalendar')," },
      { from: "description: 'Аналитика и статистика бронирований',", to: "description: t('navigation.descriptions.analyticsReports')," },
      { from: "description: 'Ваши бронирования',", to: "description: t('navigation.descriptions.myBookings')," },
      { from: "description: 'Управление отзывами клиентов',", to: "description: t('navigation.descriptions.allReviews')," },
      { from: "description: 'Управление регионами и городами',", to: "description: t('navigation.descriptions.regionsAndCities')," },
      { from: "description: 'Управление марками и моделями автомобилей',", to: "description: t('navigation.descriptions.vehicles')," },
      { from: "description: 'Настройки профиля',", to: "description: t('navigation.descriptions.profile')," },
      { from: "description: 'Общие настройки системы',", to: "description: t('navigation.descriptions.systemSettings')," },
      
      // Заголовок приложения
      { from: 'title="Твоя шина - Администратор"', to: 'title={t("navigation.appTitle")}' },
    ];
    
    // Применяем замены
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
    
    console.log(`\n🎉 MainLayout.tsx локализован!`);
    console.log(`📊 Всего замен: ${replacementCount}`);
    
  } catch (error) {
    console.error('❌ Ошибка при локализации MainLayout:', error);
  }
}

// Функция для локализации profileActions.ts
function localizeProfileActions() {
  const filePath = path.join(__dirname, '../../src/components/ui/AppBar/profileActions.ts');
  
  console.log('🔧 Локализую profileActions.ts...');
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let replacementCount = 0;
    
    // Добавляем импорт TFunction если его нет
    if (!content.includes('TFunction')) {
      const importIndex = content.indexOf("import { UserRole, User }");
      content = content.replace(
        "import { UserRole, User } from '../../../types';",
        "import { UserRole, User } from '../../../types';\nimport { TFunction } from 'i18next';"
      );
      replacementCount++;
      console.log('✅ Добавлен импорт TFunction');
    }
    
    // Обновляем сигнатуру функции
    const functionSignature = /export function getProfileActions\(\{[\s\S]*?\}\): AppBarAction\[\] \{/;
    const newSignature = `export function getProfileActions({
  user,
  isAuthenticated,
  navigate,
  isAdminPanel,
  onLogout,
  t,
}: {
  user: User | null;
  isAuthenticated: boolean;
  navigate: NavigateFunction;
  isAdminPanel: boolean;
  onLogout: () => void;
  t: TFunction;
}): AppBarAction[] {`;
    
    if (content.match(functionSignature)) {
      content = content.replace(functionSignature, newSignature);
      replacementCount++;
      console.log('✅ Обновлена сигнатура getProfileActions');
    }
    
    // Заменяем захардкоженные тексты на переводы
    const replacements = [
      { from: "label: 'Увійти',", to: "label: t('userMenu.login')," },
      { from: "label: 'Профіль',", to: "label: t('userMenu.profile')," },
      { from: "label: 'Мої записи',", to: "label: t('userMenu.myBookings')," },
      { from: "label: 'Мої відгуки',", to: "label: t('userMenu.myReviews')," },
      { from: "label: 'На сайт',", to: "label: t('userMenu.toWebsite')," },
      { from: "label: 'Адмін-панель',", to: "label: t('userMenu.adminPanel')," },
      { from: "label: 'Вийти',", to: "label: t('userMenu.logout')," },
    ];
    
    // Применяем замены
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
    
    console.log(`\n🎉 profileActions.ts локализован!`);
    console.log(`📊 Всего замен: ${replacementCount}`);
    
  } catch (error) {
    console.error('❌ Ошибка при локализации profileActions:', error);
  }
}

// Запускаем локализацию
console.log('🚀 Начинаю локализацию навигационных компонентов...\n');
localizeMainLayout();
console.log('\n' + '='.repeat(50) + '\n');
localizeProfileActions();
console.log('\n🎉 Локализация навигационных компонентов завершена!'); 