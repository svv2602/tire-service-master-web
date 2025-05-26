const axios = require('axios');

const FRONTEND_URL = 'http://localhost:3000';
const API_BASE_URL = 'http://localhost:8000';

// Токен администратора
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoyLCJleHAiOjE3NDgyNDA4MDksInRva2VuX3R5cGUiOiJhY2Nlc3MifQ.F36-I9JcFfY2ufwV031i1napgZCvpYcmOgfgsw2QRg0';

async function testFrontendBookings() {
  console.log('🔍 Тестирование интеграции фронтенда с API бронирований...\n');

  try {
    // 1. Проверка доступности фронтенда
    console.log('1. Проверка доступности фронтенда...');
    try {
      const frontendResponse = await axios.get(FRONTEND_URL, { timeout: 5000 });
      console.log('✅ Фронтенд доступен на порту 3000');
    } catch (error) {
      console.log('❌ Фронтенд недоступен:', error.message);
      return;
    }
    console.log('');

    // 2. Проверка API бронирований
    console.log('2. Проверка API бронирований...');
    try {
      const bookingsResponse = await axios.get(`${API_BASE_URL}/api/v1/bookings?page=1&per_page=10`, {
        headers: {
          'Authorization': `Bearer ${AUTH_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ API бронирований работает');
      console.log('Структура ответа:', Object.keys(bookingsResponse.data));
      console.log('Количество бронирований:', bookingsResponse.data.data?.length || 0);
      console.log('Пагинация:', bookingsResponse.data.pagination);
      
      // Проверяем структуру данных
      if (bookingsResponse.data.data && bookingsResponse.data.data.length > 0) {
        const booking = bookingsResponse.data.data[0];
        console.log('Поля бронирования:', Object.keys(booking));
        console.log('Пример времени start_time:', booking.start_time);
        console.log('Пример времени end_time:', booking.end_time);
      }
      
    } catch (error) {
      console.log('❌ Ошибка API:', error.response?.status, error.response?.data);
      return;
    }
    console.log('');

    // 3. Проверка других необходимых API
    console.log('3. Проверка вспомогательных API...');
    
    // Проверка API регионов
    try {
      const regionsResponse = await axios.get(`${API_BASE_URL}/api/v1/regions`);
      console.log('✅ API регионов работает, количество:', regionsResponse.data.length);
    } catch (error) {
      console.log('❌ API регионов недоступен:', error.response?.status);
    }
    
    // Проверка API партнеров
    try {
      const partnersResponse = await axios.get(`${API_BASE_URL}/api/v1/partners`);
      console.log('✅ API партнеров работает');
    } catch (error) {
      console.log('❌ API партнеров недоступен:', error.response?.status);
    }
    
    console.log('');
    console.log('🎉 Все основные компоненты работают!');
    console.log('');
    console.log('📋 Инструкции для тестирования:');
    console.log('1. Откройте браузер и перейдите на http://localhost:3000');
    console.log('2. Войдите в систему с токеном администратора');
    console.log('3. Перейдите в раздел "Бронирования"');
    console.log('4. Проверьте, что данные загружаются без ошибок');
    console.log('5. Проверьте работу пагинации и фильтров');

  } catch (error) {
    console.error('❌ Общая ошибка:', error.message);
  }
}

// Запуск тестов
testFrontendBookings(); 