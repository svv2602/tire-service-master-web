/**
 * ServicesPageNew - Новая версия страницы управления категориями услуг
 * Миграция на PageTable компонент для унификации дизайна
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  Chip,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Category as CategoryIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon,
  FormatListNumbered as FormatListNumberedIcon,
  CalendarToday as CalendarTodayIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
  useGetServiceCategoriesQuery,
  useDeleteServiceCategoryMutation,
  useToggleServiceCategoryActiveMutation,
} from '../../api/serviceCategories.api';
import { ServiceCategoryData } from '../../types/service';

// Импорты UI компонентов
import { Box, Typography } from '../../components/ui';
import { PageTable } from '../../components/common/PageTable';
import type { 
  PageHeaderConfig, 
  SearchConfig, 
  FilterConfig, 
  ActionConfig 
} from '../../components/common/PageTable';
import type { Column } from '../../components/ui/Table/Table';
import Notification from '../../components/Notification';

// Импорт централизованных стилей
import { getTablePageStyles } from '../../styles';

const ServicesPageNew: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const tablePageStyles = getTablePageStyles(theme);

  // Состояние для поиска, фильтрации и пагинации
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('');
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

  // RTK Query хуки
  const { 
    data: categoriesData, 
    isLoading, 
    error 
  } = useGetServiceCategoriesQuery({
    query: search || undefined,
    active: activeFilter !== '' ? activeFilter === 'true' : undefined,
    page: page + 1,
    per_page: PER_PAGE,
  });

  const [deleteCategory] = useDeleteServiceCategoryMutation();
  const [toggleActive] = useToggleServiceCategoryActiveMutation();

  const categories = categoriesData?.data || [];
  const totalItems = categoriesData?.pagination?.total_count || 0;

  // Обработчики событий
  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(0);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleToggleActive = useCallback(async (category: ServiceCategoryData) => {
    try {
      await toggleActive({ 
        id: category.id.toString(), 
        is_active: !category.is_active 
      }).unwrap();
      setNotification({
        open: true,
        message: 'Статус категории успешно изменен',
        severity: 'success'
      });
    } catch (error: any) {
      setNotification({
        open: true,
        message: 'Ошибка при изменении статуса',
        severity: 'error'
      });
    }
  }, [toggleActive]);

  const handleDelete = useCallback(async (category: ServiceCategoryData) => {
    try {
      await deleteCategory(category.id.toString()).unwrap();
      setNotification({
        open: true,
        message: `Категория "${category.name}" успешно удалена`,
        severity: 'success'
      });
    } catch (error: any) {
      setNotification({
        open: true,
        message: 'Ошибка при удалении категории',
        severity: 'error'
      });
    }
  }, [deleteCategory]);

  const handleCloseNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, open: false }));
  }, []);

  // Конфигурация PageTable
  const headerConfig: PageHeaderConfig = useMemo(() => ({
    title: 'Категории услуг (PageTable)',
    actions: [
      {
        id: 'add',
        label: 'Добавить категорию',
        icon: <AddIcon />,
        onClick: () => navigate('/admin/services/new'),
        variant: 'contained'
      }
    ]
  }), [navigate]);

  const searchConfig: SearchConfig = useMemo(() => ({
    placeholder: 'Поиск по названию категории...',
    value: search,
    onChange: handleSearchChange
  }), [search, handleSearchChange]);

  const filtersConfig: FilterConfig[] = useMemo(() => [
    {
      id: 'status',
      label: 'Статус',
      type: 'select',
      value: activeFilter,
      options: [
        { value: '', label: 'Все' },
        { value: 'true', label: 'Активные' },
        { value: 'false', label: 'Неактивные' }
      ],
      onChange: (value: any) => {
        setActiveFilter(value as string);
        setPage(0);
      }
    }
  ], [activeFilter]);

  const columns: Column[] = useMemo(() => [
    {
      id: 'name',
      label: 'Категория',
      sortable: true,
      render: (category: ServiceCategoryData) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CategoryIcon sx={{ color: theme.palette.primary.main, fontSize: '20px' }} />
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {category.name}
            </Typography>
            {category.description && (
              <Typography 
                variant="caption" 
                sx={{ 
                  color: theme.palette.text.secondary,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  maxWidth: '300px'
                }}
              >
                {category.description}
              </Typography>
            )}
          </Box>
        </Box>
      )
    },
    {
      id: 'services_count',
      label: 'Услуги',
      align: 'center',
      hideOnMobile: true,
      render: (category: ServiceCategoryData) => (
        <Chip
          icon={<FormatListNumberedIcon sx={{ fontSize: '16px !important' }} />}
          label={category.services_count || 0}
          size="small"
          variant="outlined"
          color="primary"
        />
      )
    },
    {
      id: 'is_active',
      label: 'Статус',
      align: 'center',
      render: (category: ServiceCategoryData) => (
        <Chip
          label={category.is_active ? 'Активна' : 'Неактивна'}
          color={category.is_active ? 'success' : 'default'}
          size="small"
        />
      )
    },
    {
      id: 'created_at',
      label: 'Дата создания',
      align: 'center',
      hideOnMobile: true,
      render: (category: ServiceCategoryData) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <CalendarTodayIcon sx={{ fontSize: '16px', color: theme.palette.text.secondary }} />
          <Typography variant="body2">
            {category.created_at ? new Date(category.created_at).toLocaleDateString('ru-RU', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            }) : '-'}
          </Typography>
        </Box>
      )
    }
  ], [theme.palette]);

  const actionsConfig: ActionConfig<ServiceCategoryData>[] = useMemo(() => [
    {
      label: 'Редактировать',
      icon: <EditIcon />,
      onClick: (category: ServiceCategoryData) => navigate(`/admin/services/${category.id}/edit`),
      color: 'primary'
    },
    {
      label: 'Переключить статус',
      icon: <ToggleOnIcon />,
      onClick: (category: ServiceCategoryData) => handleToggleActive(category),
      color: 'warning'
    },
    {
      label: 'Удалить',
      icon: <DeleteIcon />,
      onClick: (category: ServiceCategoryData) => handleDelete(category),
      color: 'error',
      requireConfirmation: true,
      confirmationConfig: {
        title: 'Подтверждение удаления',
        message: 'Вы действительно хотите удалить эту категорию? Это действие нельзя будет отменить.',
        confirmLabel: 'Удалить',
        cancelLabel: 'Отмена',
      }
    }
  ], [navigate, handleToggleActive, handleDelete]);

  return (
    <Box sx={tablePageStyles.container}>
      <PageTable<ServiceCategoryData>
        header={headerConfig}
        search={searchConfig}
        filters={filtersConfig}
        columns={columns}
        rows={categories}
        actions={actionsConfig}
        loading={isLoading}
        pagination={{
          page,
          totalItems,
          rowsPerPage: PER_PAGE,
          onPageChange: handlePageChange
        }}
        empty={
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6">
              {search || activeFilter !== '' ? 'Категории не найдены' : 'Нет категорий услуг'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {search || activeFilter !== '' 
                ? 'Попробуйте изменить критерии поиска'
                : 'Создайте первую категорию услуг для начала работы'
              }
            </Typography>
          </Box>
        }
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

export default ServicesPageNew;
