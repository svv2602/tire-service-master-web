# 👁️ Руководство по управлению видимостью контента

## 🔍 **Что означает "перечеркнутый глаз"?**

В системе управления контентом страниц используются иконки глаза для управления видимостью контента:

### 📊 **Состояния видимости:**

| Иконка | Состояние | Описание | Действие |
|--------|-----------|----------|----------|
| 👁️ | **АКТИВЕН** | Контент отображается на клиентской странице | Нажмите, чтобы скрыть |
| 👁️‍🗨️ | **НЕАКТИВЕН** | Контент скрыт с клиентской страницы | Нажмите, чтобы показать |

---

## 🔄 **Как управлять видимостью контента**

### ✅ **Скрыть контент:**
1. Найдите нужную карточку контента
2. Нажмите на иконку **открытого глаза** 👁️
3. Контент станет неактивным и исчезнет с клиентской страницы
4. Иконка изменится на **перечеркнутый глаз** 👁️‍🗨️

### ✅ **Показать скрытый контент:**
1. Включите переключатель **"Показать неактивный контент"**
2. Найдите карточку с перечеркнутым глазом 👁️‍🗨️
3. Нажмите на иконку **перечеркнутого глаза**
4. Контент станет активным и появится на клиентской странице

---

## 🔧 **Как вернуть "пропавшую" карточку**

### 📋 **Пошаговая инструкция:**

1. **Откройте страницу управления контентом:**
   ```
   /page-content
   ```

2. **Включите отображение неактивного контента:**
   - Найдите переключатель "Показать неактивный контент"
   - Переведите его в положение **ВКЛ**

3. **Найдите нужную карточку:**
   - Карточки с неактивным контентом помечены как "Неактивен"
   - У них перечеркнутый глаз 👁️‍🗨️

4. **Активируйте контент:**
   - Нажмите на перечеркнутый глаз 👁️‍🗨️
   - Карточка станет активной
   - Контент появится на клиентской странице

---

## 🌐 **Почему изменения не видны на странице /client**

### 🔍 **Возможные причины:**

1. **Кэширование браузера:**
   - Обновите страницу (Ctrl+F5 или Cmd+Shift+R)
   - Очистите кэш браузера

2. **Кэширование RTK Query:**
   - Нажмите кнопку **"Обновить"** на странице управления контентом
   - Перезагрузите страницу /client

3. **Контент действительно неактивен:**
   - Проверьте статус контента в админке
   - Убедитесь, что иконка показывает открытый глаз 👁️

### ⚡ **Быстрое решение:**

1. **Принудительное обновление:**
   ```
   Страница управления → Кнопка "Обновить" → Проверить статус
   ```

2. **Проверка активности:**
   ```
   Найти карточку → Проверить чип "Активен/Неактивен" → При необходимости активировать
   ```

3. **Обновление клиентской страницы:**
   ```
   Перейти на /client → Обновить страницу (F5)
   ```

---

## 📊 **Отладочная информация**

### 🔧 **Для разработчиков:**

В режиме разработки в консоли браузера отображается отладочная информация:

```javascript
🔍 ClientMainPage Debug Info:
📊 Page Content Data: {...}
📋 Page Content Array: [...]
🔢 Content Count: 8
🎯 Services Content: [...]
📰 Articles Content: [...]
🎪 Hero Content: {...}
📢 CTA Content: {...}
```

### 🔍 **Проверка через API:**

```bash
# Проверить активный контент для главной страницы
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:8000/api/v1/page_contents?section=client_main&active=true"
```

---

## 🎯 **Типы контента и их влияние**

| Тип контента | Описание | Влияние на страницу |
|--------------|----------|-------------------|
| **hero** | Главный баннер | Заголовок и описание страницы |
| **service** | Услуга | Блок популярных услуг |
| **article** | Статья | Раздел "Полезные статьи" |
| **cta** | Призыв к действию | Кнопки и призывы |
| **text_block** | Текстовый блок | Различные текстовые секции |

---

## ⚠️ **Важные замечания**

1. **Изменения применяются мгновенно** - нет необходимости сохранять
2. **Неактивный контент не удаляется** - он просто скрывается
3. **Можно активировать/деактивировать в любое время**
4. **Изменения влияют на всех пользователей** сразу
5. **Рекомендуется тестировать** изменения на тестовой среде

---

## 🆘 **Если ничего не помогает**

1. **Проверьте консоль браузера** на наличие ошибок
2. **Убедитесь, что API сервер запущен** (http://localhost:8000)
3. **Проверьте авторизацию** - возможно, токен истек
4. **Обратитесь к разработчику** с описанием проблемы

---

## 📞 **Техническая поддержка**

При возникновении проблем:
1. Опишите последовательность действий
2. Приложите скриншот проблемы
3. Укажите, какой контент не отображается
4. Проверьте консоль браузера на ошибки

**Помните:** Система управления контентом позволяет быстро изменять содержимое страниц без перезапуска приложения! 🚀 