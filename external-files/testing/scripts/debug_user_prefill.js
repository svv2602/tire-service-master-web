// Скрипт для диагностики предзаполнения данных пользователя
// Запустите этот скрипт в консоли браузера на странице бронирования

console.log('🔍 Диагностика предзаполнения данных пользователя');

// 1. Проверяем Redux store
function checkReduxStore() {
    console.log('\n📦 Проверка Redux Store:');
    try {
        const store = window.__REDUX_DEVTOOLS_EXTENSION__ ? window.store : null;
        if (store) {
            const state = store.getState();
            console.log('- Redux state:', state);
            console.log('- Auth state:', state.auth);
            console.log('- User from Redux:', state.auth?.user);
            console.log('- isAuthenticated:', state.auth?.isAuthenticated);
            console.log('- accessToken:', state.auth?.accessToken ? 'присутствует' : 'отсутствует');
        } else {
            console.log('- Redux store недоступен');
        }
    } catch (error) {
        console.error('- Ошибка при проверке Redux:', error);
    }
}

// 2. Проверяем localStorage
function checkLocalStorage() {
    console.log('\n💾 Проверка localStorage:');
    try {
        const authToken = localStorage.getItem('authToken');
        const user = localStorage.getItem('user');
        console.log('- authToken:', authToken ? 'присутствует' : 'отсутствует');
        console.log('- user data:', user ? JSON.parse(user) : 'отсутствует');
        
        // Проверяем все ключи связанные с авторизацией
        const authKeys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.includes('auth') || key.includes('user') || key.includes('token'))) {
                authKeys.push(key);
            }
        }
        console.log('- Ключи авторизации:', authKeys);
    } catch (error) {
        console.error('- Ошибка при проверке localStorage:', error);
    }
}

// 3. Проверяем cookies
function checkCookies() {
    console.log('\n🍪 Проверка cookies:');
    try {
        const cookies = document.cookie.split(';').map(c => c.trim());
        const authCookies = cookies.filter(c => 
            c.includes('access_token') || 
            c.includes('refresh_token') || 
            c.includes('auth') ||
            c.includes('session')
        );
        console.log('- Все cookies:', cookies);
        console.log('- Auth cookies:', authCookies);
    } catch (error) {
        console.error('- Ошибка при проверке cookies:', error);
    }
}

// 4. Тестируем API /auth/me
async function testCurrentUserAPI() {
    console.log('\n🌐 Тестирование API /auth/me:');
    try {
        const response = await fetch('http://localhost:8000/api/v1/auth/me', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('- Статус ответа:', response.status);
        console.log('- Headers:', Object.fromEntries(response.headers.entries()));
        
        if (response.ok) {
            const userData = await response.json();
            console.log('- Данные пользователя:', userData);
            
            // Проверяем необходимые поля
            const requiredFields = ['first_name', 'last_name', 'email', 'phone'];
            const missingFields = requiredFields.filter(field => !userData[field]);
            if (missingFields.length > 0) {
                console.warn('- Отсутствующие поля:', missingFields);
            } else {
                console.log('✅ Все необходимые поля присутствуют');
            }
        } else {
            const errorText = await response.text();
            console.error('- Ошибка API:', errorText);
        }
    } catch (error) {
        console.error('- Ошибка запроса:', error);
    }
}

// 5. Проверяем React компоненты
function checkReactComponents() {
    console.log('\n⚛️ Проверка React компонентов:');
    try {
        // Ищем элементы формы
        const firstNameInput = document.querySelector('input[placeholder*="Иван"], input[label*="Имя"]');
        const lastNameInput = document.querySelector('input[placeholder*="Иванов"], input[label*="Фамилия"]');
        const phoneInput = document.querySelector('input[placeholder*="380"], input[type="tel"]');
        const emailInput = document.querySelector('input[type="email"]');
        
        console.log('- Поле имени найдено:', !!firstNameInput);
        console.log('- Поле фамилии найдено:', !!lastNameInput);
        console.log('- Поле телефона найдено:', !!phoneInput);
        console.log('- Поле email найдено:', !!emailInput);
        
        if (firstNameInput) {
            console.log('- Значение имени:', firstNameInput.value);
        }
        if (lastNameInput) {
            console.log('- Значение фамилии:', lastNameInput.value);
        }
        if (phoneInput) {
            console.log('- Значение телефона:', phoneInput.value);
        }
        if (emailInput) {
            console.log('- Значение email:', emailInput.value);
        }
        
        // Проверяем наличие React Fiber
        const reactFiber = firstNameInput?._reactInternalFiber || firstNameInput?.__reactInternalInstance;
        console.log('- React Fiber найден:', !!reactFiber);
        
    } catch (error) {
        console.error('- Ошибка при проверке компонентов:', error);
    }
}

// 6. Проверяем консоль на предмет логов предзаполнения
function checkConsoleLogs() {
    console.log('\n📝 Инструкции по проверке логов:');
    console.log('1. Откройте вкладку Console в DevTools');
    console.log('2. Очистите консоль (Ctrl+L)');
    console.log('3. Обновите страницу (F5)');
    console.log('4. Перейдите к шагу "Контактная информация"');
    console.log('5. Ищите логи, начинающиеся с "🔍 Проверка данных пользователя"');
    console.log('6. Если логов нет, значит useEffect не срабатывает');
}

// Запуск всех проверок
async function runFullDiagnostic() {
    console.log('🚀 Запуск полной диагностики...\n');
    
    checkReduxStore();
    checkLocalStorage();
    checkCookies();
    await testCurrentUserAPI();
    checkReactComponents();
    checkConsoleLogs();
    
    console.log('\n✅ Диагностика завершена');
    console.log('📋 Если проблема не найдена, проверьте:');
    console.log('1. Авторизованы ли вы в системе');
    console.log('2. Работает ли API сервер на порту 8000');
    console.log('3. Нет ли ошибок в консоли при загрузке страницы');
    console.log('4. Срабатывает ли useEffect в компоненте');
}

// Экспортируем функции в глобальную область
window.debugUserPrefill = {
    runFullDiagnostic,
    checkReduxStore,
    checkLocalStorage,
    checkCookies,
    testCurrentUserAPI,
    checkReactComponents,
    checkConsoleLogs
};

console.log('\n🎯 Функции диагностики добавлены в window.debugUserPrefill');
console.log('Запустите: window.debugUserPrefill.runFullDiagnostic()');

// Автоматический запуск
runFullDiagnostic(); 