// Этот файл тестирует полный процесс вызова API для удаления услуги
// и может помочь выявить проблемы с URL и параметрами

const fetch = require('node-fetch');

// Настройки API
const API_URL = 'http://localhost:8000/api/v1';
const AUTH_TOKEN = localStorage.getItem('tvoya_shina_token') || 'ваш_токен';

async function testServiceDeletion() {
  try {
    console.log('🔍 Тестирование процесса удаления услуги');
    
    // 1. Получаем список категорий услуг
    console.log('\n1. Получение списка категорий услуг...');
    const categoriesResponse = await fetch(`${API_URL}/service_categories`, {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Accept': 'application/json'
      }
    });
    
    if (!categoriesResponse.ok) {
      throw new Error(`Ошибка при получении категорий: ${categoriesResponse.status} ${categoriesResponse.statusText}`);
    }
    
    const categories = await categoriesResponse.json();
    if (!categories.data || categories.data.length === 0) {
      throw new Error('Категории услуг не найдены');
    }
    
    const category = categories.data[0];
    const categoryId = category.id;
    console.log(`   ✅ Получена категория: "${category.name}" (ID: ${categoryId})`);
    
    // 2. Получаем услуги категории
    console.log(`\n2. Получение услуг для категории ID: ${categoryId}...`);
    const servicesResponse = await fetch(`${API_URL}/service_categories/${categoryId}/services`, {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Accept': 'application/json'
      }
    });
    
    if (!servicesResponse.ok) {
      throw new Error(`Ошибка при получении услуг: ${servicesResponse.status} ${servicesResponse.statusText}`);
    }
    
    const servicesData = await servicesResponse.json();
    if (!servicesData.data || servicesData.data.length === 0) {
      throw new Error('Услуги не найдены в данной категории');
    }
    
    const services = servicesData.data;
    console.log(`   ✅ Получены услуги (${services.length})`);
    services.forEach((service, index) => {
      console.log(`      ${index + 1}. "${service.name}" (ID: ${service.id})`);
    });
    
    // 3. Создаем тестовую услугу для удаления
    console.log('\n3. Создание тестовой услуги для удаления...');
    const newServiceData = {
      service: {
        name: `Test Delete Service ${new Date().toISOString()}`,
        description: 'Тестовая услуга для проверки удаления',
        default_duration: 30,
        is_active: true,
        category_id: categoryId
      }
    };
    
    const createResponse = await fetch(`${API_URL}/services`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(newServiceData)
    });
    
    if (!createResponse.ok) {
      throw new Error(`Ошибка при создании тестовой услуги: ${createResponse.status} ${createResponse.statusText}`);
    }
    
    const newService = await createResponse.json();
    console.log(`   ✅ Создана тестовая услуга: "${newService.name}" (ID: ${newService.id})`);
    
    // 4. Удаляем созданную услугу
    const serviceIdToDelete = newService.id;
    console.log(`\n4. Удаление услуги ID: ${serviceIdToDelete}...`);
    
    // Правильный формат URL для удаления услуги
    const deleteUrl = `${API_URL}/service_categories/${categoryId}/services/${serviceIdToDelete}`;
    console.log(`   🔗 URL запроса: ${deleteUrl}`);
    
    const deleteResponse = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    if (!deleteResponse.ok) {
      const errorText = await deleteResponse.text();
      throw new Error(`Ошибка при удалении услуги: ${deleteResponse.status} ${deleteResponse.statusText}\n${errorText}`);
    }
    
    console.log(`   ✅ Услуга успешно удалена!`);
    
    // 5. Проверяем, действительно ли услуга удалена
    console.log('\n5. Проверка успешности удаления...');
    const verifyResponse = await fetch(`${API_URL}/service_categories/${categoryId}/services`, {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Accept': 'application/json'
      }
    });
    
    if (!verifyResponse.ok) {
      throw new Error(`Ошибка при проверке удаления: ${verifyResponse.status} ${verifyResponse.statusText}`);
    }
    
    const verifyData = await verifyResponse.json();
    const remainingServices = verifyData.data;
    const deletedService = remainingServices.find(s => s.id === serviceIdToDelete);
    
    if (deletedService) {
      throw new Error(`❌ Услуга с ID ${serviceIdToDelete} все еще существует!`);
    } else {
      console.log(`   ✅ Подтверждено: услуга с ID ${serviceIdToDelete} успешно удалена`);
    }
    
    console.log('\n🎉 Тест успешно завершен! Удаление услуг работает корректно.');
    
  } catch (error) {
    console.error(`\n❌ Ошибка в процессе тестирования:`, error);
  }
}

// Запуск тестирования
testServiceDeletion();
