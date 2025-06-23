import React, { useState, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Breadcrumbs,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Chip,
  CircularProgress,
  Alert,
  Rating,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  Collapse
} from '@mui/material';
import { 
  Home as HomeIcon, 
  NavigateNext as NavigateNextIcon, 
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Schedule as ScheduleIcon,
  Build as BuildIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CalendarToday as CalendarIcon,
  BookOnline as BookIcon
} from '@mui/icons-material';
import { getButtonStyles, getThemeColors, getCardStyles } from '../../styles';
import { useTheme } from '@mui/material';
import ClientNavigation from '../../components/client/ClientNavigation';
import { useSearchServicePointsQuery, useGetServicePointServicesQuery } from '../../api/servicePoints.api';

// Интерфейс для сервисной точки из API поиска
interface SearchServicePoint {
  id: number;
  name: string;
  address: string;
  city: {
    id: number;
    name: string;
    region: string;
  };
  partner: {
    id: number;
    name: string;
  };
  contact_phone?: string;
  average_rating?: string | number;
  reviews_count?: number;
  posts_count?: number;
  work_status: string;
  distance?: number;
}

// Интерфейс для услуги
interface ServicePointService {
  id: number;
  service_id: number;
  name: string;
  description?: string;
  price: number;
  duration: number;
  is_available?: boolean;
}

// Интерфейс для расписания
interface WorkingSchedule {
  day: string;
  time: string;
  isWorkingDay: boolean;
}

// Компонент карточки сервисной точки
const ServicePointCard: React.FC<{ servicePoint: SearchServicePoint }> = ({ servicePoint }) => {
  const theme = useTheme();
  const colors = getThemeColors(theme);
  const cardStyles = getCardStyles(theme, 'primary');
  const navigate = useNavigate();
  
  const [showDetails, setShowDetails] = useState(false);
  const [servicesExpanded, setServicesExpanded] = useState(false);
  const [scheduleExpanded, setScheduleExpanded] = useState(false);

  // Загружаем реальные услуги для сервисной точки
  const { 
    data: servicesData, 
    isLoading: servicesLoading 
  } = useGetServicePointServicesQuery(servicePoint.id.toString(), {
    skip: !showDetails // Загружаем только при развертывании деталей
  });

  // Преобразуем данные услуг
  const services: ServicePointService[] = (servicesData || []).map(service => ({
    id: service.id,
    service_id: service.service_id,
    name: service.name,
    description: service.description,
    price: service.current_price || service.price || 0,
    duration: service.duration || service.default_duration || 0,
    is_available: service.is_available
  }));

  // Заглушка для расписания (TODO: интегрировать с API расписания)
  const mockSchedule: WorkingSchedule[] = [
    { day: 'Понеділок - П\'ятниця', time: '09:00 - 18:00', isWorkingDay: true },
    { day: 'Субота', time: '09:00 - 16:00', isWorkingDay: true },
    { day: 'Неділя', time: 'Вихідний', isWorkingDay: false }
  ];

  const handleBooking = () => {
    navigate('/client/booking/new-with-availability', { 
      state: { 
        servicePointId: servicePoint.id,
        servicePointName: servicePoint.name,
        cityId: servicePoint.city.id,
        cityName: servicePoint.city.name,
        partnerId: servicePoint.partner.id,
        partnerName: servicePoint.partner.name,
        step1Completed: true // Указываем, что данные для шага 1 уже заполнены
      } 
    });
  };

  return (
    <Card sx={{ 
      ...cardStyles, 
      mb: 3,
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: theme.shadows[4]
      }
    }}>
      {/* Заглушка для фото */}
      <CardMedia
        component="div"
        sx={{
          height: 200,
          background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '4rem'
        }}
      >
        🚗
      </CardMedia>

      <CardContent>
        {/* Основная информация */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: colors.textPrimary }}>
            {servicePoint.name}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <LocationIcon sx={{ color: colors.textSecondary, fontSize: '1.2rem' }} />
            <Typography variant="body2" sx={{ color: colors.textSecondary }}>
              {servicePoint.address}, {servicePoint.city.name}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Rating 
                value={servicePoint.average_rating ? parseFloat(String(servicePoint.average_rating)) : 0} 
                readOnly 
                size="small" 
                precision={0.1}
              />
              <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                ({servicePoint.reviews_count} відгуків)
              </Typography>
            </Box>
            
            <Chip 
              label={servicePoint.work_status} 
              size="small" 
              color={servicePoint.work_status.toLowerCase().includes('работает') || servicePoint.work_status.toLowerCase() === 'working' ? 'success' : 'default'}
              variant="outlined"
            />
          </Box>

          {/* Партнер */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Avatar sx={{ width: 24, height: 24, fontSize: '0.8rem' }}>
              {servicePoint.partner.name.charAt(0)}
            </Avatar>
            <Typography variant="body2" sx={{ color: colors.textSecondary }}>
              {servicePoint.partner.name}
            </Typography>
          </Box>

          {/* Контактный телефон */}
          {servicePoint.contact_phone && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PhoneIcon sx={{ color: colors.textSecondary, fontSize: '1.2rem' }} />
              <Typography variant="body2" sx={{ color: colors.textPrimary }}>
                {servicePoint.contact_phone}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Детальная информация (свернуто по умолчанию) */}
        <Collapse in={showDetails}>
          <Divider sx={{ my: 2 }} />
          
          {/* Услуги */}
          <Paper sx={{ p: 2, mb: 2, bgcolor: colors.backgroundField }}>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                cursor: 'pointer' 
              }}
              onClick={() => setServicesExpanded(!servicesExpanded)}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BuildIcon sx={{ color: theme.palette.primary.main }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Послуги ({servicesLoading ? '...' : services.length})
                </Typography>
              </Box>
              {servicesExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </Box>
            
            <Collapse in={servicesExpanded}>
              {servicesLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : services.length > 0 ? (
                <List dense sx={{ mt: 1 }}>
                  {services.map((service) => (
                    <ListItem key={service.id} sx={{ py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <BuildIcon sx={{ fontSize: '1rem', color: colors.textSecondary }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={service.name}
                        secondary={`${service.price > 0 ? `${service.price} грн` : 'Цена по запросу'} • ${service.duration > 0 ? `${service.duration} хв` : 'Время уточняется'}`}
                        primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" sx={{ mt: 1, color: colors.textSecondary }}>
                  Услуги не загружены
                </Typography>
              )}
            </Collapse>
          </Paper>

          {/* Расписание работы */}
          <Paper sx={{ p: 2, bgcolor: colors.backgroundField }}>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                cursor: 'pointer' 
              }}
              onClick={() => setScheduleExpanded(!scheduleExpanded)}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ScheduleIcon sx={{ color: theme.palette.primary.main }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Графік роботи
                </Typography>
              </Box>
              {scheduleExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </Box>
            
            <Collapse in={scheduleExpanded}>
              <List dense sx={{ mt: 1 }}>
                {mockSchedule.map((schedule, index) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CalendarIcon 
                        sx={{ 
                          fontSize: '1rem', 
                          color: schedule.isWorkingDay ? theme.palette.success.main : colors.textSecondary 
                        }} 
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={schedule.day}
                      secondary={schedule.time}
                      primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                      secondaryTypographyProps={{ 
                        variant: 'caption',
                        color: schedule.isWorkingDay ? 'inherit' : 'error'
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Collapse>
          </Paper>
        </Collapse>
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          size="small"
          onClick={() => setShowDetails(!showDetails)}
          sx={{ color: colors.textSecondary }}
        >
          {showDetails ? 'Згорнути' : 'Детальніше'}
        </Button>
        
        <Box sx={{ flexGrow: 1 }} />
        
        <Button
          variant="contained"
          size="small"
          startIcon={<BookIcon />}
          onClick={handleBooking}
          sx={{ 
            bgcolor: theme.palette.primary.main,
            '&:hover': { bgcolor: theme.palette.primary.dark }
          }}
        >
          Записатися
        </Button>
      </CardActions>
    </Card>
  );
};

const ClientSearchPage: React.FC = () => {
  const theme = useTheme();
  const colors = getThemeColors(theme);
  const secondaryButtonStyles = getButtonStyles(theme, 'secondary');
  const location = useLocation();

  // Получаем параметры поиска из URL
  const searchParams = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return {
      city: params.get('city') || '',
      query: params.get('query') || ''
    };
  }, [location.search]);

  // Запрос к API для поиска сервисных точек
  const { 
    data: searchResult, 
    isLoading, 
    error 
  } = useSearchServicePointsQuery(
    { 
      city: searchParams.city,
      query: searchParams.query 
    },
    { skip: !searchParams.city } // Пропускаем запрос, если нет города
  );

  // Адаптируем данные из API к локальному интерфейсу
  const servicePoints: SearchServicePoint[] = (searchResult?.data || []).map(point => {
    // Отладочный вывод для проверки статуса
    console.log(`ServicePoint ${point.id} - ${point.name}:`, {
      is_active: point.is_active,
      work_status: point.work_status
    });
    
    return {
      id: point.id,
      name: point.name,
      address: point.address,
      city: {
        id: point.city?.id || 0,
        name: point.city?.name || '',
        region: point.city?.region?.name || ''
      },
      partner: {
        id: point.partner?.id || 0,
        name: point.partner?.company_name || point.partner?.name || ''
      },
      contact_phone: point.contact_phone,
      average_rating: 4.0, // Заглушка для рейтинга
      reviews_count: 0, // Заглушка для количества отзывов
      posts_count: point.post_count,
      work_status: point.work_status,
      distance: undefined // Пока не используется расстояние
    };
  });
  const totalFound = searchResult?.total || 0;
  const cityFound = searchResult?.city_found ?? true;

  // Обработка состояния загрузки
  if (isLoading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: colors.backgroundPrimary }}>
        <ClientNavigation colors={colors} secondaryButtonStyles={secondaryButtonStyles} />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
            <CircularProgress size={60} />
            <Typography variant="h6" sx={{ ml: 2, color: colors.textSecondary }}>
              Пошук сервісних точок...
            </Typography>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: colors.backgroundPrimary }}>
      <ClientNavigation colors={colors} secondaryButtonStyles={secondaryButtonStyles} />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 4 }}>
          <Link 
            to="/client" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              color: colors.textSecondary, 
              textDecoration: 'none' 
            }}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Головна
          </Link>
          <Typography sx={{ color: colors.textPrimary }}>
            Результати пошуку
          </Typography>
        </Breadcrumbs>

        {/* Заголовок результатов */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: colors.textPrimary }}>
            🔍 Результати пошуку
          </Typography>
          
          {searchParams.city && (
            <Typography variant="h6" sx={{ color: colors.textSecondary, mb: 2 }}>
              Сервісні точки в місті "{searchParams.city}"
              {searchParams.query && ` за запитом "${searchParams.query}"`}
            </Typography>
          )}

          {/* Статистика и кнопка возврата */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <Chip 
                label={`Знайдено: ${totalFound}`} 
                color="primary" 
                variant="outlined" 
              />
              {cityFound && searchParams.city && (
                <Chip 
                  label={`Місто знайдено`} 
                  color="success" 
                  size="small" 
                  variant="outlined" 
                />
              )}
            </Box>
            
            <Button
              variant="outlined"
              startIcon={<HomeIcon />}
              component={Link}
              to="/client"
              sx={secondaryButtonStyles}
            >
              На головну
            </Button>
          </Box>
        </Box>

        {/* Обработка ошибок */}
        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            Помилка завантаження даних. Спробуйте пізніше.
          </Alert>
        )}

        {/* Случай, когда город не найден */}
        {!cityFound && searchParams.city && (
          <Alert severity="warning" sx={{ mb: 4 }}>
            Місто "{searchParams.city}" не знайдено або в ньому немає сервісних точок.
          </Alert>
        )}

        {/* Результаты поиска */}
        {servicePoints.length === 0 && !isLoading && !error ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" sx={{ color: colors.textSecondary, mb: 2 }}>
              😔 Сервісні точки не знайдені
            </Typography>
            <Typography variant="body1" sx={{ color: colors.textSecondary, mb: 4 }}>
              Спробуйте змінити параметри пошуку або оберіть інше місто
            </Typography>
            <Button 
              variant="outlined" 
              component={Link} 
              to="/client" 
              sx={secondaryButtonStyles}
            >
              Повернутися на головну
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {servicePoints.map((servicePoint) => (
              <Grid item xs={12} md={6} lg={4} key={servicePoint.id}>
                <ServicePointCard servicePoint={servicePoint} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default ClientSearchPage;