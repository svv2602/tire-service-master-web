import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Chip,
  Button,
  Grid,
  CircularProgress,
  useTheme,
  Breadcrumbs,
  Fade
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Schedule as ScheduleIcon,
  Visibility as VisibilityIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { useArticle, useRelatedArticles, useArticleCategories } from '../../hooks/useArticles';
import ArticleCard from '../../components/knowledge-base/ArticleCard';
import ClientNavigation from '../../components/client/ClientNavigation';
import { getThemeColors, getCardStyles, getButtonStyles } from '../../styles';

const ArticleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const theme = useTheme();
  const colors = getThemeColors(theme);
  const cardStyles = getCardStyles(theme, 'primary');
  const buttonStyles = getButtonStyles(theme, 'primary');

  const { article, loading, error } = useArticle(id ? parseInt(id) : null);
  const { articles: relatedArticles } = useRelatedArticles(article?.id || null, 3);
  const { categories } = useArticleCategories();

  // Состояние для уведомлений
  const [shareMessage, setShareMessage] = useState('');

  // Получаем информацию о категории
  const categoryInfo = categories.find(cat => cat.key === article?.category);

  // Увеличиваем счетчик просмотров при загрузке статьи
  useEffect(() => {
    if (article) {
      // Здесь можно добавить API вызов для увеличения просмотров
      // articlesApi.incrementViews(article.id);
    }
  }, [article]);

  // Функция форматирования даты
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Получение иконки категории
  const getCategoryIcon = (category: string) => {
    const icons = {
      seasonal: '🍂',
      tips: '💡',
      maintenance: '🔧',
      selection: '🔍',
      safety: '🛡️',
      reviews: '⭐',
      news: '📰'
    };
    return icons[category as keyof typeof icons] || '📄';
  };

  // Обработчики
  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const url = window.location.href;
    const title = article?.title || 'Статья';
    
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch (err) {
        console.log('Ошибка при шаринге:', err);
      }
    } else {
      // Fallback - копируем ссылку в буфер обмена
      try {
        await navigator.clipboard.writeText(url);
        setShareMessage('Ссылка скопирована в буфер обмена!');
        setTimeout(() => setShareMessage(''), 3000);
      } catch (err) {
        console.log('Ошибка при копировании:', err);
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: colors.backgroundPrimary }}>
        <ClientNavigation colors={colors} secondaryButtonStyles={getButtonStyles(theme, 'secondary')} />
        <Container maxWidth="lg" sx={{ py: 6 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
            <CircularProgress size={60} />
          </Box>
        </Container>
      </Box>
    );
  }

  if (error || !article) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: colors.backgroundPrimary }}>
        <ClientNavigation colors={colors} secondaryButtonStyles={getButtonStyles(theme, 'secondary')} />
        <Container maxWidth="lg" sx={{ py: 6 }}>
          <Paper sx={{ ...cardStyles, textAlign: 'center', py: 8 }}>
            <Typography variant="h1" sx={{ fontSize: '4rem', mb: 2 }}>❌</Typography>
            <Typography variant="h5" sx={{ color: colors.textPrimary, mb: 1 }}>
              Статья не найдена
            </Typography>
            <Typography variant="body1" sx={{ color: colors.textSecondary, mb: 4 }}>
              {error || 'Запрошенная статья не существует или была удалена'}
            </Typography>
            <Button
              component={Link}
              to="/knowledge-base"
              variant="contained"
              sx={buttonStyles}
            >
              Вернуться к статьям
            </Button>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: colors.backgroundPrimary }}>
      <ClientNavigation colors={colors} secondaryButtonStyles={getButtonStyles(theme, 'secondary')} />
      
      {/* Breadcrumbs */}
      <Box sx={{ backgroundColor: colors.backgroundSecondary, py: 2 }}>
        <Container maxWidth="lg">
          <Breadcrumbs>
            <Link to="/" style={{ color: colors.primary, textDecoration: 'none' }}>
              Главная
            </Link>
            <Link to="/knowledge-base" style={{ color: colors.primary, textDecoration: 'none' }}>
              База знаний
            </Link>
            <Typography color="text.primary">{article.title}</Typography>
          </Breadcrumbs>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={4}>
          {/* Основной контент */}
          <Grid item xs={12} lg={8}>
            <Fade in timeout={600}>
              <Box>
                {/* Заголовок статьи */}
                <Paper sx={{ ...cardStyles, p: 4, mb: 4 }}>
                  {/* Категория и статус */}
                  <Box sx={{ mb: 3 }}>
                    <Chip
                      label={`${getCategoryIcon(article.category)} ${categoryInfo?.name || article.category}`}
                      color="primary"
                      sx={{ mr: 1 }}
                    />
                    {article.featured && (
                      <Chip
                        icon={<StarIcon />}
                        label="Рекомендуется"
                        color="warning"
                        variant="outlined"
                      />
                    )}
                  </Box>

                  <Typography variant="h3" component="h1" sx={{ 
                    fontWeight: 700, 
                    color: colors.textPrimary, 
                    mb: 3,
                    lineHeight: 1.2
                  }}>
                    {article.title}
                  </Typography>

                  {article.excerpt && (
                    <Typography variant="h6" sx={{ 
                      color: colors.textSecondary, 
                      mb: 4,
                      lineHeight: 1.4
                    }}>
                      {article.excerpt}
                    </Typography>
                  )}

                  {/* Метаинформация */}
                  <Box sx={{ 
                    display: 'flex', 
                    flexWrap: 'wrap',
                    gap: 3,
                    py: 3,
                    borderTop: `1px solid ${colors.border}`,
                    borderBottom: `1px solid ${colors.border}`
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PersonIcon sx={{ fontSize: 20, color: colors.textSecondary }} />
                      <Box>
                        <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                          Автор
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {article.author?.name || 'Неизвестный автор'}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarIcon sx={{ fontSize: 20, color: colors.textSecondary }} />
                      <Box>
                        <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                          Дата публикации
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {formatDate(article.published_at || article.created_at)}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ScheduleIcon sx={{ fontSize: 20, color: colors.textSecondary }} />
                      <Box>
                        <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                          Время чтения
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {article.reading_time || 5} мин
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <VisibilityIcon sx={{ fontSize: 20, color: colors.textSecondary }} />
                      <Box>
                        <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                          Просмотры
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {article.views_count?.toLocaleString() || '0'}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* Действия */}
                  <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                    <Button
                      variant="outlined"
                      startIcon={<PrintIcon />}
                      onClick={handlePrint}
                      size="small"
                    >
                      Печать
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<ShareIcon />}
                      onClick={handleShare}
                      size="small"
                    >
                      Поделиться
                    </Button>
                  </Box>

                  {shareMessage && (
                    <Typography variant="body2" sx={{ color: colors.success, mt: 2 }}>
                      {shareMessage}
                    </Typography>
                  )}
                </Paper>

                {/* Главное изображение */}
                {article.featured_image && (
                  <Paper sx={{ ...cardStyles, p: 0, mb: 4, overflow: 'hidden' }}>
                    <Box
                      component="img"
                      src={article.featured_image}
                      alt={article.title}
                      sx={{ 
                        width: '100%', 
                        height: 400, 
                        objectFit: 'cover',
                        display: 'block'
                      }}
                    />
                  </Paper>
                )}

                {/* Содержимое статьи */}
                <Paper sx={{ ...cardStyles, p: 4, mb: 4 }}>
                  <Box 
                    sx={{
                      '& h1, & h2, & h3, & h4, & h5, & h6': {
                        color: colors.textPrimary,
                        fontWeight: 600,
                        mt: 3,
                        mb: 2,
                      },
                      '& p': {
                        color: colors.textPrimary,
                        lineHeight: 1.7,
                        mb: 2,
                      },
                      '& a': {
                        color: colors.primary,
                        textDecoration: 'none',
                        '&:hover': {
                          textDecoration: 'underline',
                        },
                      },
                      '& img': {
                        maxWidth: '100%',
                        height: 'auto',
                        borderRadius: 1,
                        my: 2,
                      },
                      '& blockquote': {
                        borderLeft: `4px solid ${colors.primary}`,
                        pl: 2,
                        py: 1,
                        backgroundColor: colors.backgroundSecondary,
                        borderRadius: 1,
                        fontStyle: 'italic',
                      },
                    }}
                    dangerouslySetInnerHTML={{ __html: article.content }}
                  />
                </Paper>

                {/* Теги */}
                {article.tags && article.tags.length > 0 && (
                  <Paper sx={{ ...cardStyles, p: 3, mb: 4 }}>
                    <Typography variant="h6" sx={{ color: colors.textPrimary, mb: 2, fontWeight: 600 }}>
                      Теги
                    </Typography>
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
                )}

                {/* Навигация */}
                <Paper sx={{ ...cardStyles, p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Button
                      component={Link}
                      to="/knowledge-base"
                      variant="outlined"
                      startIcon={<ArrowBackIcon />}
                    >
                      Все статьи
                    </Button>
                  </Box>
                </Paper>
              </Box>
            </Fade>
          </Grid>

          {/* Боковая панель */}
          <Grid item xs={12} lg={4}>
            <Fade in timeout={800}>
              <Box sx={{ position: 'sticky', top: 24 }}>
                {/* Информация о статье */}
                <Paper sx={{ ...cardStyles, p: 3, mb: 3 }}>
                  <Typography variant="h6" sx={{ color: colors.textPrimary, mb: 2, fontWeight: 600 }}>
                    О статье
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                        Категория:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {categoryInfo?.name}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                        Время чтения:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {article.reading_time || 5} мин
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                        Просмотры:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {article.views_count?.toLocaleString() || '0'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                        Обновлено:
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
                      Похожие статьи
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

                {/* CTA блок */}
                <Paper sx={{ 
                  ...cardStyles, 
                  p: 3,
                  background: `linear-gradient(135deg, ${colors.backgroundSecondary} 0%, ${colors.backgroundPrimary} 100%)`,
                  textAlign: 'center'
                }}>
                  <Typography variant="h1" sx={{ fontSize: '3rem', mb: 2 }}>🔧</Typography>
                  <Typography variant="h6" sx={{ color: colors.textPrimary, mb: 1, fontWeight: 600 }}>
                    Нужна помощь?
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 3 }}>
                    Наши эксперты помогут подобрать шины и проконсультируют по любым вопросам
                  </Typography>
                  <Button
                    component={Link}
                    to="/contacts"
                    variant="contained"
                    sx={buttonStyles}
                  >
                    Связаться с нами
                  </Button>
                </Paper>
              </Box>
            </Fade>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default ArticleDetailPage;
