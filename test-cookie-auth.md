# Тестирование Cookie-Based Аутентификации

## Текущий статус миграции

✅ **Завершено:**
1. Backend API обновлен для работы с HttpOnly куками
2. Frontend утилиты полностью переведены на куки
3. Redux authSlice обновлен для cookie-based аутентификации
4. AuthInitializer обновлен для работы без localStorage
5. Все ссылки на localStorage в аутентификации удалены
6. API interceptors обновлены для работы с куками

## Тест-план

### 1. Проверка начального состояния
- [ ] Открыть http://localhost:3008
- [ ] Убедиться, что пользователь не авторизован
- [ ] Проверить отсутствие refresh_token куки в DevTools

### 2. Тестирование входа
- [ ] Перейти на страницу входа
- [ ] Войти с тестовыми данными (admin@example.com / password)
- [ ] Проверить, что установлено HttpOnly куки refresh_token
- [ ] Убедиться, что пользователь авторизован
- [ ] Проверить, что access_token хранится только в Redux (не в localStorage)

### 3. Тестирование обновления токена
- [ ] Дождаться истечения access_token (или имитировать)
- [ ] Сделать API запрос
- [ ] Убедиться, что токен автоматически обновляется через HttpOnly куки

### 4. Тестирование выхода
- [ ] Нажать кнопку выхода
- [ ] Проверить, что HttpOnly куки удалены
- [ ] Убедиться, что пользователь не авторизован

### 5. Тестирование перезагрузки страницы
- [ ] Войти в систему
- [ ] Перезагрузить страницу (F5)
- [ ] Убедиться, что сессия восстанавливается через HttpOnly куки

## Команды для тестирования

### Проверка API сервера
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"auth":{"login":"admin@example.com","password":"password"}}' \
  -c cookies.txt -v
```

### Проверка refresh через куки
```bash
curl -X POST http://localhost:8000/api/v1/auth/refresh \
  -b cookies.txt -v
```

### Проверка logout
```bash
curl -X DELETE http://localhost:8000/api/v1/auth/logout \
  -b cookies.txt -v
```

## Ожидаемое поведение

1. **Login**: Должен установить HttpOnly куки `refresh_token` и вернуть `access_token`
2. **Refresh**: Должен использовать HttpOnly куки и вернуть новый `access_token`
3. **Logout**: Должен очистить HttpOnly куки
4. **Page reload**: Должен восстановить сессию через HttpOnly куки при наличии

## Безопасность

✅ **Улучшения безопасности:**
- Refresh токены в HttpOnly куки (недоступны JavaScript)
- Access токены только в памяти (Redux состояние)
- Автоматическая очистка куки при logout
- Защита от XSS атак на токены
