# Настройка Google OAuth для системы Tire Service

## 📋 Обзор

Google OAuth интегрирован в страницу `/login` и позволяет пользователям входить в систему через свой Google аккаунт.

## 🔧 Настройка Google Console

### 1. Создание проекта в Google Cloud Console

1. Перейдите в [Google Cloud Console](https://console.cloud.google.com/)
2. Создайте новый проект или выберите существующий
3. Включите **Google+ API** и **Google Identity Services**

### 2. Настройка OAuth 2.0

1. Перейдите в **APIs & Services** → **Credentials**
2. Нажмите **Create Credentials** → **OAuth 2.0 Client IDs**
3. Выберите тип приложения: **Web application**
4. Настройте разрешенные домены:
   - **Authorized JavaScript origins**:
     - `http://localhost:3008` (для разработки)
     - `https://yourdomain.com` (для продакшена)
   - **Authorized redirect URIs**:
     - `http://localhost:3008/login` (для разработки)
     - `https://yourdomain.com/login` (для продакшена)

### 3. Получение Client ID

После создания OAuth клиента вы получите:
- **Client ID** - используется во фронтенде
- **Client Secret** - используется в бэкенде (если нужен)

## 🌐 Настройка Frontend

### 1. Переменные окружения

Создайте файл `.env.local` в корне `tire-service-master-web/`:

```env
# Google OAuth Configuration
REACT_APP_GOOGLE_CLIENT_ID=ваш-google-client-id-здесь
```

### 2. Проверка интеграции

Google OAuth кнопка автоматически появится на странице `/login` если:
- Переменная `REACT_APP_GOOGLE_CLIENT_ID` настроена
- Client ID не равен `your-google-client-id`

Если Client ID не настроен, пользователи увидят информационное сообщение:
> "Google OAuth временно недоступен. Используйте вход по email или телефону."

## 🔧 Настройка Backend

### 1. Обновление социальной аутентификации

Backend уже поддерживает Google OAuth через endpoint:
```
POST /api/v1/clients/social_auth
```

### 2. Параметры запроса

```json
{
  "provider": "google",
  "token": "google-oauth-token",
  "provider_user_id": "google-user-id",
  "email": "user@example.com",
  "first_name": "Имя",
  "last_name": "Фамилия"
}
```

### 3. Проверка токена (опционально)

Для дополнительной безопасности можно добавить проверку Google токена:

```ruby
# В ClientsController#social_auth
def verify_google_token(token)
  require 'net/http'
  require 'json'
  
  uri = URI("https://oauth2.googleapis.com/tokeninfo?id_token=#{token}")
  response = Net::HTTP.get_response(uri)
  
  if response.code == '200'
    JSON.parse(response.body)
  else
    nil
  end
end
```

## 🎨 UI компоненты

### GoogleLoginButton

Компонент находится в: `src/components/auth/GoogleLoginButton.tsx`

**Свойства:**
- `onSuccess?: () => void` - callback при успешной авторизации
- `onError?: (error: string) => void` - callback при ошибке
- `variant?: 'contained' | 'outlined'` - стиль кнопки
- `fullWidth?: boolean` - растянуть на всю ширину
- `disabled?: boolean` - отключить кнопку

**Использование:**
```tsx
<GoogleLoginButton 
  onSuccess={() => navigate('/client/profile')}
  onError={(error) => setError(error)}
  variant="outlined"
  fullWidth
/>
```

## 🔍 Отладка

### 1. Проверка в консоли браузера

- Ошибки загрузки Google SDK
- Проблемы с Client ID
- Ответы от API

### 2. Частые проблемы

1. **"The given client ID is not found"**
   - Проверьте правильность Client ID
   - Убедитесь что домен добавлен в Authorized origins

2. **"Provider's accounts list is empty"**
   - Пользователь не авторизован в Google
   - Нет доступных Google аккаунтов

3. **403 Forbidden**
   - Домен не добавлен в разрешенные
   - Неправильная настройка CORS

## 📱 Мобильные устройства

Google OAuth поддерживает мобильные браузеры, но может потребовать:
- Настройка дополнительных redirect URI
- Обработка popup блокировщиков
- Fallback для старых браузеров

## 🔐 Безопасность

1. **Client ID** - можно показывать публично
2. **Client Secret** - только для бэкенда, никогда не передавать во фронтенд
3. Всегда проверяйте токены на бэкенде
4. Используйте HTTPS в продакшене

## 📝 Логирование

Все действия Google OAuth логируются:
- Frontend: консоль браузера
- Backend: Rails логи
- Успешные входы сохраняются в базу данных

## 🚀 Готовность к продакшену

- [x] Frontend компонент готов
- [x] Backend API готов  
- [x] Переводы добавлены (RU/UK)
- [x] Обработка ошибок
- [ ] Настройка Google Console
- [ ] Переменные окружения
- [ ] Тестирование на продакшене 