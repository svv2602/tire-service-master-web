# 🚀 Быстрый старт: Унификация стилей

## 📋 План действий на первую неделю

### День 1: Создание PageContainer (2-3 часа)

```tsx
// src/components/common/PageContainer.tsx
import React from 'react';
import { Box, Typography, Paper, useTheme } from '@mui/material';
import { getCardStyles } from '../../styles';

interface PageContainerProps {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}

export const PageContainer: React.FC<PageContainerProps> = ({ 
  title, 
  children, 
  action 
}) => {
  const theme = useTheme();
  const cardStyles = getCardStyles(theme);
  
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3 
      }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        {action}
      </Box>
      <Paper sx={cardStyles}>
        {children}
      </Paper>
    </Box>
  );
};
```

### День 2: Создание StandardTable (4-5 часов)

```tsx
// src/components/common/StandardTable.tsx
interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (item: T, index: number) => React.ReactNode;
}

interface StandardTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  pagination?: {
    page: number;
    rowsPerPage: number;
    total: number;
    onPageChange: (page: number) => void;
    onRowsPerPageChange: (rows: number) => void;
  };
  actions?: Array<{
    label: string;
    icon: React.ReactNode;
    onClick: (item: T) => void;
    color?: 'primary' | 'secondary' | 'error';
  }>;
}
```

### День 3: Создание ActionButtons (2-3 часа)

```tsx
// src/components/common/ActionButtons.tsx
interface ActionButtonsProps {
  onEdit?: () => void;
  onDelete?: () => void;
  onView?: () => void;
  customActions?: Array<{
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    color?: string;
  }>;
}
```

### День 4: Создание SearchBar (2-3 часа)

```tsx
// src/components/common/SearchBar.tsx
interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  filters?: Array<{
    key: string;
    label: string;
    options: Array<{ value: string; label: string }>;
    value: string;
    onChange: (value: string) => void;
  }>;
}
```

### День 5: Тестирование и рефакторинг одной страницы

Попробуем обновить **ClientsPage** как пример:

```tsx
// src/pages/clients/ClientsPage.tsx (ОБНОВЛЕННАЯ ВЕРСИЯ)
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../../components/common/PageContainer';
import { StandardTable } from '../../components/common/StandardTable';
import { ActionButtons } from '../../components/common/ActionButtons';
import { Button } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

const ClientsPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Вся логика остается той же...
  
  const columns = [
    { key: 'name', label: 'Имя' },
    { key: 'phone', label: 'Телефон' },
    { key: 'email', label: 'Email' },
    { 
      key: 'actions', 
      label: 'Действия',
      render: (client) => (
        <ActionButtons
          onEdit={() => navigate(`/clients/${client.id}/edit`)}
          onDelete={() => handleDelete(client)}
          onView={() => navigate(`/clients/${client.id}/cars`)}
        />
      )
    },
  ];
  
  return (
    <PageContainer 
      title="Клиенты"
      action={
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/clients/new')}
        >
          Добавить клиента
        </Button>
      }
    >
      <StandardTable
        data={clients}
        columns={columns}
        loading={isLoading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Поиск клиентов..."
        pagination={{
          page,
          rowsPerPage,
          total: totalItems,
          onPageChange: setPage,
          onRowsPerPageChange: setRowsPerPage,
        }}
      />
    </PageContainer>
  );
};
```

## ✅ Результат первой недели

После первой недели у вас будет:

1. **4 переиспользуемых компонента**
2. **Одна полностью обновленная страница** (ClientsPage)
3. **Понимание подхода** для остальных страниц
4. **Основа для дальнейшей работы**

## 📊 Измеримые улучшения

### До:
- ClientsPage: ~300 строк кода
- Дублирование стилей в каждой странице
- Разные подходы к оформлению

### После:
- ClientsPage: ~50 строк кода
- Переиспользуемые компоненты
- Единообразный стиль

## 🎯 Следующие шаги

После первой недели:

1. **Создать шаблоны страниц** (ListPageTemplate, FormPageTemplate)
2. **Мигрировать 2-3 похожие страницы** 
3. **Добавить дополнительные фичи** (сортировка, фильтры)
4. **Постепенно покрыть все 52 страницы**

---

**Начинаем с PageContainer! 🚀** 