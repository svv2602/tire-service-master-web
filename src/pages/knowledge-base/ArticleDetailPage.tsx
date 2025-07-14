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
  const { t } = useTranslation();
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
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
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Fade in timeout={600}>
            <Box>


              {/* Кнопка назад */}
              <Button
                component={Link}
                to="/knowledge-base"
                startIcon={<ArrowBackIcon />}
                sx={{ 
                  ...secondaryButtonStyles,
                  mb: 4,
                  color: colors.textSecondary,
                  '&:hover': {
                    backgroundColor: colors.backgroundSecondary,
                    color: colors.primary
                  }
                }}
              >
                {t('forms.articles.detail.backToArticles')}
              </Button>

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
                            {formatDate(article.created_at)}
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
                      {article.excerpt && (
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            color: colors.textSecondary, 
                            fontWeight: 400,
                            fontStyle: 'italic',
                            mb: 3,
                            p: 3,
                            backgroundColor: colors.backgroundSecondary,
                            borderRadius: 2,
                            borderLeft: `4px solid ${colors.primary}`
                          }}
                        >
                          {article.excerpt}
                        </Typography>
                      )}
                    </Box>

                    <Divider sx={{ borderColor: colors.backgroundSecondary }} />

                    {/* Основное изображение */}
                    {article.featured_image && (
                      <Box sx={{ p: 4, pb: 2 }}>
                        <Box
                          component="img"
                          src={article.featured_image}
                          alt={article.title}
                          sx={{
                            width: '100%',
                            height: 'auto',
                            maxHeight: 400,
                            objectFit: 'cover',
                            borderRadius: 2,
                            boxShadow: theme.shadows[3]
                          }}
                        />
                      </Box>
                    )}

                    {/* Контент статьи */}
                    <Box 
                      sx={{ 
                        p: 4,
                        '& h1, & h2, & h3, & h4, & h5, & h6': {
                          color: colors.textPrimary,
                          fontWeight: 600,
                          mt: 3,
                          mb: 2
                        },
                        '& h1': { fontSize: '2rem' },
                        '& h2': { fontSize: '1.75rem' },
                        '& h3': { fontSize: '1.5rem' },
                        '& p': {
                          color: colors.textPrimary,
                          lineHeight: 1.7,
                          mb: 2,
                          fontSize: '1.1rem'
                        },
                        '& ul, & ol': {
                          color: colors.textPrimary,
                          pl: 3,
                          mb: 2
                        },
                        '& li': {
                          mb: 1,
                          lineHeight: 1.6
                        },
                        '& blockquote': {
                          borderLeft: `4px solid ${colors.primary}`,
                          backgroundColor: colors.backgroundSecondary,
                          pl: 3,
                          py: 2,
                          my: 3,
                          fontStyle: 'italic',
                          color: colors.textSecondary
                        },
                        '& code': {
                          backgroundColor: colors.backgroundSecondary,
                          padding: '2px 6px',
                          borderRadius: 1,
                          fontSize: '0.9em',
                          fontFamily: 'monospace'
                        },
                        '& pre': {
                          backgroundColor: colors.backgroundSecondary,
                          p: 2,
                          borderRadius: 2,
                          overflow: 'auto',
                          my: 2
                        },
                        '& img': {
                          maxWidth: '100%',
                          height: 'auto',
                          borderRadius: 2,
                          my: 2
                        },
                        '& a': {
                          color: colors.primary,
                          textDecoration: 'none',
                          '&:hover': {
                            textDecoration: 'underline'
                          }
                        }
                      }}
                      dangerouslySetInnerHTML={{ __html: getLocalizedArticleContent(article) }}
                    />
                  </Paper>
                </Grid>

                {/* Боковая панель */}
                <Grid item xs={12} lg={4}>
                  {/* Связанные статьи */}
                  {relatedArticles.length > 0 && (
                    <Card sx={cardStyles}>
                      <CardContent>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            color: colors.textPrimary, 
                            fontWeight: 600, 
                            mb: 3 
                          }}
                        >
                          {t('forms.articles.detail.relatedArticles')}
                        </Typography>
                        {relatedLoading ? (
                          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress size={32} />
                          </Box>
                        ) : (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {relatedArticles.map((relatedArticle) => (
                              <ArticleCard 
                                key={relatedArticle.id} 
                                article={relatedArticle} 
                                variant="compact"
                              />
                            ))}
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Призыв к действию */}
                  <Card sx={{ ...cardStyles, mt: 3 }}>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          color: colors.textPrimary, 
                          fontWeight: 600, 
                          mb: 2 
                        }}
                      >
                        {t('forms.articles.detail.needHelp')}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: colors.textSecondary, 
                          mb: 3 
                        }}
                      >
                        {t('forms.articles.detail.helpDescription')}
                      </Typography>
                      <Button
                        component={Link}
                        to="/client/booking"
                        variant="contained"
                        fullWidth
                        sx={buttonStyles}
                      >
                        {t('forms.articles.detail.bookService')}
                      </Button>
                    </CardContent>
                  </Card>
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