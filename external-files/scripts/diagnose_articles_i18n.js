/**
 * Диагностический скрипт для проверки проблемы с переводами статей
 * Запустить в консоли браузера на странице /admin/articles/id/edit
 */

console.log('🔍 Начинаю диагностику переводов статей...');

// Проверяем доступность i18next
if (typeof window.i18n === 'undefined') {
    console.error('❌ i18next не найден в window.i18n');
    
    // Попробуем найти в других местах
    if (typeof window.i18next !== 'undefined') {
        console.log('✅ Найден window.i18next');
        window.i18n = window.i18next;
    } else {
        console.error('❌ i18next не найден нигде');
        console.log('💡 Попробуйте выполнить: import i18n from "i18next"');
    }
}

// Функция для проверки ключа перевода
function checkTranslationKey(key, expectedRu, expectedUk) {
    console.log(`\n🔍 Проверяем ключ: ${key}`);
    
    // Проверяем русский
    const ruValue = window.i18n?.t(key, { lng: 'ru' });
    console.log(`🇷🇺 RU: "${ruValue}" (ожидается: "${expectedRu}")`);
    
    if (ruValue === key) {
        console.error(`❌ Ключ не найден в русских переводах: ${key}`);
    } else if (ruValue === expectedRu) {
        console.log(`✅ Русский перевод корректен`);
    } else {
        console.warn(`⚠️ Русский перевод отличается от ожидаемого`);
    }
    
    // Проверяем украинский
    const ukValue = window.i18n?.t(key, { lng: 'uk' });
    console.log(`🇺🇦 UK: "${ukValue}" (ожидается: "${expectedUk}")`);
    
    if (ukValue === key) {
        console.error(`❌ Ключ не найден в украинских переводах: ${key}`);
    } else if (ukValue === expectedUk) {
        console.log(`✅ Украинский перевод корректен`);
    } else {
        console.warn(`⚠️ Украинский перевод отличается от ожидаемого`);
    }
    
    return { ru: ruValue, uk: ukValue };
}

// Проверяем все ключи из EditArticlePage
console.log('\n📋 Проверка ключей из EditArticlePage:');

const keysToCheck = [
    {
        key: 'common.error',
        expectedRu: 'Ошибка',
        expectedUk: 'Помилка'
    },
    {
        key: 'common.back',
        expectedRu: 'Назад',
        expectedUk: 'Назад'
    },
    {
        key: 'forms.articles.loadingArticles',
        expectedRu: 'Загрузка статей...',
        expectedUk: 'Завантаження статей...'
    },
    {
        key: 'forms.articles.articlesNotFound',
        expectedRu: 'Статьи не найдены',
        expectedUk: 'Статті не знайдено'
    },
    {
        key: 'forms.articles.title',
        expectedRu: '📚 База знаний',
        expectedUk: '📚 База знань'
    }
];

const results = {};
keysToCheck.forEach(({ key, expectedRu, expectedUk }) => {
    results[key] = checkTranslationKey(key, expectedRu, expectedUk);
});

// Проверяем ресурсы i18n
console.log('\n📦 Проверка ресурсов i18n:');
try {
    const ruBundle = window.i18n?.getResourceBundle('ru', 'translation');
    const ukBundle = window.i18n?.getResourceBundle('uk', 'translation');
    
    console.log('🇷🇺 Русский bundle:', ruBundle ? 'найден' : 'не найден');
    console.log('🇺🇦 Украинский bundle:', ukBundle ? 'найден' : 'не найден');
    
    if (ruBundle) {
        console.log('🔍 Проверяем наличие секций в русском bundle:');
        console.log('- common:', ruBundle.common ? '✅' : '❌');
        console.log('- forms:', ruBundle.forms ? '✅' : '❌');
        console.log('- forms.articles:', ruBundle.forms?.articles ? '✅' : '❌');
        
        if (ruBundle.forms?.articles) {
            console.log('📋 Ключи в forms.articles:');
            Object.keys(ruBundle.forms.articles).forEach(key => {
                console.log(`  - ${key}: ${typeof ruBundle.forms.articles[key]}`);
            });
        }
    }
    
    if (ukBundle) {
        console.log('🔍 Проверяем наличие секций в украинском bundle:');
        console.log('- common:', ukBundle.common ? '✅' : '❌');
        console.log('- forms:', ukBundle.forms ? '✅' : '❌');
        console.log('- forms.articles:', ukBundle.forms?.articles ? '✅' : '❌');
    }
} catch (error) {
    console.error('❌ Ошибка при проверке ресурсов:', error);
}

// Проверяем текущий язык
console.log('\n🌐 Информация о текущем языке:');
console.log('Текущий язык:', window.i18n?.language || 'не определен');
console.log('Fallback язык:', window.i18n?.options?.fallbackLng || 'не определен');

// Проверяем localStorage
console.log('\n💾 Проверка localStorage:');
const storedLang = localStorage.getItem('i18nextLng');
console.log('Сохраненный язык:', storedLang || 'не найден');

// Проверяем консоль на ошибки
console.log('\n🐛 Проверка консоли на ошибки:');
console.log('Откройте вкладку Console и найдите ошибки типа:');
console.log('- i18next::translator: missingKey');
console.log('- Failed to load resource');
console.log('- Unexpected token in JSON');

// Итоговый отчет
console.log('\n📊 ИТОГОВЫЙ ОТЧЕТ:');
const totalKeys = keysToCheck.length;
const workingKeys = Object.values(results).filter(result => 
    result.ru !== result.key && result.uk !== result.key
).length;

console.log(`Проверено ключей: ${totalKeys}`);
console.log(`Работающих ключей: ${workingKeys}`);
console.log(`Процент успеха: ${(workingKeys / totalKeys * 100).toFixed(1)}%`);

if (workingKeys === totalKeys) {
    console.log('✅ Все ключи переводов работают корректно!');
    console.log('💡 Если вы видите ключи вместо переводов, попробуйте:');
    console.log('1. Перезагрузить страницу (Ctrl+F5)');
    console.log('2. Очистить кеш браузера');
    console.log('3. Перезапустить приложение');
} else {
    console.error('❌ Обнаружены проблемы с переводами!');
    console.log('🔧 Рекомендации по исправлению:');
    console.log('1. Проверьте файлы переводов в src/i18n/locales/');
    console.log('2. Убедитесь, что файлы импортированы в src/i18n/index.ts');
    console.log('3. Проверьте функцию deepMerge в i18n конфигурации');
    console.log('4. Перезапустите приложение');
}

// Функция для тестирования конкретного ключа
window.testTranslationKey = function(key) {
    console.log(`\n🧪 Тестирование ключа: ${key}`);
    console.log(`🇷🇺 RU: "${window.i18n?.t(key, { lng: 'ru' })}"`);
    console.log(`🇺🇦 UK: "${window.i18n?.t(key, { lng: 'uk' })}"`);
    console.log(`🌐 Текущий язык: "${window.i18n?.t(key)}"`);
};

console.log('\n💡 Для тестирования конкретного ключа используйте:');
console.log('testTranslationKey("forms.articles.title")');

console.log('\n🏁 Диагностика завершена!'); 