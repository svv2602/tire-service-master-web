import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { clearLogoutFlag } from '../../store/slices/authSlice';
import { useTheme } from '@mui/material';
import {
  Container
} from '../../components/ui';
import {
  getContainerStyles
} from '../../styles';
import ClientLayout from '../../components/client/ClientLayout';
import { UserRole } from '../../types';
import UniversalLoginForm from '../../components/auth/UniversalLoginForm';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const isNavigatingRef = useRef(false);
  
  const theme = useTheme();
  const containerStyles = getContainerStyles(theme);
  
  // Сбрасываем флаг выхода при загрузке страницы входа
  useEffect(() => {
    dispatch(clearLogoutFlag());
  }, [dispatch]);

  // Отключаем форму, если пользователь уже аутентифицирован  
  useEffect(() => {
    if (isAuthenticated && !isNavigatingRef.current) {
      console.log('User is authenticated, navigating based on role');
      isNavigatingRef.current = true;
      
      // Определяем путь по умолчанию в зависимости от роли пользователя
      let defaultPath = '/client/profile';
      if (user) {
        // Если роль админ, партнер, менеджер или оператор - идем в админку
        const isAdminRole = user.role === UserRole.ADMIN || 
                           user.role === UserRole.PARTNER || 
                           user.role === UserRole.MANAGER || 
                           user.role === UserRole.OPERATOR;
        
        if (isAdminRole) {
          defaultPath = '/admin/dashboard';
          console.log('Admin/Partner/Manager/Operator user, redirecting to admin dashboard');
        } else {
          console.log('Client user, redirecting to client profile');
        }
      }
      
      const returnPath = sessionStorage.getItem('returnPath') || defaultPath;
      sessionStorage.removeItem('returnPath');
      
      console.log('Navigating to:', returnPath, 'User role:', user?.role);
      navigate(returnPath, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleSkipLogin = () => {
    // Переходим на главную страницу
    navigate('/client');
  };

  return (
    <ClientLayout>
      <Container 
        maxWidth="sm" 
        sx={containerStyles.centerContent}
      >
        <UniversalLoginForm 
          showRegisterLink={true}
          onSwitchToRegister={() => navigate('/auth/register')}
          showSkipButton={true}
          onSkip={handleSkipLogin}
        />
      </Container>
    </ClientLayout>
  );
};

export default LoginPage;