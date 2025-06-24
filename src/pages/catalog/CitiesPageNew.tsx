import React, { useState, useMemo, useCallback } from 'react';
import { useTheme } from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocationOn as LocationOnIcon,
  LocationCity as LocationCityIcon,
} from '@mui/icons-material';
import { 
  useGetCitiesQuery, 
  useDeleteCityMutation,
  useUpdateCityMutation,
} from '../../api/cities.api';
import { useGetRegionsQuery } from '../../api/regions.api';
import { City, Region } from '../../types/models';

// Импорты UI компонентов
import { Box, Typography, CircularProgress, Alert } from '../../components/ui';
import Notification from '../../components/Notification';

// Импорт PageTable компонента
import { PageTable } from '../../components/common/PageTable';
import type { 
  PageHeaderConfig,
  SearchConfig,
  FilterConfig,
  ActionConfig
} from '../../components/common/PageTable';
import type { Column } from '../../components/ui/Table/Table';

// Импорт централизованных стилей
import { getTablePageStyles } from '../../styles/components';

const CitiesPageNew: React.FC = () => {
  const theme = useTheme();
  
  // Инициализация централизованных стилей
  const tablePageStyles = getTablePageStyles(theme);
  
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState<string>('');
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(25);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  // RTK Query хуки
  const { data: citiesData, isLoading: citiesLoading, error: citiesError } = useGetCitiesQuery({
    query: search || undefined,
    region_id: regionFilter ? Number(regionFilter) : undefined,
    page: page + 1,
    per_page: rowsPerPage,
  });

  const { data: regionsData } = useGetRegionsQuery({});
  const [updateCity] = useUpdateCityMutation();
  const [deleteCity] = useDeleteCityMutation();

  const isLoading = citiesLoading;
  const error = citiesError;
  const cities = citiesData?.data || [];
  const totalItems = citiesData?.pagination?.total_count || 0;
  const regions = useMemo(() => regionsData?.data || [], [regionsData?.data]);

  // Обработчики действий
  const handleCreateCity = useCallback(() => {
    setNotification({
      open: true,
      message: 'Функция создания города будет добавлена позже',
      severity: 'info'
    });
  }, []);

  const handleEditCity = useCallback((city: City) => {
    setNotification({
      open: true,
      message: `Редактирование города: ${city.name}`,
      severity: 'info'
    });
  }, []);

  const handleToggleStatus = useCallback(async (city: City) => {
    try {
      await updateCity({
        id: Number(city.id),
        city: { is_active: !city.is_active }
      }).unwrap();
      setNotification({
        open: true,
        message: `Город ${!city.is_active ? 'активирован' : 'деактивирован'}`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Ошибка при изменении статуса:', error);
      setNotification({
        open: true,
        message: 'Ошибка при изменении статуса города',
        severity: 'error'
      });
    }
  }, [updateCity]);

  const handleDeleteCity = useCallback(async (city: City) => {
    try {
      await deleteCity(Number(city.id)).unwrap();
      setNotification({
        open: true,
        message: 'Город успешно удален',
        severity: 'success'
      });
    } catch (error) {
      console.error('Ошибка при удалении города:', error);
      setNotification({
        open: true,
        message: 'Не удалось удалить город',
        severity: 'error'
      });
    }
  }, [deleteCity]);

  // Обработчики фильтров
  const handleRegionFilterChange = useCallback((value: string | number) => {
    setRegionFilter(value.toString());
    setPage(0);
  }, []);

  // Закрытие уведомления
  const handleCloseNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, open: false }));
  }, []);

  // Конфигурации PageTable
  const headerConfig: PageHeaderConfig = useMemo(() => ({
    title: 'Управление городами (PageTable)',
    actions: [
      {
        id: 'create',
        label: 'Добавить город',
        icon: <AddIcon />,
        variant: 'contained',
        onClick: handleCreateCity,
      },
    ],
  }), [handleCreateCity]);

  const searchConfig: SearchConfig = useMemo(() => ({
    placeholder: 'Поиск по названию города',
    value: search,
    onChange: setSearch,
    showClearButton: true,
  }), [search]);

  const filtersConfig: FilterConfig[] = useMemo(() => [
    {
      id: 'region',
      type: 'select',
      label: 'Регион',
      value: regionFilter,
      onChange: handleRegionFilterChange,
      options: [
        { value: '', label: 'Все регионы' },
        ...(regions.map((region: Region) => ({
          value: region.id.toString(),
          label: region.name
        })))
      ],
    },
  ], [regionFilter, handleRegionFilterChange, regions]);

  const columns: Column[] = useMemo(() => [
    {
      id: 'name',
      label: 'Название',
      wrap: true,
      format: (value: any, row: any) => {
        const city = row as City;
        return (
          <Box sx={tablePageStyles.avatarContainer}>
            <LocationCityIcon color="action" />
            <Typography>{city.name}</Typography>
          </Box>
        );
      }
    },
    {
      id: 'region',
      label: 'Регион',
      wrap: true,
      format: (value: any, row: any) => {
        const city = row as City;
        return (
          <Box sx={tablePageStyles.avatarContainer}>
            <LocationOnIcon color="action" />
            <Typography>
              {regions.find(r => r.id.toString() === city.region_id.toString())?.name}
            </Typography>
          </Box>
        );
      }
    },
    {
      id: 'is_active',
      label: 'Статус',
      align: 'center',
      format: (value: any, row: any) => {
        const city = row as City;
        return (
          <Box
            sx={{
              px: 1,
              py: 0.5,
              borderRadius: 1,
              fontSize: '0.75rem',
              fontWeight: 'medium',
              textAlign: 'center',
              backgroundColor: city.is_active ? 'success.light' : 'error.light',
              color: city.is_active ? 'success.dark' : 'error.dark',
              cursor: 'pointer',
            }}
            onClick={() => handleToggleStatus(city)}
          >
            {city.is_active ? 'Активен' : 'Неактивен'}
          </Box>
        );
      }
    },
  ], [regions, tablePageStyles, handleToggleStatus]);

  const actionsConfig: ActionConfig[] = useMemo(() => [
    {
      id: 'edit',
      label: 'Редактировать',
      icon: <EditIcon />,
      onClick: (city: City) => handleEditCity(city),
    },
    {
      id: 'delete',
      label: 'Удалить',
      icon: <DeleteIcon />,
      color: 'error',
      onClick: (city: City) => handleDeleteCity(city),
      requireConfirmation: true,
      confirmationText: 'Вы действительно хотите удалить этот город? Это действие нельзя будет отменить.',
    },
  ], [handleEditCity, handleDeleteCity]);

  if (isLoading) {
    return (
      <Box sx={tablePageStyles.loadingContainer}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={tablePageStyles.pageContainer}>
        <Alert severity="error">
          Произошла ошибка при загрузке данных: {(error as any)?.data?.message || 'Неизвестная ошибка'}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={tablePageStyles.pageContainer}>
      <PageTable<City>
        header={headerConfig}
        search={searchConfig}
        filters={filtersConfig}
        columns={columns}
        rows={cities}
        actions={actionsConfig}
        loading={isLoading}
        pagination={{
          page,
          rowsPerPage,
          totalItems,
          onPageChange: setPage,
        }}
      />

      {/* Уведомления */}
      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={handleCloseNotification}
      />
    </Box>
  );
};

export default CitiesPageNew; 