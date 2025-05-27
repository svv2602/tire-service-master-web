import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { getCurrentUser, setInitialized, setCredentials } from '../../store/slices/authSlice';
import { apiClient } from '../../api';
import config from '../../config';

const STORAGE_KEY = config.AUTH_TOKEN_STORAGE_KEY;
const USER_STORAGE_KEY = 'tvoya_shina_user';

interface AuthInitializerProps {
  children: React.ReactNode;
}

/**
 * Компонент для инициализации аутентификации при загрузке приложения
 * Проверяет наличие токена и восстанавливает состояние аутентификации
 */
const AuthInitializer: React.FC<AuthInitializerProps> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { token, user, isInitialized, loading } = useSelector((state: RootState) => state.auth);
  const initializationStarted = useRef(false);

  useEffect(() => {
    const initializeAuth = async () => {
      // Предотвращаем повторную инициализацию (React Strict Mode)
      if (initializationStarted.current || loading || isInitialized) {
        console.log('AuthInitializer: Инициализация уже выполнена или в процессе, пропускаем');
        return;
      }

      initializationStarted.current = true;

      const storedToken = localStorage.getItem(STORAGE_KEY);
      const storedUser = localStorage.getItem(USER_STORAGE_KEY);
      
      console.log('AuthInitializer: Начинаем инициализацию', {
        hasStoredToken: !!storedToken,
        hasStoredUser: !!storedUser,
        hasTokenInState: !!token,
        hasUserInState: !!user,
        isInitialized,
        loading
      });
      
      if (storedToken) {
        // Устанавливаем токен в заголовки axios
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        
        // Если есть сохраненные данные пользователя, восстанавливаем их в Redux
        if (storedUser && !user) {
          try {
            const parsedUser = JSON.parse(storedUser);
            console.log('AuthInitializer: Восстанавливаем данные из localStorage');
            dispatch(setCredentials({ token: storedToken, user: parsedUser }));
            dispatch(setInitialized());
            return;
          } catch (error) {
            console.error('AuthInitializer: Ошибка при парсинге данных пользователя:', error);
            localStorage.removeItem(USER_STORAGE_KEY);
          }
        }
        
        // Если нет данных пользователя в localStorage или в Redux, пытаемся их получить
        if (!user) {
          console.log('AuthInitializer: Загружаем данные пользователя с сервера...');
          try {
            const userResult = await dispatch(getCurrentUser()).unwrap();
            console.log('AuthInitializer: Данные пользователя успешно загружены, устанавливаем в store');
            // Важно! Устанавливаем токен в Redux store после успешной загрузки пользователя
            dispatch(setCredentials({ token: storedToken, user: userResult }));
          } catch (error) {
            console.error('AuthInitializer: Ошибка при загрузке данных пользователя:', error);
            // Если не удалось получить данные пользователя, очищаем токен
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem(USER_STORAGE_KEY);
            delete apiClient.defaults.headers.common['Authorization'];
          }
        } else {
          console.log('AuthInitializer: Данные пользователя уже есть в store');
          // Если пользователь есть, но токена нет в store, устанавливаем его
          if (!token) {
            console.log('AuthInitializer: Устанавливаем токен в store');
            dispatch(setCredentials({ token: storedToken, user }));
          }
        }
      } else {
        console.log('AuthInitializer: Токен не найден, очищаем данные');
        // Очищаем данные пользователя если нет токена
        localStorage.removeItem(USER_STORAGE_KEY);
      }
      
      // Помечаем инициализацию как завершенную
      console.log('AuthInitializer: Инициализация завершена');
      dispatch(setInitialized());
    };

    // Запускаем инициализацию только если она еще не была выполнена
    if (!isInitialized && !loading && !initializationStarted.current) {
      initializeAuth();
    }
  }, [dispatch, user, isInitialized, token, loading]);

  // Экран загрузки отключен для избежания мигания при быстрой инициализации
  const shouldShowLoading = false;

  if (shouldShowLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column'
      }}>
        <div style={{ marginBottom: '20px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #1976d2',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
        </div>
        <div style={{ color: '#666', fontSize: '16px' }}>
          Инициализация приложения...
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthInitializer; 