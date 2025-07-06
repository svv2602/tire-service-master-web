#!/usr/bin/env node

/**
 * Общий скрипт для локализации всех UI компонентов
 * Запускает все скрипты локализации компонентов
 */

const fs = require('fs');
const path = require('path');

// Импортируем функции локализации
const { localizePageTable } = require('./localize_pagetable_component.js');
const { localizeActionsMenu } = require('./localize_actions_menu_component.js');
const { localizeSearchAndFilters } = require('./localize_search_filters_component.js');

/**
 * Основная функция массовой локализации
 */
async function localizeAllComponents() {
  console.log('🚀 Начинаем массовую локализацию UI компонентов...\n');
  
  const results = [];
  let totalReplacements = 0;
  
  // Локализация компонентов
  const components = [
    { name: 'PageTable', func: localizePageTable },
    { name: 'ActionsMenu', func: localizeActionsMenu },
    { name: 'SearchAndFilters', func: localizeSearchAndFilters }
  ];
  
  for (const component of components) {
    try {
      console.log(`\n📦 Локализация ${component.name}...`);
      console.log('='.repeat(50));
      
      const result = component.func();
      results.push({
        component: component.name,
        ...result
      });
      
      totalReplacements += result.replacements;
      
      console.log(`✅ ${component.name} локализован: ${result.replacements} замен`);
      
    } catch (error) {
      console.error(`❌ Ошибка локализации ${component.name}:`, error.message);
      results.push({
        component: component.name,
        success: false,
        error: error.message,
        replacements: 0
      });
    }
  }
  
  // Итоговая статистика
  console.log('\n' + '='.repeat(70));
  console.log('📊 ИТОГОВАЯ СТАТИСТИКА ЛОКАЛИЗАЦИИ КОМПОНЕНТОВ');
  console.log('='.repeat(70));
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ Успешно локализовано: ${successful.length}/${results.length} компонентов`);
  console.log(`📝 Всего замен текстов: ${totalReplacements}`);
  
  if (failed.length > 0) {
    console.log(`❌ Ошибки: ${failed.length} компонентов`);
    failed.forEach(result => {
      console.log(`   - ${result.component}: ${result.error}`);
    });
  }
  
  // Детальная статистика
  console.log('\n📋 Детальная статистика:');
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    const replacements = result.success ? `${result.replacements} замен` : 'ошибка';
    console.log(`${status} ${result.component}: ${replacements}`);
  });
  
  return {
    total: results.length,
    successful: successful.length,
    failed: failed.length,
    totalReplacements,
    results
  };
}

// Запуск скрипта
if (require.main === module) {
  localizeAllComponents()
    .then(summary => {
      console.log('\n🎉 Массовая локализация компонентов завершена!');
      
      if (summary.failed === 0) {
        console.log('🏆 Все компоненты успешно локализованы!');
        process.exit(0);
      } else {
        console.log(`⚠️  Есть ошибки: ${summary.failed}/${summary.total} компонентов`);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('❌ Критическая ошибка:', error.message);
      process.exit(1);
    });
}

module.exports = { localizeAllComponents }; 