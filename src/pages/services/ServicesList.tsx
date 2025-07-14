/**
 * ServicesList - Страница управления услугами в категории
 * Поддержка локализации согласно TABLE_LOCALIZATION_RULES.md
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Chip,
  useTheme,
  Button,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Build as BuildIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon,
  ArrowBack as ArrowBackIcon,
  CalendarToday as CalendarTodayIcon,
  FormatListNumbered as FormatListNumberedIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGetServiceCategoriesQuery } from '../../api/serviceCategories.api';
import { Service } from '../../types/service';

// Импорты UI компонентов
import { Table } from '../../components/ui/Table';
import type { Column } from '../../components/ui/Table/Table';
import { Pagination } from '../../components/ui/Pagination';
import { TextField } from '../../components/ui';
import { Select } from '../../components/ui/Select';
import Notification from '../../components/Notification';

// Импорт централизованных стилей
import { getTablePageStyles } from '../../styles';

// Импорт хелперов локализации
import { useLocalizedName } from '../../utils/localizationHelpers';

const ServicesList: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const { t } = useTranslation(['components', 'tables']);
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
  const { data: categoriesData } = useGetServiceCategoriesQuery({
    locale: localStorage.getItem('i18nextLng') || 'ru',
  });

  const categories = categoriesData?.data || [];
  const category = categories.find(c => c.id.toString() === categoryId);

  // Моковые данные для услуг (пока нет API)
  const services: Service[] = useMemo(() => [
    {
      id: 1,
      name: 'Замена шин',
      name_uk: 'Заміна шин',
      description: 'Замена летних/зимних шин',
      description_uk: 'Заміна літніх/зимових шин',
      category_id: parseInt(categoryId || '1'),
      is_active: true,
      sort_order: 1,
      created_at: '2024-01-01T00:00:00Z',
      localized_name: localStorage.getItem('i18nextLng') === 'uk' ? 'Заміна шин' : 'Замена шин',
      localized_description: localStorage.getItem('i18nextLng') === 'uk' ? 'Заміна літніх/зимових шин' : 'Замена летних/зимних шин'
    },
    {
      id: 2,
      name: 'Балансировка колес',
      name_uk: 'Балансування коліс',
      description: 'Балансировка колес на станке',
      description_uk: 'Балансування коліс на верстаті',
      category_id: parseInt(categoryId || '1'),
      is_active: true,
      sort_order: 2,
      created_at: '2024-01-01T00:00:00Z',
      localized_name: localStorage.getItem('i18nextLng') === 'uk' ? 'Балансування коліс' : 'Балансировка колес',
      localized_description: localStorage.getItem('i18nextLng') === 'uk' ? 'Балансування коліс на верстаті' : 'Балансировка колес на станке'
    }
  ], [categoryId]);

  // Фильтрация услуг
  const filteredServices = useMemo(() => {
    return services.filter(service => {
      const matchesSearch = !search || 
        service.localized_name?.toLowerCase().includes(search.toLowerCase()) ||
        service.name.toLowerCase().includes(search.toLowerCase());
      
      const matchesActive = activeFilter === '' || 
        (activeFilter === 'true' && service.is_active) ||
        (activeFilter === 'false' && !service.is_active);
      
      return matchesSearch && matchesActive;
    });
  }, [services, search, activeFilter]);

  // Пагинация
  const paginatedServices = useMemo(() => {
    const startIndex = page * PER_PAGE;
    return filteredServices.slice(startIndex, startIndex + PER_PAGE);
  }, [filteredServices, page]);

  // Обработчики событий
  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(0);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage - 1);
  }, []);

  const handleToggleActive = useCallback(async (service: Service) => {
    // Заглушка для переключения статуса
    setNotification({
      open: true,
      message: t('servicesList.messages.statusSuccess'),
      severity: 'success'
    });
  }, [t]);

  const handleDelete = useCallback(async (service: Service) => {
    // Заглушка для удаления
    setNotification({
      open: true,
      message: t('servicesList.messages.deleteSuccess', { name: localizedName(service) }),
      severity: 'success'
    });
  }, [t, localizedName]);

  const handleCloseNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, open: false }));
  }, []);

  // Конфигурация колонок
  const columns: Column[] = useMemo(() => [
    {
      id: 'name',
      label: t('tables.columns.service'),
      sortable: true,
      render: (service: Service) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BuildIcon sx={{ color: theme.palette.primary.main, fontSize: '20px' }} />
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {localizedName(service)}
            </Typography>
            {(service.localized_description || service.description) && (
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
                {service.localized_description || service.description}
              </Typography>
            )}
          </Box>
        </Box>
      )
    },
    {
      id: 'sort_order',
      label: t('tables.columns.sortOrder'),
      align: 'center',
      hideOnMobile: true,
      render: (service: Service) => (
        <Chip
          icon={<FormatListNumberedIcon sx={{ fontSize: '16px !important' }} />}
          label={service.sort_order || 0}
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
      render: (service: Service) => (
        <Chip
          label={service.is_active ? t('tables.columns.active') : t('tables.columns.inactive')}
          color={service.is_active ? 'success' : 'default'}
          size="small"
          variant="outlined"
        />
      )
    },
    {
      id: 'actions',
      label: t('tables.columns.actions'),
      align: 'center',
      render: (service: Service) => (
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
          <Tooltip title={t('tables.actions.edit')}>
            <IconButton
              size="small"
              color="primary"
              onClick={() => navigate(`/admin/services/${categoryId}/services/${service.id}/edit`)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('tables.actions.toggleActive')}>
            <IconButton
              size="small"
              color="warning"
              onClick={() => handleToggleActive(service)}
            >
              {service.is_active ? <ToggleOffIcon fontSize="small" /> : <ToggleOnIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
          <Tooltip title={t('tables.actions.delete')}>
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDelete(service)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ], [theme, localizedName, t, navigate, categoryId, handleToggleActive, handleDelete]);

  return (
    <Box sx={tablePageStyles.container}>
      {/* Заголовок */}
      <Box sx={tablePageStyles.headerContainer}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
            {t('servicesList.title')}
          </Typography>
          {category && (
            <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
              {localizedName(category)}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/admin/services')}
          >
            {t('common.back')}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate(`/admin/services/${categoryId}/services/new`)}
          >
            {t('servicesList.addService')}
          </Button>
        </Box>
      </Box>

      {/* Поиск и фильтры */}
      <Box sx={tablePageStyles.filtersContainer}>
        <TextField
          placeholder={t('tables.search.services')}
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          sx={{ minWidth: 300 }}
        />
        <Select
          label={t('tables.columns.status')}
          value={activeFilter}
          onChange={(value) => {
            setActiveFilter(value as string);
            setPage(0);
          }}
          options={[
            { value: '', label: t('tables.filters.statusOptions.all') },
            { value: 'true', label: t('tables.filters.statusOptions.active') },
            { value: 'false', label: t('tables.filters.statusOptions.inactive') }
          ]}
          sx={{ minWidth: 200 }}
        />
      </Box>

      {/* Таблица */}
      <Box sx={tablePageStyles.tableContainer}>
        <Table
          columns={columns}
          rows={paginatedServices}
          loading={false}
          empty={
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6">
                {search || activeFilter !== '' ? t('servicesList.emptyState.notFound') : t('servicesList.emptyState.noServices')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {search || activeFilter !== '' 
                  ? t('servicesList.emptyState.changeSearch')
                  : t('servicesList.emptyState.addFirst')
                }
              </Typography>
            </Box>
          }
        />
      </Box>

      {/* Пагинация */}
      {filteredServices.length > PER_PAGE && (
        <Box sx={tablePageStyles.paginationContainer}>
          <Pagination
            count={Math.ceil(filteredServices.length / PER_PAGE)}
            page={page + 1}
            onChange={handlePageChange}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
          />
        </Box>
      )}

      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={handleCloseNotification}
      />
    </Box>
  );
};

export default ServicesList; 