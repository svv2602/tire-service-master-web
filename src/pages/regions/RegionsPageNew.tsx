import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box,
  Typography,
  Avatar,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocationOn as LocationOnIcon,
  LocationCity as LocationCityIcon,
  CalendarToday as CalendarTodayIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

// Импорты UI компонентов
import { PageTable } from '../../components/common/PageTable';
import Notification from '../../components/Notification';
import { getTablePageStyles } from '../../styles';

// Импорты API
import {
  useGetRegionsQuery,
  useDeleteRegionMutation,
  useUpdateRegionMutation,
} from '../../api/regions.api';

// Типы
import type { Region } from '../../types/models';

interface RegionsPageNewProps {}

const RegionsPageNew: React.FC<RegionsPageNewProps> = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const tablePageStyles = getTablePageStyles(theme);
  
  // Состояние для фильтров и поиска
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  // Константы
  const PER_PAGE = 25;

  // API запросы
  const { 
    data: regionsData, 
    isLoading, 
    error 
  } = useGetRegionsQuery({
    search: searchQuery || undefined,
    is_active: selectedStatus !== 'all' ? selectedStatus === 'active' : undefined,
    page: page + 1,
    per_page: PER_PAGE,
  });

  const [deleteRegion] = useDeleteRegionMutation();
  const [updateRegion] = useUpdateRegionMutation();

  const regions = regionsData?.data || [];
  const totalItems = regionsData?.pagination?.total_count || 0;

  // Обработчики событий
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage - 1);
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    setPage(0);
  }, []);

  const handleStatusFilterChange = useCallback((status: string) => {
    setSelectedStatus(status);
    setPage(0);
  }, []);

  const showNotification = useCallback((message: string, severity: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setNotification({ open: true, message, severity });
  }, []);

  const handleCloseNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, open: false }));
  }, []);

  // Обработка удаления
  const handleDelete = useCallback(async (region: Region) => {
    try {
      await deleteRegion(region.id).unwrap();
      showNotification('Регион успешно удален', 'success');
    } catch (error: any) {
      let errorMessage = 'Ошибка при удалении региона';
      if (error.data?.message) {
        errorMessage = error.data.message;
      } else if (error.data?.errors) {
        errorMessage = Object.values(error.data.errors).join(', ');
      }
      showNotification(errorMessage, 'error');
    }
  }, [deleteRegion, showNotification]);

  // Обработка переключения статуса
  const handleToggleStatus = useCallback(async (region: Region) => {
    try {
      await updateRegion({
        id: region.id,
        region: { ...region, is_active: !region.is_active }
      }).unwrap();
      showNotification(`Регион ${!region.is_active ? 'активирован' : 'деактивирован'}`, 'success');
    } catch (error: any) {
      let errorMessage = 'Ошибка при изменении статуса';
      if (error.data?.message) {
        errorMessage = error.data.message;
      } else if (error.data?.errors) {
        errorMessage = Object.values(error.data.errors).join(', ');
      }
      showNotification(errorMessage, 'error');
    }
  }, [updateRegion, showNotification]);

  // Форматирование даты
  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, []);

  // Конфигурация заголовка
  const headerConfig = useMemo(() => ({
    title: 'Регионы',
    subtitle: 'Управление регионами и их городами',
    actions: [
      {
        label: 'Добавить регион',
        icon: <AddIcon />,
        onClick: () => navigate('/admin/regions/new'),
        variant: 'contained' as const,
        color: 'primary' as const
      }
    ]
  }), [navigate]);

  // Конфигурация поиска
  const searchConfig = useMemo(() => ({
    placeholder: 'Поиск по названию региона...',
    value: searchQuery,
    onChange: handleSearchChange
  }), [searchQuery, handleSearchChange]);

  // Конфигурация фильтров
  const filtersConfig = useMemo(() => [
    {
      id: 'status',
      key: 'status',
      type: 'select' as const,
      label: 'Статус',
      value: selectedStatus,
      onChange: handleStatusFilterChange,
      options: [
        { value: 'all', label: 'Все' },
        { value: 'active', label: 'Активные' },
        { value: 'inactive', label: 'Неактивные' }
      ]
    }
  ], [selectedStatus, handleStatusFilterChange]);

  // Конфигурация колонок
  const columns = useMemo(() => [
    {
      id: 'region',
      key: 'name' as keyof Region,
      label: 'Регион',
      sortable: true,
      render: (region: Region) => (
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}>
            <LocationOnIcon />
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
              {region.name}
            </Typography>
            {region.code && (
              <Chip 
                label={region.code}
                size="small"
                variant="outlined"
                sx={{ mb: 0.5 }}
              />
            )}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CalendarTodayIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {formatDate(region.created_at)}
              </Typography>
            </Box>
          </Box>
        </Box>
      )
    },
    {
      id: 'cities_count',
      key: 'cities_count' as keyof Region,
      label: 'Количество городов',
      sortable: true,
      hideOnMobile: true,
      render: (region: Region) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocationCityIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Chip 
            label={region.cities_count || 0}
            size="small"
            color="info"
            variant="filled"
          />
        </Box>
      )
    },
    {
      id: 'status',
      key: 'is_active' as keyof Region,
      label: 'Статус',
      sortable: true,
      render: (region: Region) => (
        <Chip
          label={region.is_active ? 'Активен' : 'Неактивен'}
          color={region.is_active ? 'success' : 'default'}
          variant="filled"
          size="small"
          icon={region.is_active ? <ToggleOnIcon /> : <ToggleOffIcon />}
        />
      )
    },
    {
      id: 'created_at',
      key: 'created_at' as keyof Region,
      label: 'Дата создания',
      sortable: true,
      hideOnMobile: true,
      render: (region: Region) => (
        <Typography variant="body2">
          {formatDate(region.created_at)}
        </Typography>
      )
    }
  ], [formatDate]);

  // Конфигурация действий
  const actionsConfig = useMemo(() => [
    {
      key: 'edit',
      label: 'Редактировать',
      icon: <EditIcon />,
      onClick: (region: Region) => navigate(`/admin/regions/${region.id}/edit`),
      color: 'primary' as const
    },
    {
      key: 'cities',
      label: 'Города',
      icon: <LocationCityIcon />,
      onClick: (region: Region) => navigate(`/admin/regions/${region.id}/cities`),
      color: 'info' as const
    },
    {
      key: 'toggle',
      label: (region: Region) => region.is_active ? 'Деактивировать' : 'Активировать',
      icon: (region: Region) => region.is_active ? <ToggleOffIcon /> : <ToggleOnIcon />,
      onClick: handleToggleStatus,
      color: 'warning' as const
    },
    {
      key: 'delete',
      label: 'Удалить',
      icon: <DeleteIcon />,
      onClick: handleDelete,
      color: 'error' as const,
      confirmationText: 'Вы уверены, что хотите удалить этот регион?'
    }
  ], [navigate, handleToggleStatus, handleDelete]);

  return (
    <Box sx={tablePageStyles.pageContainer}>
      <PageTable<Region>
        header={headerConfig}
        search={searchConfig}
        filters={filtersConfig}
        columns={columns}
        rows={regions}
        actions={actionsConfig}
        loading={isLoading}
        pagination={{
          page: page + 1,
          totalItems,
          rowsPerPage: PER_PAGE,
          onPageChange: handlePageChange
        }}
        emptyState={{
          title: searchQuery || selectedStatus !== 'all' ? 'Регионы не найдены' : 'Нет регионов',
          description: searchQuery || selectedStatus !== 'all'
            ? 'Попробуйте изменить критерии поиска'
            : 'Добавьте первый регион в систему',
          action: (!searchQuery && selectedStatus === 'all') ? {
            label: 'Добавить регион',
            icon: <AddIcon />,
            onClick: () => navigate('/admin/regions/new')
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

export default RegionsPageNew; 