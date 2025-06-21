import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ru } from 'date-fns/locale';
import { Provider } from 'react-redux';
import { store } from './store/index';
import MainLayout from './components/layouts/MainLayout';
import { ThemeProvider } from './contexts/ThemeContext';
import { LoadingScreen } from './components/LoadingScreen';
import LoadingSpinner from './components/common/LoadingSpinner';
import { useSelector } from 'react-redux';
import { RootState } from './store/index';
import { SnackbarProvider } from './components/ui/Snackbar/SnackbarContext';
// import { extendClients } from './utils/clientExtensions';
import AuthInitializer from './components/auth/AuthInitializer';
import { GlobalUIStyles } from './components/styled/CommonComponents';

// Ленивая загрузка страниц аутентификации
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));

// Ленивая загрузка страниц панели управления
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'));

// Ленивая загрузка страниц партнеров
const PartnersPage = lazy(() => import('./pages/partners/PartnersPage'));
const PartnerFormPage = lazy(() => import('./pages/partners/PartnerFormPage'));

// Ленивая загрузка страниц сервисных точек
const ServicePointsPage = lazy(() => import('./pages/service-points/ServicePointsPage'));
const ServicePointFormPageNew = lazy(() => import('./pages/service-points/ServicePointFormPageNew'));
const ServicePointDetailPage = lazy(() => import('./pages/service-points/ServicePointDetailPage'));
const ServicePointPhotosPage = lazy(() => import('./pages/service-points/ServicePointPhotosPage'));
const ServicePointServicesPage = lazy(() => import('./pages/service-points/ServicePointServicesPage'));

// Ленивая загрузка страниц услуг
const ServicesPage = lazy(() => import('./pages/services/NewServicesPage').then(module => ({ default: module.ServicesPage })));
const ServiceFormPage = lazy(() => import('./pages/services/ServiceFormPage'));

// Ленивая загрузка страниц клиентов
const ClientsPage = lazy(() => import('./pages/clients/ClientsPage'));
const ClientFormPage = lazy(() => import('./pages/clients/ClientFormPage'));
const ClientCarsPage = lazy(() => import('./pages/clients/ClientCarsPage'));
const ClientCarFormPage = lazy(() => import('./pages/clients/ClientCarFormPage'));

// Ленивая загрузка страниц бронирований
const BookingsPage = lazy(() => import('./pages/bookings/BookingsPage'));
const BookingFormPage = lazy(() => import('./pages/bookings/BookingFormPage'));
const BookingFormPageWithAvailability = lazy(() => import('./pages/bookings/BookingFormPageWithAvailability'));
const NewBookingWithAvailabilityPage = lazy(() => import('./pages/bookings/NewBookingWithAvailabilityPage'));

// Ленивая загрузка страниц настроек
const SettingsPage = lazy(() => import('./pages/settings/SettingsPage'));
const ProfilePage = lazy(() => import('./pages/profile/ProfilePage'));

// Ленивая загрузка страниц пользователей
const UsersPage = lazy(() => import('./pages/users/UsersPage'));
const UserForm = lazy(() => import('./pages/users/UserForm'));

// Ленивая загрузка страниц регионов и городов
const RegionsPage = lazy(() => import('./pages/regions/RegionsPage'));
const RegionFormPage = lazy(() => import('./pages/regions/RegionFormPage'));
const CitiesPage = lazy(() => import('./pages/catalog/CitiesPage'));

// Тестовые страницы
const WordWrapTestPage = lazy(() => import('./pages/testing/WordWrapTestPage'));

// Ленивая загрузка страниц брендов автомобилей
const CarBrandsPage = lazy(() => import('./pages/car-brands/CarBrandsPage'));
const CarBrandFormPage = lazy(() => import('./pages/car-brands/CarBrandFormPage'));

// Ленивая загрузка страниц отзывов
const ReviewsPage = lazy(() => import('./pages/reviews/ReviewsPage'));
const ReviewReplyPage = lazy(() => import('./pages/reviews/ReviewReplyPage'));
const MyReviewsPage = lazy(() => import('./pages/reviews/MyReviewsPage'));
const ReviewFormPage = lazy(() => import('./pages/reviews/ReviewFormPage'));

// Ленивая загрузка страниц статей (админка)
const ArticlesPage = lazy(() => import('./pages/articles').then(module => ({ default: module.ArticlesPage })));
const CreateArticlePage = lazy(() => import('./pages/articles').then(module => ({ default: module.CreateArticlePage })));
const EditArticlePage = lazy(() => import('./pages/articles').then(module => ({ default: module.EditArticlePage })));
const ArticleViewPage = lazy(() => import('./pages/articles').then(module => ({ default: module.ArticleViewPage })));

// Ленивая загрузка страниц базы знаний
const KnowledgeBasePage = lazy(() => import('./pages/knowledge-base/KnowledgeBasePage'));
const ArticleDetailPage = lazy(() => import('./pages/knowledge-base/ArticleDetailPage'));

// Ленивая загрузка клиентских страниц
const ClientMainPage = lazy(() => import('./pages/client/ClientMainPage'));
const ClientServicesPage = lazy(() => import('./pages/client/ClientServicesPage'));
const ClientSearchPage = lazy(() => import('./pages/client/ClientSearchPage'));
const ClientBookingPage = lazy(() => import('./pages/client/ClientBookingPage'));
const ClientProfilePage = lazy(() => import('./pages/client/ClientProfilePage'));
const BookingSuccessPage = lazy(() => import('./pages/client/BookingSuccessPage'));
const MyBookingsPage = lazy(() => import('./pages/client/MyBookingsPage'));
const BookingDetailsPage = lazy(() => import('./pages/client/BookingDetailsPage'));
const RescheduleBookingPage = lazy(() => import('./pages/client/RescheduleBookingPage'));
const ClientMyReviewsPage = lazy(() => import('./pages/client/MyReviewsPage'));
const ClientReviewFormPage = lazy(() => import('./pages/client/ReviewFormPage'));

// Ленивая загрузка страниц управления контентом
const PageContentPage = lazy(() => import('./pages/page-content/PageContentPage'));
const PageContentFormPage = lazy(() => import('./pages/page-content/PageContentFormPage'));
const PageContentManagement = lazy(() => import('./pages/admin/PageContentManagement'));

// Ленивая загрузка страницы StyleGuide
const StyleGuide = lazy(() => import('./pages/styleguide/styleguide_temp'));

// Компонент для тем
const ThemeContext = React.createContext<{
  toggleTheme: () => void;
  isDarkMode: boolean;
}>({
  toggleTheme: () => {},
  isDarkMode: false,
});

export const useAppTheme = () => React.useContext(ThemeContext);

// Компонент для защищенных маршрутов
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { isAuthenticated, accessToken, user, isInitialized, loading } = useSelector((state: RootState) => state.auth);
  
  console.log('ProtectedRoute check:', { 
    isAuthenticated, 
    hasToken: !!accessToken,
    hasUser: !!user,
    isInitialized,
    loading
  });

  // Показываем загрузку если состояние еще не инициализировано или идет загрузка
  if (!isInitialized || loading) {
    console.log('ProtectedRoute: showing loading screen');
    return <LoadingScreen />;
  }

  // Для cookie-based аутентификации достаточно проверить isAuthenticated и user
  // accessToken может отсутствовать, так как используются refresh токены в cookies
  if (!isAuthenticated || !user) {
    console.log('ProtectedRoute: redirecting to login - not authenticated');
    return <Navigate to="/login" />;
  }

  console.log('ProtectedRoute: access granted');
  return <>{children}</>;
};

function App() {
  // Инициализация расширений для клиентов
  useEffect(() => {
    // Здесь мы будем инициализировать расширения для клиентов
    // при необходимости в будущем
    console.debug('Client extensions ready');
  }, []);

  return (
    <Provider store={store}>
      <ThemeProvider>
        <SnackbarProvider>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
            <CssBaseline />
            <GlobalUIStyles />
            <AuthInitializer>
              <Router 
                future={{
                  v7_startTransition: true,
                  v7_relativeSplatPath: true
                }}
              >
                <Suspense fallback={<LoadingSpinner fullScreen />}>
                  <Routes>
                    {/* Публичные маршруты */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/styleguide" element={
                      <ThemeProvider>
                        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
                          <StyleGuide />
                        </LocalizationProvider>
                      </ThemeProvider>
                    } />
                    
                    {/* Главная страница для клиентов (без авторизации) */}
                    <Route path="/client" element={
                      <ClientMainPage />
                    } />
                    
                    {/* Клиентские маршруты */}
                    <Route path="/client/services" element={<ClientServicesPage />} />
                    <Route path="/client/search" element={<ClientSearchPage />} />
                    <Route path="/client/booking" element={<ClientBookingPage />} />
                    <Route path="/client/booking/new-with-availability" element={<NewBookingWithAvailabilityPage />} />
                    <Route path="/client/booking/success" element={<BookingSuccessPage />} />
                    <Route path="/client/profile" element={<ClientProfilePage />} />
                    
                    {/* Новые маршруты для управления записями клиента */}
                    <Route path="/client/bookings" element={<MyBookingsPage />} />
                    <Route path="/client/bookings/:id" element={<BookingDetailsPage />} />
                    <Route path="/client/bookings/:id/reschedule" element={<RescheduleBookingPage />} />
                    
                    {/* Новые маршруты для отзывов клиента */}
                    <Route path="/client/reviews" element={<ClientMyReviewsPage />} />
                    <Route path="/client/reviews/new" element={<ClientReviewFormPage />} />
                    <Route path="/client/reviews/new/:servicePointId" element={<ClientReviewFormPage />} />
                    
                    {/* Публичная база знаний (без авторизации) */}
                    <Route path="/knowledge-base" element={<KnowledgeBasePage />} />
                    <Route path="/knowledge-base/:id" element={<ArticleDetailPage />} />
                    
                    {/* Защищенные маршруты в главном лейауте */}
                    <Route path="/" element={
                      <ProtectedRoute>
                        <MainLayout />
                      </ProtectedRoute>
                    }>
                      <Route index element={<Navigate to="/client" replace />} />
                      <Route path="dashboard" element={<DashboardPage />} />
                      {/* Маршруты для партнеров */}
                      <Route path="partners" element={<PartnersPage />} />
                      <Route path="partners/new" element={<PartnerFormPage />} />
                      <Route path="partners/:id/edit" element={<PartnerFormPage />} />
                      <Route path="partners/:id/service-points" element={<ServicePointsPage />} />
                      <Route path="partners/:partnerId/service-points/new" element={<ServicePointFormPageNew />} />
                      <Route path="partners/:partnerId/service-points/:id/edit" element={<ServicePointFormPageNew />} />
                      {/* Маршруты для сервисных точек */}
                      <Route path="service-points" element={<ServicePointsPage />} />
                      <Route path="service-points/new" element={<ServicePointFormPageNew />} />
                      <Route path="service-points/:id" element={<ServicePointDetailPage />} />
                      <Route path="service-points/:id/edit" element={<ServicePointFormPageNew />} />
                      <Route path="service-points/:id/photos" element={<ServicePointPhotosPage />} />
                      <Route path="service-points/:id/services" element={<ServicePointServicesPage />} />
                      {/* Маршруты для клиентов */}
                      <Route path="clients" element={<ClientsPage />} />
                      <Route path="clients/new" element={<ClientFormPage />} />
                      <Route path="clients/:id/edit" element={<ClientFormPage />} />
                      <Route path="clients/:clientId/cars" element={<ClientCarsPage />} />
                      <Route path="clients/:clientId/cars/new" element={<ClientCarFormPage />} />
                      <Route path="clients/:clientId/cars/:carId/edit" element={<ClientCarFormPage />} />
                      {/* Маршруты для бронирований */}
                      <Route path="bookings" element={<BookingsPage />} />
                      <Route path="bookings/new" element={<BookingFormPage />} />
                      <Route path="bookings/new-with-availability" element={<BookingFormPageWithAvailability />} />
                      <Route path="bookings/new-multi-step" element={<NewBookingWithAvailabilityPage />} />
                      <Route path="bookings/:id/edit" element={<BookingFormPage />} />
                      <Route path="bookings/:id/edit-with-availability" element={<BookingFormPageWithAvailability />} />
                      <Route path="bookings/:id" element={<div>Детали бронирования (в разработке)</div>} />
                      {/* Маршруты для отзывов */}
                      <Route path="reviews" element={<ReviewsPage />} />
                      <Route path="reviews/:id/reply" element={<ReviewReplyPage />} />
                      <Route path="reviews/new" element={<ReviewFormPage />} />
                      <Route path="my-reviews" element={<MyReviewsPage />} />
                      {/* Маршруты для брендов и моделей автомобилей */}
                      <Route path="car-brands" element={<CarBrandsPage />} />
                      <Route path="car-brands/new" element={<CarBrandFormPage />} />
                      <Route path="car-brands/:id/edit" element={<CarBrandFormPage />} />
                      {/* Маршруты для клиентских автомобилей */}
                      <Route path="my-cars" element={<div>Мои автомобили (в разработке)</div>} />
                      <Route path="my-cars/new" element={<div>Добавление нового автомобиля (в разработке)</div>} />
                      <Route path="my-bookings" element={<div>Мои записи на шиномонтаж (в разработке)</div>} />
                      {/* Маршруты для сервисных центров клиента */}
                      <Route path="service-points/search" element={<div>Поиск центров (в разработке)</div>} />
                      <Route path="service-points/favorites" element={<div>Избранные центры (в разработке)</div>} />
                      {/* Маршруты для справочников */}
                      <Route path="cars" element={<div>Управление автомобилями (в разработке)</div>} />
                      <Route path="services" element={<ServicesPage />} />
                      <Route path="services/new" element={<ServiceFormPage />} />
                      <Route path="services/:id/edit" element={<ServiceFormPage />} />
                      {/* Маршруты для отчетов */}
                      <Route path="analytics" element={<div>Аналитика и отчеты (в разработке)</div>} />
                      <Route path="trip-history" element={<div>История поездок (в разработке)</div>} />
                      {/* Маршрут для пользователей */}
                      <Route path="users" element={<UsersPage />} />
                      <Route path="users/new" element={<UserForm />} />
                      <Route path="users/:id/edit" element={<UserForm />} />
                      <Route path="users/:id" element={<div>Информация о пользователе (в разработке)</div>} />
                      {/* Другие маршруты */}
                      <Route path="settings" element={<SettingsPage />} />
                      <Route path="profile" element={<ProfilePage />} />
                      {/* Справочники */}
                      <Route path="regions" element={<RegionsPage />} />
                      <Route path="regions/new" element={<RegionFormPage />} />
                      <Route path="regions/:id/edit" element={<RegionFormPage />} />
                      <Route path="cities" element={<CitiesPage />} />
                      {/* Маршруты для статей */}
                      <Route path="articles" element={<ArticlesPage />} />
                      <Route path="articles/new" element={<CreateArticlePage />} />
                      <Route path="articles/:id/edit" element={<EditArticlePage />} />
                      <Route path="articles/:id" element={<ArticleViewPage />} />
                      {/* Маршруты для управления контентом страниц */}
                      <Route path="page-content" element={<PageContentPage />} />
                      <Route path="page-content/new" element={<PageContentFormPage />} />
                      <Route path="page-content/:id/edit" element={<PageContentFormPage />} />
                      <Route path="page-content/management" element={<PageContentManagement />} />
                      {/* Тестовые маршруты */}
                      <Route path="testing/word-wrap" element={<WordWrapTestPage />} />
                    </Route>
                    
                    {/* Маршрут по умолчанию */}
                    <Route path="*" element={<Navigate to="/client" replace />} />
                  </Routes>
                </Suspense>
              </Router>
            </AuthInitializer>
          </LocalizationProvider>
        </SnackbarProvider>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
