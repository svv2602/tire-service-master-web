// Скрипт для принудительного входа в систему
// Выполните этот код в консоли браузера на странице http://localhost:3008

console.log('🔧 Принудительный вход в систему с очисткой кэша...');

// Функция для полной очистки и входа
async function forceLoginAndClearCache() {
    try {
        // 1. Полная очистка localStorage
        console.log('🗑️ Очищаем localStorage...');
        localStorage.clear();
        
        // 2. Очистка sessionStorage
        console.log('🗑️ Очищаем sessionStorage...');
        sessionStorage.clear();
        
        // 3. Выполняем вход в систему
        console.log('🔑 Выполняем вход в систему...');
        const response = await fetch('http://localhost:8000/api/v1/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                auth: {
                    login: 'admin@test.com',
                    password: 'admin'
                }
            })
        });

        const data = await response.json();
        
        if (response.ok) {
            // 4. Сохраняем данные в localStorage с правильными ключами
            console.log('💾 Сохраняем данные аутентификации...');
            localStorage.setItem('tvoya_shina_token', data.auth_token);
            localStorage.setItem('tvoya_shina_user', JSON.stringify(data.user));
            
            console.log('✅ Вход выполнен успешно!');
            console.log('👤 Пользователь:', data.user.first_name, data.user.last_name);
            console.log('🔑 Токен сохранен:', data.auth_token.substring(0, 30) + '...');
            
            // 5. Проверяем, что данные сохранились
            const savedToken = localStorage.getItem('tvoya_shina_token');
            const savedUser = localStorage.getItem('tvoya_shina_user');
            
            console.log('📋 Проверка сохранения:');
            console.log('  - Токен сохранен:', !!savedToken);
            console.log('  - Пользователь сохранен:', !!savedUser);
            
            if (savedToken && savedUser) {
                console.log('🔄 Принудительно перезагружаем страницу...');
                // Принудительная перезагрузка с очисткой кэша
                window.location.reload(true);
            } else {
                console.error('❌ Данные не сохранились в localStorage');
            }
            
        } else {
            console.error('❌ Ошибка входа:', data);
        }
    } catch (error) {
        console.error('❌ Ошибка сети:', error);
    }
}

// Функция для проверки текущего состояния
function checkCurrentState() {
    const token = localStorage.getItem('tvoya_shina_token');
    const user = localStorage.getItem('tvoya_shina_user');
    
    console.log('📊 Текущее состояние:');
    console.log('  - Токен:', token ? token.substring(0, 30) + '...' : 'НЕТ');
    console.log('  - Пользователь:', user ? JSON.parse(user).first_name + ' ' + JSON.parse(user).last_name : 'НЕТ');
    console.log('  - Все ключи localStorage:', Object.keys(localStorage));
    
    return { hasToken: !!token, hasUser: !!user };
}

// Проверяем текущее состояние
const currentState = checkCurrentState();

if (currentState.hasToken && currentState.hasUser) {
    console.log('✅ Пользователь уже авторизован');
    console.log('🔄 Если проблема остается, перезагрузите страницу принудительно (Ctrl+F5)');
} else {
    console.log('❌ Пользователь не авторизован, выполняем принудительный вход...');
    forceLoginAndClearCache();
} 