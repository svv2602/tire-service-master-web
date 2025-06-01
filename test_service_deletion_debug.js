const fetch = require('node-fetch');

// Настройки
const API_URL = 'http://localhost:8000/api/v1';
const AUTH_TOKEN = 'ваш_токен'; // Замените на свой токен авторизации
const CATEGORY_ID = '1'; // ID категории услуг
const SERVICE_ID = '1'; // ID услуги для удаления

console.log('Тестирование запроса на удаление услуги');
console.log(`URL: ${API_URL}/service_categories/${CATEGORY_ID}/services/${SERVICE_ID}`);

// Отправляем DELETE запрос
fetch(`${API_URL}/service_categories/${CATEGORY_ID}/services/${SERVICE_ID}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${AUTH_TOKEN}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})
.then(response => {
  console.log(`Статус ответа: ${response.status} ${response.statusText}`);
  if (response.ok) {
    console.log('Услуга успешно удалена!');
  } else {
    return response.json().then(data => {
      console.error('Ошибка при удалении услуги:', data);
    });
  }
})
.catch(error => {
  console.error('Ошибка при выполнении запроса:', error);
});
