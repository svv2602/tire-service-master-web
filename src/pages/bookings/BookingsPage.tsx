import React, { useState } from 'react';
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
  Avatar,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Event as EventIcon,
  Business as BusinessIcon,
  DirectionsCar as CarIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  Build as BuildIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { 
  useGetBookingsQuery, 
  useDeleteBookingMutation,
  useUpdateBookingStatusMutation,
  useGetServicePointsQuery,
  useGetClientsQuery,
} from '../../api';
import { Booking, BookingStatus } from '../../types/booking';

// Статусы бронирований с типизацией
const BOOKING_STATUSES: Record<BookingStatus, { 
  label: string; 
  color: 'warning' | 'info' | 'primary' | 'success' | 'error';
  icon: React.ComponentType;
}> = {
  pending: { label: 'Ожидает', color: 'warning', icon: PendingIcon },
  confirmed: { label: 'Подтверждено', color: 'info', icon: CheckCircleIcon },
  in_progress: { label: 'В работе', color: 'primary', icon: BuildIcon },
  completed: { label: 'Завершено', color: 'success', icon: CheckCircleIcon },
  cancelled: { label: 'Отменено', color: 'error', icon: CancelIcon },
};

const BookingsPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Состояние для поиска, фильтрации и пагинации
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | ''>('');
  const [servicePointId, setServicePointId] = useState<string>('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  
  // Состояние для диалогов
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [newStatus, setNewStatus] = useState<BookingStatus | ''>('');

  // RTK Query хуки
  const { 
    data: bookingsData, 
    isLoading: bookingsLoading, 
    error: bookingsError 
  } = useGetBookingsQuery({
    search: search || undefined,
    status: statusFilter || undefined,
    service_point_id: servicePointId || undefined,
    page: page + 1,
    per_page: rowsPerPage,
  });

  const { data: servicePoints } = useGetServicePointsQuery({});
  const { data: clients } = useGetClientsQuery({});

  const [deleteBooking, { isLoading: deleteLoading }] = useDeleteBookingMutation();
  const [updateStatus, { isLoading: updateStatusLoading }] = useUpdateBookingStatusMutation();

  const isLoading = bookingsLoading || deleteLoading || updateStatusLoading;
  const error = bookingsError;
  const bookings = bookingsData?.data || [];
  const totalItems = bookingsData?.meta?.total || 0;

  // Обработчики событий
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setPage(0);
  };

  const handleStatusFilterChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setStatusFilter(event.target.value as BookingStatus | '');
    setPage(0);
  };

  const handleServicePointChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setServicePointId(event.target.value as string);
    setPage(0);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDeleteClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedBooking) {
      try {
        await deleteBooking(selectedBooking.id).unwrap();
        setDeleteDialogOpen(false);
        setSelectedBooking(null);
      } catch (error) {
        console.error('Ошибка при удалении бронирования:', error);
      }
    }
  };

  const handleStatusChangeClick = (booking: Booking, status: BookingStatus) => {
    setSelectedBooking(booking);
    setNewStatus(status);
    setStatusDialogOpen(true);
  };

  const handleStatusChangeConfirm = async () => {
    if (selectedBooking && newStatus) {
      try {
        await updateStatus({ 
          id: selectedBooking.id, 
          status: newStatus 
        }).unwrap();
        setStatusDialogOpen(false);
        setSelectedBooking(null);
        setNewStatus('');
      } catch (error) {
        console.error('Ошибка при изменении статуса:', error);
      }
    }
  };

  const handleCloseDialog = () => {
    setDeleteDialogOpen(false);
    setStatusDialogOpen(false);
    setSelectedBooking(null);
    setNewStatus('');
  };

  // Вспомогательные функции
  const getClientInitials = (booking: Booking) => {
    const firstName = booking.client?.firstName || '';
    const lastName = booking.client?.lastName || '';
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || 'К';
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('ru-RU'),
      time: date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    };
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
          Ошибка при загрузке бронирований: {error.toString()}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Заголовок и кнопка добавления */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Бронирования</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/bookings/new')}
        >
          Создать бронирование
        </Button>
      </Box>

      {/* Фильтры и поиск */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            placeholder="Поиск по клиенту или автомобилю"
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
            <InputLabel>Статус</InputLabel>
            <Select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              label="Статус"
            >
              <MenuItem value="">Все статусы</MenuItem>
              {Object.entries(BOOKING_STATUSES).map(([value, { label }]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Сервисная точка</InputLabel>
            <Select
              value={servicePointId}
              onChange={handleServicePointChange}
              label="Сервисная точка"
            >
              <MenuItem value="">Все точки</MenuItem>
              {servicePoints?.data?.map((point) => (
                <MenuItem key={point.id} value={point.id}>
                  {point.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Таблица бронирований */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Клиент</TableCell>
              <TableCell>Дата и время</TableCell>
              <TableCell>Сервисная точка</TableCell>
              <TableCell>Автомобиль</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bookings.map((booking) => {
              const { date, time } = formatDateTime(booking.startTime);
              const StatusIcon = BOOKING_STATUSES[booking.status].icon;

              return (
                <TableRow key={booking.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {getClientInitials(booking)}
                      </Avatar>
                      <Typography>
                        {booking.client?.firstName} {booking.client?.lastName}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EventIcon color="action" />
                      <Box>
                        <Typography>{date}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          {time}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <BusinessIcon color="action" />
                      <Typography>{booking.servicePoint?.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CarIcon color="action" />
                      <Typography>
                        {booking.clientCar?.carBrand?.name} {booking.clientCar?.carModel?.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={<StatusIcon />}
                      label={BOOKING_STATUSES[booking.status].label}
                      color={BOOKING_STATUSES[booking.status].color}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                      <Tooltip title="Изменить статус">
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                          <Select
                            value=""
                            onChange={(e) => handleStatusChangeClick(booking, e.target.value as BookingStatus)}
                            displayEmpty
                            size="small"
                          >
                            <MenuItem value="" disabled>
                              Изменить статус
                            </MenuItem>
                            {Object.entries(BOOKING_STATUSES).map(([value, { label }]) => (
                              value !== booking.status && (
                                <MenuItem key={value} value={value}>
                                  {label}
                                </MenuItem>
                              )
                            ))}
                          </Select>
                        </FormControl>
                      </Tooltip>
                      <Tooltip title="Редактировать">
                        <IconButton 
                          onClick={() => navigate(`/bookings/${booking.id}/edit`)}
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Удалить">
                        <IconButton
                          onClick={() => handleDeleteClick(booking)}
                          size="small"
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
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
      <Dialog open={deleteDialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <Typography>
            Вы действительно хотите удалить бронирование клиента{' '}
            {selectedBooking?.client?.firstName} {selectedBooking?.client?.lastName}?
            Это действие нельзя будет отменить.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Удалить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог изменения статуса */}
      <Dialog open={statusDialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Изменение статуса бронирования</DialogTitle>
        <DialogContent>
          <Typography>
            Вы действительно хотите изменить статус бронирования клиента{' '}
            {selectedBooking?.client?.firstName} {selectedBooking?.client?.lastName}{' '}
            на "{newStatus ? BOOKING_STATUSES[newStatus].label : ''}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          <Button onClick={handleStatusChangeConfirm} color="primary" variant="contained">
            Изменить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BookingsPage; 