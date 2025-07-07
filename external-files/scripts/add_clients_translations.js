const fs = require('fs');
const path = require('path');

// Пути к файлам переводов
const ruJsonPath = path.join(__dirname, '../../src/i18n/locales/ru.json');
const ukJsonPath = path.join(__dirname, '../../src/i18n/locales/uk.json');

// Переводы для секции admin.clients
const clientsTranslationsRu = {
  "clients": {
    "title": "Клиенты",
    "createClient": "Добавить клиента",
    "editClient": "Редактировать клиента",
    "searchPlaceholder": "Поиск по имени, фамилии, email или телефону...",
    "onlyActive": "Только активные",
    "allClients": "Все клиенты",
    "clientStatus": "Статус клиентов",
    "deactivate": "Деактивировать",
    "activate": "Активировать",
    "view": "Просмотр",
    "viewTooltip": "Просмотр детальной информации о клиенте",
    "editTooltip": "Редактировать данные клиента",
    "deleteTooltip": "Удалить клиента",
    "deactivateTooltip": "Деактивировать клиента",
    "activateTooltip": "Активировать клиента",
    "confirmStatusChange": "Подтверждение изменения статуса",
    "confirmStatusMessage": "Вы действительно хотите изменить статус этого клиента?",
    "confirmDelete": "Подтверждение удаления",
    "confirmDeleteMessage": "Вы действительно хотите удалить этого клиента? Это действие нельзя отменить.",
    "client": "Клиент",
    "email": "Email",
    "phone": "Телефон",
    "notSpecified": "Не указан",
    "status": "Статус",
    "active": "Активен",
    "inactive": "Неактивен",
    "deactivated": "Деактивирован",
    "actions": "Действия",
    "clientsNotFound": "Клиенты не найдены",
    "noClients": "Нет клиентов",
    "changeSearchCriteria": "Попробуйте изменить критерии поиска",
    "createFirstClient": "Создайте первого клиента для начала работы",
    "cars": "Автомобили",
    "bookings": "Записи",
    "reviews": "Отзывы",
    "registrationDate": "Дата регистрации",
    "lastActivity": "Последняя активность",
    "stats": {
      "foundClients": "Найдено клиентов: <strong>{{count}}</strong>",
      "activeClients": "Активных: <strong>{{count}}</strong>",
      "inactiveClients": "Неактивных: <strong>{{count}}</strong>",
      "onlyActive": "(только активные)",
      "withInactive": "(включая неактивных)"
    },
    "initials": {
      "default": "К"
    },
    "messages": {
      "statusChanged": "Статус клиента {{name}} изменен",
      "deleted": "Клиент {{name}} успешно удален",
      "statusError": "Ошибка при изменении статуса клиента",
      "deleteError": "Ошибка при удалении клиента"
    }
  }
};

const clientsTranslationsUk = {
  "clients": {
    "title": "Клієнти",
    "createClient": "Додати клієнта",
    "editClient": "Редагувати клієнта",
    "searchPlaceholder": "Пошук за ім'ям, прізвищем, email або телефоном...",
    "onlyActive": "Тільки активні",
    "allClients": "Всі клієнти",
    "clientStatus": "Статус клієнтів",
    "deactivate": "Деактивувати",
    "activate": "Активувати",
    "view": "Перегляд",
    "viewTooltip": "Перегляд детальної інформації про клієнта",
    "editTooltip": "Редагувати дані клієнта",
    "deleteTooltip": "Видалити клієнта",
    "deactivateTooltip": "Деактивувати клієнта",
    "activateTooltip": "Активувати клієнта",
    "confirmStatusChange": "Підтвердження зміни статусу",
    "confirmStatusMessage": "Ви дійсно хочете змінити статус цього клієнта?",
    "confirmDelete": "Підтвердження видалення",
    "confirmDeleteMessage": "Ви дійсно хочете видалити цього клієнта? Цю дію неможливо скасувати.",
    "client": "Клієнт",
    "email": "Email",
    "phone": "Телефон",
    "notSpecified": "Не вказано",
    "status": "Статус",
    "active": "Активний",
    "inactive": "Неактивний",
    "deactivated": "Деактивований",
    "actions": "Дії",
    "clientsNotFound": "Клієнти не знайдені",
    "noClients": "Немає клієнтів",
    "changeSearchCriteria": "Спробуйте змінити критерії пошуку",
    "createFirstClient": "Створіть першого клієнта для початку роботи",
    "cars": "Автомобілі",
    "bookings": "Записи",
    "reviews": "Відгуки",
    "registrationDate": "Дата реєстрації",
    "lastActivity": "Остання активність",
    "stats": {
      "foundClients": "Знайдено клієнтів: <strong>{{count}}</strong>",
      "activeClients": "Активних: <strong>{{count}}</strong>",
      "inactiveClients": "Неактивних: <strong>{{count}}</strong>",
      "onlyActive": "(тільки активні)",
      "withInactive": "(включаючи неактивних)"
    },
    "initials": {
      "default": "К"
    },
    "messages": {
      "statusChanged": "Статус клієнта {{name}} змінено",
      "deleted": "Клієнт {{name}} успішно видалений",
      "statusError": "Помилка при зміні статусу клієнта",
      "deleteError": "Помилка при видаленні клієнта"
    }
  }
};

try {
  // Обработка русского файла
  console.log('📝 Обработка русского файла переводов...');
  const ruContent = fs.readFileSync(ruJsonPath, 'utf8');
  const ruData = JSON.parse(ruContent);
  
  if (!ruData.admin) {
    ruData.admin = {};
  }
  
  ruData.admin.clients = clientsTranslationsRu.clients;
  
  fs.writeFileSync(ruJsonPath, JSON.stringify(ruData, null, 2), 'utf8');
  console.log('✅ Русские переводы для admin.clients добавлены');

  // Обработка украинского файла
  console.log('📝 Обработка украинского файла переводов...');
  const ukContent = fs.readFileSync(ukJsonPath, 'utf8');
  const ukData = JSON.parse(ukContent);
  
  if (!ukData.admin) {
    ukData.admin = {};
  }
  
  ukData.admin.clients = clientsTranslationsUk.clients;
  
  fs.writeFileSync(ukJsonPath, JSON.stringify(ukData, null, 2), 'utf8');
  console.log('✅ Украинские переводы для admin.clients добавлены');

  console.log('🎉 Переводы для страницы /admin/clients успешно добавлены в оба языка!');
  console.log('📊 Добавлено ключей: ' + Object.keys(clientsTranslationsRu.clients).length);

} catch (error) {
  console.error('❌ Ошибка при добавлении переводов:', error.message);
}