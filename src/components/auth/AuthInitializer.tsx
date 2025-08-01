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

        // Если нет accessToken и пользователь не залогинен, пробуем восстановить сессию
        if (!accessToken && !user) {
          try {
            console.log('AuthInitializer: Пробуем восстановить access token через refresh');
            const API_URL = `${config.API_URL}${config.API_PREFIX}`;
            
            // Сначала пробуем refresh
            let token = null;
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
              console.log('AuthInitializer: Refresh не сработал, пробуем напрямую /auth/me');
            }

            // Пробуем получить данные пользователя (с токеном или без)
            try {
              const headers: any = {
                'Content-Type': 'application/json'
              };
              if (token) {
                headers['Authorization'] = `Bearer ${token}`;
              }

              const userResponse = await axios.get(
                `${API_URL}/auth/me`,
                {
                  withCredentials: true,
                  headers
                }
              );
              
              if (userResponse.data && userResponse.data.user) {
                console.log('AuthInitializer: Данные пользователя получены:', userResponse.data.user.email);
                
                // Объединяем данные пользователя с данными роли (partner, operator, client)
                const enhancedUser = {
                  ...userResponse.data.user,
                  // Добавляем данные партнера, если они есть
                  partner: userResponse.data.partner || userResponse.data.user.partner,
                  // Добавляем данные оператора, если они есть
                  operator: userResponse.data.operator || userResponse.data.user.operator,
                  // Добавляем данные клиента, если они есть
                  client: userResponse.data.client || userResponse.data.user.client
                };
                
                console.log('AuthInitializer: Расширенные данные пользователя:', {
                  email: enhancedUser.email,
                  role: enhancedUser.role,
                  partner: enhancedUser.partner,
                  operator: enhancedUser.operator,
                  client: enhancedUser.client
                });
                
                // Устанавливаем данные пользователя и токен в Redux
                dispatch(setCredentials({
                  accessToken: token, // может быть null, это нормально при cookie-auth
                  user: enhancedUser
                }));
              } else {
                console.log('AuthInitializer: Данные пользователя не получены');
                dispatch(setInitialized());
              }
            } catch (userError) {
              console.log('AuthInitializer: Ошибка получения данных пользователя:', userError);
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