import React, { useState, useMemo, useCallback } from 'react';
import { useTheme, Avatar, Alert, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
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

const BookingsPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const tablePageStyles = getTablePageStyles(theme);
  
  // Состояния для интерактивного статуса
  const [statusMenuAnchor, setStatusMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    booking: Booking | null;
    newStatus: number;
    newStatusLabel: string;
  }>({
    open: false,
    booking: null,
    newStatus: 0,
    newStatusLabel: '',
  });
  
  // Состояние для поиска, фильтров, сортировки и пагинации
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const rowsPerPage = 25;
  
  // Состояние сортировки
  const [sortBy, setSortBy] = useState('booking_datetime');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Состояние фильтров
  const [statusFilter, setStatusFilter] = useState<number | ''>('');
  const [cityFilter, setCityFilter] = useState<number | ''>('');
  const [servicePointFilter, setServicePointFilter] = useState<number | ''>('');
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState<number | ''>('');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');
  
  // Формируем параметры запроса
  const queryParams = useMemo(() => {
    const params: BookingFilter = {
      page: page + 1,
      per_page: rowsPerPage,
      sort_by: sortBy,
      sort_order: sortOrder,
    };
    
    if (search) params.query = search;
    if (statusFilter) params.status_id = Number(statusFilter);
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

  // Вспомогательные функции
  const formatTime = useCallback((timeString: string): string => {
    if (!timeString) return '-';
    
    // Если время уже в формате HH:mm
    if (/^\d{2}:\d{2}$/.test(timeString)) {
      return timeString;
    }
    
    // Если время в формате ISO (полная дата-время)
    if (timeString.includes('T')) {
      try {
        const time = timeString.split('T')[1];
        return time.split(':').slice(0, 2).join(':');
      } catch {
        return timeString;
      }
    }
    
    // Если время содержит секунды HH:mm:ss
    if (/^\d{2}:\d{2}:\d{2}/.test(timeString)) {
      return timeString.split(':').slice(0, 2).join(':');
    }
    
    // Попытка парсинга через Date
    try {
      const date = new Date(`2000-01-01T${timeString}`);
      if (!isNaN(date.getTime())) {
        return date.toLocaleTimeString('ru-RU', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
      }
    } catch {
      // Игнорируем ошибки парсинга
    }
    
    return timeString;
  }, []);

  const getStatusLabel = useCallback((statusId: number): string => {
    const status = bookingStatuses.find(s => s.id === statusId);
    return status?.name || `Статус ${statusId}`;
  }, [bookingStatuses]);

  const getStatusColor = useCallback((statusId: number): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    const status = bookingStatuses.find(s => s.id === statusId);
    if (!status?.color) return 'default';
    
    // Маппинг цветов из API на цвета MUI Chip
    switch (status.color.toLowerCase()) {
      case 'orange':
      case 'warning': return 'warning';
      case 'blue':
      case 'primary': return 'primary';
      case 'red':
      case 'error': return 'error';
      case 'green':
      case 'success': return 'success';
      case 'info': return 'info';
      case 'secondary': return 'secondary';
      default: return 'default';
    }
  }, [bookingStatuses]);

  // Функция для получения инициалов клиента
  const getClientInitials = useCallback((booking: Booking): string => {
    if (booking.service_recipient?.first_name && booking.service_recipient?.last_name) {
      return `${booking.service_recipient.first_name.charAt(0)}${booking.service_recipient.last_name.charAt(0)}`.toUpperCase();
    }
    if (booking.service_recipient?.first_name) {
      return booking.service_recipient.first_name.charAt(0).toUpperCase();
    }
    if (booking.service_recipient?.last_name) {
      return booking.service_recipient.last_name.charAt(0).toUpperCase();
    }
    return 'К'; // К = Клиент
  }, []);

  // Обработчики для интерактивного статуса
  const handleStatusChipClick = useCallback((event: React.MouseEvent<HTMLElement>, booking: Booking) => {
    setStatusMenuAnchor(event.currentTarget);
    setSelectedBooking(booking);
  }, []);

  const handleStatusMenuClose = useCallback(() => {
    setStatusMenuAnchor(null);
    setSelectedBooking(null);
  }, []);

  const handleStatusSelect = useCallback((newStatusId: number) => {
    if (!selectedBooking) return;
    
    const newStatusLabel = getStatusLabel(newStatusId);
    setConfirmDialog({
      open: true,
      booking: selectedBooking,
      newStatus: newStatusId,
      newStatusLabel,
    });
    handleStatusMenuClose();
  }, [selectedBooking, getStatusLabel, handleStatusMenuClose]);

  const handleConfirmStatusChange = useCallback(async () => {
    if (!confirmDialog.booking) return;
    
    try {
      await updateBookingStatus({
        id: confirmDialog.booking.id.toString(),
        status_id: confirmDialog.newStatus
      }).unwrap();
      
      setConfirmDialog({
        open: false,
        booking: null,
        newStatus: 0,
        newStatusLabel: '',
      });
    } catch (error) {
      console.error('Ошибка при изменении статуса:', error);
    }
  }, [confirmDialog, updateBookingStatus]);

  const handleCancelStatusChange = useCallback(() => {
    setConfirmDialog({
      open: false,
      booking: null,
      newStatus: 0,
      newStatusLabel: '',
    });
  }, []);

  // Обработчики действий
  const handleStatusChange = useCallback(async (booking: Booking, newStatusId: number) => {
    try {
      await updateBooking({
        id: booking.id.toString(),
        booking: { 
          status_id: newStatusId
        }
      }).unwrap();
    } catch (error) {
      console.error('Ошибка при изменении статуса:', error);
    }
  }, [updateBooking]);

  // Устаревший обработчик для совместимости с ActionsMenu
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
      await refetchBookings();
    } catch (error) {
      console.error('Ошибка при удалении бронирования:', error);
    }
  }, [deleteBooking, refetchBookings]);

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
    title: 'Бронирования',
    actions: [
      {
        id: 'sort',
        label: `Сортировка: ${sortOrder === 'asc' ? 'по возрастанию' : 'по убыванию'}`,
        icon: sortOrder === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />,
        variant: 'outlined',
        color: 'primary',
        onClick: handleSort,
      },
      {
        id: 'create',
        label: 'Новое бронирование',
        icon: <AddIcon />,
        variant: 'contained',
        onClick: handleCreateBooking,
      },
    ],
  }), [handleCreateBooking, handleSort, sortOrder]);

  // Конфигурация поиска
  const searchConfig: SearchConfig = useMemo(() => ({
    placeholder: 'Поиск по имени, фамилии, email или номеру телефона получателя услуги',
    value: search,
    onChange: setSearch,
    onClear: () => setSearch(''),
  }), [search]);

  // Конфигурация фильтров
  const filterConfig: FilterConfig[] = useMemo(() => [
    {
      id: 'status',
      label: 'Статус',
      type: 'select',
      value: statusFilter,
      onChange: (value) => setStatusFilter(value as number | ''),
      options: [
        { value: '', label: 'Все статусы' },
        ...bookingStatuses.map(status => ({ value: status.id, label: status.name })),
      ],
      loading: bookingStatusesLoading,
    },
    {
      id: 'city',
      label: 'Город',
      type: 'select',
      value: cityFilter,
      onChange: (value) => setCityFilter(value as number | ''),
      options: [
        { value: '', label: 'Все города' },
        ...cities.map(city => ({ value: city.id, label: city.name })),
      ],
      loading: citiesLoading,
    },
    {
      id: 'service_point',
      label: 'Сервисная точка',
      type: 'select',
      value: servicePointFilter,
      onChange: (value) => setServicePointFilter(value as number | ''),
      options: [
        { value: '', label: 'Все точки' },
        ...servicePoints.map(sp => ({ value: sp.id, label: sp.name })),
      ],
      loading: servicePointsLoading,
    },
    {
      id: 'service_category',
      label: 'Тип услуг',
      type: 'select',
      value: serviceCategoryFilter,
      onChange: (value) => setServiceCategoryFilter(value as number | ''),
      options: [
        { value: '', label: 'Все типы услуг' },
        ...serviceCategories.map(category => ({ value: category.id, label: category.name })),
      ],
      loading: serviceCategoriesLoading,
    },
    {
      id: 'date_from',
      label: 'Дата с',
      type: 'date',
      value: dateFromFilter,
      onChange: (value) => setDateFromFilter(value as string),
    },
    {
      id: 'date_to',
      label: 'Дата по',
      type: 'date',
      value: dateToFilter,
      onChange: (value) => setDateToFilter(value as string),
    },
  ], [
    statusFilter, cityFilter, servicePointFilter, serviceCategoryFilter, dateFromFilter, dateToFilter,
    cities, servicePoints, serviceCategories, bookingStatuses,
    citiesLoading, servicePointsLoading, serviceCategoriesLoading, bookingStatusesLoading
  ]);

  // Примечание: сортировка управляется автоматически через PageTable

  // Конфигурация действий для ActionsMenu (упрощенная, статус теперь меняется в таблице)
  const bookingActions: ActionItem<Booking>[] = useMemo(() => [
    {
      id: 'edit',
      label: 'Редактировать',
      icon: <EditIcon />,
      color: 'primary',
      tooltip: 'Редактировать бронирование',
      onClick: (booking: Booking) => navigate(`/admin/bookings/${booking.id}/edit`),
    },
    {
      id: 'delete',
      label: 'Удалить',
      icon: <DeleteIcon />,
      color: 'error',
      tooltip: 'Удалить бронирование',
      onClick: handleDeleteBooking,
      requireConfirmation: true,
      confirmationConfig: {
        title: 'Подтверждение удаления',
        message: 'Вы действительно хотите удалить бронирование? Это действие нельзя будет отменить.',
        confirmLabel: 'Удалить',
        cancelLabel: 'Отмена',
      },
    },
  ], [navigate, handleDeleteBooking]);

  // Определение колонок
  const columns: Column<Booking>[] = useMemo(() => [
    {
      id: 'service_recipient',
      label: 'Получатель услуги',
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
              'Данные отсутствуют'
            }
          </Typography>
        </Box>
      ),
    },
    {
      id: 'recipient_phone',
      label: 'Телефон',
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
      label: 'Город',
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
      label: 'Точка обслуживания',
      minWidth: 180,
      wrap: true,
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
      label: 'Тип услуг',
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
      label: 'Дата и время',
      minWidth: 160,
      sortable: true,
      format: (value: any, booking: Booking) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ScheduleIcon fontSize="small" color="action" />
          <Box>
            <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
              {format(new Date(booking.booking_date), 'dd.MM.yyyy')}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ wordBreak: 'break-word' }}>
              {formatTime(booking.start_time)}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'status',
      label: 'Статус',
      minWidth: 120,
      align: 'center',
      sortable: false,
              format: (value: any, booking: Booking) => (
        <Typography 
          variant="body2" 
          sx={{ 
            wordBreak: 'break-word',
            cursor: 'pointer',
            '&:hover': {
              opacity: 0.8,
            },
          }}
          onClick={(event: React.MouseEvent<HTMLElement>) => handleStatusChipClick(event, booking)}
        >
          {getStatusLabel(booking.status_id)} ▼
        </Typography>
      ),
    },
    {
      id: 'actions',
      label: 'Действия',
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
     ], [tablePageStyles, formatTime, getStatusColor, getStatusLabel, getClientInitials, handleStatusChipClick, bookingActions]);

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
        {bookingStatuses.map((status) => (
          <MenuItem key={status.id} onClick={() => handleStatusSelect(status.id)}>
            {status.name}
          </MenuItem>
        ))}
      </Menu>

      {/* Диалог подтверждения изменения статуса */}
      <Dialog
        open={confirmDialog.open}
        onClose={handleCancelStatusChange}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Подтверждение изменения статуса
        </DialogTitle>
        <DialogContent>
          {confirmDialog.booking && (
            <Box>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Вы действительно хотите изменить статус бронирования на <strong>"{confirmDialog.newStatusLabel}"</strong>?
              </Typography>
              
              <Box sx={{ 
                mt: 2, 
                p: 2, 
                bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50', 
                borderRadius: 1,
                border: `1px solid ${theme.palette.mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[300]}`,
              }}>
                <Typography variant="body2" sx={{ 
                  fontWeight: 'bold', 
                  mb: 1,
                  color: theme.palette.mode === 'dark' ? 'grey.200' : 'grey.700'
                }}>
                  📋 Детали бронирования:
                </Typography>
                <Box sx={{ pl: 2 }}>
                  <Typography variant="body2">
                    • <strong>Клиент:</strong> {confirmDialog.booking.service_recipient 
                      ? `${confirmDialog.booking.service_recipient.first_name} ${confirmDialog.booking.service_recipient.last_name}` 
                      : 'Данные отсутствуют'}
                  </Typography>
                  <Typography variant="body2">
                    • <strong>Телефон:</strong> {confirmDialog.booking.service_recipient?.phone || '-'}
                  </Typography>
                  <Typography variant="body2">
                    • <strong>Дата:</strong> {format(new Date(confirmDialog.booking.booking_date), 'dd.MM.yyyy')}
                  </Typography>
                  <Typography variant="body2">
                    • <strong>Время:</strong> {formatTime(confirmDialog.booking.start_time)}
                  </Typography>
                  <Typography variant="body2">
                    • <strong>Сервисная точка:</strong> {confirmDialog.booking.service_point?.name || '-'}
                  </Typography>
                  <Typography variant="body2">
                    • <strong>Тип услуг:</strong> {confirmDialog.booking.service_category?.name || '-'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelStatusChange} color="inherit">
            Отмена
          </Button>
          <Button 
            onClick={handleConfirmStatusChange} 
            color="primary" 
            variant="contained"
            autoFocus
          >
            Подтвердить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BookingsPage; 