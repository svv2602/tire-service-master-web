# Отчет: Реализация динамической загрузки типов шаблонов по каналам

## 📋 Проблема
На странице `/admin/notifications/templates/70/edit` в форме редактирования Telegram шаблона отображался канал "Email" вместо "Telegram", а также все каналы показывали одинаковый список типов событий.

## 🎯 Задачи
1. ✅ Исправить отображение канала в форме редактирования
2. ✅ Реализовать разные списки типов событий для разных каналов
3. ✅ Добавить динамическую загрузку типов при смене канала
4. ✅ Сбрасывать выбранный тип при смене канала

## 🔧 Решения

### Backend изменения

#### 1. Модель EmailTemplate
```ruby
# Типы шаблонов по каналам
def self.template_types_for_channel(channel_type)
  case channel_type.to_s
  when 'email'
    {
      'booking_confirmation' => 'Подтверждение бронирования',
      'booking_cancelled' => 'Отмена бронирования', 
      'booking_reminder' => 'Напоминание о записи',
      'service_completed' => 'Завершение обслуживания',
      'review_request' => 'Запрос отзыва',
      'user_welcome' => 'Приветствие нового пользователя',
      'password_reset' => 'Сброс пароля',
      'newsletter' => 'Информационная рассылка'
    }
  when 'telegram'
    {
      'booking_confirmation' => 'Подтверждение бронирования',
      'booking_cancelled' => 'Отмена бронирования',
      'booking_reminder' => 'Напоминание о записи', 
      'service_completed' => 'Завершение обслуживания',
      'review_request' => 'Запрос отзыва',
      'newsletter' => 'Информационная рассылка'
    }
  when 'push'
    {
      'booking_confirmation' => 'Подтверждение бронирования',
      'booking_cancelled' => 'Отмена бронирования',
      'booking_reminder' => 'Напоминание о записи',
      'service_completed' => 'Завершение обслуживания',
      'review_request' => 'Запрос отзыва'
    }
  else
    template_types
  end
end
```

#### 2. Контроллер EmailTemplatesController
```ruby
# GET /api/v1/email_templates/template_types
def template_types
  channel_type = params[:channel_type] || 'email'
  types_array = EmailTemplate.template_types_for_channel(channel_type).map do |key, label|
    { value: key, label: label }
  end
  
  render json: {
    data: types_array,
    available_languages: %w[uk ru en],
    channel_type: channel_type
  }
end
```

### Frontend изменения

#### 1. API emailTemplates.api.ts
```typescript
// Получение типов шаблонов
getTemplateTypes: builder.query<{ data: TemplateType[]; channel_type?: string }, { channel_type?: string } | void>({
  query: (params = {}) => {
    const urlParams = new URLSearchParams();
    if (params && 'channel_type' in params && params.channel_type) {
      urlParams.append('channel_type', params.channel_type);
    }
    return `email_templates/template_types${urlParams.toString() ? `?${urlParams.toString()}` : ''}`;
  },
}),
```

#### 2. EmailTemplateFormPage.tsx
```typescript
// Состояние для текущего канала (для динамической загрузки типов)
const [selectedChannelType, setSelectedChannelType] = useState<string>('email');

// API хуки
const { data: templateTypesData } = useGetTemplateTypesQuery({ 
  channel_type: selectedChannelType 
});

// Обработчик изменения канала
const handleChannelChange = (event: SelectChangeEvent<string>) => {
  const newChannelType = event.target.value;
  setSelectedChannelType(newChannelType);
  formik.setFieldValue('channel_type', newChannelType);
  // Сбрасываем тип шаблона при смене канала
  formik.setFieldValue('template_type', '');
};

// Загрузка данных для редактирования
useEffect(() => {
  if (isEditMode && templateData?.data) {
    const template = templateData.data;
    const channelType = template.channel_type || 'email';
    setSelectedChannelType(channelType);
    
    formik.setValues({
      // ... другие поля
      channel_type: channelType,
    });
  }
}, [templateData, isEditMode]);
```

## 📊 Результат

### Типы событий по каналам:

#### 📧 Email (8 типов):
- Подтверждение бронирования
- Отмена бронирования
- Напоминание о записи
- Завершение обслуживания
- Запрос отзыва
- Приветствие нового пользователя
- Сброс пароля
- Информационная рассылка

#### 📱 Telegram (6 типов):
- Подтверждение бронирования
- Отмена бронирования
- Напоминание о записи
- Завершение обслуживания
- Запрос отзыва
- Информационная рассылка

#### 🔔 Push (5 типов):
- Подтверждение бронирования
- Отмена бронирования
- Напоминание о записи
- Завершение обслуживания
- Запрос отзыва

## ✅ Проверка работы

1. **Исправление отображения канала**: ✅
   - При открытии `/admin/notifications/templates/70/edit` теперь корректно отображается "Telegram"

2. **Динамическая загрузка типов**: ✅
   - При смене канала список типов событий обновляется автоматически
   - Email показывает 8 типов, Telegram - 6, Push - 5

3. **Сброс типа при смене канала**: ✅
   - При смене канала поле "Тип шаблона" очищается
   - Пользователь должен выбрать подходящий тип для нового канала

4. **Синхронизация при редактировании**: ✅
   - При загрузке существующего шаблона канал и типы загружаются корректно

## 🔄 Коммит
```
b707199 - Реализация динамической загрузки типов шаблонов по каналам
```

## 🎯 Преимущества
- **Логичность**: Каждый канал показывает только релевантные типы событий
- **UX**: Автоматический сброс типа предотвращает ошибки
- **Масштабируемость**: Легко добавлять новые каналы и типы
- **Консистентность**: Единообразное поведение во всех формах 