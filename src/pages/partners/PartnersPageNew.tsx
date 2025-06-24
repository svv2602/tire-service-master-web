/**
 * Страница управления партнерами (PageTable версия)
 * 
 * Функциональность:
 * - Отображение списка партнеров с помощью PageTable
 * - Поиск партнеров по названию компании, контактному лицу, телефону
 * - Пагинация результатов
 * - Редактирование и удаление партнеров
 * - Переключение статуса активности
 * - Унифицированный UI с остальными страницами
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  Avatar,
  IconButton,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { 
  useGetPartnersQuery, 
  useDeletePartnerMutation, 
  useTogglePartnerActiveMutation,
} from '../../api';
import { Partner } from '../../types/models';

// Импорты UI компонентов
import {
  Box,
  Typography,
  Alert,
  Chip,
} from '../../components/ui';

// Импорт PageTable компонента
import { PageTable } from '../../components/common/PageTable';
import type { 
  PageHeaderConfig, 
  SearchConfig, 
  ActionConfig,
  PageTableProps 
} from '../../components/common/PageTable';
import type { Column } from '../../components/ui/Table/Table';

// Хук для debounce поиска
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const PartnersPageNew: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  
  // Состояние для поиска и пагинации
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  
  // Состояние для ошибок
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Debounce для поиска
  const debouncedSearch = useDebounce(search, 300);

  // Мемоизированные параметры запроса
  const queryParams = useMemo(() => ({
    query: debouncedSearch || undefined,
    page: page + 1,
    per_page: pageSize,
  }), [debouncedSearch, page, pageSize]);

  // RTK Query хуки
  const { 
    data: partnersData, 
    isLoading, 
    error 
  } = useGetPartnersQuery(queryParams);

  const [deletePartner] = useDeletePartnerMutation();
  const [togglePartnerActive] = useTogglePartnerActiveMutation();

  const partners = partnersData?.data || [];
  const totalItems = partnersData?.pagination?.total_count || partners.length;

  // Обработчики событий
  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(0);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage - 1);
    window.scrollTo(0, 0);
  }, []);

  const handleEditPartner = useCallback((partner: Partner) => {
    navigate(`/admin/partners/${partner.id}/edit`);
  }, [navigate]);

  const handleDeletePartner = useCallback(async (partner: Partner) => {
    try {
      await deletePartner(partner.id).unwrap();
      setErrorMessage(null);
    } catch (error: any) {
      let errorMessage = 'Ошибка при удалении партнера';
      
      if (error.data?.error) {
        errorMessage = error.data.error;
      } else if (error.data?.message) {
        errorMessage = error.data.message;
      } else if (error.data?.errors) {
        const errors = error.data.errors as Record<string, string[]>;
        errorMessage = Object.entries(errors)
          .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
          .join('; ');
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setErrorMessage(errorMessage);
    }
  }, [deletePartner]);

  const handleToggleStatus = useCallback(async (partner: Partner) => {
    try {
      await togglePartnerActive({
        id: partner.id,
        isActive: !partner.is_active
      }).unwrap();
      setErrorMessage(null);
    } catch (error: any) {
      let errorMessage = 'Ошибка при изменении статуса партнера';
      
      if (error.data?.error) {
        errorMessage = error.data.error;
      } else if (error.data?.message) {
        errorMessage = error.data.message;
      } else if (error.data?.errors) {
        const errors = error.data.errors as Record<string, string[]>;
        errorMessage = Object.entries(errors)
          .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
          .join('; ');
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setErrorMessage(errorMessage);
    }
  }, [togglePartnerActive]);

  // Функция для получения инициалов партнера
  const getPartnerInitials = useCallback((partner: Partner) => {
    return partner.company_name.charAt(0).toUpperCase() || 'П';
  }, []);

  // Конфигурация заголовка
  const headerConfig: PageHeaderConfig = useMemo(() => ({
    title: 'Партнеры (PageTable)',
    actions: [
      {
        id: 'add-partner',
        label: 'Добавить партнера',
        icon: <AddIcon />,
        onClick: () => navigate('/admin/partners/new'),
        variant: 'contained',
      }
    ]
  }), [navigate]);

  // Конфигурация поиска
  const searchConfig: SearchConfig = useMemo(() => ({
    placeholder: 'Поиск по названию компании, контактному лицу или номеру телефона...',
    value: search,
    onChange: handleSearchChange,
  }), [search, handleSearchChange]);

  // Конфигурация колонок
  const columns: Column[] = useMemo(() => [
    {
      id: 'company',
      label: 'Партнер',
      wrap: true,
      minWidth: 250,
      format: (_value: any, row: Partner) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            {getPartnerInitials(row)}
          </Avatar>
          <Box>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {row.company_name}
            </Typography>
            {row.company_description && (
              <Typography variant="body2" color="text.secondary">
                {row.company_description}
              </Typography>
            )}
          </Box>
        </Box>
      )
    },
    {
      id: 'contact_person',
      label: 'Контактное лицо',
      wrap: true,
      hideOnMobile: true,
      format: (_value: any, row: Partner) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BusinessIcon color="action" />
          <Typography variant="body2">
            {row.contact_person || 'Не указано'}
          </Typography>
        </Box>
      )
    },
    {
      id: 'phone',
      label: 'Телефон',
      hideOnMobile: true,
      format: (_value: any, row: Partner) => (
        <Typography variant="body2">
          {row.user?.phone || 'Не указан'}
        </Typography>
      )
    },
    {
      id: 'email',
      label: 'Email',
      hideOnMobile: true,
      format: (_value: any, row: Partner) => (
        <Typography variant="body2">
          {row.user?.email || 'Не указан'}
        </Typography>
      )
    },
    {
      id: 'is_active',
      label: 'Статус',
      align: 'center',
      format: (_value: any, row: Partner) => (
        <Chip
          label={row.is_active ? 'Активен' : 'Неактивен'}
          color={row.is_active ? 'success' : 'error'}
          size="small"
        />
      )
    }
  ], [getPartnerInitials]);

  // Конфигурация действий
  const actionsConfig: ActionConfig[] = useMemo(() => [
    {
      id: 'edit',
      label: 'Редактировать',
      icon: <EditIcon />,
      onClick: (partner: Partner) => handleEditPartner(partner),
      color: 'primary',
    },
    {
      id: 'delete',
      label: 'Удалить',
      icon: <DeleteIcon />,
      onClick: (partner: Partner) => handleDeletePartner(partner),
      color: 'error',
      requireConfirmation: true,
      confirmationText: 'Вы действительно хотите удалить этого партнера? Это действие нельзя будет отменить.',
    }
  ], [handleEditPartner, handleDeletePartner]);

  // Конфигурация пагинации
  const paginationConfig = useMemo(() => ({
    page: page + 1,
    rowsPerPage: pageSize,
    totalItems: totalItems,
    onPageChange: handlePageChange,
  }), [page, pageSize, totalItems, handlePageChange]);

  // Отображение ошибки загрузки
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Ошибка при загрузке партнеров: {(error as any)?.data?.message || 'Неизвестная ошибка'}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Отображение ошибок операций */}
      {errorMessage && (
        <Box sx={{ mb: 2 }}>
          <Alert severity="error" onClose={() => setErrorMessage(null)}>
            {errorMessage}
          </Alert>
        </Box>
      )}

      {/* Статистика */}
      {partners.length > 0 && (
        <Box sx={{ mb: 2, display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Найдено партнеров: <strong>{totalItems}</strong>
          </Typography>
          <Typography variant="body2" color="success.main">
            Активных: <strong>{partners.filter(p => p.is_active).length}</strong>
          </Typography>
          {partners.filter(p => !p.is_active).length > 0 && (
            <Typography variant="body2" color="error.main">
              Неактивных: <strong>{partners.filter(p => !p.is_active).length}</strong>
            </Typography>
          )}
        </Box>
      )}

      {/* PageTable */}
      <PageTable<Partner>
        header={headerConfig}
        search={searchConfig}
        columns={columns}
        rows={partners}
        actions={actionsConfig}
        loading={isLoading}
        pagination={paginationConfig}
        responsive={true}
        empty={
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              {search ? 'Партнеры не найдены' : 'Нет партнеров'}
            </Typography>
          </Box>
        }
      />
    </Box>
  );
};

export default PartnersPageNew; 