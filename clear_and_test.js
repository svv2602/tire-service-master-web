// Скрипт для очистки localStorage и тестирования исправлений
// Выполните этот код в консоли браузера на странице http://localhost:3008

console.log('🧹 Очистка localStorage и тестирование исправлений...');

// Функция для полной очистки
function clearAll() {
    console.log('🗑️ Очищаем все данные...');
    localStorage.clear();
    sessionStorage.clear();
    
    console.log('✅ Данные очищены');
    console.log('📋 Оставшиеся ключи localStorage:', Object.keys(localStorage));
}

// Функция для проверки состояния после очистки
function checkStateAfterClear() {
    const token = localStorage.getItem('tvoya_shina_token');
    const user = localStorage.getItem('tvoya_shina_user');
    
    console.log('📊 Состояние после очистки:');
    console.log('  - Токен:', token || 'НЕТ');
    console.log('  - Пользователь:', user || 'НЕТ');
    console.log('  - URL:', window.location.href);
    
    if (!token && !user) {
        console.log('✅ Очистка прошла успешно');
        console.log('🔄 Перезагружаем страницу для проверки перенаправления на /login...');
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    } else {
        console.log('❌ Данные не были полностью очищены');
    }
}

// Функция для тестирования входа после исправлений
async function testLoginAfterFix() {
    console.log('🔑 Тестируем вход после исправлений...');
    
    try {
        const response = await fetch('http://localhost:8000/api/v1/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                auth: {
                    email: 'admin@test.com',
                    password: 'admin'
                }
            })
        });

        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ Вход выполнен успешно!');
            
            // Сохраняем данные
            localStorage.setItem('tvoya_shina_token', data.auth_token);
            localStorage.setItem('tvoya_shina_user', JSON.stringify(data.user));
            
            console.log('💾 Данные сохранены в localStorage');
            console.log('👤 Пользователь:', data.user.first_name, data.user.last_name);
            
            // Проверяем, что приложение корректно обработает эти данные
            console.log('🔄 Перезагружаем страницу для проверки инициализации...');
            setTimeout(() => {
                window.location.reload();
            }, 1000);
            
        } else {
            console.error('❌ Ошибка входа:', data);
        }
    } catch (error) {
        console.error('❌ Ошибка сети:', error);
    }
}

// Функция для проверки текущего состояния приложения
function checkAppState() {
    console.log('🔍 Проверка текущего состояния приложения...');
    
    // Проверяем localStorage
    const token = localStorage.getItem('tvoya_shina_token');
    const user = localStorage.getItem('tvoya_shina_user');
    
    console.log('📋 localStorage:');
    console.log('  - Токен:', token ? token.substring(0, 30) + '...' : 'НЕТ');
    console.log('  - Пользователь:', user ? JSON.parse(user).first_name + ' ' + JSON.parse(user).last_name : 'НЕТ');
    
    // Проверяем DOM
    const loadingElements = document.querySelectorAll('div');
    const loadingTexts = [];
    
    loadingElements.forEach(el => {
        if (el.textContent && (
            el.textContent.includes('Проверка аутентификации') ||
            el.textContent.includes('Инициализация приложения') ||
            el.textContent.includes('Инициализация...')
        )) {
            loadingTexts.push(el.textContent.trim());
        }
    });
    
    console.log('🎯 Элементы загрузки:', loadingTexts);
    
    // Проверяем URL
    console.log('🌐 Текущий URL:', window.location.href);
    
    // Рекомендации
    if (!token && !user && window.location.pathname !== '/login') {
        console.log('⚠️ Нет данных аутентификации, но не на странице входа');
        console.log('💡 Ожидается перенаправление на /login');
    } else if (token && user && loadingTexts.length > 0) {
        console.log('⚠️ Есть данные аутентификации, но показывается загрузка');
        console.log('💡 Возможно, проблема с инициализацией');
    } else if (token && user && window.location.pathname === '/login') {
        console.log('⚠️ Есть данные аутентификации, но на странице входа');
        console.log('💡 Ожидается перенаправление на /dashboard');
    } else if (token && user && loadingTexts.length === 0) {
        console.log('✅ Состояние выглядит корректно');
    }
}

// Основное меню
console.log('📋 Доступные команды:');
console.log('  clearAll() - очистить все данные');
console.log('  checkStateAfterClear() - проверить состояние после очистки');
console.log('  testLoginAfterFix() - протестировать вход');
console.log('  checkAppState() - проверить текущее состояние');

// Экспортируем функции
window.testFix = {
    clearAll,
    checkStateAfterClear,
    testLoginAfterFix,
    checkAppState
};

// Автоматически проверяем текущее состояние
checkAppState(); 