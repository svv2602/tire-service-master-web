# 🔍 ОТЧЕТ: ОТЛАДКА ПРОБЛЕМЫ 404 ПРИ ВХОДЕ В СИСТЕМУ

## 📋 ПРОБЛЕМА
Фронтенд получает **404 (Not Found)** при попытке входа в систему, хотя API работает корректно через curl.

## 🔍 ДОБАВЛЕННОЕ ЛОГИРОВАНИЕ

### 1. BaseAPI (baseApi.ts)
```typescript
// Логирование в prepareHeaders
console.log('🔍 BaseAPI prepareHeaders:', {
  hasAccessToken: !!token,
  isAuthenticated: state.auth.isAuthenticated,
  hasUser: !!user,
  userRole: user?.role,
  tokenPreview: token ? `${token.substring(0, 20)}...` : 'отсутствует (используются cookies)',
  baseUrl: `${config.API_URL}${config.API_PREFIX}/`,
  headersCount: headers.entries ? Array.from(headers.entries()).length : 'unknown'
});

// Логирование запросов
console.log('🚀 BaseAPI запрос:', {
  url: typeof args === 'string' ? args : args.url,
  method: typeof args === 'string' ? 'GET' : args.method || 'GET',
  body: typeof args === 'string' ? undefined : args.body,
  fullUrl: `${config.API_URL}${config.API_PREFIX}/${typeof args === 'string' ? args : args.url}`,
  timestamp: new Date().toISOString()
});

// Логирование ответов
console.log('📥 BaseAPI ответ:', {
  status: result.error?.status || 'success',
  hasError: !!result.error,
  hasData: !!result.data,
  errorData: result.error?.data,
  timestamp: new Date().toISOString()
});
```

### 2. Auth API (auth.api.ts)
```typescript
// Логирование в login endpoint
console.log('🔐 Auth API login запрос:', {
  originalCredentials: credentials,
  requestBody: requestData,
  url: 'auth/login',
  method: 'POST',
  timestamp: new Date().toISOString()
});

console.log('🚀 Auth API login: запрос отправлен с данными:', arg);
```

### 3. UniversalLoginForm (UniversalLoginForm.tsx)
```typescript
// Логирование в handleLogin
console.log('🔐 UniversalLoginForm handleLogin:', {
  loginType,
  login: login.trim(),
  passwordLength: password.trim().length,
  formValid: validateForm(),
  timestamp: new Date().toISOString()
});

console.log('🚀 Отправляем запрос на вход:', {
  loginData,
  mutationFunction: 'loginMutation',
  timestamp: new Date().toISOString()
});
```

## 📊 ОЖИДАЕМЫЕ ЛОГИ

При попытке входа в систему теперь должны появиться следующие логи:

1. **UniversalLoginForm**: Данные формы и валидация
2. **Auth API**: Подготовка запроса с телом `{ auth: { login, password } }`
3. **BaseAPI**: Полный URL запроса и детали
4. **BaseAPI**: Ответ от сервера с кодом ошибки

## 🔍 ЧТО ПРОВЕРИТЬ

### В консоли браузера ищите:
- 🔐 UniversalLoginForm handleLogin
- 🚀 Отправляем запрос на вход
- 🔐 Auth API login запрос
- 🚀 BaseAPI запрос
- 📥 BaseAPI ответ

### Особое внимание на:
- **fullUrl**: должен быть `http://localhost:8000/api/v1/auth/login`
- **requestBody**: должен быть `{ auth: { login: "0000001111", password: "0000001111" } }`
- **status**: должен показать реальную причину 404

## ✅ ПРОВЕРЕННЫЕ ФАКТЫ

1. **API работает**: `curl -X POST http://localhost:8000/api/v1/auth/login` возвращает 200 OK
2. **Маршрут существует**: `rails routes | grep auth` показывает `api_v1_auth_login POST /api/v1/auth/login`
3. **CORS настроен**: включает `localhost:3008`
4. **Пользователь существует**: ID=24, телефон=0000001111, пароль=0000001111

## 🎯 ЦЕЛЬ

Определить точную причину 404 ошибки через подробное логирование всех этапов запроса.

---
**Дата создания**: $(date)
**Статус**: В процессе отладки 