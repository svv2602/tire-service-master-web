import React, { useState, useMemo, useCallback } from 'react';
import {
  useTheme, 
  InputAdornment,
  IconButton,
  Avatar,
  Alert
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
} from '@mui/icons-material';
import { getTablePageStyles } from '../../styles';
import { useNavigate } from 'react-router-dom';
import { 
  useGetBookingsQuery,
  useDeleteBookingMutation,
  useUpdateBookingMutation,
} from '../../api/bookings.api';
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
  
  // Состояние для поиска и пагинации
  const [search, setSearch] = useState('');
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
    page: page + 1,
    per_page: rowsPerPage,
  } as BookingFilter);

  const [deleteBooking, { isLoading: deleteLoading }] = useDeleteBookingMutation();
  const [updateBooking] = useUpdateBookingMutation();

  const isLoading = bookingsLoading || deleteLoading;
  const error = bookingsError;
  const bookings = bookingsData?.data || [];
  const totalItems = bookingsData?.pagination?.total_count || 0;

  // Обработчики событий
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
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
      label: 'Дата и время',
      minWidth: 160,
      format: (value: any, row: any) => {
        const booking = row as Booking;
        return (
          <Typography>
            {new Date(booking.booking_date).toLocaleDateString()} {new Date(booking.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Typography>
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
                onClick={() => navigate(`/bookings/${booking.id}/edit`)}
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