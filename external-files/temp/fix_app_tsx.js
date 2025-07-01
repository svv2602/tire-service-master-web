// Скрипт для исправления App.tsx - удаление всех ссылок на PageNew компоненты
// Автор: AI Assistant

const fs = require('fs');
const path = require('path');

const appTsxPath = '/home/snisar/mobi_tz/tire-service-master-web/src/App.tsx';

// Читаем файл
let content = fs.readFileSync(appTsxPath, 'utf8');

// Удаляем импорты PageNew компонентов
const pageNewImports = [
  'const ArticlesPageNew = lazy(() => import(\'./pages/articles/ArticlesPageNew\'));',
  'const PageContentPageNew = lazy(() => import(\'./pages/page-content/PageContentPageNew\'));',
  'const RegionsManagementPageNew = lazy(() => import(\'./pages/regions-management/RegionsManagementPageNew\'));',
  'const ClientCarsPageNew = lazy(() => import(\'./pages/clients/ClientCarsPageNew\'));',
  'const MyReviewsPageNew = lazy(() => import(\'./pages/reviews/MyReviewsPageNew\'));',
  'const RegionsPageNewAdmin = lazy(() => import(\'./pages/regions/RegionsPageNew\'));'
];

pageNewImports.forEach(importLine => {
  content = content.replace(importLine, '');
});

// Удаляем роуты с PageNew компонентами
const pageNewRoutes = [
  '<Route path="testing/reviews-new" element={<ReviewsPageNew />} />',
  '<Route path="testing/bookings-new" element={<BookingsPageNew />} />',
  '<Route path="testing/service-points-new" element={<ServicePointsPageNew />} />',
  '<Route path="testing/cities-new" element={<CitiesPageNew />} />',
  '<Route path="testing/regions-new" element={<RegionsPageNew />} />',
  '<Route path="testing/car-brands-new" element={<CarBrandsPageNew />} />',
  '<Route path="testing/services-new" element={<ServicesPageNew />} />',
  '<Route path="testing/articles-new" element={<ArticlesPageNew />} />',
  '<Route path="testing/page-content-new" element={<PageContentPageNew />} />',
  '<Route path="testing/regions-management-new" element={<RegionsManagementPageNew />} />',
  '<Route path="testing/client-cars-new" element={<ClientCarsPageNew />} />',
  '<Route path="testing/my-reviews-new" element={<MyReviewsPageNew />} />',
  '<Route path="testing/regions-admin-new" element={<RegionsPageNewAdmin />} />'
];

pageNewRoutes.forEach(route => {
  content = content.replace(new RegExp(`\\s*${route.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g'), '');
});

// Записываем исправленный файл
fs.writeFileSync(appTsxPath, content);

console.log('✅ App.tsx исправлен - все ссылки на PageNew компоненты удалены'); 