import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { getCurrentUser, setInitialized } from '../../store/authSlice';
import { apiClient } from '../../api';
import config from '../../config';

/**
 * Компонент для инициализации аутентификации при загрузке приложения
 * Проверяет наличие токена и восстанавливает состояние аутентификации
 */
const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { token, user, loading, isInitialized } = useSelector((state: RootState) => state.auth);
  const initializationStarted = useRef(false);

  useEffect(() => {
    const initializeAuth = async () => {
      // Предотвращаем повторную инициализацию
      if (initializationStarted.current || loading || isInitialized) {
        console.log('AuthInitializer: Инициализация уже выполнена или в процессе, пропускаем');
        return;
      }

      initializationStarted.current = true;
      const storedToken = localStorage.getItem(config.AUTH_TOKEN_STORAGE_KEY);
      
      console.log('AuthInitializer: Начинаем инициализацию', {
        hasStoredToken: !!storedToken,
        hasTokenInState: !!token,
        hasUserInState: !!user,
        loading,
        isInitialized
      });
      
      if (storedToken) {
        // Устанавливаем токен в заголовки axios
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        
        console.log('AuthInitializer: Загружаем данные пользователя с сервера...');
        try {
          await dispatch(getCurrentUser()).unwrap();
          console.log('AuthInitializer: Данные пользователя успешно загружены');
        } catch (error) {
          console.error('AuthInitializer: Ошибка при загрузке данных пользователя:', error);
          // Если не удалось получить данные пользователя, очищаем токен
          localStorage.removeItem(config.AUTH_TOKEN_STORAGE_KEY);
          delete apiClient.defaults.headers.common['Authorization'];
        }
      } else {
        console.log('AuthInitializer: Токен не найден, устанавливаем isInitialized');
        dispatch(setInitialized());
      }
      
      console.log('AuthInitializer: Инициализация завершена');
    };

    // Запускаем инициализацию
    initializeAuth();
  }, [dispatch, loading, isInitialized]);

  return <>{children}</>;
};

export default AuthInitializer; 