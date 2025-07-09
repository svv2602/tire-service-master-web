import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  ButtonGroup,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Paper,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Assessment as AssessmentIcon,
  DateRange as DateRangeIcon,
  GetApp as DownloadIcon,
  Refresh as RefreshIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  TableChart as TableChartIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { getThemeColors } from '../../styles';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { format, subDays, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Booking } from '../../types/models';
import { getStatusDisplayName } from '../../utils/bookingStatus';
import { useTranslation } from 'react-i18next';

interface AnalyticsFilter {
  period: 'week' | 'month' | 'quarter' | 'year' | 'custom';
  groupBy: 'day' | 'week' | 'month';
  servicePointId?: number;
  categoryId?: number;
  startDate?: Date;
  endDate?: Date;
}

interface BookingAnalyticsProps {
  bookings: Booking[];
  loading?: boolean;
  onFilterChange?: (filter: AnalyticsFilter) => void;
  onExport?: (format: 'csv' | 'excel', data: any) => void;
  onRefresh?: () => void;
}

const STATUS_COLORS = {
  pending: '#FFC107',
  confirmed: '#4CAF50',
  in_progress: '#2196F3',
  completed: '#8BC34A',
  cancelled_by_client: '#F44336',
  cancelled_by_partner: '#9C27B0',
  no_show: '#607D8B',
};

export const BookingAnalytics: React.FC<BookingAnalyticsProps> = ({
  bookings,
  loading = false,
  onFilterChange,
  onExport,
  onRefresh,
}) => {
  const theme = useTheme();
  const colors = getThemeColors(theme);
  const { t } = useTranslation('components');

  // Фильтры
  const [filter, setFilter] = useState<AnalyticsFilter>({
    period: 'month',
    groupBy: 'day',
  });

  const [viewType, setViewType] = useState<'charts' | 'table'>('charts');

  // Применение фильтров
  const handleFilterChange = (newFilter: Partial<AnalyticsFilter>) => {
    const updatedFilter = { ...filter, ...newFilter };
    setFilter(updatedFilter);
    if (onFilterChange) {
      onFilterChange(updatedFilter);
    }
  };

  // Подготовка данных для аналитики
  const analyticsData = useMemo(() => {
    // Фильтрация по периоду
    let filteredBookings = bookings;
    const now = new Date();
    
    switch (filter.period) {
      case 'week':
        filteredBookings = bookings.filter(b => 
          new Date(b.booking_date) >= subDays(now, 7)
        );
        break;
      case 'month':
        filteredBookings = bookings.filter(b => 
          new Date(b.booking_date) >= subMonths(now, 1)
        );
        break;
      case 'quarter':
        filteredBookings = bookings.filter(b => 
          new Date(b.booking_date) >= subMonths(now, 3)
        );
        break;
      case 'year':
        filteredBookings = bookings.filter(b => 
          new Date(b.booking_date) >= subMonths(now, 12)
        );
        break;
    }

    // Статистика по статусам
    const statusStats = filteredBookings.reduce((acc, booking) => {
      const status = booking.status || 'pending';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Данные по дням/неделям/месяцам
    const timeSeriesData = filteredBookings.reduce((acc, booking) => {
      const date = new Date(booking.booking_date);
      let key: string;
      
      switch (filter.groupBy) {
        case 'day':
          key = format(date, 'yyyy-MM-dd');
          break;
        case 'week':
          key = format(date, 'yyyy-MM-dd'); // Неделя начала
          break;
        case 'month':
          key = format(date, 'yyyy-MM');
          break;
        default:
          key = format(date, 'yyyy-MM-dd');
      }

      if (!acc[key]) {
        acc[key] = {
          date: key,
          total: 0,
          pending: 0,
          confirmed: 0,
          completed: 0,
          cancelled: 0,
          revenue: 0,
        };
      }

      acc[key].total++;
      acc[key][booking.status as keyof typeof acc[string]] = 
        (acc[key][booking.status as keyof typeof acc[string]] || 0) + 1;
      
      if (booking.status === 'completed') {
        // В модели Booking нет поля total_price, рассчитываем из services
        const bookingRevenue = booking.services?.reduce((sum, service) => sum + (service.price * service.quantity), 0) || 0;
        acc[key].revenue += bookingRevenue;
      }

      return acc;
    }, {} as Record<string, any>);

    // Преобразуем в массив и сортируем
    const chartData = Object.values(timeSeriesData).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Топ сервисных точек
    const servicePointStats = filteredBookings.reduce((acc, booking) => {
      const spName = booking.service_point?.name || 'Неизвестно';
      if (!acc[spName]) {
        acc[spName] = { name: spName, count: 0, revenue: 0 };
      }
      acc[spName].count++;
      if (booking.status === 'completed') {
        const bookingRevenue = booking.services?.reduce((sum, service) => sum + (service.price * service.quantity), 0) || 0;
        acc[spName].revenue += bookingRevenue;
      }
      return acc;
    }, {} as Record<string, any>);

    // Статистика по категориям
    const categoryStats = filteredBookings.reduce((acc, booking) => {
      const categoryName = booking.service_category?.name || 'Без категории';
      if (!acc[categoryName]) {
        acc[categoryName] = { name: categoryName, count: 0, revenue: 0 };
      }
      acc[categoryName].count++;
      if (booking.status === 'completed') {
        const bookingRevenue = booking.services?.reduce((sum, service) => sum + (service.price * service.quantity), 0) || 0;
        acc[categoryName].revenue += bookingRevenue;
      }
      return acc;
    }, {} as Record<string, any>);

    return {
      total: filteredBookings.length,
      completed: statusStats.completed || 0,
      cancelled: (statusStats.cancelled_by_client || 0) + (statusStats.cancelled_by_partner || 0),
      revenue: filteredBookings
        .filter(b => b.status === 'completed')
        .reduce((sum, b) => {
          const bookingRevenue = b.services?.reduce((serviceSum, service) => serviceSum + (service.price * service.quantity), 0) || 0;
          return sum + bookingRevenue;
        }, 0),
      statusStats,
      chartData,
      servicePointStats: Object.values(servicePointStats).sort((a: any, b: any) => b.count - a.count),
      categoryStats: Object.values(categoryStats).sort((a: any, b: any) => b.count - a.count),
    };
  }, [bookings, filter]);

  // Обработка экспорта
  const handleExport = (format: 'csv' | 'excel') => {
    if (onExport) {
      onExport(format, {
        summary: analyticsData,
        bookings: bookings,
        filter: filter,
      });
    }
  };

  // Компонент статистической карточки
  const StatCard: React.FC<{
    title: string;
    value: number | string;
    trend?: number;
    color?: string;
    icon?: React.ReactNode;
  }> = ({ title, value, trend, color = colors.primary, icon }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography color="text.secondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div" sx={{ color, fontWeight: 600 }}>
              {typeof value === 'number' && value > 999 ? 
                `${(value / 1000).toFixed(1)}k` : value
              }
            </Typography>
            {trend !== undefined && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {trend > 0 ? (
                  <TrendingUpIcon sx={{ color: '#4CAF50', fontSize: 16 }} />
                ) : (
                  <TrendingDownIcon sx={{ color: '#F44336', fontSize: 16 }} />
                )}
                <Typography 
                  variant="body2" 
                  sx={{ 
                    ml: 0.5, 
                    color: trend > 0 ? '#4CAF50' : '#F44336' 
                  }}
                >
                  {Math.abs(trend)}%
                </Typography>
              </Box>
            )}
          </Box>
          {icon && (
            <Box sx={{ color: colors.textSecondary }}>
              {icon}
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );

  // Компонент графика статусов
  const StatusPieChart = () => {
    const data = Object.entries(analyticsData.statusStats).map(([status, count]) => ({
      name: getStatusDisplayName(status),
      value: count,
      color: STATUS_COLORS[status as keyof typeof STATUS_COLORS] || '#999',
    }));

    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t('bookingAnalytics.titles.statusDistribution')}
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <RechartsTooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  };

  // Компонент временного графика
  const TimeSeriesChart = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {t('bookingAnalytics.titles.bookingTrend')}
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={analyticsData.chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(value) => format(new Date(value), 'dd.MM')}
            />
            <YAxis />
            <RechartsTooltip 
              labelFormatter={(value) => format(new Date(value), 'dd MMMM yyyy', { locale: ru })}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="total"
              stackId="1"
              stroke={colors.primary}
              fill={colors.primary}
                             name={t('bookingAnalytics.labels.totalBookings')}
            />
            <Area
              type="monotone"
              dataKey="completed"
              stackId="2"
              stroke="#4CAF50"
              fill="#4CAF50"
                             name={t('bookingAnalytics.labels.completedBookings')}
            />
            <Area
              type="monotone"
              dataKey="cancelled"
              stackId="3"
              stroke="#F44336"
              fill="#F44336"
                             name={t('bookingAnalytics.labels.cancelledBookings')}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  // Компонент таблицы топ сервисных точек
  const ServicePointsTable = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {t('bookingAnalytics.titles.topServicePoints')}
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                                 <TableCell>{t('bookingAnalytics.table.headers.servicePoint')}</TableCell>
                 <TableCell align="right">{t('bookingAnalytics.table.headers.bookingsCount')}</TableCell>
                 <TableCell align="right">{t('bookingAnalytics.table.headers.revenue')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {analyticsData.servicePointStats.slice(0, 5).map((sp: any, index) => (
                <TableRow key={index}>
                  <TableCell>{sp.name}</TableCell>
                  <TableCell align="right">{sp.count}</TableCell>
                  <TableCell align="right">
                    {sp.revenue.toLocaleString('ru-RU')} ₽
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      {/* Заголовок и управление */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
                     {t('bookingAnalytics.titles.main')}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {/* Фильтры периода */}
          <FormControl size="small" sx={{ minWidth: 120 }}>
                         <InputLabel>{t('bookingAnalytics.filters.period')}</InputLabel>
             <Select
               value={filter.period}
               label={t('bookingAnalytics.filters.period')}
              onChange={(e) => handleFilterChange({ period: e.target.value as any })}
            >
                             <MenuItem value="week">{t('bookingAnalytics.filters.periodOptions.week')}</MenuItem>
               <MenuItem value="month">{t('bookingAnalytics.filters.periodOptions.month')}</MenuItem>
               <MenuItem value="quarter">{t('bookingAnalytics.filters.periodOptions.quarter')}</MenuItem>
               <MenuItem value="year">{t('bookingAnalytics.filters.periodOptions.year')}</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
                         <InputLabel>{t('bookingAnalytics.filters.groupBy')}</InputLabel>
             <Select
               value={filter.groupBy}
               label={t('bookingAnalytics.filters.groupBy')}
              onChange={(e) => handleFilterChange({ groupBy: e.target.value as any })}
            >
                             <MenuItem value="day">{t('bookingAnalytics.filters.groupByOptions.day')}</MenuItem>
               <MenuItem value="week">{t('bookingAnalytics.filters.groupByOptions.week')}</MenuItem>
               <MenuItem value="month">{t('bookingAnalytics.filters.groupByOptions.month')}</MenuItem>
            </Select>
          </FormControl>

          {/* Переключатель вида */}
          <ButtonGroup size="small" variant="outlined">
            <Button 
              variant={viewType === 'charts' ? 'contained' : 'outlined'}
              onClick={() => setViewType('charts')}
              startIcon={<BarChartIcon />}
            >
                             {t('bookingAnalytics.views.charts')}
            </Button>
            <Button 
              variant={viewType === 'table' ? 'contained' : 'outlined'}
              onClick={() => setViewType('table')}
              startIcon={<TableChartIcon />}
            >
                             {t('bookingAnalytics.views.table')}
            </Button>
          </ButtonGroup>

          {/* Действия */}
           <Tooltip title={t('bookingAnalytics.actions.refresh')}>
            <IconButton onClick={onRefresh} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>

          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => handleExport('csv')}
          >
                         {t('bookingAnalytics.actions.exportCsv')}
          </Button>

          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => handleExport('excel')}
          >
                         {t('bookingAnalytics.actions.exportExcel')}
          </Button>
        </Box>
      </Box>

      {/* Статистические карточки */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
                         title={t('bookingAnalytics.stats.totalBookings')}
            value={analyticsData.total}
            icon={<AssessmentIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
                         title={t('bookingAnalytics.stats.completed')}
            value={analyticsData.completed}
            color="#4CAF50"
            icon={<TrendingUpIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
                         title={t('bookingAnalytics.stats.cancelled')}
            value={analyticsData.cancelled}
            color="#F44336"
            icon={<TrendingDownIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
                         title={t('bookingAnalytics.stats.totalRevenue')}
            value={`${analyticsData.revenue.toLocaleString('ru-RU')} ₽`}
            color="#2196F3"
            icon={<PieChartIcon />}
          />
        </Grid>
      </Grid>

      {/* Графики или таблица */}
      {viewType === 'charts' ? (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <TimeSeriesChart />
          </Grid>
          <Grid item xs={12} md={4}>
            <StatusPieChart />
          </Grid>
          <Grid item xs={12} md={6}>
            <ServicePointsTable />
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                                     {t('bookingAnalytics.charts.topCategories')}
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                                                 <TableCell>{t('bookingAnalytics.table.headers.category')}</TableCell>
                         <TableCell align="right">{t('bookingAnalytics.table.headers.bookingsCount')}</TableCell>
                         <TableCell align="right">{t('bookingAnalytics.table.headers.revenue')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {analyticsData.categoryStats.slice(0, 5).map((cat: any, index) => (
                        <TableRow key={index}>
                          <TableCell>{cat.name}</TableCell>
                          <TableCell align="right">{cat.count}</TableCell>
                          <TableCell align="right">
                            {cat.revenue.toLocaleString('ru-RU')} ₽
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ) : (
        // Табличное представление всех данных
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
                             {t('bookingAnalytics.titles.detailedBookingTable')}
            </Typography>
            <TableContainer sx={{ maxHeight: 600 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                                         <TableCell>{t('bookingAnalytics.table.headers.id')}</TableCell>
                     <TableCell>{t('bookingAnalytics.table.headers.date')}</TableCell>
                     <TableCell>{t('bookingAnalytics.table.headers.time')}</TableCell>
                     <TableCell>{t('bookingAnalytics.table.headers.client')}</TableCell>
                     <TableCell>{t('bookingAnalytics.table.headers.servicePoint')}</TableCell>
                     <TableCell>{t('bookingAnalytics.table.headers.status')}</TableCell>
                     <TableCell align="right">{t('bookingAnalytics.table.headers.amount')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bookings.slice(0, 100).map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>#{booking.id}</TableCell>
                      <TableCell>
                        {format(new Date(booking.booking_date), 'dd.MM.yyyy')}
                      </TableCell>
                      <TableCell>{booking.start_time}</TableCell>
                      <TableCell>
                        {booking.client ? 
                          `${booking.client.user?.first_name || booking.client.first_name || ''} ${booking.client.user?.last_name || booking.client.last_name || ''}`.trim() :
                          booking.service_recipient ? 
                            `${booking.service_recipient.first_name} ${booking.service_recipient.last_name}` :
                                                         t('bookingAnalytics.table.guestBooking')
                        }
                      </TableCell>
                      <TableCell>{booking.service_point?.name}</TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusDisplayName(booking.status)}
                          size="small"
                          sx={{
                            bgcolor: STATUS_COLORS[booking.status as keyof typeof STATUS_COLORS],
                            color: 'white'
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        {booking.services?.reduce((sum, service) => sum + (service.price * service.quantity), 0)?.toLocaleString('ru-RU') || '0'} ₽
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};