import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { getCurrentUser, setInitialized, refreshAuthTokens } from '../../store/slices/authSlice';
import { LoadingScreen } from '../LoadingScreen';

/**
 * Компонент для инициализации аутентификации при загрузке приложения
 * Проверяет наличие HttpOnly cookie с refresh токеном и восстанавливает состояние аутентификации
 */
const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading, isInitialized, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const initializationStarted = useRef(false);

  useEffect(() => {
    const initializeAuth = async () => {
      if (!initializationStarted.current && !isInitialized) {
        initializationStarted.current = true;
        
        const hasRefreshCookie = document.cookie.includes('refresh_token=');
        
        console.log('AuthInitializer: Проверяем состояние', {
          hasRefreshCookie,
          hasUserInState: !!user,
          isAuthenticated,
          loading,
          isInitialized
        });

        // Если есть refresh cookie, но нет пользователя в состоянии,
        // пытаемся восстановить сессию
        if (hasRefreshCookie && !user) {
          try {
            console.log('AuthInitializer: Обнаружен refresh cookie, пытаемся восстановить сессию');
            
            // Пытаемся получить новый access token через refresh
            await dispatch(refreshAuthTokens()).unwrap();
            console.log('AuthInitializer: Refresh токен успешно обновлен');
            
            // Теперь получаем данные пользователя с новым токеном
            await dispatch(getCurrentUser()).unwrap();
            console.log('AuthInitializer: Сессия восстановлена через refresh cookie');
          } catch (error) {
            console.log('AuthInitializer: Ошибка восстановления сессии через refresh cookie', error);
            // Cookie будет автоматически очищен, если refresh не удался
            dispatch(setInitialized());
          }
        } else if (!hasRefreshCookie && user) {
          // Если нет refresh cookie, но есть пользователь в состоянии - очищаем состояние
          console.log('AuthInitializer: Нет refresh cookie, очищаем состояние пользователя');
          // Очистим cookies через вызов logout API или просто установим инициализацию
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
  }, [dispatch, user, loading, isInitialized, isAuthenticated]);

  if (!isInitialized || loading) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
};

export default AuthInitializer;