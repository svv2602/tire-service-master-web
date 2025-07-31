import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ru, uk } from 'date-fns/locale';
import { Provider, useSelector } from 'react-redux';
import { HelmetProvider } from 'react-helmet-async';
import { store } from './store/index';
import MainLayout from './components/layouts/MainLayout';
import { ThemeProvider } from './contexts/ThemeContext';
import { LoadingScreen } from './components/LoadingScreen';
import LoadingSpinner from './components/common/LoadingSpinner';
import { RootState } from './store/index';
import { SnackbarProvider } from './components/ui/Snackbar/SnackbarContext';
// import { extendClients } from './utils/clientExtensions';
import AuthInitializer from './components/auth/AuthInitializer';
import { GlobalUIStyles } from './components/styled/CommonComponents';
import './styles/overrides/textfield-overrides.css';

// Инициализация i18n
import './i18n';
import { useTranslation } from 'react-i18next';

// Ленивая загрузка страниц аутентификации
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));

// Ленивая загрузка страниц панели управления
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'));
const OperatorDashboardPage = lazy(() => import('./pages/operator-dashboard/OperatorDashboardPage'));

// Ленивая загрузка страниц партнеров
const PartnersPage = lazy(() => import('./pages/partners/PartnersPage'));
const PartnerFormPage = lazy(() => import('./pages/partners/PartnerFormPage'));

// Ленивая загрузка страниц заявок партнеров
const PartnerApplicationsPage = lazy(() => import('./pages/partner-applications/PartnerApplicationsPage'));

// Ленивая загрузка страниц сервисных точек
const ServicePointsPage = lazy(() => import('./pages/service-points/ServicePointsPage'));
const ServicePointFormPage = lazy(() => import('./pages/service-points/ServicePointFormPage'));
const ServicePointDetailPage = lazy(() => import('./pages/service-points/ServicePointDetailPage'));
const ServicePointPhotosPage = lazy(() => import('./pages/service-points/ServicePointPhotosPage'));
const ServicePointServicesPage = lazy(() => import('./pages/service-points/ServicePointServicesPage'));

// Ленивая загрузка страниц услуг
const ServicesPage = lazy(() => import('./pages/services/NewServicesPage').then(module => ({ default: module.ServicesPage })));
const ServiceFormPage = lazy(() => import('./pages/services/ServiceFormPage'));

// Ленивая загрузка страниц клиентов
const ClientsPage = lazy(() => import('./pages/clients/ClientsPage'));
const ClientFormPage = lazy(() => import('./pages/clients/ClientFormPage'));

  // Ленивая загрузка страниц уведомлений
  const NotificationCenterPage = lazy(() => import('./pages/notifications/NotificationCenterPage'));
  const EmailTemplatesPage = lazy(() => import('./pages/notifications/EmailTemplatesPageSimple'));

  const EmailTemplateFormPage = lazy(() => import('./pages/notifications/EmailTemplateFormPage'));
  const CustomVariablesPage = lazy(() => import('./pages/notifications/CustomVariablesPage'));
  const PushSettingsPage = lazy(() => import('./pages/notifications/PushSettingsPage'));
  const TelegramIntegrationPage = lazy(() => import('./pages/notifications/TelegramIntegrationPage'));
const ChannelsSettingsPage = lazy(() => import('./pages/notifications/ChannelsSettingsPage'));
const EmailSettingsPage = lazy(() => import('./pages/notifications/email/EmailSettingsPage'));
const GoogleOauthSettingsPage = lazy(() => import('./pages/notifications/google/GoogleOauthSettingsPage'));
const ClientCarsPage = lazy(() => import('./pages/clients/ClientCarsPage'));
const ClientCarFormPage = lazy(() => import('./pages/clients/ClientCarFormPage'));

// Ленивая загрузка страниц бронирований
const BookingsPage = lazy(() => import('./pages/bookings/BookingsPage'));
const BookingFormPage = lazy(() => import('./pages/bookings/BookingFormPage'));
const BookingFormPageWithAvailability = lazy(() => import('./pages/bookings/BookingFormPageWithAvailability'));
const NewBookingWithAvailabilityPage = lazy(() => import('./pages/bookings/NewBookingWithAvailabilityPage'));
// Страница конфликтов бронирований
const BookingConflictsPage = lazy(() => import('./pages/booking-conflicts/BookingConflictsPage'));

// Ленивая загрузка страниц заказов товаров
const OrdersPage = lazy(() => import('./pages/orders/OrdersPage'));
const PartnerOrdersPage = lazy(() => import('./pages/partners/PartnerOrdersPage'));
const MyOrdersPage = lazy(() => import('./pages/partners/MyOrdersPage'));

// Ленивая загрузка страниц настроек
const SettingsPage = lazy(() => import('./pages/settings/SettingsPage'));
const ProfilePage = lazy(() => import('./pages/profile/ProfilePage'));

// Ленивая загрузка страниц пользователей
const UsersPage = lazy(() => import('./pages/users/UsersPage'));
const UserSuspensionsPage = lazy(() => import('./pages/users/UserSuspensionsPage'));

// Ленивая загрузка страниц операторов
const OperatorsPage = lazy(() => import('./pages/operators/OperatorsPage'));
const UserForm = lazy(() => import('./pages/users/UserForm'));

// Ленивая загрузка страниц аудита
const AuditLogsPage = lazy(() => import('./pages/audit-logs/AuditLogsPage'));
const SuspiciousActivityPage = lazy(() => import('./pages/audit-logs/SuspiciousActivityPage'));
const UserTimelinePage = lazy(() => import('./pages/audit-logs/UserTimelinePage'));
const ResourceHistoryPage = lazy(() => import('./pages/audit-logs/ResourceHistoryPage'));

// Ленивая загрузка страниц регионов и городов
const RegionsPage = lazy(() => import('./pages/regions/RegionsPage'));
const RegionFormPage = lazy(() => import('./pages/regions/RegionFormPage'));
const CitiesPage = lazy(() => import('./pages/catalog/CitiesPage'));

// Тестовые страницы
const WordWrapTestPage = lazy(() => import('./pages/testing/WordWrapTestPage'));
const TableUnificationTest = lazy(() => import('./pages/testing/TableUnificationTest'));
const PageTableTest = lazy(() => import('./pages/testing/PageTableTest'));

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
const ClientServicePointDetailPage = lazy(() => import('./pages/client/ServicePointDetailPage'));

const ClientProfilePage = lazy(() => import('./pages/client/ClientProfilePage'));
const BookingSuccessPage = lazy(() => import('./pages/client/BookingSuccessPage'));
const MyBookingsPage = lazy(() => import('./pages/client/MyBookingsPage'));
const BookingDetailsPage = lazy(() => import('./pages/client/BookingDetailsPage'));
const RescheduleBookingPage = lazy(() => import('./pages/client/RescheduleBookingPage'));
const ClientMyReviewsPage = lazy(() => import('./pages/client/MyReviewsPage'));
const ClientReviewFormPage = lazy(() => import('./pages/client/ReviewFormPage'));
const BusinessApplicationPage = lazy(() => import('./pages/client/BusinessApplicationPage'));

// Ленивая загрузка страницы записей для роута /my-bookings
const MyBookingsPageStandalone = lazy(() => import('./pages/my-bookings/MyBookingsPage'));

// Ленивая загрузка страниц управления контентом
const PageContentPage = lazy(() => import('./pages/page-content/PageContentPage'));
const PageContentFormPage = lazy(() => import('./pages/page-content/PageContentFormPage'));
const PageContentManagement = lazy(() => import('./pages/admin/PageContentManagement'));

// Ленивая загрузка новых мигрированных страниц

// Ленивая загрузка страниц календаря и аналитики
const BookingCalendarPage = lazy(() => import('./pages/admin/BookingCalendarPage'));
const BookingAnalyticsPage = lazy(() => import('./pages/admin/BookingAnalyticsPage'));

// Ленивая загрузка страницы StyleGuide
const StyleGuide = lazy(() => import('./pages/styleguide/styleguide_temp'));

// Ленивая загрузка страницы SEO управления
const SEOManagementPage = lazy(() => import('./pages/admin/SEOManagementPage'));

// Ленивая загрузка калькулятора шин
const TireCalculatorPage = lazy(() => import('./pages/tire-calculator/TireCalculatorPage'));

// Ленивая загрузка страницы поиска шин
const TireSearchPage = lazy(() => import('./pages/tire-search/TireSearchPage'));

// Ленивая загрузка админской страницы управления данными поиска шин
const TireDataManagementPage = lazy(() => import('./pages/admin/tire-search/TireDataManagementPage'));

// Компонент для защищенных маршрутов
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { isAuthenticated, accessToken, user, isInitialized, loading } = useSelector((state: RootState) => state.auth);

  // Показываем загрузку если состояние еще не инициализировано или идет загрузка
  if (!isInitialized || loading) {
    return <LoadingScreen />;
  }

  // Для cookie-based аутентификации достаточно проверить isAuthenticated и user
  // accessToken может отсутствовать, так как используются refresh токены в cookies
  if (!isAuthenticated || !user) {
    // Не делаем редирект, если не инициализировано
    if (!isInitialized) return <LoadingScreen />;
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

// Компонент для динамической локализации дат
const DateLocalizationWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const dateLocale = i18n.language === 'uk' ? uk : ru;
  
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={dateLocale}>
      {children}
    </LocalizationProvider>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <HelmetProvider>
        <ThemeProvider>
          <SnackbarProvider>
            <DateLocalizationWrapper>
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
                      <Route path="/auth/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

                      {/* Главная страница для клиентов (без авторизации) */}
                      <Route path="/client" element={
                        <ClientMainPage />
                      } />
                      
                      {/* Клиентские маршруты */}
          <Route path="/client/services" element={<ClientServicesPage />} />
          <Route path="/client/search" element={<ClientSearchPage />} />
          <Route path="/client/tire-search" element={<TireSearchPage />} />
          <Route path="/business-application" element={<BusinessApplicationPage />} />
          <Route path="/client/service-point/:id" element={<ClientServicePointDetailPage />} />
                      <Route path="/client/tire-calculator" element={<TireCalculatorPage />} />
                      <Route path="/client/booking" element={<NewBookingWithAvailabilityPage />} />
                      <Route path="/client/booking/success" element={<BookingSuccessPage />} />
          <Route path="/client/profile" element={<ClientProfilePage />} />
                      
                      {/* Новые маршруты для управления записями клиента */}
          <Route path="/client/bookings" element={<MyBookingsPage />} />
          <Route path="/client/bookings/:id" element={<BookingDetailsPage />} />
          <Route path="/client/bookings/:id/reschedule" element={<RescheduleBookingPage />} />
          <Route path="/client/reviews" element={<ClientMyReviewsPage />} />
          <Route path="/client/reviews/new" element={<ClientReviewFormPage />} />
          <Route path="/my-bookings" element={<MyBookingsPage />} />
          
                      {/* Маршруты для базы знаний */}
                      <Route path="/knowledge-base" element={<KnowledgeBasePage />} />
          <Route path="/knowledge-base/articles/:id" element={<ArticleViewPage />} />

          {/* Защищенные маршруты (требуют авторизации) */}
          <Route path="/admin" element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }>
                        {/* Главная страница админки */}
                        <Route index element={<DashboardPage />} />
                        <Route path="dashboard" element={<DashboardPage />} />
                        
                        {/* Дашборд оператора */}
                        <Route path="operator-dashboard" element={<OperatorDashboardPage />} />
                        
                        {/* Управление пользователями */}
                        <Route path="users" element={<UsersPage />} />
                <Route path="users/suspensions" element={<UserSuspensionsPage />} />
                        <Route path="users/new" element={<UserForm />} />
                        <Route path="users/:id/edit" element={<UserForm />} />
                        
                        {/* Управление операторами */}
                        <Route path="operators" element={<OperatorsPage />} />
                        
                        {/* Аудит системы */}
                        <Route path="audit-logs" element={<AuditLogsPage />} />
                        <Route path="audit-logs/suspicious-activity" element={<SuspiciousActivityPage />} />
                        <Route path="audit-logs/user-timeline/:userId" element={<UserTimelinePage />} />
                        <Route path="audit-logs/resource-history/:resourceType/:resourceId" element={<ResourceHistoryPage />} />
                        
                        {/* Управление клиентами */}
                        <Route path="clients" element={<ClientsPage />} />
                        <Route path="clients/new" element={<ClientFormPage />} />
                        <Route path="clients/:id/edit" element={<ClientFormPage />} />
                        <Route path="clients/:id/cars" element={<ClientCarsPage />} />
                        
                        {/* Управление партнерами */}
                        <Route path="partners" element={<PartnersPage />} />
                        <Route path="partners/new" element={<PartnerFormPage />} />
                        <Route path="partners/:id/edit" element={<PartnerFormPage />} />
                        
                        {/* Управление заявками партнеров */}
                        <Route path="partner-applications" element={<PartnerApplicationsPage />} />
                        
                        {/* Управление сервисными точками */}
                        <Route path="service-points" element={<ServicePointsPage />} />
                        <Route path="service-points/new" element={<ServicePointFormPage />} />
                        <Route path="service-points/:id/edit" element={<ServicePointFormPage />} />
                        <Route path="partners/:partnerId/service-points/new" element={<ServicePointFormPage />} />
                        <Route path="partners/:partnerId/service-points/:id/edit" element={<ServicePointFormPage />} />
                        <Route path="service-points/:id/services" element={<ServicePointServicesPage />} />
                        
                        {/* Управление автомобилями */}
                        <Route path="car-brands" element={<CarBrandsPage />} />
                        <Route path="car-brands/new" element={<CarBrandFormPage />} />
                        <Route path="car-brands/:id/edit" element={<CarBrandFormPage />} />
                        
                        {/* Управление услугами */}
                        <Route path="services" element={<ServicesPage />} />
                        <Route path="services/new" element={<ServiceFormPage />} />
                        <Route path="services/:id/edit" element={<ServiceFormPage />} />
                        
                        {/* Управление бронированиями */}
                        <Route path="bookings" element={<BookingsPage />} />
                        <Route path="bookings/new" element={<BookingFormPage />} />
                        <Route path="bookings/:id/edit" element={<BookingFormPage />} />
                        <Route path="calendar" element={<BookingCalendarPage />} />
                        <Route path="analytics" element={<BookingAnalyticsPage />} />
                        <Route path="booking-conflicts" element={<BookingConflictsPage />} />
                        
                        {/* Управление отзывами */}
                        <Route path="reviews" element={<ReviewsPage />} />
                        <Route path="reviews/new" element={<ReviewFormPage />} />
                        <Route path="reviews/:id/edit" element={<ReviewFormPage />} />
                        
                        {/* Управление заказами товаров */}
                        <Route path="orders" element={<OrdersPage />} />
                        <Route path="partner-orders" element={<MyOrdersPage />} />
                        
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
                        {/* StyleGuide */}
                        <Route path="styleguide" element={<StyleGuide />} />
                        {/* Тестовые маршруты */}
                        <Route path="testing/word-wrap" element={<WordWrapTestPage />} />
                        <Route path="testing/table-unification" element={<TableUnificationTest />} />
                        <Route path="testing/page-table" element={<PageTableTest />} />
                        
                        {/* Настройки */}
                        <Route path="settings" element={<SettingsPage />} />
                        <Route path="profile" element={<ProfilePage />} />
                        
                        {/* Уведомления */}
                        <Route path="notifications" element={<NotificationCenterPage />} />
                        <Route path="notifications/templates" element={<EmailTemplatesPage />} />
                        <Route path="notifications/templates/new" element={<EmailTemplateFormPage />} />
                        <Route path="notifications/templates/:id/edit" element={<EmailTemplateFormPage />} />
                        <Route path="notifications/custom-variables" element={<CustomVariablesPage />} />
                        <Route path="notifications/push-settings" element={<PushSettingsPage />} />
                        <Route path="notifications/telegram" element={<TelegramIntegrationPage />} />
                        <Route path="notifications/channels" element={<ChannelsSettingsPage />} />
                        <Route path="notifications/email" element={<EmailSettingsPage />} />
                        <Route path="notifications/google-oauth" element={<GoogleOauthSettingsPage />} />
                        
                        {/* SEO управление */}
                        <Route path="seo" element={<SEOManagementPage />} />
                        
                        {/* Управление данными поиска шин */}
                        <Route path="tire-search/data-management" element={<TireDataManagementPage />} />
          </Route>
          
                      {/* Маршрут по умолчанию */}
                      <Route path="*" element={<Navigate to="/client" replace />} />
        </Routes>
                  </Suspense>
                </Router>
              </AuthInitializer>
            </DateLocalizationWrapper>
          </SnackbarProvider>
        </ThemeProvider>
      </HelmetProvider>
    </Provider>
  );
};

export default App;
