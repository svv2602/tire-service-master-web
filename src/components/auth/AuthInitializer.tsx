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
        
        const hasStoredUser = !!localStorage.getItem('tvoya_shina_user');
        
        console.log('AuthInitializer: Проверяем состояние', {
          hasStoredUser,
          hasTokenInState: !!accessToken,
          hasUserInState: !!user,
          loading,
          isInitialized
        });

        // Токены не хранятся в localStorage для безопасности
        // Если есть пользователь в localStorage, но нет токена в состоянии,
        // пытаемся получить пользователя через API (используя refresh токен из cookies)
        if (hasStoredUser && !accessToken && !user) {
          try {
            console.log('AuthInitializer: Пытаемся восстановить сессию через refresh токен');
            await dispatch(getCurrentUser()).unwrap();
            console.log('AuthInitializer: Сессия успешно восстановлена');
          } catch (error) {
            console.log('AuthInitializer: Ошибка восстановления сессии, очищаем localStorage');
            localStorage.removeItem('tvoya_shina_user');
          }
        } else if (!hasStoredUser) {
          console.log('AuthInitializer: Пользователь не найден в localStorage');
        }

        dispatch(setInitialized());
        console.log('AuthInitializer: Инициализация завершена');
      }
    };

    initializeAuth();
  }, [dispatch, accessToken, user, loading, isInitialized]);

  if (!isInitialized || loading) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
};

export default AuthInitializer; 