import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  FormGroup, 
  FormControlLabel, 
  Switch,
  Divider,
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BlockIcon from '@mui/icons-material/Block';
import { PageTable } from '../../components/common/PageTable';
import { 
  PageTableProps, 
  ActionConfig, 
  FilterConfig, 
  PageHeaderConfig, 
  SearchConfig 
} from '../../components/common/PageTable/types';
import { Column } from '../../components/ui/Table/Table';

interface TestUser {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin: string;
  registrationDate: string;
}

const generateTestUsers = (count: number = 25): TestUser[] => {
  const roles = ['Администратор', 'Менеджер', 'Оператор', 'Клиент'];
  const statuses = ['Активен', 'Заблокирован', 'Ожидает подтверждения'];
  
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    name: `Пользователь ${index + 1}`,
    email: `user${index + 1}@example.com`,
    role: roles[index % roles.length],
    status: statuses[index % statuses.length],
    lastLogin: new Date(2025, 0, Math.floor(Math.random() * 30) + 1).toLocaleDateString('ru-RU'),
    registrationDate: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toLocaleDateString('ru-RU')
  }));
};

export const PageTableTest: React.FC = () => {
  const [users, setUsers] = useState<TestUser[]>(generateTestUsers(25));
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);

  // Фильтрация данных
  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchValue || 
      user.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      user.email.toLowerCase().includes(searchValue.toLowerCase());
    
    const matchesRole = !roleFilter || user.role === roleFilter;
    
    const matchesStatus = statusFilter.length === 0 || statusFilter.includes(user.status);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Пагинация
  const paginatedUsers = filteredUsers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Конфигурация заголовка
  const headerConfig: PageHeaderConfig = {
    title: 'Управление пользователями',
    subtitle: 'Полная демонстрация PageTable компонента',
    actions: [
      {
        id: 'add',
        label: 'Добавить пользователя',
        icon: <AddIcon />,
        onClick: () => alert('Добавление нового пользователя')
      },
      {
        id: 'export',
        label: 'Экспорт',
        variant: 'outlined',
        onClick: () => alert('Экспорт данных')
      }
    ]
  };

  // Конфигурация поиска
  const searchConfig: SearchConfig = {
    placeholder: 'Поиск по имени или email...',
    value: searchValue,
    onChange: setSearchValue,
    showClearButton: true
  };

  // Конфигурация фильтров
  const filtersConfig: FilterConfig[] = [
    {
      id: 'role',
      label: 'Роль',
      type: 'select',
      value: roleFilter,
      onChange: setRoleFilter,
      options: [
        { value: 'Администратор', label: 'Администратор' },
        { value: 'Менеджер', label: 'Менеджер' },
        { value: 'Оператор', label: 'Оператор' },
        { value: 'Клиент', label: 'Клиент' },
      ]
    },
    {
      id: 'status',
      label: 'Статус',
      type: 'multiselect',
      value: statusFilter,
      onChange: setStatusFilter,
      options: [
        { value: 'Активен', label: 'Активен' },
        { value: 'Заблокирован', label: 'Заблокирован' },
        { value: 'Ожидает подтверждения', label: 'Ожидает подтверждения' },
      ]
    }
  ];

  // Конфигурация колонок
  const columns: Column[] = [
    {
      id: 'id',
      label: 'ID',
      minWidth: 50,
      maxWidth: 80,
      align: 'center',
      sticky: true,
    },
    {
      id: 'name',
      label: 'Имя',
      minWidth: 150,
      wrap: true,
    },
    {
      id: 'email',
      label: 'Email',
      minWidth: 200,
      maxWidth: 250,
      ellipsis: true,
      hideOnMobile: true,
    },
    {
      id: 'role',
      label: 'Роль',
      minWidth: 120,
      format: (value) => (
        <Box
          sx={{
            px: 1,
            py: 0.5,
            borderRadius: 1,
            fontSize: '0.75rem',
            fontWeight: 'medium',
            textAlign: 'center',
            backgroundColor: 
              value === 'Администратор' ? 'error.light' :
              value === 'Менеджер' ? 'warning.light' :
              value === 'Оператор' ? 'info.light' : 'success.light',
            color: 
              value === 'Администратор' ? 'error.dark' :
              value === 'Менеджер' ? 'warning.dark' :
              value === 'Оператор' ? 'info.dark' : 'success.dark',
          }}
        >
          {value}
        </Box>
      ),
    },
    {
      id: 'status',
      label: 'Статус',
      minWidth: 140,
      format: (value) => (
        <Box
          sx={{
            px: 1,
            py: 0.5,
            borderRadius: 1,
            fontSize: '0.75rem',
            fontWeight: 'medium',
            textAlign: 'center',
            backgroundColor: 
              value === 'Активен' ? 'success.light' :
              value === 'Заблокирован' ? 'error.light' : 'warning.light',
            color: 
              value === 'Активен' ? 'success.dark' :
              value === 'Заблокирован' ? 'error.dark' : 'warning.dark',
          }}
        >
          {value}
        </Box>
      ),
    },
    {
      id: 'lastLogin',
      label: 'Последний вход',
      minWidth: 120,
      align: 'center',
      hideOnMobile: true,
    },
    {
      id: 'registrationDate',
      label: 'Дата регистрации',
      minWidth: 120,
      align: 'center',
      hideOnMobile: true,
    },
  ];

  // Конфигурация действий
  const actionsConfig: ActionConfig[] = [
    {
      id: 'view',
      label: 'Просмотр',
      icon: <VisibilityIcon />,
      color: 'info',
      onClick: (user: TestUser) => alert(`Просмотр пользователя: ${user.name}`)
    },
    {
      id: 'edit',
      label: 'Редактировать',
      icon: <EditIcon />,
      color: 'primary',
      onClick: (user: TestUser) => alert(`Редактирование пользователя: ${user.name}`)
    },
    {
      id: 'block',
      label: 'Заблокировать',
      icon: <BlockIcon />,
      color: 'warning',
      isVisible: (user: TestUser) => user.status === 'Активен',
      requireConfirmation: true,
      confirmationText: 'Вы уверены, что хотите заблокировать этого пользователя?',
      onClick: (user: TestUser) => {
        setUsers(prev => prev.map(u => 
          u.id === user.id ? { ...u, status: 'Заблокирован' } : u
        ));
        alert(`Пользователь ${user.name} заблокирован`);
      }
    },
    {
      id: 'delete',
      label: 'Удалить',
      icon: <DeleteIcon />,
      color: 'error',
      requireConfirmation: true,
      confirmationText: 'Вы уверены, что хотите удалить этого пользователя? Это действие нельзя отменить.',
      onClick: (user: TestUser) => {
        setUsers(prev => prev.filter(u => u.id !== user.id));
        alert(`Пользователь ${user.name} удален`);
      }
    }
  ];

  const handleLoadingTest = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 3000);
  };

  const handleRowClick = (user: TestUser) => {
    alert(`Клик по строке: ${user.name} (${user.email})`);
  };

  return (
    <Box>
      <Box sx={{ mb: 3, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          🧪 Настройки тестирования PageTable
        </Typography>
        
        <FormGroup row sx={{ gap: 2 }}>
          <Button variant="outlined" onClick={handleLoadingTest} disabled={loading}>
            {loading ? 'Загрузка...' : 'Тест загрузки'}
          </Button>
          <Button variant="outlined" onClick={() => setUsers([])}>
            Очистить данные
          </Button>
          <Button variant="outlined" onClick={() => setUsers(generateTestUsers(25))}>
            Восстановить данные
          </Button>
        </FormGroup>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Демонстрируемые возможности PageTable:</strong><br />
          ✅ Заголовок с кнопками действий<br />
          ✅ Поиск с автоочисткой<br />
          ✅ Фильтры: select и multiselect<br />
          ✅ Действия над строками с подтверждением<br />
          ✅ Пагинация<br />
          ✅ Адаптивность и все возможности базового Table
        </Typography>
      </Alert>

      <PageTable<TestUser>
        header={headerConfig}
        search={searchConfig}
        filters={filtersConfig}
        columns={columns}
        rows={paginatedUsers}
        actions={actionsConfig}
        loading={loading}
        onRowClick={handleRowClick}
        pagination={{
          page,
          rowsPerPage,
          totalItems: filteredUsers.length,
          onPageChange: setPage
        }}
      />
    </Box>
  );
};

export default PageTableTest; 