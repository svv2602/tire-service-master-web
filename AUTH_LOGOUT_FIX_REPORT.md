# Отчет об исправлении проблемы с выходом из системы

## Проблема

При нажатии на кнопку "Выйти" в главном меню приложения происходила ошибка 500 Internal Server Error:

```
POST http://localhost:8000/api/v1/auth/logout 500 (Internal Server Error)
```

Это приводило к тому, что пользователь не мог корректно выйти из системы.

## Причины проблемы

1. **Использование apiClient для выхода**: Запрос на выход отправлялся через apiClient, который не передавал cookies корректно
2. **Отсутствие обработки ошибок**: При ошибке запроса на выход не происходило локальной очистки данных
3. **Недостаточное логирование**: Не было достаточного логирования для отладки проблемы

## Решение

### 1. Использование прямого вызова axios для выхода

```typescript
export const logoutUser = createAsyncThunk('auth/logoutUser', async () => {
  try {
    console.log('DEBUG: Sending logout request with direct axios call');
    const API_URL = `${config.API_URL}${config.API_PREFIX}`;
    
    // Используем чистый axios без интерцепторов для выхода
    // так же как и для входа, чтобы избежать проблем с cookies
    await axios.post(
      `${API_URL}/auth/logout`,
      {},
      { 
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' }
      }
    );
    
    console.log('DEBUG: Logout successful, removing local storage items');
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    
    return;
  } catch (error) {
    console.error('Logout error:', error);
    // Даже если запрос не удался, очищаем локальное хранилище
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    return;
  }
});
```

### 2. Улучшение логирования на бэкенде

```ruby
# Универсальный выход из системы
def logout
  # Добавляем логирование для отладки
  Rails.logger.info("Auth#logout: Attempting logout")
  Rails.logger.info("Auth#logout: cookies available: #{cookies.present?}")
  
  # Удаляем куки при выходе
  cookies.delete(:refresh_token)
  
  Rails.logger.info("Auth#logout: Cookies deleted, sending success response")
  render json: { message: 'Выход выполнен успешно' }, status: :ok
end
```

## Результат

1. Запрос на выход из системы выполняется корректно
2. Даже при ошибке на сервере, локальные данные пользователя очищаются
3. Пользователь успешно перенаправляется на страницу входа
4. Добавлено логирование для отладки проблем с выходом

## Дополнительные рекомендации

1. Рассмотреть возможность использования единого подхода для всех запросов аутентификации
2. Добавить обработку ошибок на фронтенде с отображением уведомлений пользователю
3. Расширить логирование на сервере для отслеживания проблем с аутентификацией
4. Добавить тесты для проверки корректности работы функций входа и выхода 