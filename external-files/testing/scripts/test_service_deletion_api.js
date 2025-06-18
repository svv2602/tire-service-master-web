const http = require('http');

// Функция для выполнения HTTP запросов
function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (postData) {
      req.write(postData);
    }
    
    req.end();
  });
}

async function testServiceDeletion() {
  console.log('🔧 Тестирование удаления услуг через API...\n');

  try {
    // 1. Получаем токен авторизации
    console.log('1. Авторизация...');
    const loginOptions = {
      hostname: 'localhost',
      port: 8000,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const loginData = JSON.stringify({
      login: 'admin@test.com',
      password: 'admin'
    });

    const loginResponse = await makeRequest(loginOptions, loginData);
    console.log(`Статус авторизации: ${loginResponse.statusCode}`);
    
    if (loginResponse.statusCode !== 200) {
      console.error('❌ Ошибка авторизации:', loginResponse.body);
      return;
    }

    const authData = JSON.parse(loginResponse.body);
    const token = authData.token;
    console.log('✅ Авторизация успешна');

    // 2. Получаем список категорий услуг
    console.log('\n2. Получение категорий услуг...');
    const categoriesOptions = {
      hostname: 'localhost',
      port: 8000,
      path: '/api/v1/service_categories',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    const categoriesResponse = await makeRequest(categoriesOptions);
    console.log(`Статус получения категорий: ${categoriesResponse.statusCode}`);
    
    if (categoriesResponse.statusCode !== 200) {
      console.error('❌ Ошибка получения категорий:', categoriesResponse.body);
      return;
    }

    const categories = JSON.parse(categoriesResponse.body);
    console.log(`✅ Найдено ${categories.length} категорий`);

    if (categories.length === 0) {
      console.log('❌ Нет категорий для тестирования');
      return;
    }

    const categoryId = categories[0].id;
    console.log(`Используем категорию ID: ${categoryId}`);

    // 3. Получаем услуги в первой категории
    console.log('\n3. Получение услуг в категории...');
    const servicesOptions = {
      hostname: 'localhost',
      port: 8000,
      path: `/api/v1/service_categories/${categoryId}/services`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    const servicesResponse = await makeRequest(servicesOptions);
    console.log(`Статус получения услуг: ${servicesResponse.statusCode}`);
    
    if (servicesResponse.statusCode !== 200) {
      console.error('❌ Ошибка получения услуг:', servicesResponse.body);
      return;
    }

    const services = JSON.parse(servicesResponse.body);
    console.log(`✅ Найдено ${services.length} услуг в категории`);

    if (services.length === 0) {
      console.log('📝 Создаем тестовую услугу для удаления...');
      
      // Создаем тестовую услугу
      const createServiceOptions = {
        hostname: 'localhost',
        port: 8000,
        path: `/api/v1/service_categories/${categoryId}/services`,
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      const serviceData = JSON.stringify({
        name: 'Тестовая услуга для удаления',
        description: 'Эта услуга будет удалена в рамках теста',
        default_duration: 30,
        is_active: true
      });

      const createResponse = await makeRequest(createServiceOptions, serviceData);
      console.log(`Статус создания услуги: ${createResponse.statusCode}`);
      
      if (createResponse.statusCode !== 201) {
        console.error('❌ Ошибка создания тестовой услуги:', createResponse.body);
        return;
      }

      const newService = JSON.parse(createResponse.body);
      console.log(`✅ Создана тестовая услуга ID: ${newService.id}`);

      // Обновляем список услуг
      const updatedServicesResponse = await makeRequest(servicesOptions);
      const updatedServices = JSON.parse(updatedServicesResponse.body);
      services.push(...updatedServices.filter(s => s.id === newService.id));
    }

    // 4. Тестируем удаление первой услуги
    const serviceToDelete = services[0];
    console.log(`\n4. Удаление услуги ID: ${serviceToDelete.id} ("${serviceToDelete.name}")...`);
    
    const deleteOptions = {
      hostname: 'localhost',
      port: 8000,
      path: `/api/v1/service_categories/${categoryId}/services/${serviceToDelete.id}`,
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    console.log(`DELETE URL: ${deleteOptions.path}`);
    
    const deleteResponse = await makeRequest(deleteOptions);
    console.log(`Статус удаления: ${deleteResponse.statusCode}`);
    console.log(`Тело ответа: "${deleteResponse.body}"`);
    console.log(`Заголовки ответа:`, deleteResponse.headers);

    if (deleteResponse.statusCode === 204) {
      console.log('✅ Услуга успешно удалена (статус 204 No Content)');
    } else if (deleteResponse.statusCode === 200) {
      console.log('✅ Услуга успешно удалена (статус 200 OK)');
    } else if (deleteResponse.statusCode === 422) {
      console.log('⚠️ Услуга не может быть удалена (используется в бронированиях)');
      console.log('Ответ API:', deleteResponse.body);
    } else {
      console.log(`❌ Неожиданный статус удаления: ${deleteResponse.statusCode}`);
      console.log('Ответ API:', deleteResponse.body);
    }

    // 5. Проверяем, что услуга действительно удалена
    console.log('\n5. Проверка удаления...');
    const checkResponse = await makeRequest(servicesOptions);
    
    if (checkResponse.statusCode === 200) {
      const remainingServices = JSON.parse(checkResponse.body);
      const deletedService = remainingServices.find(s => s.id === serviceToDelete.id);
      
      if (deletedService) {
        console.log('❌ Услуга НЕ удалена - все еще присутствует в списке');
      } else {
        console.log('✅ Услуга успешно удалена - отсутствует в списке');
      }
      
      console.log(`Услуг в категории после удаления: ${remainingServices.length}`);
    }

  } catch (error) {
    console.error('❌ Ошибка при тестировании:', error.message);
  }
}

// Запускаем тест
testServiceDeletion();
