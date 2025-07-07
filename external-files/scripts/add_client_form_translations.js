const fs = require('fs');
const path = require('path');

// Пути к файлам переводов
const ruJsonPath = path.join(__dirname, '../../src/i18n/locales/ru.json');
const ukJsonPath = path.join(__dirname, '../../src/i18n/locales/uk.json');

// Переводы для формы редактирования клиента
const clientFormTranslationsRu = {
  "form": {
    "title": {
      "edit": "Редактирование клиента",
      "create": "Новый клиент"
    },
    "fields": {
      "firstName": "Имя",
      "firstNameRequired": "Имя *",
      "lastName": "Фамилия",
      "lastNameRequired": "Фамилия *",
      "middleName": "Отчество",
      "phone": "Номер телефона",
      "phoneRequired": "Номер телефона *",
      "email": "Email",
      "emailPlaceholder": "example@email.com (необязательно)",
      "activeClient": "Активный клиент",
      "notificationMethod": "Способ уведомлений",
      "marketingConsent": "Согласие на маркетинг"
    },
    "validation": {
      "firstNameRequired": "Имя обязательно",
      "firstNameMin": "Имя должно быть не менее 2 символов",
      "lastNameRequired": "Фамилия обязательна",
      "lastNameMin": "Фамилия должна быть не менее 2 символов",
      "emailInvalid": "Введите корректный email",
      "phoneRequired": "Номер телефона обязателен",
      "phoneInvalid": "Введите корректный номер телефона"
    },
    "alerts": {
      "fillRequiredFields": "Заполните все обязательные поля:",
      "allFieldsFilled": "Все обязательные поля заполнены. Можете создать клиента.",
      "unknownError": "Произошла неизвестная ошибка"
    },
    "buttons": {
      "cancel": "Отмена",
      "save": "Сохранить",
      "create": "Создать"
    },
    "messages": {
      "clientUpdated": "Клиент успешно обновлен",
      "clientCreated": "Клиент успешно создан"
    },
    "requiredFields": {
      "firstName": "Имя",
      "lastName": "Фамилия",
      "phone": "Номер телефона"
    }
  }
};

const clientFormTranslationsUk = {
  "form": {
    "title": {
      "edit": "Редагування клієнта",
      "create": "Новий клієнт"
    },
    "fields": {
      "firstName": "Ім'я",
      "firstNameRequired": "Ім'я *",
      "lastName": "Прізвище",
      "lastNameRequired": "Прізвище *",
      "middleName": "По батькові",
      "phone": "Номер телефону",
      "phoneRequired": "Номер телефону *",
      "email": "Email",
      "emailPlaceholder": "example@email.com (необов'язково)",
      "activeClient": "Активний клієнт",
      "notificationMethod": "Спосіб сповіщень",
      "marketingConsent": "Згода на маркетинг"
    },
    "validation": {
      "firstNameRequired": "Ім'я обов'язкове",
      "firstNameMin": "Ім'я повинно бути не менше 2 символів",
      "lastNameRequired": "Прізвище обов'язкове",
      "lastNameMin": "Прізвище повинно бути не менше 2 символів",
      "emailInvalid": "Введіть коректний email",
      "phoneRequired": "Номер телефону обов'язковий",
      "phoneInvalid": "Введіть коректний номер телефону"
    },
    "alerts": {
      "fillRequiredFields": "Заповніть всі обов'язкові поля:",
      "allFieldsFilled": "Всі обов'язкові поля заповнені. Можете створити клієнта.",
      "unknownError": "Сталася невідома помилка"
    },
    "buttons": {
      "cancel": "Скасувати",
      "save": "Зберегти",
      "create": "Створити"
    },
    "messages": {
      "clientUpdated": "Клієнт успішно оновлений",
      "clientCreated": "Клієнт успішно створений"
    },
    "requiredFields": {
      "firstName": "Ім'я",
      "lastName": "Прізвище",
      "phone": "Номер телефону"
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
  if (!ruData.admin.clients) {
    ruData.admin.clients = {};
  }
  
  // Добавляем переводы для формы
  ruData.admin.clients.form = clientFormTranslationsRu.form;
  
  fs.writeFileSync(ruJsonPath, JSON.stringify(ruData, null, 2), 'utf8');
  console.log('✅ Русские переводы для формы клиента добавлены');

  // Обработка украинского файла
  console.log('📝 Обработка украинского файла переводов...');
  const ukContent = fs.readFileSync(ukJsonPath, 'utf8');
  const ukData = JSON.parse(ukContent);
  
  if (!ukData.admin) {
    ukData.admin = {};
  }
  if (!ukData.admin.clients) {
    ukData.admin.clients = {};
  }
  
  // Добавляем переводы для формы
  ukData.admin.clients.form = clientFormTranslationsUk.form;
  
  fs.writeFileSync(ukJsonPath, JSON.stringify(ukData, null, 2), 'utf8');
  console.log('✅ Украинские переводы для формы клиента добавлены');

  console.log('🎉 Переводы для формы редактирования клиента успешно добавлены в оба языка!');
  console.log('📊 Добавлено ключей переводов: ' + Object.keys(clientFormTranslationsRu.form).length);

} catch (error) {
  console.error('❌ Ошибка при добавлении переводов:', error.message);
}