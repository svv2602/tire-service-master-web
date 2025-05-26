const axios = require('axios');

const API_BASE_URL = 'http://localhost:8000';

async function testBookingsAPI() {
  console.log('🔍 Тестирование API бронирований...\n');

  try {
    // 1. Проверка health endpoint
    console.log('1. Проверка health endpoint...');
    const healthResponse = await axios.get(`${API_BASE_URL}/api/v1/health`);
    console.log('✅ Health check:', healthResponse.data);
    console.log('');

    // 2. Попытка получить бронирования без авторизации
    console.log('2. Попытка получить бронирования без авторизации...');
    try {
      const bookingsResponse = await axios.get(`${API_BASE_URL}/api/v1/bookings`);
      console.log('✅ Бронирования получены:', bookingsResponse.data);
    } catch (error) {
      console.log('❌ Ошибка (ожидаемо):', error.response?.status, error.response?.data);
    }
    console.log('');

    // 3. Попытка получить бронирования с тестовым параметром
    console.log('3. Попытка получить бронирования с тестовым параметром...');
    try {
      const testResponse = await axios.get(`${API_BASE_URL}/api/v1/bookings?test=true`);
      console.log('✅ Тестовые бронирования получены:', testResponse.data);
    } catch (error) {
      console.log('❌ Ошибка:', error.response?.status, error.response?.data);
    }
    console.log('');

    // 4. Проверка с SWAGGER_DRY_RUN
    console.log('4. Проверка с SWAGGER_DRY_RUN...');
    try {
      const swaggerResponse = await axios.get(`${API_BASE_URL}/api/v1/bookings`, {
        headers: {
          'X-Swagger-Dry-Run': 'true'
        }
      });
      console.log('✅ Swagger dry run:', swaggerResponse.data);
    } catch (error) {
      console.log('❌ Ошибка:', error.response?.status, error.response?.data);
    }
    console.log('');

    // 5. Проверка маршрутов
    console.log('5. Проверка доступных маршрутов...');
    try {
      const routesResponse = await axios.get(`${API_BASE_URL}/api/v1/partners`);
      console.log('✅ Партнеры доступны');
    } catch (error) {
      console.log('❌ Партнеры недоступны:', error.response?.status);
    }

    try {
      const regionsResponse = await axios.get(`${API_BASE_URL}/api/v1/regions`);
      console.log('✅ Регионы доступны:', regionsResponse.data.length, 'регионов');
    } catch (error) {
      console.log('❌ Регионы недоступны:', error.response?.status);
    }

  } catch (error) {
    console.error('❌ Общая ошибка:', error.message);
  }
}

// Запуск тестов
testBookingsAPI(); 