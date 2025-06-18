// Скрипт для отладки состояния аутентификации
console.log('=== ОТЛАДКА СОСТОЯНИЯ АУТЕНТИФИКАЦИИ ===');

// Проверяем localStorage
const token = localStorage.getItem('tvoya_shina_auth_token');
const user = localStorage.getItem('tvoya_shina_user');

console.log('Токен в localStorage:', token ? 'ЕСТЬ' : 'НЕТ');
console.log('Пользователь в localStorage:', user ? 'ЕСТЬ' : 'НЕТ');

if (token) {
  console.log('Токен (первые 50 символов):', token.substring(0, 50) + '...');
}

if (user) {
  try {
    const userData = JSON.parse(user);
    console.log('Данные пользователя:', {
      id: userData.id,
      email: userData.email,
      role: userData.role
    });
  } catch (e) {
    console.log('Ошибка парсинга данных пользователя:', e);
  }
}

// Проверяем Redux store (если доступен)
if (window.__REDUX_DEVTOOLS_EXTENSION__) {
  console.log('Redux DevTools доступен');
}

// Тестируем API запрос с токеном
if (token) {
  fetch('http://localhost:8000/api/v1/clients?page=1&per_page=5', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    console.log('Статус ответа API:', response.status);
    if (response.status === 401) {
      console.log('ОШИБКА: Токен недействителен или истек');
    } else if (response.status === 200) {
      console.log('УСПЕХ: API отвечает корректно');
      return response.json();
    } else {
      console.log('Неожиданный статус:', response.status);
    }
  })
  .then(data => {
    if (data) {
      console.log('Данные от API:', data);
    }
  })
  .catch(error => {
    console.log('Ошибка запроса к API:', error);
  });
} else {
  console.log('Токен отсутствует - невозможно протестировать API');
}

console.log('=== КОНЕЦ ОТЛАДКИ ==='); 