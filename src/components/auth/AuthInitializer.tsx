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
  const { user, loading, isInitialized, isAuthenticated, accessToken } = useSelector((state: RootState) => state.auth);
  const initializationStarted = useRef(false);

  useEffect(() => {
    const initializeAuth = async () => {
      if (!initializationStarted.current && !isInitialized) {
        initializationStarted.current = true;

        // Если нет accessToken и пользователь не залогинен, всегда пробуем восстановить сессию через refresh
        if (!accessToken && !user) {
          try {
            console.log('AuthInitializer: Пробуем восстановить access token через refresh');
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
            } else {
              // Если refresh не сработал, просто инициализируемся
              dispatch(setInitialized());
            }
          } catch (error) {
            console.log('AuthInitializer: Ошибка восстановления сессии', error);
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
  }, [dispatch, user, loading, isInitialized, isAuthenticated, accessToken]);

  if (!isInitialized || loading) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
};

export default AuthInitializer;