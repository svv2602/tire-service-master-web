// Тестовая утилита для проверки удаления услуги с использованием `fetch` API
// Запустите этот файл с помощью Node.js для отладки

// Получаем токен авторизации из локального хранилища браузера
// Для Node.js нужно передать токен явно
const AUTH_TOKEN = process.argv[2] || 'YOUR_AUTH_TOKEN_HERE';
const API_URL = 'http://localhost:8000/api/v1';

async function testServiceDeletion() {
  try {
    // 1. Проверим доступные категории услуг
    console.log('1. Получение категорий услуг...');
    const categoriesResponse = await fetch(`${API_URL}/service_categories`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Accept': 'application/json'
      }
    });
    
    if (!categoriesResponse.ok) {
      throw new Error(`Ошибка получения категорий: ${categoriesResponse.status}`);
    }
    
    const categories = await categoriesResponse.json();
    if (!categories.data || !categories.data.length) {
      throw new Error('Категории услуг не найдены');
    }
    
    console.log(`Найдено ${categories.data.length} категорий`);
    const category = categories.data[0];
    console.log(`Выбрана категория: ${category.name} (ID: ${category.id})`);
    
    // 2. Получим список услуг в категории
    console.log(`\n2. Получение услуг в категории ${category.id}...`);
    const servicesResponse = await fetch(`${API_URL}/service_categories/${category.id}/services`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Accept': 'application/json'
      }
    });
    
    if (!servicesResponse.ok) {
      throw new Error(`Ошибка получения услуг: ${servicesResponse.status}`);
    }
    
    const services = await servicesResponse.json();
    if (!services.data || !services.data.length) {
      console.log('В категории нет услуг. Создаем тестовую услугу...');
      
      // 3. Создаем тестовую услугу
      const newServiceResponse = await fetch(`${API_URL}/services`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AUTH_TOKEN}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          service: {
            name: `Test Service ${Date.now()}`,
            description: 'Тестовая услуга для проверки удаления',
            default_duration: 30,
            is_active: true,
            category_id: category.id
          }
        })
      });
      
      if (!newServiceResponse.ok) {
        throw new Error(`Ошибка создания услуги: ${newServiceResponse.status}`);
      }
      
      const newService = await newServiceResponse.json();
      console.log(`Создана тестовая услуга: ${newService.name} (ID: ${newService.id})`);
      
      // 4. Удаляем созданную услугу
      console.log(`\n3. Удаление услуги ${newService.id}...`);
      
      // Тестируем оба варианта URL
      console.log(`URL вариант 1: ${API_URL}/services/${newService.id}`);
      console.log(`URL вариант 2: ${API_URL}/service_categories/${category.id}/services/${newService.id}`);
      
      // Используем вариант с категорией (правильный URL)
      const deleteResponse = await fetch(`${API_URL}/service_categories/${category.id}/services/${newService.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${AUTH_TOKEN}`,
          'Accept': 'application/json'
        }
      });
      
      console.log(`Статус ответа: ${deleteResponse.status} ${deleteResponse.statusText}`);
      if (deleteResponse.ok) {
        console.log('✅ Услуга успешно удалена!');
      } else {
        const errorText = await deleteResponse.text();
        console.error('❌ Ошибка при удалении услуги:', errorText);
      }
      
    } else {
      console.log(`Найдено ${services.data.length} услуг в категории`);
      const service = services.data[0];
      console.log(`Выбрана услуга: ${service.name} (ID: ${service.id})`);
      
      // 3. Удаляем услугу
      console.log(`\n3. Удаление услуги ${service.id}...`);
      
      // Тестируем оба варианта URL
      console.log(`URL вариант 1: ${API_URL}/services/${service.id}`);
      console.log(`URL вариант 2: ${API_URL}/service_categories/${category.id}/services/${service.id}`);
      
      // Используем вариант с категорией (правильный URL)
      const deleteResponse = await fetch(`${API_URL}/service_categories/${category.id}/services/${service.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${AUTH_TOKEN}`,
          'Accept': 'application/json'
        }
      });
      
      console.log(`Статус ответа: ${deleteResponse.status} ${deleteResponse.statusText}`);
      if (deleteResponse.ok) {
        console.log('✅ Услуга успешно удалена!');
      } else {
        const errorText = await deleteResponse.text();
        console.error('❌ Ошибка при удалении услуги:', errorText);
      }
    }
    
  } catch (error) {
    console.error('Ошибка в процессе тестирования:', error);
  }
}

// Запускаем тест
testServiceDeletion();
