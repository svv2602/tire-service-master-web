import React, { useState } from 'react';
import { Button, CircularProgress, Alert, Box } from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { setCredentials } from '../../store/slices/authSlice';
import { clearAllCacheData } from '../../api/baseApi';
import { UserRole } from '../../types/user-role';

interface GoogleLoginButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  variant?: 'contained' | 'outlined';
  fullWidth?: boolean;
  disabled?: boolean;
}

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({
  onSuccess,
  onError,
  variant = 'outlined',
  fullWidth = true,
  disabled = false
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Получаем Google Client ID из переменных окружения
  const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  // Функция для обработки Google OAuth ответа
  const handleGoogleResponse = async (response: any) => {
    try {
      setIsLoading(true);
      setError('');
      
      console.log('🔐 Google OAuth response (полный объект):', response);
      console.log('🔐 Google OAuth response credential:', response.credential);
      console.log('🔐 Google OAuth response clientId:', response.clientId);
      
      // Google One Tap возвращает credential (JWT токен), который нужно декодировать
      let userInfo = {};
      if (response.credential) {
        // Декодируем JWT токен (только payload, без проверки подписи для отладки)
        try {
          const base64Payload = response.credential.split('.')[1];
          const decodedPayload = JSON.parse(atob(base64Payload));
          console.log('🔍 Декодированный Google JWT:', decodedPayload);
          
          userInfo = {
            provider_user_id: decodedPayload.sub,
            email: decodedPayload.email,
            first_name: decodedPayload.given_name || decodedPayload.name?.split(' ')[0] || '',
            last_name: decodedPayload.family_name || decodedPayload.name?.split(' ').slice(1).join(' ') || ''
          };
        } catch (decodeError) {
          console.error('❌ Ошибка декодирования JWT:', decodeError);
          // Fallback: используем данные как есть
          userInfo = {
            provider_user_id: response.sub || 'unknown',
            email: response.email || '',
            first_name: response.given_name || response.name?.split(' ')[0] || '',
            last_name: response.family_name || response.name?.split(' ').slice(1).join(' ') || ''
          };
        }
      }
      
      const requestData = {
        provider: 'google',
        token: response.credential,
        ...userInfo
      };
      
      console.log('📤 Отправляем на backend:', requestData);
      
      // Отправляем токен на бэкенд для проверки и авторизации
      const apiResponse = await fetch('/api/v1/clients/social_auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Важно для HttpOnly куки
        body: JSON.stringify(requestData),
      });

      console.log('📥 Response status:', apiResponse.status);
      const data = await apiResponse.json();
      console.log('📥 Response data:', data);

      if (!apiResponse.ok) {
        throw new Error(data.error || t('auth.google.authError'));
      }

      console.log('✅ Google OAuth success:', data);

      // ✅ Очищаем кэш RTK Query при Google OAuth чтобы убрать данные предыдущего пользователя
      clearAllCacheData(dispatch);
      console.log('🧹 Кэш RTK Query очищен при Google OAuth');

      // Сохраняем данные пользователя в Redux
      dispatch(setCredentials({
        user: {
          ...data.user,
          role: data.user.role as UserRole,
          role_id: 1, // Временно, пока не обновим типы
          email_verified: true, // Google аккаунты считаются верифицированными
          phone_verified: false,
          created_at: data.user.created_at || new Date().toISOString(),
          updated_at: data.user.updated_at || new Date().toISOString()
        },
        accessToken: data.auth_token || data.token || null
      }));

      console.log('✅ Пользователь сохранен в Redux');

      // Успешная авторизация - убираем loading состояние
      setIsLoading(false);

      if (onSuccess) {
        onSuccess();
      } else {
        // Перенаправляем на клиентскую часть
        window.location.href = '/client';
      }

      return; // Важно! Выходим из функции при успехе

    } catch (err: any) {
      console.error('❌ Google OAuth error:', err);
      const errorMessage = err.message || t('auth.google.authError');
      setError(errorMessage);
      setIsLoading(false); // Убираем loading только при ошибке
      if (onError) {
        onError(errorMessage);
      }
    }
  };

  // Функция для инициализации Google OAuth
  const initializeGoogleOAuth = () => {
    if (typeof window === 'undefined' || !window.google) {
      console.error('Google OAuth SDK не загружен');
      setError(t('auth.google.authError'));
      setIsLoading(false);
      return;
    }

    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === 'your-google-client-id') {
      console.error('Google Client ID не настроен');
      setError('Google OAuth не настроен. Обратитесь к администратору.');
      setIsLoading(false);
      return;
    }

    try {
      console.log('🔧 Инициализируем Google OAuth с Client ID:', GOOGLE_CLIENT_ID);
      
      // Инициализируем Google OAuth
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response: any) => {
          console.log('🎯 Google OAuth callback вызван:', response);
          handleGoogleResponse(response);
        },
        auto_select: false,
        cancel_on_tap_outside: true,
        use_fedcm_for_prompt: false, // Отключаем FedCM для localhost
        context: 'signin',
        ux_mode: 'popup', // Используем popup вместо redirect
        login_uri: window.location.origin + '/login'
      });

      console.log('✅ Google OAuth инициализирован, показываем prompt');
      
      // Показываем всплывающее окно для входа - используем popup режим
      window.google.accounts.id.prompt((notification: any) => {
        console.log('📋 Google prompt notification:', notification);
        if (notification.isNotDisplayed()) {
          console.log('⚠️ Google prompt не показан - попробуем popup режим');
          // Если prompt не показан, пробуем popup
          showGooglePopup();
        } else if (notification.isSkippedMoment()) {
          console.log('⚠️ Google prompt пропущен пользователем');
          setIsLoading(false);
        } else if (notification.isDismissedMoment()) {
          console.log('⚠️ Google prompt закрыт пользователем');
          setIsLoading(false);
        }
      });

    } catch (err: any) {
      console.error('❌ Ошибка инициализации Google OAuth:', err);
      setError(t('auth.google.authError'));
      setIsLoading(false);
    }
  };

  // Функция для показа Google OAuth popup
  const showGooglePopup = () => {
    try {
      // Создаем кнопку Google для popup режима
      const buttonContainer = document.createElement('div');
      buttonContainer.style.display = 'none';
      document.body.appendChild(buttonContainer);

      window.google.accounts.id.renderButton(buttonContainer, {
        theme: 'outline',
        size: 'large',
        type: 'standard',
        text: 'continue_with',
        locale: 'ru'
      });

      // Программно кликаем по кнопке
      const googleButton = buttonContainer.querySelector('div[role="button"]') as HTMLElement;
      if (googleButton) {
        console.log('🖱️ Кликаем по Google кнопке программно');
        googleButton.click();
      } else {
        console.log('⚠️ Google кнопка не найдена, используем альтернативный метод');
        // Альтернативный способ через OAuth2
        initiateGoogleOAuth2Flow();
      }

      // Убираем временный контейнер
      setTimeout(() => {
        document.body.removeChild(buttonContainer);
      }, 1000);

    } catch (error) {
      console.error('❌ Ошибка показа Google popup:', error);
      setError('Ошибка открытия Google авторизации');
      setIsLoading(false);
    }
  };

  // Альтернативный метод через прямой OAuth2 flow
  const initiateGoogleOAuth2Flow = () => {
    if (!GOOGLE_CLIENT_ID) {
      setError('Google Client ID не настроен');
      setIsLoading(false);
      return;
    }

    const redirectUri = window.location.origin + '/login';
    const scope = 'openid email profile';
    const responseType = 'code';
    const state = Math.random().toString(36).substring(2, 15);

    const googleAuthUrl = `https://accounts.google.com/oauth/v2/auth?` +
      `client_id=${encodeURIComponent(GOOGLE_CLIENT_ID)}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent(scope)}&` +
      `response_type=${responseType}&` +
      `state=${state}&` +
      `access_type=offline&` +
      `prompt=consent`;

    console.log('🔀 Перенаправляем на Google OAuth2:', googleAuthUrl);
    window.location.href = googleAuthUrl;
  };

  // Обработчик клика по кнопке
  const handleGoogleLogin = () => {
    setError('');
    setIsLoading(true);

    // Проверяем настройку Client ID
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === 'your-google-client-id') {
      setError('Google OAuth не настроен. Обратитесь к администратору.');
      setIsLoading(false);
      return;
    }
    
    // Проверяем, загружен ли Google SDK
    if (typeof window !== 'undefined' && window.google) {
      initializeGoogleOAuth();
    } else {
      // Загружаем Google SDK если он не загружен
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.onload = () => {
        setTimeout(initializeGoogleOAuth, 100); // Небольшая задержка для инициализации
      };
      script.onerror = () => {
        setError(t('auth.google.authError'));
        setIsLoading(false);
      };
      document.head.appendChild(script);
    }
  };

  // Если Google Client ID не настроен, не показываем кнопку
  if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === 'your-google-client-id') {
    return (
      <Alert severity="info" sx={{ borderRadius: 1.5 }}>
        Google OAuth временно недоступен. Используйте вход по email или телефону.
      </Alert>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 1.5 }}>
          {error}
        </Alert>
      )}
      
      <Button
        variant={variant}
        fullWidth={fullWidth}
        disabled={disabled || isLoading}
        size="large"
        startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <GoogleIcon />}
        onClick={handleGoogleLogin}
        sx={{ 
          py: 1.5,
          borderRadius: 1.5,
          fontSize: '1rem',
          fontWeight: 500,
          textTransform: 'none',
          ...(variant === 'outlined' && {
            borderColor: '#4285f4',
            color: '#4285f4',
            '&:hover': {
              borderColor: '#3367d6',
              backgroundColor: 'rgba(66, 133, 244, 0.04)'
            }
          })
        }}
      >
        {isLoading ? t('auth.google.linking') : t('auth.google.signIn')}
      </Button>
    </Box>
  );
};

// Типы для Google OAuth API
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: (callback?: (notification: any) => void) => void;
          renderButton: (element: HTMLElement, config: any) => void;
          cancel: () => void;
        };
      };
    };
  }
}

export default GoogleLoginButton; 