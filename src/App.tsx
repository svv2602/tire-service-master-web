import React from 'react';
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
import SettingsPage from './pages/settings/SettingsPage';
import ProfilePage from './pages/profile/ProfilePage';

// Компонент для защищенных маршрутов
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('tvoya_shina_token');
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
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
              <Route path="bookings/:id" element={<div>Детали бронирования (в разработке)</div>} />
              <Route path="bookings/create" element={<div>Создание бронирования (в разработке)</div>} />
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
