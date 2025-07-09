import React, { useState, useEffect, useCallback } from 'react';
import { 
  Typography, 
  Box, 
  CircularProgress,
  Alert
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { fetchWithAuth } from '../../api/apiUtils';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Event as EventIcon,
  Add as AddIcon,
  CalendarToday as CalendarIcon,
  EventAvailable as EventAvailableIcon,
  EventBusy as EventBusyIcon,
  EventNote as EventNoteIcon,
} from '@mui/icons-material';
import { User } from '../../types/user';
import { GridContainer, GridItem } from '../../components/styled/CommonComponents';

// Импорты UI компонентов
import { Button } from '../../components/ui/Button';
import { Chip } from '../../components/ui/Chip';
import { Card } from '../../components/ui/Card';

// Импорт стилей
import { SIZES } from '../../styles/theme';
import { 
  getButtonStyles, 
  getCardStyles
} from '../../styles/components';

interface Booking {
  id: number;
  client_id: number;
  service_point_id: number;
  service_point_name: string;
  car_id: number;
  car_name: string;
  services: Array<{
    id: number;
    name: string;
    price: number;
  }>;
  status: string;
  start_time: string;
  end_time: string;
  total_price: number;
  comment?: string;
}

const getStatusChip = (status: string, t: any) => {
  switch (status) {
    case 'pending':
      return <Chip icon={<EventNoteIcon />} label={t('forms.clientPages.myBookingsList.status.pending')} color="warning" />;
    case 'confirmed':
      return <Chip icon={<EventAvailableIcon />} label={t('forms.clientPages.myBookingsList.status.confirmed')} color="success" />;
    case 'completed':
      return <Chip icon={<EventAvailableIcon />} label={t('forms.clientPages.myBookingsList.status.completed')} color="success" />;
    case 'cancelled':
      return <Chip icon={<EventBusyIcon />} label={t('forms.clientPages.myBookingsList.status.cancelled')} color="error" />;
    default:
      return <Chip label={status} />;
  }
};

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return format(date, 'dd MMMM yyyy, HH:mm', { locale: ru });
  } catch (error) {
    return dateString;
  }
};

const MyBookingsList: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useSelector((state: RootState) => state.auth);
  const { t } = useTranslation();

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const clientId = user?.id;
      
      if (!clientId) {
        throw new Error(t('forms.clientPages.myBookingsList.actions.clientIdError'));
      }
      
      const response = await fetchWithAuth(`/api/v1/clients/${clientId}/bookings`);
      const data = await response.json();
      setBookings(data.bookings || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError(t('forms.clientPages.myBookingsList.loadError'));
    } finally {
      setLoading(false);
    }
  }, [user?.id, t]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleCancelBooking = async (bookingId: number) => {
    if (!window.confirm(t('forms.clientPages.myBookingsList.actions.confirmCancel'))) {
      return;
    }
    
    try {
      const response = await fetchWithAuth(
        `/api/v1/bookings/${bookingId}/cancel`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t('forms.clientPages.myBookingsList.actions.cancelError'));
      }
      
      // Обновляем список записей
      fetchBookings();
    } catch (err) {
      console.error('Ошибка отмены записи:', err);
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        my: SIZES.spacing.lg,
        p: SIZES.spacing.lg
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ my: SIZES.spacing.lg, p: SIZES.spacing.lg }}>
        <Alert severity="error">
          ❌ {error}
        </Alert>
        <Button 
          variant="outlined" 
          onClick={fetchBookings} 
          sx={{ mt: 2 }}
        >
          {t('forms.clientPages.myBookingsList.retry')}
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ my: SIZES.spacing.lg, p: SIZES.spacing.lg }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: SIZES.spacing.lg 
      }}>
        <Typography variant="h5" component="h1" gutterBottom sx={{
          fontSize: SIZES.fontSize.xl,
          fontWeight: 600
        }}>
          {t('forms.clientPages.myBookingsList.title')}
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => window.location.href = '/client/booking'}
        >
          {t('forms.clientPages.myBookingsList.newBooking')}
        </Button>
      </Box>
      
      {bookings.length === 0 ? (
        <Box sx={{ 
          p: SIZES.spacing.lg, 
          textAlign: 'center',
          borderRadius: SIZES.borderRadius.md,
          border: `1px solid rgba(0, 0, 0, 0.12)`
        }}>
          <CalendarIcon sx={{ fontSize: 60, color: 'text.secondary', mb: SIZES.spacing.md }} />
          <Typography variant="h6" gutterBottom sx={{
            fontSize: SIZES.fontSize.lg,
            fontWeight: 600
          }}>
            {t('forms.clientPages.myBookingsList.noBookings')}
          </Typography>
          <Typography color="textSecondary" paragraph sx={{
            fontSize: SIZES.fontSize.md,
            mb: SIZES.spacing.md
          }}>
            {t('forms.clientPages.myBookingsList.noBookingsDescription')}
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => window.location.href = '/client/booking'}
            sx={{ mt: SIZES.spacing.md }}
          >
            {t('forms.clientPages.myBookingsList.selectServiceCenter')}
          </Button>
        </Box>
      ) : (
        <GridContainer spacing={3}>
          {bookings.map((booking) => (
            <GridItem xs={12} sm={6} key={booking.id}>
              <Card sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                p: SIZES.spacing.lg
              }}>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start', 
                    mb: SIZES.spacing.md 
                  }}>
                    <Typography variant="h6" component="div" gutterBottom sx={{
                      fontSize: SIZES.fontSize.lg,
                      fontWeight: 600
                    }}>
                      {booking.service_point_name}
                    </Typography>
                    {getStatusChip(booking.status, t)}
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom sx={{
                    fontSize: SIZES.fontSize.sm,
                    mb: SIZES.spacing.sm
                  }}>
                    <strong>{t('forms.clientPages.myBookingsList.fields.car')}:</strong> {booking.car_name}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom sx={{
                    fontSize: SIZES.fontSize.sm,
                    mb: SIZES.spacing.sm
                  }}>
                    <strong>{t('forms.clientPages.myBookingsList.fields.dateTime')}:</strong> {formatDate(booking.start_time)}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom sx={{
                    fontSize: SIZES.fontSize.sm,
                    mb: SIZES.spacing.sm
                  }}>
                    <strong>{t('forms.clientPages.myBookingsList.fields.services')}:</strong> {booking.services.map(service => service.name).join(', ')}
                  </Typography>
                  
                  <Typography variant="body1" fontWeight="bold" sx={{
                    mt: SIZES.spacing.md,
                    fontSize: SIZES.fontSize.md
                  }}>
                    {t('forms.clientPages.myBookingsList.fields.cost')}: {booking.total_price} ₽
                  </Typography>
                  
                  {booking.comment && (
                    <Box sx={{ mt: SIZES.spacing.md }}>
                      <Typography variant="body2" color="text.secondary" sx={{
                        fontSize: SIZES.fontSize.sm
                      }}>
                        <strong>{t('forms.clientPages.myBookingsList.fields.comment')}:</strong> {booking.comment}
                      </Typography>
                    </Box>
                  )}
                </Box>
                
                <Box sx={{ 
                  display: 'flex',
                  gap: SIZES.spacing.sm,
                  mt: SIZES.spacing.md,
                  pt: SIZES.spacing.md,
                  borderTop: `1px solid rgba(0, 0, 0, 0.12)`
                }}>
                  <Button 
                    onClick={() => window.location.href = `/bookings/${booking.id}`}
                    size="small"
                  >
                    {t('forms.clientPages.myBookingsList.actions.details')}
                  </Button>
                  
                  {(booking.status === 'pending' || booking.status === 'confirmed') && (
                    <Button 
                      color="error"
                      size="small"
                      onClick={() => handleCancelBooking(booking.id)}
                    >
                      {t('forms.clientPages.myBookingsList.actions.cancel')}
                    </Button>
                  )}
                </Box>
              </Card>
            </GridItem>
          ))}
        </GridContainer>
      )}
    </Box>
  );
};

export default MyBookingsList; 