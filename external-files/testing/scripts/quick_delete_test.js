const axios = require('axios');

const API_BASE = 'http://localhost:8000/api/v1';

async function testServiceDeletion() {
    console.log('🚀 Запуск теста удаления услуги...');
    
    try {
        // 1. Авторизация
        console.log('🔐 Авторизация...');
        const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
            auth: {
                login: 'admin@test.com',
                password: 'admin123'
            }
        });
        
        const token = loginResponse.data.tokens.access;
        console.log('✅ Авторизация успешна');
        
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
        
        // 2. Создание тестовой услуги
        console.log('📝 Создание тестовой услуги...');
        const serviceData = {
            service: {
                name: `Тест удаления ${Date.now()}`,
                description: 'Услуга для тестирования удаления',
                default_duration: 30,
                is_active: true,
                sort_order: 999,
                category_id: '3'
            }
        };
        
        const createResponse = await axios.post(`${API_BASE}/services`, serviceData, { headers });
        const serviceId = createResponse.data.id;
        console.log(`✅ Услуга создана с ID: ${serviceId}`);
        
        // 3. Проверка существования услуги
        console.log('📜 Проверка списка услуг...');
        const listResponse = await axios.get(`${API_BASE}/service_categories/3/services`, { headers });
        const foundService = listResponse.data.data.find(s => s.id == serviceId);
        
        if (foundService) {
            console.log(`✅ Услуга найдена в списке: ${foundService.name}`);
        } else {
            console.log('❌ Услуга не найдена в списке');
            return;
        }
        
        // 4. Удаление услуги
        console.log(`🗑️ Удаление услуги ID: ${serviceId}...`);
        const deleteUrl = `${API_BASE}/service_categories/3/services/${serviceId}`;
        console.log(`📤 URL удаления: ${deleteUrl}`);
        
        const deleteResponse = await axios.delete(deleteUrl, { headers });
        console.log(`✅ Услуга успешно удалена. Статус: ${deleteResponse.status}`);
        
        // 5. Проверка, что услуга удалена
        console.log('🔍 Проверка удаления...');
        const checkResponse = await axios.get(`${API_BASE}/service_categories/3/services`, { headers });
        const stillExists = checkResponse.data.data.find(s => s.id == serviceId);
        
        if (!stillExists) {
            console.log('✅ Подтверждено: услуга удалена из списка');
        } else {
            console.log('❌ Ошибка: услуга все еще существует');
        }
        
        console.log('🎉 Тест удаления завершен успешно!');
        
    } catch (error) {
        console.error('❌ Ошибка в тесте:', error.response?.data || error.message);
        if (error.response) {
            console.error('📡 HTTP статус:', error.response.status);
            console.error('📡 Данные ответа:', error.response.data);
        }
    }
}

testServiceDeletion();
