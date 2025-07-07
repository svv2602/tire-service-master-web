#!/usr/bin/env node

/**
 * Скрипт для удаления секции client из основных файлов переводов
 * Так как теперь клиентские переводы вынесены в отдельные файлы
 */

const fs = require('fs');
const path = require('path');

// Пути к файлам переводов
const ruFilePath = path.join(__dirname, '../../src/i18n/locales/ru.json');
const ukFilePath = path.join(__dirname, '../../src/i18n/locales/uk.json');

function removeClientSection(filePath, language) {
  console.log(`Обработка файла ${language}...`);
  
  try {
    // Читаем файл
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Ищем начало секции client
    const clientSectionStart = content.indexOf('    },\n    "client": {');
    if (clientSectionStart === -1) {
      console.log(`❌ Секция client не найдена в ${language} файле`);
      return;
    }
    
    // Ищем конец секции client (следующая секция на том же уровне)
    let clientSectionEnd = -1;
    let braceCount = 0;
    let inClientSection = false;
    
    for (let i = clientSectionStart; i < content.length; i++) {
      const char = content[i];
      
      if (char === '{') {
        braceCount++;
        if (!inClientSection) {
          inClientSection = true;
        }
      } else if (char === '}') {
        braceCount--;
        if (braceCount === 0 && inClientSection) {
          // Находим конец строки после закрывающей скобки
          let endOfLine = i + 1;
          while (endOfLine < content.length && content[endOfLine] !== '\n') {
            endOfLine++;
          }
          clientSectionEnd = endOfLine + 1; // +1 для включения \n
          break;
        }
      }
    }
    
    if (clientSectionEnd === -1) {
      console.log(`❌ Не удалось найти конец секции client в ${language} файле`);
      return;
    }
    
    // Удаляем секцию client
    const beforeClient = content.substring(0, clientSectionStart);
    const afterClient = content.substring(clientSectionEnd);
    const newContent = beforeClient + afterClient;
    
    // Сохраняем файл
    fs.writeFileSync(filePath, newContent, 'utf8');
    
    const removedLines = (content.match(/\n/g) || []).length - (newContent.match(/\n/g) || []).length;
    console.log(`✅ Секция client удалена из ${language} файла (удалено ${removedLines} строк)`);
    
  } catch (error) {
    console.error(`❌ Ошибка при обработке ${language} файла:`, error.message);
  }
}

// Обрабатываем файлы
removeClientSection(ruFilePath, 'RU');
removeClientSection(ukFilePath, 'UK');

console.log('\n🎯 Секции client успешно удалены из основных файлов переводов!');
console.log('📁 Клиентские переводы теперь находятся в отдельных файлах:');
console.log('   - client-ru.json');
console.log('   - client-uk.json'); 