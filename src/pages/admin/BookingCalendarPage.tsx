import React, { useState, useCallback } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Alert, 
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { BookingCalendar } from '../../components/calendar/BookingCalendar';
import { useGetBookingsQuery, useUpdateBookingStatusMutation, useCancelBookingMutation } from '../../api/bookings.api';
import { Booking } from '../../types/models';
import { format } from 'date-fns';

const BookingCalendarPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Состояние фильтров
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(),
    end: new Date(),
  });

  // API запросы
  const { 
    data: bookingsResponse, 
    isLoading, 
    error,
    refetch
  } = useGetBookingsQuery({
    from_date: format(dateRange.start, 'yyyy-MM-dd'),
    to_date: format(dateRange.end, 'yyyy-MM-dd'),
    per_page: 1000, // Загружаем много записей для календаря
  });

  const [updateBookingStatus] = useUpdateBookingStatusMutation();
  const [cancelBooking] = useCancelBookingMutation();

  // Состояние UI
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [bulkActionDialog, setBulkActionDialog] = useState<{
    open: boolean;
    bookings: Booking[];
    action: string;
  }>({ open: false, bookings: [], action: '' });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({ open: false, message: '', severity: 'info' });

  const bookings = bookingsResponse?.data || [];

  // Обработчики событий
  const handleDateRangeChange = useCallback((start: Date, end: Date) => {
    setDateRange({ start, end });
  }, []);

  const handleBookingSelect = useCallback((booking: Booking) => {
    navigate(`/admin/bookings/${booking.id}`);
  }, [navigate]);

  const handleBulkAction = useCallback((selectedBookings: Booking[], action: string) => {
    setBulkActionDialog({
      open: true,
      bookings: selectedBookings,
      action,
    });
  }, []);

  const executeBulkAction = async () => {
    const { bookings: selectedBookings, action } = bulkActionDialog;
    
    try {
      const promises = selectedBookings.map(booking => {
        switch (action) {
          case 'confirm':
            return updateBookingStatus({ id: booking.id.toString(), status_id: 2 }); // confirmed
          case 'cancel':
            return cancelBooking(booking.id.toString());
          default:
            return Promise.resolve();
        }
      });

      await Promise.all(promises);
      
      setSnackbar({
        open: true,
        message: `Действие "${getActionName(action)}" выполнено для ${selectedBookings.length} записей`,
        severity: 'success',
      });

      refetch();
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Ошибка при выполнении массового действия: ${error}`,
        severity: 'error',
      });
    }

    setBulkActionDialog({ open: false, bookings: [], action: '' });
  };

  const getActionName = (action: string) => {
    switch (action) {
      case 'confirm': return 'Подтверждение';
      case 'cancel': return 'Отмена';
      case 'reschedule': return 'Перенос';
      default: return action;
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
          Календарь бронирований
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Управление расписанием и массовые операции с бронированиями
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Ошибка при загрузке данных: {error.toString()}
        </Alert>
      )}

      <BookingCalendar
        bookings={bookings as any}
        loading={isLoading}
        onBookingSelect={handleBookingSelect}
        onDateRangeChange={handleDateRangeChange}
        onBulkAction={handleBulkAction}
        showBulkActions={true}
      />

      {/* Диалог массовых действий */}
      <Dialog
        open={bulkActionDialog.open}
        onClose={() => setBulkActionDialog({ open: false, bookings: [], action: '' })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Подтверждение массового действия
        </DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Вы действительно хотите выполнить действие "{getActionName(bulkActionDialog.action)}" 
            для {bulkActionDialog.bookings.length} записей?
          </Typography>
          
          {bulkActionDialog.action === 'reschedule' && (
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Новая дата"
                type="date"
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Новое время"
                type="time"
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          )}

          {bulkActionDialog.action === 'cancel' && (
            <Box sx={{ mt: 2 }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Причина отмены</InputLabel>
                <Select label="Причина отмены">
                  <MenuItem value="client_request">По просьбе клиента</MenuItem>
                  <MenuItem value="service_unavailable">Услуга недоступна</MenuItem>
                  <MenuItem value="technical_issues">Технические проблемы</MenuItem>
                  <MenuItem value="other">Другая причина</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Комментарий"
                multiline
                rows={3}
                placeholder="Дополнительная информация..."
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setBulkActionDialog({ open: false, bookings: [], action: '' })}
          >
            Отмена
          </Button>
          <Button 
            onClick={executeBulkAction}
            variant="contained"
            color={bulkActionDialog.action === 'cancel' ? 'error' : 'primary'}
          >
            Выполнить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Уведомления */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default BookingCalendarPage;