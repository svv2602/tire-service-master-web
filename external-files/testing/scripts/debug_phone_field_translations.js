// Скрипт для отладки переводов поля телефона
// Запускать в консоли браузера на странице http://localhost:3008/client/booking

console.log('🔍 Начинаем диагностику переводов поля телефона...');

// Проверяем наличие i18next
if (typeof window.i18n !== 'undefined') {
    console.log('✅ i18next доступен в window.i18n');
    
    // Проверяем текущий язык
    const currentLang = window.i18n.language;
    console.log(`📝 Текущий язык: ${currentLang}`);
    
    // Проверяем доступные языки
    const languages = window.i18n.languages;
    console.log(`🌐 Доступные языки:`, languages);
    
    // Проверяем переводы phoneField для текущего языка
    const phoneFieldTranslations = window.i18n.getResourceBundle(currentLang, 'translation')?.phoneField;
    if (phoneFieldTranslations) {
        console.log('✅ Переводы phoneField найдены:');
        console.log(phoneFieldTranslations);
    } else {
        console.log('❌ Переводы phoneField НЕ найдены');
    }
    
    // Тестируем конкретные ключи
    const testKeys = [
        'phoneField.label',
        'phoneField.placeholder', 
        'phoneField.helperText'
    ];
    
    console.log('\n🧪 Тестируем переводы ключей:');
    testKeys.forEach(key => {
        const translation = window.i18n.t(key);
        const isTranslated = translation !== key;
        console.log(`${isTranslated ? '✅' : '❌'} ${key}: "${translation}"`);
    });
    
    // Проверяем переводы для обоих языков
    console.log('\n🔄 Проверяем переводы для всех языков:');
    ['ru', 'uk'].forEach(lang => {
        console.log(`\n--- Язык: ${lang} ---`);
        testKeys.forEach(key => {
            const translation = window.i18n.t(key, { lng: lang });
            const isTranslated = translation !== key;
            console.log(`${isTranslated ? '✅' : '❌'} ${key}: "${translation}"`);
        });
    });
    
} else {
    console.log('❌ i18next НЕ доступен в window.i18n');
    
    // Проверяем альтернативные способы доступа
    if (typeof window.i18next !== 'undefined') {
        console.log('✅ i18next доступен в window.i18next');
    } else {
        console.log('❌ i18next вообще не найден');
    }
}

// Проверяем localStorage
const savedLang = localStorage.getItem('i18nextLng');
console.log(`💾 Сохранённый язык в localStorage: ${savedLang}`);

// Проверяем компоненты на странице
const phoneInputs = document.querySelectorAll('input[type="tel"]');
console.log(`📱 Найдено полей телефона: ${phoneInputs.length}`);

phoneInputs.forEach((input, index) => {
    console.log(`📱 Поле телефона ${index + 1}:`);
    console.log(`  placeholder: "${input.placeholder}"`);
    console.log(`  value: "${input.value}"`);
});

// Функция для смены языка и проверки
window.testLanguageSwitch = function(lang) {
    console.log(`🔄 Переключаем язык на: ${lang}`);
    if (window.i18n) {
        window.i18n.changeLanguage(lang).then(() => {
            console.log(`✅ Язык переключён на: ${window.i18n.language}`);
            
            // Проверяем переводы после смены
            const testKeys = ['phoneField.label', 'phoneField.placeholder', 'phoneField.helperText'];
            testKeys.forEach(key => {
                const translation = window.i18n.t(key);
                const isTranslated = translation !== key;
                console.log(`${isTranslated ? '✅' : '❌'} ${key}: "${translation}"`);
            });
        });
    }
};

console.log('\n💡 Используйте testLanguageSwitch("ru") или testLanguageSwitch("uk") для смены языка');
console.log('🔍 Диагностика завершена'); 