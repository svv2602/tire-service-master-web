# 🎨 Чеклист унификации дизайна Tire Service

## ⚠️ ВАЖНО: Использование UI компонентов

> **ОБЯЗАТЕЛЬНО к прочтению**: Перед началом работы ознакомьтесь с [Руководством по использованию UI компонентов](UI_COMPONENTS_GUIDE.md)
>
> ❗ **Запрещено**:
> - Создавать новые UI компоненты без согласования
> - Использовать напрямую компоненты из MUI
> - Создавать дублирующие компоненты
>
> ✅ **Обязательно**:
> - Использовать только компоненты из `src/components/ui`
> - Следовать примерам из Storybook
> - При отсутствии нужного компонента обратиться к тимлиду

## 🧠 Поддержка ИИ-ассистента

### 🤖 Команды для ИИ-агента

Для запуска в PR, терминале или IDE:

- `@agent check page src/pages/auth/LoginPage.tsx` — проверить соответствие дизайн-системе
- `@agent suggest fixes src/pages/dashboard/DashboardPage.tsx` — предложить улучшения
- `@agent report` — сводка по проекту и страницам

### 🔧 Машиночитаемые правила (используются агентом и линтерами)

```json
{
  "disallowedImports": ["@mui/material", "@mui/system", "styled-components"],
  "allowedUIPath": "src/components/ui",
  "styleTokens": {
    "spacing": "SIZES.spacing",
    "colors": "theme.palette",
    "typography": "theme.typography"
  },
  "requiredHooks": ["useTheme"],
  "requiredImports": [
    "getCardStyles",
    "getButtonStyles",
    "getTextFieldStyles",
    "getTableStyles",
    "getDialogStyles"
  ]
}
```

## 📂 Важное замечание по работе с проектом

### Рабочая директория
- **ВСЕГДА** работать в директории: `/home/snisar/mobi_tz/tire-service-master-web/`
- **НИКОГДА** не создавать файлы в корне `/home/snisar/mobi_tz/`
- Перед началом работы всегда выполнять: `cd /home/snisar/mobi_tz/tire-service-master-web/`

### Структура проекта
```
tire-service-master-web/
├── src/
│   ├── components/     # Переиспользуемые компоненты
│   ├── pages/         # Страницы приложения
│   ├── styles/        # Централизованные стили
│   └── templates/     # Шаблоны страниц
```

## 🎨 Инструкция генерации новых компонентов

- Только компоненты из `src/components/ui`
- Стили — через `getXStyles(theme)`
- Отступы — только через `SIZES.spacing`
- Цвета — только через `theme.palette`
- Типографика — через `theme.typography`
- Поддержка адаптивности обязательна (`useMediaQuery` или responsive props)

**Пример:**
```tsx
const theme = useTheme();
const cardStyles = getCardStyles(theme);

<Card sx={cardStyles.root}>
  <Typography variant="h6">Заголовок</Typography>
  <Typography variant="body2" color="text.secondary">Контент</Typography>
</Card>
```

## 🛠 Линтинг и CI

### Конфигурация ESLint

```json
{
  "rules": {
    "no-inline-styles": "warn",
    "no-direct-mui-imports": "error",
    "use-centralized-ui-components": "error",
    "prefer-theme-values": "warn"
  }
}
```

Добавить кастомные правила или плагин `eslint-plugin-tire-style`

## 🚫 Исключения из унификации

На этих страницах временно допускается отклонение от требований:

- `src/pages/legacy/OldStatsPage.tsx` — до Q3 2025
- `src/pages/dev/TestPlayground.tsx` — для внутренних экспериментов

## 🔄 Процесс миграции

[Оставшаяся часть файла без изменений...]