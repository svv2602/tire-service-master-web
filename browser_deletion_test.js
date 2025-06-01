// Простая утилита для тестирования API удаления услуг с сохранением токена из localStorage
// Запустите в Dev Tools консоли браузера

(async () => {
  // 1. Получаем токен из localStorage
  const token = localStorage.getItem('tvoya_shina_token');
  if (!token) {
    console.error('Токен не найден в localStorage!');
    return;
  }
  console.log('Токен получен из localStorage');
  
  // 2. Получаем категории услуг
  console.log('Получаем категории услуг...');
  const categoriesResponse = await fetch('http://localhost:8000/api/v1/service_categories', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  });
  
  if (!categoriesResponse.ok) {
    console.error('Ошибка при получении категорий:', await categoriesResponse.text());
    return;
  }
  
  const categories = await categoriesResponse.json();
  console.log('Категории:', categories);
  
  if (!categories.data || categories.data.length === 0) {
    console.error('Категории не найдены!');
    return;
  }
  
  // Берем первую категорию
  const category = categories.data[0];
  console.log(`Используем категорию: ${category.name} (ID: ${category.id})`);
  
  // 3. Получаем услуги в этой категории
  console.log(`Получаем услуги для категории ${category.id}...`);
  const servicesResponse = await fetch(`http://localhost:8000/api/v1/service_categories/${category.id}/services`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  });
  
  if (!servicesResponse.ok) {
    console.error('Ошибка при получении услуг:', await servicesResponse.text());
    return;
  }
  
  const services = await servicesResponse.json();
  console.log('Услуги:', services);
  
  if (!services.data || services.data.length === 0) {
    console.log('Услуги не найдены, создаем тестовую...');
    
    // 4. Создаем тестовую услугу
    const newServiceData = {
      service: {
        name: `Тестовая услуга ${new Date().toISOString()}`,
        description: 'Тестовая услуга для проверки удаления',
        default_duration: 30,
        is_active: true,
        category_id: category.id
      }
    };
    
    const createResponse = await fetch('http://localhost:8000/api/v1/services', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(newServiceData)
    });
    
    if (!createResponse.ok) {
      console.error('Ошибка при создании услуги:', await createResponse.text());
      return;
    }
    
    const newService = await createResponse.json();
    console.log('Создана тестовая услуга:', newService);
    
    // 5. Удаляем созданную услугу
    console.log(`Удаляем услугу ${newService.id}...`);
    
    const deleteResponse = await fetch(`http://localhost:8000/api/v1/service_categories/${category.id}/services/${newService.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    
    console.log('Статус ответа:', deleteResponse.status, deleteResponse.statusText);
    if (deleteResponse.ok) {
      console.log('Услуга успешно удалена!');
    } else {
      console.error('Ошибка при удалении:', await deleteResponse.text());
    }
  } else {
    // 5. Удаляем первую услугу из списка
    const serviceToDelete = services.data[0];
    console.log(`Удаляем услугу "${serviceToDelete.name}" (ID: ${serviceToDelete.id})...`);
    
    const deleteResponse = await fetch(`http://localhost:8000/api/v1/service_categories/${category.id}/services/${serviceToDelete.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    
    console.log('Статус ответа:', deleteResponse.status, deleteResponse.statusText);
    if (deleteResponse.ok) {
      console.log('Услуга успешно удалена!');
    } else {
      console.error('Ошибка при удалении:', await deleteResponse.text());
    }
  }
})();
