console.log('=== ДИАГНОСТИКА КЛЮЧЕЙ ТОКЕНОВ ===');

// Найти все возможные ключи токенов в системе
const possibleTokenKeys = [
  'tvoya_shina_token',
  'tvoya_shina_auth_token',
  'tvoya_shina_access_token',
  'auth_token',
  'access_token', 
  'token',
  'bearer_token'
];

console.log('\n📋 Проверка всех возможных ключей токенов:');
possibleTokenKeys.forEach(key => {
  const value = localStorage.getItem(key);
  console.log(`  ${key}: ${value ? 'ЕСТЬ (' + value.substring(0, 30) + '...)' : 'НЕТ'}`);
});

// Получить новый токен
console.log('\n🔑 Получаем новый токен...');
fetch('http://localhost:8000/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@test.com',
    password: 'admin123'
  })
})
.then(response => response.json())
.then(data => {
  if (data.tokens?.access) {
    const token = data.tokens.access;
    console.log('\n✅ Новый токен получен:', token.substring(0, 30) + '...');
    
    // Устанавливаем токен во ВСЕ возможные ключи
    console.log('\n💾 Устанавливаем токен во все ключи:');
    possibleTokenKeys.forEach(key => {
      localStorage.setItem(key, token);
      console.log(`  ✓ ${key}: установлен`);
    });
    
    // Сохраняем пользователя
    localStorage.setItem('tvoya_shina_user', JSON.stringify(data.user));
    console.log('  ✓ tvoya_shina_user: установлен');
    
    console.log('\n🎯 Теперь проверим, какой ключ использует фронтенд...');
    console.log('Обновите страницу админ-интерфейса и проверьте Network tab в DevTools');
    
  } else {
    console.error('❌ Ошибка получения токена:', data);
  }
})
.catch(error => {
  console.error('❌ Ошибка сети:', error);
});
