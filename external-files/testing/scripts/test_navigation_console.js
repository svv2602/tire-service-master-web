// 🧪 СКРИПТ ТЕСТИРОВАНИЯ НАВИГАЦИИ В КОНСОЛИ БРАУЗЕРА
// Вставьте этот код в DevTools Console на странице http://localhost:3008

console.log('🧪 Запуск тестирования навигации...');

// 1. Проверим, что мы на правильной странице
if (window.location.hostname !== 'localhost' || window.location.port !== '3008') {
  console.error('❌ Неправильная страница! Откройте http://localhost:3008');
  console.log('📍 Текущий URL:', window.location.href);
} else {
  console.log('✅ Правильная страница:', window.location.href);
}

// 2. Функция для тестирования навигации
function testNavigation() {
  console.log('\n🎯 ТЕСТ НАВИГАЦИИ: Переход на страницу сервисной точки');
  
  // Проверяем, есть ли React Router
  if (typeof window.React === 'undefined') {
    console.log('⚠️ React не найден в глобальном scope, но это нормально для production');
  }
  
  // Тестируем навигацию напрямую через History API
  const testServicePointId = 1;
  const testUrl = `/client/service-points/${testServicePointId}`;
  
  console.log(`🔄 Пытаемся перейти на: ${testUrl}`);
  
  // Сохраняем текущий URL для возврата
  const originalUrl = window.location.pathname;
  console.log(`📍 Текущий URL: ${originalUrl}`);
  
  // Переходим на страницу сервисной точки
  window.history.pushState(null, '', testUrl);
  
  setTimeout(() => {
    console.log(`✅ URL изменен на: ${window.location.pathname}`);
    
    // Проверяем, загрузилась ли страница
    setTimeout(() => {
      const hasServicePointPage = document.querySelector('h1') && 
                                 document.querySelector('h1').textContent.includes('сервис');
      
      if (hasServicePointPage) {
        console.log('✅ Страница сервисной точки загружена');
        testBookingButton();
      } else {
        console.log('⚠️ Страница сервисной точки не загружена, проверим элементы...');
        console.log('📄 Заголовки на странице:', 
                   Array.from(document.querySelectorAll('h1, h2, h3, h4')).map(h => h.textContent));
        console.log('🔍 Попробуйте вручную перейти на /client/service-points/1');
      }
    }, 2000);
    
  }, 1000);
}

// 3. Функция для тестирования кнопки "Записаться"
function testBookingButton() {
  console.log('\n🎯 ТЕСТ КНОПКИ: Поиск кнопки "Записаться"');
  
  // Ищем кнопки "Записаться"
  const bookingButtons = Array.from(document.querySelectorAll('button'))
    .filter(btn => btn.textContent.includes('Записаться'));
  
  console.log(`📊 Найдено кнопок "Записаться": ${bookingButtons.length}`);
  
  if (bookingButtons.length > 0) {
    bookingButtons.forEach((btn, index) => {
      console.log(`🔘 Кнопка ${index + 1}: "${btn.textContent}"`);
    });
    
    // Тестируем первую кнопку
    console.log('🖱️ Кликаем на первую кнопку "Записаться"...');
    simulateBookingClick(bookingButtons[0]);
  } else {
    console.log('❌ Кнопки "Записаться" не найдены');
    console.log('🔍 Все кнопки на странице:');
    Array.from(document.querySelectorAll('button')).forEach((btn, index) => {
      console.log(`   ${index + 1}. "${btn.textContent}"`);
    });
  }
}

// 4. Функция симуляции клика по кнопке
function simulateBookingClick(button) {
  // Добавляем обработчик для отслеживания изменений URL
  const originalPushState = window.history.pushState;
  const originalReplaceState = window.history.replaceState;
  
  window.history.pushState = function(state, title, url) {
    console.log(`🔄 НАВИГАЦИЯ: pushState вызван с URL: ${url}`);
    console.log(`📦 State:`, state);
    return originalPushState.apply(this, arguments);
  };
  
  window.history.replaceState = function(state, title, url) {
    console.log(`🔄 НАВИГАЦИЯ: replaceState вызван с URL: ${url}`);
    console.log(`📦 State:`, state);
    return originalReplaceState.apply(this, arguments);
  };
  
  // Запоминаем URL до клика
  const urlBeforeClick = window.location.pathname;
  console.log(`📍 URL до клика: ${urlBeforeClick}`);
  
  // Кликаем на кнопку
  button.click();
  
  // Проверяем изменение URL через некоторое время
  setTimeout(() => {
    const urlAfterClick = window.location.pathname;
    console.log(`📍 URL после клика: ${urlAfterClick}`);
    
    if (urlAfterClick !== urlBeforeClick) {
      console.log(`✅ УСПЕХ: URL изменился с ${urlBeforeClick} на ${urlAfterClick}`);
      
      if (urlAfterClick.includes('/client/booking')) {
        console.log('🎉 УСПЕХ: Переход на форму бронирования выполнен!');
      } else if (urlAfterClick === '/client') {
        console.log('❌ ПРОБЛЕМА: Произошел редирект на главную страницу');
        console.log('🔍 Возможные причины:');
        console.log('   1. Кнопка "Отмена" была нажата случайно');
        console.log('   2. Ошибка в функции handleCategorySelect');
        console.log('   3. Проблема с передачей данных в navigate()');
      } else {
        console.log(`⚠️ НЕОЖИДАННЫЙ ПЕРЕХОД: ${urlAfterClick}`);
      }
    } else {
      console.log('🤔 URL не изменился. Возможно:');
      console.log('   1. Открылось модальное окно');
      console.log('   2. Произошла ошибка при клике');
      console.log('   3. Кнопка неактивна');
      
      // Проверяем модальные окна
      const modals = document.querySelectorAll('[role="dialog"], .MuiDialog-root');
      if (modals.length > 0) {
        console.log(`✅ Найдено модальных окон: ${modals.length}`);
        console.log('🔍 Ищем категории в модальном окне...');
        checkModalContent();
      }
    }
    
    // Восстанавливаем оригинальные функции
    window.history.pushState = originalPushState;
    window.history.replaceState = originalReplaceState;
    
  }, 1500);
}

// 5. Функция проверки содержимого модального окна
function checkModalContent() {
  const modalCategories = document.querySelectorAll('[role="dialog"] .MuiCard-root, .MuiDialog-root .MuiCard-root');
  console.log(`📋 Найдено карточек категорий в модальном окне: ${modalCategories.length}`);
  
  if (modalCategories.length > 0) {
    console.log('🎯 Тестируем клик по первой категории...');
    modalCategories[0].click();
    
    setTimeout(() => {
      const finalUrl = window.location.pathname;
      console.log(`📍 Финальный URL: ${finalUrl}`);
      
      if (finalUrl.includes('/client/booking')) {
        console.log('🎉 УСПЕХ: Навигация через модальное окно работает!');
      } else {
        console.log('❌ ПРОБЛЕМА: Навигация через модальное окно не работает');
      }
    }, 1000);
  } else {
    console.log('❌ Категории в модальном окне не найдены');
  }
}

// 6. Функция для прямого тестирования на странице бронирования
function testBookingPageDirect() {
  console.log('\n🎯 ПРЯМОЙ ТЕСТ: Переход на страницу бронирования');
  const bookingUrl = '/client/booking';
  
  console.log(`🔄 Переходим на: ${bookingUrl}`);
  window.history.pushState(null, '', bookingUrl);
  
  setTimeout(() => {
    const currentUrl = window.location.pathname;
    console.log(`📍 Текущий URL: ${currentUrl}`);
    
    if (currentUrl === bookingUrl) {
      console.log('✅ Прямой переход на страницу бронирования работает');
    } else {
      console.log(`❌ Редирект с ${bookingUrl} на ${currentUrl}`);
    }
  }, 1000);
}

// 7. Основная функция запуска тестов
function runAllTests() {
  console.log('\n🚀 ЗАПУСК ВСЕХ ТЕСТОВ');
  
  // Тест 1: Навигация на страницу сервисной точки
  testNavigation();
  
  // Тест 2: Прямой переход на страницу бронирования (через 10 секунд)
  setTimeout(() => {
    testBookingPageDirect();
  }, 10000);
}

// 8. Инструкции для пользователя
console.log('\n📖 ИНСТРУКЦИИ:');
console.log('1. runAllTests() - запустить все тесты автоматически');
console.log('2. testNavigation() - тест навигации на страницу сервисной точки');
console.log('3. testBookingPageDirect() - прямой тест страницы бронирования');
console.log('4. Откройте консоль браузера на http://localhost:3008');
console.log('5. Вставьте этот скрипт и выполните runAllTests()');

console.log('\n🎯 Для запуска тестирования выполните: runAllTests()'); 