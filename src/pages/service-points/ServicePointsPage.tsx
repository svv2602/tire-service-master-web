import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useTheme,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  TablePagination,
  FormControl,
  InputLabel,
  MenuItem,
  useMediaQuery,
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  LocationOn as LocationIcon,
  AccessTime as AccessTimeIcon,
  Business as BusinessIcon,
  LocationCity as LocationCityIcon,
} from '@mui/icons-material';
import {
  useGetServicePointsQuery,
  useDeleteServicePointMutation,
  useGetRegionsQuery,
  useGetCitiesQuery,
} from '../../api';
import type { ServicePoint } from '../../types/models';
import type { WorkingHoursSchedule, WorkingHours } from '../../types/working-hours';
import { getTablePageStyles } from '../../styles';

// Импорты UI компонентов
import {
  Box,
  Typography,
  CircularProgress,
  Tooltip,
} from '../../components/ui';
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/TextField';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { Alert } from '../../components/ui/Alert';
import { Chip } from '../../components/ui/Chip';
import { Pagination } from '../../components/ui/Pagination';

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

/**
 * Компонент страницы списка сервисных точек
 * Отображает таблицу всех сервисных точек с возможностями поиска, фильтрации и управления
 * Поддерживает пагинацию, удаление записей и навигацию к формам редактирования
 * Включает фильтры по регионам и городам для удобного поиска
 */
const ServicePointsPage: React.FC = () => {
  const navigate = useNavigate();
  const { id: partnerId } = useParams<{ id: string }>();
  
  // Хук темы для использования централизованных стилей
  const theme = useTheme();
  
  // Адаптивность
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // < 900px
  const isTablet = useMediaQuery(theme.breakpoints.down('lg')); // < 1200px
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm')); // < 600px
  
  // Получаем стили из централизованной системы
  const tablePageStyles = getTablePageStyles(theme);
  
  // Состояние для поиска, фильтрации и пагинации
  const [search, setSearch] = useState('');
  const [selectedCityId, setSelectedCityId] = useState<number | ''>('');
  const [selectedRegionId, setSelectedRegionId] = useState<number | ''>('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  
  // Состояние для диалогов
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedServicePoint, setSelectedServicePoint] = useState<ServicePoint | null>(null);

  // RTK Query хуки
  const { data: regionsData, isLoading: regionsLoading } = useGetRegionsQuery({});
  const { data: citiesData, isLoading: citiesLoading } = useGetCitiesQuery(
    { 
      region_id: selectedRegionId ? Number(selectedRegionId) : undefined,
      page: 1,
      per_page: 100
    },
    { skip: !selectedRegionId }
  );
  const { data: servicePointsData, isLoading: servicePointsLoading, error } = useGetServicePointsQuery({
    query: search,
    city_id: selectedCityId || undefined,
    region_id: selectedRegionId || undefined,
    page: page + 1,
    per_page: rowsPerPage,
  });
  const [deleteServicePoint, { isLoading: isDeleting }] = useDeleteServicePointMutation();

  const isLoading = servicePointsLoading || regionsLoading || citiesLoading || isDeleting;
  const servicePoints = servicePointsData?.data || [];
  const totalItems = servicePointsData?.pagination?.total_count || 0;

  // Обработчики событий
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setPage(0); // Сбрасываем на первую страницу при поиске
  };

  const handleRegionChange = (event: any) => {
    const regionId = event.target.value;
    setSelectedRegionId(regionId);
    setSelectedCityId(''); // Сбрасываем выбранный город
    setPage(0);
  };

  const handleCityChange = (event: any) => {
    setSelectedCityId(event.target.value);
    setPage(0);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDeleteClick = (servicePoint: ServicePoint) => {
    setSelectedServicePoint(servicePoint);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedServicePoint && !isDeleting) {
      try {
        await deleteServicePoint({
          partner_id: selectedServicePoint.partner_id,
          id: selectedServicePoint.id
        }).unwrap();
      } catch (error) {
        console.error('Ошибка при удалении сервисной точки:', error);
      } finally {
        setDeleteDialogOpen(false);
        setSelectedServicePoint(null);
      }
    }
  };

  const handleCloseDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedServicePoint(null);
  };

  // Отображение состояний загрузки и ошибок
  if (isLoading) {
    return (
      <Box sx={tablePageStyles.loadingContainer}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={tablePageStyles.errorContainer}>
        <Alert severity="error" sx={tablePageStyles.errorAlert}>
          Ошибка при загрузке сервисных точек: {error.toString()}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={tablePageStyles.pageContainer}>
      {/* Заголовок и кнопка добавления */}
      <Box sx={tablePageStyles.pageHeader}>
        <Typography variant="h4" sx={tablePageStyles.pageTitle}>
          Сервисные точки
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate(partnerId ? `/partners/${partnerId}/service-points/new` : '/service-points/new')}
        >
          Добавить сервисную точку
        </Button>
      </Box>

      {/* Фильтры и поиск */}
      <Box sx={tablePageStyles.searchContainer}>
        <Box sx={tablePageStyles.filtersContainer}>
          <TextField
            placeholder="Поиск по названию или адресу"
            variant="outlined"
            size="small"
            value={search}
            onChange={handleSearchChange}
            sx={tablePageStyles.searchField}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          
            <Select
              label="Регион"
              value={selectedRegionId}
              onChange={(value) => {
                setSelectedRegionId(value as number | '');
                setSelectedCityId('');
                setPage(0);
              }}
              options={[
                { value: '', label: 'Все регионы' },
                ...(regionsData?.data?.map((region) => ({
                  value: region.id,
                  label: region.name
                })) || [])
              ]}
              size="small"
            sx={tablePageStyles.filterSelect}
            />

            <Select
              label="Город"
              value={selectedCityId}
              onChange={(value) => {
                setSelectedCityId(value as number | '');
                setPage(0);
              }}
              options={[
                { value: '', label: 'Все города' },
                ...(citiesData?.data?.map((city) => ({
                  value: city.id,
                  label: city.name
                })) || [])
              ]}
              disabled={!selectedRegionId}
              size="small"
            sx={tablePageStyles.filterSelect}
            />
        </Box>
      </Box>

      {/* Таблица сервисных точек */}
      <TableContainer sx={tablePageStyles.tableContainer}>
        <Table>
          <TableHead sx={tablePageStyles.tableHeader}>
            <TableRow>
              <TableCell>Название</TableCell>
              <TableCell>Адрес</TableCell>
              <TableCell>Область</TableCell>
              <TableCell>Город</TableCell>
              <TableCell>График работы</TableCell>
              <TableCell>Контакты</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {servicePoints.map((servicePoint) => (
              <TableRow key={servicePoint.id} sx={tablePageStyles.tableRow}>
                <TableCell>
                  <Box sx={tablePageStyles.avatarContainer}>
                    <BusinessIcon color="action" fontSize="small" />
                    <Typography>
                      {servicePoint.name}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={tablePageStyles.avatarContainer}>
                    <LocationIcon color="action" fontSize="small" />
                    <Typography>
                      {servicePoint.address}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={tablePageStyles.avatarContainer}>
                    <LocationCityIcon color="action" fontSize="small" />
                    <Typography>
                      {servicePoint.city?.region?.name || 'Не указана'}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={tablePageStyles.avatarContainer}>
                    <LocationCityIcon color="action" fontSize="small" />
                    <Typography>
                      {servicePoint.city?.name || 'Не указан'}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={tablePageStyles.avatarContainer}>
                    <AccessTimeIcon color="action" fontSize="small" />
                    <Typography>
                      {formatWorkingHours(servicePoint.working_hours)}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography>
                    {servicePoint.contact_phone || 'Не указан'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={servicePoint.status?.name || (servicePoint.is_active ? 'Активна' : 'Неактивна')}
                    color={servicePoint.is_active ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <Box sx={tablePageStyles.actionsContainer}>
                    <Tooltip title="Редактировать">
                      <IconButton 
                        onClick={() => {
                          // partner_id обязателен для сервисной точки
                          const partnerId = servicePoint.partner_id || servicePoint.partner?.id;
                          if (!partnerId) {
                            console.error('КРИТИЧЕСКАЯ ОШИБКА: Сервисная точка без partner_id!', servicePoint);
                            alert('Ошибка: Сервисная точка не связана с партнером. Обратитесь к администратору.');
                            return;
                          }
                          navigate(`/partners/${partnerId}/service-points/${servicePoint.id}/edit`);
                        }}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Удалить">
                      <IconButton
                        onClick={() => handleDeleteClick(servicePoint)}
                        size="small"
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Box sx={tablePageStyles.paginationContainer}>
          <Pagination
            count={Math.ceil(totalItems / rowsPerPage)}
            page={page + 1}
            onChange={(newPage) => setPage(newPage - 1)}
            color="primary"
            disabled={totalItems <= rowsPerPage}
          />
        </Box>
      </TableContainer>

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
              variant="outlined"
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