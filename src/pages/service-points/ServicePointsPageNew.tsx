import React, { useState, useMemo, useCallback } from 'react';
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
import { getTablePageStyles } from '../../styles';

// Импорты API
import {
  useGetServicePointsQuery,
  useDeleteServicePointMutation,
  useGetRegionsQuery,
  useGetCitiesQuery,
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

const ServicePointsPageNew: React.FC<ServicePointsPageNewProps> = () => {
  const navigate = useNavigate();
  const { id: partnerId } = useParams<{ id: string }>();
  const theme = useTheme();
  const tablePageStyles = getTablePageStyles(theme);
  
  // Состояние для фильтров и поиска
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
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
    page: page + 1,
    per_page: PER_PAGE,
  }), [searchQuery, selectedCity, selectedRegion, page]);

  // API запросы
  const { data: regionsData, isLoading: regionsLoading } = useGetRegionsQuery({});
  const { data: citiesData, isLoading: citiesLoading } = useGetCitiesQuery(
    { 
      region_id: selectedRegion !== 'all' ? Number(selectedRegion) : undefined,
      page: 1,
      per_page: 100
    },
    { skip: selectedRegion === 'all' }
  );
  const { data: servicePointsData, isLoading, error } = useGetServicePointsQuery(queryParams);
  const [deleteServicePoint] = useDeleteServicePointMutation();

  // Фильтрация данных
  const filteredData = useMemo(() => {
    let filtered = servicePointsData?.data || [];

    // Фильтр по статусу
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(sp => 
        selectedStatus === 'active' ? sp.is_active : !sp.is_active
      );
    }

    return filtered;
  }, [servicePointsData?.data, selectedStatus]);

  const totalItems = servicePointsData?.pagination?.total_count || 0;

  // Обработчики событий
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

  const showNotification = useCallback((message: string, severity: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setNotification({ open: true, message, severity });
  }, []);

  const handleCloseNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, open: false }));
  }, []);

  // Обработка удаления
  const handleDelete = useCallback(async (servicePoint: ServicePoint) => {
    try {
      await deleteServicePoint(servicePoint.id).unwrap();
      showNotification(`Сервисная точка "${servicePoint.name}" успешно удалена`, 'success');
    } catch (error) {
      console.error('Ошибка при удалении сервисной точки:', error);
      showNotification('Ошибка при удалении сервисной точки', 'error');
    }
  }, [deleteServicePoint, showNotification]);

  // Конфигурация заголовка
  const headerConfig = useMemo(() => ({
    title: 'Сервисные точки',
    subtitle: 'Управление сервисными точками и их настройками',
    actions: [
      {
        label: 'Добавить сервисную точку',
        icon: <AddIcon />,
        onClick: () => {
          if (partnerId) {
            navigate(`/admin/partners/${partnerId}/service-points/new`);
          } else {
            showNotification('Для создания сервисной точки необходимо выбрать партнера', 'warning');
            navigate('/admin/partners');
          }
        },
        variant: 'contained' as const,
        color: 'primary' as const
      }
    ]
  }), [navigate, partnerId, showNotification]);

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
      type: 'select' as const,
      label: 'Регион',
      value: selectedRegion,
      onChange: handleRegionFilterChange,
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
      type: 'select' as const,
      label: 'Город',
      value: selectedCity,
      onChange: handleCityFilterChange,
      disabled: selectedRegion === 'all',
      options: [
        { value: 'all', label: 'Все города' },
        ...(citiesData?.data?.map((city) => ({
          value: city.id.toString(),
          label: city.name
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
      options: [
        { value: 'all', label: 'Все' },
        { value: 'active', label: 'Активные' },
        { value: 'inactive', label: 'Неактивные' }
      ]
    }
  ], [selectedRegion, selectedCity, selectedStatus, regionsData, citiesData, handleRegionFilterChange, handleCityFilterChange, handleStatusFilterChange]);

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
          {servicePoint.partner?.name || 'Не указан'}
        </Typography>
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
    }
  ], []);

  // Конфигурация действий
  const actionsConfig = useMemo(() => [
    {
      key: 'edit',
      label: 'Редактировать',
      icon: <EditIcon />,
      onClick: (servicePoint: ServicePoint) => {
        if (partnerId) {
          navigate(`/admin/partners/${partnerId}/service-points/${servicePoint.id}/edit`);
        } else {
          navigate(`/admin/service-points/${servicePoint.id}/edit`);
        }
      },
      color: 'primary' as const
    },
    {
      key: 'delete',
      label: 'Удалить',
      icon: <DeleteIcon />,
      onClick: handleDelete,
      color: 'error' as const,
      confirmationText: 'Вы уверены, что хотите удалить эту сервисную точку?'
    }
  ], [navigate, partnerId, handleDelete]);

  return (
    <Box sx={tablePageStyles.pageContainer}>
      <PageTable<ServicePoint>
        header={headerConfig}
        search={searchConfig}
        filters={filtersConfig}
        columns={columns}
        rows={filteredData}
        actions={actionsConfig}
        loading={isLoading}
        pagination={{
          page,
          totalItems,
          rowsPerPage: PER_PAGE,
          onPageChange: handlePageChange
        }}
        emptyState={{
          title: searchQuery || selectedRegion !== 'all' || selectedCity !== 'all' || selectedStatus !== 'all' ? 'Сервисные точки не найдены' : 'Нет сервисных точек',
          description: searchQuery || selectedRegion !== 'all' || selectedCity !== 'all' || selectedStatus !== 'all'
            ? 'Попробуйте изменить критерии поиска'
            : 'Создайте первую сервисную точку для начала работы',
          action: (!searchQuery && selectedRegion === 'all' && selectedCity === 'all' && selectedStatus === 'all') ? {
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

export default ServicePointsPageNew; 