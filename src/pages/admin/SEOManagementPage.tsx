import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Alert,
  Divider,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  MenuItem,
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  ContentCopy as CopyIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  TrendingUp as TrendingUpIcon,
  Language as LanguageIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

// Импорт UI компонентов
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/TextField';
import { Select } from '../../components/ui/Select';
import { Tabs, TabPanel } from '../../components/ui/Tabs';

// Импорт стилей
import { getTablePageStyles, getCardStyles } from '../../styles';

// Импорт SEO системы
import { useSEO } from '../../hooks/useSEO';
import { SEOHead } from '../../components/common/SEOHead';
import { SEOMetatagsEditor } from '../../components/admin/SEOMetatagsEditor';

interface SEOPageData {
  id: string;
  name: string;
  path: string;
  type: 'home' | 'services' | 'search' | 'booking' | 'calculator' | 'knowledge-base' | 'article' | 'service-point' | 'profile' | 'admin' | 'login' | 'register';
  title: string;
  description: string;
  keywords: string[];
  status: 'good' | 'warning' | 'error';
  issues: string[];
  lastUpdated: string;
}

interface SEOMetrics {
  totalPages: number;
  goodPages: number;
  warningPages: number;
  errorPages: number;
  averageTitleLength: number;
  averageDescriptionLength: number;
}

const SEOManagementPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const tablePageStyles = getTablePageStyles(theme);
  const cardStyles = getCardStyles(theme);
  const { createSEO, getPageSEOConfig } = useSEO();

  // SEO для самой страницы
  const seoConfig = createSEO('admin', {
    title: 'SEO Управление',
    description: 'Управление SEO метатегами и оптимизация страниц сайта',
    noIndex: true
  });

  // Состояния
  const [activeTab, setActiveTab] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState('uk');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState<SEOPageData | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Генерируем данные страниц на основе нашей SEO системы
  const generatePageData = (): SEOPageData[] => {
    const pageTypes = ['home', 'services', 'search', 'booking', 'calculator', 'knowledge-base'] as const;
    
    return pageTypes.map((type, index) => {
      const config = getPageSEOConfig(type);
      const titleLength = config.title.length;
      const descriptionLength = config.description.length;
      
      let status: 'good' | 'warning' | 'error' = 'good';
      let issues: string[] = [];
      
      if (titleLength < 30 || titleLength > 60) {
        status = 'warning';
        issues.push(titleLength < 30 ? 'Заголовок слишком короткий' : 'Заголовок слишком длинный');
      }
      
      if (descriptionLength < 120 || descriptionLength > 160) {
        status = status === 'warning' ? 'error' : 'warning';
        issues.push(descriptionLength < 120 ? 'Описание слишком короткое' : 'Описание слишком длинное');
      }
      
      if (config.keywords.length < 3) {
        status = 'warning';
        issues.push('Недостаточно ключевых слов');
      }

      return {
        id: `page-${index + 1}`,
        name: getPageName(type),
        path: getPagePath(type),
        type,
        title: config.title,
        description: config.description,
        keywords: config.keywords,
        status,
        issues,
        lastUpdated: '2024-01-15'
      };
    });
  };

  const getPageName = (type: string): string => {
    const names: Record<string, string> = {
      home: 'Главная страница',
      services: 'Страница услуг',
      search: 'Поиск сервисов',
      booking: 'Онлайн запись',
      calculator: 'Калькулятор шин',
      'knowledge-base': 'База знаний'
    };
    return names[type] || type;
  };

  const getPagePath = (type: string): string => {
    const paths: Record<string, string> = {
      home: '/',
      services: '/client/services',
      search: '/client/search',
      booking: '/client/booking',
      calculator: '/client/tire-calculator',
      'knowledge-base': '/knowledge-base'
    };
    return paths[type] || `/${type}`;
  };

  const [pagesData, setPagesData] = useState<SEOPageData[]>(() => generatePageData());

  // Метрики SEO
  const metrics: SEOMetrics = {
    totalPages: pagesData.length,
    goodPages: pagesData.filter(p => p.status === 'good').length,
    warningPages: pagesData.filter(p => p.status === 'warning').length,
    errorPages: pagesData.filter(p => p.status === 'error').length,
    averageTitleLength: Math.round(pagesData.reduce((sum, p) => sum + p.title.length, 0) / pagesData.length),
    averageDescriptionLength: Math.round(pagesData.reduce((sum, p) => sum + p.description.length, 0) / pagesData.length),
  };

  // Обработчики
  const handleEditPage = (page: SEOPageData) => {
    setSelectedPage(page);
    setEditDialogOpen(true);
  };

  const handlePreviewPage = (page: SEOPageData) => {
    setSelectedPage(page);
    setPreviewDialogOpen(true);
  };

  const handleCopyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Не удалось скопировать:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return <CheckIcon />;
      case 'warning': return <WarningIcon />;
      case 'error': return <ErrorIcon />;
      default: return <CheckIcon />;
    }
  };

  // Вкладки
  const tabs = [
    { label: 'Обзор страниц', value: 0, icon: <SearchIcon /> },
    { label: 'Аналитика SEO', value: 1, icon: <TrendingUpIcon /> },
    { label: 'Настройки', value: 2, icon: <EditIcon /> },
  ];

  return (
    <Box sx={tablePageStyles.pageContainer}>
      <SEOHead {...seoConfig} />
      
      {/* Заголовок страницы */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          🔍 SEO Управление
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Управление метатегами и оптимизация страниц для поисковых систем
        </Typography>
      </Box>

      {/* Метрики */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={cardStyles}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="primary.main" sx={{ fontWeight: 700 }}>
                {metrics.totalPages}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Всего страниц
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={cardStyles}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="success.main" sx={{ fontWeight: 700 }}>
                {metrics.goodPages}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Оптимизированы
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={cardStyles}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="warning.main" sx={{ fontWeight: 700 }}>
                {metrics.warningPages}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Требуют внимания
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={cardStyles}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="error.main" sx={{ fontWeight: 700 }}>
                {metrics.errorPages}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Критические ошибки
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Вкладки */}
      <Tabs
        value={activeTab}
        onChange={(value) => setActiveTab(value as number)}
        tabs={tabs}
        variant="fullWidth"
      />

      {/* Обзор страниц */}
      <TabPanel value={activeTab} index={0}>
        <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
          <Select
            value={selectedLanguage}
            onChange={(value) => setSelectedLanguage(value as string)}
            label="Язык"
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="uk">🇺🇦 Українська</MenuItem>
            <MenuItem value="ru">🇷🇺 Русский</MenuItem>
          </Select>
          <Button
            variant="outlined"
            startIcon={<LanguageIcon />}
            onClick={() => window.location.reload()}
          >
            Обновить данные
          </Button>
        </Box>

        <Grid container spacing={3}>
          {pagesData.map((page) => (
            <Grid item xs={12} md={6} lg={4} key={page.id}>
              <Card sx={{ ...cardStyles, height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {page.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {page.path}
                      </Typography>
                    </Box>
                    <Chip
                      icon={getStatusIcon(page.status)}
                      label={page.status === 'good' ? 'Хорошо' : page.status === 'warning' ? 'Внимание' : 'Ошибка'}
                      color={getStatusColor(page.status) as any}
                      size="small"
                    />
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                      Title ({page.title.length} символов):
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ 
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {page.title}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                      Description ({page.description.length} символов):
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
                      {page.description}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                      Keywords ({page.keywords.length}):
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {page.keywords.slice(0, 3).map((keyword, index) => (
                        <Chip key={index} label={keyword} size="small" variant="outlined" />
                      ))}
                      {page.keywords.length > 3 && (
                        <Chip label={`+${page.keywords.length - 3}`} size="small" variant="outlined" />
                      )}
                    </Box>
                  </Box>

                  {page.issues.length > 0 && (
                    <Alert severity={page.status === 'error' ? 'error' : 'warning'} sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        {page.issues.join(', ')}
                      </Typography>
                    </Alert>
                  )}

                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    <Tooltip title="Предварительный просмотр">
                      <IconButton size="small" onClick={() => handlePreviewPage(page)}>
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Редактировать">
                      <IconButton size="small" onClick={() => handleEditPage(page)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Аналитика SEO */}
      <TabPanel value={activeTab} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={cardStyles}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  📊 Статистика длины метатегов
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Средняя длина заголовков: {metrics.averageTitleLength} символов
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Рекомендуемая длина: 50-60 символов
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Средняя длина описаний: {metrics.averageDescriptionLength} символов
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Рекомендуемая длина: 150-160 символов
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={cardStyles}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  🎯 Рекомендации по улучшению
                </Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    • Оптимизируйте длину заголовков (50-60 символов)
                  </Typography>
                </Alert>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    • Добавьте больше ключевых слов для лучшего ранжирования
                  </Typography>
                </Alert>
                <Alert severity="info">
                  <Typography variant="body2">
                    • Используйте уникальные описания для каждой страницы
                  </Typography>
                </Alert>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Настройки */}
      <TabPanel value={activeTab} index={2}>
        <Card sx={cardStyles}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              ⚙️ Глобальные настройки SEO
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Название сайта"
                  defaultValue="Твоя Шина - Професійний шиномонтаж"
                  helperText="Используется в метатегах всех страниц"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="URL сайта"
                  defaultValue="https://tvoya-shina.ua"
                  helperText="Базовый URL для канонических ссылок"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Twitter Handle"
                  defaultValue="@tvoya_shina"
                  helperText="Для Twitter Card метатегов"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Изображение по умолчанию"
                  defaultValue="/image/tire-service-og.jpg"
                  helperText="Для Open Graph и Twitter Cards"
                />
              </Grid>
            </Grid>
            <Box sx={{ mt: 3 }}>
              <Button variant="contained">
                Сохранить настройки
              </Button>
            </Box>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Диалог предварительного просмотра */}
      <Dialog
        open={previewDialogOpen}
        onClose={() => setPreviewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Предварительный просмотр: {selectedPage?.name}
        </DialogTitle>
        <DialogContent>
          {selectedPage && (
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Как будет выглядеть в поисковой выдаче:
              </Typography>
              <Box sx={{ 
                p: 2, 
                border: '1px solid #e0e0e0', 
                borderRadius: 1, 
                bgcolor: '#fafafa',
                mb: 3
              }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: '#1a0dab', 
                    fontSize: '18px',
                    fontWeight: 400,
                    mb: 0.5,
                    cursor: 'pointer',
                    '&:hover': { textDecoration: 'underline' }
                  }}
                >
                  {selectedPage.title}
                </Typography>
                <Typography variant="body2" sx={{ color: '#006621', mb: 0.5 }}>
                  tvoya-shina.ua{selectedPage.path}
                </Typography>
                <Typography variant="body2" sx={{ color: '#545454', lineHeight: 1.4 }}>
                  {selectedPage.description}
                </Typography>
              </Box>

              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Метатеги:
              </Typography>
              <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1, fontFamily: 'monospace' }}>
                <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2">
                    &lt;title&gt;{selectedPage.title}&lt;/title&gt;
                  </Typography>
                  <IconButton 
                    size="small" 
                    onClick={() => handleCopyToClipboard(selectedPage.title, 'title')}
                  >
                    {copiedField === 'title' ? <CheckIcon color="success" /> : <CopyIcon />}
                  </IconButton>
                </Box>
                <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2">
                    &lt;meta name="description" content="{selectedPage.description}" /&gt;
                  </Typography>
                  <IconButton 
                    size="small" 
                    onClick={() => handleCopyToClipboard(selectedPage.description, 'description')}
                  >
                    {copiedField === 'description' ? <CheckIcon color="success" /> : <CopyIcon />}
                  </IconButton>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2">
                    &lt;meta name="keywords" content="{selectedPage.keywords.join(', ')}" /&gt;
                  </Typography>
                  <IconButton 
                    size="small" 
                    onClick={() => handleCopyToClipboard(selectedPage.keywords.join(', '), 'keywords')}
                  >
                    {copiedField === 'keywords' ? <CheckIcon color="success" /> : <CopyIcon />}
                  </IconButton>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialogOpen(false)}>
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог редактирования SEO */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Редактирование SEO: {selectedPage?.name}
        </DialogTitle>
        <DialogContent>
          {selectedPage && (
            <SEOMetatagsEditor
              initialData={{
                title: selectedPage.title,
                description: selectedPage.description,
                keywords: selectedPage.keywords,
                image: '/image/tire-service-og.jpg',
                canonical: `https://tvoya-shina.ua${selectedPage.path}`,
                noIndex: selectedPage.type === 'admin' || selectedPage.type === 'profile'
              }}
              onSave={(data) => {
                // Здесь можно добавить сохранение в API
                console.log('Сохранение SEO данных:', data);
                
                // Обновляем локальные данные для демонстрации
                setPagesData(prev => prev.map(page => 
                  page.id === selectedPage.id 
                    ? { ...page, title: data.title, description: data.description, keywords: data.keywords }
                    : page
                ));
                
                setEditDialogOpen(false);
              }}
              onCancel={() => setEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default SEOManagementPage; 