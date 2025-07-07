const fs = require('fs');
const path = require('path');

// Путь к клиентским страницам
const clientPagesPath = path.join(__dirname, '../../src/pages/client');

function fixComplexTranslationErrors() {
  try {
    let totalFixes = 0;
    let processedFiles = 0;
    
    console.log('🔧 Исправляем сложные ошибки переводов...\n');
    
    // Получаем все файлы .tsx в папке client
    const files = fs.readdirSync(clientPagesPath).filter(file => file.endsWith('.tsx'));
    
    for (const fileName of files) {
      const filePath = path.join(clientPagesPath, fileName);
      let content = fs.readFileSync(filePath, 'utf8');
      let fileFixes = 0;
      
      // 1. Исправляем двойное использование t(): t(t('key')) -> t('key')
      const doubleTPattern = /t\(t\('([^']+)'\)\)/g;
      const doubleMatches = content.match(doubleTPattern);
      if (doubleMatches) {
        content = content.replace(doubleTPattern, "t('$1')");
        fileFixes += doubleMatches.length;
        console.log(`  - Исправлено ${doubleMatches.length} двойных t() в ${fileName}`);
      }
      
      // 2. Исправляем неправильные кавычки: '{t('key')}' -> t('key')
      const wrongQuotesPattern = /'\{t\('([^']+)'\)\}'/g;
      const wrongMatches = content.match(wrongQuotesPattern);
      if (wrongMatches) {
        content = content.replace(wrongQuotesPattern, "t('$1')");
        fileFixes += wrongMatches.length;
        console.log(`  - Исправлено ${wrongMatches.length} неправильных кавычек в ${fileName}`);
      }
      
      // 3. Исправляем двойные кавычки: "{t('key')}" -> t('key')
      const doubleQuotesPattern = /"\{t\('([^']+)'\)\}"/g;
      const doubleQuotesMatches = content.match(doubleQuotesPattern);
      if (doubleQuotesMatches) {
        content = content.replace(doubleQuotesPattern, "t('$1')");
        fileFixes += doubleQuotesMatches.length;
        console.log(`  - Исправлено ${doubleQuotesMatches.length} двойных кавычек в ${fileName}`);
      }
      
      // 4. Исправляем сложные случаи: {t('{t('key')} текст')} -> {t('key')} текст
      const complexPattern1 = /\{t\('\{t\('([^']+)'\)\}([^']*?)'\)\}/g;
      const complex1Matches = content.match(complexPattern1);
      if (complex1Matches) {
        content = content.replace(complexPattern1, "{t('$1')}$2");
        fileFixes += complex1Matches.length;
        console.log(`  - Исправлено ${complex1Matches.length} сложных случаев типа 1 в ${fileName}`);
      }
      
      // 5. Исправляем JSX атрибуты без фигурных скобок: prop=t('key') -> prop={t('key')}
      const jsxNoBracesPattern = /(\w+)=t\('([^']+)'\)/g;
      const noBracesMatches = content.match(jsxNoBracesPattern);
      if (noBracesMatches) {
        content = content.replace(jsxNoBracesPattern, "$1={t('$2')}");
        fileFixes += noBracesMatches.length;
        console.log(`  - Исправлено ${noBracesMatches.length} JSX атрибутов без скобок в ${fileName}`);
      }
      
      // 6. Исправляем смешанные кавычки: '{t("key")}' -> t('key')
      const mixedQuotesPattern = /'\{t\("([^"]+)"\)\}'/g;
      const mixedMatches = content.match(mixedQuotesPattern);
      if (mixedMatches) {
        content = content.replace(mixedQuotesPattern, "t('$1')");
        fileFixes += mixedMatches.length;
        console.log(`  - Исправлено ${mixedMatches.length} смешанных кавычек в ${fileName}`);
      }
      
      // 7. Исправляем обратные кавычки: `{t('key')}` -> t('key')
      const backticksPattern = /`\{t\('([^']+)'\)\}`/g;
      const backticksMatches = content.match(backticksPattern);
      if (backticksMatches) {
        content = content.replace(backticksPattern, "t('$1')");
        fileFixes += backticksMatches.length;
        console.log(`  - Исправлено ${backticksMatches.length} обратных кавычек в ${fileName}`);
      }
      
      // Сохраняем файл только если были исправления
      if (fileFixes > 0) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ ${fileName}: ${fileFixes} исправлений`);
        totalFixes += fileFixes;
        processedFiles++;
      } else {
        console.log(`➖ ${fileName}: ошибок не найдено`);
      }
    }
    
    console.log(`\n🎯 РЕЗУЛЬТАТ:`);
    console.log(`📁 Обработано файлов: ${processedFiles}/${files.length}`);
    console.log(`🔧 Всего исправлений: ${totalFixes}`);
    console.log(`\n✅ Исправление сложных ошибок переводов завершено!`);
    
  } catch (error) {
    console.error('❌ Ошибка при исправлении сложных ошибок переводов:', error);
  }
}

// Запуск скрипта
fixComplexTranslationErrors(); 