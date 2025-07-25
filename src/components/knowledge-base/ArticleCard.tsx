import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  Box,
  useTheme
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  Visibility as VisibilityIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { ArticleSummary } from '../../types/articles';
import { getThemeColors, getCardStyles } from '../../styles';
import { 
  getLocalizedArticleTitle, 
  getLocalizedArticleExcerpt 
} from '../../utils/articleLocalizationHelpers';

interface ArticleCardProps {
  article: ArticleSummary;
  variant?: 'default' | 'featured' | 'compact';
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, variant = 'default' }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const colors = getThemeColors(theme);
  const cardStyles = getCardStyles(theme, 'primary');

  // Получаем локализованные значения
  const localizedTitle = getLocalizedArticleTitle(article);
  const localizedExcerpt = getLocalizedArticleExcerpt(article);

  // Форматирование даты
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
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

  // Обработчик клика для автофокуса на кнопку "Вернуться к базе знаний"
  const handleClick = () => {
    // Небольшая задержка для завершения навигации
    setTimeout(() => {
      // Ищем кнопку по тексту или aria-label
      const backButton = document.querySelector('a[href="/knowledge-base"]') as HTMLElement;
      if (backButton) {
        backButton.focus();
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    }, 400);
  };

  // Компактный вариант для боковой панели
  if (variant === 'compact') {
    return (
      <Card 
        component={Link}
        to={`/knowledge-base/articles/${article.id}`}
        onClick={handleClick}
        sx={{
          ...cardStyles,
          display: 'flex',
          mb: 2,
          textDecoration: 'none',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: 3
          }
        }}
      >
        <CardMedia
          component="div"
          sx={{
            width: 80,
            height: 80,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.backgroundSecondary,
            flexShrink: 0
          }}
        >
          {article.featured_image ? (
            <Box
              component="img"
              src={article.featured_image}
              alt={localizedTitle}
              sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <Typography variant="h4" component="span">
              {getCategoryIcon(article.category)}
            </Typography>
          )}
        </CardMedia>
        <CardContent sx={{ flex: 1, p: 2, '&:last-child': { pb: 2 } }}>
          <Typography 
            variant="subtitle2" 
            component="h3"
            sx={{ 
              color: colors.textPrimary,
              fontWeight: 600,
              mb: 0.5,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}
          >
            {localizedTitle}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ScheduleIcon sx={{ fontSize: 14, color: colors.textSecondary }} />
                          <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                {article.reading_time || 5} {t('forms.articles.meta.readingTime')}
              </Typography>
            <VisibilityIcon sx={{ fontSize: 14, color: colors.textSecondary, ml: 1 }} />
            <Typography variant="caption" sx={{ color: colors.textSecondary }}>
              {article.views_count || 0}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Основной вариант карточки
  const cardHeight = variant === 'featured' ? 400 : 350;
  const imageHeight = variant === 'featured' ? 200 : 180;

  return (
    <Card 
      component={Link}
      to={`/knowledge-base/articles/${article.id}`}
      onClick={handleClick}
      sx={{
        ...cardStyles,
        height: cardHeight,
        display: 'flex',
        flexDirection: 'column',
        textDecoration: 'none',
        transition: 'all 0.3s ease-in-out',
        position: 'relative',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6
        }
      }}
    >
      {/* Изображение */}
      <CardMedia
        component="div"
        sx={{
          height: imageHeight,
          position: 'relative',
          backgroundColor: colors.backgroundSecondary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {article.featured_image ? (
          <Box
            component="img"
            src={article.featured_image}
            alt={localizedTitle}
            sx={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover',
              transition: 'transform 0.3s ease-in-out',
              '&:hover': {
                transform: 'scale(1.05)'
              }
            }}
          />
        ) : (
          <Typography variant="h1" component="span" sx={{ fontSize: '4rem', opacity: 0.3 }}>
            {getCategoryIcon(article.category)}
          </Typography>
        )}

        {/* Метка рекомендуемого */}
        {article.featured && (
          <Chip
            icon={<StarIcon />}
            label={t('forms.articles.meta.featured')}
            color="warning"
            size="small"
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              fontWeight: 600
            }}
          />
        )}

        {/* Категория */}
        <Chip
          label={article.category_name}
          size="small"
          sx={{
            position: 'absolute',
            bottom: 12,
            left: 12,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            fontWeight: 500
          }}
        />
      </CardMedia>

      {/* Контент */}
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 3 }}>
        <Typography 
          variant={variant === 'featured' ? 'h6' : 'subtitle1'}
          component="h2"
          sx={{ 
            color: colors.textPrimary,
            fontWeight: 600,
            mb: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            minHeight: variant === 'featured' ? 56 : 48
          }}
        >
          {localizedTitle}
        </Typography>
        
        {localizedExcerpt && (
          <Typography 
            variant="body2" 
            sx={{ 
              color: colors.textSecondary,
              mb: 2,
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: variant === 'featured' ? 3 : 2,
              WebkitBoxOrient: 'vertical'
            }}
          >
            {localizedExcerpt}
          </Typography>
        )}

        {/* Метаинформация */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mt: 'auto'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <ScheduleIcon sx={{ fontSize: 16, color: colors.textSecondary }} />
              <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                {article.reading_time || 5} {t('forms.articles.meta.readingTime')}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <VisibilityIcon sx={{ fontSize: 16, color: colors.textSecondary }} />
              <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                {article.views_count?.toLocaleString() || '0'}
              </Typography>
            </Box>
          </Box>
          
          <Typography variant="caption" sx={{ color: colors.textSecondary }}>
            {formatDate(article.published_at || null)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ArticleCard;
