#!/usr/bin/env node

/**
 * Скрипт для исправления хардкодов в ClientMainPage.tsx
 * Заменяет все украинские хардкоды на ключи переводов t()
 */

const fs = require('fs');
const path = require('path');

// Путь к файлу ClientMainPage.tsx
const clientMainPagePath = path.join(__dirname, '../../src/pages/client/ClientMainPage.tsx');

// Исправления для ClientMainPage.tsx
const fixes = [
  // Основной заголовок
  {
    old: "title: 'Знайдіть найкращий автосервис поруч з вами',",
    new: "title: t('client.mainPage.heroTitle'),"
  },
  
  // Плейсхолдер для города
  {
    old: "label={currentHero.settings?.city_placeholder || 'Оберіть місто'}",
    new: "label={currentHero.settings?.city_placeholder || t('client.mainPage.selectCity')}"
  },
  
  // Текст когда города не найдены
  {
    old: 'noOptionsText="Городи не знайдені"',
    new: 'noOptionsText={t("client.mainPage.noCitiesFound")}'
  },
  
  // Заголовок секции статей
  {
    old: '📚 Корисні статті',
    new: `📚 ${t('client.mainPage.articlesTitle')}`
  },
  
  // Автор по умолчанию
  {
    old: "'Неизвестный автор'",
    new: "t('client.mainPage.unknownAuthor')"
  },
  
  // Минуты для времени чтения
  {
    old: 'label={`${article.reading_time || 5} мин`}',
    new: 'label={`${article.reading_time || 5} ${t("client.mainPage.minutes")}`}'
  },
  
  // Кнопка "Читать далее"
  {
    old: 'Читати далі',
    new: '{t("client.mainPage.readMore")}'
  },
  
  // Кнопка "Все статьи"
  {
    old: 'Всі статті',
    new: '{t("client.mainPage.allArticles")}'
  },
  
  // Описание в футере
  {
    old: "'Знайдіть найкращий автосервис поруч з вами. Швидке бронювання, перевірені майстри.'",
    new: "t('client.mainPage.footerDescription')"
  },
  
  // Услуги в футере
  {
    old: "['Заміна шин', 'Балансування', 'Ремонт проколів']",
    new: "[t('client.mainPage.services.tireChange'), t('client.mainPage.services.balancing'), t('client.mainPage.services.repair')]"
  },
  
  // Заголовок "Информация"
  {
    old: 'Інформація',
    new: '{t("client.mainPage.information")}'
  },
  
  // Ссылки информации в футере
  {
    old: "['База знань', t('client.mainPage.personalCabinetButton'), 'Для бізнесу']",
    new: "[t('client.mainPage.knowledgeBase'), t('client.mainPage.personalCabinetButton'), t('client.mainPage.forBusiness')]"
  },
  
  // Копирайт
  {
    old: "'© 2024 Твоя Шина. Всі права захищені.'",
    new: "t('client.mainPage.copyright')"
  }
];

// Функция для применения исправлений
function applyFixes() {
  try {
    // Читаем файл
    let content = fs.readFileSync(clientMainPagePath, 'utf8');
    
    console.log('🔧 Применяю исправления к ClientMainPage.tsx...');
    
    let fixedCount = 0;
    
    // Применяем каждое исправление
    fixes.forEach((fix, index) => {
      if (content.includes(fix.old)) {
        content = content.replace(fix.old, fix.new);
        fixedCount++;
        console.log(`✅ Исправление ${index + 1}: ${fix.old.substring(0, 50)}...`);
      } else {
        console.log(`⚠️  Исправление ${index + 1} не найдено: ${fix.old.substring(0, 50)}...`);
      }
    });
    
    // Сохраняем файл
    fs.writeFileSync(clientMainPagePath, content, 'utf8');
    
    console.log(`\n🎉 Завершено! Применено ${fixedCount} из ${fixes.length} исправлений.`);
    
    return { success: true, fixedCount, totalFixes: fixes.length };
    
  } catch (error) {
    console.error('❌ Ошибка при применении исправлений:', error.message);
    return { success: false, error: error.message };
  }
}

// Запускаем исправления
if (require.main === module) {
  const result = applyFixes();
  process.exit(result.success ? 0 : 1);
}

module.exports = { applyFixes }; 