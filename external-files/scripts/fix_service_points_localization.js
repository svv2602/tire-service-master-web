#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Исправление локализации ServicePointsPage...');

const filePath = 'src/pages/service-points/ServicePointsPage.tsx';

if (!fs.existsSync(filePath)) {
  console.log(`❌ Файл не найден: ${filePath}`);
  process.exit(1);
}

let content = fs.readFileSync(filePath, 'utf8');
let fixCount = 0;

// Массив замен для локализации
const replacements = [
  // Рабочие часы
  [/'График не указан'/g, "t('admin.servicePoints.scheduleNotSpecified')"],
  [/'Выходные: '/g, "t('admin.servicePoints.weekends') + ': '"],
  
  // Дни недели в formatWorkingHours
  [/monday: 'Пн'/g, "monday: t('common.days.short.monday')"],
  [/tuesday: 'Вт'/g, "tuesday: t('common.days.short.tuesday')"],
  [/wednesday: 'Ср'/g, "wednesday: t('common.days.short.wednesday')"],
  [/thursday: 'Чт'/g, "thursday: t('common.days.short.thursday')"],
  [/friday: 'Пт'/g, "friday: t('common.days.short.friday')"],
  [/saturday: 'Сб'/g, "saturday: t('common.days.short.saturday')"],
  [/sunday: 'Вс'/g, "sunday: t('common.days.short.sunday')"],
  
  // Заголовки и описания
  [/'Сервисные точки'/g, "t('admin.servicePoints.title')"],
  [/'Управление сервисными точками и их настройками'/g, "t('admin.servicePoints.subtitle')"],
  [/'Управление сервисными точками партнера "/g, "t('admin.servicePoints.partnerSubtitle', { partnerName: '"],
  [/'Добавить сервисную точку'/g, "t('admin.servicePoints.createServicePoint')"],
  
  // Поиск и фильтры
  [/'Поиск по названию или адресу\.\.\.'/g, "t('admin.servicePoints.searchPlaceholder')"],
  [/'Все регионы'/g, "t('filters.allRegions')"],
  [/'Все города'/g, "t('filters.allCities')"],
  [/'Все партнеры'/g, "t('filters.allPartners')"],
  [/'Выберите или введите регион\.\.\.'/g, "t('filters.selectRegion')"],
  [/'Выберите или введите город\.\.\.'/g, "t('filters.selectCity')"],
  [/'Выберите или введите партнера\.\.\.'/g, "t('filters.selectPartner')"],
  [/'Партнер'/g, "t('tables.columns.partner')"],
  [/'Все'/g, "t('common.all')"],
  [/'Активные'/g, "t('statuses.active')"],
  [/'Неактивные'/g, "t('statuses.inactive')"],
  
  // Колонки таблицы
  [/'Сервисная точка'/g, "t('tables.columns.servicePoint')"],
  [/'Область \/ Город'/g, "t('tables.columns.regionCity')"],
  [/'График работы'/g, "t('tables.columns.workingHours')"],
  [/'Статус'/g, "t('tables.columns.status')"],
  [/'Дії'/g, "t('tables.columns.actions')"],
  
  // Статусы
  [/'Активна'/g, "t('statuses.active')"],
  [/'Неактивна'/g, "t('statuses.inactive')"],
  
  // Сообщения и уведомления
  [/'Редактировать сервисную точку'/g, "t('admin.servicePoints.editTooltip')"],
  [/'Деактивировать сервисную точку'/g, "t('admin.servicePoints.deactivateTooltip')"],
  [/'Полностью удалить сервисную точку \(если нет связанных записей\)'/g, "t('admin.servicePoints.deleteTooltip')"],
  [/'Подтвердите действие'/g, "t('common.confirmAction')"],
  [/'Вы уверены, что хотите выполнить это действие\?'/g, "t('common.confirmMessage')"],
  [/'Для создания сервисной точки необходимо выбрать партнера'/g, "t('admin.servicePoints.selectPartnerFirst')"],
  [/'Произошла ошибка при удалении сервисной точки'/g, "t('admin.servicePoints.deleteError')"],
  [/'Невозможно удалить сервисную точку из-за связанных записей'/g, "t('admin.servicePoints.deleteBlocked')"],
  
  // Сообщения об удалении/деактивации
  [/`Сервисная точка "\${servicePoint\.name}" деактивирована\. \${result\.message}`/g, "t('admin.servicePoints.deactivatedMessage', { name: servicePoint.name, message: result.message })"],
  [/`Сервисная точка "\${servicePoint\.name}" полностью удалена из системы\.`/g, "t('admin.servicePoints.deletedMessage', { name: servicePoint.name })"],
  
  // Заголовки с партнером
  [/`Сервисные точки - \${selectedPartnerInfo\.company_name}`/g, "t('admin.servicePoints.titleWithPartner', { partnerName: selectedPartnerInfo.company_name })"],
];

// Применяем замены
replacements.forEach(([regex, replacement]) => {
  const beforeReplace = content;
  content = content.replace(regex, replacement);
  if (beforeReplace !== content) {
    fixCount++;
    console.log(`✅ Заменено: ${regex.source}`);
  }
});

// Специальная замена для дней недели в объекте
const daysObjectPattern = /const days = \{[\s\S]*?\} as const;/;
const daysObjectMatch = content.match(daysObjectPattern);

if (daysObjectMatch) {
  const newDaysObject = `const days = {
    monday: t('common.days.short.monday'),
    tuesday: t('common.days.short.tuesday'),
    wednesday: t('common.days.short.wednesday'),
    thursday: t('common.days.short.thursday'),
    friday: t('common.days.short.friday'),
    saturday: t('common.days.short.saturday'),
    sunday: t('common.days.short.sunday')
  } as const;`;
  
  content = content.replace(daysObjectPattern, newDaysObject);
  fixCount++;
  console.log(`✅ Заменен объект дней недели`);
}

// Исправляем formatWorkingHours функцию для использования t
const formatFunctionPattern = /const formatWorkingHours = \(workingHours: WorkingHoursSchedule \| undefined\): string => \{/;
const formatFunctionMatch = content.match(formatFunctionPattern);

if (formatFunctionMatch) {
  const newFormatFunction = `const formatWorkingHours = (workingHours: WorkingHoursSchedule | undefined, t: any): string => {`;
  content = content.replace(formatFunctionPattern, newFormatFunction);
  fixCount++;
  console.log(`✅ Обновлена сигнатура formatWorkingHours`);
}

// Обновляем вызов formatWorkingHours
const formatCallPattern = /formatWorkingHours\(row\.working_hours\)/g;
if (formatCallPattern.test(content)) {
  content = content.replace(formatCallPattern, 'formatWorkingHours(row.working_hours, t)');
  fixCount++;
  console.log(`✅ Обновлены вызовы formatWorkingHours`);
}

// Сохраняем файл
fs.writeFileSync(filePath, content, 'utf8');

console.log(`\n🎉 Исправление завершено!`);
console.log(`🔄 Всего замен: ${fixCount}`);
console.log(`✅ ServicePointsPage локализована!`); 