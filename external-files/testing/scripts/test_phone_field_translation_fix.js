// Скрипт для тестирования исправления переводов поля телефона
// Запускать в консоли браузера на странице http://localhost:3008/client/booking

console.log('🔧 Тестируем исправление переводов поля телефона...');

// Функция для проверки переводов
function checkPhoneFieldTranslations() {
    console.log('\n📋 Проверяем доступность переводов:');
    
    if (typeof window.i18n !== 'undefined') {
        const currentLang = window.i18n.language;
        console.log(`📝 Текущий язык: ${currentLang}`);
        
        // Проверяем ключи phoneField
        const phoneFieldKeys = [
            'phoneField.label',
            'phoneField.placeholder', 
            'phoneField.helperText'
        ];
        
        console.log('\n🧪 Тестируем ключи phoneField:');
        phoneFieldKeys.forEach(key => {
            const translation = window.i18n.t(key);
            const isTranslated = translation !== key;
            console.log(`${isTranslated ? '✅' : '❌'} ${key}: "${translation}"`);
        });
        
        // Проверяем новый ключ bookingSteps.clientInfo.placeholders.phone
        const newKey = 'bookingSteps.clientInfo.placeholders.phone';
        const newTranslation = window.i18n.t(newKey);
        const isNewTranslated = newTranslation !== newKey;
        console.log(`\n🆕 Новый ключ: ${isNewTranslated ? '✅' : '❌'} ${newKey}: "${newTranslation}"`);
        
        // Проверяем для обоих языков
        console.log('\n🌐 Проверяем для всех языков:');
        ['ru', 'uk'].forEach(lang => {
            console.log(`\n--- ${lang.toUpperCase()} ---`);
            
            const phoneLabel = window.i18n.t('phoneField.label', { lng: lang });
            const phonePlaceholder = window.i18n.t('phoneField.placeholder', { lng: lang });
            const phoneHelper = window.i18n.t('phoneField.helperText', { lng: lang });
            const bookingPlaceholder = window.i18n.t('bookingSteps.clientInfo.placeholders.phone', { lng: lang });
            
            console.log(`  📝 phoneField.label: "${phoneLabel}"`);
            console.log(`  📝 phoneField.placeholder: "${phonePlaceholder}"`);
            console.log(`  📝 phoneField.helperText: "${phoneHelper}"`);
            console.log(`  🆕 bookingSteps.clientInfo.placeholders.phone: "${bookingPlaceholder}"`);
        });
        
    } else {
        console.log('❌ i18next не доступен');
    }
}

// Функция для проверки DOM элементов
function checkPhoneFieldsInDOM() {
    console.log('\n🔍 Проверяем поля телефона в DOM:');
    
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    console.log(`📱 Найдено полей телефона: ${phoneInputs.length}`);
    
    phoneInputs.forEach((input, index) => {
        console.log(`\n📱 Поле ${index + 1}:`);
        console.log(`  placeholder: "${input.placeholder}"`);
        console.log(`  value: "${input.value}"`);
        console.log(`  id: "${input.id}"`);
        console.log(`  name: "${input.name}"`);
        
        // Проверяем, показывается ли ключ вместо значения
        if (input.placeholder.includes('phoneField.placeholder')) {
            console.log('  🚨 ПРОБЛЕМА: Показывается ключ вместо перевода!');
        } else if (input.placeholder.includes('+38')) {
            console.log('  ✅ Placeholder корректный');
        } else {
            console.log('  ⚠️ Неожиданный placeholder');
        }
    });
}

// Функция для смены языка и проверки
function testLanguageSwitch(lang) {
    if (typeof window.i18n !== 'undefined') {
        console.log(`\n🔄 Переключаем язык на: ${lang}`);
        
        window.i18n.changeLanguage(lang).then(() => {
            console.log(`✅ Язык переключён на: ${window.i18n.language}`);
            
            // Ждём обновления DOM
            setTimeout(() => {
                console.log('\n📋 Проверяем переводы после смены языка:');
                checkPhoneFieldTranslations();
                checkPhoneFieldsInDOM();
            }, 1000);
        }).catch(error => {
            console.log(`❌ Ошибка смены языка: ${error}`);
        });
    } else {
        console.log('❌ i18next не доступен для смены языка');
    }
}

// Функция для проверки fallback значений
function testFallbackValues() {
    console.log('\n🛡️ Тестируем fallback значения:');
    
    if (typeof window.i18n !== 'undefined') {
        // Проверяем, что происходит с несуществующим ключом
        const nonExistentKey = 'nonExistent.key';
        const fallbackTest = window.i18n.t(nonExistentKey, 'fallback value');
        console.log(`🧪 Тест fallback: "${fallbackTest}"`);
        
        // Проверяем fallback для phoneField.placeholder
        const phoneFieldFallback = window.i18n.t('phoneField.placeholder', '+38 (067) 123-45-67');
        console.log(`📱 phoneField.placeholder с fallback: "${phoneFieldFallback}"`);
        
        // Проверяем fallback для нового ключа
        const newKeyFallback = window.i18n.t('bookingSteps.clientInfo.placeholders.phone', '+38 (067) 123-45-67');
        console.log(`🆕 bookingSteps placeholder с fallback: "${newKeyFallback}"`);
    }
}

// Запускаем все проверки
console.log('🚀 Начинаем тестирование...\n');

checkPhoneFieldTranslations();
checkPhoneFieldsInDOM();
testFallbackValues();

// Экспортируем функции для ручного тестирования
window.testPhoneFieldFix = {
    checkTranslations: checkPhoneFieldTranslations,
    checkDOM: checkPhoneFieldsInDOM,
    testFallback: testFallbackValues,
    switchToRussian: () => testLanguageSwitch('ru'),
    switchToUkrainian: () => testLanguageSwitch('uk')
};

console.log('\n💡 Доступные команды:');
console.log('  testPhoneFieldFix.checkTranslations() - проверить переводы');
console.log('  testPhoneFieldFix.checkDOM() - проверить поля в DOM');
console.log('  testPhoneFieldFix.testFallback() - проверить fallback значения');
console.log('  testPhoneFieldFix.switchToRussian() - переключить на русский');
console.log('  testPhoneFieldFix.switchToUkrainian() - переключить на украинский');

console.log('\n🔍 Тестирование завершено. Используйте команды выше для дополнительных проверок.'); 