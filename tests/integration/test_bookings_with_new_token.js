const axios = require('axios');

const API_BASE_URL = 'http://localhost:8000';

// Новый токен из логов (действительный токен администратора)
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoyLCJleHAiOjE3NDgyNDg2OTEsInRva2VuX3R5cGUiOiJhY2Nlc3MifQ.xmBuOjj2jM7RpboyWt23SqpkbjROk_tVkQnEdu7fX8k';

async function testBookingsWithNewToken() {
  console.log('🔍 Тестирование API бронирований с новым токеном...\n');

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
          'Authorization': `Bearer ${AUTH_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Бронирования получены успешно!');
      console.log('Статус:', bookingsResponse.status);
      console.log('Структура ответа:', Object.keys(bookingsResponse.data));
      
      if (bookingsResponse.data.data && bookingsResponse.data.data.length > 0) {
        console.log('Количество бронирований:', bookingsResponse.data.data.length);
        console.log('Пагинация:', bookingsResponse.data.pagination);
        console.log('Пример бронирования:');
        console.log(JSON.stringify(bookingsResponse.data.data[0], null, 2));
        
        // Проверяем, есть ли связанные данные
        const booking = bookingsResponse.data.data[0];
        console.log('\n📊 Анализ структуры данных:');
        console.log('- ID бронирования:', booking.id);
        console.log('- Дата бронирования:', booking.booking_date);
        console.log('- Время начала:', booking.start_time);
        console.log('- Время окончания:', booking.end_time);
        console.log('- ID статуса:', booking.status_id);
        console.log('- Статус (объект):', booking.status);
        console.log('- ID клиента:', booking.client_id);
        console.log('- Клиент (объект):', booking.client);
        console.log('- ID точки обслуживания:', booking.service_point_id);
        console.log('- Точка обслуживания (объект):', booking.service_point);
        console.log('- ID типа автомобиля:', booking.car_type_id);
        console.log('- Тип автомобиля (объект):', booking.car_type);
      } else {
        console.log('Бронирований не найдено');
      }
      
    } catch (error) {
      console.log('❌ Ошибка при получении бронирований:', error.response?.status, error.response?.data);
    }
    console.log('');

    // 3. Проверка отдельного бронирования
    console.log('3. Получение отдельного бронирования...');
    try {
      const singleBookingResponse = await axios.get(`${API_BASE_URL}/api/v1/bookings/5`, {
        headers: {
          'Authorization': `Bearer ${AUTH_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Отдельное бронирование получено успешно!');
      console.log('Структура отдельного бронирования:');
      console.log(JSON.stringify(singleBookingResponse.data, null, 2));
      
    } catch (error) {
      console.log('❌ Ошибка при получении отдельного бронирования:', error.response?.status, error.response?.data);
    }

  } catch (error) {
    console.log('❌ Общая ошибка:', error.message);
  }
}

testBookingsWithNewToken(); 