// Скрипт для проверки структуры переводов в файлах articles
const fs = require('fs');
const path = require('path');

// Пути к файлам переводов
const ruTranslationsPath = path.join(__dirname, '../../../src/i18n/locales/forms/articles/articles-ru.json');
const ukTranslationsPath = path.join(__dirname, '../../../src/i18n/locales/forms/articles/articles-uk.json');

console.log('🔍 Проверка структуры переводов RichTextEditor...\n');

// Функция для чтения и парсинга JSON файла
function readTranslations(filePath, language) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const translations = JSON.parse(content);
        
        console.log(`📄 Файл: ${language.toUpperCase()}`);
        console.log(`📁 Путь: ${filePath}`);
        
        // Проверяем наличие секции richTextEditor
        if (translations.richTextEditor) {
            console.log('✅ Секция richTextEditor найдена на корневом уровне');
            console.log('📋 Структура richTextEditor:');
            console.log(JSON.stringify(translations.richTextEditor, null, 2));
        } else if (translations.forms && translations.forms.richTextEditor) {
            console.log('✅ Секция richTextEditor найдена в forms');
            console.log('📋 Структура richTextEditor:');
            console.log(JSON.stringify(translations.forms.richTextEditor, null, 2));
        } else {
            console.log('❌ Секция richTextEditor НЕ найдена');
            console.log('📋 Доступные ключи верхнего уровня:');
            console.log(Object.keys(translations));
            if (translations.forms) {
                console.log('📋 Доступные ключи в forms:');
                console.log(Object.keys(translations.forms));
            }
        }
        
        console.log('\n' + '='.repeat(50) + '\n');
        
        return translations;
    } catch (error) {
        console.error(`❌ Ошибка при чтении файла ${filePath}:`, error.message);
        return null;
    }
}

// Проверяем оба файла
const ruTranslations = readTranslations(ruTranslationsPath, 'ru');
const ukTranslations = readTranslations(ukTranslationsPath, 'uk');

// Проверяем конкретные ключи
const testKeys = [
    'forms.richTextEditor.modals.link.title',
    'forms.richTextEditor.modals.link.fields.linkText',
    'forms.richTextEditor.modals.image.title',
    'forms.richTextEditor.modals.video.title',
    'forms.richTextEditor.modals.table.title'
];

console.log('🧪 Тестирование конкретных ключей переводов:\n');

testKeys.forEach(key => {
    console.log(`🔑 Ключ: ${key}`);
    
    // Проверяем русский перевод
    const ruValue = getNestedValue(ruTranslations, key);
    console.log(`  🇷🇺 RU: ${ruValue || 'НЕ НАЙДЕНО'}`);
    
    // Проверяем украинский перевод
    const ukValue = getNestedValue(ukTranslations, key);
    console.log(`  🇺🇦 UK: ${ukValue || 'НЕ НАЙДЕНО'}`);
    
    console.log('');
});

// Функция для получения значения по вложенному ключу
function getNestedValue(obj, key) {
    if (!obj) return null;
    
    return key.split('.').reduce((current, prop) => {
        return current && current[prop];
    }, obj);
}

// Проверяем, как будет выглядеть объединенная структура
console.log('🔄 Симуляция объединения переводов (как в i18n):\n');

function simulateDeepMerge(target, source) {
    const result = { ...target };
    
    for (const key in source) {
        if (source.hasOwnProperty(key)) {
            if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
                result[key] = simulateDeepMerge(result[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }
    }
    
    return result;
}

// Симулируем объединение как в i18n/index.ts
const mergedRu = simulateDeepMerge({}, ruTranslations);
const mergedUk = simulateDeepMerge({}, ukTranslations);

console.log('📊 Результат объединения (RU):');
if (mergedRu.richTextEditor) {
    console.log('✅ richTextEditor секция присутствует в объединенном объекте');
    console.log('🔍 Первый уровень modals:', Object.keys(mergedRu.richTextEditor.modals || {}));
} else {
    console.log('❌ richTextEditor секция отсутствует в объединенном объекте');
}

console.log('\n📊 Результат объединения (UK):');
if (mergedUk.richTextEditor) {
    console.log('✅ richTextEditor секция присутствует в объединенном объекте');
    console.log('🔍 Первый уровень modals:', Object.keys(mergedUk.richTextEditor.modals || {}));
} else {
    console.log('❌ richTextEditor секция отсутствует в объединенном объекте');
}

console.log('\n🎯 РЕКОМЕНДАЦИИ:');
console.log('1. Проверьте, что переводы находятся в правильной структуре');
console.log('2. Убедитесь, что useTranslation() использует правильный namespace');
console.log('3. Проверьте конфигурацию i18n в src/i18n/index.ts');
console.log('4. Возможно, нужно использовать useTranslation("translation") явно'); 