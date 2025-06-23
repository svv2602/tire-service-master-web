import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { getCurrentUser, setInitialized, refreshAuthTokens, setCredentials } from '../../store/slices/authSlice';
import { LoadingScreen } from '../LoadingScreen';
import axios from 'axios';
import config from '../../config';

/**
 * Компонент для инициализации аутентификации при загрузке приложения
 * Проверяет наличие HttpOnly cookie с refresh токеном и восстанавливает состояние аутентификации
 */
const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading, isInitialized, isAuthenticated, accessToken } = useSelector((state: RootState) => state.auth);
  const initializationStarted = useRef(false);

  useEffect(() => {
    const initializeAuth = async () => {
      if (!initializationStarted.current && !isInitialized) {
        initializationStarted.current = true;
        
        // Проверка наличия refresh токена в куках (несколько вариантов имени куки)
        const hasRefreshCookie = document.cookie.includes('refresh_token=') || 
                                document.cookie.includes('_tire_service_refresh=') || 
                                document.cookie.includes('_session=');
        
        // Проверка наличия сохраненного токена в localStorage
        const savedToken = localStorage.getItem(config.AUTH_TOKEN_STORAGE_KEY);
        
        console.log('AuthInitializer: Проверяем состояние', {
          hasRefreshCookie,
          hasLocalStorageToken: !!savedToken,
          hasUserInState: !!user,
          hasAccessToken: !!accessToken,
          isAuthenticated,
          loading,
          isInitialized
        });

        // Если есть refresh cookie или сохраненный токен, пытаемся восстановить сессию
        if ((hasRefreshCookie || savedToken) && !user) {
          try {
            console.log('AuthInitializer: Обнаружен refresh cookie или token, пытаемся восстановить сессию');
            
            // Прямой запрос к API для проверки сессии
            const API_URL = `${config.API_URL}${config.API_PREFIX}`;
            const response = await axios.post(
              `${API_URL}/auth/refresh`,
              {},
              { 
                withCredentials: true,
                headers: { 'Content-Type': 'application/json' }
              }
            );
            
            if (response.data && (response.data.tokens?.access || response.data.access_token)) {
              const token = response.data.tokens?.access || response.data.access_token;
              console.log('AuthInitializer: Токен успешно обновлен');
              
              // Сохраняем токен в localStorage
              localStorage.setItem(config.AUTH_TOKEN_STORAGE_KEY, token);
              
              // Получаем данные пользователя
              const userResponse = await axios.get(
                `${API_URL}/auth/me`,
                {
                  withCredentials: true,
                  headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  }
                }
              );
              
              if (userResponse.data && userResponse.data.user) {
                console.log('AuthInitializer: Данные пользователя получены');
                
                // Устанавливаем данные пользователя и токен в Redux
                dispatch(setCredentials({ 
                  accessToken: token, 
                  user: userResponse.data.user 
                }));
              }
            }
          } catch (error) {
            console.log('AuthInitializer: Ошибка восстановления сессии', error);
            // Очищаем localStorage если refresh не удался
            localStorage.removeItem(config.AUTH_TOKEN_STORAGE_KEY);
            dispatch(setInitialized());
          }
        } else if (!hasRefreshCookie && !savedToken && user) {
          // Если нет refresh cookie и сохраненного токена, но есть пользователь в состоянии - очищаем состояние
          console.log('AuthInitializer: Нет refresh cookie и токена, очищаем состояние пользователя');
          localStorage.removeItem(config.AUTH_TOKEN_STORAGE_KEY);
          dispatch(setInitialized());
        } else {
          // Если нет refresh cookie и нет пользователя в состоянии - просто инициализируемся
          console.log('AuthInitializer: Инициализация без восстановления сессии');
          dispatch(setInitialized());
        }

        console.log('AuthInitializer: Инициализация завершена');
      }
    };

    initializeAuth();
  }, [dispatch, user, loading, isInitialized, isAuthenticated, accessToken]);

  if (!isInitialized || loading) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
};

export default AuthInitializer;