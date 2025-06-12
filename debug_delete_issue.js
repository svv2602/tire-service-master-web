// Скрипт для отладки проблемы с удалением услуг
// Запускается в консоли браузера на странице http://localhost:3008/services/3/edit

console.log('=== НАЧАЛО ОТЛАДКИ УДАЛЕНИЯ УСЛУГ ===');

// Получаем токен из localStorage
const token = localStorage.getItem('tvoya_shina_token') || 
             localStorage.getItem('tvoya_shina_auth_token') || 
             localStorage.getItem('token') || 
             localStorage.getItem('auth_token');

console.log('🔑 Токен авторизации:', token ? 'найден' : 'НЕ НАЙДЕН');

if (!token) {
  console.error('❌ Токен не найден. Необходимо войти в систему.');
} else {
  console.log('✅ Токен найден, продолжаем тестирование...');
  
  // Тестируем получение списка услуг в категории 3
  fetch('http://localhost:8000/api/v1/service_categories/3/services', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  })
  .then(response => response.json())
  .then(services => {
    console.log(`📋 Найдено услуг в категории 3: ${services.length}`);
    
    if (services.length > 0) {
      const testService = services[0];
      console.log(`🎯 Тестовая услуга для удаления:`, {
        id: testService.id,
        name: testService.name,
        idType: typeof testService.id
      });
      
      // Формируем URL как в RTK Query
      const categoryId = '3';
      const serviceId = String(testService.id);
      const deleteUrl = `http://localhost:8000/api/v1/service_categories/${categoryId}/services/${serviceId}`;
      
      console.log(`🔗 URL для удаления: ${deleteUrl}`);
      
      // Проверяем, что URL формируется корректно
      if (deleteUrl.includes('[object') || deleteUrl.includes('undefined')) {
        console.error('❌ ПРОБЛЕМА: URL содержит [object Object] или undefined!');
      } else {
        console.log('✅ URL выглядит корректно');
        
        // Тестируем удаление (осторожно - это реально удалит услугу!)
        const shouldDelete = confirm(`Удалить услугу "${testService.name}" для тестирования?`);
        
        if (shouldDelete) {
          console.log('🗑️ Выполняем DELETE запрос...');
          
          fetch(deleteUrl, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          })
          .then(response => {
            console.log(`📡 Ответ сервера: ${response.status} ${response.statusText}`);
            
            if (response.ok) {
              console.log('✅ Услуга успешно удалена!');
            } else {
              console.error('❌ Ошибка при удалении услуги');
              return response.text().then(text => {
                console.error('Детали ошибки:', text);
              });
            }
          })
          .catch(error => {
            console.error('❌ Сетевая ошибка:', error);
          });
        } else {
          console.log('⏭️ Удаление отменено пользователем');
        }
      }
    } else {
      console.log('📭 В категории 3 нет услуг для тестирования');
    }
  })
  .catch(error => {
    console.error('❌ Ошибка при получении списка услуг:', error);
  });
}

console.log('=== КОНЕЦ СКРИПТА ОТЛАДКИ ===');
