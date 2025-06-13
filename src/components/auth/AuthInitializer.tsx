import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { getCurrentUser, setInitialized } from '../../store/slices/authSlice';
import { LoadingScreen } from '../LoadingScreen';

/**
 * Компонент для инициализации аутентификации при загрузке приложения
 * Проверяет наличие токена и восстанавливает состояние аутентификации
 */
const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { accessToken, user, loading, isInitialized } = useSelector((state: RootState) => state.auth);
  const initializationStarted = useRef(false);

  useEffect(() => {
    const initializeAuth = async () => {
      if (!initializationStarted.current) {
        initializationStarted.current = true;
        
        const hasStoredToken = !!localStorage.getItem('tvoya_shina_token');
        const hasStoredUser = !!localStorage.getItem('tvoya_shina_user');
        
        console.log('AuthInitializer: Проверяем состояние', {
          hasStoredToken,
          hasStoredUser,
          hasTokenInState: !!accessToken,
          hasUserInState: !!user,
          loading,
          isInitialized
        });

        if (hasStoredToken && !user) {
          try {
            await dispatch(getCurrentUser()).unwrap();
            console.log('AuthInitializer: Данные пользователя успешно получены');
          } catch (error) {
            console.log('AuthInitializer: Ошибка при получении данных пользователя');
          }
        } else if (!hasStoredToken) {
          console.log('AuthInitializer: Токен не найден, пользователь не аутентифицирован');
        }

        dispatch(setInitialized());
        console.log('AuthInitializer: Инициализация завершена');
      }
    };

    initializeAuth();
  }, [dispatch, accessToken, user]);

  if (!isInitialized || loading) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
};

export default AuthInitializer; 