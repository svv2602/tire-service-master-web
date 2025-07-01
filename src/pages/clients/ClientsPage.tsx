/**
 * ClientsPageNew - Новая версия страницы управления клиентами
 * Миграция на PageTable компонент для унификации дизайна
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  Avatar,
  Chip,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  DirectionsCar as CarIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  CalendarToday as CalendarTodayIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { 
  useGetClientsQuery, 
  useDeleteClientMutation,
  useUpdateClientMutation,
} from '../../api/clients.api';
import { Client } from '../../types/client';
import { ClientFilter } from '../../types/models';
import { ApiResponse } from '../../types/models';
import { useDebounce } from '../../hooks/useDebounce';

// Импорты UI компонентов
import { Box, Typography } from '../../components/ui';
import { PageTable } from '../../components/common/PageTable';
import type { 
  PageHeaderConfig, 
  SearchConfig, 
  FilterConfig, 
  ActionConfig,
  Column
} from '../../components/common/PageTable';
import Notification from '../../components/Notification';

// Импорт централизованных стилей
import { getTablePageStyles } from '../../styles';

const ClientsPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const tablePageStyles = getTablePageStyles(theme);

  // Состояние для поиска, фильтрации и пагинации
  const [search, setSearch] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [page, setPage] = useState(0);
  const PER_PAGE = 25;

  // Состояние для уведомлений
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  // Дебаунсированный поиск
  const debouncedSearch = useDebounce(search, 300);

  // Формируем параметры запроса
  const queryParams = useMemo(() => ({
    query: debouncedSearch,
    page: page + 1,
    per_page: PER_PAGE,
    active: showInactive ? undefined : true,
  } as ClientFilter), [debouncedSearch, page, showInactive]);

  // RTK Query хуки
  const { 
    data: clientsData, 
    isLoading, 
    error 
  } = useGetClientsQuery(queryParams, {
    refetchOnMountOrArgChange: true,
  });

  const [deleteClient] = useDeleteClientMutation();
  const [updateClient] = useUpdateClientMutation();

  const clients = (clientsData as unknown as ApiResponse<Client>)?.data || [];
  const totalItems = (clientsData as unknown as ApiResponse<Client>)?.pagination?.total_count || 0;

  // Обработчики событий
  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(0);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleToggleStatus = useCallback(async (client: Client) => {
    try {
      const updateData = {
        user: {
          is_active: !client.is_active,
        }
      };
      
      await updateClient({ 
        id: client.id.toString(), 
        client: updateData 
      }).unwrap();
      
      setNotification({
        open: true,
        message: `Статус клиента ${client.first_name} ${client.last_name} изменен`,
        severity: 'success'
      });
    } catch (error: any) {
      let errorMessage = 'Ошибка при изменении статуса клиента';
      
      if (error.data?.error) {
        errorMessage = error.data.error;
      } else if (error.data?.message) {
        errorMessage = error.data.message;
      }
      
      setNotification({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    }
  }, [updateClient]);

  const handleDelete = useCallback(async (client: Client) => {
    try {
      await deleteClient(client.id.toString()).unwrap();
      setNotification({
        open: true,
        message: `Клиент ${client.first_name} ${client.last_name} успешно удален`,
        severity: 'success'
      });
    } catch (error: any) {
      let errorMessage = 'Ошибка при удалении клиента';
      
      if (error.data?.error) {
        errorMessage = error.data.error;
      } else if (error.data?.message) {
        errorMessage = error.data.message;
      }
      
      setNotification({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    }
  }, [deleteClient]);

  const handleCloseNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, open: false }));
  }, []);

  // Конфигурация PageTable
  const headerConfig: PageHeaderConfig = useMemo(() => ({
    title: 'Клиенты (PageTable)',
    actions: [
      {
        id: 'add',
        label: 'Добавить клиента',
        icon: <AddIcon />,
        onClick: () => navigate('/admin/clients/new'),
        variant: 'contained'
      }
    ]
  }), [navigate]);

  const searchConfig: SearchConfig = useMemo(() => ({
    placeholder: 'Поиск по имени, email или телефону...',
    value: search,
    onChange: handleSearchChange
  }), [search, handleSearchChange]);

  const filtersConfig: FilterConfig[] = useMemo(() => [
    {
      id: 'status',
      label: 'Статус',
      type: 'select',
      value: showInactive ? 'all' : 'active',
      options: [
        { value: 'active', label: 'Только активные' },
        { value: 'all', label: 'Все клиенты' }
      ],
      onChange: (value: any) => {
        setShowInactive(value === 'all');
        setPage(0);
      }
    }
  ], [showInactive]);

  const columns: Column<Client>[] = useMemo(() => [
    {
      id: 'client',
      label: 'Клиент',
      sortable: true,
      render: (client: Client) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ 
            opacity: client.is_active ? 1 : 0.5,
            bgcolor: client.is_active ? theme.palette.primary.main : theme.palette.grey[400]
          }}>
            <PersonIcon />
          </Avatar>
          <Box>
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: 600,
                color: client.is_active ? 'text.primary' : 'text.secondary'
              }}
            >
              {client.first_name} {client.last_name}
            </Typography>
            {client.email && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                <EmailIcon sx={{ fontSize: '14px', color: theme.palette.text.secondary }} />
                <Typography 
                  variant="caption" 
                  sx={{ color: theme.palette.text.secondary }}
                >
                  {client.email}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      )
    },
    {
      id: 'phone',
      label: 'Телефон',
      align: 'center',
      hideOnMobile: true,
      render: (client: Client) => (
        client.phone ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <PhoneIcon sx={{ fontSize: '16px', color: theme.palette.text.secondary }} />
            <Typography variant="body2">
              {client.phone}
            </Typography>
          </Box>
        ) : (
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            -
          </Typography>
        )
      )
    },
    {
      id: 'cars',
      label: 'Автомобили',
      align: 'center',
      hideOnMobile: true,
      render: (client: Client) => (
        <Chip
          icon={<CarIcon sx={{ fontSize: '16px !important' }} />}
          label={client.cars?.length || 0}
          size="small"
          variant="outlined"
          color="primary"
          clickable
          onClick={() => navigate(`/admin/clients/${client.id}/cars`)}
        />
      )
    },
    {
      id: 'is_active',
      label: 'Статус',
      align: 'center',
      render: (client: Client) => (
        <Chip
          label={client.is_active ? 'Активен' : 'Неактивен'}
          color={client.is_active ? 'success' : 'default'}
          size="small"
        />
      )
    },
    {
      id: 'created_at',
      label: 'Дата регистрации',
      align: 'center',
      hideOnMobile: true,
      render: (client: Client) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <CalendarTodayIcon sx={{ fontSize: '16px', color: theme.palette.text.secondary }} />
          <Typography variant="body2">
            {client.created_at ? new Date(client.created_at).toLocaleDateString('ru-RU', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            }) : '-'}
          </Typography>
        </Box>
      )
    }
  ], [theme.palette]);

  const actionsConfig: ActionConfig<Client>[] = useMemo(() => [
    {
      label: 'Редактировать',
      icon: <EditIcon />,
      onClick: (client: Client) => navigate(`/admin/clients/${client.id}/edit`),
      color: 'primary'
    },
    {
      label: 'Автомобили',
      icon: <CarIcon />,
      onClick: (client: Client) => navigate(`/admin/clients/${client.id}/cars`),
      color: 'info'
    },
    {
      label: (client: Client) => client.is_active ? 'Деактивировать' : 'Активировать',
      icon: (client: Client) => client.is_active ? <ToggleOffIcon /> : <ToggleOnIcon />,
      onClick: (client: Client) => handleToggleStatus(client),
      color: 'warning'
    },
    {
      label: 'Удалить',
      icon: <DeleteIcon />,
      onClick: (client: Client) => handleDelete(client),
      color: 'error',
      requireConfirmation: true,
      confirmationConfig: {
        title: 'Подтверждение удаления',
        message: 'Вы действительно хотите удалить этого клиента? Это действие нельзя будет отменить.',
        confirmLabel: 'Удалить',
        cancelLabel: 'Отмена',
      }
    }
  ], [navigate, handleToggleStatus, handleDelete]);

  return (
    <Box sx={tablePageStyles.container}>
      <PageTable<Client>
        header={headerConfig}
        search={searchConfig}
        filters={filtersConfig}
        columns={columns}
        rows={clients}
        actions={actionsConfig}
        loading={isLoading}
        pagination={{
          page,
          totalItems,
          rowsPerPage: PER_PAGE,
          onPageChange: handlePageChange
        }}
        emptyState={{
          title: search || showInactive ? 'Клиенты не найдены' : 'Нет клиентов',
          description: search || showInactive 
            ? 'Попробуйте изменить критерии поиска'
            : 'Создайте первого клиента для начала работы',
          action: (!search && !showInactive) ? {
            label: 'Добавить клиента',
            icon: <AddIcon />,
            onClick: () => navigate('/admin/clients/new')
          } : undefined
        }}
      />

      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={handleCloseNotification}
      />
    </Box>
  );
};

export default ClientsPage; 