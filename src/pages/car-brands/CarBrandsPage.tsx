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
        message: `Бренд ${!brand.is_active ? 'активирован' : 'деактивирован'}`
      };
    } catch (error) {
      return {
        success: false,
        message: 'Ошибка при изменении статуса бренда'
      };
    }
  }, [toggleActive]);

  const handleDeleteBrand = useCallback(async (brand: CarBrand) => {
    try {
      await deleteBrand(brand.id.toString()).unwrap();
      return {
        success: true,
        message: 'Бренд успешно удален'
      };
    } catch (error: any) {
      let errorMessage = 'Ошибка при удалении бренда';
      
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
      label: 'Статус',
      value: activeFilter,
      onChange: (value: any) => {
        setActiveFilter(value as string);
        setPage(0);
      },
      options: [
        { value: 'all', label: 'Все' },
        { value: 'active', label: 'Активные' },
        { value: 'inactive', label: 'Неактивные' },
      ],
    },
  ], [activeFilter]);

  // Конфигурация действий для ActionsMenu
  const carBrandActions: ActionItem<CarBrand>[] = useMemo(() => [
    {
      id: 'edit',
      label: 'Редактировать',
      icon: <EditIcon />,
      onClick: (brand: CarBrand) => navigate(`/admin/car-brands/${brand.id}/edit`),
      color: 'primary',
      tooltip: 'Редактировать бренд'
    },
    {
      id: 'delete',
      label: 'Удалить',
      icon: <DeleteIcon />,
      onClick: (brand: CarBrand) => handleDeleteBrand(brand),
      color: 'error',
      tooltip: 'Удалить бренд',
      requireConfirmation: true,
      confirmationConfig: {
        title: 'Подтвердите удаление',
        message: 'Вы уверены, что хотите удалить этот бренд? Это действие нельзя отменить.',
        confirmLabel: 'Удалить',
        cancelLabel: 'Отмена',
      },
    }
  ], [navigate, handleDeleteBrand]);

  // Конфигурация колонок
  const columns: Column<CarBrand>[] = useMemo(() => [
    {
      id: 'name',
      label: 'Бренд',
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
      label: 'Статус',
      align: 'center',
      hideOnMobile: false,
      render: (brand: CarBrand) => (
        <Tooltip title={`Нажмите чтобы ${brand.is_active ? 'деактивировать' : 'активировать'}`}>
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
      label: 'Моделей',
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
      label: 'Дата создания',
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
      label: 'Действия',
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
        title: 'Бренды автомобилей (PageTable)',
        actions: [
          {
            label: 'Добавить бренд',
            icon: <AddIcon />,
            color: 'primary',
            variant: 'contained',
            onClick: () => navigate('/admin/car-brands/new'),
          },
        ],
      }}
      search={{
        placeholder: 'Поиск по названию бренда...',
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
        title: search || activeFilter !== '' ? 'Бренды не найдены' : 'Нет брендов автомобилей',
        description: search || activeFilter !== '' 
          ? 'Попробуйте изменить критерии поиска'
          : 'Создайте первый бренд автомобиля для начала работы',
        action: (!search && activeFilter === '') ? {
          label: 'Добавить бренд',
          icon: <AddIcon />,
          onClick: () => navigate('/admin/car-brands/new')
        } : undefined
      }}
    />
  );
};

export default CarBrandsPage; 