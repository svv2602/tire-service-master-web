import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { setInitialized, setCredentials } from '../../store/slices/authSlice';
import { LoadingScreen } from '../LoadingScreen';
import axios from 'axios';
import config from '../../config';

/**
 * Компонент для инициализации аутентификации при загрузке приложения
 * Всегда пробует восстановить accessToken через refresh, если пользователь не залогинен
 */
const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading, isInitialized, isAuthenticated, accessToken, hasLoggedOut } = useSelector((state: RootState) => state.auth);
  const initializationStarted = useRef(false);

  useEffect(() => {
    const initializeAuth = async () => {
      if (!initializationStarted.current && !isInitialized) {
        initializationStarted.current = true;

        // Если пользователь явно вышел из системы, не пытаемся восстановить сессию
        if (hasLoggedOut) {
          console.log('AuthInitializer: Пользователь явно вышел из системы, пропускаем восстановление сессии');
          dispatch(setInitialized());
          return;
        }

        // Если пользователь не залогинен, пробуем восстановить сессию через cookies
        if (!user) {
          try {
            console.log('AuthInitializer: Пробуем восстановить сессию через HttpOnly cookies');
            const API_URL = `${config.API_URL}${config.API_PREFIX}`;
            
            // Сначала пробуем напрямую получить данные пользователя через cookies
            let token = null;
            try {
              console.log('AuthInitializer: Пробуем получить данные пользователя через cookies');
              const userResponse = await axios.get(
                `${API_URL}/auth/me`,
                {
                  withCredentials: true,
                  headers: { 'Content-Type': 'application/json' }
                }
              );
              
              if (userResponse.data && userResponse.data.user) {
                console.log('AuthInitializer: Данные пользователя получены через cookies:', userResponse.data.user.email);
                
                // Объединяем данные пользователя с данными роли
                const enhancedUser = {
                  ...userResponse.data.user,
                  partner: userResponse.data.partner || userResponse.data.user.partner,
                  operator: userResponse.data.operator || userResponse.data.user.operator,
                  client: userResponse.data.client || userResponse.data.user.client
                };
                
                // Устанавливаем данные пользователя (без токена, так как используем cookies)
                dispatch(setCredentials({
                  accessToken: null, // При cookie-auth токен не нужен
                  user: enhancedUser
                }));
                return; // Успешно получили данные, выходим
              }
            } catch (directError) {
              console.log('AuthInitializer: Прямое получение данных через cookies не сработало, пробуем refresh');
              
              // Если прямое получение не сработало, пробуем refresh
              try {
                const response = await axios.post(
                  `${API_URL}/auth/refresh`,
                  {},
                  {
                    withCredentials: true,
                    headers: { 'Content-Type': 'application/json' }
                  }
                );
                if (response.data && (response.data.tokens?.access || response.data.access_token)) {
                  token = response.data.tokens?.access || response.data.access_token;
                  console.log('AuthInitializer: Токен успешно обновлен через refresh');
                }
              } catch (refreshError) {
                console.log('AuthInitializer: Refresh не сработал, пользователь не авторизован');
                dispatch(setInitialized());
                return;
              }
            }

            // Если после refresh у нас есть токен, пробуем получить данные пользователя
            if (token) {
              try {
                const userResponse = await axios.get(
                  `${API_URL}/auth/me`,
                  {
                    withCredentials: true,
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`
                    }
                  }
                );
                
                if (userResponse.data && userResponse.data.user) {
                  console.log('AuthInitializer: Данные пользователя получены через refresh токен:', userResponse.data.user.email);
                  
                  // Объединяем данные пользователя с данными роли
                  const enhancedUser = {
                    ...userResponse.data.user,
                    partner: userResponse.data.partner || userResponse.data.user.partner,
                    operator: userResponse.data.operator || userResponse.data.user.operator,
                    client: userResponse.data.client || userResponse.data.user.client
                  };
                  
                  // Устанавливаем данные пользователя и токен в Redux
                  dispatch(setCredentials({
                    accessToken: token,
                    user: enhancedUser
                  }));
                } else {
                  console.log('AuthInitializer: Данные пользователя не получены после refresh');
                  dispatch(setInitialized());
                }
              } catch (userError) {
                console.log('AuthInitializer: Ошибка получения данных пользователя после refresh:', userError);
                dispatch(setInitialized());
              }
            } else {
              console.log('AuthInitializer: Токен не получен, пользователь не авторизован');
              dispatch(setInitialized());
            }
          } catch (error) {
            console.log('AuthInitializer: Общая ошибка инициализации:', error);
            dispatch(setInitialized());
          }
        } else {
          // Если accessToken или пользователь уже есть, просто инициализируемся
          dispatch(setInitialized());
        }
        console.log('AuthInitializer: Инициализация завершена');
      }
    };
    initializeAuth();
  }, [dispatch, user, loading, isInitialized, isAuthenticated, accessToken, hasLoggedOut]);

  if (!isInitialized || loading) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
};

export default AuthInitializer;