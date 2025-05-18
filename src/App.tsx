import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { Provider } from 'react-redux';
import { store } from './store';
import MainLayout from './components/layouts/MainLayout';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';

// Компонент для защищенных маршрутов
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('token');
  
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
              {/* Здесь будут другие маршруты */}
              <Route path="partners" element={<div>Партнеры (в разработке)</div>} />
              <Route path="service-points" element={<div>Точки обслуживания (в разработке)</div>} />
              <Route path="clients" element={<div>Клиенты (в разработке)</div>} />
              <Route path="bookings" element={<div>Бронирования (в разработке)</div>} />
              <Route path="settings" element={<div>Настройки (в разработке)</div>} />
              <Route path="profile" element={<div>Профиль (в разработке)</div>} />
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
