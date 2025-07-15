import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Box,
  Chip,
  Typography,
  Avatar
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

// Импорты UI компонентов
import { PageTable } from '../../components/common/PageTable';
import Notification from '../../components/Notification';
import { ActionsMenu, ActionItem } from '../../components/ui/ActionsMenu/ActionsMenu';
import { getTablePageStyles } from '../../styles';
import { useLocalizedName } from '../../utils/localizationHelpers';

// Импорты API
import {
  useGetServicePointsQuery,
  useDeleteServicePointMutation,
  useGetRegionsQuery,
  useGetCitiesQuery,
  useGetPartnersQuery,
} from '../../api';

// Типы
import type { ServicePoint } from '../../types/models';
import type { WorkingHoursSchedule, WorkingHours } from '../../types/working-hours';

interface ServicePointsPageNewProps {}



const ServicePointsPage: React.FC<ServicePointsPageNewProps> = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { id: partnerId } = useParams<{ id: string }>();
  const theme = useTheme();
  const tablePageStyles = getTablePageStyles(theme);
  const localizedName = useLocalizedName();
  
  // Состояние для фильтров и поиска
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedPartner, setSelectedPartner] = useState<string>('all');
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

  // Мемоизированные параметры запроса
  const queryParams = useMemo(() => ({
    query: searchQuery || undefined,
    city_id: selectedCity !== 'all' ? Number(selectedCity) : undefined,
    region_id: selectedRegion !== 'all' ? Number(selectedRegion) : undefined,
    partner_id: selectedPartner !== 'all' ? Number(selectedPartner) : undefined,
    is_active: selectedStatus !== 'all' ? (selectedStatus === 'active' ? 'true' : 'false') : undefined,
    page: page,
    per_page: PER_PAGE,
  }), [searchQuery, selectedCity, selectedRegion, selectedPartner, selectedStatus, page]);

  // API запросы
  const { data: regionsData } = useGetRegionsQuery({});
  const { data: citiesData } = useGetCitiesQuery({
    region_id: selectedRegion !== 'all' ? Number(selectedRegion) : undefined,
    page: 1,
    per_page: 100
  });
  const { data: partnersData } = useGetPartnersQuery({
    page: 1,
    per_page: 100
  });
  const { data: servicePointsData, isLoading, refetch } = useGetServicePointsQuery(queryParams);
  const [deleteServicePoint] = useDeleteServicePointMutation();

  // Эффект для автоматической установки фильтра партнера при наличии partnerId в URL
  useEffect(() => {
    if (partnerId && selectedPartner === 'all') {
      setSelectedPartner(partnerId);
    }
  }, [partnerId, selectedPartner]);

  // Убираем клиентскую фильтрацию - теперь все фильтры обрабатываются на сервере
  const filteredData = useMemo(() => {
    return servicePointsData?.data || [];
  }, [servicePointsData?.data]);

  const totalItems = servicePointsData?.pagination?.total_count || 0;

  // Обработчики событий с дополнительной отладкой
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    setPage(0);
  }, []);

  const handleRegionFilterChange = useCallback((region: string) => {
    setSelectedRegion(region);
    setSelectedCity('all'); // Сбрасываем город при смене региона
    setPage(0);
  }, []);

  const handleCityFilterChange = useCallback((city: string) => {
    setSelectedCity(city);
    setPage(0);
  }, []);

  const handleStatusFilterChange = useCallback((status: string) => {
    setSelectedStatus(status);
    setPage(0);
  }, []);

  const handlePartnerFilterChange = useCallback((partner: string) => {
    setSelectedPartner(partner);
    setPage(0);
  }, []);



  const showNotification = useCallback((message: string, severity: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setNotification({ open: true, message, severity });
  }, []);

  const handleCloseNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, open: false }));
  }, []);

  // Умная обработка удаления
  const handleSmartDelete = useCallback(async (servicePoint: ServicePoint) => {
    try {
      const result = await deleteServicePoint({ partner_id: servicePoint.partner_id, id: servicePoint.id }).unwrap();
      
      // Определяем тип уведомления и сообщение на основе действия
      let severity: 'success' | 'warning' | 'info' = 'success';
      let message = result.message;
      
      switch (result.action) {
        case 'deactivated':
          severity = 'warning';
          message = t('admin.servicePoints.deactivatedMessage', { name: servicePoint.name, message: result.message });
          break;
        case 'deleted':
          severity = 'success';
          message = t('admin.servicePoints.deletedMessage', { name: servicePoint.name });
          break;
        default:
          severity = 'info';
      }
      
      showNotification(message, severity);
    } catch (error: any) {
      console.error('Error deleting service point:', error);
      
      // Обработка различных типов ошибок
      if (error.data?.action === 'blocked') {
        const message = error.data.message || t('admin.servicePoints.deleteBlocked');
        showNotification(message, 'error');
      } else {
        showNotification(t('admin.servicePoints.deleteError'), 'error');
      }
    }
  }, [deleteServicePoint, showNotification]);

  // Конфигурация действий для ActionsMenu
  const servicePointActions: ActionItem<ServicePoint>[] = useMemo(() => [
    {
      id: 'edit',
      label: t('tables.actions.edit'),
      icon: <EditIcon />,
      onClick: (servicePoint: ServicePoint) => {
        // Всегда используем partner_id из сервисной точки для формирования корректного URL
        const partnerIdToUse = partnerId || servicePoint.partner_id;
        
        // Проверяем что partner_id существует
        if (!partnerIdToUse) {
          console.error('ServicePoint partner_id is missing:', servicePoint);
          showNotification('Ошибка: У сервисной точки отсутствует ID партнера. Перезагружаем данные...', 'error');
          // Временное решение: попробуем перезагрузить данные
          refetch();
          return;
        }
        
        navigate(`/admin/partners/${partnerIdToUse}/service-points/${servicePoint.id}/edit`, {
          state: { from: partnerId ? `/admin/partners/${partnerId}/service-points` : '/admin/service-points' }
        });
      },
      color: 'primary',
      tooltip: t('admin.servicePoints.editTooltip')
    },
    {
      id: 'delete',
      label: (servicePoint: ServicePoint) => servicePoint.is_active ? t('tables.actions.deactivate') : t('tables.actions.delete'),
      icon: (servicePoint: ServicePoint) => servicePoint.is_active ? <VisibilityOffIcon /> : <DeleteIcon />,
      onClick: handleSmartDelete,
      color: (servicePoint: ServicePoint) => servicePoint.is_active ? 'warning' : 'error',
      tooltip: (servicePoint: ServicePoint) => servicePoint.is_active 
        ? t('admin.servicePoints.deactivateTooltip') 
        : t('admin.servicePoints.deleteTooltip'),
      requireConfirmation: true,
      confirmationConfig: {
        title: t('common.confirmAction'),
        message: t('common.confirmMessage'),
        confirmLabel: t('common.confirm'),
        cancelLabel: t('common.cancel'),
      },
    }
  ], [navigate, partnerId, handleSmartDelete, t]);

  // Получаем информацию о выбранном партнере для заголовка
  const selectedPartnerInfo = useMemo(() => {
    if (selectedPartner === 'all' || !partnersData?.data) return null;
    return partnersData.data.find(partner => partner.id.toString() === selectedPartner);
  }, [selectedPartner, partnersData]);

  // Конфигурация заголовка
  const headerConfig = useMemo(() => ({
    title: selectedPartnerInfo ? t('admin.servicePoints.titleWithPartner', { partnerName: selectedPartnerInfo.company_name }) : t('admin.servicePoints.title'),
    subtitle: selectedPartnerInfo 
      ? t('admin.servicePoints.subtitleWithPartner', { partnerName: selectedPartnerInfo.company_name })
      : t('admin.servicePoints.subtitle'),
    actions: [
      {
        label: t('admin.servicePoints.createServicePoint'),
        icon: <AddIcon />, 
        onClick: () => {
          if (partnerId) {
            navigate(`/admin/partners/${partnerId}/service-points/new`, {
              state: { from: `/admin/partners/${partnerId}/service-points` }
            });
          } else {
            showNotification(t('admin.servicePoints.selectPartnerFirst'), 'warning');
            navigate('/admin/partners');
          }
        },
        variant: 'contained' as const,
        color: 'primary' as const
      }
    ]
  }), [navigate, partnerId, showNotification, selectedPartnerInfo, t]);

  // Конфигурация поиска
  const searchConfig = useMemo(() => ({
    placeholder: t('admin.servicePoints.searchPlaceholder'),
    value: searchQuery,
    onChange: handleSearchChange
  }), [searchQuery, handleSearchChange, t]);

  // Конфигурация фильтров
  const filtersConfig = useMemo(() => [
    {
      id: 'region',
      label: t('admin.servicePoints.filters.region'),
      type: 'select' as const,
      value: selectedRegion,
      onChange: handleRegionFilterChange,
      options: [
        { value: 'all', label: t('admin.servicePoints.filters.allRegions') },
        ...(regionsData?.data || []).map(region => ({ value: region.id.toString(), label: localizedName(region) }))
      ]
    },
    {
      id: 'city',
      label: t('admin.servicePoints.filters.city'),
      type: 'select' as const,
      value: selectedCity,
      onChange: handleCityFilterChange,
      options: [
        { value: 'all', label: t('admin.servicePoints.filters.allCities') },
        ...(citiesData?.data || []).map(city => ({ value: city.id.toString(), label: localizedName(city) }))
      ]
    },
    {
      id: 'partner',
      label: t('admin.servicePoints.filters.partner'),
      type: 'select' as const,
      value: selectedPartner,
      onChange: handlePartnerFilterChange,
      options: [
        { value: 'all', label: t('admin.servicePoints.filters.allPartners') },
        ...(partnersData?.data || []).map(partner => ({ value: partner.id.toString(), label: partner.company_name }))
      ]
    },
    {
      id: 'status',
      label: t('admin.servicePoints.filters.status'),
      type: 'select' as const,
      value: selectedStatus,
      onChange: handleStatusFilterChange,
      options: [
        { value: 'all', label: t('admin.servicePoints.filters.allStatuses') },
        { value: 'active', label: t('statuses.active') },
        { value: 'inactive', label: t('statuses.inactive') }
      ]
    }
  ], [selectedRegion, selectedCity, selectedPartner, selectedStatus, handleRegionFilterChange, handleCityFilterChange, handlePartnerFilterChange, handleStatusFilterChange, regionsData, citiesData, partnersData, t]);



  // Отладочная информация для диагностики переводов
  console.log('🔧 ServicePointsPage переводы:', {
    t: typeof t,
    nameTranslation: t('tables.columns.name'),
    partnerTranslation: t('tables.columns.partner'),
    cityTranslation: t('tables.columns.city'),
    statusTranslation: t('tables.columns.status'),
    actionsTranslation: t('tables.columns.actions')
  });

  // Колонки таблицы  
  const columns = useMemo(() => [
    {
      id: 'name',
      label: t('tables.columns.name'),
      render: (servicePoint: ServicePoint) => (
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}>
            <BusinessIcon />
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {servicePoint.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
              <LocationIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {servicePoint.address}
              </Typography>
            </Box>
            {servicePoint.phone && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <PhoneIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {servicePoint.phone}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      )
    },
    {
      id: 'partner',
      key: 'partner' as keyof ServicePoint,
      label: t('tables.columns.partner'),
      sortable: true,
      hideOnMobile: true,
      render: (servicePoint: ServicePoint) => (
        <Typography variant="body2">
          {servicePoint.partner?.company_name || t('admin.servicePoints.notSpecified')}
        </Typography>
      )
    },
    {
      id: 'city',
      key: 'city' as keyof ServicePoint,
      label: t('tables.columns.city'),
      sortable: true,
      hideOnMobile: true,
      render: (servicePoint: ServicePoint) => (
        <Typography variant="body2">
          {servicePoint.city?.name || t('admin.servicePoints.notSpecified')}
        </Typography>
      )
    },
    {
      id: 'is_active',
      key: 'is_active' as keyof ServicePoint,
      label: t('tables.columns.status'),
      sortable: true,
      render: (servicePoint: ServicePoint) => (
        <Chip
          label={servicePoint.is_active ? t('statuses.active') : t('statuses.inactive')}
          color={servicePoint.is_active ? 'success' : 'default'}
          size="small"
        />
      )
    },
    {
      id: 'actions',
      key: 'actions' as keyof ServicePoint,
      label: t('tables.columns.actions'),
      sortable: false,
      render: (servicePoint: ServicePoint) => (
        <ActionsMenu 
          actions={servicePointActions} 
          item={servicePoint} 
          menuThreshold={1}
          sx={{ display: 'flex', justifyContent: 'flex-end' }}
        />
      )
    }
  ], [servicePointActions, t]);

  // Пустое состояние
  const emptyState = useMemo(() => ({
    title: searchQuery || selectedRegion !== 'all' || selectedCity !== 'all' || selectedPartner !== 'all' || selectedStatus !== 'all' ? t('admin.servicePoints.notFound') : t('admin.servicePoints.empty'),
    description: searchQuery || selectedRegion !== 'all' || selectedCity !== 'all' || selectedPartner !== 'all' || selectedStatus !== 'all'
      ? t('admin.servicePoints.tryChangeFilters')
      : t('admin.servicePoints.createFirst'),
    action: (!searchQuery && selectedRegion === 'all' && selectedCity === 'all' && selectedPartner === 'all' && selectedStatus === 'all') ? {
      label: t('admin.servicePoints.createServicePoint'),
      icon: <AddIcon />, 
      onClick: () => {
        if (partnerId) {
          navigate(`/admin/partners/${partnerId}/service-points/new`);
        } else {
          navigate('/admin/partners');
        }
      }
    } : undefined
  }), [searchQuery, selectedRegion, selectedCity, selectedPartner, selectedStatus, partnerId, navigate, t]);



  return (
    <Box sx={tablePageStyles.pageContainer}>
      <PageTable<ServicePoint>
        header={headerConfig}
        search={searchConfig}
        filters={filtersConfig}
        columns={columns}
        rows={filteredData}
        loading={isLoading}
        pagination={{
          page,
          totalItems,
          rowsPerPage: PER_PAGE,
          onPageChange: handlePageChange
        }}
        emptyState={emptyState}
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

export default ServicePointsPage; 