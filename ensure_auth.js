// Скрипт для проверки и установки токена авторизации
// Запускается в консоли браузера на любой странице приложения

console.log('=== ПРОВЕРКА АВТОРИЗАЦИИ ===');

// Проверяем текущий токен
let token = localStorage.getItem('tvoya_shina_token') || 
           localStorage.getItem('tvoya_shina_auth_token') || 
           localStorage.getItem('token') || 
           localStorage.getItem('auth_token');

console.log('Текущий токен:', token ? 'найден' : 'отсутствует');

if (!token) {
    console.log('Выполняем авторизацию...');
    
    // Авторизуемся
    fetch('http://localhost:8000/api/v1/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            auth: {
                login: 'admin@test.com',
                password: 'admin123'
            }
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.tokens && data.tokens.access) {
            const newToken = data.tokens.access;
            localStorage.setItem('tvoya_shina_token', newToken);
            console.log('✅ Авторизация успешна, токен сохранен');
            console.log('🔄 Обновите страницу для применения изменений');
        } else {
            console.error('❌ Ошибка: токен не получен', data);
        }
    })
    .catch(error => {
        console.error('❌ Ошибка авторизации:', error);
    });
} else {
    console.log('✅ Пользователь уже авторизован');
}
