import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { getCurrentUser, setInitialized, refreshAuthTokens } from '../../store/slices/authSlice';
import { LoadingScreen } from '../LoadingScreen';

/**
 * Компонент для инициализации аутентификации при загрузке приложения
 * Проверяет наличие токена и восстанавливает состояние аутентификации
 */
const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading, isInitialized, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const initializationStarted = useRef(false);

  useEffect(() => {
    const initializeAuth = async () => {
      if (!initializationStarted.current && !isInitialized) {
        initializationStarted.current = true;
        
        const hasStoredUser = !!localStorage.getItem('tvoya_shina_user');
        
        console.log('AuthInitializer: Проверяем состояние', {
          hasStoredUser,
          hasUserInState: !!user,
          isAuthenticated,
          loading,
          isInitialized
        });

        // Если есть пользователь в localStorage, но нет в состоянии,
        // пытаемся восстановить сессию через API (используя refresh токены из HttpOnly cookies)
        if (hasStoredUser && !user) {
          try {
            console.log('AuthInitializer: Пытаемся восстановить сессию через HttpOnly cookies');
            
            // Сначала пытаемся обновить токен через refresh endpoint
            await dispatch(refreshAuthTokens()).unwrap();
            console.log('AuthInitializer: Refresh токен успешно обновлен');
            
            // Теперь получаем данные пользователя с новым токеном
            await dispatch(getCurrentUser()).unwrap();
            console.log('AuthInitializer: Сессия успешно восстановлена');
          } catch (error) {
            console.log('AuthInitializer: Ошибка восстановления сессии, очищаем localStorage', error);
            localStorage.removeItem('tvoya_shina_user');
            dispatch(setInitialized());
          }
        } else {
          // Если нет сохраненных данных или уже есть данные в состоянии
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