import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { Provider } from 'react-redux';
import { store } from './store';
import MainLayout from './components/layouts/MainLayout';
import AuthInitializer from './components/auth/AuthInitializer';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import PartnersPage from './pages/partners/PartnersPage';
import PartnerFormPage from './pages/partners/PartnerFormPage';
import ServicePointsPage from './pages/service-points/ServicePointsPage';
import ServicePointFormPage from './pages/service-points/ServicePointFormPage';
import ServicePointDetailPage from './pages/service-points/ServicePointDetailPage';
import ServicePointPhotosPage from './pages/service-points/ServicePointPhotosPage';
import ServicePointServicesPage from './pages/service-points/ServicePointServicesPage';
import ServicesPage from './pages/services/ServicesPage';
import ClientsPage from './pages/clients/ClientsPage';
import BookingsPage from './pages/bookings/BookingsPage';
import BookingFormPage from './pages/bookings/BookingFormPage';
import SettingsPage from './pages/settings/SettingsPage';
import ProfilePage from './pages/profile/ProfilePage';
import UsersPage from './pages/users/UsersPage';
import UserForm from './pages/users/UserForm';
import { useSelector } from 'react-redux';
import { RootState } from './store';
import RegionsPage from './pages/catalog/RegionsPage';
import CitiesPage from './pages/catalog/CitiesPage';
import CarBrandsPage from './pages/car-brands/CarBrandsPage';
import CarModelsPage from './pages/car-models/CarModelsPage';

// Компонент для защищенных маршрутов
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { isAuthenticated, token, user, isInitialized, loading } = useSelector((state: RootState) => state.auth);
  
  // Если приложение еще не инициализировано, показываем загрузку
  if (!isInitialized) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column'
      }}>
        <div style={{ marginBottom: '20px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #1976d2',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
        </div>
        <div style={{ color: '#666', fontSize: '16px' }}>
          Проверка аутентификации...
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Проверяем аутентификацию после инициализации
  const hasValidAuth = isAuthenticated && token && user;
  
  console.log('ProtectedRoute check:', { 
    isAuthenticated, 
    hasToken: !!token,
    hasUser: !!user,
    isInitialized,
    loading,
    hasValidAuth
  });
  
  return hasValidAuth ? <>{children}</> : <Navigate to="/login" />;
};

// Создание темы Material UI
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f50057',
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthInitializer>
          <Router>
            <Routes>
              {/* Публичные маршруты */}
              <Route path="/login" element={<LoginPage />} />
              
              {/* Защищенные маршруты в главном лейауте */}
              <Route path="/" element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                {/* Маршруты для партнеров */}
                <Route path="partners" element={<PartnersPage />} />
                <Route path="partners/new" element={<PartnerFormPage />} />
                <Route path="partners/:id/edit" element={<PartnerFormPage />} />
                <Route path="partners/:id/service-points" element={<ServicePointsPage />} />
                <Route path="partners/:partnerId/service-points/:id/edit" element={<ServicePointFormPage />} />
                {/* Маршруты для сервисных точек */}
                <Route path="service-points" element={<ServicePointsPage />} />
                <Route path="service-points/new" element={<ServicePointFormPage />} />
                <Route path="service-points/:id" element={<ServicePointDetailPage />} />
                <Route path="service-points/:id/edit" element={<ServicePointFormPage />} />
                <Route path="service-points/:id/photos" element={<ServicePointPhotosPage />} />
                <Route path="service-points/:id/services" element={<ServicePointServicesPage />} />
                {/* Маршруты для клиентов */}
                <Route path="clients" element={<ClientsPage />} />
                <Route path="clients/new" element={<div>Создание клиента (в разработке)</div>} />
                <Route path="clients/:id" element={<div>Информация о клиенте (в разработке)</div>} />
                <Route path="clients/:id/edit" element={<div>Редактирование клиента (в разработке)</div>} />
                {/* Маршруты для бронирований */}
                <Route path="bookings" element={<BookingsPage />} />
                <Route path="bookings/new" element={<BookingFormPage />} />
                <Route path="bookings/:id/edit" element={<BookingFormPage />} />
                <Route path="bookings/:id" element={<div>Детали бронирования (в разработке)</div>} />
                {/* Маршруты для брендов и моделей автомобилей */}
                <Route path="car-brands" element={<CarBrandsPage />} />
                <Route path="car-brands/new" element={<div>Создание бренда (в разработке)</div>} />
                <Route path="car-brands/:id/edit" element={<div>Редактирование бренда (в разработке)</div>} />
                <Route path="car-models" element={<CarModelsPage />} />
                <Route path="car-models/new" element={<div>Создание модели (в разработке)</div>} />
                <Route path="car-models/:id/edit" element={<div>Редактирование модели (в разработке)</div>} />
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
                {/* Маршруты для отчетов */}
                <Route path="analytics" element={<div>Аналитика и отчеты (в разработке)</div>} />
                <Route path="trip-history" element={<div>История поездок (в разработке)</div>} />
                {/* Маршрут для пользователей */}
                <Route path="users" element={<UsersPage />} />
                <Route path="users/create" element={<UserForm />} />
                <Route path="users/:id/edit" element={<UserForm />} />
                <Route path="users/:id" element={<div>Информация о пользователе (в разработке)</div>} />
                {/* Другие маршруты */}
                <Route path="settings" element={<SettingsPage />} />
                <Route path="profile" element={<ProfilePage />} />
                {/* Справочники */}
                <Route path="regions" element={<RegionsPage />} />
                <Route path="cities" element={<CitiesPage />} />
              </Route>
              
              {/* Маршрут по умолчанию */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Router>
        </AuthInitializer>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
