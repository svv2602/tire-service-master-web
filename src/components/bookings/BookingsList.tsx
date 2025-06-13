import React from 'react';
import { Grid, Typography, Box } from '@mui/material';
import { Booking } from '../../types/booking';
import BookingCard from './BookingCard';
import { useTranslation } from 'react-i18next';

interface BookingsListProps {
  bookings: Booking[];
}

const BookingsList: React.FC<BookingsListProps> = ({ bookings }) => {
  const { t } = useTranslation();

  if (!bookings || bookings.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="body1" color="textSecondary">
          {t('Записи не найдены')}
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {bookings.map((booking) => (
        <Grid item xs={12} sm={6} md={4} key={booking.id}>
          <BookingCard booking={booking} />
        </Grid>
      ))}
    </Grid>
  );
};

export default BookingsList; 