import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ClientNavigation from '../../components/client/ClientNavigation';
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Chip,
  Avatar,
  Rating,
  InputAdornment,
  Autocomplete,
  Fade,
  useTheme,
  AppBar,
  Toolbar,
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  LocationOn as LocationIcon,
  Build as BuildIcon,
  Speed as SpeedIcon,
  Schedule as ScheduleIcon,
  Star as StarIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  TireRepair as TireIcon,
  DirectionsCar as CarIcon,
  Assessment as AssessmentIcon,
  Article as ArticleIcon,
  BookOnline as BookIcon,
  Map as MapIcon,
  Person as PersonIcon,
  Login as LoginIcon,
  Menu as MenuIcon,
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  Telegram as TelegramIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';

// Импорт централизованной системы стилей
import { 
  getCardStyles, 
  getButtonStyles, 
  getTextFieldStyles,
  SIZES,
  getThemeColors,
  ANIMATIONS
} from '../../styles';

// Импорт API для работы с контентом
import { useGetPageContentsQuery } from '../../api/pageContent.api';
import { useGetCitiesWithServicePointsQuery } from '../../api/cities.api';
import { useGetFeaturedArticlesQuery } from '../../api/articles.api';

const ClientMainPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const colors = getThemeColors(theme);
  
  const cardStyles = getCardStyles(theme, 'primary');
  const buttonStyles = getButtonStyles(theme, 'primary');
  const secondaryButtonStyles = getButtonStyles(theme, 'secondary');
  const textFieldStyles = getTextFieldStyles(theme, 'filled');
  
  // Состояние для поиска
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string | null>('Київ');
  
  // Получаем контент страницы из API
  const { data: pageContentData, isLoading: contentLoading, refetch } = useGetPageContentsQuery({
    section: 'client_main'
  }, {
    refetchOnMountOrArgChange: true, // Принудительное обновление при монтировании
    refetchOnFocus: true, // Обновление при фокусе на окне
  });
  
  const { data: citiesData } = useGetCitiesWithServicePointsQuery();
  const { data: articlesData } = useGetFeaturedArticlesQuery();
  
  const pageContent = pageContentData?.data || [];
  
  // Отладочная информация (только в режиме разработки)
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 ClientMainPage Debug Info:');
    console.log('📊 Page Content Data:', pageContentData);
    console.log('📋 Page Content Array:', pageContent);
    console.log('🔢 Content Count:', pageContent.length);
    console.log('🎯 Services Content:', pageContent.filter(item => item.content_type === 'service'));
    console.log('📰 Articles Content:', pageContent.filter(item => item.content_type === 'article'));
    console.log('🎪 Hero Content:', pageContent.find(item => item.content_type === 'hero'));
    console.log('📢 CTA Content:', pageContent.find(item => item.content_type === 'cta'));
  }
  
  // Получаем контент по типам
  const heroContent = pageContent.find(item => item.content_type === 'hero');
  const citiesContent = pageContent.find(item => item.content_type === 'text_block' && item.settings?.type === 'cities_list');
  const servicesContent = pageContent.filter(item => item.content_type === 'service');
  const articlesContent = pageContent.filter(item => item.content_type === 'article');
  const ctaContent = pageContent.find(item => item.content_type === 'cta');
  const footerContent = pageContent.find(item => item.content_type === 'text_block' && item.settings?.type === 'footer');
  
  // Украинские города (fallback если нет в API)
  const cities = citiesContent?.content?.split(',') || [
    'Київ', 'Харків', 'Одеса', 'Дніпро', 'Запоріжжя', 'Львів', 'Кривий Ріг', 'Миколаїв'
  ];
  
  // Популярные услуги (fallback если нет в API)
  const popularServices = servicesContent.length > 0 ? servicesContent : [
    {
      id: 1,
      title: 'Заміна шин',
      settings: { price: 'від 150 ₴', duration: '30 хв', icon: 'tire' },
      content: 'Професійна заміна літніх та зимових шин'
    },
    {
      id: 2,
      title: 'Балансування коліс',
      settings: { price: 'від 80 ₴', duration: '15 хв', icon: 'balance' },
      content: 'Усунення вібрації та нерівномірного зносу'
    },
    {
      id: 3,
      title: 'Ремонт проколів',
      settings: { price: 'від 100 ₴', duration: '20 хв', icon: 'repair' },
      content: 'Швидкий та якісний ремонт проколів'
    },
    {
      id: 4,
      title: 'Шиномонтаж',
      settings: { price: 'від 120 ₴', duration: '25 хв', icon: 'mount' },
      content: 'Зняття та встановлення шин на диски'
    }
  ];
  
  // Ближайшие сервисы (украинские)
  const nearbyServices = [
    {
      id: 1,
      name: 'ШинМайстер Центр',
      address: 'вул. Хрещатик, 15',
      rating: 4.8,
      reviews: 156,
      distance: '0.8 км',
      workingHours: '08:00 - 20:00',
      phone: '+380 (44) 123-45-67',
      services: ['Заміна шин', 'Балансування', 'Ремонт']
    },
    {
      id: 2,
      name: 'Швидкий Шиномонтаж',
      address: 'просп. Перемоги, 42',
      rating: 4.6,
      reviews: 98,
      distance: '1.2 км',
      workingHours: '09:00 - 19:00',
      phone: '+380 (44) 987-65-43',
      services: ['Шиномонтаж', 'Діагностика', 'Зберігання']
    },
    {
      id: 3,
      name: 'ПрофіШина',
      address: 'вул. Незалежності, 8',
      rating: 4.9,
      reviews: 203,
      distance: '1.5 км',
      workingHours: '07:00 - 21:00',
      phone: '+380 (44) 456-78-90',
      services: ['Заміна шин', 'Ремонт', 'Балансування']
    }
  ];
  
  // Последние статьи из базы знаний (fallback если нет в API)
  const recentArticles = articlesContent.length > 0 ? articlesContent : [
    {
      id: 1,
      title: 'Як вибрати зимові шини',
      content: 'Детальний посібник з вибору зимових шин для безпечної їзди',
      settings: { read_time: '5 хв', author: 'Експерт з шин' }
    },
    {
      title: 'Правильний тиск у шинах',
      content: 'Вплив тиску на безпеку та витрату палива',
      settings: { read_time: '3 хв', author: 'Технічний спеціаліст' }
    },
    {
      title: 'Сезонне зберігання шин',
      content: 'Як правильно зберігати шини в міжсезоння',
      settings: { read_time: '4 хв', author: 'Майстер сервісу' }
    }
  ];

  const handleSearch = () => {
    navigate(`/client/search?city=${selectedCity}&query=${searchQuery}`);
  };

  const getServiceIcon = (iconType: string) => {
    switch (iconType) {
      case 'tire': return <TireIcon />;
      case 'balance': return <SpeedIcon />;
      case 'repair': return <BuildIcon />;
      case 'mount': return <CarIcon />;
      default: return <TireIcon />;
    }
  };

  // Используем данные из API или fallback
  const currentHero = heroContent || {
    title: 'Знайдіть найкращий шиномонтаж поруч з вами',
    content: 'Швидке бронювання, перевірені майстри, гарантія якості',
    settings: {
      subtitle: 'Швидке бронювання, перевірені майстри, гарантія якості',
      button_text: 'Знайти',
      search_placeholder: 'Знайти сервіс або послугу',
      city_placeholder: 'Місто'
    }
  };

  const currentServices = servicesContent.length > 0 
    ? servicesContent.map(s => ({ ...s, dynamic_data: s.dynamic_data }))
    : popularServices;
  
  // Для городов используем автоматические данные из API или fallback
  const currentCities = citiesData?.data || [
    { name: 'Київ', service_points_count: 15 },
    { name: 'Харків', service_points_count: 8 },
    { name: 'Одеса', service_points_count: 6 },
    { name: 'Львів', service_points_count: 5 },
    { name: 'Дніпро', service_points_count: 4 },
    { name: 'Запоріжжя', service_points_count: 3 }
  ];
  
  // Для статей используем автоматические данные из API или fallback
  const currentArticles = articlesData?.data || [
    {
      title: 'Як вибрати зимові шини',
      excerpt: 'Детальний посібник з вибору зимових шин для безпечної їзди',
      reading_time: 5,
      author: 'Експерт з шин'
    },
    {
      title: 'Правильний тиск у шинах',
      excerpt: 'Вплив тиску на безпеку та витрату палива',
      reading_time: 3,
      author: 'Технічний спеціаліст'
    },
    {
      title: 'Сезонне зберігання шин',
      excerpt: 'Як правильно зберігати шини в міжсезоння',
      reading_time: 4,
      author: 'Майстер сервісу'
    }
  ];

  if (contentLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <Typography>Завантаження...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: colors.backgroundPrimary }}>
      {/* Новая навигация */}
      <ClientNavigation colors={colors} secondaryButtonStyles={secondaryButtonStyles} />

      {/* Hero секция */}
      <Fade in timeout={500}>
        <Box sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          py: 8,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 30% 70%, rgba(255,255,255,0.1) 0%, transparent 50%)',
            pointerEvents: 'none'
          }
        }}>
          <Container maxWidth="lg">
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={6}>
                <Typography variant="h2" sx={{ fontWeight: 700, mb: 2, fontSize: { xs: '2.5rem', md: '3.5rem' } }}>
                  {currentHero.title}
                </Typography>
                <Typography variant="h6" sx={{ mb: 4, opacity: 0.9, lineHeight: 1.6 }}>
                  {currentHero.settings?.subtitle || currentHero.content}
                </Typography>
                
                {/* Поиск */}
                <Paper sx={{ p: 2, borderRadius: SIZES.borderRadius.lg }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={4}>
                      <Autocomplete
                        value={selectedCity}
                        onChange={(event, newValue) => setSelectedCity(newValue)}
                        options={cities}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label={currentHero.settings?.city_placeholder || 'Місто'}
                            fullWidth
                            InputProps={{
                              ...params.InputProps,
                              startAdornment: <LocationIcon sx={{ mr: 1, color: colors.textSecondary }} />
                            }}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label={currentHero.settings?.search_placeholder || 'Знайти сервіс або послугу'}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <SearchIcon />
                            </InputAdornment>
                          )
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        onClick={handleSearch}
                        sx={{ 
                          ...buttonStyles, 
                          height: 56,
                          bgcolor: theme.palette.primary.main,
                          '&:hover': { bgcolor: theme.palette.primary.dark }
                        }}
                      >
                        {currentHero.settings?.button_text || 'Знайти'}
                      </Button>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center',
                  '& > *': { fontSize: { xs: '8rem', md: '12rem' } }
                }}>
                  🚗
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Box>
      </Fade>

      {/* Популярные услуги */}
      <Fade in timeout={700}>
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Typography variant="h3" sx={{ 
            textAlign: 'center', 
            mb: 6, 
            fontWeight: 700,
            color: colors.textPrimary 
          }}>
            🔧 Популярні послуги
          </Typography>
          
          <Grid container spacing={3}>
            {currentServices.map((service, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Fade in timeout={800 + index * 100}>
                  <Card sx={{ 
                    ...cardStyles, 
                    height: '100%',
                    cursor: 'pointer',
                    transition: ANIMATIONS.transition.medium,
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[4]
                    }
                  }}>
                    <CardContent sx={{ textAlign: 'center', p: 3 }}>
                      <Box sx={{ 
                        color: theme.palette.primary.main, 
                        fontSize: 48, 
                        mb: 2,
                        display: 'flex',
                        justifyContent: 'center'
                      }}>
                        {getServiceIcon(service.settings?.icon || 'tire')}
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: colors.textPrimary }}>
                        {service.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 2 }}>
                        {service.content}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                          {service.settings?.price}
                        </Typography>
                        <Chip 
                          icon={<ScheduleIcon />} 
                          label={service.settings?.duration} 
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                      <Button 
                        variant="contained" 
                        sx={buttonStyles}
                        onClick={() => navigate('/client/booking', { state: { service } })}
                      >
                        Записатися
                      </Button>
                    </CardActions>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Fade>

      {/* Ближайшие сервисы */}
      <Box sx={{ bgcolor: colors.backgroundSecondary, py: 8 }}>
        <Container maxWidth="lg">
          <Fade in timeout={900}>
            <Box>
              <Typography variant="h3" sx={{ 
                textAlign: 'center', 
                mb: 6, 
                fontWeight: 700,
                color: colors.textPrimary 
              }}>
                📍 Найближчі сервіси
              </Typography>
              
              <Grid container spacing={3}>
                {currentCities.slice(0, 6).map((city, index) => (
                  <Grid item xs={12} md={4} key={index}>
                    <Fade in timeout={1000 + index * 100}>
                      <Card sx={{ 
                        ...cardStyles, 
                        height: '100%',
                        cursor: 'pointer',
                        transition: ANIMATIONS.transition.medium,
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: theme.shadows[3]
                        }
                      }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: colors.textPrimary }}>
                              {city.name}
                            </Typography>
                            <Chip label={city.service_points_count} size="small" color="primary" />
                          </Box>
                        </CardContent>
                        
                        <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                          <Button 
                            size="small" 
                            startIcon={<PhoneIcon />}
                            sx={{ color: colors.textSecondary }}
                          >
                            Подзвонити
                          </Button>
                          <Button 
                            variant="contained" 
                            size="small"
                            sx={buttonStyles}
                            onClick={() => navigate('/client/booking', { state: { servicePoint: city } })}
                          >
                            Записатися
                          </Button>
                        </CardActions>
                      </Card>
                    </Fade>
                  </Grid>
                ))}
              </Grid>
              
              <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Button 
                  variant="outlined" 
                  size="large"
                  startIcon={<MapIcon />}
                  sx={secondaryButtonStyles}
                  onClick={() => navigate('/client/search')}
                >
                  Показати всі на карті
                </Button>
              </Box>
            </Box>
          </Fade>
        </Container>
      </Box>

      {/* База знаний */}
      <Fade in timeout={1100}>
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Typography variant="h3" sx={{ 
            textAlign: 'center', 
            mb: 6, 
            fontWeight: 700,
            color: colors.textPrimary 
          }}>
            📚 Корисні статті
          </Typography>
          
          <Grid container spacing={3}>
            {currentArticles.slice(0, 3).map((article, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Fade in timeout={1200 + index * 100}>
                  <Card sx={{ 
                    ...cardStyles, 
                    height: '100%',
                    cursor: 'pointer',
                    transition: ANIMATIONS.transition.medium,
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: theme.shadows[3]
                    }
                  }}>
                    <Box sx={{ 
                      height: 200, 
                      bgcolor: colors.backgroundField,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '4rem'
                    }}>
                      📖
                    </Box>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: colors.textPrimary }}>
                        {article.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 2 }}>
                        {article.excerpt}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                          {typeof article.author === 'string' ? article.author : article.author?.name || 'Неизвестный автор'}
                        </Typography>
                        <Chip label={`${article.reading_time || 5} мин`} size="small" variant="outlined" />
                      </Box>
                    </CardContent>
                    <CardActions>
                      <Button 
                        size="small" 
                        sx={{ color: theme.palette.primary.main }}
                        onClick={() => navigate(`/knowledge-base/${index}`)}
                      >
                        Читати далі
                      </Button>
                    </CardActions>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
          
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button 
              variant="outlined" 
              size="large"
              startIcon={<ArticleIcon />}
              sx={secondaryButtonStyles}
              onClick={() => navigate('/knowledge-base')}
            >
              Всі статті
            </Button>
          </Box>
        </Container>
      </Fade>

      {/* CTA секция */}
      <Box sx={{
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        color: 'white',
        py: 6
      }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
              {ctaContent?.title || 'Готові записатися на обслуговування?'}
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
              {ctaContent?.content || 'Оберіть зручний час та найближчий сервіс'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button 
                variant="contained" 
                size="large"
                startIcon={<BookIcon />}
                sx={{ 
                  bgcolor: 'white', 
                  color: theme.palette.primary.main,
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
                }}
                onClick={() => navigate('/client/booking')}
              >
                {ctaContent?.settings?.primary_button_text || 'Записатися онлайн'}
              </Button>
              <Button 
                variant="outlined" 
                size="large"
                startIcon={<PersonIcon />}
                sx={{ 
                  borderColor: 'white', 
                  color: 'white',
                  '&:hover': { 
                    borderColor: 'white', 
                    bgcolor: 'rgba(255,255,255,0.1)' 
                  }
                }}
                onClick={() => navigate('/client/profile')}
              >
                {ctaContent?.settings?.secondary_button_text || 'Особистий кабінет'}
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Футер */}
      <Box sx={{ bgcolor: colors.backgroundCard, py: 4, borderTop: `1px solid ${colors.borderPrimary}` }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: colors.textPrimary }}>
                {footerContent?.title || '🚗 Твоя Шина'}
              </Typography>
              <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 2 }}>
                {footerContent?.content || 'Знайдіть найкращий шиномонтаж поруч з вами. Швидке бронювання, перевірені майстри.'}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton size="small">
                  <PhoneIcon />
                </IconButton>
                <IconButton size="small">
                  <EmailIcon />
                </IconButton>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: colors.textPrimary }}>
                Послуги
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {(footerContent?.settings?.services_links || ['Заміна шин', 'Балансування', 'Ремонт проколів']).map((link: string) => (
                  <Link key={link} to="/client/services" style={{ color: colors.textSecondary, textDecoration: 'none' }}>
                    {link}
                  </Link>
                ))}
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: colors.textPrimary }}>
                Інформація
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {(footerContent?.settings?.info_links || ['База знань', 'Особистий кабінет', 'Для бізнесу']).map((link: string, index: number) => {
                  const routes = ['/knowledge-base', '/client/profile', '/login'];
                  return (
                    <Link key={link} to={routes[index]} style={{ color: colors.textSecondary, textDecoration: 'none' }}>
                      {link}
                    </Link>
                  );
                })}
              </Box>
            </Grid>
          </Grid>
          
          <Box sx={{ 
            textAlign: 'center', 
            mt: 4, 
            pt: 4, 
            borderTop: `1px solid ${colors.borderPrimary}` 
          }}>
            <Typography variant="body2" sx={{ color: colors.textSecondary }}>
              {footerContent?.settings?.copyright || '© 2024 Твоя Шина. Всі права захищені.'}
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default ClientMainPage; 