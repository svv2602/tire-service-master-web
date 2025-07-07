const fs = require('fs');
const path = require('path');

// Путь к компонентам шагов бронирования
const stepsPath = path.join(__dirname, '../../src/pages/bookings/components');

function fixFinalTranslationErrors() {
  try {
    console.log('🔧 Исправляем финальные ошибки переводов...\n');
    
    const files = fs.readdirSync(stepsPath).filter(file => file.endsWith('.tsx'));
    let totalFixes = 0;
    
    files.forEach(fileName => {
      const filePath = path.join(stepsPath, fileName);
      let content = fs.readFileSync(filePath, 'utf8');
      let fileFixes = 0;
      
      // 1. Исправляем неправильные переводы в строках (например: 't('key') обязательно')
      const wrongStringTranslations = [
        {
          from: /'t\('([^']+)'\)([^']*?)'/g,
          to: "`${t('$1')}$2`",
          name: "неправильные переводы в строках"
        }
      ];
      
      wrongStringTranslations.forEach(pattern => {
        const matches = content.match(pattern.from);
        if (matches) {
          content = content.replace(pattern.from, pattern.to);
          console.log(`✅ ${fileName}: Исправлено ${matches.length} ${pattern.name}`);
          fileFixes += matches.length;
        }
      });
      
      // 2. Исправляем переводы в JSX без фигурных скобок
      const jsxTranslations = [
        {
          from: /(\s+)t\('([^']+)'\)/g,
          to: "$1{t('$2')}",
          name: "переводы в JSX без фигурных скобок"
        }
      ];
      
      jsxTranslations.forEach(pattern => {
        const matches = content.match(pattern.from);
        if (matches) {
          content = content.replace(pattern.from, pattern.to);
          console.log(`✅ ${fileName}: Исправлено ${matches.length} ${pattern.name}`);
          fileFixes += matches.length;
        }
      });
      
      // 3. Исправляем переводы в label и других атрибутах
      const attributeTranslations = [
        {
          from: /(\w+)="t\('([^']+)'\)"/g,
          to: "$1={t('$2')}",
          name: "переводы в атрибутах"
        }
      ];
      
      attributeTranslations.forEach(pattern => {
        const matches = content.match(pattern.from);
        if (matches) {
          content = content.replace(pattern.from, pattern.to);
          console.log(`✅ ${fileName}: Исправлено ${matches.length} ${pattern.name}`);
          fileFixes += matches.length;
        }
      });
      
      // 4. Исправляем переводы в placeholder
      const placeholderTranslations = [
        {
          from: /placeholder="t\('([^']+)'\)"/g,
          to: "placeholder={t('$1')}",
          name: "переводы в placeholder"
        }
      ];
      
      placeholderTranslations.forEach(pattern => {
        const matches = content.match(pattern.from);
        if (matches) {
          content = content.replace(pattern.from, pattern.to);
          console.log(`✅ ${fileName}: Исправлено ${matches.length} ${pattern.name}`);
          fileFixes += matches.length;
        }
      });
      
      // 5. Исправляем переводы в массивах (например: ['t('key')', 'text'])
      const arrayTranslations = [
        {
          from: /'t\('([^']+)'\)'/g,
          to: "t('$1')",
          name: "переводы в массивах"
        }
      ];
      
      arrayTranslations.forEach(pattern => {
        const matches = content.match(pattern.from);
        if (matches) {
          content = content.replace(pattern.from, pattern.to);
          console.log(`✅ ${fileName}: Исправлено ${matches.length} ${pattern.name}`);
          fileFixes += matches.length;
        }
      });
      
      // Сохраняем файл если были изменения
      if (fileFixes > 0) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`📝 ${fileName}: ${fileFixes} исправлений\n`);
        totalFixes += fileFixes;
      } else {
        console.log(`➖ ${fileName}: исправления не требуются\n`);
      }
    });
    
    console.log(`🎯 РЕЗУЛЬТАТ:`);
    console.log(`🔧 Всего исправлений: ${totalFixes}`);
    console.log(`\n✅ Исправление финальных ошибок переводов завершено!`);
    
  } catch (error) {
    console.error('❌ Ошибка при исправлении ошибок переводов:', error);
  }
}

// Запуск скрипта
fixFinalTranslationErrors(); 