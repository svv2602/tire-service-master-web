import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  Badge
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
  Menu as MenuIcon
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
  const [selectedCity, setSelectedCity] = useState<string | null>('Москва');
  
  // Тестовые данные городов
  const cities = [
    'Москва', 'Санкт-Петербург', 'Новосибирск', 'Екатеринбург', 
    'Казань', 'Нижний Новгород', 'Челябинск', 'Самара'
  ];
  
  // Популярные услуги
  const popularServices = [
    {
      id: 1,
      title: 'Замена шин',
      price: 'от 500 ₽',
      duration: '30 мин',
      icon: <TireIcon />,
      description: 'Профессиональная замена летних и зимних шин'
    },
    {
      id: 2,
      title: 'Балансировка колес',
      price: 'от 200 ₽',
      duration: '15 мин',
      icon: <SpeedIcon />,
      description: 'Устранение вибрации и неравномерного износа'
    },
    {
      id: 3,
      title: 'Ремонт проколов',
      price: 'от 300 ₽',
      duration: '20 мин',
      icon: <BuildIcon />,
      description: 'Быстрый и качественный ремонт проколов'
    },
    {
      id: 4,
      title: 'Шиномонтаж',
      price: 'от 400 ₽',
      duration: '25 мин',
      icon: <CarIcon />,
      description: 'Снятие и установка шин на диски'
    }
  ];
  
  // Ближайшие сервисы (тестовые данные)
  const nearbyServices = [
    {
      id: 1,
      name: 'ШинМастер Центр',
      address: 'ул. Ленина, 15',
      rating: 4.8,
      reviews: 156,
      distance: '0.8 км',
      workingHours: '08:00 - 20:00',
      phone: '+7 (495) 123-45-67',
      services: ['Замена шин', 'Балансировка', 'Ремонт']
    },
    {
      id: 2,
      name: 'Быстрый Шиномонтаж',
      address: 'пр. Мира, 42',
      rating: 4.6,
      reviews: 98,
      distance: '1.2 км',
      workingHours: '09:00 - 19:00',
      phone: '+7 (495) 987-65-43',
      services: ['Шиномонтаж', 'Диагностика', 'Хранение']
    },
    {
      id: 3,
      name: 'ПрофиШина',
      address: 'ул. Советская, 8',
      rating: 4.9,
      reviews: 203,
      distance: '1.5 км',
      workingHours: '07:00 - 21:00',
      phone: '+7 (495) 456-78-90',
      services: ['Замена шин', 'Ремонт', 'Балансировка']
    }
  ];
  
  // Последние статьи из базы знаний
  const recentArticles = [
    {
      id: 1,
      title: 'Как выбрать зимние шины',
      excerpt: 'Подробное руководство по выбору зимних шин для безопасной езды',
      image: '/images/winter-tires.jpg',
      readTime: '5 мин',
      author: 'Эксперт по шинам'
    },
    {
      id: 2,
      title: 'Правильное давление в шинах',
      excerpt: 'Влияние давления на безопасность и расход топлива',
      image: '/images/tire-pressure.jpg',
      readTime: '3 мин',
      author: 'Технический специалист'
    },
    {
      id: 3,
      title: 'Сезонное хранение шин',
      excerpt: 'Как правильно хранить шины в межсезонье',
      image: '/images/tire-storage.jpg',
      readTime: '4 мин',
      author: 'Мастер сервиса'
    }
  ];

  const handleSearch = () => {
    navigate(`/client/search?city=${selectedCity}&query=${searchQuery}`);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: colors.backgroundPrimary }}>
      {/* Навигация */}
      <AppBar position="static" sx={{ bgcolor: colors.backgroundCard, boxShadow: 1 }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, color: colors.textPrimary, fontWeight: 700 }}>
            🚗 Твоя Шина
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button 
              color="inherit" 
              component={Link} 
              to="/knowledge-base"
              sx={{ color: colors.textSecondary }}
            >
              База знаний
            </Button>
            <Button 
              color="inherit" 
              component={Link} 
              to="/client/services"
              sx={{ color: colors.textSecondary }}
            >
              Услуги
            </Button>
            <Button 
              variant="outlined" 
              component={Link} 
              to="/login"
              startIcon={<LoginIcon />}
              sx={secondaryButtonStyles}
            >
              Войти
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

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
                  Найдите лучший шиномонтаж рядом с вами
                </Typography>
                <Typography variant="h6" sx={{ mb: 4, opacity: 0.9, lineHeight: 1.6 }}>
                  Быстрое бронирование, проверенные мастера, гарантия качества
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
                            label="Город"
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
                        label="Найти сервис или услугу"
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
                        Найти
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
            🔧 Популярные услуги
          </Typography>
          
          <Grid container spacing={3}>
            {popularServices.map((service, index) => (
              <Grid item xs={12} sm={6} md={3} key={service.id}>
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
                        {service.icon}
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: colors.textPrimary }}>
                        {service.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 2 }}>
                        {service.description}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                          {service.price}
                        </Typography>
                        <Chip 
                          icon={<ScheduleIcon />} 
                          label={service.duration} 
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
                        Записаться
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
                📍 Ближайшие сервисы
              </Typography>
              
              <Grid container spacing={3}>
                {nearbyServices.map((service, index) => (
                  <Grid item xs={12} md={4} key={service.id}>
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
                              {service.name}
                            </Typography>
                            <Chip label={service.distance} size="small" color="primary" />
                          </Box>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <LocationIcon sx={{ fontSize: 16, color: colors.textSecondary, mr: 1 }} />
                            <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                              {service.address}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Rating value={service.rating} precision={0.1} size="small" readOnly />
                            <Typography variant="body2" sx={{ ml: 1, color: colors.textSecondary }}>
                              {service.rating} ({service.reviews} отзывов)
                            </Typography>
                          </Box>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <ScheduleIcon sx={{ fontSize: 16, color: colors.textSecondary, mr: 1 }} />
                            <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                              {service.workingHours}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 1 }}>
                              Услуги:
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {service.services.map((srv) => (
                                <Chip key={srv} label={srv} size="small" variant="outlined" />
                              ))}
                            </Box>
                          </Box>
                        </CardContent>
                        
                        <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                          <Button 
                            size="small" 
                            startIcon={<PhoneIcon />}
                            sx={{ color: colors.textSecondary }}
                          >
                            Позвонить
                          </Button>
                          <Button 
                            variant="contained" 
                            size="small"
                            sx={buttonStyles}
                            onClick={() => navigate('/client/booking', { state: { servicePoint: service } })}
                          >
                            Записаться
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
                  Показать все на карте
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
            📚 Полезные статьи
          </Typography>
          
          <Grid container spacing={3}>
            {recentArticles.map((article, index) => (
              <Grid item xs={12} md={4} key={article.id}>
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
                          {article.author}
                        </Typography>
                        <Chip label={article.readTime} size="small" variant="outlined" />
                      </Box>
                    </CardContent>
                    <CardActions>
                      <Button 
                        size="small" 
                        sx={{ color: theme.palette.primary.main }}
                        onClick={() => navigate(`/knowledge-base/${article.id}`)}
                      >
                        Читать далее
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
              Все статьи
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
              Готовы записаться на обслуживание?
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
              Выберите удобное время и ближайший сервис
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
                Записаться онлайн
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
                Личный кабинет
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
                🚗 Твоя Шина
              </Typography>
              <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 2 }}>
                Найдите лучший шиномонтаж рядом с вами. Быстрое бронирование, проверенные мастера.
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
                Услуги
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Link to="/client/services" style={{ color: colors.textSecondary, textDecoration: 'none' }}>
                  Замена шин
                </Link>
                <Link to="/client/services" style={{ color: colors.textSecondary, textDecoration: 'none' }}>
                  Балансировка
                </Link>
                <Link to="/client/services" style={{ color: colors.textSecondary, textDecoration: 'none' }}>
                  Ремонт проколов
                </Link>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: colors.textPrimary }}>
                Информация
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Link to="/knowledge-base" style={{ color: colors.textSecondary, textDecoration: 'none' }}>
                  База знаний
                </Link>
                <Link to="/client/profile" style={{ color: colors.textSecondary, textDecoration: 'none' }}>
                  Личный кабинет
                </Link>
                <Link to="/login" style={{ color: colors.textSecondary, textDecoration: 'none' }}>
                  Для бизнеса
                </Link>
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
              © 2024 Твоя Шина. Все права защищены.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default ClientMainPage; 