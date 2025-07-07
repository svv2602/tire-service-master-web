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
import { useTranslation } from 'react-i18next';
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
import { Box, Typography, ActionsMenu } from '../../components/ui';
import type { ActionItem } from '../../components/ui';
import { PageTable } from '../../components/common/PageTable';
import type { 
  PageHeaderConfig, 
  SearchConfig, 
  FilterConfig, 
  Column
} from '../../components/common/PageTable';
import Notification from '../../components/Notification';

// Импорт централизованных стилей
import { getTablePageStyles } from '../../styles';

const ClientsPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { t } = useTranslation();
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
    page: page,
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
        message: t('admin.clients.messages.statusChanged', { name: `${client.first_name} ${client.last_name}` }),
        severity: 'success'
      });
    } catch (error: any) {
      let errorMessage = t('admin.clients.messages.statusError');
      
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
        message: t('admin.clients.messages.deleted', { name: `${client.first_name} ${client.last_name}` }),
        severity: 'success'
      });
    } catch (error: any) {
      let errorMessage = t('admin.clients.messages.deleteError');
      
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

  // Функция для получения инициалов клиента
  const getClientInitials = useCallback((client: Client): string => {
    if (client.first_name && client.last_name) {
      return `${client.first_name.charAt(0)}${client.last_name.charAt(0)}`.toUpperCase();
    }
    if (client.first_name) {
      return client.first_name.charAt(0).toUpperCase();
    }
    if (client.last_name) {
      return client.last_name.charAt(0).toUpperCase();
    }
    return t('admin.clients.initials.default'); // К = Клиент
  }, [t]);

  // Конфигурация PageTable
  const headerConfig: PageHeaderConfig = useMemo(() => ({
    title: t('admin.clients.title'),
    actions: [
      {
        id: 'add',
        label: t('admin.clients.createClient'),
        icon: <AddIcon />,
        onClick: () => navigate('/admin/clients/new'),
        variant: 'contained'
      }
    ]
  }), [navigate, t]);

  const searchConfig: SearchConfig = useMemo(() => ({
    placeholder: t('admin.clients.searchPlaceholder'),
    value: search,
    onChange: handleSearchChange
  }), [search, handleSearchChange, t]);

  const filtersConfig: FilterConfig[] = useMemo(() => [
    {
      id: 'status',
      label: t('admin.clients.clientStatus'),
      type: 'select',
      value: showInactive ? 'all' : 'active',
      options: [
        { value: 'active', label: t('admin.clients.onlyActive') },
        { value: 'all', label: t('admin.clients.allClients') }
      ],
      onChange: (value: any) => {
        setShowInactive(value === 'all');
        setPage(0);
      }
    }
  ], [showInactive, t]);

  // Конфигурация действий для ActionsMenu
  const clientActions: ActionItem<Client>[] = useMemo(() => [
    {
      id: 'edit',
      label: t('admin.clients.editClient'),
      icon: <EditIcon />,
      onClick: (client: Client) => navigate(`/admin/clients/${client.id}/edit`),
      color: 'primary',
      tooltip: t('admin.clients.editTooltip')
    },
    {
      id: 'cars',
      label: t('admin.clients.cars'),
      icon: <CarIcon />,
      onClick: (client: Client) => navigate(`/admin/clients/${client.id}/cars`),
      color: 'info',
      tooltip: 'Управление автомобилями клиента'
    },
    {
      id: 'toggle-status',
      label: (client: Client) => client.is_active ? t('admin.clients.deactivate') : t('admin.clients.activate'),
      icon: (client: Client) => client.is_active ? <ToggleOffIcon /> : <ToggleOnIcon />,
      onClick: (client: Client) => handleToggleStatus(client),
      color: (client: Client) => client.is_active ? 'warning' : 'success',
      tooltip: (client: Client) => client.is_active ? t('admin.clients.deactivateTooltip') : t('admin.clients.activateTooltip'),
      requireConfirmation: true,
      confirmationConfig: {
        title: t('admin.clients.confirmStatusChange'),
        message: t('admin.clients.confirmStatusMessage'),
        confirmLabel: 'Изменить',
        cancelLabel: 'Отмена',
      }
    },
    {
      id: 'delete',
      label: 'Удалить',
      icon: <DeleteIcon />,
      onClick: (client: Client) => handleDelete(client),
      color: 'error',
      tooltip: t('admin.clients.deleteTooltip'),
      requireConfirmation: true,
      confirmationConfig: {
        title: t('admin.clients.confirmDelete'),
        message: t('admin.clients.confirmDeleteMessage'),
        confirmLabel: 'Удалить',
        cancelLabel: 'Отмена',
      }
    }
  ], [navigate, handleToggleStatus, handleDelete, t]);

  const columns: Column<Client>[] = useMemo(() => [
    {
      id: 'client',
      label: t('admin.clients.client'),
      sortable: true,
      render: (client: Client) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ 
            opacity: client.is_active ? 1 : 0.5,
            bgcolor: 'primary.main'
          }}>
            {getClientInitials(client)}
          </Avatar>
          <Box>
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: 600,
                color: client.is_active ? 'text.primary' : 'text.secondary',
                wordBreak: 'break-word'
              }}
            >
              {client.first_name} {client.last_name}
            </Typography>
            {client.email && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                <EmailIcon sx={{ fontSize: '14px', color: theme.palette.text.secondary }} />
                <Typography 
                  variant="caption" 
                  sx={{ color: theme.palette.text.secondary, wordBreak: 'break-word' }}
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
      label: t('admin.clients.phone'),
      align: 'center',
      hideOnMobile: true,
      render: (client: Client) => (
        client.phone ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <PhoneIcon sx={{ fontSize: '16px', color: theme.palette.text.secondary }} />
            <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
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
      label: t('admin.clients.cars'),
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
      label: t('admin.clients.status'),
      align: 'center',
      render: (client: Client) => (
        <Chip
          label={client.is_active ? t('admin.clients.active') : t('admin.clients.inactive')}
          color={client.is_active ? 'success' : 'default'}
          size="small"
        />
      )
    },
    {
      id: 'created_at',
      label: t('admin.clients.registrationDate'),
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
    },
    {
      id: 'actions',
      label: t('admin.clients.actions'),
      align: 'center',
      minWidth: 120,
      render: (client: Client) => (
        <ActionsMenu actions={clientActions} item={client} />
      )
    }
  ], [theme.palette, getClientInitials, clientActions, navigate, t]);

  return (
    <Box sx={tablePageStyles.container}>
      <PageTable<Client>
        header={headerConfig}
        search={searchConfig}
        filters={filtersConfig}
        columns={columns}
        rows={clients}

        loading={isLoading}
        pagination={{
          page,
          totalItems,
          rowsPerPage: PER_PAGE,
          onPageChange: handlePageChange
        }}
        emptyState={{
          title: search || showInactive ? t('admin.clients.clientsNotFound') : t('admin.clients.noClients'),
          description: search || showInactive 
            ? t('admin.clients.changeSearchCriteria')
            : t('admin.clients.createFirstClient'),
          action: (!search && !showInactive) ? {
            label: t('admin.clients.createClient'),
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