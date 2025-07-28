import React, { useState } from 'react';
import { useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  LinearProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  DirectionsCar as CarIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  People as PeopleIcon,
  EventNote as BookingIcon,
  Star as ReviewIcon,
  Article as ArticleIcon,
  Email as EmailIcon,
  Warning as WarningIcon,
  Search as SeoIcon,
  Notifications as NotificationIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Dashboard as DashboardIcon,
  Assessment as AnalyticsIcon,
  Schedule as ScheduleIcon,
  RateReview as ReviewManageIcon,
} from '@mui/icons-material';
import { getDashboardStyles } from '../../styles';
import { 
  useGetPartnersQuery,
  useGetServicePointsQuery,
  useGetClientsQuery,
  useGetBookingsQuery
} from '../../api';
import { useGetReviewsQuery } from '../../api/reviews.api';
import { useGetArticlesQuery } from '../../api/articles.api';
import { useGetNotificationStatsQuery } from '../../api/notifications.api';
import { useGetBookingConflictStatisticsQuery } from '../../api/bookingConflicts.api';
import { useGetSeoAnalyticsQuery } from '../../api/seoMetatags.api';
import { useGetChannelStatisticsQuery } from '../../api/notificationChannelSettings.api';
import { format, subDays, subWeeks } from 'date-fns';
import StatCard from '../../components/StatCard';
import { useRoleAccess } from '../../hooks/useRoleAccess';

const DashboardPage: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dashboardStyles = getDashboardStyles(theme);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Хук для управления правами доступа по ролям
  const { isPartner, partnerId, isAdmin, isManager } = useRoleAccess();

  // Основные API запросы
  const { data: partnersData, isLoading: partnersLoading, error: partnersError, refetch: refetchPartners } = useGetPartnersQuery({
    page: 1,
    per_page: 1
  });

  const { data: servicePointsData, isLoading: servicePointsLoading, error: servicePointsError, refetch: refetchServicePoints } = useGetServicePointsQuery({
    page: 1,
    per_page: 100, // Загружаем больше для аналитики
    partner_id: isPartner ? partnerId : undefined, // Фильтрация для партнеров
  });

  const { data: clientsData, isLoading: clientsLoading, error: clientsError, refetch: refetchClients } = useGetClientsQuery({
    page: 1,
    per_page: 1
  });

  const { data: bookingsData, isLoading: bookingsLoading, error: bookingsError, refetch: refetchBookings } = useGetBookingsQuery({
    page: 1,
    per_page: 100,
    from_date: format(subWeeks(new Date(), 2), 'yyyy-MM-dd'),
    partner_id: isPartner ? partnerId : undefined, // Фильтрация для партнеров
  });

  // Дополнительные API запросы для расширенной статистики
  const { data: reviewsData, isLoading: reviewsLoading, refetch: refetchReviews } = useGetReviewsQuery({
    page: 1,
    per_page: 50,
    partner_id: isPartner ? partnerId : undefined, // Фильтрация для партнеров
  });

  const { data: articlesData, isLoading: articlesLoading, refetch: refetchArticles } = useGetArticlesQuery({
    page: 1,
    per_page: 50
  });

  const { data: notificationStats, isLoading: notificationStatsLoading, refetch: refetchNotificationStats } = useGetNotificationStatsQuery();

  const { data: conflictStats, isLoading: conflictStatsLoading, refetch: refetchConflictStats } = useGetBookingConflictStatisticsQuery();

  const { data: seoAnalytics, isLoading: seoLoading, refetch: refetchSeo } = useGetSeoAnalyticsQuery();

  const { data: channelStats, isLoading: channelStatsLoading, refetch: refetchChannelStats } = useGetChannelStatisticsQuery();

  // Функция обновления всех данных
  const handleRefreshAll = () => {
    setRefreshKey(prev => prev + 1);
    refetchPartners();
    refetchServicePoints();
    refetchClients();
    refetchBookings();
    refetchReviews();
    refetchArticles();
    refetchNotificationStats();
    refetchConflictStats();
    refetchSeo();
    refetchChannelStats();
  };

  // Проверка загрузки
  const isLoading = partnersLoading || servicePointsLoading || clientsLoading || bookingsLoading;
  const hasError = partnersError || servicePointsError || clientsError || bookingsError;

  // Подготовка данных для статистики
  const reviews = reviewsData?.data || [];
  const articles = articlesData?.data || [];
  const bookings = bookingsData?.data || [];
  const servicePoints = servicePointsData?.data || [];

  // Аналитика отзывов
  const reviewsAnalytics = {
    total: reviews.length,
    pending: reviews.filter(r => r.status === 'pending').length,
    published: reviews.filter(r => r.status === 'published').length,
    rejected: reviews.filter(r => r.status === 'rejected').length,
  };

  // Аналитика статей
  const articlesAnalytics = {
    total: articles.length,
    published: articles.filter(a => a.status === 'published').length,
    draft: articles.filter(a => a.status === 'draft').length,
    featured: articles.filter(a => a.featured).length,
  };

  // Аналитика бронирований за последние 2 недели
  const bookingsAnalytics = {
    total: bookings.length,
    thisWeek: bookings.filter(b => new Date(b.booking_date) >= subWeeks(new Date(), 1)).length,
    lastWeek: bookings.filter(b => {
      const date = new Date(b.booking_date);
      return date >= subWeeks(new Date(), 2) && date < subWeeks(new Date(), 1);
    }).length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
  };

  // Топ сервисных точек по бронированиям
  const topServicePoints = servicePoints
    .map(sp => ({
      ...sp,
      bookingsCount: bookings.filter(b => b.service_point_id === sp.id).length
    }))
    .sort((a, b) => b.bookingsCount - a.bookingsCount)
    .slice(0, 5);

  // Основная статистика с навигацией (адаптирована под роли)
  const mainStats = [
    // Статистика партнеров - только для админов и менеджеров
    ...(isAdmin || isManager ? [{
      title: t('forms.dashboard.stats.partners.title'),
      value: partnersData?.pagination?.total_count || 0,
      icon: <BusinessIcon />,
      color: '#1976d2',
      description: t('forms.dashboard.stats.partners.description'),
      navigateTo: '/admin/partners'
    }] : []),
    {
      title: isPartner ? 'Мои сервисные точки' : t('forms.dashboard.stats.servicePoints.title'),
      value: servicePointsData?.pagination?.total_count || 0,
      icon: <LocationIcon />,
      color: '#388e3c',
      description: isPartner ? 'Количество ваших сервисных точек' : t('forms.dashboard.stats.servicePoints.description'),
      navigateTo: '/admin/service-points'
    },
    // Статистика клиентов - только для админов и менеджеров
    ...(isAdmin || isManager ? [{
      title: t('forms.dashboard.stats.clients.title'),
      value: clientsData?.pagination?.total_count || 0,
      icon: <PeopleIcon />,
      color: '#f57c00',
      description: t('forms.dashboard.stats.clients.description'),
      navigateTo: '/admin/clients'
    }] : []),
    {
      title: isPartner ? 'Мои бронирования' : t('forms.dashboard.stats.bookings.title'),
      value: bookingsAnalytics.total,
      icon: <BookingIcon />,
      color: '#7b1fa2',
      description: `${bookingsAnalytics.pending} ${t('forms.dashboard.stats.bookings.pending')}, ${bookingsAnalytics.confirmed} ${t('forms.dashboard.stats.bookings.confirmed')}`,
      navigateTo: '/admin/bookings'
    },
  ];

  // Дополнительная статистика с навигацией (адаптирована под роли)
  const additionalStats = [
    {
      title: isPartner ? 'Отзывы моих точек' : t('forms.dashboard.stats.reviews.title'),
      value: reviewsAnalytics.total,
      icon: <ReviewIcon />,
      color: '#f57c00',
      description: `${reviewsAnalytics.pending} ${t('forms.dashboard.stats.reviews.pending')}`,
      navigateTo: '/admin/reviews'
    },
    // Статистика статей - только для админов и менеджеров
    ...(isAdmin || isManager ? [{
      title: t('forms.dashboard.stats.articles.title'),
      value: articlesAnalytics.total,
      icon: <ArticleIcon />,
      color: '#5d4037',
      description: `${articlesAnalytics.published} ${t('forms.dashboard.stats.articles.published')}`,
      navigateTo: '/admin/page-content'
    }] : []),
    // Конфликты бронирований - только для админов и менеджеров
    ...(isAdmin || isManager ? [{
      title: t('forms.dashboard.stats.conflicts.title'),
      value: conflictStats?.statistics?.total_pending || 0,
      icon: <WarningIcon />,
      color: '#d32f2f',
      description: `${conflictStats?.statistics?.total_pending || 0} ${t('forms.dashboard.stats.conflicts.description')}`,
      navigateTo: '/admin/booking-conflicts'
    }] : []),
    // SEO статистика - только для админов и менеджеров
    ...(isAdmin || isManager ? [{
      title: t('forms.dashboard.stats.seo.title'),
      value: seoAnalytics?.data?.total_pages || 0,
      icon: <SeoIcon />,
      color: '#00796b',
      description: `${seoAnalytics?.data?.good_pages || 0} ${t('forms.dashboard.stats.seo.optimized')}`,
      navigateTo: '/admin/seo'
    }] : []),
  ];

  // Компонент статистической карточки с навигацией
  const StatCard = ({ stat }: { stat: any }) => (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        cursor: stat.navigateTo ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        '&:hover': stat.navigateTo ? {
          transform: 'translateY(-4px)',
          boxShadow: 4,
          '& .stat-icon': {
            transform: 'scale(1.1)',
          }
        } : {}
      }}
      onClick={() => stat.navigateTo && navigate(stat.navigateTo)}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box 
            className="stat-icon"
            sx={{ 
              color: stat.color, 
              mr: 2,
              transition: 'transform 0.3s ease'
            }}
          >
            {stat.icon}
          </Box>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {stat.title}
          </Typography>
        </Box>
        <Typography variant="h4" component="div" sx={{ color: stat.color, mb: 1 }}>
          {stat.value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {stat.description}
        </Typography>
      </CardContent>
      {stat.navigateTo && (
        <CardActions sx={{ pt: 0 }}>
          <Chip 
            label={t('forms.dashboard.goToPage')} 
            size="small" 
            sx={{ 
              backgroundColor: stat.color + '20',
              color: stat.color,
              fontSize: '0.75rem'
            }} 
          />
        </CardActions>
      )}
    </Card>
  );

  if (isLoading) {
    return (
      <Box sx={dashboardStyles.loadingContainer}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>{t('forms.dashboard.loadingMessage')}</Typography>
      </Box>
    );
  }

  if (hasError) {
    return (
      <Box sx={dashboardStyles.errorContainer}>
        <Alert severity="error" sx={dashboardStyles.errorAlert}>
          {t('forms.dashboard.errorMessage')}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={dashboardStyles.pageContainer}>
      {/* Заголовок с кнопкой обновления */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={dashboardStyles.pageTitle}>
          <DashboardIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          {t('forms.dashboard.title')}
        </Typography>
        <Tooltip title={t('forms.dashboard.refreshTooltip')}>
          <IconButton onClick={handleRefreshAll} color="primary">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Основная статистика */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {mainStats.map((stat, index) => (
          <Grid key={index} item xs={12} sm={6} md={3}>
            <StatCard stat={stat} />
          </Grid>
        ))}
      </Grid>

      {/* Дополнительная статистика */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {additionalStats.map((stat, index) => (
          <Grid key={index} item xs={12} sm={6} md={3}>
            <StatCard stat={stat} />
          </Grid>
        ))}
      </Grid>

      {/* Карточки с детальной информацией */}
      <Grid container spacing={3}>
        {/* Быстрые действия */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🚀 {t('forms.dashboard.quickActions.title')}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/admin/bookings/new')}
                  fullWidth
                >
                  {t('forms.dashboard.quickActions.createBooking')}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/admin/articles/new')}
                  fullWidth
                >
                  {t('forms.dashboard.quickActions.writeArticle')}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ReviewManageIcon />}
                  onClick={() => navigate('/admin/reviews')}
                  fullWidth
                >
                  {t('forms.dashboard.quickActions.moderateReviews')}
                  {reviewsAnalytics.pending > 0 && (
                    <Chip 
                      label={reviewsAnalytics.pending} 
                      size="small" 
                      color="warning" 
                      sx={{ ml: 1 }} 
                    />
                  )}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ScheduleIcon />}
                  onClick={() => navigate('/admin/calendar')}
                  fullWidth
                >
                  {t('forms.dashboard.quickActions.calendar')}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<AnalyticsIcon />}
                  onClick={() => navigate('/admin/analytics')}
                  fullWidth
                >
                  {t('forms.dashboard.quickActions.bookingAnalytics')}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Статистика уведомлений - только для админов и менеджеров */}
        {(isAdmin || isManager) && (
          <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📧 {t('forms.dashboard.notificationStats.title')}
              </Typography>
              {channelStatsLoading ? (
                <CircularProgress size={20} />
              ) : (
                <Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      {t('forms.dashboard.notificationStats.emailDelivery')}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={channelStats?.statistics?.email?.delivery_rate || 0} 
                        sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                      />
                      <Typography variant="body2">
                        {Math.round(channelStats?.statistics?.email?.delivery_rate || 0)}%
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      {t('forms.dashboard.notificationStats.telegramDelivery')}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={channelStats?.statistics?.telegram?.delivery_rate || 0} 
                        sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                      />
                      <Typography variant="body2">
                        {Math.round(channelStats?.statistics?.telegram?.delivery_rate || 0)}%
                      </Typography>
                    </Box>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {t('forms.dashboard.notificationStats.pushNotifications')}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={channelStats?.statistics?.push?.delivery_rate || 0} 
                        sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                      />
                      <Typography variant="body2">
                        {Math.round(channelStats?.statistics?.push?.delivery_rate || 0)}%
                      </Typography>
                    </Box>
                  </Box>

                  <Button
                    size="small"
                    onClick={() => navigate('/admin/notifications/channels')}
                    sx={{ mt: 2 }}
                  >
                    {t('forms.dashboard.notificationStats.manageChannels')}
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        )}

        {/* Топ сервисных точек */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🏢 {t('forms.dashboard.topServicePoints.title')}
              </Typography>
              <List dense>
                {topServicePoints.map((sp, index) => (
                  <ListItem key={sp.id} divider={index < topServicePoints.length - 1}>
                    <ListItemIcon>
                      <LocationIcon color={index === 0 ? 'primary' : 'action'} />
                    </ListItemIcon>
                    <ListItemText
                      primary={sp.name}
                      secondary={`${sp.bookingsCount} ${t('forms.dashboard.topServicePoints.bookings')}`}
                    />
                    {index === 0 && (
                      <Chip label="🏆 {t('forms.dashboard.topServicePoints.leader')}" size="small" color="primary" />
                    )}
                  </ListItem>
                ))}
              </List>
              <Button
                size="small"
                onClick={() => navigate('/admin/service-points')}
                sx={{ mt: 1 }}
              >
                {t('forms.dashboard.topServicePoints.allServicePoints')}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Аналитика контента */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📊 {t('forms.dashboard.contentAnalytics.title')}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="primary">
                      {articlesAnalytics.published}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('forms.dashboard.contentAnalytics.articlesPublished')}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="warning.main">
                      {articlesAnalytics.draft}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('forms.dashboard.contentAnalytics.draftArticles')}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="success.main">
                      {seoAnalytics?.data?.good_pages || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('forms.dashboard.contentAnalytics.seoOptimized')}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="error.main">
                      {seoAnalytics?.data?.error_pages || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('forms.dashboard.contentAnalytics.requiresAttention')}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  onClick={() => navigate('/admin/articles')}
                >
                  {t('forms.dashboard.contentAnalytics.manageArticles')}
                </Button>
                <Button
                  size="small"
                  onClick={() => navigate('/admin/seo')}
                >
                  {t('forms.dashboard.contentAnalytics.seoManagement')}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Критические уведомления */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                ⚠️ {t('forms.dashboard.criticalNotifications.title')}
              </Typography>
              <List dense>
                {reviewsAnalytics.pending > 0 && (
                  <ListItem>
                    <ListItemIcon>
                      <ReviewIcon color="warning" />
                    </ListItemIcon>
                    <ListItemText
                      primary={`${reviewsAnalytics.pending} ${t('forms.dashboard.criticalNotifications.reviewsPending')}`}
                      secondary={t('forms.dashboard.criticalNotifications.reviewsPendingDescription')}
                    />
                  </ListItem>
                )}
                {(conflictStats?.statistics?.total_pending || 0) > 0 && (
                  <ListItem>
                    <ListItemIcon>
                      <WarningIcon color="error" />
                    </ListItemIcon>
                    <ListItemText
                      primary={`${conflictStats?.statistics?.total_pending || 0} ${t('forms.dashboard.criticalNotifications.bookingConflicts')}`}
                      secondary={t('forms.dashboard.criticalNotifications.bookingConflictsDescription')}
                    />
                  </ListItem>
                )}
                {articlesAnalytics.draft > 0 && (
                  <ListItem>
                    <ListItemIcon>
                      <ArticleIcon color="info" />
                    </ListItemIcon>
                    <ListItemText
                      primary={`${articlesAnalytics.draft} ${t('forms.dashboard.criticalNotifications.draftArticles')}`}
                      secondary={t('forms.dashboard.criticalNotifications.draftArticlesDescription')}
                    />
                  </ListItem>
                )}
                {(seoAnalytics?.data?.error_pages || 0) > 0 && (
                  <ListItem>
                    <ListItemIcon>
                      <SeoIcon color="error" />
                    </ListItemIcon>
                    <ListItemText
                      primary={`${seoAnalytics?.data?.error_pages} ${t('forms.dashboard.criticalNotifications.seoPagesWithIssues')}`}
                      secondary={t('forms.dashboard.criticalNotifications.seoPagesWithIssuesDescription')}
                    />
                  </ListItem>
                )}
              </List>
              {reviewsAnalytics.pending === 0 && 
               (conflictStats?.statistics?.total_pending || 0) === 0 && 
               articlesAnalytics.draft === 0 && 
               (seoAnalytics?.data?.error_pages || 0) === 0 && (
                <Box textAlign="center" py={2}>
                  <Typography variant="body2" color="success.main">
                    ✅ {t('forms.dashboard.criticalNotifications.allGood')}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage; 