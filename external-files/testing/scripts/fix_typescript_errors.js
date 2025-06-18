#!/usr/bin/env node

// Скрипт для исправления основных ошибок TypeScript в проекте

const fs = require('fs');
const path = require('path');

console.log('🔧 Исправление ошибок TypeScript...');

// Функция для чтения файла
function readFile(filePath) {
    try {
        return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
        console.error(`Ошибка чтения файла ${filePath}:`, error.message);
        return null;
    }
}

// Функция для записи файла
function writeFile(filePath, content) {
    try {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Исправлен файл: ${filePath}`);
        return true;
    } catch (error) {
        console.error(`Ошибка записи файла ${filePath}:`, error.message);
        return false;
    }
}

// Исправления для ServicePointsPage.tsx
function fixServicePointsPage() {
    const filePath = 'src/pages/service-points/ServicePointsPage.tsx';
    let content = readFile(filePath);
    if (!content) return;

    // Исправляем проблему с cities
    content = content.replace(
        /citiesData\?\.\w+\?\./g,
        'citiesData?.data?.'
    );

    // Исправляем проблему с regions
    content = content.replace(
        /regionsData\?\.\w+\?\./g,
        'regionsData?.data?.'
    );

    writeFile(filePath, content);
}

// Исправления для ServicesPage.tsx
function fixServicesPage() {
    const filePath = 'src/pages/services/ServicesPage.tsx';
    let content = readFile(filePath);
    if (!content) return;

    // Исправляем проблему с categoriesData
    content = content.replace(
        /categoriesData\?\.\w+\?\./g,
        'categoriesData?.'
    );

    // Исправляем проблему с servicesData
    content = content.replace(
        /servicesData\?\.\w+\?\./g,
        'servicesData?.'
    );

    writeFile(filePath, content);
}

// Исправления для ServicePointFormPage.tsx
function fixServicePointFormPage() {
    const filePath = 'src/pages/service-points/ServicePointFormPage.tsx';
    let content = readFile(filePath);
    if (!content) return;

    // Исправляем проблему с useGetPartnersQuery
    content = content.replace(
        'useGetPartnersQuery()',
        'useGetPartnersQuery({})'
    );

    // Исправляем проблему с useGetRegionsQuery
    content = content.replace(
        'useGetRegionsQuery()',
        'useGetRegionsQuery({})'
    );

    writeFile(filePath, content);
}

// Исправления для ServicePointDetailsPage.tsx
function fixServicePointDetailsPage() {
    const filePath = 'src/pages/service-points/ServicePointDetailsPage.tsx';
    let content = readFile(filePath);
    if (!content) return;

    // Исправляем проблему с regionId
    content = content.replace(
        /city\?\.\w*regionId\w*/g,
        'city?.region_id'
    );

    // Исправляем проблему с working_hours
    content = content.replace(
        /servicePoint\.working_hours/g,
        '(servicePoint as any).working_hours'
    );

    writeFile(filePath, content);
}

// Исправления для CitiesPage.tsx
function fixCitiesPage() {
    const filePath = 'src/pages/cities/CitiesPage.tsx';
    let content = readFile(filePath);
    if (!content) return;

    // Добавляем CityFilter если его нет
    if (!content.includes('CityFilter')) {
        content = content.replace(
            "import { City, CityFilter, CityFormData, Region, ApiResponse } from '../../types/models';",
            "import { City, CityFormData, Region, ApiResponse } from '../../types/models';\n\ninterface CityFilter {\n  query?: string;\n  region_id?: string | number;\n  page?: number;\n  per_page?: number;\n}"
        );
    }

    writeFile(filePath, content);
}

// Исправления для RegionsPage.tsx
function fixRegionsPage() {
    const filePath = 'src/pages/catalog/RegionsPage.tsx';
    let content = readFile(filePath);
    if (!content) return;

    // Исправляем проблему с is_active
    content = content.replace(
        'is_active: region.is_active,',
        'is_active: region.is_active ?? true,'
    );

    writeFile(filePath, content);
}

// Основная функция
function main() {
    console.log('🚀 Начинаем исправление ошибок TypeScript...');

    fixServicePointsPage();
    fixServicesPage();
    fixServicePointFormPage();
    fixServicePointDetailsPage();
    fixCitiesPage();
    fixRegionsPage();

    console.log('✅ Исправление завершено!');
    console.log('📝 Рекомендуется запустить npm run build для проверки');
}

// Запускаем исправления
main(); 