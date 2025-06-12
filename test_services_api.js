#!/usr/bin/env node

// Скрипт для тестирования CRUD операций услуг и категорий
const https = require('https');
const http = require('http');

const API_URL = 'http://localhost:8000/api/v1';
let authToken = '';

// Получение токена из localStorage (нужно получить из браузера)
// Для тестирования можно задать токен вручную
const TEST_TOKEN = process.env.TEST_TOKEN || '';

console.log('🧪 Тестирование CRUD операций услуг и категорий\n');

async function makeRequest(method, endpoint, data = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(endpoint, API_URL);
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...(TEST_TOKEN && { 'Authorization': `Bearer ${TEST_TOKEN}` })
            }
        };

        const req = http.request(url, options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const result = body ? JSON.parse(body) : {};
                    resolve({ status: res.statusCode, data: result });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });

        req.on('error', reject);

        if (data) {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

async function testServiceCategories() {
    console.log('📂 Тестирование категорий услуг');
    console.log('================================\n');

    try {
        // 1. GET - Получить все категории
        console.log('1. GET /service_categories');
        const getResult = await makeRequest('GET', '/service_categories?page=1&per_page=10');
        console.log(`   Статус: ${getResult.status}`);
        console.log(`   Категорий: ${getResult.data.data?.length || 0}`);
        console.log(`   Пагинация: ${JSON.stringify(getResult.data.pagination || {})}\n`);

        // 2. POST - Создать категорию
        console.log('2. POST /service_categories');
        const createData = {
            service_category: {
                name: 'Тестовая категория API',
                description: 'Создано через API тест',
                is_active: true,
                sort_order: 999
            }
        };
        
        const createResult = await makeRequest('POST', '/service_categories', createData);
        console.log(`   Статус: ${createResult.status}`);
        
        if (createResult.status === 201 || createResult.status === 200) {
            const categoryId = createResult.data.id;
            console.log(`   Создана категория с ID: ${categoryId}\n`);

            // 3. PATCH - Обновить категорию
            console.log(`3. PATCH /service_categories/${categoryId}`);
            const updateData = {
                service_category: {
                    name: 'Тестовая категория API (Обновлено)',
                    description: 'Обновлено через API тест'
                }
            };
            
            const updateResult = await makeRequest('PATCH', `/service_categories/${categoryId}`, updateData);
            console.log(`   Статус: ${updateResult.status}`);
            console.log(`   Обновлено: ${updateResult.data.name || 'Ошибка'}\n`);

            // 4. DELETE - Удалить категорию
            console.log(`4. DELETE /service_categories/${categoryId}`);
            const deleteResult = await makeRequest('DELETE', `/service_categories/${categoryId}`);
            console.log(`   Статус: ${deleteResult.status}`);
            console.log(`   Удаление: ${deleteResult.status === 204 || deleteResult.status === 200 ? 'Успешно' : 'Ошибка'}\n`);
        } else {
            console.log(`   Ошибка создания: ${JSON.stringify(createResult.data)}\n`);
        }

    } catch (error) {
        console.error('Ошибка тестирования категорий:', error.message);
    }
}

async function testServices() {
    console.log('🔧 Тестирование услуг');
    console.log('=====================\n');

    try {
        // 1. GET - Получить все услуги
        console.log('1. GET /services');
        const getResult = await makeRequest('GET', '/services');
        console.log(`   Статус: ${getResult.status}`);
        console.log(`   Услуг: ${(getResult.data.data || getResult.data || []).length}\n`);

        // 2. POST - Создать услугу
        console.log('2. POST /services');
        const createData = {
            service: {
                name: 'Тестовая услуга API',
                description: 'Создано через API тест',
                default_duration: 45,
                is_active: true,
                sort_order: 999
            }
        };
        
        const createResult = await makeRequest('POST', '/services', createData);
        console.log(`   Статус: ${createResult.status}`);
        
        if (createResult.status === 201 || createResult.status === 200) {
            const serviceId = createResult.data.id;
            console.log(`   Создана услуга с ID: ${serviceId}\n`);

            // 3. GET by ID - Получить услугу по ID
            console.log(`3. GET /services/${serviceId}`);
            const getByIdResult = await makeRequest('GET', `/services/${serviceId}`);
            console.log(`   Статус: ${getByIdResult.status}`);
            console.log(`   Услуга: ${getByIdResult.data.name || 'Не найдена'}\n`);

            // 4. PATCH - Обновить услугу
            console.log(`4. PATCH /services/${serviceId}`);
            const updateData = {
                service: {
                    name: 'Тестовая услуга API (Обновлено)',
                    description: 'Обновлено через API тест'
                }
            };
            
            const updateResult = await makeRequest('PATCH', `/services/${serviceId}`, updateData);
            console.log(`   Статус: ${updateResult.status}`);
            console.log(`   Обновлено: ${updateResult.data.name || 'Ошибка'}\n`);

            // 5. DELETE - Удалить услугу
            console.log(`5. DELETE /services/${serviceId}`);
            const deleteResult = await makeRequest('DELETE', `/services/${serviceId}`);
            console.log(`   Статус: ${deleteResult.status}`);
            console.log(`   Удаление: ${deleteResult.status === 204 || deleteResult.status === 200 ? 'Успешно' : 'Ошибка'}\n`);
        } else {
            console.log(`   Ошибка создания: ${JSON.stringify(createResult.data)}\n`);
        }

    } catch (error) {
        console.error('Ошибка тестирования услуг:', error.message);
    }
}

async function main() {
    if (!TEST_TOKEN) {
        console.log('⚠️  Токен авторизации не установлен.');
        console.log('   Установите переменную окружения TEST_TOKEN или получите токен из браузера.\n');
    }

    await testServiceCategories();
    await testServices();
    
    console.log('✅ Тестирование завершено!');
}

main().catch(console.error);
