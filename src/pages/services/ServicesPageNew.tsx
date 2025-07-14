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
import { useTranslation } from 'react-i18next';
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

// Импорт хелперов локализации
import { useLocalizedName } from '../../utils/localizationHelpers';

const ServicesPageNew: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { t } = useTranslation();
  const localizedName = useLocalizedName();
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
    locale: localStorage.getItem('i18nextLng') || 'ru', // Передаем текущий язык
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
        message: t('admin.services.messages.statusSuccess'),
        severity: 'success'
      });
    } catch (error: any) {
      setNotification({
        open: true,
        message: t('admin.services.messages.statusError'),
        severity: 'error'
      });
    }
  }, [toggleActive, t]);

  const handleDelete = useCallback(async (category: ServiceCategoryData) => {
    try {
      await deleteCategory(category.id.toString()).unwrap();
      setNotification({
        open: true,
        message: t('admin.services.messages.deleteSuccess', { name: localizedName(category) }),
        severity: 'success'
      });
    } catch (error: any) {
      setNotification({
        open: true,
        message: t('admin.services.messages.deleteError'),
        severity: 'error'
      });
    }
  }, [deleteCategory, t, localizedName]);

  const handleCloseNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, open: false }));
  }, []);

  // Конфигурация PageTable
  const headerConfig: PageHeaderConfig = useMemo(() => ({
    title: t('admin.services.title'),
    actions: [
      {
        id: 'add',
        label: t('admin.services.createCategory'),
        icon: <AddIcon />,
        onClick: () => navigate('/admin/services/new'),
        variant: 'contained'
      }
    ]
  }), [navigate, t]);

  const searchConfig: SearchConfig = useMemo(() => ({
    placeholder: t('tables.search.serviceCategories'),
    value: search,
    onChange: handleSearchChange
  }), [search, handleSearchChange, t]);

  const filtersConfig: FilterConfig[] = useMemo(() => [
    {
      id: 'status',
      label: t('tables.columns.status'),
      type: 'select',
      value: activeFilter,
      options: [
        { value: '', label: t('tables.filters.statusOptions.all') },
        { value: 'true', label: t('tables.filters.statusOptions.active') },
        { value: 'false', label: t('tables.filters.statusOptions.inactive') }
      ],
      onChange: (value: any) => {
        setActiveFilter(value as string);
        setPage(0);
      }
    }
  ], [activeFilter, t]);

  const columns: Column[] = useMemo(() => [
    {
      id: 'name',
      label: t('tables.columns.serviceCategory'),
      sortable: true,
      render: (category: ServiceCategoryData) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CategoryIcon sx={{ color: theme.palette.primary.main, fontSize: '20px' }} />
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {localizedName(category)}
            </Typography>
            {(category.localized_description || category.description) && (
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
                {category.localized_description || category.description}
              </Typography>
            )}
          </Box>
        </Box>
      )
    },
    {
      id: 'services_count',
      label: t('tables.columns.servicesCount'),
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
      label: t('tables.columns.status'),
      align: 'center',
      render: (category: ServiceCategoryData) => (
        <Chip
          label={category.is_active ? t('tables.columns.active') : t('tables.columns.inactive')}
          color={category.is_active ? 'success' : 'default'}
          size="small"
          variant="outlined"
        />
      )
    },
    {
      id: 'created_at',
      label: t('tables.columns.createdAt'),
      align: 'center',
      hideOnMobile: true,
              render: (category: ServiceCategoryData) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarTodayIcon sx={{ fontSize: '16px', color: theme.palette.text.secondary }} />
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              {category.created_at ? new Date(category.created_at).toLocaleDateString() : '-'}
            </Typography>
          </Box>
        )
    }
  ], [theme, localizedName, t]);

  const actionsConfig: ActionConfig<ServiceCategoryData>[] = useMemo(() => [
    {
      id: 'edit',
      label: t('tables.actions.edit'),
      icon: <EditIcon />,
      onClick: (category: ServiceCategoryData) => navigate(`/admin/services/${category.id}/edit`),
      color: 'primary'
    },
    {
      id: 'toggle',
      label: t('tables.actions.toggleActive'),
      icon: (category: ServiceCategoryData) => category.is_active ? <ToggleOffIcon /> : <ToggleOnIcon />,
      onClick: handleToggleActive,
      color: 'warning'
    },
    {
      id: 'delete',
      label: t('tables.actions.delete'),
      icon: <DeleteIcon />,
      onClick: handleDelete,
      color: 'error',
      requireConfirmation: true,
      confirmationConfig: {
        title: t('admin.services.confirmDelete.title'),
        message: t('admin.services.confirmDelete.message', { name: '' }),
        confirmLabel: t('tables.actions.delete'),
        cancelLabel: t('common.cancel')
      }
    }
  ], [navigate, handleToggleActive, handleDelete, t]);

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
              {search || activeFilter !== '' ? t('admin.services.categoriesNotFound') : t('admin.services.noCategories')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {search || activeFilter !== '' 
                ? t('admin.services.changeCriteria')
                : t('admin.services.createFirstCategory')
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
