// Скрипт для диагностики состояния Redux
// Выполните этот код в консоли браузера на странице http://localhost:3008

console.log('🔍 Диагностика состояния Redux...');

// Функция для получения состояния Redux из React DevTools
function getReduxState() {
    // Пытаемся получить состояние через window.__REDUX_DEVTOOLS_EXTENSION__
    if (window.__REDUX_DEVTOOLS_EXTENSION__) {
        console.log('✅ Redux DevTools найден');
    } else {
        console.log('❌ Redux DevTools не найден');
    }
    
    // Пытаемся получить состояние через store
    if (window.store) {
        return window.store.getState();
    }
    
    // Альтернативный способ через React DevTools
    const reactDevTools = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (reactDevTools && reactDevTools.renderers) {
        console.log('✅ React DevTools найден');
        // Пытаемся найти Redux store в React компонентах
        for (let id in reactDevTools.renderers) {
            const renderer = reactDevTools.renderers[id];
            if (renderer && renderer.findFiberByHostInstance) {
                console.log('🔍 Найден React renderer:', id);
            }
        }
    }
    
    return null;
}

// Функция для проверки localStorage
function checkLocalStorage() {
    const token = localStorage.getItem('tvoya_shina_token');
    const user = localStorage.getItem('tvoya_shina_user');
    
    console.log('📋 Состояние localStorage:');
    console.log('  - Токен:', token ? token.substring(0, 30) + '...' : 'НЕТ');
    console.log('  - Пользователь:', user ? JSON.parse(user).first_name + ' ' + JSON.parse(user).last_name : 'НЕТ');
    console.log('  - Все ключи:', Object.keys(localStorage).filter(key => key.includes('tvoya_shina')));
    
    return { token, user };
}

// Функция для проверки состояния через DOM
function checkDOMState() {
    const loadingElements = document.querySelectorAll('div');
    const loadingTexts = [];
    
    loadingElements.forEach(el => {
        if (el.textContent && (
            el.textContent.includes('Проверка аутентификации') ||
            el.textContent.includes('Инициализация приложения') ||
            el.textContent.includes('Загрузка')
        )) {
            loadingTexts.push({
                text: el.textContent.trim(),
                element: el
            });
        }
    });
    
    console.log('🎯 Найденные элементы загрузки:', loadingTexts);
    return loadingTexts;
}

// Функция для проверки сетевых запросов
function checkNetworkRequests() {
    console.log('🌐 Проверка последних сетевых запросов...');
    
    // Проверяем, есть ли активные запросы
    if (window.performance && window.performance.getEntriesByType) {
        const networkEntries = window.performance.getEntriesByType('navigation');
        console.log('📊 Навигационные запросы:', networkEntries);
        
        const resourceEntries = window.performance.getEntriesByType('resource')
            .filter(entry => entry.name.includes('localhost:8000'))
            .slice(-5); // Последние 5 запросов к API
        
        console.log('🔗 Последние API запросы:', resourceEntries);
    }
}

// Основная функция диагностики
function runDiagnosis() {
    console.log('🚀 Запуск полной диагностики...');
    
    // 1. Проверяем localStorage
    const storageState = checkLocalStorage();
    
    // 2. Проверяем Redux состояние
    const reduxState = getReduxState();
    if (reduxState) {
        console.log('🏪 Redux состояние:', reduxState);
        if (reduxState.auth) {
            console.log('🔐 Auth состояние:', reduxState.auth);
        }
    } else {
        console.log('❌ Не удалось получить Redux состояние');
    }
    
    // 3. Проверяем DOM
    const domState = checkDOMState();
    
    // 4. Проверяем сетевые запросы
    checkNetworkRequests();
    
    // 5. Выводим рекомендации
    console.log('💡 Рекомендации:');
    
    if (storageState.token && !storageState.user) {
        console.log('⚠️ Есть токен, но нет данных пользователя - возможна проблема с инициализацией');
    } else if (!storageState.token && !storageState.user) {
        console.log('ℹ️ Нет данных аутентификации - пользователь должен войти в систему');
    } else if (storageState.token && storageState.user) {
        console.log('✅ Данные аутентификации есть - проверьте Redux состояние');
    }
    
    if (domState.length > 0) {
        console.log('🔄 Обнаружены элементы загрузки - возможно, приложение застряло в состоянии инициализации');
    }
    
    return {
        localStorage: storageState,
        redux: reduxState,
        dom: domState,
        timestamp: new Date().toISOString()
    };
}

// Запускаем диагностику
const diagnosis = runDiagnosis();

// Экспортируем функции для повторного использования
window.debugRedux = {
    runDiagnosis,
    checkLocalStorage,
    getReduxState,
    checkDOMState,
    checkNetworkRequests
};

console.log('🎯 Диагностика завершена. Используйте window.debugRedux для повторного запуска функций.'); 