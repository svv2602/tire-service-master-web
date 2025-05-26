const axios = require('axios');

const API_BASE_URL = 'http://localhost:8000';

// Токен из логов (действительный токен администратора)
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoyLCJleHAiOjE3NDgyNDA4MDksInRva2VuX3R5cGUiOiJhY2Nlc3MifQ.F36-I9JcFfY2ufwV031i1napgZCvpYcmOgfgsw2QRg0';

async function testBookingsWithAuth() {
  console.log('🔍 Тестирование API бронирований с авторизацией...\n');

  try {
    // 1. Проверка health endpoint
    console.log('1. Проверка health endpoint...');
    const healthResponse = await axios.get(`${API_BASE_URL}/api/v1/health`);
    console.log('✅ Health check:', healthResponse.data);
    console.log('');

    // 2. Получение бронирований с авторизацией
    console.log('2. Получение бронирований с авторизацией...');
    try {
      const bookingsResponse = await axios.get(`${API_BASE_URL}/api/v1/bookings?page=1&per_page=10`, {
        headers: {
          'Authorization': `Bearer ${AUTH_TOKEN}`
        }
      });
      console.log('✅ Бронирования получены успешно!');
      console.log('Структура ответа:', Object.keys(bookingsResponse.data));
      
      if (bookingsResponse.data.data) {
        console.log('Количество бронирований:', bookingsResponse.data.data.length);
        console.log('Пагинация:', bookingsResponse.data.pagination);
      }
      
      if (bookingsResponse.data.data && bookingsResponse.data.data.length > 0) {
        console.log('Пример бронирования:', bookingsResponse.data.data[0]);
      }
    } catch (error) {
      console.log('❌ Ошибка:', error.response?.status, error.response?.data);
    }
    console.log('');

    // 3. Проверка с параметрами фильтрации
    console.log('3. Проверка с параметрами фильтрации...');
    try {
      const filteredResponse = await axios.get(`${API_BASE_URL}/api/v1/bookings?page=1&per_page=5&today=true`, {
        headers: {
          'Authorization': `Bearer ${AUTH_TOKEN}`
        }
      });
      console.log('✅ Фильтрованные бронирования получены:', filteredResponse.data.pagination);
    } catch (error) {
      console.log('❌ Ошибка фильтрации:', error.response?.status, error.response?.data);
    }
    console.log('');

    // 4. Проверка без авторизации (должна быть ошибка)
    console.log('4. Проверка без авторизации (должна быть ошибка)...');
    try {
      const unauthorizedResponse = await axios.get(`${API_BASE_URL}/api/v1/bookings`);
      console.log('❌ Неожиданно получен ответ без авторизации:', unauthorizedResponse.data);
    } catch (error) {
      console.log('✅ Правильно отклонен запрос без авторизации:', error.response?.status, error.response?.data?.error);
    }

  } catch (error) {
    console.error('❌ Общая ошибка:', error.message);
  }
}

// Запуск тестов
testBookingsWithAuth(); 