import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { getCurrentUser, setInitialized, logout } from '../../store/authSlice';
import { apiClient } from '../../api';
import config from '../../config';
import { logAuthDiagnostic, checkAuthState } from '../../utils/authMonitor';

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
      // Логируем диагностическую информацию
      logAuthDiagnostic();
      const diagnostic = checkAuthState();
      
      const storedToken = localStorage.getItem(config.AUTH_TOKEN_STORAGE_KEY);
      const storedUser = localStorage.getItem('tvoya_shina_user');
      
      console.log('AuthInitializer: Проверяем состояние', {
        hasStoredToken: !!storedToken,
        hasStoredUser: !!storedUser,
        hasTokenInState: !!token,
        hasUserInState: !!user,
        loading,
        isInitialized,
        initializationStarted: initializationStarted.current,
        diagnostic: diagnostic.isConsistent ? 'консистентно' : 'есть проблемы'
      });

      // Если инициализация уже завершена и состояние корректное, пропускаем
      if (isInitialized && token && user && !loading) {
        // Дополнительно проверяем синхронизацию localStorage
        if (!storedUser && user) {
          console.log('AuthInitializer: Синхронизируем пользователя с localStorage');
          localStorage.setItem('tvoya_shina_user', JSON.stringify(user));
        }
        console.log('AuthInitializer: Инициализация завершена, состояние корректное');
        return;
      }

      // Если инициализация уже идет, не запускаем повторно
      if (initializationStarted.current && loading) {
        console.log('AuthInitializer: Инициализация уже в процессе, ожидаем');
        return;
      }

      // Если есть и токен и пользователь в состоянии, но инициализация не завершена
      if (token && user && !isInitialized && !loading) {
        console.log('AuthInitializer: Состояние корректное, завершаем инициализацию');
        dispatch(setInitialized());
        // Синхронизируем localStorage если нужно
        if (!storedUser) {
          localStorage.setItem('tvoya_shina_user', JSON.stringify(user));
        }
        return;
      }

      initializationStarted.current = true;
      
      // Случай 1: Есть токен в localStorage, но нет данных пользователя
      if (storedToken && (!storedUser || !user)) {
        console.log('AuthInitializer: Есть токен, но нет данных пользователя - загружаем с сервера');
        
        // Устанавливаем токен в заголовки axios
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        
        try {
          await dispatch(getCurrentUser()).unwrap();
          console.log('AuthInitializer: Данные пользователя успешно загружены с сервера');
        } catch (error) {
          console.error('AuthInitializer: Ошибка при загрузке данных пользователя:', error);
          // Если токен недействителен, очищаем все данные
          console.log('AuthInitializer: Очищаем недействительные данные аутентификации');
          dispatch(logout());
        }
      }
      // Случай 2: Есть и токен и пользователь в localStorage, но не в состоянии
      else if (storedToken && storedUser && (!token || !user)) {
        console.log('AuthInitializer: Восстанавливаем состояние из localStorage');
        
        try {
          // Восстанавливаем токен в заголовки
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          
          // Проверяем валидность токена запросом к серверу
          await dispatch(getCurrentUser()).unwrap();
          console.log('AuthInitializer: Состояние успешно восстановлено из localStorage');
        } catch (error) {
          console.error('AuthInitializer: Сохраненный токен недействителен:', error);
          dispatch(logout());
        }
      }
      // Случай 3: Нет токена - пользователь не аутентифицирован
      else if (!storedToken) {
        console.log('AuthInitializer: Токен не найден, пользователь не аутентифицирован');
        dispatch(setInitialized());
      }
      // Случай 4: Все данные есть - проверяем их актуальность
      else if (storedToken && storedUser && token && user) {
        console.log('AuthInitializer: Все данные есть, проверяем актуальность токена');
        
        // Проверяем токен периодически
        try {
          await dispatch(getCurrentUser()).unwrap();
          dispatch(setInitialized());
          console.log('AuthInitializer: Токен действителен, инициализация завершена');
        } catch (error) {
          console.error('AuthInitializer: Токен истек или недействителен:', error);
          dispatch(logout());
        }
      }
      
      console.log('AuthInitializer: Инициализация завершена');
      initializationStarted.current = false; // Сбрасываем флаг для возможности повторной инициализации
    };

    // Запускаем инициализацию
    initializeAuth();
  }, [dispatch, token, user, loading, isInitialized]);

  return <>{children}</>;
};

export default AuthInitializer; 