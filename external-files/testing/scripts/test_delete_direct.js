#!/usr/bin/env node

// Скрипт для тестирования удаления услуги через терминал
// Запускать с аргументами:
// node test_delete_direct.js TOKEN CATEGORY_ID SERVICE_ID

const fetch = require('node-fetch');

const API_URL = 'http://localhost:8000/api/v1';
const AUTH_TOKEN = process.argv[2]; // Первый аргумент - токен авторизации
const CATEGORY_ID = process.argv[3]; // Второй аргумент - ID категории
const SERVICE_ID = process.argv[4]; // Третий аргумент - ID услуги

if (!AUTH_TOKEN || !CATEGORY_ID || !SERVICE_ID) {
  console.error('Ошибка: Необходимо указать все три аргумента:');
  console.error('1. Токен авторизации');
  console.error('2. ID категории услуг');
  console.error('3. ID услуги для удаления');
  console.error('\nПример: node test_delete_direct.js myToken 1 2');
  process.exit(1);
}

console.log('Тестирование удаления услуги:');
console.log(`- Категория ID: ${CATEGORY_ID}`);
console.log(`- Услуга ID: ${SERVICE_ID}`);
console.log(`- URL запроса: ${API_URL}/service_categories/${CATEGORY_ID}/services/${SERVICE_ID}`);

// Выполнение DELETE запроса
fetch(`${API_URL}/service_categories/${CATEGORY_ID}/services/${SERVICE_ID}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${AUTH_TOKEN}`,
    'Accept': 'application/json'
  }
})
.then(response => {
  console.log(`Статус ответа: ${response.status} ${response.statusText}`);
  
  if (response.ok) {
    console.log('✓ Услуга успешно удалена!');
    return { success: true };
  } else {
    // Попытаемся получить текст ошибки
    return response.text().then(text => {
      let errorDetail = text;
      try {
        // Пробуем распарсить как JSON
        errorDetail = JSON.parse(text);
      } catch (e) {}
      
      return { 
        success: false, 
        status: response.status, 
        error: errorDetail 
      };
    });
  }
})
.then(result => {
  if (!result.success) {
    console.error('✗ Не удалось удалить услугу:');
    console.error(`  Статус: ${result.status}`);
    console.error(`  Ошибка: ${JSON.stringify(result.error, null, 2)}`);
  }
})
.catch(error => {
  console.error('✗ Ошибка при выполнении запроса:', error.message);
})
