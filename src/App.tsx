import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { Provider } from 'react-redux';
import { store } from './store';
import MainLayout from './components/layouts/MainLayout';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import PartnersPage from './pages/partners/PartnersPage';
import PartnerFormPage from './pages/partners/PartnerFormPage';
import ServicePointsPage from './pages/service-points/ServicePointsPage';
import ServicePointFormPage from './pages/service-points/ServicePointFormPage';
import ServicePointDetailPage from './pages/service-points/ServicePointDetailPage';
import ServicePointPhotosPage from './pages/service-points/ServicePointPhotosPage';
import ClientsPage from './pages/clients/ClientsPage';
import BookingsPage from './pages/bookings/BookingsPage';
import BookingFormPage from './pages/bookings/BookingFormPage';
import SettingsPage from './pages/settings/SettingsPage';
import ProfilePage from './pages/profile/ProfilePage';
import UsersPage from './pages/users/UsersPage';
import UserForm from './pages/users/UserForm';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from './store';
import { getCurrentUser } from './store/slices/authSlice';

// Компонент для защищенных маршрутов
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { isAuthenticated, token, user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  
  // Проверяем сначала Redux состояние, затем localStorage
  const hasToken = !!localStorage.getItem('tvoya_shina_token');
  const isAuth = isAuthenticated || hasToken;
  
  console.log('ProtectedRoute check:', { 
    isAuthenticated, 
    hasToken, 
    hasUser: !!user,
    localStorageToken: localStorage.getItem('tvoya_shina_token'), 
    reduxToken: token,
    isAuth 
  });
  
  // Если есть токен, но нет данных пользователя, загружаем их
  useEffect(() => {
    if (hasToken && !user) {
      console.log('ProtectedRoute: есть токен, но нет данных пользователя. Загружаем данные...');
      dispatch(getCurrentUser());
    }
  }, [hasToken, user, dispatch]);
  
  return isAuth ? <>{children}</> : <Navigate to="/login" />;
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
              <Route path="partners/create" element={<PartnerFormPage />} />
              <Route path="partners/:id/edit" element={<PartnerFormPage />} />
              <Route path="partners/:id/service-points" element={<ServicePointsPage />} />
              <Route path="partners/:partnerId/service-points/:id/edit" element={<ServicePointFormPage />} />
              {/* Маршруты для сервисных точек */}
              <Route path="service-points" element={<ServicePointsPage />} />
              <Route path="service-points/create" element={<ServicePointFormPage />} />
              <Route path="service-points/:id" element={<ServicePointDetailPage />} />
              <Route path="service-points/:id/photos" element={<ServicePointPhotosPage />} />
              {/* Маршруты для клиентов */}
              <Route path="clients" element={<ClientsPage />} />
              <Route path="clients/:id" element={<div>Информация о клиенте (в разработке)</div>} />
              <Route path="clients/create" element={<div>Создание клиента (в разработке)</div>} />
              {/* Маршруты для бронирований */}
              <Route path="bookings" element={<BookingsPage />} />
              <Route path="bookings/new" element={<BookingFormPage />} />
              <Route path="bookings/:id/edit" element={<BookingFormPage />} />
              <Route path="bookings/:id" element={<div>Детали бронирования (в разработке)</div>} />
              {/* Маршруты для клиентских автомобилей */}
              <Route path="my-cars" element={<div>Мои автомобили (в разработке)</div>} />
              <Route path="my-cars/new" element={<div>Добавление нового автомобиля (в разработке)</div>} />
              <Route path="my-bookings" element={<div>Мои записи на шиномонтаж (в разработке)</div>} />
              {/* Маршруты для сервисных центров клиента */}
              <Route path="service-points/search" element={<div>Поиск центров (в разработке)</div>} />
              <Route path="service-points/favorites" element={<div>Избранные центры (в разработке)</div>} />
              {/* Маршруты для справочников */}
              <Route path="cars" element={<div>Управление автомобилями (в разработке)</div>} />
              <Route path="services" element={<div>Управление услугами (в разработке)</div>} />
              {/* Маршруты для отчетов */}
              <Route path="analytics" element={<div>Аналитика и отчеты (в разработке)</div>} />
              <Route path="trip-history" element={<div>История поездок (в разработке)</div>} />
              {/* Маршрут для пользователей */}
              <Route path="users" element={<UsersPage />} />
              <Route path="users/create" element={<UserForm />} />
              <Route path="users/:id/edit" element={<UserForm />} />
              {/* Другие маршруты */}
              <Route path="settings" element={<SettingsPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>
            
            {/* Маршрут по умолчанию */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
