import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Box,
  Chip,
  Typography,
  Avatar,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Schedule as ScheduleIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

// Импорты UI компонентов
import { PageTable } from '../../components/common/PageTable';
import Notification from '../../components/Notification';
import { ActionsMenu, ActionItem } from '../../components/ui/ActionsMenu/ActionsMenu';
import { getTablePageStyles } from '../../styles';

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

// Функция для форматирования рабочих часов
const formatWorkingHours = (workingHours: WorkingHoursSchedule | undefined): string => {
  if (!workingHours) return 'График не указан';

  const days = {
    monday: 'Пн',
    tuesday: 'Вт',
    wednesday: 'Ср',
    thursday: 'Чт',
    friday: 'Пт',
    saturday: 'Сб',
    sunday: 'Вс'
  } as const;

  const schedule: Record<string, string> = {};
  let currentSchedule = '';
  let daysWithSameSchedule: string[] = [];

  for (const [day, hours] of Object.entries(workingHours) as [keyof WorkingHoursSchedule, WorkingHours][]) {
    if (!hours.is_working_day) continue;

    const timeString = `${hours.start}-${hours.end}`;
    if (timeString !== currentSchedule) {
      if (daysWithSameSchedule.length > 0) {
        schedule[currentSchedule] = daysWithSameSchedule.join(', ');
      }
      currentSchedule = timeString;
      daysWithSameSchedule = [days[day as keyof typeof days]];
    } else {
      daysWithSameSchedule.push(days[day as keyof typeof days]);
    }
  }

  // Добавляем последнюю группу дней
  if (daysWithSameSchedule.length > 0) {
    schedule[currentSchedule] = daysWithSameSchedule.join(', ');
  }

  // Добавляем выходные дни
  const weekends = (Object.entries(workingHours) as [keyof WorkingHoursSchedule, WorkingHours][])
    .filter(([_, hours]) => !hours.is_working_day)
    .map(([day]) => days[day as keyof typeof days]);

  let result = Object.entries(schedule)
    .map(([time, days]) => `${days} ${time}`)
    .join('; ');

  if (weekends.length > 0) {
    result += `; Выходные: ${weekends.join(', ')}`;
  }

  return result || 'График не указан';
};

const ServicePointsPage: React.FC<ServicePointsPageNewProps> = () => {
  const navigate = useNavigate();
  const { id: partnerId } = useParams<{ id: string }>();
  const theme = useTheme();
  const tablePageStyles = getTablePageStyles(theme);
  
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
  const { data: regionsData, isLoading: regionsLoading } = useGetRegionsQuery({});
  const { data: citiesData, isLoading: citiesLoading } = useGetCitiesQuery({
    region_id: selectedRegion !== 'all' ? Number(selectedRegion) : undefined,
    page: 1,
    per_page: 100
  });
  const { data: partnersData, isLoading: partnersLoading } = useGetPartnersQuery({
    page: 1,
    per_page: 100
  });
  const { data: servicePointsData, isLoading, error } = useGetServicePointsQuery(queryParams);
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

  // Обработчик сброса всех фильтров
  const handleClearAllFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedRegion('all');
    setSelectedCity('all');
    // Если есть partnerId в URL, оставляем его, иначе сбрасываем
    setSelectedPartner(partnerId || 'all');
    setSelectedStatus('all');
    setPage(0);
  }, [partnerId]);

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
          message = `Сервисная точка "${servicePoint.name}" деактивирована. ${result.message}`;
          break;
        case 'deleted':
          severity = 'success';
          message = `Сервисная точка "${servicePoint.name}" полностью удалена из системы.`;
          break;
        default:
          severity = 'info';
      }
      
      showNotification(message, severity);
    } catch (error: any) {
      console.error('Ошибка при удалении сервисной точки:', error);
      
      // Обработка различных типов ошибок
      if (error.data?.action === 'blocked') {
        const message = error.data.message || 'Невозможно удалить сервисную точку из-за связанных записей';
        showNotification(message, 'error');
      } else {
        showNotification('Произошла ошибка при удалении сервисной точки', 'error');
      }
    }
  }, [deleteServicePoint, showNotification]);

  // Конфигурация действий для ActionsMenu
  const servicePointActions: ActionItem<ServicePoint>[] = useMemo(() => [
    {
      id: 'edit',
      label: 'Редактировать',
      icon: <EditIcon />,
      onClick: (servicePoint: ServicePoint) => {
        // Всегда используем partner_id из сервисной точки для формирования корректного URL
        const partnerIdToUse = partnerId || servicePoint.partner_id;
        navigate(`/admin/partners/${partnerIdToUse}/service-points/${servicePoint.id}/edit`, {
          state: { from: partnerId ? `/admin/partners/${partnerId}/service-points` : '/admin/service-points' }
        });
      },
      color: 'primary',
      tooltip: 'Редактировать сервисную точку'
    },
    {
      id: 'delete',
      label: (servicePoint: ServicePoint) => servicePoint.is_active ? 'Деактивировать' : 'Удалить',
      icon: (servicePoint: ServicePoint) => servicePoint.is_active ? <VisibilityOffIcon /> : <DeleteIcon />,
      onClick: handleSmartDelete,
      color: (servicePoint: ServicePoint) => servicePoint.is_active ? 'warning' : 'error',
      tooltip: (servicePoint: ServicePoint) => servicePoint.is_active 
        ? 'Деактивировать сервисную точку' 
        : 'Полностью удалить сервисную точку (если нет связанных записей)',
      requireConfirmation: true,
      confirmationConfig: {
        title: 'Подтвердите действие',
        message: 'Вы уверены, что хотите выполнить это действие?',
        confirmLabel: 'Подтвердить',
        cancelLabel: 'Отмена',
      },
    }
  ], [navigate, partnerId, handleSmartDelete]);

  // Получаем информацию о выбранном партнере для заголовка
  const selectedPartnerInfo = useMemo(() => {
    if (selectedPartner === 'all' || !partnersData?.data) return null;
    return partnersData.data.find(partner => partner.id.toString() === selectedPartner);
  }, [selectedPartner, partnersData]);

  // Конфигурация заголовка
  const headerConfig = useMemo(() => ({
    title: selectedPartnerInfo ? `Сервисные точки - ${selectedPartnerInfo.company_name}` : 'Сервисные точки',
    subtitle: selectedPartnerInfo 
      ? `Управление сервисными точками партнера "${selectedPartnerInfo.company_name}"`
      : 'Управление сервисными точками и их настройками',
    actions: [
      {
        label: 'Добавить сервисную точку',
        icon: <AddIcon />,
        onClick: () => {
          if (partnerId) {
            navigate(`/admin/partners/${partnerId}/service-points/new`, {
              state: { from: `/admin/partners/${partnerId}/service-points` }
            });
          } else {
            showNotification('Для создания сервисной точки необходимо выбрать партнера', 'warning');
            navigate('/admin/partners');
          }
        },
        variant: 'contained' as const,
        color: 'primary' as const
      }
    ]
  }), [navigate, partnerId, showNotification, selectedPartnerInfo]);

  // Конфигурация поиска
  const searchConfig = useMemo(() => ({
    placeholder: 'Поиск по названию или адресу...',
    value: searchQuery,
    onChange: handleSearchChange
  }), [searchQuery, handleSearchChange]);

  // Конфигурация фильтров
  const filtersConfig = useMemo(() => [
    {
      id: 'region',
      key: 'region',
      type: 'autocomplete' as const,
      label: 'Регион',
      value: selectedRegion,
      onChange: handleRegionFilterChange,
      clearValue: 'all', // Значение для сброса
      placeholder: 'Выберите или введите регион...',
      options: [
        { value: 'all', label: 'Все регионы' },
        ...(regionsData?.data?.map((region) => ({
          value: region.id.toString(),
          label: region.name
        })) || [])
      ]
    },
    {
      id: 'city',
      key: 'city',
      type: 'autocomplete' as const,
      label: 'Город',
      value: selectedCity,
      onChange: handleCityFilterChange,
      clearValue: 'all', // Значение для сброса
      placeholder: 'Выберите или введите город...',
      options: [
        { value: 'all', label: 'Все города' },
        ...(citiesData?.data?.map((city) => ({
          value: city.id.toString(),
          label: city.name
        })) || [])
      ]
    },
    {
      id: 'partner',
      key: 'partner',
      type: 'autocomplete' as const,
      label: 'Партнер',
      value: selectedPartner,
      onChange: handlePartnerFilterChange,
      clearValue: 'all', // Значение для сброса
      placeholder: 'Выберите или введите партнера...',
      options: [
        { value: 'all', label: 'Все партнеры' },
        ...(partnersData?.data?.map((partner) => ({
          value: partner.id.toString(),
          label: partner.company_name
        })) || [])
      ]
    },
    {
      id: 'status',
      key: 'status',
      type: 'select' as const,
      label: 'Статус',
      value: selectedStatus,
      onChange: handleStatusFilterChange,
      clearValue: 'all', // Значение для сброса
      options: [
        { value: 'all', label: 'Все' },
        { value: 'active', label: 'Активные' },
        { value: 'inactive', label: 'Неактивные' }
      ]
    }
  ], [selectedRegion, selectedCity, selectedPartner, selectedStatus, regionsData, citiesData, partnersData, handleRegionFilterChange, handleCityFilterChange, handlePartnerFilterChange, handleStatusFilterChange]);

  // Конфигурация колонок
  const columns = useMemo(() => [
    {
      id: 'service_point',
      key: 'name' as keyof ServicePoint,
      label: 'Сервисная точка',
      sortable: false,
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
      label: 'Партнер',
      sortable: true,
      hideOnMobile: true,
      render: (servicePoint: ServicePoint) => (
        <Typography variant="body2">
          {servicePoint.partner?.company_name || 'Не указан'}
        </Typography>
      )
    },
    {
      id: 'location',
      key: 'city' as keyof ServicePoint,
      label: 'Область / Город',
      sortable: true,
      hideOnMobile: true,
      render: (servicePoint: ServicePoint) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {servicePoint.city?.region?.name || 'Не указана'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {servicePoint.city?.name || 'Не указан'}
          </Typography>
        </Box>
      )
    },
    {
      id: 'schedule',
      key: 'working_hours' as keyof ServicePoint,
      label: 'График работы',
      sortable: false,
      hideOnMobile: true,
      render: (servicePoint: ServicePoint) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <ScheduleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Tooltip title={formatWorkingHours(servicePoint.working_hours)} arrow>
            <Typography variant="body2" sx={{ 
              maxWidth: 200,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {formatWorkingHours(servicePoint.working_hours)}
            </Typography>
          </Tooltip>
        </Box>
      )
    },
    {
      id: 'status',
      key: 'is_active' as keyof ServicePoint,
      label: 'Статус',
      sortable: true,
      render: (servicePoint: ServicePoint) => (
        <Chip 
          label={servicePoint.is_active ? 'Активна' : 'Неактивна'} 
          size="small"
          color={servicePoint.is_active ? 'success' : 'default'}
          icon={servicePoint.is_active ? <VisibilityIcon /> : <VisibilityOffIcon />}
        />
      )
    },
    {
      id: 'actions',
      key: 'actions' as keyof ServicePoint,
      label: 'Действия',
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
  ], [servicePointActions]);

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
        emptyState={{
          title: searchQuery || selectedRegion !== 'all' || selectedCity !== 'all' || selectedPartner !== 'all' || selectedStatus !== 'all' ? 'Сервисные точки не найдены' : 'Нет сервисных точек',
          description: searchQuery || selectedRegion !== 'all' || selectedCity !== 'all' || selectedPartner !== 'all' || selectedStatus !== 'all'
            ? 'Попробуйте изменить критерии поиска'
            : 'Создайте первую сервисную точку для начала работы',
          action: (!searchQuery && selectedRegion === 'all' && selectedCity === 'all' && selectedPartner === 'all' && selectedStatus === 'all') ? {
            label: 'Добавить сервисную точку',
            icon: <AddIcon />,
            onClick: () => {
              if (partnerId) {
                navigate(`/admin/partners/${partnerId}/service-points/new`);
              } else {
                navigate('/admin/partners');
              }
            }
          } : undefined
        }}
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