// Скрипт для тестирования интеграции фронтенд-бэкенд
// Запуск: node test_frontend_integration.js

const API_BASE = 'http://localhost:8000/api/v1';
const FRONTEND_BASE = 'http://localhost:3000';

// Функция для выполнения HTTP запросов
async function makeRequest(url, options = {}) {
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                'Origin': FRONTEND_BASE,
                ...options.headers
            },
            ...options
        });
        
        const data = await response.json();
        return { success: response.ok, status: response.status, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Тестирование API эндпоинтов
async function testAPI() {
    console.log('=== ТЕСТИРОВАНИЕ API ИНТЕГРАЦИИ ===\n');
    
    // 1. Health check
    console.log('1. Health Check:');
    const health = await makeRequest(`${API_BASE}/health`);
    console.log(health.success ? '✅ УСПЕХ' : '❌ ОШИБКА', health);
    console.log();
    
    // 2. Получение регионов
    console.log('2. Получение регионов:');
    const regions = await makeRequest(`${API_BASE}/regions`);
    console.log(regions.success ? '✅ УСПЕХ' : '❌ ОШИБКА');
    if (regions.success) {
        console.log(`   Найдено регионов: ${regions.data.data?.length || 0}`);
        console.log(`   Пагинация: ${regions.data.pagination ? 'есть' : 'нет'}`);
    }
    console.log();
    
    // 3. Получение сервисных точек
    console.log('3. Получение сервисных точек:');
    const servicePoints = await makeRequest(`${API_BASE}/service_points`);
    console.log(servicePoints.success ? '✅ УСПЕХ' : '❌ ОШИБКА');
    if (servicePoints.success) {
        console.log(`   Найдено точек: ${servicePoints.data.data?.length || 0}`);
        console.log(`   Пагинация: ${servicePoints.data.pagination ? 'есть' : 'нет'}`);
    }
    console.log();
    
    // 4. Регистрация пользователя
    console.log('4. Регистрация пользователя:');
    const timestamp = Date.now();
    const registerData = {
        client: {
            email: `testuser${timestamp}@example.com`,
            password: 'password123',
            password_confirmation: 'password123',
            first_name: 'Тест',
            last_name: 'Пользователь',
            phone: `+38050${timestamp.toString().slice(-7)}`
        }
    };
    
    const register = await makeRequest(`${API_BASE}/clients/register`, {
        method: 'POST',
        body: JSON.stringify(registerData)
    });
    console.log(register.success ? '✅ УСПЕХ' : '❌ ОШИБКА');
    if (register.success) {
        console.log(`   Токен получен: ${register.data.auth_token ? 'да' : 'нет'}`);
        console.log(`   Сообщение: ${register.data.message}`);
    } else {
        console.log(`   Ошибка: ${register.data?.message || register.error}`);
    }
    console.log();
    
    // 5. Логин пользователя
    if (register.success) {
        console.log('5. Логин пользователя:');
        const loginData = {
            auth: {
                email: registerData.client.email,
                password: registerData.client.password
            }
        };
        
        const login = await makeRequest(`${API_BASE}/auth/login`, {
            method: 'POST',
            body: JSON.stringify(loginData)
        });
        console.log(login.success ? '✅ УСПЕХ' : '❌ ОШИБКА');
        if (login.success) {
            console.log(`   Токен получен: ${login.data.auth_token ? 'да' : 'нет'}`);
            console.log(`   Пользователь: ${login.data.user?.first_name} ${login.data.user?.last_name}`);
            console.log(`   Роль: ${login.data.user?.role}`);
            
            // 6. Получение профиля
            console.log('\n6. Получение профиля:');
            const profile = await makeRequest(`${API_BASE}/users/me`, {
                headers: {
                    'Authorization': `Bearer ${login.data.auth_token}`
                }
            });
            console.log(profile.success ? '✅ УСПЕХ' : '❌ ОШИБКА');
            if (profile.success) {
                console.log(`   ID: ${profile.data.id}`);
                console.log(`   Email: ${profile.data.email}`);
                console.log(`   Активен: ${profile.data.is_active ? 'да' : 'нет'}`);
            }
        }
        console.log();
    }
    
    console.log('=== ТЕСТИРОВАНИЕ ЗАВЕРШЕНО ===');
}

// Проверка доступности Node.js fetch API
if (typeof fetch === 'undefined') {
    console.log('❌ Ошибка: fetch API недоступен. Установите Node.js 18+ или используйте node-fetch');
    process.exit(1);
}

// Запуск тестирования
testAPI().catch(console.error); 