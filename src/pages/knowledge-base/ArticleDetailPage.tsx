import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Container,
  Typography,
  Paper,
  Chip,
  Button,
  CircularProgress,
  useTheme,
  Fade,
  Divider,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Visibility as ViewIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useArticle, useRelatedArticles } from '../../hooks/useArticles';
import ArticleCard from '../../components/knowledge-base/ArticleCard';
import { getThemeColors, getButtonStyles, getCardStyles } from '../../styles';
import { 
  getLocalizedArticleTitle, 
  getLocalizedArticleContent,
  getLocalizedArticleExcerpt 
} from '../../utils/articleLocalizationHelpers';
import ClientLayout from '../../components/client/ClientLayout';

const ArticleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const colors = getThemeColors(theme);
  const cardStyles = getCardStyles(theme, 'primary');
  const buttonStyles = getButtonStyles(theme, 'primary');
  const secondaryButtonStyles = getButtonStyles(theme, 'secondary');

  const { article, loading, error } = useArticle(id || null);
  const { articles: relatedArticles, loading: relatedLoading } = useRelatedArticles(
    id ? Number(id) : null, 
    3
  );

  if (loading) {
    return (
      <ClientLayout>
        <Box sx={{ minHeight: '100vh', backgroundColor: colors.backgroundPrimary }}>
          <Container maxWidth="lg" sx={{ py: 6 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress size={48} />
            </Box>
          </Container>
        </Box>
      </ClientLayout>
    );
  }

  if (error || !article) {
    return (
      <ClientLayout>
        <Box sx={{ minHeight: '100vh', backgroundColor: colors.backgroundPrimary }}>
          <Container maxWidth="lg" sx={{ py: 6 }}>
            <Paper sx={{ ...cardStyles, textAlign: 'center', py: 8 }}>
              <Typography variant="h1" sx={{ fontSize: '4rem', mb: 2 }}>❌</Typography>
              <Typography variant="h5" sx={{ color: colors.textPrimary, mb: 2 }}>
                {t('forms.articles.detail.notFound')}
              </Typography>
              <Typography variant="body1" sx={{ color: colors.textSecondary, mb: 4 }}>
                {error || t('forms.articles.detail.notFoundDescription')}
              </Typography>
              <Button
                component={Link}
                to="/knowledge-base"
                variant="contained"
                startIcon={<ArrowBackIcon />}
                sx={buttonStyles}
              >
                {t('forms.articles.detail.backToKnowledgeBase')}
              </Button>
            </Paper>
          </Container>
        </Box>
      </ClientLayout>
    );
  }

  // Исправленная функция форматирования даты с проверкой валидности
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '—';
    
    try {
      const date = new Date(dateString);
      // Проверяем, что дата валидна
      if (isNaN(date.getTime())) {
        return '—';
      }
      
      // Используем текущий язык интерфейса для форматирования
      const locale = i18n.language === 'uk' ? 'uk-UA' : 'ru-RU';
      return date.toLocaleDateString(locale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return '—';
    }
  };

  const formatReadingTime = (minutes: number) => {
    if (minutes < 1) return t('forms.articles.detail.readingTime.lessThanMinute');
    if (minutes === 1) return t('forms.articles.detail.readingTime.oneMinute');
    if (minutes < 5) return t('forms.articles.detail.readingTime.fewMinutes', { count: minutes });
    return t('forms.articles.detail.readingTime.manyMinutes', { count: minutes });
  };

  return (
    <ClientLayout>
      <Box sx={{ minHeight: '100vh', backgroundColor: colors.backgroundPrimary }}>
        <Container maxWidth="lg" sx={{ py: 6 }}>
          <Fade in timeout={500}>
            <Box>
              {/* Навигация */}
              <Box sx={{ mb: 4 }}>
                <Button
                  component={Link}
                  to="/knowledge-base"
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                  sx={secondaryButtonStyles}
                >
                  {t('forms.articles.detail.backToKnowledgeBase')}
                </Button>
              </Box>

              <Grid container spacing={4}>
                {/* Основной контент */}
                <Grid item xs={12} lg={8}>
                  <Paper sx={cardStyles}>
                    {/* Заголовок статьи */}
                    <Box sx={{ p: 4, pb: 2 }}>
                      <Typography 
                        variant="h3" 
                        component="h1" 
                        sx={{ 
                          color: colors.textPrimary, 
                          fontWeight: 700, 
                          mb: 3,
                          lineHeight: 1.2
                        }}
                      >
                        {getLocalizedArticleTitle(article)}
                      </Typography>

                      {/* Метаинформация */}
                      <Box sx={{ 
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        gap: 2, 
                        alignItems: 'center',
                        mb: 3
                      }}>
                        {article.author && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PersonIcon sx={{ fontSize: 18, color: colors.textSecondary }} />
                            <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                              {article.author.name}
                            </Typography>
                          </Box>
                        )}

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarIcon sx={{ fontSize: 18, color: colors.textSecondary }} />
                          <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                            {formatDate(article.published_at || article.created_at)}
                          </Typography>
                        </Box>

                        {article.reading_time && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ScheduleIcon sx={{ fontSize: 18, color: colors.textSecondary }} />
                            <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                              {formatReadingTime(article.reading_time)}
                            </Typography>
                          </Box>
                        )}

                        {article.views_count !== undefined && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ViewIcon sx={{ fontSize: 18, color: colors.textSecondary }} />
                            <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                              {t('forms.articles.detail.readingTime.views', { count: article.views_count })}
                            </Typography>
                          </Box>
                        )}
                      </Box>

                      {/* Категория */}
                      {article.category_name && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                          <Chip
                            label={article.category_name}
                            size="small"
                            sx={{
                              backgroundColor: colors.backgroundSecondary,
                              color: colors.primary,
                              fontWeight: 500,
                              '&:hover': {
                                backgroundColor: colors.primary,
                                color: 'white'
                              }
                            }}
                          />
                        </Box>
                      )}

                      {/* Описание */}
                      {getLocalizedArticleExcerpt(article) && (
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            color: colors.textSecondary, 
                            mb: 4,
                            fontWeight: 400,
                            lineHeight: 1.5
                          }}
                        >
                          {getLocalizedArticleExcerpt(article)}
                        </Typography>
                      )}
                    </Box>

                    <Divider />

                    {/* Содержимое статьи */}
                    <Box sx={{ p: 4 }}>
                      <Typography 
                        variant="body1" 
                        component="div"
                        sx={{ 
                          color: colors.textPrimary,
                          lineHeight: 1.7,
                          '& h1, & h2, & h3, & h4, & h5, & h6': {
                            color: colors.textPrimary,
                            fontWeight: 600,
                            mb: 2,
                            mt: 3
                          },
                          '& p': {
                            mb: 2
                          },
                          '& ul, & ol': {
                            mb: 2,
                            pl: 3
                          },
                          '& li': {
                            mb: 1
                          },
                          '& strong': {
                            fontWeight: 600
                          }
                        }}
                        dangerouslySetInnerHTML={{ 
                          __html: getLocalizedArticleContent(article) 
                        }}
                      />
                    </Box>
                  </Paper>
                </Grid>

                {/* Боковая панель */}
                <Grid item xs={12} lg={4}>
                  <Fade in timeout={800}>
                    <Box sx={{ position: 'sticky', top: 24 }}>
                      {/* Информация о статье */}
                      <Paper sx={{ ...cardStyles, p: 3, mb: 3 }}>
                        <Typography variant="h6" sx={{ color: colors.textPrimary, mb: 2, fontWeight: 600 }}>
                          {t('forms.articles.detail.aboutArticle')}
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                              {t('forms.articles.columns.category')}:
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {article.category_name}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                              {t('forms.articles.detail.readingTime.title')}:
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {formatReadingTime(article.reading_time || 5)}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                              {t('forms.articles.detail.views')}:
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {article.views_count?.toLocaleString() || '0'}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                              {t('forms.articles.detail.updated')}:
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {formatDate(article.updated_at)}
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>

                      {/* Похожие статьи */}
                      {relatedArticles.length > 0 && (
                        <Paper sx={{ ...cardStyles, p: 3, mb: 3 }}>
                          <Typography variant="h6" sx={{ color: colors.textPrimary, mb: 3, fontWeight: 600 }}>
                            {t('forms.articles.detail.relatedArticles')}
                          </Typography>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {relatedArticles.map((relatedArticle) => (
                              <ArticleCard
                                key={relatedArticle.id}
                                article={relatedArticle}
                                variant="compact"
                              />
                            ))}
                          </Box>
                        </Paper>
                      )}
                    </Box>
                  </Fade>
                </Grid>
              </Grid>
            </Box>
          </Fade>
        </Container>
      </Box>
    </ClientLayout>
  );
};

export default ArticleDetailPage;