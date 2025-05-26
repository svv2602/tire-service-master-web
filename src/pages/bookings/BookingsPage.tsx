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
  Person as PersonIcon,
  Business as BusinessIcon,
  DirectionsCar as CarIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  Build as BuildIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { 
  useGetBookingsQuery, 
  useDeleteBookingMutation,
  useUpdateBookingStatusMutation
} from '../../api/bookings';

// Статусы бронирований
const BOOKING_STATUSES = {
  pending: { label: 'Ожидает', color: 'warning' as const, icon: PendingIcon },
  confirmed: { label: 'Подтверждено', color: 'info' as const, icon: CheckCircleIcon },
  in_progress: { label: 'В работе', color: 'primary' as const, icon: BuildIcon },
  completed: { label: 'Завершено', color: 'success' as const, icon: CheckCircleIcon },
  cancelled: { label: 'Отменено', color: 'error' as const, icon: CancelIcon },
};

const BookingsPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Состояние для поиска, фильтрации и пагинации
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  
  // Состояние для диалогов
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<{ id: number; client_name: string } | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');

  // RTK Query хуки
  const { 
    data: bookingsData, 
    isLoading, 
    error 
  } = useGetBookingsQuery({
    query: search || undefined,
    status: statusFilter || undefined,
    page: page + 1, // API использует 1-based пагинацию
    per_page: rowsPerPage,
  });

  const [deleteBooking, { isLoading: deleteLoading }] = useDeleteBookingMutation();
  const [updateStatus, { isLoading: updateStatusLoading }] = useUpdateBookingStatusMutation();

  // Обработчики событий
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setPage(0); // Сбрасываем на первую страницу при поиске
  };

  const handleStatusFilterChange = (event: any) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDeleteClick = (booking: { id: number; client_name: string }) => {
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

  const handleStatusChangeClick = (booking: { id: number; client_name: string }, status: string) => {
    setSelectedBooking(booking);
    setNewStatus(status);
    setStatusDialogOpen(true);
  };

  const handleStatusChangeConfirm = async () => {
    if (selectedBooking && newStatus) {
      try {
        await updateStatus({ id: selectedBooking.id, status: newStatus }).unwrap();
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

  // Функция для получения инициалов клиента
  const getClientInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || 'К';
  };

  // Функция для форматирования даты и времени
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

  const bookings = bookingsData?.data || [];
  const totalItems = bookingsData?.pagination?.total_count || 0;

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
            placeholder="Поиск по клиенту или услуге"
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
              {Object.entries(BOOKING_STATUSES).map(([key, status]) => (
                <MenuItem key={key} value={key}>
                  {status.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Таблица бронирований */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Клиент</TableCell>
                <TableCell>Услуга</TableCell>
                <TableCell>Дата и время</TableCell>
                <TableCell>Автомобиль</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell>Стоимость</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bookings.map((booking) => {
                const statusInfo = BOOKING_STATUSES[booking.status as keyof typeof BOOKING_STATUSES];
                const StatusIcon = statusInfo?.icon || PendingIcon;
                const scheduledDateTime = formatDateTime(booking.scheduled_at);
                
                return (
                  <TableRow key={booking.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          {getClientInitials(
                            booking.client?.user?.first_name,
                            booking.client?.user?.last_name
                          )}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight="medium">
                            {booking.client?.user?.first_name && booking.client?.user?.last_name
                              ? `${booking.client.user.first_name} ${booking.client.user.last_name}`
                              : 'Имя не указано'
                            }
                          </Typography>
                          {booking.client?.user?.phone && (
                            <Typography variant="body2" color="text.secondary">
                              {booking.client.user.phone}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="medium">
                          {booking.service_type?.name || 'Услуга не указана'}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          <BusinessIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {booking.service_point?.name || 'Точка не указана'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <EventIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                        <Box>
                          <Typography variant="body2">
                            {scheduledDateTime.date}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {scheduledDateTime.time}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CarIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                        <Box>
                          <Typography variant="body2">
                            {booking.car_brand?.name} {booking.car_model?.name}
                          </Typography>
                          {booking.car_year && (
                            <Typography variant="body2" color="text.secondary">
                              {booking.car_year} г.
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Chip
                        label={statusInfo?.label || booking.status}
                        color={statusInfo?.color || 'default'}
                        size="small"
                        icon={<StatusIcon />}
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {booking.total_price 
                          ? `${booking.total_price.toLocaleString('ru-RU')} ₽`
                          : 'Не указана'
                        }
                      </Typography>
                    </TableCell>
                    
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {/* Быстрые действия по статусу */}
                        {booking.status === 'pending' && (
                          <Tooltip title="Подтвердить">
                            <IconButton
                              size="small"
                              onClick={() => handleStatusChangeClick(
                                { id: booking.id, client_name: booking.client?.user?.first_name || 'Клиент' },
                                'confirmed'
                              )}
                              color="success"
                            >
                              <CheckCircleIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        
                        {booking.status === 'confirmed' && (
                          <Tooltip title="Начать работу">
                            <IconButton
                              size="small"
                              onClick={() => handleStatusChangeClick(
                                { id: booking.id, client_name: booking.client?.user?.first_name || 'Клиент' },
                                'in_progress'
                              )}
                              color="primary"
                            >
                              <BuildIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        
                        {booking.status === 'in_progress' && (
                          <Tooltip title="Завершить">
                            <IconButton
                              size="small"
                              onClick={() => handleStatusChangeClick(
                                { id: booking.id, client_name: booking.client?.user?.first_name || 'Клиент' },
                                'completed'
                              )}
                              color="success"
                            >
                              <CheckCircleIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        
                        <Tooltip title="Редактировать">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/bookings/${booking.id}/edit`)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Удалить">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteClick({
                              id: booking.id,
                              client_name: booking.client?.user?.first_name || 'Клиент'
                            })}
                            disabled={deleteLoading}
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
              
              {bookings.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      {search || statusFilter ? 'Бронирования не найдены' : 'Нет бронирований'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Пагинация */}
        <TablePagination
          component="div"
          count={totalItems}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[10, 25, 50, 100]}
          labelRowsPerPage="Строк на странице:"
          labelDisplayedRows={({ from, to, count }) => 
            `${from}-${to} из ${count !== -1 ? count : `более чем ${to}`}`
          }
        />
      </Paper>

      {/* Диалог подтверждения удаления */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить бронирование клиента "{selectedBooking?.client_name}"?
            Это действие нельзя отменить.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            disabled={deleteLoading}
          >
            {deleteLoading ? 'Удаление...' : 'Удалить'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог изменения статуса */}
      <Dialog open={statusDialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Изменение статуса</DialogTitle>
        <DialogContent>
          <Typography>
            Изменить статус бронирования клиента "{selectedBooking?.client_name}" на "
            {BOOKING_STATUSES[newStatus as keyof typeof BOOKING_STATUSES]?.label}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          <Button 
            onClick={handleStatusChangeConfirm} 
            color="primary" 
            variant="contained"
            disabled={updateStatusLoading}
          >
            {updateStatusLoading ? 'Изменение...' : 'Изменить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BookingsPage; 