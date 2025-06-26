import React, { useState, useMemo, useCallback } from 'react';
import {
  useTheme, 
  InputAdornment,
  IconButton,
  Avatar,
  Alert,
  Grid,
  FormControl,
  InputLabel,
  MenuItem,
  Autocomplete
} from '@mui/material';
import {
  Box,
  Typography,
  CircularProgress,
  Tooltip,
  Table,
  type Column
} from '../../components/ui';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  FilterList as FilterListIcon,
  Sort as SortIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
} from '@mui/icons-material';
import { getTablePageStyles } from '../../styles';
import { useNavigate } from 'react-router-dom';
import { 
  useGetBookingsQuery,
  useDeleteBookingMutation,
  useUpdateBookingMutation,
} from '../../api/bookings.api';
import { useGetServicePointsQuery } from '../../api/servicePoints.api';
import { Booking } from '../../types/models';
import { BookingFilter } from '../../types/booking';

// Импорты UI компонентов
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/TextField';
import { Chip } from '../../components/ui/Chip';
import { Pagination } from '../../components/ui/Pagination';
import { Modal } from '../../components/ui/Modal';


const BookingsPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const tablePageStyles = getTablePageStyles(theme);
  
  // Состояние для поиска, фильтров и пагинации
  const [search, setSearch] = useState('');
  const [selectedServicePoint, setSelectedServicePoint] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'created'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(0);
  const rowsPerPage = 25;
  
  // Состояние для диалогов
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  
  // RTK Query хуки
  const { 
    data: bookingsData, 
    isLoading: bookingsLoading, 
    error: bookingsError,
    refetch: refetchBookings
  } = useGetBookingsQuery({
    query: search || undefined,
    service_point_id: selectedServicePoint !== 'all' ? Number(selectedServicePoint) : undefined,
    sort_by: sortBy,
    sort_order: sortOrder,
    page: page + 1,
    per_page: rowsPerPage,
  } as BookingFilter);

  // Загружаем сервисные точки для фильтра
  const { data: servicePointsData, isLoading: servicePointsLoading } = useGetServicePointsQuery({
    page: 1,
    per_page: 100, // Загружаем все доступные сервисные точки
  });

  const [deleteBooking, { isLoading: deleteLoading }] = useDeleteBookingMutation();
  const [updateBooking] = useUpdateBookingMutation();

  const isLoading = bookingsLoading || deleteLoading || servicePointsLoading;
  const error = bookingsError;
  const bookings = bookingsData?.data || [];
  const totalItems = bookingsData?.pagination?.total_count || 0;
  const servicePoints = servicePointsData?.data || [];

  // Обработчики событий
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setPage(0);
  };

  const handleServicePointChange = (value: string | number) => {
    setSelectedServicePoint(String(value));
    setPage(0);
  };

  const handleSortChange = (newSortBy: 'date' | 'created') => {
    if (sortBy === newSortBy) {
      // Если кликнули по той же колонке, меняем порядок сортировки
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Если выбрали новую колонку, устанавливаем по убыванию по умолчанию
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
    setPage(0);
  };

  const handleDeleteClick = useCallback((booking: Booking) => {
    setSelectedBooking(booking);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (selectedBooking) {
      try {
        await deleteBooking(selectedBooking.id.toString()).unwrap();
        setDeleteDialogOpen(false);
        setSelectedBooking(null);
        // Принудительно обновляем данные после удаления
        await refetchBookings();
      } catch (error) {
        console.error('Ошибка при удалении бронирования:', error);
      }
    }
  }, [selectedBooking, deleteBooking, refetchBookings]);

  const handleToggleStatus = useCallback(async (booking: Booking) => {
    try {
      await updateBooking({
        id: booking.id.toString(),
        booking: { 
          status_id: booking.status_id === 1 ? 2 : 1
        }
      }).unwrap();
    } catch (error) {
      console.error('Ошибка при изменении статуса:', error);
    }
  }, [updateBooking]);

  const handleCloseDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedBooking(null);
  };

  const handleCreateBooking = () => {
    navigate('/client/booking/new-with-availability');
  };

  // Вспомогательные функции для Autocomplete
  const getServicePointOptions = useMemo(() => [
    { id: 'all', label: 'Все сервисные точки', name: 'Все сервисные точки', city: null },
    ...servicePoints.map(point => ({
      id: point.id.toString(),
      label: `${point.name} (${point.city?.name || 'Неизвестный город'})`,
      name: point.name,
      city: point.city
    }))
  ], [servicePoints]);

  const getSelectedServicePointOption = useMemo(() => {
    if (selectedServicePoint === 'all') {
      return { id: 'all', label: 'Все сервисные точки', name: 'Все сервисные точки', city: null };
    }
    const foundPoint = servicePoints.find(p => p.id.toString() === selectedServicePoint);
    if (foundPoint) {
      return {
        id: selectedServicePoint,
        label: `${foundPoint.name} (${foundPoint.city?.name || 'Неизвестный город'})`,
        name: foundPoint.name,
        city: foundPoint.city
      };
    }
    return { id: 'all', label: 'Все сервисные точки', name: 'Все сервисные точки', city: null };
  }, [selectedServicePoint, servicePoints]);

  // Определение колонок для UI Table
  const columns: Column[] = useMemo(() => [
    {
      id: 'client',
      label: 'Клиент',
      minWidth: 200,
      wrap: true,
      format: (value: any, row: any) => {
        const booking = row as Booking;
        return (
          <Box sx={tablePageStyles.avatarContainer}>
            <Avatar>
              {booking.client?.user?.first_name?.charAt(0) || booking.client?.user?.last_name?.charAt(0) || '?'}
            </Avatar>
            <Typography>
              {booking.client?.user ? `${booking.client.user.first_name} ${booking.client.user.last_name}` : 'Неизвестный клиент'}
            </Typography>
          </Box>
        );
      },
    },
    {
      id: 'service_point',
      label: 'Точка обслуживания',
      minWidth: 180,
      wrap: true,
      format: (value: any, row: any) => {
        const booking = row as Booking;
        return <Typography>{booking.service_point?.name}</Typography>;
      },
    },
    {
      id: 'booking_date',
      label: `Дата и время ${sortBy === 'date' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}`,
      minWidth: 160,
      format: (value: any, row: any) => {
        const booking = row as Booking;
        return (
          <Box 
            sx={{ 
              cursor: 'pointer',
              '&:hover': { opacity: 0.7 }
            }}
            onClick={() => handleSortChange('date')}
          >
            <Typography>
              {new Date(booking.booking_date).toLocaleDateString()} {new Date(booking.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Typography>
          </Box>
        );
      },
    },
    {
      id: 'status',
      label: 'Статус',
      minWidth: 120,
      align: 'center' as const,
      format: (value: any, row: any) => {
        const booking = row as Booking;
        return (
          <Chip
            label={getStatusLabel(booking.status_id)}
            color={getStatusColor(booking.status_id)}
            size="small"
          />
        );
      },
    },
    {
      id: 'actions',
      label: 'Действия',
      minWidth: 150,
      align: 'right' as const,
      format: (value: any, row: any) => {
        const booking = row as Booking;
        return (
          <Box sx={tablePageStyles.actionsContainer}>
            <Tooltip title="Редактировать">
              <IconButton
                onClick={() => navigate(`/admin/bookings/${booking.id}/edit`)}
                size="small"
                sx={tablePageStyles.actionButton}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={booking.status_id === 2 ? 'Отметить как ожидающее' : 'Отметить как завершенное'}>
              <IconButton
                onClick={() => handleToggleStatus(booking)}
                size="small"
                color={booking.status_id === 2 ? 'warning' : 'success'}
                sx={tablePageStyles.actionButton}
              >
                {booking.status_id === 2 ? <CloseIcon /> : <CheckIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Удалить">
              <IconButton
                onClick={() => handleDeleteClick(booking)}
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
  ], [tablePageStyles, navigate, handleToggleStatus, handleDeleteClick]);

  // Вспомогательные функции
  const getStatusLabel = (statusId: number): string => {
    switch (statusId) {
      case 1: return 'В ожидании';
      case 2: return 'Завершено';
      case 3: return 'Отменено';
      default: return `Статус ${statusId}`;
    }
  };

  const getStatusColor = (statusId: number): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (statusId) {
      case 1: return 'warning';
      case 2: return 'success';
      case 3: return 'error';
      default: return 'default';
    }
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
        <Alert severity="error">
          ❌ Ошибка при загрузке бронирований: {error.toString()}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={tablePageStyles.pageContainer}>
      {/* Заголовок */}
      <Box sx={tablePageStyles.pageHeader}>
        <Typography variant="h4" sx={tablePageStyles.pageTitle}>Бронирования</Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateBooking}
          >
            Новое бронирование
          </Button>
        </Box>
      </Box>

      {/* Поиск */}
      <Box sx={tablePageStyles.searchContainer}>
        <TextField
          placeholder="Поиск по имени, фамилии, email или номеру телефона клиента"
          variant="outlined"
          size="small"
          value={search}
          onChange={handleSearchChange}
          fullWidth
          sx={tablePageStyles.searchField}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Фильтры */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <Autocomplete
              options={getServicePointOptions}
              value={getSelectedServicePointOption}
              onChange={(event, newValue) => {
                handleServicePointChange(newValue?.id || 'all');
              }}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              filterOptions={(options, params) => {
                const { inputValue } = params;
                
                // Если нет введенного текста, показываем все опции
                if (!inputValue) return options;
                
                const lowercaseInput = inputValue.toLowerCase().trim();
                
                // Фильтруем опции по введенному тексту
                return options.filter(option => {
                  // Всегда показываем опцию "Все сервисные точки"
                  if (option.id === 'all') return true;
                  
                  // Поиск по названию сервисной точки
                  if (option.name && option.name.toLowerCase().includes(lowercaseInput)) {
                    return true;
                  }
                  
                  // Поиск по названию города
                  if (option.city?.name && option.city.name.toLowerCase().includes(lowercaseInput)) {
                    return true;
                  }
                  
                  // Поиск по полной строке label (название + город)
                  if (option.label && option.label.toLowerCase().includes(lowercaseInput)) {
                    return true;
                  }
                  
                  return false;
                });
              }}
              renderOption={(props, option) => (
                <Box component="li" {...props} key={option.id}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                    <Typography variant="body2" sx={{ fontWeight: option.id === 'all' ? 'bold' : 'normal' }}>
                      {option.name}
                    </Typography>
                    {option.city && (
                      <Typography variant="caption" color="text.secondary">
                        {option.city.name}
                      </Typography>
                    )}
                  </Box>
                </Box>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Сервисная точка"
                  size="small"
                  fullWidth
                  placeholder="Начните вводить название сервисной точки или города..."
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <InputAdornment position="start">
                          <FilterListIcon />
                        </InputAdornment>
                        {params.InputProps.startAdornment}
                      </>
                    ),
                  }}
                />
              )}
              size="small"
              fullWidth
              noOptionsText="Сервисные точки не найдены"
              clearOnBlur={false}
              selectOnFocus
              handleHomeEndKeys
              freeSolo={false}
              autoComplete
              autoHighlight
              openOnFocus
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SortIcon fontSize="small" />
              Сортировка: {sortBy === 'date' ? 'По дате бронирования' : 'По дате создания'} 
              ({sortOrder === 'asc' ? 'по возрастанию' : 'по убыванию'})
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={12} md={4}>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
              <Button
                variant={sortBy === 'date' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => handleSortChange('date')}
                startIcon={sortBy === 'date' && (sortOrder === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
              >
                По дате
              </Button>
              <Button
                variant={sortBy === 'created' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => handleSortChange('created')}
                startIcon={sortBy === 'created' && (sortOrder === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
              >
                По созданию
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Таблица бронирований с UI Table компонентом */}
      <Box sx={tablePageStyles.tableContainer}>
        <Table 
          columns={columns}
          rows={bookings}
        />
        <Box sx={tablePageStyles.paginationContainer}>
          <Pagination
            count={Math.ceil(totalItems / rowsPerPage)}
            page={page + 1}
            onChange={(newPage) => setPage(newPage - 1)}
            color="primary"
            disabled={totalItems <= rowsPerPage}
          />
        </Box>
      </Box>

      {/* Модальное окно подтверждения удаления */}
      <Modal 
        open={deleteDialogOpen} 
        onClose={handleCloseDialog}
        title="Подтверждение удаления"
        maxWidth={400}
        actions={
          <>
            <Button onClick={handleCloseDialog}>Отмена</Button>
            <Button onClick={handleDeleteConfirm} color="error" variant="contained">
              Удалить
            </Button>
          </>
        }
      >
        <Typography>
          Вы действительно хотите удалить бронирование?
          Это действие нельзя будет отменить.
        </Typography>
      </Modal>
    </Box>
  );
};

export default BookingsPage; 