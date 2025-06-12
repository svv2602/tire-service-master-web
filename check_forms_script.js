/**
 * Автоматизированный скрипт для проверки всех форм на наличие ошибок
 * 
 * Проверяет:
 * 1. Ошибки 401 Unauthorized (истекшие токены)
 * 2. Ошибки 400 Bad Request (проблемы с FormData)
 * 3. Undefined значения в URL
 * 4. Проблемы авторизации
 */

// Список всех форм для проверки (обновлен на основе анализа кода)
const FORMS_TO_CHECK = [
    // Партнеры (JSON)
    { name: 'Создание партнера', url: '/partners/new', hasFormData: false, api: '/partners' },
    { name: 'Редактирование партнера', url: '/partners/1/edit', hasFormData: false, api: '/partners/1' },
    
    // Сервисные точки (FormData - есть загрузка фотографий)
    { name: 'Создание сервисной точки', url: '/partners/1/service-points/new', hasFormData: true, api: '/partners/1/service_points' },
    { name: 'Редактирование сервисной точки', url: '/partners/1/service-points/1/edit', hasFormData: true, api: '/partners/1/service_points/1' },
    
    // Пользователи (JSON)
    { name: 'Создание пользователя', url: '/users/new', hasFormData: false, api: '/users' },
    { name: 'Редактирование пользователя', url: '/users/1/edit', hasFormData: false, api: '/users/1' },
    
    // Услуги (JSON)
    { name: 'Создание категории услуг', url: '/services/new', hasFormData: false, api: '/service_categories' },
    { name: 'Редактирование категории услуг', url: '/services/1/edit', hasFormData: false, api: '/service_categories/1' },
    
    // Регионы (JSON)
    { name: 'Создание региона', url: '/regions/new', hasFormData: false, api: '/regions' },
    { name: 'Редактирование региона', url: '/regions/1/edit', hasFormData: false, api: '/regions/1' },
    
    // Города (JSON)
    { name: 'Создание города', url: '/cities/new', hasFormData: false, api: '/cities' },
    { name: 'Редактирование города', url: '/cities/1/edit', hasFormData: false, api: '/cities/1' },
    
    // Клиенты (JSON)
    { name: 'Создание клиента', url: '/clients/new', hasFormData: false, api: '/clients' },
    { name: 'Редактирование клиента', url: '/clients/1/edit', hasFormData: false, api: '/clients/1' },
    
    // Автомобили клиентов (JSON)
    { name: 'Добавление автомобиля', url: '/clients/1/cars/new', hasFormData: false, api: '/clients/1/cars' },
    { name: 'Редактирование автомобиля', url: '/clients/1/cars/1/edit', hasFormData: false, api: '/clients/1/cars/1' },
    
    // Бронирования (JSON)
    { name: 'Создание бронирования', url: '/bookings/new', hasFormData: false, api: '/bookings' },
    { name: 'Редактирование бронирования', url: '/bookings/1/edit', hasFormData: false, api: '/bookings/1' },
    
    // Отзывы (JSON)
    { name: 'Создание отзыва', url: '/reviews/new', hasFormData: false, api: '/reviews' },
    { name: 'Ответ на отзыв', url: '/reviews/1/reply', hasFormData: false, api: '/reviews/1/reply' },
    
    // Статьи (FormData - есть загрузка изображений)
    { name: 'Создание статьи', url: '/articles/new', hasFormData: true, api: '/articles' },
    { name: 'Редактирование статьи', url: '/articles/1/edit', hasFormData: true, api: '/articles/1' },
    
    // Контент страниц (возможно FormData)
    { name: 'Редактирование контента', url: '/page-content/1/edit', hasFormData: true, api: '/page_contents/1' },
    
    // Марки автомобилей (FormData - есть загрузка логотипов)
    { name: 'Создание марки авто', url: '/car-brands/new', hasFormData: true, api: '/car_brands' },
    { name: 'Редактирование марки авто', url: '/car-brands/1/edit', hasFormData: true, api: '/car_brands/1' },
];

// Функция для проверки состояния авторизации
function checkAuthStatus() {
    console.log('🔐 === ПРОВЕРКА АВТОРИЗАЦИИ ===');
    
    const token = localStorage.getItem('tvoya_shina_token');
    const user = localStorage.getItem('tvoya_shina_user');
    const refreshToken = localStorage.getItem('tvoya_shina_refresh_token');
    
    console.log('Токен есть:', !!token);
    console.log('Пользователь есть:', !!user);
    console.log('Refresh токен есть:', !!refreshToken);
    
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            console.log('Роль пользователя:', payload.role);
            console.log('ID пользователя:', payload.user_id);
            console.log('Токен истекает:', new Date(payload.exp * 1000));
            console.log('Токен истек:', Date.now() > payload.exp * 1000);
            
            if (Date.now() > payload.exp * 1000) {
                console.log('⚠️ ТОКЕН ИСТЕК! Требуется обновление.');
                return false;
            }
            return true;
        } catch (e) {
            console.log('❌ Ошибка декодирования токена:', e);
            return false;
        }
    }
    
    return false;
}

// Функция для обновления токена
async function refreshAuthToken() {
    console.log('🔄 Обновление токена...');
    
    try {
        localStorage.clear();
        sessionStorage.clear();
        
        const response = await fetch('http://localhost:8000/api/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                auth: { login: 'admin@test.com', password: 'admin123' }
            })
        });
        
        const data = await response.json();
        
        if (data.tokens?.access) {
            localStorage.setItem('tvoya_shina_token', data.tokens.access);
            localStorage.setItem('tvoya_shina_refresh_token', data.tokens.refresh);
            localStorage.setItem('tvoya_shina_user', JSON.stringify(data.user));
            console.log('✅ Токен обновлен успешно!');
            return true;
        } else {
            console.log('❌ Не удалось получить токен');
            return false;
        }
    } catch (error) {
        console.error('❌ Ошибка обновления токена:', error);
        return false;
    }
}

// Функция для проверки API эндпоинта
async function checkApiEndpoint(endpoint, method = 'GET', data = null) {
    const token = localStorage.getItem('tvoya_shina_token');
    const url = `http://localhost:8000/api/v1${endpoint}`;
    
    const options = {
        method,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
        }
    };
    
    if (data && method !== 'GET') {
        if (data instanceof FormData) {
            // Для FormData не устанавливаем Content-Type - браузер сделает это автоматически
            options.body = data;
        } else {
            options.headers['Content-Type'] = 'application/json';
            options.body = JSON.stringify(data);
        }
    }
    
    try {
        const response = await fetch(url, options);
        return {
            status: response.status,
            ok: response.ok,
            statusText: response.statusText,
            url: url
        };
    } catch (error) {
        return {
            status: 0,
            ok: false,
            statusText: error.message,
            url: url,
            error: error
        };
    }
}

// Функция для создания тестовых данных
function createTestData(form, isUpdate = false) {
    const baseData = {
        name: isUpdate ? 'Updated Test' : 'Test',
        description: 'Test description'
    };
    
    // Специфичные данные для разных типов форм
    if (form.api.includes('partners')) {
        return {
            ...baseData,
            company_name: baseData.name,
            contact_person: 'Test Contact',
            legal_address: 'Test Address',
            region_id: 1,
            city_id: 1,
            is_active: true
        };
    }
    
    if (form.api.includes('service_points')) {
        return {
            ...baseData,
            address: 'Test Address',
            city_id: 1,
            partner_id: 1,
            contact_phone: '+380123456789',
            is_active: true,
            work_status: 'working',
            latitude: 50.4501,
            longitude: 30.5234
        };
    }
    
    if (form.api.includes('users')) {
        return {
            ...baseData,
            email: 'test@example.com',
            first_name: 'Test',
            last_name: 'User',
            phone: '+380123456789',
            role_id: 1
        };
    }
    
    return baseData;
}

// Функция для проверки конкретной формы
async function checkForm(form) {
    console.log(`\n📋 Проверка: ${form.name}`);
    console.log(`URL: ${form.url}`);
    console.log(`API: ${form.api}`);
    console.log(`FormData: ${form.hasFormData ? 'Да' : 'Нет'}`);
    
    const results = {
        name: form.name,
        url: form.url,
        api: form.api,
        hasFormData: form.hasFormData,
        tests: []
    };
    
    // Тест 1: Проверка GET запроса (загрузка данных для редактирования)
    if (form.url.includes('/edit')) {
        const getResult = await checkApiEndpoint(form.api);
        results.tests.push({
            test: 'GET запрос (загрузка данных)',
            status: getResult.status,
            ok: getResult.ok,
            message: getResult.statusText
        });
    }
    
    // Тест 2: Проверка POST/PATCH запроса
    const isUpdate = form.url.includes('/edit');
    const method = isUpdate ? 'PATCH' : 'POST';
    const endpoint = isUpdate ? form.api : form.api;
    
    let testData = createTestData(form, isUpdate);
    
    // Создаем FormData если форма использует загрузку файлов
    if (form.hasFormData) {
        const formData = new FormData();
        
        // Для сервисных точек используем специальный формат
        if (form.api.includes('service_points')) {
            Object.entries(testData).forEach(([key, value]) => {
                formData.append(`service_point[${key}]`, value.toString());
            });
        } else {
            // Для других форм используем обычный формат
            Object.entries(testData).forEach(([key, value]) => {
                formData.append(key, value.toString());
            });
        }
        
        testData = formData;
    }
    
    const postResult = await checkApiEndpoint(endpoint, method, testData);
    results.tests.push({
        test: `${method} запрос (отправка формы)`,
        status: postResult.status,
        ok: postResult.ok,
        message: postResult.statusText
    });
    
    // Анализ результатов
    const hasAuthError = results.tests.some(t => t.status === 401);
    const hasFormDataError = results.tests.some(t => t.status === 400 && form.hasFormData);
    const hasServerError = results.tests.some(t => t.status >= 500);
    
    if (hasAuthError) {
        console.log('❌ Ошибка авторизации (401)');
    }
    if (hasFormDataError) {
        console.log('❌ Возможная ошибка FormData (400)');
    }
    if (hasServerError) {
        console.log('❌ Ошибка сервера (5xx)');
    }
    
    // 422 - валидационные ошибки это нормально для тестовых данных
    const allOk = results.tests.every(t => t.ok || t.status === 422 || t.status === 404);
    if (allOk) {
        console.log('✅ Форма работает корректно');
    }
    
    return results;
}

// Основная функция проверки всех форм
async function checkAllForms() {
    console.log('🚀 === НАЧАЛО ПРОВЕРКИ ВСЕХ ФОРМ ===\n');
    
    // Проверяем авторизацию
    const isAuthValid = checkAuthStatus();
    
    if (!isAuthValid) {
        console.log('🔄 Обновляем токен...');
        const tokenRefreshed = await refreshAuthToken();
        if (!tokenRefreshed) {
            console.log('❌ Не удалось обновить токен. Проверка прервана.');
            return;
        }
    }
    
    const results = [];
    
    // Проверяем каждую форму
    for (const form of FORMS_TO_CHECK) {
        try {
            const result = await checkForm(form);
            results.push(result);
            
            // Небольшая пауза между запросами
            await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
            console.log(`❌ Ошибка при проверке ${form.name}:`, error);
            results.push({
                name: form.name,
                url: form.url,
                error: error.message
            });
        }
    }
    
    // Сводка результатов
    console.log('\n📊 === СВОДКА РЕЗУЛЬТАТОВ ===');
    
    const authErrors = results.filter(r => r.tests?.some(t => t.status === 401));
    const formDataErrors = results.filter(r => r.hasFormData && r.tests?.some(t => t.status === 400));
    const serverErrors = results.filter(r => r.tests?.some(t => t.status >= 500));
    const workingForms = results.filter(r => r.tests?.every(t => t.ok || t.status === 422 || t.status === 404));
    
    console.log(`✅ Работающие формы: ${workingForms.length}`);
    console.log(`❌ Ошибки авторизации (401): ${authErrors.length}`);
    console.log(`❌ Ошибки FormData (400): ${formDataErrors.length}`);
    console.log(`❌ Ошибки сервера (5xx): ${serverErrors.length}`);
    
    if (authErrors.length > 0) {
        console.log('\n🔐 Формы с ошибками авторизации:');
        authErrors.forEach(r => console.log(`  - ${r.name}`));
    }
    
    if (formDataErrors.length > 0) {
        console.log('\n📋 Формы с ошибками FormData:');
        formDataErrors.forEach(r => console.log(`  - ${r.name}`));
    }
    
    if (serverErrors.length > 0) {
        console.log('\n🔥 Формы с ошибками сервера:');
        serverErrors.forEach(r => console.log(`  - ${r.name}`));
    }
    
    console.log('\n🏁 === ПРОВЕРКА ЗАВЕРШЕНА ===');
    
    return results;
}

// Функция для быстрой проверки только критичных форм
async function checkCriticalForms() {
    const criticalForms = FORMS_TO_CHECK.filter(form => 
        form.name.includes('партнер') || 
        form.name.includes('сервисн') ||
        form.name.includes('пользовател')
    );
    
    console.log('⚡ === БЫСТРАЯ ПРОВЕРКА КРИТИЧНЫХ ФОРМ ===\n');
    
    const results = [];
    for (const form of criticalForms) {
        const result = await checkForm(form);
        results.push(result);
        await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    return results;
}

// Функция для проверки только FormData форм
async function checkFormDataForms() {
    const formDataForms = FORMS_TO_CHECK.filter(form => form.hasFormData);
    
    console.log('📋 === ПРОВЕРКА ФОРМ С FORMDATA ===\n');
    console.log(`Найдено ${formDataForms.length} форм с FormData:`);
    formDataForms.forEach(form => console.log(`  - ${form.name}`));
    console.log('');
    
    const results = [];
    for (const form of formDataForms) {
        const result = await checkForm(form);
        results.push(result);
        await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    return results;
}

// Экспорт функций для использования в консоли
window.checkAllForms = checkAllForms;
window.checkCriticalForms = checkCriticalForms;
window.checkFormDataForms = checkFormDataForms;
window.checkAuthStatus = checkAuthStatus;
window.refreshAuthToken = refreshAuthToken;

console.log('📋 Скрипт проверки форм загружен!');
console.log('Доступные команды:');
console.log('  checkAllForms() - проверить все формы');
console.log('  checkCriticalForms() - проверить только критичные формы');
console.log('  checkFormDataForms() - проверить только FormData формы');
console.log('  checkAuthStatus() - проверить состояние авторизации');
console.log('  refreshAuthToken() - обновить токен');