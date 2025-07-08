/**
 * CarBrandsPageNew - Новая версия страницы управления брендами автомобилей
 * Миграция на PageTable компонент для унификации дизайна
 * 
 * Функциональность:
 * - Просмотр всех брендов автомобилей в табличном формате
 * - Поиск брендов по названию
 * - Фильтрация по статусу активности
 * - Создание новых брендов
 * - Редактирование существующих брендов
 * - Удаление брендов с подтверждением
 * - Переключение статуса активности
 * - Пагинация результатов
 * - Использование PageTable для унифицированного UI
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  Avatar,
  IconButton,
  Tooltip,
  useTheme,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DirectionsCar as CarIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon,
  CalendarToday as CalendarTodayIcon,
  FormatListNumbered as FormatListNumberedIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  DriveEta as DriveEtaIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
  useGetCarBrandsQuery,
  useDeleteCarBrandMutation,
  useToggleCarBrandActiveMutation,
} from '../../api/carBrands.api';
import { CarBrand } from '../../types/car';
import config from '../../config';

// Импорты UI компонентов
import { Box, Typography } from '../../components/ui';
import { PageTable } from '../../components/common/PageTable';
import type { 
  PageHeaderConfig, 
  SearchConfig, 
  FilterConfig, 
  Column, 
  ActionConfig 
} from '../../components/common/PageTable';

// Прямой импорт ActionsMenu для избежания проблем с экспортом
import { ActionsMenu, ActionItem } from '../../components/ui/ActionsMenu/ActionsMenu';

// Импорт централизованных стилей
import { getTablePageStyles, SIZES } from '../../styles';

const CarBrandsPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const theme = useTheme();
  
  // Инициализация централизованных стилей
  const tablePageStyles = getTablePageStyles(theme);
  
  // Функция для формирования URL логотипа
  const getLogoUrl = useCallback((logo: string | null): string | undefined => {
    if (!logo) return undefined;
    if (logo.startsWith('http') || logo.startsWith('/storage/')) {
      return logo;
    }
    return `${config.API_URL}${logo}`;
  }, []);
  
  // Состояние для поиска, фильтрации и пагинации
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('');
  const [page, setPage] = useState(0);
  const rowsPerPage = 25;

  // RTK Query хуки
  const { 
    data: brandsData, 
    isLoading, 
    error 
  } = useGetCarBrandsQuery({
    query: search || undefined,
    is_active: activeFilter !== '' ? activeFilter === 'true' : undefined,
    page: page,
    per_page: rowsPerPage,
  });

  const [deleteBrand] = useDeleteCarBrandMutation();
  const [toggleActive] = useToggleCarBrandActiveMutation();

  // Мемоизированные обработчики событий
  const handleToggleActive = useCallback(async (brand: CarBrand) => {
    try {
      await toggleActive({ 
        id: brand.id.toString(), 
        is_active: !brand.is_active 
      }).unwrap();
      return {
        success: true,
        message: !brand.is_active ? t('admin.carBrands.brandActivated') : t('admin.carBrands.brandDeactivated')
      };
    } catch (error) {
      return {
        success: false,
        message: t('admin.carBrands.statusChangeError')
      };
    }
  }, [toggleActive]);

  const handleDeleteBrand = useCallback(async (brand: CarBrand) => {
    try {
      await deleteBrand(brand.id.toString()).unwrap();
      return {
        success: true,
        message: t('admin.carBrands.brandDeletedSuccess')
      };
    } catch (error: any) {
      let errorMessage = t('admin.carBrands.brandDeleteError');
      
      if (error.data?.error) {
        errorMessage = error.data.error;
      } else if (error.data?.message) {
        errorMessage = error.data.message;
      } else if (error.data?.errors) {
        errorMessage = Object.values(error.data.errors).join(', ');
      }
      
      return {
        success: false,
        message: errorMessage
      };
    }
  }, [deleteBrand]);

  // Конфигурация фильтров
  const filtersConfig: FilterConfig[] = useMemo(() => [
    {
      id: 'status',
      type: 'select',
      label: t('tables.columns.status'),
      value: activeFilter,
      onChange: (value: any) => {
        setActiveFilter(value as string);
        setPage(0);
      },
      options: [
        { value: 'all', label: t('common.all') },
        { value: 'active', label: t('statuses.active') },
        { value: 'inactive', label: t('statuses.inactive') },
      ],
    },
  ], [activeFilter]);

  // Конфигурация действий для ActionsMenu
  const carBrandActions: ActionItem<CarBrand>[] = useMemo(() => [
    {
      id: 'edit',
      label: t('tables.actions.edit'),
      icon: <EditIcon />,
      onClick: (brand: CarBrand) => navigate(`/admin/car-brands/${brand.id}/edit`),
      color: 'primary',
      tooltip: t('admin.carBrands.editBrand')
    },
    {
      id: 'delete',
      label: t('tables.actions.delete'),
      icon: <DeleteIcon />,
      onClick: (brand: CarBrand) => handleDeleteBrand(brand),
      color: 'error',
      tooltip: t('admin.carBrands.deleteBrand'),
      requireConfirmation: true,
      confirmationConfig: {
        title: t('common.confirmDelete'),
        message: t('common.confirmDeleteMessage'),
        confirmLabel: t('tables.actions.delete'),
        cancelLabel: t('common.cancel'),
      },
    }
  ], [navigate, handleDeleteBrand]);

  // Конфигурация колонок
  const columns: Column<CarBrand>[] = useMemo(() => [
    {
      id: 'name',
      label: t('admin.carBrands.brand'),
      sortable: true,
      render: (brand: CarBrand) => (
        <Box sx={tablePageStyles.avatarContainer}>
          {brand.logo ? (
            <Avatar 
              src={brand.logo} 
              alt={brand.name}
              sx={{ width: 40, height: 40 }}
            />
          ) : (
            <Avatar sx={{ width: 40, height: 40, bgcolor: 'grey.300' }}>
              <DriveEtaIcon />
            </Avatar>
          )}
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {brand.name}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'status',
      label: t('tables.columns.status'),
      align: 'center',
      hideOnMobile: false,
      render: (brand: CarBrand) => (
        <Tooltip title={t('admin.carBrands.toggleStatusTooltip', { action: brand.is_active ? t('common.deactivate') : t('common.activate') })}>
          <IconButton
            onClick={() => handleToggleActive(brand)}
            size="small"
            sx={{ 
              color: brand.is_active ? 'success.main' : 'error.main',
              '&:hover': { 
                backgroundColor: brand.is_active ? 'success.light' : 'error.light',
                opacity: 0.1
              }
            }}
          >
            {brand.is_active ? <CheckCircleIcon /> : <CancelIcon />}
          </IconButton>
        </Tooltip>
      ),
    },
    {
      id: 'models_count',
      label: t('admin.carBrands.modelsCount'),
      align: 'center',
      hideOnMobile: true,
      render: (brand: CarBrand) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
          <FormatListNumberedIcon fontSize="small" color="action" />
          <Typography variant="body2">
            {brand.models_count || 0}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'created_at',
      label: t('tables.columns.createdAt'),
      align: 'center',
      hideOnMobile: true,
      render: (brand: CarBrand) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
          <CalendarTodayIcon fontSize="small" color="action" />
          <Typography variant="body2">
            {new Date(brand.created_at).toLocaleDateString('ru-RU')}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'actions',
      label: t('tables.columns.actions'),
      align: 'right',
      hideOnMobile: false,
      render: (brand: CarBrand) => (
        <ActionsMenu 
          actions={carBrandActions} 
          item={brand} 
          menuThreshold={0}
          sx={{ display: 'flex', justifyContent: 'flex-end' }}
        />
      ),
    },
  ], [tablePageStyles, handleToggleActive, carBrandActions]);

  // Извлечение данных из ответа API
  const brands = brandsData?.data || [];
  const totalItems = brandsData?.pagination?.total_count || 0;

  return (
    <PageTable<CarBrand>
      header={{
        title: t('admin.carBrands.title'),
        actions: [
          {
            label: t('admin.carBrands.createBrand'),
            icon: <AddIcon />,
            color: 'primary',
            variant: 'contained',
            onClick: () => navigate('/admin/car-brands/new'),
          },
        ],
      }}
      search={{
        placeholder: t('admin.carBrands.searchPlaceholder'),
        value: search,
        onChange: setSearch,
      }}
      filters={filtersConfig}
      columns={columns}
      rows={brands}
      loading={isLoading}
      pagination={{
        page,
        rowsPerPage,
        totalItems,
        onPageChange: setPage,
      }}
      emptyState={{
        title: search || activeFilter !== '' ? t('admin.carBrands.brandsNotFound') : t('admin.carBrands.noBrands'),
        description: search || activeFilter !== '' 
          ? t('admin.carBrands.changeSearchCriteria')
          : t('admin.carBrands.createFirstBrand'),
        action: (!search && activeFilter === '') ? {
          label: t('admin.carBrands.createBrand'),
          icon: <AddIcon />,
          onClick: () => navigate('/admin/car-brands/new')
        } : undefined
      }}
    />
  );
};

export default CarBrandsPage; 