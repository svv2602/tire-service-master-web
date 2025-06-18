// Тестовый скрипт для проверки аутентификации
console.log('=== Тест аутентификации ===');

// Проверяем localStorage
const token = localStorage.getItem('tvoya_shina_auth_token');
const user = localStorage.getItem('tvoya_shina_user');

console.log('Токен в localStorage:', token ? 'Есть' : 'Нет');
console.log('Пользователь в localStorage:', user ? 'Есть' : 'Нет');

if (user) {
  try {
    const parsedUser = JSON.parse(user);
    console.log('Данные пользователя:', parsedUser);
  } catch (e) {
    console.log('Ошибка парсинга пользователя:', e);
  }
}

// Проверяем Redux store
if (window.__REDUX_DEVTOOLS_EXTENSION__) {
  console.log('Redux DevTools доступны');
}

console.log('Текущий URL:', window.location.href);
console.log('=== Конец теста ==='); 