import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ClientNavigation from '../../components/client/ClientNavigation';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Fade,
  useTheme,
  Breadcrumbs
} from '@mui/material';
import {
  Search as SearchIcon,
  TireRepair as TireIcon,
  Speed as SpeedIcon,
  Build as BuildIcon,
  DirectionsCar as CarIcon,
  Schedule as ScheduleIcon,
  AttachMoney as MoneyIcon,
  Star as StarIcon,
  NavigateNext as NavigateNextIcon,
  Home as HomeIcon
} from '@mui/icons-material';

import { 
  getCardStyles, 
  getButtonStyles, 
  getTextFieldStyles,
  SIZES,
  getThemeColors,
  ANIMATIONS
} from '../../styles';

const ClientServicesPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const colors = getThemeColors(theme);
  
  const cardStyles = getCardStyles(theme, 'primary');
  const buttonStyles = getButtonStyles(theme, 'primary');
  const secondaryButtonStyles = getButtonStyles(theme, 'secondary');
  const textFieldStyles = getTextFieldStyles(theme, 'filled');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceFilter, setPriceFilter] = useState('');
  
  // Категории услуг
  const categories = [
    { value: '', label: 'Все категории' },
    { value: 'mounting', label: 'Шиномонтаж' },
    { value: 'repair', label: 'Ремонт шин' },
    { value: 'balance', label: 'Балансировка' },
    { value: 'storage', label: 'Хранение' },
    { value: 'diagnostics', label: 'Диагностика' }
  ];
  
  // Услуги
  const services = [
    {
      id: 1,
      title: 'Замена шин легкового автомобиля',
      category: 'mounting',
      price: { min: 500, max: 800 },
      duration: '30-40 мин',
      description: 'Профессиональная замена летних и зимних шин на легковых автомобилях',
      features: ['Снятие старых шин', 'Установка новых', 'Проверка давления'],
      icon: <TireIcon />,
      rating: 4.8,
      popularity: 95
    },
    {
      id: 2,
      title: 'Балансировка колес',
      category: 'balance',
      price: { min: 200, max: 400 },
      duration: '15-25 мин',
      description: 'Устранение вибрации руля и неравномерного износа шин',
      features: ['Диагностика дисбаланса', 'Установка грузиков', 'Проверка результата'],
      icon: <SpeedIcon />,
      rating: 4.7,
      popularity: 88
    },
    {
      id: 3,
      title: 'Ремонт прокола шины',
      category: 'repair',
      price: { min: 300, max: 600 },
      duration: '20-30 мин',
      description: 'Быстрый и качественный ремонт проколов различной сложности',
      features: ['Поиск прокола', 'Заплатка или жгут', 'Проверка герметичности'],
      icon: <BuildIcon />,
      rating: 4.6,
      popularity: 75
    },
    {
      id: 4,
      title: 'Шиномонтаж грузового автомобиля',
      category: 'mounting',
      price: { min: 800, max: 1500 },
      duration: '45-60 мин',
      description: 'Монтаж и демонтаж шин для грузовых автомобилей',
      features: ['Работа с крупногабаритными шинами', 'Специальное оборудование'],
      icon: <CarIcon />,
      rating: 4.9,
      popularity: 60
    },
    {
      id: 5,
      title: 'Сезонное хранение шин',
      category: 'storage',
      price: { min: 2000, max: 4000 },
      duration: 'Сезон',
      description: 'Профессиональное хранение шин в оптимальных условиях',
      features: ['Климат-контроль', 'Маркировка', 'Страхование'],
      icon: <TireIcon />,
      rating: 4.5,
      popularity: 70
    },
    {
      id: 6,
      title: 'Диагностика ходовой части',
      category: 'diagnostics',
      price: { min: 1000, max: 2000 },
      duration: '30-45 мин',
      description: 'Комплексная проверка состояния подвески и шин',
      features: ['Визуальный осмотр', 'Компьютерная диагностика', 'Отчет'],
      icon: <BuildIcon />,
      rating: 4.4,
      popularity: 55
    }
  ];
  
  // Фильтрация услуг
  const filteredServices = services.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || service.category === selectedCategory;
    const matchesPrice = !priceFilter || 
      (priceFilter === 'low' && service.price.max <= 500) ||
      (priceFilter === 'medium' && service.price.min <= 1000 && service.price.max > 500) ||
      (priceFilter === 'high' && service.price.min > 1000);
    
    return matchesSearch && matchesCategory && matchesPrice;
  });

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: colors.backgroundPrimary }}>
      {/* Навигация */}
      <ClientNavigation colors={colors} secondaryButtonStyles={secondaryButtonStyles} />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Хлебные крошки */}
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 4 }}>
          <Link to="/client" style={{ display: 'flex', alignItems: 'center', color: colors.textSecondary, textDecoration: 'none' }}>
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Главная
          </Link>
          <Typography sx={{ color: colors.textPrimary }}>Услуги</Typography>
        </Breadcrumbs>

        {/* Заголовок */}
        <Fade in timeout={300}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, color: colors.textPrimary }}>
              🔧 Каталог услуг
            </Typography>
            <Typography variant="h6" sx={{ color: colors.textSecondary, maxWidth: 600, mx: 'auto' }}>
              Выберите необходимую услугу и запишитесь в удобное время
            </Typography>
          </Box>
        </Fade>

        {/* Фильтры */}
        <Fade in timeout={500}>
          <Paper sx={{ ...cardStyles, mb: 4, p: 3 }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Поиск услуг"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Найти услугу..."
                  sx={textFieldStyles}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <FormControl fullWidth sx={textFieldStyles}>
                  <InputLabel>Категория</InputLabel>
                  <Select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    label="Категория"
                  >
                    {categories.map((category) => (
                      <MenuItem key={category.value} value={category.value}>
                        {category.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <FormControl fullWidth sx={textFieldStyles}>
                  <InputLabel>Цена</InputLabel>
                  <Select
                    value={priceFilter}
                    onChange={(e) => setPriceFilter(e.target.value)}
                    label="Цена"
                  >
                    <MenuItem value="">Любая цена</MenuItem>
                    <MenuItem value="low">До 500 ₽</MenuItem>
                    <MenuItem value="medium">500 - 1000 ₽</MenuItem>
                    <MenuItem value="high">Свыше 1000 ₽</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>
        </Fade>

        {/* Услуги */}
        <Grid container spacing={3}>
          {filteredServices.map((service, index) => (
            <Grid item xs={12} md={6} lg={4} key={service.id}>
              <Fade in timeout={600 + index * 100}>
                <Card sx={{ 
                  ...cardStyles, 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: ANIMATIONS.transition.medium,
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[4]
                  }
                }}>
                  <CardContent sx={{ flex: 1, p: 3 }}>
                    {/* Заголовок и иконка */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ 
                        color: theme.palette.primary.main, 
                        fontSize: 40, 
                        mr: 2,
                        flexShrink: 0
                      }}>
                        {service.icon}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: colors.textPrimary }}>
                          {service.title}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Chip 
                            label={categories.find(c => c.value === service.category)?.label} 
                            size="small" 
                            variant="outlined"
                          />
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <StarIcon sx={{ fontSize: 16, color: colors.warning, mr: 0.5 }} />
                            <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                              {service.rating}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Box>

                    {/* Описание */}
                    <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 3 }}>
                      {service.description}
                    </Typography>

                    {/* Особенности */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" sx={{ color: colors.textPrimary, mb: 1 }}>
                        Что включено:
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        {service.features.map((feature, idx) => (
                          <Typography key={idx} variant="caption" sx={{ color: colors.textSecondary }}>
                            • {feature}
                          </Typography>
                        ))}
                      </Box>
                    </Box>

                    {/* Цена и время */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                          {service.price.min === service.price.max 
                            ? `${service.price.min} ₽`
                            : `${service.price.min} - ${service.price.max} ₽`
                          }
                        </Typography>
                      </Box>
                      <Chip 
                        icon={<ScheduleIcon />} 
                        label={service.duration} 
                        size="small"
                        variant="outlined"
                      />
                    </Box>

                    {/* Популярность */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                        Популярность: {service.popularity}%
                      </Typography>
                      <Box sx={{ 
                        width: '100%', 
                        height: 4, 
                        bgcolor: colors.backgroundField, 
                        borderRadius: 2,
                        mt: 0.5
                      }}>
                        <Box sx={{
                          width: `${service.popularity}%`,
                          height: '100%',
                          bgcolor: theme.palette.primary.main,
                          borderRadius: 2,
                          transition: ANIMATIONS.transition.medium
                        }} />
                      </Box>
                    </Box>
                  </CardContent>

                  <CardActions sx={{ p: 3, pt: 0 }}>
                    <Button 
                      fullWidth
                      variant="contained" 
                      sx={buttonStyles}
                      onClick={() => navigate('/client/booking', { state: { service } })}
                    >
                      Записаться на услугу
                    </Button>
                  </CardActions>
                </Card>
              </Fade>
            </Grid>
          ))}
        </Grid>

        {/* Если нет результатов */}
        {filteredServices.length === 0 && (
          <Fade in timeout={600}>
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" sx={{ color: colors.textSecondary, mb: 2 }}>
                🔍 По вашему запросу ничего не найдено
              </Typography>
              <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 3 }}>
                Попробуйте изменить параметры поиска или выберите другую категорию
              </Typography>
              <Button 
                variant="outlined" 
                sx={secondaryButtonStyles}
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('');
                  setPriceFilter('');
                }}
              >
                Сбросить фильтры
              </Button>
            </Box>
          </Fade>
        )}

        {/* CTA */}
        <Fade in timeout={800}>
          <Box sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: 'white',
            borderRadius: SIZES.borderRadius.lg,
            p: 4,
            mt: 6,
            textAlign: 'center'
          }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
              Не нашли нужную услугу?
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
              Свяжитесь с нами, и мы поможем подобрать оптимальное решение
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button 
                variant="contained" 
                sx={{ 
                  bgcolor: 'white', 
                  color: theme.palette.primary.main,
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
                }}
              >
                📞 Позвонить
              </Button>
              <Button 
                variant="outlined" 
                sx={{ 
                  borderColor: 'white', 
                  color: 'white',
                  '&:hover': { 
                    borderColor: 'white', 
                    bgcolor: 'rgba(255,255,255,0.1)' 
                  }
                }}
                onClick={() => navigate('/client/search')}
              >
                🗺️ Найти сервис
              </Button>
            </Box>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};

export default ClientServicesPage; 