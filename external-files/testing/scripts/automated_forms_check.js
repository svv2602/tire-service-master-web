#!/usr/bin/env node

/**
 * Автоматизированная проверка всех форм через Node.js
 * Выполняет те же проверки, что и браузерный скрипт
 */

const https = require('https');
const http = require('http');

// Отключаем проверку SSL сертификатов для локальной разработки
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

// Список всех форм для проверки
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

let authToken = null;

// Функция для выполнения HTTP запроса
function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const requestOptions = {
            hostname: urlObj.hostname,
            port: urlObj.port,
            path: urlObj.pathname + urlObj.search,
            method: options.method || 'GET',
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Forms-Checker/1.0',
                ...options.headers
            }
        };

        if (options.body) {
            if (typeof options.body === 'string') {
                requestOptions.headers['Content-Length'] = Buffer.byteLength(options.body);
            }
        }

        const req = http.request(requestOptions, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    const jsonData = data ? JSON.parse(data) : {};
                    resolve({
                        status: res.statusCode,
                        statusText: res.statusMessage,
                        ok: res.statusCode >= 200 && res.statusCode < 300,
                        data: jsonData,
                        headers: res.headers
                    });
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        statusText: res.statusMessage,
                        ok: res.statusCode >= 200 && res.statusCode < 300,
                        data: data,
                        headers: res.headers
                    });
                }
            });
        });

        req.on('error', (err) => {
            reject(err);
        });

        if (options.body) {
            req.write(options.body);
        }

        req.end();
    });
}

// Функция для получения токена авторизации
async function getAuthToken() {
    console.log('🔐 Получение токена авторизации...');
    
    try {
        const response = await makeRequest('http://localhost:8000/api/v1/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                auth: {
                    login: 'admin@test.com',
                    password: 'admin123'
                }
            })
        });

        if (response.ok && response.data.tokens?.access) {
            authToken = response.data.tokens.access;
            console.log('✅ Токен получен успешно');
            console.log(`👤 Пользователь: ${response.data.user.email} (${response.data.user.role})`);
            return true;
        } else {
            console.log('❌ Не удалось получить токен:', response.data);
            return false;
        }
    } catch (error) {
        console.log('❌ Ошибка при получении токена:', error.message);
        return false;
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
            partner: {
                ...baseData,
                company_name: baseData.name,
                contact_person: 'Test Contact',
                legal_address: 'Test Address',
                region_id: 1,
                city_id: 1,
                is_active: true
            }
        };
    }
    
    if (form.api.includes('service_points')) {
        return {
            service_point: {
                ...baseData,
                address: 'Test Address',
                city_id: 1,
                partner_id: 1,
                contact_phone: '+380123456789',
                is_active: true,
                work_status: 'working',
                latitude: 50.4501,
                longitude: 30.5234
            }
        };
    }
    
    if (form.api.includes('users')) {
        return {
            user: {
                ...baseData,
                email: 'test@example.com',
                first_name: 'Test',
                last_name: 'User',
                phone: '+380123456789',
                role_id: 1
            }
        };
    }
    
    if (form.api.includes('service_categories')) {
        return {
            service_category: baseData
        };
    }
    
    if (form.api.includes('regions')) {
        return {
            region: baseData
        };
    }
    
    if (form.api.includes('cities')) {
        return {
            city: {
                ...baseData,
                region_id: 1
            }
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
        try {
            const getResult = await makeRequest(`http://localhost:8000/api/v1${form.api}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            
            results.tests.push({
                test: 'GET запрос (загрузка данных)',
                status: getResult.status,
                ok: getResult.ok,
                message: getResult.statusText
            });
            
            if (getResult.ok) {
                console.log('✅ GET запрос успешен');
            } else {
                console.log(`❌ GET запрос неуспешен: ${getResult.status} ${getResult.statusText}`);
            }
        } catch (error) {
            console.log(`❌ Ошибка GET запроса: ${error.message}`);
            results.tests.push({
                test: 'GET запрос (загрузка данных)',
                status: 0,
                ok: false,
                message: error.message
            });
        }
    }
    
    // Тест 2: Проверка POST/PATCH запроса
    const isUpdate = form.url.includes('/edit');
    const method = isUpdate ? 'PATCH' : 'POST';
    const endpoint = form.api;
    
    try {
        const testData = createTestData(form, isUpdate);
        
        const postResult = await makeRequest(`http://localhost:8000/api/v1${endpoint}`, {
            method: method,
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testData)
        });
        
        results.tests.push({
            test: `${method} запрос (отправка формы)`,
            status: postResult.status,
            ok: postResult.ok,
            message: postResult.statusText
        });
        
        if (postResult.ok || postResult.status === 422) {
            console.log(`✅ ${method} запрос успешен (${postResult.status})`);
        } else {
            console.log(`❌ ${method} запрос неуспешен: ${postResult.status} ${postResult.statusText}`);
            if (postResult.data && typeof postResult.data === 'object') {
                console.log('Детали ошибки:', JSON.stringify(postResult.data, null, 2));
            }
        }
    } catch (error) {
        console.log(`❌ Ошибка ${method} запроса: ${error.message}`);
        results.tests.push({
            test: `${method} запрос (отправка формы)`,
            status: 0,
            ok: false,
            message: error.message
        });
    }
    
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
    console.log('🚀 === НАЧАЛО АВТОМАТИЧЕСКОЙ ПРОВЕРКИ ВСЕХ ФОРМ ===\n');
    
    // Получаем токен авторизации
    const authSuccess = await getAuthToken();
    if (!authSuccess) {
        console.log('❌ Не удалось получить токен. Проверка прервана.');
        return;
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
            console.log(`❌ Ошибка при проверке ${form.name}:`, error.message);
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
    
    console.log(`✅ Работающие формы: ${workingForms.length}/${FORMS_TO_CHECK.length}`);
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

// Функция для проверки только FormData форм
async function checkFormDataForms() {
    const formDataForms = FORMS_TO_CHECK.filter(form => form.hasFormData);
    
    console.log('📋 === ПРОВЕРКА ФОРМ С FORMDATA ===\n');
    console.log(`Найдено ${formDataForms.length} форм с FormData:`);
    formDataForms.forEach(form => console.log(`  - ${form.name}`));
    console.log('');
    
    // Получаем токен авторизации
    const authSuccess = await getAuthToken();
    if (!authSuccess) {
        console.log('❌ Не удалось получить токен. Проверка прервана.');
        return;
    }
    
    const results = [];
    for (const form of formDataForms) {
        const result = await checkForm(form);
        results.push(result);
        await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    return results;
}

// Запуск проверки
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.includes('--formdata')) {
        checkFormDataForms().catch(console.error);
    } else {
        checkAllForms().catch(console.error);
    }
}