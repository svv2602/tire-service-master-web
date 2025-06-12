// Устанавливаем токен для тестирования
console.log('🔑 Устанавливаем токен для тестирования...');

const TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoyLCJyb2xlIjoiYWRtaW4iLCJleHAiOjE3NDk2NjQ3MzQsInRva2VuX3R5cGUiOiJhY2Nlc3MifQ.SRwkltPo-hx-Ugh1Rt9nIYfPudE5aqYQToiLuQ1NeOc';

const USER = {
    id: 2,
    email: 'admin@test.com',
    first_name: 'Admin',
    last_name: 'User',
    role: 'admin',
    is_active: true
};

// Сохраняем в localStorage
localStorage.setItem('tvoya_shina_token', TOKEN);
localStorage.setItem('tvoya_shina_user', JSON.stringify(USER));

console.log('✅ Токен установлен!');
console.log('Токен:', TOKEN.substring(0, 30) + '...');
console.log('Пользователь:', USER.email);

// Перезагружаем страницу для применения изменений
console.log('🔄 Перезагружаем страницу для применения токена...');
setTimeout(() => {
    window.location.reload();
}, 1000);
