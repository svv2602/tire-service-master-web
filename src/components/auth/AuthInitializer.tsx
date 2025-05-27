import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { getCurrentUser, setInitialized } from '../../store/slices/authSlice';
import { apiClient } from '../../api';
import config from '../../config';

const STORAGE_KEY = config.AUTH_TOKEN_STORAGE_KEY;

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

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem(STORAGE_KEY);
      
      if (storedToken) {
        // Устанавливаем токен в заголовки axios
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        
        // Если есть токен, но нет данных пользователя, пытаемся их получить
        if (!user) {
          console.log('AuthInitializer: Найден токен, загружаем данные пользователя...');
          try {
            await dispatch(getCurrentUser()).unwrap();
            console.log('AuthInitializer: Данные пользователя успешно загружены');
          } catch (error) {
            console.error('AuthInitializer: Ошибка при загрузке данных пользователя:', error);
            // Если не удалось получить данные пользователя, очищаем токен
            localStorage.removeItem(STORAGE_KEY);
            delete apiClient.defaults.headers.common['Authorization'];
          }
        } else {
          console.log('AuthInitializer: Данные пользователя уже есть в store');
        }
      } else {
        console.log('AuthInitializer: Токен не найден');
      }
      
      // Помечаем инициализацию как завершенную
      if (!isInitialized) {
        dispatch(setInitialized());
      }
    };

    // Запускаем инициализацию только если она еще не была выполнена
    if (!isInitialized) {
      initializeAuth();
    }
  }, [dispatch, user, isInitialized]);

  // Показываем загрузку только если идет процесс инициализации
  if (!isInitialized || (token && !user && loading)) {
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