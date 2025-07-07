/**
 * Страница управления партнерами
 * 
 * Функциональность:
 * - Отображение списка партнеров с помощью PageTable
 * - Поиск партнеров по названию компании, контактному лицу, телефону
 * - Фильтр по статусу активности
 * - Пагинация результатов
 * - Редактирование и удаление партнеров
 * - Переключение статуса активности через Switch
 * - Диалог подтверждения деактивации с информацией о связанных данных
 * - Унифицированный UI с остальными страницами
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  Avatar,
  IconButton,
  Tooltip,
  useTheme,
  FormControlLabel,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Business as BusinessIcon,
  Store as StoreIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { 
  useGetPartnersQuery, 
  useDeletePartnerMutation, 
  useTogglePartnerActiveMutation,
  useGetPartnerRelatedDataQuery,
} from '../../api';
import { Partner } from '../../types/models';

// Импорты UI компонентов
import {
  Box,
  Typography,
  Alert,
} from '../../components/ui';

// Прямой импорт ActionsMenu для избежания проблем с экспортом
import { ActionsMenu, ActionItem } from '../../components/ui/ActionsMenu/ActionsMenu';

// Импорт PageTable компонента
import { PageTable } from '../../components/common/PageTable';
import type { 
  PageHeaderConfig, 
  SearchConfig, 
  FilterConfig,
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

const PartnersPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { t } = useTranslation();
  
  // Состояние для поиска, фильтрации и пагинации
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(''); // '' = все, 'true' = активные, 'false' = неактивные
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  
  // Состояние для ошибок
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Состояние для диалога подтверждения деактивации
  const [deactivateDialog, setDeactivateDialog] = useState<{
    open: boolean;
    partner: Partner | null;
    isFromDelete: boolean; // true если диалог открыт из кнопки удаления
  }>({ open: false, partner: null, isFromDelete: false });

  // Debounce для поиска
  const debouncedSearch = useDebounce(search, 300);

  // Мемоизированные параметры запроса
  const queryParams = useMemo(() => ({
    query: debouncedSearch || undefined,
    is_active: statusFilter ? statusFilter === 'true' : undefined,
    page: page + 1,
    per_page: pageSize,
  }), [debouncedSearch, statusFilter, page, pageSize]);

  // RTK Query хуки
  const { 
    data: partnersData, 
    isLoading, 
    error 
  } = useGetPartnersQuery(queryParams);

  const [deletePartner] = useDeletePartnerMutation();
  const [togglePartnerActive] = useTogglePartnerActiveMutation();

  // Запрос связанных данных для выбранного партнера (только при открытии диалога деактивации)
  const { data: relatedData, isLoading: relatedDataLoading } = useGetPartnerRelatedDataQuery(
    deactivateDialog.partner?.id || 0,
    { skip: !deactivateDialog.partner?.id || !deactivateDialog.open }
  );

  const partners = partnersData?.data || [];
  const totalItems = partnersData?.pagination?.total_count || partners.length;

  // Обработчики событий
  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(0);
  }, []);

  const handleStatusFilterChange = useCallback((value: string) => {
    setStatusFilter(value);
    setPage(0);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    window.scrollTo(0, 0);
  }, []);

  const handleEditPartner = useCallback((partner: Partner) => {
    navigate(`/admin/partners/${partner.id}/edit`);
  }, [navigate]);

  const handleDeletePartner = useCallback(async (partner: Partner) => {
    // Если партнер активен, сначала показываем диалог деактивации
    if (partner.is_active) {
      setDeactivateDialog({ open: true, partner, isFromDelete: true });
      return;
    }

    // Если партнер неактивен, выполняем удаление
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
    // Если партнер активен и мы хотим его деактивировать, показываем диалог подтверждения
    if (partner.is_active) {
      setDeactivateDialog({ open: true, partner, isFromDelete: false });
      return;
    }

    // Если партнер неактивен, активируем его без подтверждения
    try {
      await togglePartnerActive({
        id: partner.id,
        isActive: true
      }).unwrap();
      setErrorMessage(null);
    } catch (error: any) {
      let errorMessage = 'Ошибка при активации партнера';
      
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

  // Обработчик подтверждения деактивации партнера
  const handleConfirmDeactivation = useCallback(async () => {
    if (!deactivateDialog.partner) return;

    const isFromDelete = deactivateDialog.isFromDelete;

    try {
      if (isFromDelete) {
        // Если диалог открыт из кнопки удаления, используем API удаления
        // Backend сам деактивирует партнера и вернет соответствующее сообщение
        const response = await deletePartner(deactivateDialog.partner.id).unwrap();
        
        // Проверяем, была ли выполнена деактивация вместо удаления
        if (response && typeof response === 'object' && 'action' in response && response.action === 'deactivated') {
          setErrorMessage(null);
          setDeactivateDialog({ open: false, partner: null, isFromDelete: false });
          // Можно показать сообщение о том, что партнер деактивирован и теперь его можно удалить
          return;
        }
      } else {
        // Если диалог открыт из Switch, используем API переключения статуса
        await togglePartnerActive({
          id: deactivateDialog.partner.id,
          isActive: false
        }).unwrap();
      }
      
      setErrorMessage(null);
      setDeactivateDialog({ open: false, partner: null, isFromDelete: false });
    } catch (error: any) {
      let errorMessage = isFromDelete ? 'Ошибка при удалении партнера' : 'Ошибка при деактивации партнера';
      
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
  }, [deactivateDialog.partner, deactivateDialog.isFromDelete, togglePartnerActive, deletePartner]);

  // Обработчик отмены деактивации
  const handleCancelDeactivation = useCallback(() => {
    setDeactivateDialog({ open: false, partner: null, isFromDelete: false });
  }, []);

  // Функция для получения инициалов партнера
  const getPartnerInitials = useCallback((partner: Partner) => {
    return partner.company_name.charAt(0).toUpperCase() || t('admin.partners.initials.default');
  }, [t]);

  // Конфигурация заголовка
  const headerConfig: PageHeaderConfig = useMemo(() => ({
    title: t('admin.partners.title'),
    actions: [
      {
        id: 'add-partner',
        label: t('admin.partners.createPartner'),
        icon: <AddIcon />,
        onClick: () => navigate('/admin/partners/new'),
        variant: 'contained',
      }
    ]
  }), [navigate, t]);

  // Конфигурация поиска
  const searchConfig: SearchConfig = useMemo(() => ({
    placeholder: t('admin.partners.searchPlaceholder'),
    value: search,
    onChange: handleSearchChange,
  }), [search, handleSearchChange, t]);

  // Конфигурация фильтров
  const filtersConfig: FilterConfig[] = useMemo(() => [
    {
      id: 'status',
      label: t('admin.partners.statusFilter'),
      type: 'select',
      value: statusFilter,
      onChange: handleStatusFilterChange,
      options: [
        { value: '', label: t('admin.partners.allPartners') },
        { value: 'true', label: t('admin.partners.onlyActive') },
        { value: 'false', label: t('admin.partners.onlyInactive') },
      ],
    },
  ], [statusFilter, handleStatusFilterChange, t]);

  // Конфигурация действий для ActionsMenu
  const partnerActions: ActionItem<Partner>[] = useMemo(() => [
    {
      id: 'edit',
      label: t('tables.actions.edit'),
      icon: <EditIcon />,
      onClick: (partner: Partner) => handleEditPartner(partner),
      color: 'primary',
      tooltip: 'Редактировать данные партнера'
    },
    {
      id: 'service-points',
      label: t('admin.partners.servicePoints'),
      icon: <StoreIcon />,
      onClick: (partner: Partner) => navigate(`/admin/partners/${partner.id}/service-points`),
      color: 'info',
      tooltip: 'Управление сервисными точками партнера'
    },
    {
      id: 'delete',
      label: t('tables.actions.delete'),
      icon: <DeleteIcon />,
      onClick: (partner: Partner) => handleDeletePartner(partner),
      color: 'error',
      tooltip: 'Удалить партнера'
    }
  ], [handleEditPartner, handleDeletePartner, navigate, t]);

  // Конфигурация колонок
  const columns: Column[] = useMemo(() => [
    {
      id: 'company',
      label: t('admin.partners.columns.company'),
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
      label: t('admin.partners.columns.contactPerson'),
      wrap: true,
      hideOnMobile: true,
      format: (_value: any, row: Partner) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BusinessIcon color="action" />
          <Typography variant="body2">
            {row.contact_person || t('admin.partners.notSpecified')}
          </Typography>
        </Box>
      )
    },
    {
      id: 'phone',
      label: t('tables.columns.phone'),
      hideOnMobile: true,
      format: (_value: any, row: Partner) => (
        <Typography variant="body2">
          {row.user?.phone || t('admin.partners.notSpecified')}
        </Typography>
      )
    },
    {
      id: 'email',
      label: t('tables.columns.email'),
      hideOnMobile: true,
      format: (_value: any, row: Partner) => (
        <Typography variant="body2">
          {row.user?.email || t('admin.partners.notSpecified')}
        </Typography>
      )
    },
    {
      id: 'is_active',
      label: t('tables.columns.status'),
      align: 'center',
      format: (_value: any, row: Partner) => (
        <FormControlLabel
          control={
            <Switch
              checked={row.is_active}
              onChange={() => handleToggleStatus(row)}
              size="small"
              color="primary"
            />
          }
          label=""
          sx={{ m: 0 }}
        />
      )
    },
    {
      id: 'actions',
      label: t('tables.columns.actions'),
      align: 'center',
      minWidth: 120,
      format: (_value: any, row: Partner) => (
        <ActionsMenu actions={partnerActions} item={row} menuThreshold={1} />
      )
    }
  ], [getPartnerInitials, handleToggleStatus, partnerActions, t]);

  // Конфигурация пагинации
  const paginationConfig = useMemo(() => ({
    page: page,
    rowsPerPage: pageSize,
    totalItems: totalItems,
    onPageChange: handlePageChange,
  }), [page, pageSize, totalItems, handlePageChange]);

  // Отображение ошибки загрузки
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {t('errors.partnersLoading', { message: (error as any)?.data?.message || t('errors.unknown') })}
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
            {t('admin.partners.stats.foundPartners', { count: totalItems })}
          </Typography>
          <Typography variant="body2" color="success.main">
            {t('admin.partners.stats.activePartners', { count: partners.filter(p => p.is_active).length })}
          </Typography>
          {partners.filter(p => !p.is_active).length > 0 && (
            <Typography variant="body2" color="error.main">
              {t('admin.partners.stats.inactivePartners', { count: partners.filter(p => !p.is_active).length })}
            </Typography>
          )}
        </Box>
      )}

      {/* PageTable */}
      <PageTable<Partner>
        header={headerConfig}
        search={searchConfig}
        filters={filtersConfig}
        columns={columns}
        rows={partners}
        loading={isLoading}
        pagination={paginationConfig}
        responsive={true}
        empty={
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              {search || statusFilter ? t('admin.partners.partnersNotFound') : t('admin.partners.noPartners')}
            </Typography>
          </Box>
        }
      />

      {/* Диалог подтверждения деактивации партнера */}
      <Dialog
        open={deactivateDialog.open}
        onClose={handleCancelDeactivation}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {deactivateDialog.isFromDelete
            ? t('admin.partners.deactivateDialog.titleDelete')
            : t('admin.partners.deactivateDialog.titleDeactivate')}
        </DialogTitle>
        <DialogContent>
          {deactivateDialog.partner && (
            <Box>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {deactivateDialog.isFromDelete ? (
                  <>
                    {t('admin.partners.deactivateDialog.confirmDeleteMessage', { companyName: deactivateDialog.partner.company_name })}
                    <br />
                    <Typography variant="body2" color="warning.main" sx={{ mt: 1 }}>
                      {t('admin.partners.deactivateDialog.activeDeactivationWarning')}
                    </Typography>
                  </>
                ) : (
                  <>
                    {t('admin.partners.deactivateDialog.confirmDeactivateMessage', { companyName: deactivateDialog.partner.company_name })}
                  </>
                )}
              </Typography>
              
              {relatedDataLoading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, my: 2 }}>
                  <CircularProgress size={20} />
                  <Typography>{t('admin.partners.deactivateDialog.loadingRelated')}</Typography>
                </Box>
              ) : relatedData ? (
                <Box>
                  <Typography variant="body1" sx={{ mb: 2, color: 'warning.main' }}>
                    {t('admin.partners.deactivateDialog.warning')}
                  </Typography>
                  
                  {relatedData.service_points_count > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {t('admin.partners.deactivateDialog.servicePoints', { count: relatedData.service_points_count })}
                      </Typography>
                      <Box sx={{ pl: 2 }}>
                        {relatedData.service_points.map(sp => (
                          <Typography key={sp.id} variant="body2" color={sp.is_active ? 'text.primary' : 'text.secondary'}>
                            • {sp.name} - {sp.is_active ? t('statuses.active') : t('statuses.inactive')} 
                            {sp.work_status && ` (${t('statuses.' + sp.work_status)})`}
                          </Typography>
                        ))}
                      </Box>
                    </Box>
                  )}
                  
                  {relatedData.operators_count > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {t('admin.partners.deactivateDialog.operators', { count: relatedData.operators_count })}
                      </Typography>
                      <Box sx={{ pl: 2 }}>
                        {relatedData.operators.map(op => (
                          <Typography key={op.id} variant="body2" color={op.is_active ? 'text.primary' : 'text.secondary'}>
                            • {op.user.first_name} {op.user.last_name} ({op.position}) - {op.is_active ? t('statuses.active') : t('statuses.inactive')}
                          </Typography>
                        ))}
                      </Box>
                    </Box>
                  )}
                  
                  {relatedData.service_points_count === 0 && relatedData.operators_count === 0 && (
                    <Typography variant="body2" color="success.main">
                      {t('admin.partners.deactivateDialog.noActiveItems')}
                    </Typography>
                  )}
                </Box>
              ) : null}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDeactivation}>{t('forms.common.cancel')}</Button>
          <Button 
            onClick={handleConfirmDeactivation} 
            color="error" 
            variant="contained"
            disabled={relatedDataLoading}
          >
            {deactivateDialog.isFromDelete
              ? t('tables.actions.delete')
              : t('tables.actions.deactivate')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PartnersPage; 