#!/usr/bin/env node

const http = require('http');

const API_URL = 'http://localhost:8000/api/v1';

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
      console.error('Request error:', error);
      reject(error);
    });

    if (postData) {
      req.write(postData);
    }
    
    req.end();
  });
}

async function testServiceCreation() {
  console.log('🧪 Тестирование создания услуги с аутентификацией...\n');

  try {
    // 1. Авторизация
    console.log('1. Получение токена авторизации...');
    const loginOptions = {
      hostname: 'localhost',
      port: 8000,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    const loginData = JSON.stringify({
      auth: {
        login: 'test@test.com',
        password: 'password'
      }
    });

    const loginResponse = await makeRequest(loginOptions, loginData);
    console.log(`   Статус авторизации: ${loginResponse.statusCode}`);
    
    if (loginResponse.statusCode !== 200) {
      console.error('❌ Ошибка авторизации:', loginResponse.body);
      return;
    }

    const authData = JSON.parse(loginResponse.body);
    const token = authData.auth_token;
    console.log('   ✅ Токен получен');

    // 2. Получение категорий услуг
    console.log('\n2. Получение категорий услуг...');
    const categoriesOptions = {
      hostname: 'localhost',
      port: 8000,
      path: '/api/v1/service_categories',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    };

    const categoriesResponse = await makeRequest(categoriesOptions);
    console.log(`   Статус: ${categoriesResponse.statusCode}`);
    
    if (categoriesResponse.statusCode !== 200) {
      console.error('❌ Ошибка получения категорий:', categoriesResponse.body);
      return;
    }

    const categoriesData = JSON.parse(categoriesResponse.body);
    const categories = categoriesData.data || categoriesData;
    
    if (!categories || categories.length === 0) {
      console.error('❌ Категории не найдены');
      return;
    }

    const categoryId = categories[0].id;
    console.log(`   ✅ Найдено ${categories.length} категорий, используем категорию ID: ${categoryId}`);

    // 3. Создание услуги (вариант 1: через /services)
    console.log('\n3. Тестирование создания через /services...');
    const serviceData1 = {
      service: {
        name: `Тест услуга ${new Date().toISOString()}`,
        description: 'Создана через API тест',
        default_duration: 30,
        is_active: true,
        sort_order: 999,
        category_id: categoryId
      }
    };

    const createOptions1 = {
      hostname: 'localhost',
      port: 8000,
      path: '/api/v1/services',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    const createResponse1 = await makeRequest(createOptions1, JSON.stringify(serviceData1));
    console.log(`   Статус создания (через /services): ${createResponse1.statusCode}`);
    
    if (createResponse1.statusCode === 201 || createResponse1.statusCode === 200) {
      const service1 = JSON.parse(createResponse1.body);
      console.log(`   ✅ Услуга создана: "${service1.name}" (ID: ${service1.id})`);
    } else {
      console.log(`   ❌ Ошибка создания: ${createResponse1.body}`);
    }

    // 4. Создание услуги (вариант 2: через /service_categories/{id}/services)
    console.log('\n4. Тестирование создания через категорию...');
    const serviceData2 = {
      service: {
        name: `Тест услуга через категорию ${new Date().toISOString()}`,
        description: 'Создана через категорию API тест',
        default_duration: 45,
        is_active: true,
        sort_order: 998
      }
    };

    const createOptions2 = {
      hostname: 'localhost',
      port: 8000,
      path: `/api/v1/service_categories/${categoryId}/services`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    const createResponse2 = await makeRequest(createOptions2, JSON.stringify(serviceData2));
    console.log(`   Статус создания (через категорию): ${createResponse2.statusCode}`);
    
    if (createResponse2.statusCode === 201 || createResponse2.statusCode === 200) {
      const service2 = JSON.parse(createResponse2.body);
      console.log(`   ✅ Услуга создана: "${service2.name}" (ID: ${service2.id})`);
    } else {
      console.log(`   ❌ Ошибка создания: ${createResponse2.body}`);
    }

    // 5. Получение услуг по категории для проверки
    console.log('\n5. Проверка созданных услуг...');
    const servicesOptions = {
      hostname: 'localhost',
      port: 8000,
      path: `/api/v1/service_categories/${categoryId}/services`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    };

    const servicesResponse = await makeRequest(servicesOptions);
    console.log(`   Статус получения услуг: ${servicesResponse.statusCode}`);
    
    if (servicesResponse.statusCode === 200) {
      const servicesData = JSON.parse(servicesResponse.body);
      const services = servicesData.data || servicesData;
      console.log(`   ✅ Найдено ${services.length} услуг в категории`);
      
      // Показываем последние созданные услуги
      const recentServices = services.filter(s => s.name.includes('Тест услуга'));
      console.log(`   📋 Тестовых услуг: ${recentServices.length}`);
      recentServices.forEach((service, i) => {
        console.log(`      ${i + 1}. "${service.name}" (ID: ${service.id})`);
      });
    } else {
      console.log(`   ❌ Ошибка получения услуг: ${servicesResponse.body}`);
    }

    console.log('\n🎉 Тестирование завершено!');

  } catch (error) {
    console.error('❌ Ошибка при тестировании:', error.message);
  }
}

// Запускаем тест
testServiceCreation();
