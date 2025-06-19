# ОТЧЕТ ОБ ИСПРАВЛЕНИИ ОТОБРАЖЕНИЯ КЛИЕНТОВ В ТАБЛИЦЕ БРОНИРОВАНИЙ

## ПРОБЛЕМА

На странице бронирований в таблице не отображались имена клиентов. Вместо этого показывалось "undefined undefined" в колонке "Клиент".

## ПРИЧИНА

1. В API бронирований (`BookingsController#index`) данные о клиенте возвращались в неправильном формате:
   - API возвращал поля `name`, `phone`, `email` напрямую в объекте клиента
   - Но на фронтенде ожидалось, что данные пользователя находятся во вложенном объекте `user`

2. В компоненте `BookingsPage.tsx` обращение к полям клиента происходило напрямую:
   ```typescript
   {booking.client ? `${booking.client.first_name} ${booking.client.last_name}` : 'Неизвестный клиент'}
   ```
   Но в модели `Client` эти поля находятся в связанном объекте `user`.

## РЕШЕНИЕ

### 1. Исправление в API (backend)

В файле `app/controllers/api/v1/bookings_controller.rb` изменена структура данных о клиенте:

```ruby
booking_hash["client"] = {
  id: booking.client&.id,
  user: {
    id: booking.client&.user&.id,
    first_name: booking.client&.user&.first_name,
    last_name: booking.client&.user&.last_name,
    phone: booking.client&.user&.phone,
    email: booking.client&.user&.email
  }
}
```

### 2. Исправление в компоненте (frontend)

В файле `src/pages/bookings/BookingsPage.tsx` исправлено обращение к полям клиента:

```typescript
<Avatar>
  {booking.client?.user?.first_name?.charAt(0) || booking.client?.user?.last_name?.charAt(0) || '?'}
</Avatar>
<Typography>
  {booking.client?.user ? `${booking.client.user.first_name} ${booking.client.user.last_name}` : 'Неизвестный клиент'}
</Typography>
```

## РЕЗУЛЬТАТ

- Имена клиентов корректно отображаются в таблице бронирований
- Аватары клиентов отображают первую букву имени или фамилии
- Структура данных API соответствует моделям на фронтенде

## КОММИТЫ

- Backend: Изменение структуры данных о клиенте в API бронирований
- Frontend: Исправление обращения к полям клиента в компоненте BookingsPage

## ДАТА

19.06.2025 