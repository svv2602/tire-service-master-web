import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box,
  Typography,
  Avatar,
  Chip
} from '@mui/material';
import { useTranslation } from 'react-i18next';
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
import { ActionsMenu, ActionItem } from '../../components/ui/ActionsMenu/ActionsMenu';
import Notification from '../../components/Notification';
import { getTablePageStyles } from '../../styles';
import { useLocalizedName } from '../../utils/localizationHelpers';

// Импорты API
import {
  useGetRegionsQuery,
  useDeleteRegionMutation,
  useUpdateRegionMutation,
} from '../../api/regions.api';

// Типы
import type { Region } from '../../types/models';

interface RegionsPageProps {}

const RegionsPage: React.FC<RegionsPageProps> = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const theme = useTheme();
  const tablePageStyles = getTablePageStyles(theme);
  const localizedName = useLocalizedName();
  
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
    setPage(newPage);
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
      showNotification(t('admin.regions.messages.deleteSuccess'), 'success');
    } catch (error: any) {
      let errorMessage = t('admin.regions.messages.deleteError');
      if (error.data?.message) {
        errorMessage = error.data.message;
      } else if (error.data?.errors) {
        errorMessage = Object.values(error.data.errors).join(', ');
      }
      showNotification(errorMessage, 'error');
    }
  }, [deleteRegion, showNotification, t]);

  // Обработка переключения статуса
  const handleToggleStatus = useCallback(async (region: Region) => {
    try {
      await updateRegion({
        id: region.id,
        region: { ...region, is_active: !region.is_active }
      }).unwrap();
      const action = !region.is_active ? t('admin.regions.messages.activated') : t('admin.regions.messages.deactivated');
      showNotification(t('admin.regions.messages.statusSuccess', { action }), 'success');
    } catch (error: any) {
      let errorMessage = t('admin.regions.messages.statusError');
      if (error.data?.message) {
        errorMessage = error.data.message;
      } else if (error.data?.errors) {
        errorMessage = Object.values(error.data.errors).join(', ');
      }
      showNotification(errorMessage, 'error');
    }
  }, [updateRegion, showNotification, t]);

  // Форматирование даты
  const formatDate = useCallback((dateString: string | null | undefined) => {
    if (!dateString) return '—';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '—';
      
      return date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      console.warn('Ошибка форматирования даты:', dateString, error);
      return '—';
    }
  }, []);

  // Конфигурация заголовка
  const headerConfig = useMemo(() => ({
    title: t('admin.regions.title'),
    subtitle: t('admin.regions.subtitle'),
    actions: [
      {
        label: t('admin.regions.createRegion'),
        icon: <AddIcon />,
        onClick: () => navigate('/admin/regions/new'),
        variant: 'contained' as const,
        color: 'primary' as const
      }
    ]
  }), [navigate, t]);

  // Конфигурация поиска
  const searchConfig = useMemo(() => ({
    placeholder: t('admin.regions.searchPlaceholder'),
    value: searchQuery,
    onChange: handleSearchChange
  }), [searchQuery, handleSearchChange, t]);

  // Конфигурация фильтров
  const filtersConfig = useMemo(() => [
    {
      id: 'status',
      key: 'status',
      type: 'select' as const,
      label: t('tables.columns.status'),
      value: selectedStatus,
      onChange: handleStatusFilterChange,
      options: [
        { value: 'all', label: t('filters.statusOptions.all') },
        { value: 'active', label: t('filters.statusOptions.active') },
        { value: 'inactive', label: t('filters.statusOptions.inactive') }
      ]
    }
  ], [selectedStatus, handleStatusFilterChange, t]);

  // Конфигурация действий для ActionsMenu
  const regionActions: ActionItem<Region>[] = useMemo(() => [
    {
      id: 'edit',
      label: t('tables.actions.edit'),
      icon: <EditIcon />,
      onClick: (region: Region) => navigate(`/admin/regions/${region.id}/edit`),
      color: 'primary',
      tooltip: t('admin.regions.editRegion')
    },
    {
      id: 'toggle',
      label: (region: Region) => region.is_active ? t('tables.actions.deactivate') : t('tables.actions.activate'),
      icon: (region: Region) => region.is_active ? <ToggleOffIcon /> : <ToggleOnIcon />,
      onClick: handleToggleStatus,
      color: (region: Region) => region.is_active ? 'warning' : 'success',
      tooltip: (region: Region) => region.is_active ? t('admin.regions.toggleStatus.deactivate') : t('admin.regions.toggleStatus.activate'),
      requireConfirmation: true,
      confirmationConfig: {
        title: t('admin.regions.confirmToggle.title'),
        message: t('admin.regions.confirmToggle.message'),
      }
    },
    {
      id: 'delete',
      label: t('tables.actions.delete'),
      icon: <DeleteIcon />,
      onClick: handleDelete,
      color: 'error',
      tooltip: t('admin.regions.deleteRegion'),
      requireConfirmation: true,
      confirmationConfig: {
        title: t('admin.regions.confirmDelete.title'),
        message: t('admin.regions.confirmDelete.message'),
      }
    }
  ], [navigate, handleToggleStatus, handleDelete, t]);

  // Конфигурация колонок
  const columns = useMemo(() => [
    {
      id: 'region',
      key: 'name' as keyof Region,
      label: t('tables.columns.region'),
      sortable: true,
      render: (region: Region) => (
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}>
            <LocationOnIcon />
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
              {localizedName(region)}
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
      label: t('admin.regions.citiesCount'),
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
      label: t('tables.columns.status'),
      sortable: true,
      render: (region: Region) => (
        <Chip
          label={region.is_active ? t('statuses.active') : t('statuses.inactive')}
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
      label: t('tables.columns.createdAt'),
      sortable: true,
      hideOnMobile: true,
      render: (region: Region) => (
        <Typography variant="body2">
          {formatDate(region.created_at)}
        </Typography>
      )
    },
    {
      id: 'actions',
      key: 'actions' as keyof Region,
      label: t('tables.columns.actions'),
      sortable: false,
      render: (region: Region) => (
        <ActionsMenu
          actions={regionActions}
          item={region}
          menuThreshold={0}
        />
      )
    }
  ], [formatDate, regionActions, t]);

  return (
    <Box sx={tablePageStyles.pageContainer}>
      <PageTable<Region>
        header={headerConfig}
        search={searchConfig}
        filters={filtersConfig}
        columns={columns}
        rows={regions}
        loading={isLoading}
        pagination={{
          page: page,
          totalItems,
          rowsPerPage: PER_PAGE,
          onPageChange: handlePageChange
        }}
        emptyState={{
          title: searchQuery || selectedStatus !== 'all' ? t('admin.regions.regionsNotFound') : t('admin.regions.noRegions'),
          description: searchQuery || selectedStatus !== 'all'
            ? t('admin.regions.changeCriteria')
            : t('admin.regions.createFirstRegion'),
          action: (!searchQuery && selectedStatus === 'all') ? {
            label: t('admin.regions.createRegion'),
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

export { RegionsPage };
export default RegionsPage; 