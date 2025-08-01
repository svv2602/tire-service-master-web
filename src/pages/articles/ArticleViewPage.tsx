import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Chip,
  Paper,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Grid,
  Fade,
  Divider,
  Card,
  CardContent,
  CardMedia
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Share as ShareIcon,
  Print as PrintIcon,
  Star as StarIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  Visibility as VisibilityIcon,
  LocalOffer as TagIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

// Импорт хуков и утилит
import { useArticle, useRelatedArticles } from '../../hooks/useArticles';
import { useRoleAccess } from '../../hooks/useRoleAccess';

// Импорт централизованной системы стилей
import { getCardStyles, getButtonStyles } from '../../styles/components';
import { getThemeColors } from '../../styles/theme';
import { useLocalizedArticleTitle, useLocalizedArticleExcerpt } from '../../utils/articleLocalizationHelpers';
import ClientLayout from '../../components/client/ClientLayout';

const ArticleViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const { t } = useTranslation();
  const colors = getThemeColors(theme);
  
  // Хуки для локализации
  const localizedTitle = useLocalizedArticleTitle();
  const localizedExcerpt = useLocalizedArticleExcerpt();
  
  // Права доступа
  const { canManageAllData } = useRoleAccess();
  
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
      <ClientLayout>
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
              {t('forms.articles.loadingArticles')}
            </Typography>
          </Box>
        </Container>
      </ClientLayout>
    );
  }

  if (error || !article) {
    return (
      <ClientLayout>
        <Container maxWidth="xl" sx={{ py: 3 }}>
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Alert severity="error" sx={{ mb: 3, display: 'inline-block' }}>
              {error || t('forms.articles.articlesNotFound')}
            </Alert>
            <Box>
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/knowledge-base')}
                sx={secondaryButtonStyles}
              >
                {t('common.back')} к списку статей
              </Button>
            </Box>
          </Box>
        </Container>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Навигация */}
      <Fade in timeout={300}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/knowledge-base')}
            sx={secondaryButtonStyles}
          >
            {t('common.back')} к списку статей
          </Button>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title={t('common.share', 'Поделиться')}>
              <IconButton size="small" sx={{ color: colors.textSecondary }}>
                <ShareIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('common.print', 'Печать')}>
              <IconButton size="small" sx={{ color: colors.textSecondary }}>
                <PrintIcon />
              </IconButton>
            </Tooltip>
            {canManageAllData && (
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => navigate(`/admin/articles/${article.id}/edit`)}
                sx={buttonStyles}
                size="small"
              >
                {t('common.edit')}
              </Button>
            )}
          </Box>
        </Box>
      </Fade>

      {/* Основное содержимое */}
      <Grid container spacing={4}>
        <Grid item xs={12} lg={8}>
          <Fade in timeout={500}>
            <Paper sx={{ ...cardStyles, overflow: 'visible' }}>
              {/* Заголовок статьи */}
              <Box sx={{ position: 'relative', mb: 4 }}>
                {/* Статусы и метки */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Chip
                    label={article.status === 'published' ? t('forms.articles.status.published') : 
                          article.status === 'draft' ? t('forms.articles.status.draft') : 
                          t('forms.articles.status.archived')}
                    color={getStatusColor(article.status)}
                    size="small"
                  />
                  {article.featured && (
                    <Chip
                      icon={<StarIcon />}
                      label={t('forms.articles.meta.featured')}
                      color="warning"
                      size="small"
                    />
                  )}
                </Box>

                {/* Заголовок */}
                <Typography variant="h3" component="h1" sx={{
                  fontSize: { xs: '1.75rem', md: '2.5rem' },
                  fontWeight: 800,
                  color: colors.textPrimary,
                  lineHeight: 1.2,
                  mb: 2
                }}>
                  {localizedTitle(article)}
                </Typography>

                {/* Описание */}
                {localizedExcerpt(article) && (
                  <Typography variant="h6" sx={{
                    color: colors.textSecondary,
                    fontWeight: 400,
                    lineHeight: 1.5,
                    mb: 3
                  }}>
                    {localizedExcerpt(article)}
                  </Typography>
                )}

                {/* Метаинформация */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon sx={{ fontSize: 16, color: colors.textSecondary }} />
                    <Typography variant="body2">{article.author?.name || t('forms.articles.meta.unknownAuthor')}</Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ScheduleIcon sx={{ fontSize: 16, color: colors.textSecondary }} />
                    <Typography variant="body2">{formatDate(article.published_at || null)}</Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ScheduleIcon sx={{ fontSize: 16, color: colors.textSecondary }} />
                    <Typography variant="body2">{article.reading_time || 5} {t('forms.articles.meta.readingTime')}</Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <VisibilityIcon sx={{ fontSize: 16, color: colors.textSecondary }} />
                    <Typography variant="body2">{article.views_count?.toLocaleString() || '0'} просмотров</Typography>
                  </Box>
                </Box>
              </Box>

              {/* Главное изображение */}
              {article.featured_image && (
                <Box sx={{ mb: 4, borderRadius: 2, overflow: 'hidden' }}>
                  <img
                    src={article.featured_image}
                    alt={article.title}
                    style={{
                      width: '100%',
                      height: 'auto',
                      maxHeight: '400px',
                      objectFit: 'cover',
                      display: 'block'
                    }}
                  />
                </Box>
              )}

              {/* Содержимое статьи */}
              <Box 
                sx={{ 
                  '& > *': { mb: 2 },
                  '& p': {
                    fontSize: '1.1rem',
                    lineHeight: 1.8,
                    color: colors.textPrimary,
                    textAlign: 'justify'
                  },
                  '& h1, & h2, & h3, & h4, & h5, & h6': {
                    color: colors.textPrimary,
                    fontWeight: 600,
                    mt: 3,
                    mb: 2
                  },
                  '& ul, & ol': {
                    pl: 3
                  },
                  '& li': {
                    mb: 1,
                    fontSize: '1.1rem',
                    lineHeight: 1.7
                  },
                  '& img': {
                    maxWidth: '100%',
                    height: 'auto',
                    borderRadius: 1,
                    my: 2
                  },
                  '& blockquote': {
                    borderLeft: `4px solid ${theme.palette.primary.main}`,
                    pl: 2,
                    py: 1,
                    my: 2,
                    fontStyle: 'italic',
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                    borderRadius: 1
                  },
                  '& code': {
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                    padding: '2px 6px',
                    borderRadius: 1,
                    fontSize: '0.9em',
                    fontFamily: 'monospace'
                  },
                  '& pre': {
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                    p: 2,
                    borderRadius: 1,
                    overflow: 'auto',
                    '& code': {
                      backgroundColor: 'transparent',
                      padding: 0
                    }
                  }
                }}
                dangerouslySetInnerHTML={{ __html: article.content }}
              />

              {/* Теги */}
              {article.tags && article.tags.length > 0 && (
                <Box sx={{ mt: 4, pt: 3, borderTop: `1px solid ${theme.palette.divider}` }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <TagIcon sx={{ fontSize: 18, color: colors.textSecondary }} />
                    <Typography variant="h6" sx={{ color: colors.textPrimary, fontWeight: 600 }}>
                      {t('common.tags')}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {article.tags.map((tag: string) => (
                      <Chip
                        key={tag}
                        label={tag}
                        variant="outlined"
                        size="small"
                        sx={{ borderRadius: 1 }}
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Paper>
          </Fade>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Fade in timeout={600}>
            <Box>
              {/* Информация о статье */}
              <Paper sx={{ ...cardStyles, mb: 3 }}>
                <Typography variant="h6" sx={{ color: colors.textPrimary, mb: 3 }}>
                  {t('forms.articles.meta.about')}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                      {t('forms.articles.columns.category')}:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, color: colors.textPrimary }}>
                      {article.category_name}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                      {t('forms.articles.meta.author')}:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, color: colors.textPrimary }}>
                      {article.author?.name || t('forms.articles.meta.unknownAuthor')}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                      {t('forms.articles.meta.publishedAt')}:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, color: colors.textPrimary }}>
                      {formatDate(article.published_at || null)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                      {t('forms.articles.meta.readingTimeLabel')}:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, color: colors.textPrimary }}>
                      {article.reading_time || 5} {t('forms.articles.meta.readingTimeMinutes')}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                      {t('forms.articles.columns.views')}:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, color: colors.textPrimary }}>
                      {article.views_count?.toLocaleString() || '0'}
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              {/* Связанные статьи */}
              {relatedArticles && relatedArticles.length > 0 && (
                <Paper sx={cardStyles}>
                  <Typography variant="h6" sx={{ color: colors.textPrimary, mb: 3 }}>
                    {t('forms.articles.relatedArticles.title')}
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {relatedArticles.slice(0, 3).map((relatedArticle: any) => (
                      <Card
                        key={relatedArticle.id}
                        sx={{
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: theme.shadows[4]
                          }
                        }}
                        onClick={() => navigate(`/knowledge-base/articles/${relatedArticle.id}`)}
                      >
                        {relatedArticle.image_url && (
                          <CardMedia
                            component="img"
                            height="100"
                            image={relatedArticle.image_url}
                            alt={localizedTitle(relatedArticle)}
                            sx={{ objectFit: 'cover' }}
                          />
                        )}
                        <CardContent sx={{ p: 2 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                            {localizedTitle(relatedArticle)}
                          </Typography>
                          {relatedArticle.excerpt && (
                            <Typography
                              variant="caption"
                              sx={{
                                color: colors.textSecondary,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                              }}
                            >
                              {relatedArticle.excerpt}
                            </Typography>
                          )}
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
    </ClientLayout>
  );
};

export default ArticleViewPage; 