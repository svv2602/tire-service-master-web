// Скрипт для диагностики API ответов
// Выполните этот код в консоли браузера на странице http://localhost:3008

console.log('🔍 Диагностика API ответов...');

const API_BASE = 'http://localhost:8000/api/v1';

// Функция для выполнения запроса с токеном
async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem('tvoya_shina_token');
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        }
    };
    
    const finalOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };
    
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, finalOptions);
        const data = await response.json();
        
        return {
            success: response.ok,
            status: response.status,
            data: data,
            headers: Object.fromEntries(response.headers.entries())
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

// Функция для анализа структуры ответа
function analyzeResponse(endpoint, response) {
    console.log(`\n📊 Анализ ${endpoint}:`);
    console.log('  Статус:', response.status);
    console.log('  Успех:', response.success);
    
    if (response.success && response.data) {
        console.log('  Структура данных:');
        
        // Проверяем основные поля
        const data = response.data;
        console.log('    - Есть поле "data":', !!data.data);
        console.log('    - Есть поле "meta":', !!data.meta);
        console.log('    - Есть поле "pagination":', !!data.pagination);
        console.log('    - Тип данных:', Array.isArray(data) ? 'Array' : typeof data);
        
        if (data.data) {
            console.log('    - Тип data.data:', Array.isArray(data.data) ? 'Array' : typeof data.data);
            if (Array.isArray(data.data) && data.data.length > 0) {
                console.log('    - Количество элементов:', data.data.length);
                console.log('    - Пример элемента:', data.data[0]);
                console.log('    - Поля первого элемента:', Object.keys(data.data[0]));
            }
        } else if (Array.isArray(data) && data.length > 0) {
            console.log('    - Количество элементов:', data.length);
            console.log('    - Пример элемента:', data[0]);
            console.log('    - Поля первого элемента:', Object.keys(data[0]));
        } else if (typeof data === 'object') {
            console.log('    - Поля объекта:', Object.keys(data));
        }
        
        // Проверяем метаданные
        if (data.meta) {
            console.log('    - Метаданные:', data.meta);
        }
        
        if (data.pagination) {
            console.log('    - Пагинация:', data.pagination);
        }
    } else {
        console.log('  Ошибка:', response.error || response.data);
    }
}

// Функция для тестирования всех основных эндпоинтов
async function testAllEndpoints() {
    console.log('🚀 Тестирование всех основных эндпоинтов...');
    
    const endpoints = [
        '/health',
        '/regions',
        '/cities',
        '/service_points',
        '/partners',
        '/services',
        '/service_categories',
        '/users/me'
    ];
    
    for (const endpoint of endpoints) {
        try {
            const response = await apiRequest(endpoint);
            analyzeResponse(endpoint, response);
            
            // Небольшая задержка между запросами
            await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
            console.error(`❌ Ошибка при тестировании ${endpoint}:`, error);
        }
    }
}

// Функция для тестирования конкретного эндпоинта с параметрами
async function testEndpointWithParams(endpoint, params = {}) {
    console.log(`\n🔍 Тестирование ${endpoint} с параметрами:`, params);
    
    const queryString = new URLSearchParams(params).toString();
    const fullEndpoint = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    const response = await apiRequest(fullEndpoint);
    analyzeResponse(fullEndpoint, response);
    
    return response;
}

// Функция для проверки типов ID
async function checkIdTypes() {
    console.log('\n🔢 Проверка типов ID...');
    
    // Проверяем регионы
    const regionsResponse = await apiRequest('/regions');
    if (regionsResponse.success && regionsResponse.data) {
        const regions = regionsResponse.data.data || regionsResponse.data;
        if (Array.isArray(regions) && regions.length > 0) {
            const firstRegion = regions[0];
            console.log('  Регион ID тип:', typeof firstRegion.id, '- значение:', firstRegion.id);
        }
    }
    
    // Проверяем города
    const citiesResponse = await apiRequest('/cities');
    if (citiesResponse.success && citiesResponse.data) {
        const cities = citiesResponse.data.data || citiesResponse.data;
        if (Array.isArray(cities) && cities.length > 0) {
            const firstCity = cities[0];
            console.log('  Город ID тип:', typeof firstCity.id, '- значение:', firstCity.id);
            console.log('  Город region_id тип:', typeof firstCity.region_id, '- значение:', firstCity.region_id);
        }
    }
    
    // Проверяем сервисные точки
    const servicePointsResponse = await apiRequest('/service_points');
    if (servicePointsResponse.success && servicePointsResponse.data) {
        const servicePoints = servicePointsResponse.data.data || servicePointsResponse.data;
        if (Array.isArray(servicePoints) && servicePoints.length > 0) {
            const firstServicePoint = servicePoints[0];
            console.log('  Сервисная точка ID тип:', typeof firstServicePoint.id, '- значение:', firstServicePoint.id);
            console.log('  Сервисная точка partner_id тип:', typeof firstServicePoint.partner_id, '- значение:', firstServicePoint.partner_id);
        }
    }
}

// Основное меню
console.log('📋 Доступные команды:');
console.log('  testAllEndpoints() - тестировать все эндпоинты');
console.log('  checkIdTypes() - проверить типы ID');
console.log('  testEndpointWithParams(endpoint, params) - тестировать эндпоинт с параметрами');
console.log('  apiRequest(endpoint, options) - выполнить запрос к API');

// Экспортируем функции
window.apiDebug = {
    testAllEndpoints,
    checkIdTypes,
    testEndpointWithParams,
    apiRequest,
    analyzeResponse
};

// Автоматически запускаем базовую диагностику
console.log('🔄 Запуск автоматической диагностики...');
testAllEndpoints().then(() => {
    console.log('\n🎯 Диагностика завершена. Используйте window.apiDebug для дополнительных тестов.');
}); 