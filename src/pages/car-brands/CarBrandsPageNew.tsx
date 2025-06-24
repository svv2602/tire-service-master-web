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
  HeaderConfig, 
  SearchConfig, 
  FiltersConfig, 
  Column, 
  ActionsConfig 
} from '../../components/common/PageTable/types';

// Импорт централизованных стилей
import { getTablePageStyles, SIZES } from '../../styles';

const CarBrandsPageNew: React.FC = () => {
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
    page: page + 1,
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

  // Конфигурация заголовка
  const headerConfig: HeaderConfig = useMemo(() => ({
    title: 'Бренды автомобилей (PageTable)',
    actions: [
      {
        label: 'Добавить бренд',
        icon: <AddIcon />,
        variant: 'contained',
        onClick: () => navigate('/admin/car-brands/new')
      }
    ]
  }), [navigate]);

  // Конфигурация поиска
  const searchConfig: SearchConfig = useMemo(() => ({
    placeholder: 'Поиск по названию бренда',
    value: search,
    onChange: (value) => {
      setSearch(value);
      setPage(0);
    }
  }), [search]);

  // Конфигурация фильтров
  const filtersConfig: FiltersConfig = useMemo(() => ({
    filters: [
      {
        type: 'select',
        label: 'Статус',
        value: activeFilter,
        onChange: (value) => {
          setActiveFilter(value as string);
          setPage(0);
        },
        options: [
          { value: '', label: 'Все' },
          { value: 'true', label: 'Активные' },
          { value: 'false', label: 'Неактивные' }
        ]
      }
    ]
  }), [activeFilter]);

  // Конфигурация колонок
  const columns: Column<CarBrand>[] = useMemo(() => [
    {
      id: 'brand',
      label: 'Бренд',
      sortable: true,
      render: (brand) => (
        <Box sx={tablePageStyles.avatarContainer}>
          {brand.logo ? (
            <Avatar 
              src={getLogoUrl(brand.logo)} 
              alt={brand.name}
              variant="rounded"
              sx={{ 
                width: SIZES.icon.medium * 1.5, 
                height: SIZES.icon.medium * 1.5,
                borderRadius: SIZES.borderRadius.xs
              }}
            />
          ) : (
            <Avatar
              variant="rounded"
              sx={{ 
                width: SIZES.icon.medium * 1.5, 
                height: SIZES.icon.medium * 1.5,
                borderRadius: SIZES.borderRadius.xs,
                bgcolor: 'grey.200'
              }}
            >
              <CarIcon color="disabled" />
            </Avatar>
          )}
          <Typography variant="body2" fontWeight="medium">
            {brand.name}
          </Typography>
        </Box>
      )
    },
    {
      id: 'is_active',
      label: 'Статус',
      align: 'center',
      hideOnMobile: false,
      render: (brand) => (
        <Tooltip title={`Нажмите чтобы ${brand.is_active ? 'деактивировать' : 'активировать'}`}>
          <IconButton
            onClick={() => handleToggleActive(brand)}
            color={brand.is_active ? 'success' : 'default'}
            size="small"
          >
            {brand.is_active ? <ToggleOnIcon /> : <ToggleOffIcon />}
          </IconButton>
        </Tooltip>
      )
    },
    {
      id: 'models_count',
      label: 'Кол-во моделей',
      align: 'center',
      hideOnMobile: true,
      render: (brand) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
          <FormatListNumberedIcon fontSize="small" color="action" />
          <Typography variant="body2">
            {brand.models_count || 0}
          </Typography>
        </Box>
      )
    },
    {
      id: 'created_at',
      label: 'Дата создания',
      align: 'center',
      hideOnMobile: true,
      render: (brand) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
          <CalendarTodayIcon fontSize="small" color="action" />
          <Typography variant="body2">
            {new Date(brand.created_at).toLocaleDateString('ru-RU')}
          </Typography>
        </Box>
      )
    }
  ], [tablePageStyles.avatarContainer, getLogoUrl, handleToggleActive]);

  // Конфигурация действий
  const actionsConfig: ActionsConfig<CarBrand> = useMemo(() => ({
    actions: [
      {
        label: 'Редактировать',
        icon: <EditIcon />,
        onClick: (brand) => navigate(`/admin/car-brands/${brand.id}/edit`)
      },
      {
        label: 'Удалить',
        icon: <DeleteIcon />,
        onClick: handleDeleteBrand,
        color: 'error',
        requireConfirmation: true,
        confirmationTitle: 'Подтвердите удаление',
        confirmationText: (brand) => 
          `Вы уверены, что хотите удалить бренд "${brand.name}"? Это действие нельзя отменить.`
      }
    ]
  }), [navigate, handleDeleteBrand]);

  // Извлечение данных из ответа API
  const brands = brandsData?.data || [];
  const totalItems = brandsData?.pagination?.total_count || 0;

  return (
    <PageTable<CarBrand>
      headerConfig={headerConfig}
      searchConfig={searchConfig}
      filtersConfig={filtersConfig}
      columns={columns}
      actionsConfig={actionsConfig}
      data={brands}
      loading={isLoading}
      error={error}
      pagination={{
        page,
        rowsPerPage,
        totalItems,
        onPageChange: setPage
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

export default CarBrandsPageNew; 