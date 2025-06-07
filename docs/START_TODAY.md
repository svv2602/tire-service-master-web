# 🎯 Начинаем сегодня: День 1

> **Задача дня:** Создание PageContainer (2-3 часа)

## ✅ Что нужно сделать:

### 1. Создать файл `src/components/common/PageContainer.tsx`
```tsx
import React from 'react';
import { Box, Typography, Paper, useTheme } from '@mui/material';
import { getCardStyles } from '../../styles';

interface PageContainerProps {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  subtitle?: string;
  breadcrumbs?: React.ReactNode;
}

export const PageContainer: React.FC<PageContainerProps> = ({ 
  title, 
  children, 
  action,
  subtitle,
  breadcrumbs 
}) => {
  const theme = useTheme();
  const cardStyles = getCardStyles(theme);
  
  return (
    <Box sx={{ p: 3 }}>
      {breadcrumbs}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3 
      }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: subtitle ? 1 : 0 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        {action}
      </Box>
      <Paper sx={cardStyles}>
        {children}
      </Paper>
    </Box>
  );
};
```

### 2. Обновить файл `src/components/common/index.ts`
```tsx
export { PageContainer } from './PageContainer';
// ... другие экспорты
```

### 3. Протестировать на любой странице
```tsx
import { PageContainer } from '../../components/common';

const TestPage = () => (
  <PageContainer title="Тест">
    <p>Содержимое страницы</p>
  </PageContainer>
);
```

## 📋 Чекбоксы для отметки:
- [ ] Создан файл PageContainer.tsx
- [ ] Добавлен экспорт в index.ts  
- [ ] Протестирован на тестовой странице
- [ ] Проверены TypeScript типы
- [ ] Компонент готов к использованию

## 🎯 Завтра: День 2 - StandardTable

---

**После завершения отметить в главном чек-листе:** `docs/STYLE_UNIFICATION_CHECKLIST.md` 