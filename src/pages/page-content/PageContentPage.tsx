import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  IconButton,
  Switch,
  FormControlLabel,
  TextField,
  InputAdornment,
  Alert,
  Skeleton,
  Fade,
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Search as SearchIcon,
  Web as WebIcon,
  Settings as SettingsIcon,
  ContentCopy as ContentIcon,
  DragIndicator as DragIcon
} from '@mui/icons-material';
import { 
  getCardStyles, 
  getButtonStyles, 
  getTextFieldStyles,
  SIZES,
  getThemeColors 
} from '../../styles';
import { 
  useGetPageContentQuery,
  useTogglePageContentActiveMutation,
  useDeletePageContentMutation
} from '../../api/pageContent.api';
import { PageContent } from '../../types';

const PageContentPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const colors = getThemeColors(theme);
  
  const cardStyles = getCardStyles(theme, 'primary');
  const buttonStyles = getButtonStyles(theme, 'primary');
  const secondaryButtonStyles = getButtonStyles(theme, 'secondary');
  const textFieldStyles = getTextFieldStyles(theme, 'filled');
  
  // Состояние для фильтров
  const [searchQuery, setSearchQuery] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  
  // API запросы
  const {
    data: pageContentData,
    isLoading,
    error
  } = useGetPageContentQuery({
    page: 1,
    per_page: 20,
    isActive: showInactive ? undefined : true
  });
  
  const [toggleActive] = useTogglePageContentActiveMutation();
  const [deletePage] = useDeletePageContentMutation();
  
  // Фильтрация страниц по поисковому запросу
  const filteredPages = pageContentData?.data?.filter(page => 
    page.pageTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.pageName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.pageDescription.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];
  
  // Обработка переключения активности
  const handleToggleActive = async (pageId: string) => {
    try {
      await toggleActive(pageId).unwrap();
    } catch (error) {
      console.error('Ошибка при изменении активности страницы:', error);
    }
  };
  
  // Обработка удаления
  const handleDelete = async (pageId: string, pageName: string) => {
    if (window.confirm(`Вы уверены, что хотите удалить страницу "${pageName}"?`)) {
      try {
        await deletePage(pageId).unwrap();
      } catch (error) {
        console.error('Ошибка при удалении страницы:', error);
      }
    }
  };
  
  // Типы страниц с их описаниями
  const getPageTypeInfo = (pageName: string) => {
    const pageTypes: Record<string, { name: string; icon: string; description: string }> = {
      'main': { 
        name: 'Главная страница', 
        icon: '🏠', 
        description: 'Основная страница сайта с hero-секцией и популярными услугами' 
      },
      'services': { 
        name: 'Страница услуг', 
        icon: '🔧', 
        description: 'Каталог всех доступных услуг с фильтрами' 
      },
      'about': { 
        name: 'О компании', 
        icon: 'ℹ️', 
        description: 'Информация о компании, миссии и преимуществах' 
      },
      'contact': { 
        name: 'Контакты', 
        icon: '📞', 
        description: 'Контактная информация и форма обратной связи' 
      },
    };
    
    return pageTypes[pageName] || { 
      name: pageName, 
      icon: '📄', 
      description: 'Пользовательская страница' 
    };
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 700, color: colors.textPrimary }}>
          🎨 Управление контентом страниц
        </Typography>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} md={6} lg={4} key={i}>
              <Skeleton variant="rectangular" height={300} sx={{ borderRadius: SIZES.borderRadius.md }} />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 4 }}>
          Ошибка при загрузке контента страниц
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Заголовок */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: colors.textPrimary }}>
          🎨 Управление контентом страниц
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={buttonStyles}
          onClick={() => navigate('/page-content/new')}
        >
          Создать страницу
        </Button>
      </Box>

      {/* Описание */}
      <Paper sx={{ ...cardStyles, mb: 4, p: 3 }}>
        <Typography variant="body1" sx={{ color: colors.textSecondary }}>
          📝 Здесь вы можете управлять контентом клиентских страниц: редактировать тексты, 
          настраивать услуги, изменять hero-секции и CTA блоки без изменения кода.
        </Typography>
      </Paper>

      {/* Фильтры */}
      <Paper sx={{ ...cardStyles, mb: 4, p: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Поиск страниц"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Найти по названию или описанию..."
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
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={showInactive}
                  onChange={(e) => setShowInactive(e.target.checked)}
                  color="primary"
                />
              }
              label="Показать неактивные страницы"
              sx={{ color: colors.textPrimary }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Список страниц */}
      <Grid container spacing={3}>
        {filteredPages.map((page, index) => {
          const pageInfo = getPageTypeInfo(page.pageName);
          
          return (
            <Grid item xs={12} md={6} lg={4} key={page.id}>
              <Fade in timeout={500 + index * 100}>
                <Card sx={{ 
                  ...cardStyles, 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  opacity: page.isActive ? 1 : 0.6,
                  border: page.isActive 
                    ? `2px solid ${theme.palette.primary.main}` 
                    : `2px solid ${colors.borderPrimary}`
                }}>
                  <CardContent sx={{ flex: 1, p: 3 }}>
                    {/* Заголовок и иконка типа */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h3" sx={{ mr: 2 }}>
                        {pageInfo.icon}
                      </Typography>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: colors.textPrimary, mb: 1 }}>
                          {page.pageTitle}
                        </Typography>
                        <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 1 }}>
                          {pageInfo.name}
                        </Typography>
                        <Chip 
                          label={page.pageName} 
                          size="small" 
                          variant="outlined"
                          color={page.isActive ? 'primary' : 'default'}
                        />
                      </Box>
                    </Box>

                    {/* Описание */}
                    <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 3 }}>
                      {page.pageDescription || pageInfo.description}
                    </Typography>

                    {/* Статистика блоков */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="caption" sx={{ color: colors.textSecondary, mb: 1, display: 'block' }}>
                        Блоков контента: {page.blocks.length}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {page.blocks.slice(0, 3).map((block, idx) => (
                          <Chip 
                            key={idx}
                            label={block.type} 
                            size="small" 
                            variant="outlined"
                            sx={{ fontSize: '0.7rem' }}
                          />
                        ))}
                        {page.blocks.length > 3 && (
                          <Chip 
                            label={`+${page.blocks.length - 3}`} 
                            size="small" 
                            variant="outlined"
                            sx={{ fontSize: '0.7rem' }}
                          />
                        )}
                      </Box>
                    </Box>

                    {/* Статус активности */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {page.isActive ? (
                        <VisibilityIcon sx={{ fontSize: 16, color: colors.success }} />
                      ) : (
                        <VisibilityOffIcon sx={{ fontSize: 16, color: colors.textSecondary }} />
                      )}
                      <Typography variant="caption" sx={{ 
                        color: page.isActive ? colors.success : colors.textSecondary 
                      }}>
                        {page.isActive ? 'Активна' : 'Скрыта'}
                      </Typography>
                    </Box>
                  </CardContent>

                  <CardActions sx={{ p: 3, pt: 0, gap: 1 }}>
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      sx={{ color: theme.palette.primary.main }}
                      onClick={() => navigate(`/page-content/${page.id}/edit`)}
                    >
                      Редактировать
                    </Button>
                    
                    <IconButton
                      size="small"
                      onClick={() => handleToggleActive(page.id)}
                      sx={{ color: page.isActive ? colors.warning : colors.success }}
                    >
                      {page.isActive ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>

                    <IconButton
                      size="small"
                      onClick={() => handleDelete(page.id, page.pageTitle)}
                      sx={{ color: colors.error }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              </Fade>
            </Grid>
          );
        })}
      </Grid>

      {/* Пустое состояние */}
      {filteredPages.length === 0 && (
        <Paper sx={{ ...cardStyles, p: 6, textAlign: 'center' }}>
          <WebIcon sx={{ fontSize: 80, color: colors.textSecondary, mb: 2 }} />
          <Typography variant="h6" sx={{ color: colors.textPrimary, mb: 2 }}>
            {searchQuery ? 'Страницы не найдены' : 'Нет настроенных страниц'}
          </Typography>
          <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 3 }}>
            {searchQuery 
              ? 'Попробуйте изменить поисковый запрос или сбросить фильтры'
              : 'Создайте первую страницу для управления контентом клиентского сайта'
            }
          </Typography>
          {!searchQuery && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={buttonStyles}
              onClick={() => navigate('/page-content/new')}
            >
              Создать первую страницу
            </Button>
          )}
        </Paper>
      )}

      {/* Быстрые действия */}
      <Paper sx={{ ...cardStyles, mt: 4, p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: colors.textPrimary }}>
          🚀 Быстрые действия
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<ContentIcon />}
              sx={secondaryButtonStyles}
              onClick={() => navigate('/page-content/templates')}
            >
              Шаблоны страниц
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<SettingsIcon />}
              sx={secondaryButtonStyles}
              onClick={() => navigate('/page-content/settings')}
            >
              Настройки
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<WebIcon />}
              sx={secondaryButtonStyles}
              onClick={() => window.open('/client', '_blank')}
            >
              Просмотр сайта
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<DragIcon />}
              sx={secondaryButtonStyles}
              onClick={() => navigate('/page-content/order')}
            >
              Порядок блоков
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default PageContentPage; 