import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Paper,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TablePagination,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  LocationOn as LocationIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  AccessTime as AccessTimeIcon,
  Business as BusinessIcon,
  LocationCity as LocationCityIcon,
} from '@mui/icons-material';
import {
  useGetServicePointsQuery,
  useDeleteServicePointMutation,
  useUpdateServicePointMutation,
  useGetRegionsQuery,
  useGetCitiesQuery,
} from '../../api';
import type { ServicePoint } from '../../types/models';
import type { WorkingHoursSchedule, WorkingHours } from '../../types/working-hours';

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

const ServicePointsPage: React.FC = () => {
  const navigate = useNavigate();
  const { id: partnerId } = useParams<{ id: string }>();
  
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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Ошибка при загрузке сервисных точек: {error.toString()}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Заголовок и кнопка добавления */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Сервисные точки</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate(partnerId ? `/partners/${partnerId}/service-points/new` : '/service-points/new')}
        >
          Добавить сервисную точку
        </Button>
      </Box>

      {/* Фильтры и поиск */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            placeholder="Поиск по названию или адресу"
            variant="outlined"
            size="small"
            value={search}
            onChange={handleSearchChange}
            sx={{ minWidth: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Регион</InputLabel>
            <Select
              value={selectedRegionId}
              onChange={handleRegionChange}
              label="Регион"
            >
              <MenuItem value="">Все регионы</MenuItem>
              {regionsData?.data?.map((region) => (
                <MenuItem key={region.id} value={region.id}>
                  {region.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Город</InputLabel>
            <Select
              value={selectedCityId}
              onChange={handleCityChange}
              label="Город"
              disabled={!selectedRegionId}
            >
              <MenuItem value="">Все города</MenuItem>
              {citiesData?.data?.map((city) => (
                <MenuItem key={city.id} value={city.id}>
                  {city.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Таблица сервисных точек */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
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
              <TableRow key={servicePoint.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BusinessIcon color="action" fontSize="small" />
                    <Typography>{servicePoint.name}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationIcon color="action" fontSize="small" />
                    <Typography>{servicePoint.address}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationCityIcon color="action" fontSize="small" />
                    <Typography>{servicePoint.city?.region?.name || 'Не указана'}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationCityIcon color="action" fontSize="small" />
                    <Typography>{servicePoint.city?.name || 'Не указан'}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessTimeIcon color="action" fontSize="small" />
                    <Typography>{formatWorkingHours(servicePoint.working_hours)}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography>{servicePoint.contact_phone || 'Не указан'}</Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={servicePoint.status?.name || (servicePoint.is_active ? 'Активна' : 'Неактивна')}
                    color={servicePoint.is_active ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Tooltip title="Редактировать">
                      <IconButton 
                        onClick={() => navigate(`/partners/${servicePoint.partner_id}/service-points/${servicePoint.id}/edit`)}
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
        <TablePagination
          component="div"
          count={totalItems}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[10, 25, 50, 100]}
        />
      </TableContainer>

      {/* Диалог подтверждения удаления */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={isDeleting ? undefined : handleCloseDialog}
        disableEscapeKeyDown={isDeleting}
      >
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <Typography>
            Вы действительно хотите удалить сервисную точку "{selectedServicePoint?.name}"?
            Это действие нельзя будет отменить.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={isDeleting}>Отмена</Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
          >
            {isDeleting ? 'Удаление...' : 'Удалить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ServicePointsPage; 