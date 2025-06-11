const axios = require('axios');

const API_BASE = 'http://localhost:8000';

async function testServicePointsAPI() {
    console.log('🔍 Тестирование API сервисных точек...\n');

    try {
        // 1. Тест без параметров
        console.log('1. Запрос без параметров:');
        const response1 = await axios.get(`${API_BASE}/api/v1/service_points`);
        console.log(`   Статус: ${response1.status}`);
        console.log(`   Количество точек: ${response1.data.data?.length || 0}`);
        console.log(`   Пагинация: ${JSON.stringify(response1.data.pagination)}\n`);

        // 2. Тест с параметрами пагинации
        console.log('2. Запрос с пагинацией (page=1, per_page=2):');
        const response2 = await axios.get(`${API_BASE}/api/v1/service_points`, {
            params: { page: 1, per_page: 2 }
        });
        console.log(`   Статус: ${response2.status}`);
        console.log(`   Количество точек: ${response2.data.data?.length || 0}`);
        console.log(`   Пагинация: ${JSON.stringify(response2.data.pagination)}\n`);

        // 3. Тест с поиском
        console.log('3. Запрос с поиском (search="Киев"):');
        const response3 = await axios.get(`${API_BASE}/api/v1/service_points`, {
            params: { search: 'Киев' }
        });
        console.log(`   Статус: ${response3.status}`);
        console.log(`   Количество точек: ${response3.data.data?.length || 0}`);
        console.log(`   Первая точка: ${response3.data.data?.[0]?.name || 'Нет данных'}\n`);

        // 4. Тест аутентификации
        console.log('4. Тест аутентификации:');
        const loginResponse = await axios.post(`${API_BASE}/api/v1/auth/login`, {
            auth: {
                login: 'test@test.com',
                password: 'password'
            }
        });
        
        if (loginResponse.status === 200) {
            console.log('   ✅ Аутентификация успешна');
            const token = loginResponse.data.auth_token;
            
            // 5. Тест с токеном
            console.log('5. Запрос с токеном аутентификации:');
            const response5 = await axios.get(`${API_BASE}/api/v1/service_points`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log(`   Статус: ${response5.status}`);
            console.log(`   Количество точек: ${response5.data.data?.length || 0}\n`);
        }

        console.log('✅ Все тесты API прошли успешно!');

    } catch (error) {
        console.error('❌ Ошибка при тестировании API:', error.response?.data || error.message);
    }
}

testServicePointsAPI(); 