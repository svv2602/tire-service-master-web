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
  Chip,
  IconButton,
  Autocomplete,
  Fade,
  useTheme
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Article as ArticleIcon,
  BookOnline as BookIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon
} from '@mui/icons-material';

// Импорт централизованной системы стилей
import { 
  getCardStyles, 
  getButtonStyles, 
  SIZES,
  getThemeColors,
  ANIMATIONS
} from '../../styles';

// Импорт API для работы с контентом
import { useGetPageContentsQuery } from '../../api/pageContent.api';
import { useGetCitiesWithServicePointsQuery } from '../../api/cities.api';
import { useMainPageArticles } from '../../hooks/useMainPageArticles';
import ClientLayout from '../../components/client/ClientLayout';

// Интерфейс для города с сервисными точками
interface CityWithServicePoints {
  id: number;
  name: string;
  region_name?: string;
  service_points_count?: number;
}

const ClientMainPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const colors = getThemeColors(theme);
  
  const cardStyles = getCardStyles(theme, 'primary');
  const buttonStyles = getButtonStyles(theme, 'primary');
  const secondaryButtonStyles = getButtonStyles(theme, 'secondary');
  
  // Состояние для поиска
  const [selectedCity, setSelectedCity] = useState<CityWithServicePoints | null>(null);
  
  // API запросы для контента
  const { data: pageContentData, isLoading: contentLoading } = useGetPageContentsQuery({
    section: 'client_main'
  });
  const { data: citiesData, isLoading: citiesLoading } = useGetCitiesWithServicePointsQuery();
  
  // Получаем статьи для главной страницы (приоритет рекомендованным)
  const { articles: mainPageArticles, isLoading: articlesLoading } = useMainPageArticles();
  
  // Получаем данные контента из API
  const pageContent = pageContentData?.data || [];
  
  // Получаем города с сервисными точками
  const cities: CityWithServicePoints[] = citiesData?.data || [];
  
  // Получаем контент по типам
  const heroContent = pageContent.find(item => item.content_type === 'hero');
  const ctaContent = pageContent.find(item => item.content_type === 'cta');
  const footerContent = pageContent.find(item => item.content_type === 'text_block' && item.settings?.type === 'footer');

  const handleSearch = () => {
    if (!selectedCity) {
      // Если город не выбран, показываем сообщение или просто ничего не делаем
      console.log('Город не выбран для поиска');
      return;
    } else {
      // Перенаправляем на страницу бронирования с передачей данных о городе
      console.log('Переход на бронирование с городом:', selectedCity);
      navigate('/client/booking', {
        state: {
          cityId: selectedCity.id,
          cityName: selectedCity.name,
          step1Completed: false // Указываем, что первый шаг еще не завершен
        }
      });
    }
  };

  // Используем данные из API или fallback
  const currentHero = heroContent || {
    title: 'Знайдіть найкращий автосервис поруч з вами',
    content: 'Швидке бронювання, перевірені майстри, гарантія якості',
    settings: {
      subtitle: 'Швидке бронювання, перевірені майстри, гарантія якості',
      button_text: 'Знайти',
      search_placeholder: 'Знайти сервіс або послугу',
      city_placeholder: 'Місто'
    }
  };
  
  // Для статей используем новую логику с приоритетом рекомендованных
  const currentArticles = mainPageArticles.length > 0 ? mainPageArticles : [
    {
      id: 1,
      title: 'Як вибрати зимові шини',
      excerpt: 'Детальний посібник з вибору зимових шин для безпечної їзди',
      reading_time: 5,
      author: { name: 'Експерт з шин' },
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      title: 'Правильний тиск у шинах',
      excerpt: 'Вплив тиску на безпеку та витрату палива',
      reading_time: 3,
      author: { name: 'Технічний спеціаліст' },
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      title: 'Сезонне зберігання шин',
      excerpt: 'Як правильно зберігати шини в міжсезоння',
      reading_time: 4,
      author: { name: 'Майстер сервісу' },
      created_at: new Date().toISOString()
    }
  ];

  if (contentLoading || citiesLoading || articlesLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <Typography>Завантаження...</Typography>
      </Box>
    );
  }

  return (
    <ClientLayout>
      <Box sx={{ minHeight: '100vh', bgcolor: colors.backgroundPrimary }}>
        {/* Hero секция */}
        <Fade in timeout={500}>
          <Box sx={{
            bgcolor: colors.backgroundPrimary,
            color: colors.textPrimary,
            py: 8,
            position: 'relative',
            overflow: 'hidden'
          }}>
            <Container maxWidth="lg">
              <Grid container spacing={4} alignItems="stretch" sx={{ minHeight: '60vh' }}>
                <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%',
                    height: '100%'
                  }}>
                    <Box
                      component="img"
                      src="/image_app/serviceman.png" 
                      alt="Професійний сервісмен" 
                      sx={{
                        width: '100%',
                        height: '100%',
                        maxHeight: '100%',
                        objectFit: 'cover',
                        borderRadius: 3,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                        transition: 'transform 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.02)'
                        }
                      }}
                    />
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: '100%' }}>
                    <Typography variant="h2" sx={{ fontWeight: 700, mb: 2, fontSize: { xs: '2.5rem', md: '3.5rem' } }}>
                      {currentHero.title}
                    </Typography>
                    <Typography variant="h6" sx={{ mb: 4, opacity: 0.8, lineHeight: 1.6 }}>
                      {currentHero.settings?.subtitle || currentHero.content}
                    </Typography>
                    
                    {/* Поиск */}
                    <Paper sx={{ p: 2, borderRadius: SIZES.borderRadius.lg }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={8}>
                          <Autocomplete
                            value={selectedCity}
                            onChange={(event, newValue) => setSelectedCity(newValue)}
                            options={cities}
                            getOptionLabel={(option) => option.name}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            renderOption={(props, option) => {
                              const { key, ...otherProps } = props;
                              return (
                                <Box component="li" key={key} {...otherProps}>
                                  <Box>
                                    <Typography variant="body1">{option.name}</Typography>
                                    {option.region_name && (
                                      <Typography variant="caption" color="text.secondary">
                                        {option.region_name}
                                      </Typography>
                                    )}
                                  </Box>
                                </Box>
                              );
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label={currentHero.settings?.city_placeholder || 'Оберіть місто'}
                                fullWidth
                                InputProps={{
                                  ...params.InputProps,
                                  startAdornment: <LocationIcon sx={{ mr: 1, color: colors.textSecondary }} />
                                }}
                              />
                            )}
                            noOptionsText="Городи не знайдені"
                            loadingText="Завантаження..."
                            loading={citiesLoading}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
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
                  </Box>
                </Grid>
              </Grid>
            </Container>
          </Box>
        </Fade>

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
              {currentArticles.slice(0, 3).map((article: any, index: number) => (
                <Grid item xs={12} md={4} key={article.id || index}>
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
                          onClick={() => navigate(`/knowledge-base/${article.id}`)}
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
                  {footerContent?.content || 'Знайдіть найкращий автосервис поруч з вами. Швидке бронювання, перевірені майстри.'}
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
    </ClientLayout>
  );
};

export default ClientMainPage;
