import React, { useState } from 'react';
import { 
  useTheme, 
  InputAdornment, 
  Menu, 
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Avatar
} from '@mui/material';
import {
  Box,
  Typography,
  CircularProgress,
  Tooltip,
} from '../../components/ui';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  ArrowDropDown as ArrowDropDownIcon,
} from '@mui/icons-material';
import { getTablePageStyles } from '../../styles';
import { useNavigate } from 'react-router-dom';
import { 
  useGetBookingsQuery,
  useDeleteBookingMutation,
  useUpdateBookingMutation,
} from '../../api/bookings.api';
import { Booking, ApiResponse } from '../../types/models';
import { BookingStatusEnum, BookingFilter } from '../../types/booking';

// Импорты UI компонентов
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/TextField';
import { Alert } from '../../components/ui/Alert';
import { Chip } from '../../components/ui/Chip';
import { Pagination } from '../../components/ui/Pagination';
import { Modal } from '../../components/ui/Modal';

const BookingsPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const tablePageStyles = getTablePageStyles(theme);
  
  // Состояние для поиска и пагинации
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [statusFilter, setStatusFilter] = useState<string>('');
  
  // Состояние для диалогов
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  
  // Состояние для меню создания бронирования
  const [createMenuAnchor, setCreateMenuAnchor] = useState<null | HTMLElement>(null);
  const createMenuOpen = Boolean(createMenuAnchor);

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
  const bookings = bookingsData?.data || [];
  const totalItems = bookingsData?.pagination?.total_count || 0;
  const totalPages = bookingsData?.pagination?.total_pages || 0;

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
          status_id: booking.status_id === 1 ? 2 : 1
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

  const handleCreateMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setCreateMenuAnchor(event.currentTarget);
  };

  const handleCreateMenuClose = () => {
    setCreateMenuAnchor(null);
  };

  const handleCreateBooking = (withAvailability: boolean) => {
    const path = withAvailability ? '/bookings/new-with-availability' : '/bookings/new';
    navigate(path);
    handleCreateMenuClose();
  };

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
        <Alert severity="error" sx={tablePageStyles.errorAlert}>
          Ошибка при загрузке бронирований: {error.toString()}
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
            endIcon={<ArrowDropDownIcon />}
            onClick={handleCreateMenuOpen}
          >
            Новое бронирование
          </Button>
          <Menu
            anchorEl={createMenuAnchor}
            open={createMenuOpen}
            onClose={handleCreateMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem onClick={() => handleCreateBooking(false)}>
              Простая форма
            </MenuItem>
            <MenuItem onClick={() => handleCreateBooking(true)}>
              С системой доступности
            </MenuItem>
          </Menu>
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

      {/* Таблица бронирований */}
      <TableContainer sx={tablePageStyles.tableContainer}>
        <Table>
          <TableHead sx={tablePageStyles.tableHeader}>
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
              <TableRow key={booking.id} sx={tablePageStyles.tableRow}>
                <TableCell>
                  <Box sx={tablePageStyles.avatarContainer}>
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
                  {new Date(booking.booking_date).toLocaleDateString()} {new Date(booking.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </TableCell>

                <TableCell>
                  <Chip
                    label={getStatusLabel(booking.status_id)}
                    color={getStatusColor(booking.status_id)}
                    size="small"
                  />
                </TableCell>

                <TableCell align="right">
                  <Box sx={tablePageStyles.actionsContainer}>
                    <Tooltip title="Редактировать">
                      <IconButton
                        onClick={() => navigate(`/bookings/${booking.id}/edit`)}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={booking.status_id === 2 ? 'Отметить как ожидающее' : 'Отметить как завершенное'}>
                      <IconButton
                        onClick={() => handleToggleStatus(booking)}
                        size="small"
                        color={booking.status_id === 2 ? 'warning' : 'success'}
                      >
                        {booking.status_id === 2 ? <CloseIcon /> : <CheckIcon />}
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