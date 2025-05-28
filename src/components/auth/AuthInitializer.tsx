import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { getCurrentUser } from '../../store/authSlice';
import { apiClient } from '../../api';

const STORAGE_KEY = 'token';
const USER_STORAGE_KEY = 'user';

interface AuthInitializerProps {
  children: React.ReactNode;
}

/**
 * Компонент для инициализации аутентификации при загрузке приложения
 * Проверяет наличие токена и восстанавливает состояние аутентификации
 */
const AuthInitializer: React.FC<AuthInitializerProps> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { token, user, loading } = useSelector((state: RootState) => state.auth);
  const initializationStarted = useRef(false);

  useEffect(() => {
    const initializeAuth = async () => {
      // Предотвращаем повторную инициализацию
      if (initializationStarted.current || loading) {
        console.log('AuthInitializer: Инициализация уже выполнена или в процессе, пропускаем');
        return;
      }

      initializationStarted.current = true;

      const storedToken = localStorage.getItem(STORAGE_KEY);
      
      console.log('AuthInitializer: Начинаем инициализацию', {
        hasStoredToken: !!storedToken,
        hasTokenInState: !!token,
        hasUserInState: !!user,
        loading
      });
      
      if (storedToken && !user) {
        // Устанавливаем токен в заголовки axios
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        
        console.log('AuthInitializer: Загружаем данные пользователя с сервера...');
        try {
          await dispatch(getCurrentUser()).unwrap();
          console.log('AuthInitializer: Данные пользователя успешно загружены');
        } catch (error) {
          console.error('AuthInitializer: Ошибка при загрузке данных пользователя:', error);
          // Если не удалось получить данные пользователя, очищаем токен
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem(USER_STORAGE_KEY);
          delete apiClient.defaults.headers.common['Authorization'];
        }
      } else if (!storedToken) {
        console.log('AuthInitializer: Токен не найден, очищаем данные');
        localStorage.removeItem(USER_STORAGE_KEY);
      }
      
      console.log('AuthInitializer: Инициализация завершена');
    };

    // Запускаем инициализацию
    initializeAuth();
  }, [dispatch]);

  return <>{children}</>;
};

export default AuthInitializer; 