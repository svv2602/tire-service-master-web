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
  Paper,
  Grid,
  Chip,
  SelectChangeEvent,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BookingCalendar } from '../../components/calendar/BookingCalendar';
import { 
  useGetBookingsQuery, 
  useUpdateBookingStatusMutation, 
  useCancelBookingMutation 
} from '../../api/bookings.api';
import { 
  useGetServicePointsQuery 
} from '../../api/servicePoints.api';
import { 
  useGetServiceCategoriesQuery 
} from '../../api/services.api';
import { Booking, ServicePoint, ServiceCategory } from '../../types/models';
import { format } from 'date-fns';
import {
  FilterList as FilterIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';

const BookingCalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  // Filter state
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(),
    end: new Date(),
  });
  
  // Filter state
  const [filters, setFilters] = useState<{
    servicePointId?: number;
    categoryId?: number;
  }>({});

  // API queries for filters
  const { data: servicePointsResponse } = useGetServicePointsQuery({
    per_page: 100, // Load all service points
  });
  
  const { data: categoriesResponse } = useGetServiceCategoriesQuery({
    per_page: 100, // Load all categories
  });

  // API query for bookings with filters
  const { 
    data: bookingsResponse, 
    isLoading, 
    error,
    refetch
  } = useGetBookingsQuery({
    from_date: format(dateRange.start, 'yyyy-MM-dd'),
    to_date: format(dateRange.end, 'yyyy-MM-dd'),
    service_point_id: filters.servicePointId,
    service_category_id: filters.categoryId,
    per_page: 1000, // Load many records for calendar
  });

  const [updateBookingStatus] = useUpdateBookingStatusMutation();
  const [cancelBooking] = useCancelBookingMutation();

  // UI state
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
  const servicePoints = servicePointsResponse?.data || [];
  const categories = categoriesResponse?.data || [];

  // Filter handlers
  const handleServicePointChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    setFilters(prev => ({
      ...prev,
      servicePointId: value ? Number(value) : undefined
    }));
  };

  const handleCategoryChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    setFilters(prev => ({
      ...prev,
      categoryId: value ? Number(value) : undefined
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  // Count active filters
  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  // Calendar event handlers
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
        message: t('admin.bookingCalendar.messages.bulkActionSuccess', { 
          action: getActionName(action), 
          count: selectedBookings.length 
        }),
        severity: 'success',
      });

      refetch();
    } catch (error) {
      setSnackbar({
        open: true,
        message: t('admin.bookingCalendar.messages.bulkActionError', { error: String(error) }),
        severity: 'error',
      });
    }

    setBulkActionDialog({ open: false, bookings: [], action: '' });
  };

  const getActionName = (action: string) => {
    switch (action) {
      case 'confirm': return t('admin.bookingCalendar.actions.confirm');
      case 'cancel': return t('admin.bookingCalendar.actions.cancel');
      case 'reschedule': return t('admin.bookingCalendar.actions.reschedule');
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
          {t('admin.bookingCalendar.title')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('admin.bookingCalendar.subtitle')}
        </Typography>
      </Box>

      {/* Filter panel */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FilterIcon sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {t('admin.bookingCalendar.filters.title')}
          </Typography>
          {activeFiltersCount > 0 && (
            <Chip 
              label={t('admin.bookingCalendar.filters.activeCount', { count: activeFiltersCount })} 
              color="primary" 
              size="small" 
              sx={{ mr: 1 }}
            />
          )}
          <Button
            startIcon={<ClearIcon />}
            onClick={clearFilters}
            disabled={activeFiltersCount === 0}
            size="small"
          >
            {t('admin.bookingCalendar.filters.clear')}
          </Button>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>{t('admin.bookingCalendar.filters.servicePoint')}</InputLabel>
              <Select
                value={filters.servicePointId?.toString() || ''}
                onChange={handleServicePointChange}
                label={t('admin.bookingCalendar.filters.servicePoint')}
              >
                <MenuItem value="">
                  <em>{t('admin.bookingCalendar.filters.allServicePoints')}</em>
                </MenuItem>
                {servicePoints.map((point: ServicePoint) => (
                  <MenuItem key={point.id} value={point.id.toString()}>
                    {point.name} - {point.address}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>{t('admin.bookingCalendar.filters.category')}</InputLabel>
              <Select
                value={filters.categoryId?.toString() || ''}
                onChange={handleCategoryChange}
                label={t('admin.bookingCalendar.filters.category')}
              >
                <MenuItem value="">
                  <em>{t('admin.bookingCalendar.filters.allCategories')}</em>
                </MenuItem>
                {categories.map((category: ServiceCategory) => (
                  <MenuItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Active filter indicators */}
        {activeFiltersCount > 0 && (
          <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {filters.servicePointId && (
              <Chip
                label={t('admin.bookingCalendar.filters.pointLabel', { 
                  name: servicePoints.find(p => p.id === filters.servicePointId)?.name || t('common.unknown')
                })}
                onDelete={() => setFilters(prev => ({ ...prev, servicePointId: undefined }))}
                color="primary"
                variant="outlined"
                size="small"
              />
            )}
            {filters.categoryId && (
              <Chip
                label={t('admin.bookingCalendar.filters.categoryLabel', { 
                  name: categories.find(c => c.id === filters.categoryId)?.name || t('common.unknown')
                })}
                onDelete={() => setFilters(prev => ({ ...prev, categoryId: undefined }))}
                color="primary"
                variant="outlined"
                size="small"
              />
            )}
          </Box>
        )}
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {t('admin.bookingCalendar.dataLoadError')}: {error.toString()}
        </Alert>
      )}

      <BookingCalendar
        bookings={bookings as any}
        loading={isLoading}
        onBookingSelect={handleBookingSelect}
        onDateRangeChange={handleDateRangeChange}
        onBulkAction={handleBulkAction}
        showBulkActions={true}
        totalBookings={bookingsResponse?.pagination?.total_count}
        appliedFilters={{
          servicePoint: filters.servicePointId ? 
            servicePoints.find(p => p.id === filters.servicePointId)?.name : undefined,
          category: filters.categoryId ? 
            categories.find(c => c.id === filters.categoryId)?.name : undefined,
        }}
      />

      {/* Bulk actions dialog */}
      <Dialog
        open={bulkActionDialog.open}
        onClose={() => setBulkActionDialog({ open: false, bookings: [], action: '' })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {t('admin.bookingCalendar.dialog.title')}
        </DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            {t('admin.bookingCalendar.dialog.confirmMessage', {
              action: getActionName(bulkActionDialog.action),
              count: bulkActionDialog.bookings.length
            })}
          </Typography>
          
          {bulkActionDialog.action === 'reschedule' && (
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label={t('admin.bookingCalendar.dialog.newDate')}
                type="date"
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label={t('admin.bookingCalendar.dialog.newTime')}
                type="time"
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          )}

          {bulkActionDialog.action === 'cancel' && (
            <Box sx={{ mt: 2 }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>{t('admin.bookingCalendar.dialog.cancelReason')}</InputLabel>
                <Select label={t('admin.bookingCalendar.dialog.cancelReason')}>
                  <MenuItem value="client_request">{t('admin.bookingCalendar.dialog.cancelReasons.clientRequest')}</MenuItem>
                  <MenuItem value="service_unavailable">{t('admin.bookingCalendar.dialog.cancelReasons.serviceUnavailable')}</MenuItem>
                  <MenuItem value="technical_issues">{t('admin.bookingCalendar.dialog.cancelReasons.technicalIssues')}</MenuItem>
                  <MenuItem value="other">{t('admin.bookingCalendar.dialog.cancelReasons.other')}</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label={t('admin.bookingCalendar.dialog.comment')}
                multiline
                rows={3}
                placeholder={t('admin.bookingCalendar.dialog.commentPlaceholder')}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setBulkActionDialog({ open: false, bookings: [], action: '' })}
          >
            {t('common.cancel')}
          </Button>
          <Button 
            onClick={executeBulkAction}
            variant="contained"
            color={bulkActionDialog.action === 'cancel' ? 'error' : 'primary'}
          >
            {t('admin.bookingCalendar.dialog.execute')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notifications */}
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