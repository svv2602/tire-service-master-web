import React from 'react';
import { Paper, Grid, TextField, Box, Button } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { BookingStatusEnum } from '../../types/booking';
import { useTranslation } from 'react-i18next';

interface BookingFiltersProps {
  filters: {
    status?: BookingStatusEnum;
    dateFrom?: string;
    dateTo?: string;
  };
  onFilterChange: (filters: any) => void;
}

const BookingFilters: React.FC<BookingFiltersProps> = ({ filters, onFilterChange }) => {
  const { t } = useTranslation();

  // Обработчик изменения даты "с"
  const handleDateFromChange = (date: Date | null) => {
    if (date) {
      onFilterChange({ dateFrom: date.toISOString().split('T')[0] });
    } else {
      onFilterChange({ dateFrom: undefined });
    }
  };

  // Обработчик изменения даты "по"
  const handleDateToChange = (date: Date | null) => {
    if (date) {
      onFilterChange({ dateTo: date.toISOString().split('T')[0] });
    } else {
      onFilterChange({ dateTo: undefined });
    }
  };

  // Сброс всех фильтров
  const handleResetFilters = () => {
    onFilterChange({
      dateFrom: undefined,
      dateTo: undefined,
    });
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={5} md={4}>
          <DatePicker
            label={t('Дата с')}
            value={filters.dateFrom ? new Date(filters.dateFrom) : null}
            onChange={handleDateFromChange}
            slotProps={{
              textField: {
                fullWidth: true,
                size: 'small',
                variant: 'outlined',
              },
            }}
          />
        </Grid>
        
        <Grid item xs={12} sm={5} md={4}>
          <DatePicker
            label={t('Дата по')}
            value={filters.dateTo ? new Date(filters.dateTo) : null}
            onChange={handleDateToChange}
            slotProps={{
              textField: {
                fullWidth: true,
                size: 'small',
                variant: 'outlined',
              },
            }}
          />
        </Grid>
        
        <Grid item xs={12} sm={2} md={4}>
          <Box display="flex" justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
            <Button 
              variant="outlined" 
              onClick={handleResetFilters}
              size="medium"
            >
              {t('Сбросить')}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default BookingFilters; 