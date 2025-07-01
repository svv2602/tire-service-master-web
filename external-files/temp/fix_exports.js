// Скрипт для исправления экспортов в переименованных файлах
// Автор: AI Assistant

const fs = require('fs');
const path = require('path');

const basePath = '/home/snisar/mobi_tz/tire-service-master-web/src/pages';

// Список файлов для исправления
const filesToFix = [
  { path: 'service-points/ServicePointsPage.tsx', oldExport: 'ServicePointsPageNew', newExport: 'ServicePointsPage' },
  { path: 'reviews/ReviewsPage.tsx', oldExport: 'ReviewsPageNew', newExport: 'ReviewsPage' },
  { path: 'bookings/BookingsPage.tsx', oldExport: 'BookingsPageNew', newExport: 'BookingsPage' },
  { path: 'car-brands/CarBrandsPage.tsx', oldExport: 'CarBrandsPageNew', newExport: 'CarBrandsPage' },
  { path: 'catalog/CitiesPage.tsx', oldExport: 'CitiesPageNew', newExport: 'CitiesPage' },
  { path: 'catalog/RegionsPage.tsx', oldExport: 'RegionsPageNew', newExport: 'RegionsPage' },
  { path: 'regions/RegionsPage.tsx', oldExport: 'RegionsPageNew', newExport: 'RegionsPage' }
];

filesToFix.forEach(file => {
  const filePath = path.join(basePath, file.path);
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Заменяем объявление компонента
    content = content.replace(
      new RegExp(`const ${file.oldExport}`, 'g'),
      `const ${file.newExport}`
    );
    
    // Заменяем export
    content = content.replace(
      new RegExp(`export default ${file.oldExport}`, 'g'),
      `export default ${file.newExport}`
    );
    
    // Заменяем именованный export если есть
    content = content.replace(
      new RegExp(`export const ${file.oldExport}`, 'g'),
      `export const ${file.newExport}`
    );
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Исправлен ${file.path}: ${file.oldExport} → ${file.newExport}`);
  } else {
    console.log(`⚠️  Файл не найден: ${file.path}`);
  }
});

console.log('🎉 Все экспорты исправлены!'); 