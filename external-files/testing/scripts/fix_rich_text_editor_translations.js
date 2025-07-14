// Скрипт для исправления ключей переводов в RichTextEditor
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../../../src/components/common/RichTextEditor.tsx');

console.log('🔧 Исправление ключей переводов в RichTextEditor...\n');

try {
    // Читаем файл
    let content = fs.readFileSync(filePath, 'utf8');
    
    console.log('📄 Файл прочитан успешно');
    console.log('📊 Размер файла:', content.length, 'символов');
    
    // Заменяем все ключи переводов
    const replacements = [
        // Основные ключи
        { from: /t\('richTextEditor\./g, to: "t('forms.richTextEditor." },
        
        // Проверяем, что не заменяем дважды
        { from: /t\('forms\.forms\.richTextEditor\./g, to: "t('forms.richTextEditor." }
    ];
    
    let totalReplacements = 0;
    
    replacements.forEach((replacement, index) => {
        const matches = content.match(replacement.from);
        const matchCount = matches ? matches.length : 0;
        
        console.log(`🔄 Замена ${index + 1}: ${matchCount} совпадений`);
        console.log(`   От: ${replacement.from}`);
        console.log(`   К:  ${replacement.to}`);
        
        content = content.replace(replacement.from, replacement.to);
        totalReplacements += matchCount;
    });
    
    console.log(`\n✅ Всего замен выполнено: ${totalReplacements}`);
    
    // Записываем обновленный файл
    fs.writeFileSync(filePath, content, 'utf8');
    
    console.log('💾 Файл сохранен успешно');
    
    // Проверяем результат
    const updatedContent = fs.readFileSync(filePath, 'utf8');
    const remainingOldKeys = updatedContent.match(/t\('richTextEditor\./g);
    const newKeys = updatedContent.match(/t\('forms\.richTextEditor\./g);
    
    console.log('\n📊 Результаты проверки:');
    console.log(`❌ Старые ключи (должно быть 0): ${remainingOldKeys ? remainingOldKeys.length : 0}`);
    console.log(`✅ Новые ключи: ${newKeys ? newKeys.length : 0}`);
    
    if (remainingOldKeys && remainingOldKeys.length > 0) {
        console.log('\n⚠️  Найдены не замененные ключи:');
        remainingOldKeys.forEach((key, index) => {
            console.log(`   ${index + 1}. ${key}`);
        });
    } else {
        console.log('\n🎉 Все ключи переводов успешно обновлены!');
    }
    
} catch (error) {
    console.error('❌ Ошибка при обработке файла:', error.message);
    process.exit(1);
}

console.log('\n�� Скрипт завершен'); 