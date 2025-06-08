# 📝 Примеры миграции UI компонентов

## 🎯 Готовые шаблоны для миграции

### 1. 📊 Страница с таблицей (например, ClientsPage)

#### До миграции:
```tsx
import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
  TextField,
  IconButton
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';

const ClientsPage = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Клиенты
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
          <TextField 
            placeholder="Поиск..." 
            sx={{ flex: 1 }}
          />
          <Button 
            variant="contained" 
            startIcon={<Add />}
            sx={{ borderRadius: 2 }}
          >
            Добавить
          </Button>
        </Box>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Имя</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Иван Иванов</TableCell>
              <TableCell>ivan@email.com</TableCell>
              <TableCell>
                <IconButton><Edit /></IconButton>
                <IconButton><Delete /></IconButton>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};
```

#### После миграции:
```tsx
import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';

// UI компоненты
import { Button } from '../../../components/ui/Button';
import { TextField } from '../../../components/ui/TextField';
import { Table } from '../../../components/ui/Table';
import { Card } from '../../../components/ui/Card';

const ClientsPage = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Клиенты
      </Typography>
      <Card>
        <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
          <TextField 
            placeholder="Поиск..." 
            fullWidth
          />
          <Button 
            variant="primary" 
            startIcon={<Add />}
          >
            Добавить
          </Button>
        </Box>
        <Table
          columns={[
            { key: 'name', label: 'Имя' },
            { key: 'email', label: 'Email' },
            { key: 'actions', label: 'Действия' }
          ]}
          data={[
            {
              name: 'Иван Иванов',
              email: 'ivan@email.com',
              actions: (
                <>
                  <IconButton><Edit /></IconButton>
                  <IconButton><Delete /></IconButton>
                </>
              )
            }
          ]}
        />
      </Card>
    </Box>
  );
};
```

### 2. 📝 Страница с формой (например, UserForm)

#### До миграции:
```tsx
import React from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel
} from '@mui/material';

const UserForm = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Новый пользователь
      </Typography>
      <Paper sx={{ p: 3, maxWidth: 600 }}>
        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            label="Имя"
            required
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
          <TextField
            label="Email"
            type="email"
            required
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
          <FormControl required>
            <InputLabel>Роль</InputLabel>
            <Select sx={{ borderRadius: 2 }}>
              <MenuItem value="admin">Администратор</MenuItem>
              <MenuItem value="user">Пользователь</MenuItem>
            </Select>
          </FormControl>
          <FormControlLabel
            control={<Checkbox />}
            label="Активный"
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="contained" 
              sx={{ borderRadius: 2, flex: 1 }}
            >
              Сохранить
            </Button>
            <Button 
              variant="outlined" 
              sx={{ borderRadius: 2, flex: 1 }}
            >
              Отмена
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};
```

#### После миграции:
```tsx
import React from 'react';
import { Box, Typography } from '@mui/material';

// UI компоненты
import { Button } from '../../../components/ui/Button';
import { TextField } from '../../../components/ui/TextField';
import { Select } from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import { Card } from '../../../components/ui/Card';

const UserForm = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Новый пользователь
      </Typography>
      <Card maxWidth={600}>
        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            label="Имя"
            required
          />
          <TextField
            label="Email"
            type="email"
            required
          />
          <Select
            label="Роль"
            required
            options={[
              { value: 'admin', label: 'Администратор' },
              { value: 'user', label: 'Пользователь' }
            ]}
          />
          <Checkbox
            label="Активный"
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="primary" 
              fullWidth
            >
              Сохранить
            </Button>
            <Button 
              variant="secondary" 
              fullWidth
            >
              Отмена
            </Button>
          </Box>
        </Box>
      </Card>
    </Box>
  );
};
```

### 3. 🏠 Dashboard страница

#### До миграции:
```tsx
import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Button,
  Grid
} from '@mui/material';
import { TrendingUp, People, ShoppingCart } from '@mui/icons-material';

const DashboardPage = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Панель управления
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6">Продажи</Typography>
              <Typography variant="h4">1,234</Typography>
              <TrendingUp color="success" />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6">Клиенты</Typography>
              <Typography variant="h4">567</Typography>
              <People color="primary" />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6">Заказы</Typography>
              <Typography variant="h4">89</Typography>
              <ShoppingCart color="secondary" />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
```

#### После миграции:
```tsx
import React from 'react';
import { Box, Typography, CardContent } from '@mui/material';
import { TrendingUp, People, ShoppingCart } from '@mui/icons-material';

// UI компоненты
import { Card } from '../../../components/ui/Card';
import { Grid } from '../../../components/ui/Grid';

const DashboardPage = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Панель управления
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Продажи</Typography>
              <Typography variant="h4">1,234</Typography>
              <TrendingUp color="success" />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Клиенты</Typography>
              <Typography variant="h4">567</Typography>
              <People color="primary" />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Заказы</Typography>
              <Typography variant="h4">89</Typography>
              <ShoppingCart color="secondary" />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
```

### 4. 🔐 Страница входа (LoginPage)

#### До миграции:
```tsx
import React from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Link
} from '@mui/material';

const LoginPage = () => {
  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center' 
    }}>
      <Paper sx={{ p: 4, maxWidth: 400, borderRadius: 3 }}>
        <Typography variant="h4" sx={{ mb: 3, textAlign: 'center' }}>
          Вход в систему
        </Typography>
        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Email"
            type="email"
            required
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
          <TextField
            label="Пароль"
            type="password"
            required
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
          <FormControlLabel
            control={<Checkbox />}
            label="Запомнить меня"
          />
          <Button 
            variant="contained" 
            sx={{ borderRadius: 2, py: 1.5 }}
          >
            Войти
          </Button>
          <Link href="#" sx={{ textAlign: 'center' }}>
            Забыли пароль?
          </Link>
        </Box>
      </Paper>
    </Box>
  );
};
```

#### После миграции:
```tsx
import React from 'react';
import { Box, Typography, Link } from '@mui/material';

// UI компоненты
import { Button } from '../../../components/ui/Button';
import { TextField } from '../../../components/ui/TextField';
import { Checkbox } from '../../../components/ui/Checkbox';
import { Card } from '../../../components/ui/Card';

const LoginPage = () => {
  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center' 
    }}>
      <Card maxWidth={400}>
        <Typography variant="h4" sx={{ mb: 3, textAlign: 'center' }}>
          Вход в систему
        </Typography>
        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Email"
            type="email"
            required
          />
          <TextField
            label="Пароль"
            type="password"
            required
          />
          <Checkbox
            label="Запомнить меня"
          />
          <Button 
            variant="primary"
            size="large"
          >
            Войти
          </Button>
          <Link href="#" sx={{ textAlign: 'center' }}>
            Забыли пароль?
          </Link>
        </Box>
      </Card>
    </Box>
  );
};
```

## 🔧 Универсальные компоненты-обертки

### PageWrapper
```tsx
// src/components/common/PageWrapper.tsx
import React from 'react';
import { Box, Typography } from '@mui/material';

interface PageWrapperProps {
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export const PageWrapper: React.FC<PageWrapperProps> = ({
  title,
  children,
  actions
}) => {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3 
      }}>
        <Typography variant="h4">{title}</Typography>
        {actions}
      </Box>
      {children}
    </Box>
  );
};
```

### FormWrapper
```tsx
// src/components/common/FormWrapper.tsx
import React from 'react';
import { Box } from '@mui/material';
import { Card } from '../../ui/Card';

interface FormWrapperProps {
  children: React.ReactNode;
  maxWidth?: number;
}

export const FormWrapper: React.FC<FormWrapperProps> = ({
  children,
  maxWidth = 600
}) => {
  return (
    <Card maxWidth={maxWidth}>
      <Box component="form" sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 3 
      }}>
        {children}
      </Box>
    </Card>
  );
};
```

### ActionButtons
```tsx
// src/components/common/ActionButtons.tsx
import React from 'react';
import { Box } from '@mui/material';
import { Button } from '../../ui/Button';

interface ActionButtonsProps {
  onSave?: () => void;
  onCancel?: () => void;
  saveLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onSave,
  onCancel,
  saveLabel = 'Сохранить',
  cancelLabel = 'Отмена',
  loading = false
}) => {
  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      <Button 
        variant="primary" 
        onClick={onSave}
        loading={loading}
        fullWidth
      >
        {saveLabel}
      </Button>
      <Button 
        variant="secondary" 
        onClick={onCancel}
        fullWidth
      >
        {cancelLabel}
      </Button>
    </Box>
  );
};
```

## 📋 Чеклист для каждой страницы

### ✅ Перед началом миграции:
- [ ] Создать ветку для страницы
- [ ] Сделать скриншот текущего состояния
- [ ] Проанализировать все используемые компоненты
- [ ] Убедиться что UI компоненты готовы

### ✅ Во время миграции:
- [ ] Заменить импорты по одному
- [ ] Тестировать после каждой замены
- [ ] Сохранить функциональность
- [ ] Проверить адаптивность

### ✅ После миграции:
- [ ] Сравнить с исходным скриншотом
- [ ] Провести полное функциональное тестирование
- [ ] Проверить на всех разрешениях экрана
- [ ] Сделать коммит с описанием изменений

---

**Обновлено:** _текущая дата_  
**Версия:** 1.0  
**Статус:** 📝 Готовые шаблоны 