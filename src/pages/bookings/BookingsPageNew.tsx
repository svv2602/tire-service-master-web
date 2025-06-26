import React, { useState, useMemo, useCallback } from 'react';
import { useTheme, Avatar, Alert } from '@mui/material';
import { Box, Typography, CircularProgress } from '../../components/ui';
import {
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

// Импорт PageTable компонента
import { PageTable } from '../../components/common/PageTable';
import type { 
  PageHeaderConfig,
  SearchConfig,
  Column,
  ActionConfig,
  ConfirmationDialogConfig
} from '../../components/common/PageTable';

const BookingsPageNew: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const tablePageStyles = getTablePageStyles(theme);
  
  // Состояние для поиска и пагинации
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const rowsPerPage = 25;
  
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

  // Вспомогательные функции
  const getStatusLabel = useCallback((statusId: number): string => {
    switch (statusId) {
      case 1: return 'В ожидании';
      case 2: return 'Завершено';
      case 3: return 'Отменено';
      default: return `Статус ${statusId}`;
    }
  }, []);

  const getStatusColor = useCallback((statusId: number): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (statusId) {
      case 1: return 'warning';
      case 2: return 'success';
      case 3: return 'error';
      default: return 'default';
    }
  }, []);

  // Обработчики действий
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

  const handleDeleteBooking = useCallback(async (booking: Booking) => {
    try {
      await deleteBooking(booking.id.toString()).unwrap();
      // Принудительно обновляем данные после удаления
      await refetchBookings();
    } catch (error) {
      console.error('Ошибка при удалении бронирования:', error);
    }
  }, [deleteBooking, refetchBookings]);

  const handleCreateBooking = useCallback(() => {
          navigate('/client/booking');
  }, [navigate]);

  // Конфигурация заголовка
  const headerConfig: PageHeaderConfig = useMemo(() => ({
    title: 'Бронирования (PageTable)',
    actions: [
      {
        label: 'Новое бронирование',
        icon: <AddIcon />,
        variant: 'contained',
        onClick: handleCreateBooking,
      },
    ],
  }), [handleCreateBooking]);

  // Конфигурация поиска
  const searchConfig: SearchConfig = useMemo(() => ({
    placeholder: 'Поиск по имени, фамилии, email или номеру телефона клиента',
    value: search,
    onChange: setSearch,
    onClear: () => setSearch(''),
  }), [search]);

  // Определение колонок
  const columns: Column<Booking>[] = useMemo(() => [
    {
      id: 'client',
      label: 'Клиент',
      minWidth: 200,
      wrap: true,
      format: (value: any, booking: Booking) => (
        <Box sx={tablePageStyles.avatarContainer}>
          <Avatar>
            {booking.client?.user?.first_name?.charAt(0) || booking.client?.user?.last_name?.charAt(0) || '?'}
          </Avatar>
          <Typography>
            {booking.client?.user ? `${booking.client.user.first_name} ${booking.client.user.last_name}` : 'Неизвестный клиент'}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'service_point',
      label: 'Точка обслуживания',
      minWidth: 180,
      wrap: true,
      hideOnMobile: true,
      format: (value: any, booking: Booking) => (
        <Typography>{booking.service_point?.name}</Typography>
      ),
    },
    {
      id: 'booking_date',
      label: 'Дата и время',
      minWidth: 160,
      hideOnMobile: true,
      format: (value: any, booking: Booking) => (
        <Typography>
          {new Date(booking.booking_date).toLocaleDateString()} {new Date(booking.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Typography>
      ),
    },
    {
      id: 'status',
      label: 'Статус',
      minWidth: 120,
      align: 'center',
      format: (value: any, booking: Booking) => ({
        type: 'chip',
        label: getStatusLabel(booking.status_id),
        color: getStatusColor(booking.status_id),
        size: 'small',
      }),
    },
  ], [tablePageStyles, getStatusLabel, getStatusColor]);

  // Конфигурация действий
  const actionsConfig: ActionConfig<Booking>[] = useMemo(() => [
    {
      label: 'Редактировать',
      icon: <EditIcon />,
      onClick: (booking: Booking) => navigate(`/admin/bookings/${booking.id}/edit`),
      tooltip: 'Редактировать',
    },
    {
      label: (booking: Booking) => booking.status_id === 2 ? 'Отметить как ожидающее' : 'Отметить как завершенное',
      icon: (booking: Booking) => booking.status_id === 2 ? <CloseIcon /> : <CheckIcon />,
      onClick: handleToggleStatus,
      tooltip: (booking: Booking) => booking.status_id === 2 ? 'Отметить как ожидающее' : 'Отметить как завершенное',
      color: (booking: Booking) => booking.status_id === 2 ? 'warning' : 'success',
    },
    {
      label: 'Удалить',
      icon: <DeleteIcon />,
      onClick: handleDeleteBooking,
      tooltip: 'Удалить',
      color: 'error',
      requireConfirmation: true,
      confirmationConfig: {
        title: 'Подтверждение удаления',
        message: 'Вы действительно хотите удалить бронирование? Это действие нельзя будет отменить.',
        confirmLabel: 'Удалить',
        cancelLabel: 'Отмена',
      } as ConfirmationDialogConfig,
    },
  ], [navigate, handleToggleStatus, handleDeleteBooking]);

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
      <PageTable<Booking>
        header={headerConfig}
        search={searchConfig}
        columns={columns}
        rows={bookings}
        actions={actionsConfig}
        loading={isLoading}
        pagination={{
          page,
          rowsPerPage,
          totalItems,
          onPageChange: setPage,
        }}
      />
    </Box>
  );
};

export default BookingsPageNew; 