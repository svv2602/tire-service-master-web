import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useTheme,
  InputAdornment,
  IconButton,
  Avatar,
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Business as BusinessIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import {
  useGetServicePointsQuery,
  useDeleteServicePointMutation,
  useGetRegionsQuery,
  useGetCitiesQuery,
} from '../../api';
import type { ServicePoint } from '../../types/models';
import type { WorkingHoursSchedule, WorkingHours } from '../../types/working-hours';

// Импорты UI компонентов
import {
  Box,
  Typography,
  CircularProgress,
  Tooltip,
  Button,
  TextField,
  Alert,
  Chip,
  Pagination,
  Modal,
  Table,
  type Column
} from '../../components/ui';
import { Select } from '../../components/ui/Select';
import AutoComplete from '../../components/ui/AutoComplete';
import type { AutoCompleteOption } from '../../components/ui/AutoComplete/types';

// Импорт централизованных стилей
import { getTablePageStyles } from '../../styles/components';

// Хук для debounce поиска сервисных точек
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

// Функция для форматирования рабочих часов
const formatWorkingHours = (workingHours: WorkingHoursSchedule | undefined): string => {
  if (!workingHours) return 'График работы не указан';

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

  return result || 'График работы не указан';
};

// Мемоизированный компонент строки сервисной точки удален - заменен на колонки UI Table

/**
 * Компонент страницы списка сервисных точек
 * Отображает таблицу всех сервисных точек с возможностями поиска, фильтрации и управления
 * Поддерживает пагинацию, удаление записей и навигацию к формам редактирования
 * Включает фильтры по регионам и городам для удобного поиска
 */
const ServicePointsPage: React.FC = () => {
  const navigate = useNavigate();
  const { id: partnerId } = useParams<{ id: string }>();
  const theme = useTheme();
  
  // Получаем централизованные стили из системы стилей
  const tablePageStyles = getTablePageStyles(theme);
  
  // Состояние для поиска, фильтрации и пагинации
  const [search, setSearch] = useState('');
  const [selectedCityId, setSelectedCityId] = useState<number | ''>('');
  const [selectedRegionId, setSelectedRegionId] = useState<number | ''>('');
  const [selectedRegion, setSelectedRegion] = useState<AutoCompleteOption | null>(null);
  const [selectedCity, setSelectedCity] = useState<AutoCompleteOption | null>(null);
  const [selectedIsActive, setSelectedIsActive] = useState<string>(''); // '' | 'true' | 'false'
  const [selectedWorkStatus, setSelectedWorkStatus] = useState<string>(''); // '' | 'working' | 'temporarily_closed' | etc.
  const [page, setPage] = useState(0);
  const [pageSize] = useState(25);
  
  // Состояние для диалогов и ошибок
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedServicePoint, setSelectedServicePoint] = useState<ServicePoint | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Debounce для поиска
  const debouncedSearch = useDebounce(search, 300);

  // Мемоизированные параметры запроса
  const queryParams = useMemo(() => ({
    query: debouncedSearch || undefined,
    city_id: selectedCityId || undefined,
    region_id: selectedRegionId || undefined,
    is_active: selectedIsActive || undefined,
    work_status: selectedWorkStatus || undefined,
    page: page + 1,
    per_page: pageSize,
  }), [debouncedSearch, selectedCityId, selectedRegionId, selectedIsActive, selectedWorkStatus, page, pageSize]);

  // RTK Query хуки
  const { data: regionsData, isLoading: regionsLoading } = useGetRegionsQuery({});
  const { data: citiesData, isLoading: citiesLoading } = useGetCitiesQuery(
    { 
      region_id: selectedRegionId ? Number(selectedRegionId) : undefined,
      page: 1,
      per_page: 1000 // Увеличиваем лимит для полной загрузки городов
    }
    // Убираем skip - загружаем все города или по выбранному региону
  );
  const { data: servicePointsData, isLoading: servicePointsLoading, error, refetch } = useGetServicePointsQuery(queryParams);
  const [deleteServicePoint, { isLoading: isDeleting }] = useDeleteServicePointMutation();

  const isLoading = servicePointsLoading || regionsLoading || citiesLoading || isDeleting;
  const servicePoints = servicePointsData?.data || [];
  const totalItems = servicePointsData?.pagination?.total_count || 0;

  // Подготавливаем данные для AutoComplete
  const regionOptions: AutoCompleteOption[] = useMemo(() => 
    regionsData?.data?.map((region) => ({
      id: region.id,
      label: region.name
    })) || [], [regionsData]);

  const cityOptions: AutoCompleteOption[] = useMemo(() => 
    citiesData?.data?.map((city) => ({
      id: city.id,
      label: city.name
    })) || [], [citiesData]);

  // Автоматическое обновление данных каждые 30 секунд для отображения изменений состояния
  React.useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000); // 30 секунд

    return () => clearInterval(interval);
  }, [refetch]);

  // Мемоизированные обработчики событий
  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setPage(0); // Сбрасываем на первую страницу при поиске
  }, []);

  const handleRegionChange = useCallback((value: string | number) => {
    const regionId = value === '' ? '' : Number(value);
    setSelectedRegionId(regionId);
    setSelectedCityId(''); // Сбрасываем выбранный город
    setPage(0);
  }, []);

  const handleCityChange = useCallback((value: string | number) => {
    const cityId = value === '' ? '' : Number(value);
    setSelectedCityId(cityId);
    setPage(0);
  }, []);

  // Обработчики для AutoComplete
  const handleRegionAutoCompleteChange = useCallback((value: AutoCompleteOption | null) => {
    setSelectedRegion(value);
    setSelectedRegionId(value ? value.id as number : '');
    setSelectedCity(null); // Сбрасываем выбранный город
    setSelectedCityId('');
    setPage(0);
  }, []);

  const handleCityAutoCompleteChange = useCallback((value: AutoCompleteOption | null) => {
    setSelectedCity(value);
    setSelectedCityId(value ? value.id as number : '');
    setPage(0);
  }, []);

  const handleIsActiveChange = useCallback((value: string | number) => {
    setSelectedIsActive(value.toString());
    setPage(0);
  }, []);

  const handleWorkStatusChange = useCallback((value: string | number) => {
    setSelectedWorkStatus(value.toString());
    setPage(0);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage - 1);
    window.scrollTo(0, 0);
  }, []);

  const handleDeleteClick = useCallback((servicePoint: ServicePoint) => {
    setSelectedServicePoint(servicePoint);
    setDeleteDialogOpen(true);
  }, []);

  const handleEditClick = useCallback((servicePoint: ServicePoint) => {
    // partner_id обязателен для сервисной точки
    const partnerId = servicePoint.partner_id || servicePoint.partner?.id;
    if (!partnerId) {
      console.error('КРИТИЧЕСКАЯ ОШИБКА: Сервисная точка без partner_id!', servicePoint);
      alert('Ошибка: Сервисная точка не связана с партнером. Обратитесь к администратору.');
      return;
    }
    navigate(`/admin/partners/${partnerId}/service-points/${servicePoint.id}/edit`, {
      state: { from: '/admin/service-points' }
    });
  }, [navigate]);

  const handleDeleteConfirm = useCallback(async () => {
    if (selectedServicePoint && !isDeleting) {
      try {
        await deleteServicePoint({
          partner_id: selectedServicePoint.partner_id,
          id: selectedServicePoint.id
        }).unwrap();
        setErrorMessage(null);
        setDeleteDialogOpen(false);
        setSelectedServicePoint(null);
      } catch (error: any) {
        console.error('Ошибка при удалении сервисной точки:', error);
        let errorMsg = 'Произошла ошибка при удалении сервисной точки';
        
        // Обрабатываем различные форматы ошибок от API
        if (error.data?.error) {
          // Основной формат ошибок с ограничениями
          errorMsg = error.data.error;
        } else if (error.data?.message) {
          // Альтернативный формат
          errorMsg = error.data.message;
        } else if (error.data?.errors) {
          // Ошибки валидации
          const errors = error.data.errors as Record<string, string[]>;
          errorMsg = Object.entries(errors)
            .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
            .join('; ');
        } else if (error.message) {
          errorMsg = error.message;
        }
        setErrorMessage(errorMsg);
        setDeleteDialogOpen(false);
      }
    }
  }, [selectedServicePoint, isDeleting, deleteServicePoint]);

  const handleCloseDialog = useCallback(() => {
    setDeleteDialogOpen(false);
    setSelectedServicePoint(null);
  }, []);

  // Определение колонок для UI Table
  const columns: Column[] = useMemo(() => [
    {
      id: 'servicePoint',
      label: 'Сервисная точка',
      minWidth: 250,
      wrap: true,
      format: (value: any, row: any) => {
        const servicePoint = row as ServicePoint;
        return (
          <Box sx={tablePageStyles.avatarContainer}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <BusinessIcon />
            </Avatar>
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {servicePoint.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {servicePoint.address}
              </Typography>
            </Box>
          </Box>
        );
      },
    },
    {
      id: 'region',
      label: 'Область',
      minWidth: 120,
      format: (value: any, row: any) => {
        const servicePoint = row as ServicePoint;
        return (
          <Typography variant="body2">
            {servicePoint.city?.region?.name || 'Не указана'}
          </Typography>
        );
      },
    },
    {
      id: 'city',
      label: 'Город', 
      minWidth: 120,
      format: (value: any, row: any) => {
        const servicePoint = row as ServicePoint;
        return (
          <Typography variant="body2">
            {servicePoint.city?.name || 'Не указан'}
          </Typography>
        );
      },
    },
    {
      id: 'working_hours',
      label: 'График работы',
      minWidth: 200,
      wrap: true,
      format: (value: any, row: any) => {
        const servicePoint = row as ServicePoint;
        return (
          <Typography variant="body2">
            {formatWorkingHours(servicePoint.working_hours)}
          </Typography>
        );
      },
    },
    {
      id: 'contact_phone', 
      label: 'Контакты',
      minWidth: 130,
      format: (value: any, row: any) => {
        const servicePoint = row as ServicePoint;
        return (
          <Typography variant="body2">
            {servicePoint.contact_phone || 'Не указан'}
          </Typography>
        );
      },
    },
    {
      id: 'status',
      label: 'Активность',
      minWidth: 100,
      align: 'center' as const,
      format: (value: any, row: any) => {
        const servicePoint = row as ServicePoint;
        return (
          <Chip
            label={servicePoint.is_active ? 'Активна' : 'Неактивна'}
            color={servicePoint.is_active ? 'success' : 'error'}
            size="small"
          />
        );
      },
    },
    {
      id: 'work_status',
      label: 'Состояние',
      minWidth: 130,
      align: 'center' as const,
      format: (value: any, row: any) => {
        const servicePoint = row as ServicePoint;
        const getWorkStatusColor = (status: string) => {
          switch (status) {
            case 'working': return 'success';
            case 'temporarily_closed': return 'warning';
            case 'maintenance': return 'info';
            case 'suspended': return 'error';
            default: return 'default';
          }
        };
        
        const getWorkStatusLabel = (status: string) => {
          switch (status) {
            case 'working': return 'Работает';
            case 'temporarily_closed': return 'Временно закрыта';
            case 'maintenance': return 'Техобслуживание';
            case 'suspended': return 'Приостановлена';
            default: return status;
          }
        };
        
        return (
          <Chip
            label={getWorkStatusLabel(servicePoint.work_status || 'working')}
            color={getWorkStatusColor(servicePoint.work_status || 'working') as any}
            size="small"
          />
        );
      },
    },
    {
      id: 'actions',
      label: 'Действия',
      minWidth: 120,
      align: 'right' as const,
      format: (value: any, row: any) => {
        const servicePoint = row as ServicePoint;
        return (
          <Box sx={tablePageStyles.actionsContainer}>
            <Tooltip title="Редактировать">
              <IconButton
                onClick={() => handleEditClick(servicePoint)}
                size="small"
                sx={tablePageStyles.actionButton}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Удалить">
              <IconButton
                onClick={() => handleDeleteClick(servicePoint)}
                size="small"
                color="error"
                sx={tablePageStyles.actionButton}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
  ], [tablePageStyles, handleEditClick, handleDeleteClick]);

  // Отображение состояний загрузки и ошибок
  if (isLoading && !servicePointsData) {
    return (
      <Box sx={tablePageStyles.loadingContainer}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={tablePageStyles.pageContainer}>
        <Alert severity="error">
          Ошибка при загрузке сервисных точек: {error.toString()}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={tablePageStyles.pageContainer}>
      {/* Отображение ошибок */}
      {errorMessage && (
        <Box sx={{ mb: 2 }}>
          <Alert severity="error" onClose={() => setErrorMessage(null)}>
            {errorMessage}
          </Alert>
        </Box>
      )}

      {/* Заголовок и кнопки добавления и обновления */}
      <Box sx={tablePageStyles.pageHeader}>
        <Typography variant="h4">
          Сервисные точки
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            if (partnerId) {
              navigate(`/admin/partners/${partnerId}/service-points/new`);
            } else {
              // Если нет partnerId, нужно сначала выбрать партнера
              alert('Для создания сервисной точки необходимо выбрать партнера. Перейдите в раздел "Партнеры" и создайте сервисную точку оттуда.');
              navigate('/admin/partners');
            }
          }}
          size="small"
          sx={{ whiteSpace: 'nowrap' }}
        >
          Добавить сервисную точку
        </Button>

        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => refetch()}
          size="small"
          sx={{ whiteSpace: 'nowrap' }}
          disabled={isLoading}
        >
          Обновить
        </Button>
      </Box>

      {/* Фильтры и поиск */}
      <Box sx={{ 
        mb: 3, 
        display: 'flex', 
        gap: 2, 
        alignItems: 'center', 
        flexWrap: 'wrap'
      }}>
        <TextField
          placeholder="Поиск по названию или адресу"
          variant="outlined"
          size="small"
          value={search}
          onChange={handleSearchChange}
          sx={{ 
            maxWidth: 400, 
            flexGrow: 1 
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        
        <AutoComplete
          label="Регион"
          value={selectedRegion}
          onChange={handleRegionAutoCompleteChange}
          options={regionOptions}
          placeholder="Введите название региона"
          TextFieldProps={{ size: 'small' }}
          sx={{ minWidth: 200 }}
        />

        <AutoComplete
          label="Город"
          value={selectedCity}
          onChange={handleCityAutoCompleteChange}
          options={cityOptions}
          placeholder="Введите название города"
          TextFieldProps={{ size: 'small' }}
          sx={{ minWidth: 200 }}
        />

        <Select
          label="Активность"
          value={selectedIsActive}
          onChange={handleIsActiveChange}
          options={[
            { value: '', label: 'Все' },
            { value: 'true', label: 'Активные' },
            { value: 'false', label: 'Неактивные' }
          ]}
          size="small"
          sx={{ minWidth: 120 }}
        />

        <Select
          label="Состояние"
          value={selectedWorkStatus}
          onChange={handleWorkStatusChange}
          options={[
            { value: '', label: 'Все состояния' },
            { value: 'working', label: 'Работает' },
            { value: 'temporarily_closed', label: 'Временно закрыта' },
            { value: 'maintenance', label: 'Техобслуживание' },
            { value: 'suspended', label: 'Приостановлена' }
          ]}
          size="small"
          sx={{ minWidth: 160 }}
        />
      </Box>

      {/* Статистика */}
      <Box sx={{ mb: 2, display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Найдено сервисных точек: <strong>{totalItems}</strong>
        </Typography>
        {servicePoints.length > 0 && (
          <>
            <Typography variant="body2" color="success.main">
              Активных: <strong>{servicePoints.filter(sp => sp.is_active).length}</strong>
            </Typography>
            {servicePoints.filter(sp => !sp.is_active).length > 0 && (
              <Typography variant="body2" color="error.main">
                Неактивных: <strong>{servicePoints.filter(sp => !sp.is_active).length}</strong>
              </Typography>
            )}
            <Typography variant="body2" color="success.main">
              Работающих: <strong>{servicePoints.filter(sp => sp.work_status === 'working').length}</strong>
            </Typography>
            {servicePoints.filter(sp => sp.work_status === 'temporarily_closed').length > 0 && (
              <Typography variant="body2" color="warning.main">
                Временно закрытых: <strong>{servicePoints.filter(sp => sp.work_status === 'temporarily_closed').length}</strong>
              </Typography>
            )}
            {servicePoints.filter(sp => sp.work_status === 'maintenance').length > 0 && (
              <Typography variant="body2" color="info.main">
                На техобслуживании: <strong>{servicePoints.filter(sp => sp.work_status === 'maintenance').length}</strong>
              </Typography>
            )}
            {servicePoints.filter(sp => sp.work_status === 'suspended').length > 0 && (
              <Typography variant="body2" color="error.main">
                Приостановленных: <strong>{servicePoints.filter(sp => sp.work_status === 'suspended').length}</strong>
              </Typography>
            )}
          </>
        )}
      </Box>

      {/* Таблица сервисных точек с UI Table компонентом */}
      <Box sx={tablePageStyles.tableContainer}>
        <Table 
          columns={columns}
          rows={servicePoints.length > 0 ? servicePoints : []}
        />
        {servicePoints.length === 0 && (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              {page > 0 ? "На этой странице нет данных" : "Нет данных для отображения"}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Пагинация */}
      {Math.ceil(totalItems / pageSize) > 1 && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          mt: 3
        }}>
          <Pagination
            count={Math.ceil(totalItems / pageSize)}
            page={page + 1}
            onChange={handlePageChange}
            disabled={isLoading}
            color="primary"
          />
        </Box>
      )}

      {/* Модальное окно подтверждения удаления */}
      <Modal
        open={deleteDialogOpen}
        onClose={isDeleting ? undefined : handleCloseDialog}
        title="Подтверждение удаления"
        maxWidth={400}
        actions={
          <>
            <Button
              onClick={handleCloseDialog}
              disabled={isDeleting}
            >
              Отмена
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              color="error"
              variant="contained"
              disabled={isDeleting}
              startIcon={isDeleting ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
            >
              {isDeleting ? 'Удаление...' : 'Удалить'}
            </Button>
          </>
        }
      >
        <Typography>
          Вы действительно хотите удалить сервисную точку "{selectedServicePoint?.name}"?
          Это действие нельзя будет отменить.
        </Typography>
      </Modal>
    </Box>
  );
};

export default ServicePointsPage; 