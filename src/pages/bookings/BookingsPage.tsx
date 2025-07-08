import React, { useState, useMemo, useCallback } from 'react';
import { useTheme, Avatar, Alert, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Button, Snackbar } from '@mui/material';
import { format } from 'date-fns';
import { Box, Typography, CircularProgress, Chip } from '../../components/ui';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Phone as PhoneIcon,
  LocationCity as LocationCityIcon,
  Schedule as ScheduleIcon,
  Sort as SortIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
} from '@mui/icons-material';
import { getTablePageStyles } from '../../styles';
import { useNavigate } from 'react-router-dom';
import { 
  useGetBookingsQuery,
  useDeleteBookingMutation,
  useUpdateBookingMutation,
  useUpdateBookingStatusMutation,
  useGetBookingStatusesQuery,
} from '../../api/bookings.api';
import { useGetCitiesWithServicePointsQuery } from '../../api/cities.api';
import { useGetServicePointsQuery } from '../../api/servicePoints.api';
import { useGetServiceCategoriesQuery } from '../../api/serviceCategories.api';
import { Booking } from '../../types/models';
import { BookingFilter } from '../../types/booking';

// Импорт PageTable компонента
import { PageTable } from '../../components/common/PageTable';
import type { 
  PageHeaderConfig,
  SearchConfig,
  Column,
  FilterConfig,
} from '../../components/common/PageTable';

// Импорт ActionsMenu компонента
import { ActionsMenu, ActionItem } from '../../components/ui/ActionsMenu/ActionsMenu';
import { useTranslation } from 'react-i18next';
import { getStatusDisplayName, getStatusChipColor } from '../../utils/bookingStatus';


const BookingsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const tablePageStyles = getTablePageStyles(theme);
  
  // Состояния для интерактивного статуса
  const [statusMenuAnchor, setStatusMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    booking: Booking | null;
    newStatus: string;
  }>({
    open: false,
    booking: null,
    newStatus: '',
  });
  
  // Состояние для поиска, фильтров, сортировки и пагинации
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const rowsPerPage = 25;
  
  // Состояние сортировки
  const [sortBy, setSortBy] = useState('booking_datetime');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Состояние фильтров
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [cityFilter, setCityFilter] = useState<number | ''>('');
  const [servicePointFilter, setServicePointFilter] = useState<number | ''>('');
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState<number | ''>('');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');
  
  // Состояния для уведомлений
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Формируем параметры запроса
  const queryParams = useMemo(() => {
    const params: BookingFilter = {
      page: page + 1,
      per_page: rowsPerPage,
      sort_by: sortBy,
      sort_order: sortOrder,
    };
    
    if (search) params.query = search;
    if (statusFilter) params.status = statusFilter;
    if (cityFilter) params.city_id = Number(cityFilter);
    if (servicePointFilter) params.service_point_id = Number(servicePointFilter);
    if (serviceCategoryFilter) params.service_category_id = Number(serviceCategoryFilter);
    if (dateFromFilter) params.from_date = dateFromFilter;
    if (dateToFilter) params.to_date = dateToFilter;
    
    return params;
  }, [search, page, sortBy, sortOrder, statusFilter, cityFilter, servicePointFilter, serviceCategoryFilter, dateFromFilter, dateToFilter]);
  
  // RTK Query хуки
  const { 
    data: bookingsData, 
    isLoading: bookingsLoading, 
    error: bookingsError,
    refetch: refetchBookings
  } = useGetBookingsQuery(queryParams);

  const { data: citiesData, isLoading: citiesLoading } = useGetCitiesWithServicePointsQuery();
  const { data: servicePointsData, isLoading: servicePointsLoading } = useGetServicePointsQuery({});
  const { data: serviceCategoriesData, isLoading: serviceCategoriesLoading } = useGetServiceCategoriesQuery({});
  const { data: bookingStatusesData, isLoading: bookingStatusesLoading } = useGetBookingStatusesQuery();

  const [deleteBooking, { isLoading: deleteLoading }] = useDeleteBookingMutation();
  const [updateBooking] = useUpdateBookingMutation();
  const [updateBookingStatus] = useUpdateBookingStatusMutation();

  const isLoading = bookingsLoading || deleteLoading;
  const error = bookingsError;
  const bookings = bookingsData?.data || [];
  const totalItems = bookingsData?.pagination?.total_count || 0;
  const cities = citiesData?.data || [];
  const servicePoints = servicePointsData?.data || [];
  const serviceCategories = serviceCategoriesData?.data || [];
  const bookingStatuses = bookingStatusesData || [];

  // Функция форматирования времени
  const formatTime = useCallback((timeString: string) => {
    if (!timeString) return '-';
    try {
      // Если это полная ISO дата
      if (timeString.includes('T')) {
        return format(new Date(timeString), 'HH:mm');
      }
      // Если это просто время
      return timeString;
    } catch (error) {
      return timeString;
    }
  }, []);

  // Функция получения инициалов клиента
  const getClientInitials = useCallback((booking: Booking) => {
    if (booking.service_recipient?.first_name) {
      const firstName = booking.service_recipient.first_name.charAt(0).toUpperCase();
      const lastName = booking.service_recipient.last_name?.charAt(0)?.toUpperCase() || '';
      return firstName + lastName;
    }
    return t('forms.bookings.clientInitials'); // К = Клиент
  }, [t]);

  // Обработчики для интерактивного статуса
  const handleStatusChipClick = useCallback((event: React.MouseEvent<HTMLElement>, booking: Booking) => {
    setStatusMenuAnchor(event.currentTarget);
    setSelectedBooking(booking);
  }, []);

  const handleStatusMenuClose = useCallback(() => {
    setStatusMenuAnchor(null);
    setSelectedBooking(null);
  }, []);

  const handleStatusSelect = useCallback((newStatusKey: string) => {
    if (!selectedBooking) return;
    
    const newStatusLabel = getStatusDisplayName(newStatusKey);
    setConfirmDialog({
      open: true,
      booking: selectedBooking,
      newStatus: newStatusKey,
    });
    handleStatusMenuClose();
  }, [selectedBooking, handleStatusMenuClose]);

  const handleConfirmStatusChange = useCallback(async () => {
    if (!confirmDialog.booking) return;
    
    try {
      await updateBooking({
        id: confirmDialog.booking.id.toString(),
        booking: { 
          status_id: confirmDialog.newStatus
        }
      }).unwrap();
      
      setNotification({
        open: true,
        message: t('forms.bookings.notifications.statusUpdated'),
        severity: 'success'
      });
      
      refetchBookings();
    } catch (error) {
      setNotification({
        open: true,
        message: t('forms.bookings.notifications.statusUpdateError'),
        severity: 'error'
      });
    }
    
    setConfirmDialog({ open: false, booking: null, newStatus: '' });
  }, [confirmDialog, updateBooking, refetchBookings, t]);

  const handleCancelStatusChange = useCallback(() => {
    setConfirmDialog({
      open: false,
      booking: null,
      newStatus: '',
    });
  }, []);

  // Обработчики действий
  const handleStatusChange = useCallback(async (booking: Booking, newStatusKey: string) => {
    try {
      await updateBooking({
        id: booking.id.toString(),
        booking: { 
          status_id: newStatusKey
        }
      }).unwrap();
    } catch (error) {
      console.error(t('forms.bookings.errors.statusChange'), error);
    }
  }, [updateBooking, t]);

  // Устаревший обработчик для совместимости с ActionsMenu
  const handleToggleStatus = useCallback(async (booking: Booking) => {
    try {
      const currentStatus = typeof booking.status === 'string' ? booking.status : 'pending';
      const newStatus = currentStatus === 'pending' ? 'confirmed' : 'pending';
      
      await updateBooking({
        id: booking.id.toString(),
        booking: { 
          status_id: newStatus
        }
      }).unwrap();
    } catch (error) {
      console.error(t('forms.bookings.errors.statusChange'), error);
    }
  }, [updateBooking, t]);

  const handleDeleteBooking = useCallback(async (booking: Booking) => {
    try {
      await deleteBooking(booking.id.toString()).unwrap();
      await refetchBookings();
      setNotification({
        open: true,
        message: t('forms.bookings.notifications.bookingDeleted'),
        severity: 'success'
      });
    } catch (error) {
      setNotification({
        open: true,
        message: t('forms.bookings.notifications.bookingDeleteError'),
        severity: 'error'
      });
    }
  }, [deleteBooking, refetchBookings, t]);

  const handleCreateBooking = useCallback(() => {
    navigate('/client/booking/new-with-availability');
  }, [navigate]);

  // Обработчик сортировки
  const handleSort = useCallback(() => {
    if (sortBy === 'booking_datetime') {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy('booking_datetime');
      setSortOrder('asc');
    }
  }, [sortBy, sortOrder]);

  // Конфигурация заголовка
  const headerConfig: PageHeaderConfig = useMemo(() => ({
    title: t('forms.bookings.title'),
    actions: [
      {
        id: 'sort',
        label: t('forms.bookings.sorting.sortBy', { 
          order: sortOrder === 'asc' ? 
            t('forms.bookings.sorting.ascending') : 
            t('forms.bookings.sorting.descending') 
        }),
        icon: sortOrder === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />,
        onClick: handleSort,
      },
      {
        id: 'create',
        label: t('forms.bookings.createBooking'),
        icon: <AddIcon />,
        variant: 'contained',
        onClick: handleCreateBooking,
      },
    ],
  }), [sortOrder, handleSort, handleCreateBooking, t]);

  // Конфигурация поиска
  const searchConfig: SearchConfig = useMemo(() => ({
    value: search,
    onChange: setSearch,
    placeholder: t('forms.bookings.searchPlaceholder'),
    debounceMs: 300,
  }), [search, t]);

  // Конфигурация фильтров
  const filterConfig: FilterConfig[] = useMemo(() => [
    {
      id: 'status',
      label: t('forms.bookings.columns.status'),
      type: 'select',
      value: statusFilter,
      onChange: (value) => setStatusFilter(value as string),
      options: [
        { value: '', label: t('forms.bookings.filters.allStatuses') },
        ...bookingStatuses.map((status: any) => ({
          value: status.key || status.id?.toString() || '',
          label: status.name
        }))
      ],
      loading: bookingStatusesLoading,
    },
    {
      id: 'city',
      label: t('forms.bookings.columns.city'),
      type: 'select',
      value: cityFilter,
      onChange: (value) => setCityFilter(value as number),
      options: [
        { value: '', label: t('forms.bookings.filters.allCities') },
        ...cities.map(city => ({
          value: city.id,
          label: city.name
        }))
      ],
      loading: citiesLoading,
    },
    {
      id: 'service_point',
      label: t('forms.bookings.filters.servicePoint'),
      type: 'select',
      value: servicePointFilter,
      onChange: (value) => setServicePointFilter(value as number),
      options: [
        { value: '', label: t('forms.bookings.filters.allServicePoints') },
        ...servicePoints.map(sp => ({
          value: sp.id,
          label: sp.name
        }))
      ],
      loading: servicePointsLoading,
    },
    {
      id: 'service_category',
      label: t('forms.bookings.filters.serviceType'),
      type: 'select',
      value: serviceCategoryFilter,
      onChange: (value) => setServiceCategoryFilter(value as number),
      options: [
        { value: '', label: t('forms.bookings.filters.allServiceTypes') },
        ...serviceCategories.map(sc => ({
          value: sc.id,
          label: sc.name
        }))
      ],
      loading: serviceCategoriesLoading,
    },
    {
      id: 'date_from',
      label: t('forms.bookings.filters.dateFrom'),
      type: 'date',
      value: dateFromFilter,
      onChange: (value) => setDateFromFilter(value as string),
    },
    {
      id: 'date_to',
      label: t('forms.bookings.filters.dateTo'),
      type: 'date',
      value: dateToFilter,
      onChange: (value) => setDateToFilter(value as string),
    },
  ], [
    statusFilter, cityFilter, servicePointFilter, serviceCategoryFilter, dateFromFilter, dateToFilter,
    cities, servicePoints, serviceCategories, bookingStatuses,
    citiesLoading, servicePointsLoading, serviceCategoriesLoading, bookingStatusesLoading, t
  ]);

  // Примечание: сортировка управляется автоматически через PageTable

  // Конфигурация действий для ActionsMenu (упрощенная, статус теперь меняется в таблице)
  const bookingActions: ActionItem<Booking>[] = useMemo(() => [
    {
      id: 'edit',
      label: t('forms.bookings.actions.edit'),
      icon: <EditIcon />,
      color: 'primary',
      tooltip: t('forms.bookings.actions.editTooltip'),
      onClick: (booking: Booking) => navigate(`/admin/bookings/${booking.id}/edit`),
    },
    {
      id: 'delete',
      label: t('forms.bookings.actions.delete'),
      icon: <DeleteIcon />,
      color: 'error',
      tooltip: t('forms.bookings.actions.deleteTooltip'),
      onClick: handleDeleteBooking,
      requireConfirmation: true,
      confirmationConfig: {
        title: t('forms.bookings.confirmations.deleteTitle'),
        message: t('forms.bookings.confirmations.deleteMessage'),
        confirmLabel: t('forms.bookings.actions.delete'),
        cancelLabel: t('common.cancel'),
      },
    },
  ], [navigate, handleDeleteBooking, t]);

  // Определение колонок
  const columns: Column<Booking>[] = useMemo(() => [
    {
      id: 'service_recipient',
      label: t('forms.bookings.columns.serviceRecipient'),
      minWidth: 200,
      wrap: true,
      sortable: false,
      format: (value: any, booking: Booking) => (
        <Box sx={tablePageStyles.avatarContainer}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            {getClientInitials(booking)}
          </Avatar>
          <Typography sx={{ wordBreak: 'break-word' }}>
            {booking.service_recipient ? 
              `${booking.service_recipient.first_name} ${booking.service_recipient.last_name}` : 
              t('forms.bookings.dataNotAvailable')
            }
          </Typography>
        </Box>
      ),
    },
    {
      id: 'recipient_phone',
      label: t('forms.bookings.columns.phone'),
      minWidth: 140,
      hideOnMobile: true,
      sortable: false,
      format: (value: any, booking: Booking) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PhoneIcon fontSize="small" color="action" />
          <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
            {booking.service_recipient?.phone || '-'}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'city',
      label: t('forms.bookings.columns.city'),
      minWidth: 120,
      hideOnMobile: true,
      sortable: false,
      format: (value: any, booking: Booking) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocationCityIcon fontSize="small" color="action" />
          <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
            {booking.service_point?.city?.name || '-'}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'service_point',
      label: t('forms.bookings.columns.servicePoint'),
      minWidth: 180,
      hideOnMobile: true,
      sortable: false,
      format: (value: any, booking: Booking) => (
        <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
          {booking.service_point?.name || '-'}
        </Typography>
      ),
    },
    {
      id: 'service_category',
      label: t('forms.bookings.columns.serviceType'),
      minWidth: 150,
      hideOnMobile: true,
      sortable: false,
      format: (value: any, booking: Booking) => (
        <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
          {booking.service_category?.name || '-'}
        </Typography>
      ),
    },
    {
      id: 'booking_datetime',
      label: t('forms.bookings.columns.dateTime'),
      minWidth: 160,
      sortable: true,
      format: (value: any, booking: Booking) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ScheduleIcon fontSize="small" color="action" />
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {booking.booking_date ? format(new Date(booking.booking_date), 'dd.MM.yyyy') : '-'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatTime(booking.start_time)}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'status',
      label: t('forms.bookings.columns.status'),
      minWidth: 120,
      align: 'center',
      sortable: false,
      format: (value: any, booking: Booking) => (
        <Box
          sx={{ 
            cursor: 'pointer',
            '&:hover': {
              opacity: 0.8,
            },
          }}
          onClick={(event: React.MouseEvent<HTMLElement>) => handleStatusChipClick(event, booking)}
        >
          <Chip
            label={getStatusDisplayName(booking.status)}
            color={getStatusChipColor(booking.status)}
            size="small"
            sx={{ 
              minWidth: 100,
            }}
          />
        </Box>
      ),
    },
    {
      id: 'actions',
      label: t('forms.bookings.columns.actions'),
      minWidth: 120,
      align: 'center',
      sortable: false,
      format: (value: any, booking: Booking) => (
        <ActionsMenu<Booking>
          actions={bookingActions}
          item={booking}
          menuThreshold={0}
        />
      ),
    },
  ], [tablePageStyles, formatTime, getClientInitials, handleStatusChipClick, bookingActions, t]);

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
          {t('forms.bookings.loadingError')}: {error.toString()}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={tablePageStyles.pageContainer}>
      {bookingsError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {t('forms.bookings.notifications.loadingFailed')}
        </Alert>
      )}
      
      <PageTable<Booking>
        header={headerConfig}
        search={searchConfig}
        filters={filterConfig}
        columns={columns}
        rows={bookings}
        loading={isLoading}
        pagination={{
          page,
          rowsPerPage,
          totalItems,
          onPageChange: setPage,
        }}
      />
      
      {/* Меню выбора статуса */}
      <Menu
        anchorEl={statusMenuAnchor}
        open={Boolean(statusMenuAnchor)}
        onClose={handleStatusMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        {bookingStatuses.map((status: any) => (
          <MenuItem key={status.key || status.id} onClick={() => handleStatusSelect(status.key || status.id.toString())}>
            {status.name}
          </MenuItem>
        ))}
      </Menu>

      {/* Диалог подтверждения изменения статуса */}
      <Dialog
        open={confirmDialog.open}
        onClose={handleCancelStatusChange}
        aria-labelledby="confirm-status-dialog-title"
        aria-describedby="confirm-status-dialog-description"
      >
        <DialogTitle id="confirm-status-dialog-title">
          {t('forms.bookings.confirmations.statusChangeTitle')}
        </DialogTitle>
        <DialogContent>
          <Typography id="confirm-status-dialog-description">
            {t('forms.bookings.confirmations.statusChangeMessage')}
          </Typography>
          {confirmDialog.booking && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body2">
                <strong>Клиент:</strong> {confirmDialog.booking.service_recipient ? 
                  `${confirmDialog.booking.service_recipient.first_name} ${confirmDialog.booking.service_recipient.last_name}` : 
                  t('forms.bookings.dataNotAvailable')
                }
              </Typography>
              <Typography variant="body2">
                <strong>Дата:</strong> {confirmDialog.booking.booking_date ? 
                  format(new Date(confirmDialog.booking.booking_date), 'dd.MM.yyyy') : '-'
                }
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelStatusChange} color="inherit">
            {t('common.cancel')}
          </Button>
          <Button onClick={handleConfirmStatusChange} variant="contained" autoFocus>
            {t('common.confirm')}
          </Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
        message={notification.message}
      />
    </Box>
  );
};

export default BookingsPage; 