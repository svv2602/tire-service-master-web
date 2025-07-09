import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  ButtonGroup,
  Card,
  CardContent,
  Chip,
  IconButton,
  Avatar,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Today as TodayIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon,
  CalendarViewDay as CalendarViewIcon,
  ViewWeek as ViewWeekIcon,
  ViewModule as ViewModuleIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { getThemeColors } from '../../styles';
import { useTranslation } from 'react-i18next';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, 
         addWeeks, addMonths, startOfMonth, endOfMonth, isSameDay, isToday } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Booking } from '../../types/models';
import { getStatusDisplayName, getStatusChipColor } from '../../utils/bookingStatus';

type CalendarView = 'day' | 'week' | 'month';

interface BookingCalendarProps {
  bookings: Booking[];
  loading?: boolean;
  onBookingSelect?: (booking: Booking) => void;
  onDateRangeChange?: (startDate: Date, endDate: Date) => void;
  onBulkAction?: (bookings: Booking[], action: string) => void;
  showBulkActions?: boolean;
  totalBookings?: number;
  appliedFilters?: {
    servicePoint?: string;
    category?: string;
  };
}

export const BookingCalendar: React.FC<BookingCalendarProps> = ({
  bookings,
  loading = false,
  onBookingSelect,
  onDateRangeChange,
  onBulkAction,
  showBulkActions = false,
  totalBookings,
  appliedFilters,
}) => {
  const { t } = useTranslation('components');
  const theme = useTheme();
  const colors = getThemeColors(theme);
  
  // Состояние календаря
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>('month');
  const [selectedBookings, setSelectedBookings] = useState<Set<number>>(new Set());
  const [dayDetailsOpen, setDayDetailsOpen] = useState(false);
  const [selectedDayBookings, setSelectedDayBookings] = useState<Booking[]>([]);

  // Вычисляем диапазон дат для текущего представления
  const dateRange = useMemo(() => {
    switch (view) {
      case 'day':
        return { start: currentDate, end: currentDate };
      case 'week':
        return { 
          start: startOfWeek(currentDate, { weekStartsOn: 1 }), 
          end: endOfWeek(currentDate, { weekStartsOn: 1 })
        };
      case 'month':
        return { 
          start: startOfMonth(currentDate), 
          end: endOfMonth(currentDate)
        };
      default:
        return { start: currentDate, end: currentDate };
    }
  }, [currentDate, view]);

  // Уведомляем родительский компонент об изменении диапазона
  React.useEffect(() => {
    if (onDateRangeChange) {
      onDateRangeChange(dateRange.start, dateRange.end);
    }
  }, [dateRange.start, dateRange.end, onDateRangeChange]);

  // Группируем бронирования по дням
  const bookingsByDay = useMemo(() => {
    const groups: Record<string, Booking[]> = {};
    
    bookings.forEach(booking => {
      const date = new Date(booking.booking_date);
      const dateKey = format(date, 'yyyy-MM-dd');
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(booking);
    });
    
    return groups;
  }, [bookings]);

  // Навигация по календарю
  const navigateCalendar = (direction: 'prev' | 'next' | 'today') => {
    if (direction === 'today') {
      setCurrentDate(new Date());
      return;
    }

    const increment = direction === 'next' ? 1 : -1;
    
    switch (view) {
      case 'day':
        setCurrentDate(prev => addDays(prev, increment));
        break;
      case 'week':
        setCurrentDate(prev => addWeeks(prev, increment));
        break;
      case 'month':
        setCurrentDate(prev => addMonths(prev, increment));
        break;
    }
  };

  // Выбор бронирований
  const toggleBookingSelection = (bookingId: number) => {
    const newSelection = new Set(selectedBookings);
    if (newSelection.has(bookingId)) {
      newSelection.delete(bookingId);
    } else {
      newSelection.add(bookingId);
    }
    setSelectedBookings(newSelection);
  };

  const selectAllBookings = () => {
    const allBookingIds = bookings.map(b => b.id);
    setSelectedBookings(new Set(allBookingIds));
  };

  const clearSelection = () => {
    setSelectedBookings(new Set());
  };

  // Показать детали дня
  const showDayDetails = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const dayBookings = bookingsByDay[dateKey] || [];
    setSelectedDayBookings(dayBookings);
    setDayDetailsOpen(true);
  };

  // Массовые действия
  const handleBulkAction = (action: string) => {
    const selectedBookingObjects = bookings.filter(b => selectedBookings.has(b.id));
    if (onBulkAction && selectedBookingObjects.length > 0) {
      onBulkAction(selectedBookingObjects, action);
    }
  };

  // Отображение заголовка
  const renderHeader = () => (
    <>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 2,
        flexWrap: 'wrap',
        gap: 2
      }}>
        {/* Навигация */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={() => navigateCalendar('prev')}>
            <ChevronLeftIcon />
          </IconButton>
          
          <Button 
            variant="outlined" 
            onClick={() => navigateCalendar('today')}
            startIcon={<TodayIcon />}
            sx={{ minWidth: 120 }}
          >
            {t('bookingCalendar.todayButton')}
          </Button>
          
          <IconButton onClick={() => navigateCalendar('next')}>
            <ChevronRightIcon />
          </IconButton>
          
          <Typography variant="h5" sx={{ ml: 2, fontWeight: 600 }}>
            {view === 'day' && format(currentDate, 'd MMMM yyyy', { locale: ru })}
            {view === 'week' && `${format(dateRange.start, 'd MMM', { locale: ru })} - ${format(dateRange.end, 'd MMM yyyy', { locale: ru })}`}
            {view === 'month' && format(currentDate, 'MMMM yyyy', { locale: ru })}
          </Typography>
        </Box>

        {/* Переключатели вида */}
        <ButtonGroup variant="outlined" size="small">
          <Button 
            variant={view === 'day' ? 'contained' : 'outlined'}
            onClick={() => setView('day')}
            startIcon={<CalendarViewIcon />}
          >
            {t('bookingCalendar.views.day')}
          </Button>
          <Button 
            variant={view === 'week' ? 'contained' : 'outlined'}
            onClick={() => setView('week')}
            startIcon={<ViewWeekIcon />}
          >
            {t('bookingCalendar.views.week')}
          </Button>
          <Button 
            variant={view === 'month' ? 'contained' : 'outlined'}
            onClick={() => setView('month')}
            startIcon={<ViewModuleIcon />}
          >
            {t('bookingCalendar.views.month')}
          </Button>
        </ButtonGroup>
      </Box>

      {/* Статистика и информация о фильтрах */}
      <Box sx={{ 
        mb: 3, 
        p: 2, 
        bgcolor: colors.backgroundSecondary, 
        borderRadius: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body1">
            <strong>{t('bookingCalendar.stats.found')}:</strong> {bookings.length}
            {totalBookings && totalBookings !== bookings.length && (
              <span style={{ color: colors.textSecondary }}>
                {' '}{t('bookingCalendar.stats.outOf')} {totalBookings} {t('bookingCalendar.stats.total')}
              </span>
            )}
          </Typography>
          
          {appliedFilters && (appliedFilters.servicePoint || appliedFilters.category) && (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {appliedFilters.servicePoint && (
                <Chip 
                  label={`${t('bookingCalendar.filters.servicePoint')}: ${appliedFilters.servicePoint}`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              )}
              {appliedFilters.category && (
                <Chip 
                  label={`${t('bookingCalendar.filters.category')}: ${appliedFilters.category}`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              )}
            </Box>
          )}
        </Box>

        {/* Статистика по статусам */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {['pending', 'confirmed', 'completed', 'cancelled'].map(status => {
            const count = bookings.filter(b => b.status === status).length;
            if (count === 0) return null;
            
            return (
              <Chip
                key={status}
                label={`${getStatusDisplayName(status)}: ${count}`}
                size="small"
                sx={{
                  backgroundColor: getStatusChipColor(status),
                  color: theme.palette.getContrastText(getStatusChipColor(status)),
                }}
              />
            );
          })}
        </Box>
      </Box>
    </>
  );

  // Массовые действия
  const renderBulkActions = () => {
    if (!showBulkActions || selectedBookings.size === 0) return null;

    return (
      <Box sx={{ mb: 2, p: 2, bgcolor: colors.backgroundSecondary, borderRadius: 1 }}>
        <Typography variant="body2" sx={{ mb: 1 }}>
          {t('bookingCalendar.bulkActions.selected')}: {selectedBookings.size}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button size="small" onClick={() => handleBulkAction('confirm')}>
            {t('bookingCalendar.bulkActions.confirmAll')}
          </Button>
          <Button size="small" onClick={() => handleBulkAction('cancel')}>
            {t('bookingCalendar.bulkActions.cancelAll')}
          </Button>
          <Button size="small" onClick={() => handleBulkAction('reschedule')}>
            {t('bookingCalendar.bulkActions.rescheduleAll')}
          </Button>
          <Button size="small" onClick={selectAllBookings}>
            {t('bookingCalendar.bulkActions.selectAll')}
          </Button>
          <Button size="small" onClick={clearSelection}>
            {t('bookingCalendar.bulkActions.clearSelection')}
          </Button>
        </Box>
      </Box>
    );
  };

  // Компонент бронирования
  const BookingItem: React.FC<{ booking: Booking; compact?: boolean }> = ({ booking, compact = false }) => (
    <Card 
      sx={{ 
        mb: 1, 
        cursor: 'pointer',
        border: selectedBookings.has(booking.id) ? `2px solid ${colors.primary}` : undefined,
        '&:hover': { boxShadow: 2 }
      }}
      onClick={() => {
        if (showBulkActions) {
          toggleBookingSelection(booking.id);
        } else if (onBookingSelect) {
          onBookingSelect(booking);
        }
      }}
    >
      <CardContent sx={{ p: compact ? 1 : 2, '&:last-child': { pb: compact ? 1 : 2 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant={compact ? "caption" : "body2"} sx={{ fontWeight: 600 }}>
              #{booking.id}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
              <TimeIcon sx={{ fontSize: 14 }} />
              <Typography variant={compact ? "caption" : "body2"}>
                {booking.start_time}
              </Typography>
            </Box>
            {!compact && (booking.client || booking.service_recipient) && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                <PersonIcon sx={{ fontSize: 14 }} />
                <Typography variant="body2">
                  {booking.client ? 
                    `${booking.client.user?.first_name || booking.client.first_name || ''} ${booking.client.user?.last_name || booking.client.last_name || ''}`.trim() :
                    booking.service_recipient ? 
                      `${booking.service_recipient.first_name} ${booking.service_recipient.last_name}` :
                      t('bookingCalendar.guestBooking')
                  }
                </Typography>
              </Box>
            )}
          </Box>
          <Chip 
            label={getStatusDisplayName(booking.status)} 
            color={getStatusChipColor(booking.status)}
            size="small"
          />
        </Box>
      </CardContent>
    </Card>
  );

  // Дневное представление
  const renderDayView = () => {
    const dayBookings = bookingsByDay[format(currentDate, 'yyyy-MM-dd')] || [];
    
    return (
      <Box>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {t('bookingCalendar.dayView.title', { 
            date: format(currentDate, 'd MMMM yyyy', { locale: ru }), 
            count: dayBookings.length 
          })}
        </Typography>
        {dayBookings.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">{t('bookingCalendar.dayView.noBookings')}</Typography>
          </Box>
        ) : (
          dayBookings.map(booking => (
            <BookingItem key={booking.id} booking={booking} />
          ))
        )}
      </Box>
    );
  };

  // Недельное представление
  const renderWeekView = () => {
    const days = eachDayOfInterval({ start: dateRange.start, end: dateRange.end });
    
    return (
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
        {days.map(day => {
          const dayBookings = bookingsByDay[format(day, 'yyyy-MM-dd')] || [];
          
          return (
            <Card 
              key={format(day, 'yyyy-MM-dd')}
              sx={{ 
                minHeight: 200,
                cursor: 'pointer',
                bgcolor: isToday(day) ? colors.backgroundSecondary : 'background.paper'
              }}
              onClick={() => showDayDetails(day)}
            >
              <CardContent sx={{ p: 1 }}>
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    fontWeight: 600, 
                    mb: 1,
                    color: isToday(day) ? colors.primary : 'text.primary'
                  }}
                >
                  {format(day, 'EEE d', { locale: ru })}
                </Typography>
                {dayBookings.slice(0, 3).map(booking => (
                  <BookingItem key={booking.id} booking={booking} compact />
                ))}
                {dayBookings.length > 3 && (
                  <Typography variant="caption" color="text.secondary">
                    {t('bookingCalendar.weekView.moreCount', { count: dayBookings.length - 3 })}
                  </Typography>
                )}
              </CardContent>
            </Card>
          );
        })}
      </Box>
    );
  };

  // Месячное представление
  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    
    return (
      <Box>
        {/* Заголовки дней недели */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, mb: 1 }}>
          {[
            t('bookingCalendar.monthView.weekDays.mon'),
            t('bookingCalendar.monthView.weekDays.tue'),
            t('bookingCalendar.monthView.weekDays.wed'),
            t('bookingCalendar.monthView.weekDays.thu'),
            t('bookingCalendar.monthView.weekDays.fri'),
            t('bookingCalendar.monthView.weekDays.sat'),
            t('bookingCalendar.monthView.weekDays.sun')
          ].map((day, index) => (
            <Typography key={index} variant="subtitle2" sx={{ textAlign: 'center', fontWeight: 600 }}>
              {day}
            </Typography>
          ))}
        </Box>
        
        {/* Календарная сетка */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
          {calendarDays.map(day => {
            const dayBookings = bookingsByDay[format(day, 'yyyy-MM-dd')] || [];
            const isCurrentMonth = day >= monthStart && day <= monthEnd;
            
            return (
              <Card 
                key={format(day, 'yyyy-MM-dd')}
                sx={{ 
                  minHeight: 120,
                  cursor: 'pointer',
                  opacity: isCurrentMonth ? 1 : 0.5,
                  bgcolor: isToday(day) ? colors.backgroundSecondary : 'background.paper'
                }}
                onClick={() => showDayDetails(day)}
              >
                <CardContent sx={{ p: 1 }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: isToday(day) ? 700 : 500,
                      mb: 0.5,
                      color: isToday(day) ? colors.primary : 'text.primary'
                    }}
                  >
                    {format(day, 'd')}
                  </Typography>
                  {dayBookings.length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {dayBookings.slice(0, 2).map(booking => (
                        <Chip 
                          key={booking.id}
                          label={booking.start_time}
                          size="small"
                          color={getStatusChipColor(booking.status)}
                          sx={{ fontSize: '0.6rem', height: 18 }}
                        />
                      ))}
                      {dayBookings.length > 2 && (
                        <Typography variant="caption" color="text.secondary">
                          {t('bookingCalendar.monthView.moreCount', { count: dayBookings.length - 2 })}
                        </Typography>
                      )}
                    </Box>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </Box>
      </Box>
    );
  };

  // Диалог деталей дня
  const renderDayDetailsDialog = () => (
    <Dialog 
      open={dayDetailsOpen} 
      onClose={() => setDayDetailsOpen(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        {selectedDayBookings.length > 0 ? 
          t('bookingCalendar.dayDetails.title', { 
            date: format(new Date(selectedDayBookings[0].booking_date), 'd MMMM yyyy', { locale: ru })
          }) : 
          t('bookingCalendar.dayDetails.titleEmpty')
        }
      </DialogTitle>
      <DialogContent>
        {selectedDayBookings.length === 0 ? (
          <Typography>{t('bookingCalendar.dayDetails.noBookings')}</Typography>
        ) : (
          <List>
            {selectedDayBookings.map(booking => (
              <ListItem key={booking.id} divider>
                <ListItemAvatar>
                  <Avatar>
                    <PersonIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={`#${booking.id} - ${booking.start_time}`}
                  secondary={
                    booking.client ? 
                      `${booking.client.user?.first_name || booking.client.first_name || ''} ${booking.client.user?.last_name || booking.client.last_name || ''}`.trim() :
                      booking.service_recipient ? 
                        `${booking.service_recipient.first_name} ${booking.service_recipient.last_name}` :
                        t('bookingCalendar.guestBooking')
                  }
                />
                <Chip 
                  label={getStatusDisplayName(booking.status)} 
                  color={getStatusChipColor(booking.status)}
                  size="small"
                />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setDayDetailsOpen(false)}>{t('bookingCalendar.dayDetails.close')}</Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Box>
      {renderHeader()}
      {renderBulkActions()}
      
      {loading ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography>{t('bookingCalendar.loading')}</Typography>
        </Box>
      ) : (
        <>
          {view === 'day' && renderDayView()}
          {view === 'week' && renderWeekView()}
          {view === 'month' && renderMonthView()}
        </>
      )}
      
      {renderDayDetailsDialog()}
    </Box>
  );
};