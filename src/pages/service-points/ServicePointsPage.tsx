import React, { useState } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useMediaQuery,
  useTheme,
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
import { 
  SIZES, 
  getCardStyles, 
  getButtonStyles, 
  getTextFieldStyles, 
  getAdaptiveTableStyles, 
  getChipStyles 
} from '../../styles';

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
  const cardStyles = getCardStyles(theme);
  const buttonStyles = getButtonStyles(theme);
  const textFieldStyles = getTextFieldStyles(theme);
  const tableStyles = getAdaptiveTableStyles(theme, isMobile, isTablet);
  const chipStyles = getChipStyles(theme);
  
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
    <Box sx={{ p: SIZES.spacing.lg }}>
      {/* Заголовок и кнопка добавления */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: SIZES.spacing.lg 
      }}>
        <Typography 
          variant="h4"
          sx={{ 
            fontSize: SIZES.fontSize.xl,
            fontWeight: 600 
          }}
        >
          Сервисные точки
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate(partnerId ? `/partners/${partnerId}/service-points/new` : '/service-points/new')}
          sx={{
            ...buttonStyles,
            borderRadius: SIZES.borderRadius.sm
          }}
        >
          Добавить сервисную точку
        </Button>
      </Box>

      {/* Фильтры и поиск */}
      <Paper sx={{ 
        ...cardStyles, 
        p: isMobile ? SIZES.spacing.md : SIZES.spacing.lg, 
        mb: SIZES.spacing.lg 
      }}>
        <Box sx={{ 
          display: 'flex', 
          gap: SIZES.spacing.md, 
          alignItems: isMobile ? 'stretch' : 'center', 
          flexDirection: isMobile ? 'column' : 'row',
          flexWrap: isMobile ? 'nowrap' : 'wrap'
        }}>
          <TextField
            placeholder="Поиск по названию или адресу"
            variant="outlined"
            size="small"
            value={search}
            onChange={handleSearchChange}
            sx={{ 
              ...textFieldStyles,
              minWidth: isMobile ? '100%' : 300,
              width: isMobile ? '100%' : 'auto',
              '& .MuiOutlinedInput-root': {
                borderRadius: SIZES.borderRadius.sm
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          
          <Box sx={{
            display: 'flex',
            gap: SIZES.spacing.md,
            flexDirection: isMobile ? 'column' : 'row',
            width: isMobile ? '100%' : 'auto',
          }}>
            <FormControl 
              size="small" 
              sx={{ 
                ...textFieldStyles,
                minWidth: isMobile ? '100%' : 150,
                width: isMobile ? '100%' : 150,
                '& .MuiOutlinedInput-root': {
                  borderRadius: SIZES.borderRadius.sm
                }
              }}
            >
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

            <FormControl 
              size="small" 
              sx={{ 
                ...textFieldStyles,
                minWidth: isMobile ? '100%' : 150,
                width: isMobile ? '100%' : 150,
                '& .MuiOutlinedInput-root': {
                  borderRadius: SIZES.borderRadius.sm
                }
              }}
            >
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
        </Box>
      </Paper>

      {/* Таблица сервисных точек */}
      <TableContainer 
        component={Paper} 
        sx={tableStyles.tableContainer}
      >
        <Table sx={tableStyles.table}>
          <TableHead sx={tableStyles.tableHead}>
            <TableRow>
              <TableCell sx={{ 
                fontSize: SIZES.fontSize.md, 
                fontWeight: 600 
              }}>
                Название
              </TableCell>
              <TableCell sx={{ 
                fontSize: SIZES.fontSize.md, 
                fontWeight: 600 
              }}>
                Адрес
              </TableCell>
              <TableCell sx={{ 
                fontSize: SIZES.fontSize.md, 
                fontWeight: 600 
              }}>
                Область
              </TableCell>
              <TableCell sx={{ 
                fontSize: SIZES.fontSize.md, 
                fontWeight: 600 
              }}>
                Город
              </TableCell>
              <TableCell sx={{ 
                fontSize: SIZES.fontSize.md, 
                fontWeight: 600 
              }}>
                График работы
              </TableCell>
              <TableCell sx={{ 
                fontSize: SIZES.fontSize.md, 
                fontWeight: 600 
              }}>
                Контакты
              </TableCell>
              <TableCell sx={{ 
                fontSize: SIZES.fontSize.md, 
                fontWeight: 600 
              }}>
                Статус
              </TableCell>
              <TableCell 
                align="right" 
                sx={{ 
                  fontSize: SIZES.fontSize.md, 
                  fontWeight: 600 
                }}
              >
                Действия
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {servicePoints.map((servicePoint) => (
              <TableRow key={servicePoint.id} sx={tableStyles.tableRow}>
                <TableCell sx={tableStyles.tableCell}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: SIZES.spacing.xs 
                  }}>
                    <BusinessIcon color="action" fontSize="small" />
                    <Typography sx={{ fontSize: SIZES.fontSize.sm }}>
                      {servicePoint.name}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell sx={tableStyles.tableCell}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: SIZES.spacing.xs 
                  }}>
                    <LocationIcon color="action" fontSize="small" />
                    <Typography sx={{ fontSize: SIZES.fontSize.sm }}>
                      {servicePoint.address}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell sx={tableStyles.tableCell}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: SIZES.spacing.xs 
                  }}>
                    <LocationCityIcon color="action" fontSize="small" />
                    <Typography sx={{ fontSize: SIZES.fontSize.sm }}>
                      {servicePoint.city?.region?.name || 'Не указана'}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell sx={tableStyles.tableCell}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: SIZES.spacing.xs 
                  }}>
                    <LocationCityIcon color="action" fontSize="small" />
                    <Typography sx={{ fontSize: SIZES.fontSize.sm }}>
                      {servicePoint.city?.name || 'Не указан'}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell sx={tableStyles.tableCell}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: SIZES.spacing.xs 
                  }}>
                    <AccessTimeIcon color="action" fontSize="small" />
                    <Typography sx={{ fontSize: SIZES.fontSize.sm }}>
                      {formatWorkingHours(servicePoint.working_hours)}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell sx={tableStyles.tableCell}>
                  <Typography sx={{ fontSize: SIZES.fontSize.sm }}>
                    {servicePoint.contact_phone || 'Не указан'}
                  </Typography>
                </TableCell>
                <TableCell sx={tableStyles.tableCell}>
                  <Chip
                    label={servicePoint.status?.name || (servicePoint.is_active ? 'Активна' : 'Неактивна')}
                    color={servicePoint.is_active ? 'success' : 'error'}
                    size="small"
                    sx={{
                      ...chipStyles,
                      fontSize: SIZES.fontSize.xs
                    }}
                  />
                </TableCell>
                <TableCell align="right" sx={tableStyles.tableCell}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'flex-end', 
                    gap: SIZES.spacing.xs 
                  }}>
                    <Tooltip title="Редактировать">
                      <IconButton 
                        onClick={() => navigate(`/partners/${servicePoint.partner_id}/service-points/${servicePoint.id}/edit`)}
                        size="small"
                        sx={{ 
                          color: theme.palette.primary.main,
                          '&:hover': {
                            backgroundColor: `${theme.palette.primary.main}15`
                          }
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Удалить">
                      <IconButton
                        onClick={() => handleDeleteClick(servicePoint)}
                        size="small"
                        color="error"
                        sx={{
                          '&:hover': {
                            backgroundColor: `${theme.palette.error.main}15`
                          }
                        }}
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
          sx={tableStyles.pagination}
        />
      </TableContainer>

      {/* Диалог подтверждения удаления */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={isDeleting ? undefined : handleCloseDialog}
        disableEscapeKeyDown={isDeleting}
        PaperProps={{
          sx: {
            ...cardStyles,
            borderRadius: SIZES.borderRadius.md,
            minWidth: 400
          }
        }}
      >
        <DialogTitle sx={{ 
          fontSize: SIZES.fontSize.lg, 
          fontWeight: 600,
          pb: SIZES.spacing.sm
        }}>
          Подтверждение удаления
        </DialogTitle>
        <DialogContent sx={{ pb: SIZES.spacing.md }}>
          <Typography sx={{ fontSize: SIZES.fontSize.md }}>
            Вы действительно хотите удалить сервисную точку "{selectedServicePoint?.name}"?
            Это действие нельзя будет отменить.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ 
          p: SIZES.spacing.lg, 
          gap: SIZES.spacing.sm 
        }}>
          <Button 
            onClick={handleCloseDialog} 
            disabled={isDeleting}
            sx={{
              ...buttonStyles,
              variant: 'outlined',
              borderRadius: SIZES.borderRadius.sm
            }}
          >
            Отмена
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
            sx={{
              borderRadius: SIZES.borderRadius.sm,
              '&:hover': {
                backgroundColor: theme.palette.error.dark
              }
            }}
          >
            {isDeleting ? 'Удаление...' : 'Удалить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ServicePointsPage; 