import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import {
  Box,
  Container,
  Typography,
  Grid,
  IconButton,
  InputAdornment,
  Skeleton,
  Fade,
  useTheme,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  FormControlLabel,
  Switch,
  TextField,
  Alert
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
  DragIndicator as DragIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { 
  getCardStyles, 
  getButtonStyles, 
  getTextFieldStyles,
  SIZES,
  getThemeColors 
} from '../../styles';
import { 
  useGetPageContentsQuery,
  useDeletePageContentMutation,
  useUpdatePageContentMutation
} from '../../api/pageContent.api';

// Импорты UI компонентов

const PageContentPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const colors = getThemeColors(theme);
  
  // Redux state
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  
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
    error,
    refetch
  } = useGetPageContentsQuery({});
  
  const [deletePage] = useDeletePageContentMutation();
  const [updatePage] = useUpdatePageContentMutation();
  
  // Фильтрация страниц по поисковому запросу
  const filteredPages = pageContentData?.data?.filter(page => {
    const matchesSearch = page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         page.section.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         page.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Логика фильтрации по активности:
    // Если showInactive = true, показываем ВСЕ (активные и неактивные)
    // Если showInactive = false, показываем только активные
    const matchesActive = showInactive ? true : page.active;
    
    return matchesSearch && matchesActive;
  }) || [];

  // Отладочная информация (только в режиме разработки)
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 PageContentPage Debug Info:');
    console.log('📊 All Pages:', pageContentData?.data);
    console.log('🔢 Total Pages Count:', pageContentData?.data?.length);
    console.log('🔍 Search Query:', searchQuery);
    console.log('👁️ Show Inactive:', showInactive);
    console.log('📋 Filtered Pages:', filteredPages);
    console.log('🔢 Filtered Count:', filteredPages.length);
    console.log('❌ Inactive Pages:', pageContentData?.data?.filter(p => !p.active));
    console.log('✅ Active Pages:', pageContentData?.data?.filter(p => p.active));
    console.log('🔑 Auth State:', isAuthenticated ? 'аутентифицирован' : 'не аутентифицирован');
    console.log('📡 API Response:', pageContentData);
    console.log('⚠️ API Error:', error);
  }
  
  // Обработка переключения активности
  const handleToggleActive = async (pageId: number, currentActive: boolean) => {
    try {
      await updatePage({
        id: pageId,
        active: !currentActive
      }).unwrap();
    } catch (error) {
      console.error('Ошибка при изменении активности страницы:', error);
    }
  };
  
  // Обработка удаления
  const handleDelete = async (pageId: number, pageTitle: string) => {
    if (window.confirm(`Вы уверены, что хотите удалить контент "${pageTitle}"?`)) {
      try {
        await deletePage(pageId).unwrap();
      } catch (error) {
        console.error('Ошибка при удалении страницы:', error);
      }
    }
  };
  
  // Типы контента с их описаниями
  const getContentTypeInfo = (contentType: string) => {
    const contentTypes: Record<string, { name: string; icon: string; color: string }> = {
      'hero': { name: 'Главный баннер', icon: '🎯', color: 'primary' },
      'service': { name: 'Услуга', icon: '🔧', color: 'secondary' },
      'city': { name: 'Город', icon: '🏙️', color: 'info' },
      'article': { name: 'Статья', icon: '📝', color: 'success' },
      'cta': { name: 'Призыв к действию', icon: '📢', color: 'warning' },
      'footer': { name: 'Подвал', icon: '📄', color: 'default' }
    };
    
    return contentTypes[contentType] || { 
      name: contentType, 
      icon: '📄', 
      color: 'default' 
    };
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" sx={{ mb: 4, fontSize: SIZES.fontSize.xl, fontWeight: 600 }}>
          Управление контентом страниц
        </Typography>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} md={6} lg={4} key={i}>
              <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          ❌ Ошибка при загрузке контента страниц
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Заголовок */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontSize: SIZES.fontSize.xl, fontWeight: 600 }}>
          Управление контентом страниц
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => refetch()}
            disabled={isLoading}
          >
            Обновить
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/page-content/new')}
          >
            Создать контент
          </Button>
        </Box>
      </Box>

      {/* Описание */}
      <Card sx={{ mb: 4, p: 3 }}>
        <Typography variant="body1" color="text.secondary">
          Здесь вы можете управлять контентом клиентских страниц: редактировать тексты, 
          настраивать услуги, изменять hero-секции и CTA блоки без изменения кода.
        </Typography>
      </Card>

      {/* Фильтры */}
      <Card sx={{ mb: 4, p: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Поиск контента"
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              placeholder="Найти по заголовку или содержимому..."
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
                  onChange={(event) => setShowInactive(event.target.checked)}
                />
              }
              label="Показать неактивный контент"
            />
          </Grid>
        </Grid>
      </Card>

      {/* Список контента */}
      <Grid container spacing={3}>
        {filteredPages.map((page) => {
          const contentInfo = getContentTypeInfo(page.content_type);
          
          return (
            <Grid item xs={12} md={6} lg={4} key={page.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h5">{contentInfo.icon}</Typography>
                      <Chip 
                        label={contentInfo.name} 
                        size="small" 
                        color={contentInfo.color as any}
                        variant="outlined"
                      />
                    </Box>
                    <Chip 
                      label={page.active ? 'Активен' : 'Неактивен'} 
                      size="small"
                      color={page.active ? 'success' : 'default'}
                    />
                  </Box>
                  
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                    {page.title}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Секция: {page.section}
                  </Typography>
                  
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ 
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {page.content}
                  </Typography>
                  
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      Позиция: {page.position}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ID: {page.id}
                    </Typography>
                  </Box>
                </CardContent>
                
                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/page-content/${page.id}/edit`)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleToggleActive(page.id, page.active)}
                      color={page.active ? 'warning' : 'success'}
                    >
                      {page.active ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(page.id, page.title)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {filteredPages.length === 0 && (
        <Card sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            Контент не найден
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchQuery ? 'Попробуйте изменить поисковый запрос' : 'Создайте первый элемент контента'}
          </Typography>
        </Card>
      )}
    </Container>
  );
};

export default PageContentPage; 