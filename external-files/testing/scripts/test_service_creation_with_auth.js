#!/usr/bin/env node

// Тест создания услуги с правильными учетными данными
const http = require('http');

const API_URL = 'http://localhost:8000/api/v1';
const CREDENTIALS = {
  email: 'admin@test.com',
  password: 'admin123'
};

async function makeRequest(method, endpoint, data = null, token = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(endpoint, API_URL);
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            }
        };

        console.log(`📡 ${method} ${url.toString()}`);
        if (data) {
            console.log('📤 Отправляемые данные:', JSON.stringify(data, null, 2));
        }

        const req = http.request(url, options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                console.log(`📥 Статус: ${res.statusCode} ${res.statusMessage}`);
                try {
                    const result = body ? JSON.parse(body) : {};
                    console.log('📥 Ответ:', JSON.stringify(result, null, 2));
                    resolve({ status: res.statusCode, data: result });
                } catch (e) {
                    console.log('📥 Ответ (текст):', body);
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });

        req.on('error', (err) => {
            console.error('❌ Ошибка запроса:', err.message);
            reject(err);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

async function login() {
    console.log('🔑 Авторизация...');
    const response = await makeRequest('POST', '/api/v1/auth/login', {
        auth: {
            login: CREDENTIALS.email,
            password: CREDENTIALS.password
        }
    });
    
    if (response.status === 200 && response.data.tokens && response.data.tokens.access) {
        console.log('✅ Авторизация успешна!');
        console.log('🎫 Токен получен:', response.data.tokens.access.substring(0, 20) + '...');
        return response.data.tokens.access;
    } else {
        throw new Error(`Ошибка авторизации: ${response.status} - ${JSON.stringify(response.data)}`);
    }
}

async function testServiceCreation() {
    console.log('🧪 Тестирование создания услуги\n');
    console.log('================================\n');

    try {
        // 1. Авторизация
        const token = await login();
        console.log('');

        // 2. Получить категории услуг
        console.log('📂 Получение категорий услуг...');
        const categoriesResponse = await makeRequest('GET', '/api/v1/service_categories', null, token);
        
        if (categoriesResponse.status !== 200) {
            throw new Error(`Ошибка получения категорий: ${categoriesResponse.status}`);
        }

        const categories = categoriesResponse.data.data || [];
        if (categories.length === 0) {
            throw new Error('Нет доступных категорий услуг');
        }

        const firstCategory = categories[0];
        console.log(`✅ Найдена категория: "${firstCategory.name}" (ID: ${firstCategory.id})`);
        console.log('');

        // 3. Тест 1: Создание услуги БЕЗ default_duration
        console.log('🧪 ТЕСТ 1: Создание услуги БЕЗ default_duration');
        const serviceDataWithoutDuration = {
            service: {
                name: 'Тестовая услуга без времени',
                description: 'Описание тестовой услуги',
                is_active: true,
                sort_order: 1,
                category_id: firstCategory.id
            }
        };

        const response1 = await makeRequest('POST', '/api/v1/services', serviceDataWithoutDuration, token);
        console.log(`Результат без duration: ${response1.status === 201 ? '✅ УСПЕХ' : '❌ ОШИБКА'}`);
        console.log('');

        // 4. Тест 2: Создание услуги С default_duration
        console.log('🧪 ТЕСТ 2: Создание услуги С default_duration');
        const serviceDataWithDuration = {
            service: {
                name: 'Тестовая услуга с временем',
                description: 'Описание тестовой услуги с временем',
                default_duration: 30,
                is_active: true,
                sort_order: 2,
                category_id: firstCategory.id
            }
        };

        const response2 = await makeRequest('POST', '/api/v1/services', serviceDataWithDuration, token);
        console.log(`Результат с duration: ${response2.status === 201 ? '✅ УСПЕХ' : '❌ ОШИБКА'}`);
        console.log('');

        // 5. Тест 3: Минимальные данные
        console.log('🧪 ТЕСТ 3: Минимальные данные');
        const minimalServiceData = {
            service: {
                name: 'Минимальная услуга',
                category_id: firstCategory.id
            }
        };

        const response3 = await makeRequest('POST', '/api/v1/services', minimalServiceData, token);
        console.log(`Результат минимальных данных: ${response3.status === 201 ? '✅ УСПЕХ' : '❌ ОШИБКА'}`);
        console.log('');

        // 6. Проверить созданные услуги
        console.log('📋 Получение списка услуг для проверки...');
        const servicesResponse = await makeRequest('GET', '/api/v1/services', null, token);
        
        if (servicesResponse.status === 200) {
            const services = servicesResponse.data.data || servicesResponse.data || [];
            console.log(`✅ Найдено услуг: ${services.length}`);
            
            const testServices = services.filter(s => s.name && s.name.includes('Тестовая'));
            console.log(`🧪 Тестовых услуг: ${testServices.length}`);
            
            testServices.forEach(service => {
                console.log(`   - ${service.name} (ID: ${service.id}, duration: ${service.default_duration || 'не указано'})`);
            });
        }

        console.log('\n🎉 Тестирование завершено!');

    } catch (error) {
        console.error('\n❌ Ошибка в тестах:', error.message);
    }
}

testServiceCreation().catch(console.error);
