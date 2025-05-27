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
  Avatar,
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { 
  useGetBookingsQuery,
  useDeleteBookingMutation,
  useUpdateBookingMutation,
} from '../../api/bookings.api';
import { Booking, ApiResponse } from '../../types/models';
import { BookingStatusEnum, BookingFilter } from '../../types/booking';

const BookingsPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Состояние для поиска и пагинации
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [statusFilter, setStatusFilter] = useState<string>('');
  
  // Состояние для диалогов
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // RTK Query хуки
  const { 
    data: bookingsData, 
    isLoading: bookingsLoading, 
    error: bookingsError 
  } = useGetBookingsQuery({
    query: search || undefined,
    page: page + 1,
    per_page: rowsPerPage,
  } as BookingFilter);

  const [deleteBooking, { isLoading: deleteLoading }] = useDeleteBookingMutation();
  const [updateBooking] = useUpdateBookingMutation();

  const isLoading = bookingsLoading || deleteLoading;
  const error = bookingsError;
  const bookings = (bookingsData as ApiResponse<Booking>)?.data || [];
  const totalItems = (bookingsData as ApiResponse<Booking>)?.total || 0;

  // Обработчики событий
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
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
        await deleteBooking(selectedBooking.id.toString()).unwrap();
        setDeleteDialogOpen(false);
        setSelectedBooking(null);
      } catch (error) {
        console.error('Ошибка при удалении бронирования:', error);
      }
    }
  };

  const handleToggleStatus = async (booking: Booking) => {
    try {
      await updateBooking({
        id: booking.id.toString(),
        booking: { 
          status: booking.status === BookingStatusEnum.PENDING ? 
            BookingStatusEnum.COMPLETED : 
            BookingStatusEnum.PENDING 
        }
      }).unwrap();
    } catch (error) {
      console.error('Ошибка при изменении статуса:', error);
    }
  };

  const handleCloseDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedBooking(null);
  };

  // Вспомогательные функции
  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'pending': return 'В ожидании';
      case 'confirmed': return 'Подтверждено';
      case 'in_progress': return 'В работе';
      case 'completed': return 'Завершено';
      case 'cancelled': return 'Отменено';
      default: return status;
    }
  };

  const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (status) {
      case 'pending': return 'warning';
      case 'confirmed': return 'info';
      case 'in_progress': return 'primary';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
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
      {/* Заголовок */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Бронирования</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/bookings/new')}
        >
          Новое бронирование
        </Button>
      </Box>

      {/* Поиск */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          placeholder="Поиск по клиенту или точке обслуживания"
          variant="outlined"
          size="small"
          value={search}
          onChange={handleSearchChange}
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {/* Таблица бронирований */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Клиент</TableCell>
              <TableCell>Точка обслуживания</TableCell>
              <TableCell>Дата и время</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bookings.map((booking: Booking) => (
              <TableRow key={booking.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar>
                      {booking.client?.first_name?.charAt(0) || booking.client?.last_name?.charAt(0) || '?'}
                    </Avatar>
                    <Typography>
                      {booking.client ? `${booking.client.first_name} ${booking.client.last_name}` : 'Неизвестный клиент'}
                    </Typography>
                  </Box>
                </TableCell>

                <TableCell>{booking.service_point?.name}</TableCell>

                <TableCell>
                  {new Date(booking.scheduled_at).toLocaleString()}
                </TableCell>

                <TableCell>
                  <Chip
                    label={getStatusLabel(booking.status)}
                    color={getStatusColor(booking.status)}
                    size="small"
                  />
                </TableCell>

                <TableCell align="right">
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Tooltip title="Редактировать">
                      <IconButton
                        onClick={() => navigate(`/bookings/${booking.id}/edit`)}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={booking.status === 'completed' ? 'Отметить как ожидающее' : 'Отметить как завершенное'}>
                      <IconButton
                        onClick={() => handleToggleStatus(booking)}
                        size="small"
                        color={booking.status === 'completed' ? 'warning' : 'success'}
                      >
                        {booking.status === 'completed' ? <CloseIcon /> : <CheckIcon />}
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
      <Dialog open={deleteDialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <Typography>
            Вы действительно хотите удалить бронирование?
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
    </Box>
  );
};

export default BookingsPage; 