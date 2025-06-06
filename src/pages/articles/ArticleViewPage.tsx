import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Chip,
  Divider,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Fade,
  useTheme
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Category as CategoryIcon,
  Star as StarIcon,
  Tag as TagIcon,
  Share as ShareIcon,
  Print as PrintIcon
} from '@mui/icons-material';

import { useArticle, useRelatedArticles } from '../../hooks/useArticles';
import { ARTICLE_STATUS_LABELS } from '../../types/articles';

// Импорт централизованной системы стилей
import { 
  getCardStyles, 
  getButtonStyles, 
  getChipStyles,
  SIZES,
  getThemeColors
} from '../../styles';

const ArticleViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const colors = getThemeColors(theme);
  
  const { article, loading, error } = useArticle(id || null);
  const { articles: relatedArticles } = useRelatedArticles(article?.id || null);

  // Получаем централизованные стили
  const cardStyles = getCardStyles(theme, 'primary');
  const buttonStyles = getButtonStyles(theme, 'primary');
  const secondaryButtonStyles = getButtonStyles(theme, 'secondary');

  // Форматирование даты
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Получение цвета статуса
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'success';
      case 'draft':
        return 'warning';
      case 'archived':
        return 'default';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          py: 8
        }}>
          <CircularProgress size={48} sx={{ mb: 2 }} />
          <Typography variant="body1" sx={{ color: colors.textSecondary }}>
            Загрузка статьи...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error || !article) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Alert severity="error" sx={{ mb: 3, display: 'inline-block' }}>
            {error || 'Статья не найдена'}
          </Alert>
          <Box>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/articles')}
              sx={secondaryButtonStyles}
            >
              Вернуться к списку статей
            </Button>
          </Box>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Навигация */}
      <Fade in timeout={300}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/articles')}
            sx={secondaryButtonStyles}
          >
            Назад к списку статей
          </Button>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Поделиться">
              <IconButton size="small" sx={{ color: colors.textSecondary }}>
                <ShareIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Печать">
              <IconButton size="small" sx={{ color: colors.textSecondary }}>
                <PrintIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/articles/${article.id}/edit`)}
              sx={buttonStyles}
              size="small"
            >
              Редактировать
            </Button>
          </Box>
        </Box>
      </Fade>

      <Grid container spacing={4}>
        {/* Основное содержимое */}
        <Grid item xs={12} lg={8}>
          <Fade in timeout={500}>
            <Box>
              {/* Заголовок статьи */}
              <Paper sx={{ ...cardStyles, mb: 3 }}>
                {/* Статусы и метки */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                  <Chip
                    label={ARTICLE_STATUS_LABELS[article.status as keyof typeof ARTICLE_STATUS_LABELS]}
                    color={getStatusColor(article.status) as any}
                    variant="filled"
                    size="small"
                  />
                  <Chip
                    icon={<CategoryIcon />}
                    label={article.category_name}
                    variant="outlined"
                    size="small"
                  />
                  {article.featured && (
                    <Chip
                      icon={<StarIcon />}
                      label="Рекомендуется"
                      sx={getChipStyles(theme, 'warning')}
                      size="small"
                    />
                  )}
                </Box>

                {/* Заголовок */}
                <Typography variant="h3" component="h1" sx={{ 
                  fontWeight: 700,
                  color: colors.textPrimary,
                  mb: 3,
                  lineHeight: 1.2
                }}>
                  {article.title}
                </Typography>

                {/* Описание */}
                <Typography variant="h6" component="p" sx={{ 
                  color: colors.textSecondary,
                  fontWeight: 400,
                  lineHeight: 1.6,
                  mb: 4
                }}>
                  {article.excerpt}
                </Typography>

                <Divider sx={{ mb: 3 }} />

                {/* Метаинформация */}
                <Grid container spacing={3} sx={{ color: colors.textSecondary }}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PersonIcon sx={{ fontSize: 18 }} />
                      <Typography variant="body2">{article.author.name}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarIcon sx={{ fontSize: 18 }} />
                      <Typography variant="body2">{formatDate(article.published_at)}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ScheduleIcon sx={{ fontSize: 18 }} />
                      <Typography variant="body2">{article.reading_time} мин чтения</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <VisibilityIcon sx={{ fontSize: 18 }} />
                      <Typography variant="body2">{article.views_count.toLocaleString()} просмотров</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>

              {/* Главное изображение */}
              {article.featured_image && (
                <Fade in timeout={700}>
                  <Paper sx={{ ...cardStyles, mb: 3, overflow: 'hidden', p: 0 }}>
                    <Box
                      component="img"
                      src={article.featured_image}
                      alt={article.title}
                      sx={{
                        width: '100%',
                        height: 400,
                        objectFit: 'cover',
                        borderRadius: SIZES.borderRadius.md
                      }}
                    />
                  </Paper>
                </Fade>
              )}

              {/* Содержимое статьи */}
              <Fade in timeout={900}>
                <Paper sx={{ ...cardStyles, mb: 3 }}>
                  <Box
                    sx={{
                      '& h1, & h2, & h3, & h4, & h5, & h6': {
                        color: colors.textPrimary,
                        fontWeight: 600,
                        mt: 3,
                        mb: 2,
                        '&:first-of-type': { mt: 0 }
                      },
                      '& p': {
                        color: colors.textPrimary,
                        lineHeight: 1.8,
                        mb: 2,
                        fontSize: '1.1rem'
                      },
                      '& ul, & ol': {
                        color: colors.textPrimary,
                        mb: 2,
                        pl: 3,
                        '& li': { mb: 1 }
                      },
                      '& blockquote': {
                        borderLeft: 4,
                        borderColor: colors.primary,
                        pl: 3,
                        py: 1,
                        my: 3,
                        bgcolor: colors.backgroundField,
                        fontStyle: 'italic',
                        color: colors.textSecondary
                      },
                      '& a': {
                        color: colors.primary,
                        textDecoration: 'none',
                        '&:hover': { textDecoration: 'underline' }
                      },
                      '& img': {
                        maxWidth: '100%',
                        height: 'auto',
                        borderRadius: SIZES.borderRadius.sm,
                        my: 2
                      },
                      '& code': {
                        bgcolor: colors.backgroundField,
                        color: colors.primary,
                        px: 1,
                        py: 0.5,
                        borderRadius: SIZES.borderRadius.sm,
                        fontFamily: 'monospace'
                      },
                      '& pre': {
                        bgcolor: colors.backgroundField,
                        p: 2,
                        borderRadius: SIZES.borderRadius.sm,
                        overflow: 'auto',
                        '& code': { bgcolor: 'transparent', p: 0 }
                      }
                    }}
                    dangerouslySetInnerHTML={{ __html: article.content }}
                  />
                </Paper>
              </Fade>

              {/* Теги */}
              {article.tags && article.tags.length > 0 && (
                <Fade in timeout={1100}>
                  <Paper sx={{ ...cardStyles, mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <TagIcon sx={{ color: colors.textSecondary }} />
                      <Typography variant="h6" sx={{ color: colors.textPrimary }}>
                        Теги
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {article.tags.map((tag) => (
                        <Chip
                          key={tag}
                          label={`#${tag}`}
                          variant="outlined"
                          size="small"
                          sx={{ color: colors.textSecondary }}
                        />
                      ))}
                    </Box>
                  </Paper>
                </Fade>
              )}
            </Box>
          </Fade>
        </Grid>

        {/* Боковая панель */}
        <Grid item xs={12} lg={4}>
          <Fade in timeout={600}>
            <Box>
              {/* Информация о статье */}
              <Paper sx={{ ...cardStyles, mb: 3 }}>
                <Typography variant="h6" sx={{ color: colors.textPrimary, mb: 3 }}>
                  О статье
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                      Категория:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, color: colors.textPrimary }}>
                      {article.category_name}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                      Автор:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, color: colors.textPrimary }}>
                      {article.author.name}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                      Опубликовано:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, color: colors.textPrimary }}>
                      {formatDate(article.published_at)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                      Время чтения:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, color: colors.textPrimary }}>
                      {article.reading_time} минут
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                      Просмотры:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, color: colors.textPrimary }}>
                      {article.views_count.toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              {/* Связанные статьи */}
              {relatedArticles && relatedArticles.length > 0 && (
                <Paper sx={{ ...cardStyles }}>
                  <Typography variant="h6" sx={{ color: colors.textPrimary, mb: 3 }}>
                    Похожие статьи
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {relatedArticles.slice(0, 3).map((relatedArticle) => (
                      <Card 
                        key={relatedArticle.id}
                        sx={{ 
                          cursor: 'pointer',
                          transition: SIZES.transitions.medium,
                          '&:hover': { 
                            transform: 'translateY(-2px)',
                            boxShadow: 2
                          }
                        }}
                        onClick={() => navigate(`/articles/${relatedArticle.id}`)}
                      >
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                          <Typography 
                            variant="subtitle2" 
                            sx={{ 
                              fontWeight: 600,
                              color: colors.textPrimary,
                              mb: 1,
                              lineHeight: 1.3
                            }}
                          >
                            {relatedArticle.title}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: colors.textSecondary,
                              display: 'block',
                              mb: 1
                            }}
                          >
                            {relatedArticle.excerpt}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ScheduleIcon sx={{ fontSize: 14, color: colors.textSecondary }} />
                            <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                              {relatedArticle.reading_time} мин
                            </Typography>
                            <VisibilityIcon sx={{ fontSize: 14, color: colors.textSecondary, ml: 1 }} />
                            <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                              {relatedArticle.views_count}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                </Paper>
              )}
            </Box>
          </Fade>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ArticleViewPage; 