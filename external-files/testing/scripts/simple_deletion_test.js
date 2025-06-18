console.log('🔧 Запуск теста удаления услуг...');

const http = require('http');

// Простая функция для HTTP запросов
function httpRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: body
        });
      });
    });
    
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function runTest() {
  try {
    console.log('1. Проверка API...');
    
    // Авторизация
    const loginResp = await httpRequest({
      hostname: 'localhost',
      port: 8000,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, JSON.stringify({
      login: 'admin@test.com',
      password: 'admin'
    }));
    
    if (loginResp.status !== 200) {
      console.error('❌ Ошибка авторизации:', loginResp.data);
      return;
    }
    
    const { token } = JSON.parse(loginResp.data);
    console.log('✅ Авторизация успешна');
    
    // Получение категорий
    const categoriesResp = await httpRequest({
      hostname: 'localhost',
      port: 8000,
      path: '/api/v1/service_categories',
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (categoriesResp.status !== 200) {
      console.error('❌ Ошибка получения категорий:', categoriesResp.data);
      return;
    }
    
    const categories = JSON.parse(categoriesResp.data);
    console.log(`✅ Найдено ${categories.length} категорий`);
    
    if (categories.length === 0) {
      console.log('❌ Нет категорий для тестирования');
      return;
    }
    
    const categoryId = categories[0].id;
    console.log(`Используем категорию: ${categoryId}`);
    
    // Получение услуг
    const servicesResp = await httpRequest({
      hostname: 'localhost',
      port: 8000,
      path: `/api/v1/service_categories/${categoryId}/services`,
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (servicesResp.status !== 200) {
      console.error('❌ Ошибка получения услуг:', servicesResp.data);
      return;
    }
    
    let services = JSON.parse(servicesResp.data);
    console.log(`✅ Найдено ${services.length} услуг`);
    
    // Создание тестовой услуги если нет услуг
    if (services.length === 0) {
      console.log('📝 Создание тестовой услуги...');
      
      const createResp = await httpRequest({
        hostname: 'localhost',
        port: 8000,
        path: `/api/v1/service_categories/${categoryId}/services`,
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }, JSON.stringify({
        name: 'Тестовая услуга для удаления',
        description: 'Будет удалена в ходе теста',
        default_duration: 30,
        is_active: true
      }));
      
      if (createResp.status !== 201) {
        console.error('❌ Ошибка создания услуги:', createResp.data);
        return;
      }
      
      const newService = JSON.parse(createResp.data);
      console.log(`✅ Создана услуга ID: ${newService.id}`);
      services = [newService];
    }
    
    // ТЕСТИРОВАНИЕ УДАЛЕНИЯ
    const serviceToDelete = services[0];
    console.log(`\n🗑️ ТЕСТИРОВАНИЕ УДАЛЕНИЯ услуги ID: ${serviceToDelete.id}`);
    console.log(`   Название: "${serviceToDelete.name}"`);
    
    const deleteUrl = `/api/v1/service_categories/${categoryId}/services/${serviceToDelete.id}`;
    console.log(`   DELETE URL: ${deleteUrl}`);
    
    const deleteResp = await httpRequest({
      hostname: 'localhost',
      port: 8000,
      path: deleteUrl,
      method: 'DELETE',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`\n📋 РЕЗУЛЬТАТ УДАЛЕНИЯ:`);
    console.log(`   Статус: ${deleteResp.status}`);
    console.log(`   Тело ответа: "${deleteResp.data}"`);
    console.log(`   Content-Type: ${deleteResp.headers['content-type'] || 'не указан'}`);
    
    // Анализ результата
    if (deleteResp.status === 204) {
      console.log('✅ УСПЕХ: Статус 204 (No Content) - стандартный ответ для успешного удаления');
    } else if (deleteResp.status === 200) {
      console.log('✅ УСПЕХ: Статус 200 (OK) - альтернативный успешный ответ');
    } else if (deleteResp.status === 422) {
      console.log('⚠️ ОГРАНИЧЕНИЕ: Услуга используется в бронированиях и не может быть удалена');
    } else {
      console.log(`❌ ПРОБЛЕМА: Неожиданный статус ${deleteResp.status}`);
    }
    
    // Проверка что услуга действительно удалена
    console.log('\n🔍 ПРОВЕРКА УДАЛЕНИЯ...');
    const checkResp = await httpRequest({
      hostname: 'localhost',
      port: 8000,
      path: `/api/v1/service_categories/${categoryId}/services`,
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (checkResp.status === 200) {
      const remainingServices = JSON.parse(checkResp.data);
      const stillExists = remainingServices.find(s => s.id === serviceToDelete.id);
      
      if (stillExists) {
        console.log('❌ ПРОБЛЕМА: Услуга все еще существует в списке');
      } else {
        console.log('✅ ПОДТВЕРЖДЕНО: Услуга успешно удалена из списка');
      }
      
      console.log(`   Услуг в категории сейчас: ${remainingServices.length}`);
    }
    
    console.log('\n🏁 Тест завершен.');
    
  } catch (error) {
    console.error('❌ Ошибка теста:', error.message);
  }
}

runTest();
