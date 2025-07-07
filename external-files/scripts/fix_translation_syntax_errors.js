const fs = require('fs');
const path = require('path');

// Путь к клиентским страницам
const clientPagesPath = path.join(__dirname, '../../src/pages/client');

function fixTranslationSyntaxErrors() {
  try {
    let totalFixes = 0;
    let processedFiles = 0;
    
    console.log('🔧 Исправляем синтаксические ошибки в переводах...\n');
    
    // Получаем все файлы .tsx в папке client
    const files = fs.readdirSync(clientPagesPath).filter(file => file.endsWith('.tsx'));
    
    for (const fileName of files) {
      const filePath = path.join(clientPagesPath, fileName);
      let content = fs.readFileSync(filePath, 'utf8');
      let fileFixes = 0;
      
      // Исправляем неправильные кавычки в строках с переводами
      // Паттерн: '{t('key')}' -> t('key')
      const wrongQuotesPattern = /'\{t\('([^']+)'\)\}'/g;
      const matches = content.match(wrongQuotesPattern);
      
      if (matches) {
        content = content.replace(wrongQuotesPattern, "t('$1')");
        fileFixes += matches.length;
      }
      
      // Исправляем двойные кавычки: "{t('key')}" -> t('key')
      const doubleQuotesPattern = /"\{t\('([^']+)'\)\}"/g;
      const doubleMatches = content.match(doubleQuotesPattern);
      
      if (doubleMatches) {
        content = content.replace(doubleQuotesPattern, "t('$1')");
        fileFixes += doubleMatches.length;
      }
      
      // Исправляем смешанные кавычки: '{t("key")}' -> t('key')
      const mixedQuotesPattern = /'\{t\("([^"]+)"\)\}'/g;
      const mixedMatches = content.match(mixedQuotesPattern);
      
      if (mixedMatches) {
        content = content.replace(mixedQuotesPattern, "t('$1')");
        fileFixes += mixedMatches.length;
      }
      
      // Исправляем обратные кавычки: `{t('key')}` -> t('key')
      const backticksPattern = /`\{t\('([^']+)'\)\}`/g;
      const backticksMatches = content.match(backticksPattern);
      
      if (backticksMatches) {
        content = content.replace(backticksPattern, "t('$1')");
        fileFixes += backticksMatches.length;
      }
      
      // Исправляем JSX атрибуты: prop="{t('key')}" -> prop={t('key')}
      const jsxAttributePattern = /(\w+)="\{t\('([^']+)'\)\}"/g;
      const jsxMatches = content.match(jsxAttributePattern);
      
      if (jsxMatches) {
        content = content.replace(jsxAttributePattern, "$1={t('$2')}");
        fileFixes += jsxMatches.length;
      }
      
      // НОВОЕ: Исправляем JSX атрибуты без фигурных скобок: prop=t('key') -> prop={t('key')}
      const jsxNoBracesPattern = /(\w+)=t\('([^']+)'\)/g;
      const noBracesMatches = content.match(jsxNoBracesPattern);
      
      if (noBracesMatches) {
        content = content.replace(jsxNoBracesPattern, "$1={t('$2')}");
        fileFixes += noBracesMatches.length;
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
    console.log(`\n✅ Исправление синтаксических ошибок завершено!`);
    
  } catch (error) {
    console.error('❌ Ошибка при исправлении синтаксических ошибок:', error);
  }
}

// Запуск скрипта
fixTranslationSyntaxErrors(); 