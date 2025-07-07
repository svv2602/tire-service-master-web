import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import {
  Box,
  Container,
  Typography,
  Grid,
  CircularProgress,
  IconButton,
  Tooltip,
  useTheme,
  InputAdornment,
  Alert,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  TrendingUp as ChartIcon,
  Star as StarIcon,
  Schedule as TimeIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';

// Импорты UI компонентов
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/TextField';
import { Select } from '../../components/ui/Select';
import { Pagination } from '../../components/ui/Pagination';
import { Chip } from '../../components/ui/Chip';
import { Table, type Column } from '../../components/ui';

// Локальные импорты
import { useGetArticlesQuery, useGetCategoriesQuery } from '../../api/articles.api';
import { useArticleActions } from '../../hooks/useArticles';
import { ArticleSummary } from '../../types/articles';
import { SIZES } from '../../styles/theme';
import { 
  getCardStyles
} from '../../styles/components';

// Константы для статусов
const ArticlesPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const cardStyles = getCardStyles(theme);
  
  // Redux state
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Функция для получения переводов статусов
  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      published: t('admin.articles.status.published'),
      draft: t('admin.articles.status.draft'),
      archived: t('admin.articles.status.archived')
    };
    return statusMap[status] || status;
  };
  
  // Состояние для фильтров
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSort, setSelectedSort] = useState('recent');
  const [currentPage, setCurrentPage] = useState(1);

  // Подготовка фильтров для API
  const filters = useMemo(() => ({
    query: searchQuery || undefined,
    category: selectedCategory || undefined,
    page: currentPage,
    per_page: 12
  }), [searchQuery, selectedCategory, currentPage]);

  // Хуки для данных
  const { data, error, isLoading, refetch } = useGetArticlesQuery(filters);
  const { data: categoriesData } = useGetCategoriesQuery();
  const { deleteArticle } = useArticleActions();

  // Данные для отображения
  const displayArticles = useMemo(() => data?.data || [], [data?.data]);
  const displayPagination = useMemo(() => data?.meta || {
    current_page: 1,
    per_page: 12,
    total_pages: 0,
    total_count: 0,
  }, [data?.meta]);
  const categories = categoriesData || [];

  // Добавляем логирование для отладки
  React.useEffect(() => {
    console.log('📊 ArticlesPage: Данные обновились', {
      totalArticles: displayArticles.length,
      totalCount: displayPagination.total_count,
      filters,
      articles: displayArticles.map(a => ({ id: a.id, title: a.title, status: a.status })),
      error: error ? 'Есть ошибка' : 'Нет ошибки',
      isLoading
    });
    
    // Дополнительная отладка для проверки авторизации
    console.log('🔑 Статус авторизации:', isAuthenticated ? 'авторизован' : 'не авторизован');
  }, [displayArticles, displayPagination, filters, error, isLoading, isAuthenticated]);

  // Обработчики событий
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (value: string | number) => {
    setSelectedCategory(String(value));
    setCurrentPage(1);
  };

  const handleSortChange = (value: string | number) => {
    setSelectedSort(String(value));
    setCurrentPage(1);
  };

  const handlePageChange = (value: number) => {
    setCurrentPage(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDeleteArticle = useCallback(async (articleId: number) => {
    if (window.confirm(t('admin.articles.deleteConfirm'))) {
      try {
        console.log('Удаление статьи:', articleId);
        const result = await deleteArticle(articleId);
        
        if (result.success) {
          console.log('Статья успешно удалена');
          refetch(); // Обновляем список статей
        } else {
          console.error('Ошибка при удалении статьи:', result.error);
          alert(`${t('admin.articles.messages.deleteError')} ${result.error}`);
        }
      } catch (error) {
        console.error('Ошибка при удалении статьи:', error);
        alert(t('admin.articles.messages.deleteErrorGeneral'));
      }
    }
  }, [deleteArticle, refetch, t]);

  /**
   * Конфигурация колонок таблицы
   */
  const columns: Column[] = useMemo(() => [
    {
      id: 'title',
      label: t('admin.articles.columns.article'),
      wrap: true,
      format: (value, row: ArticleSummary) => (
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                color: theme.palette.text.primary,
                cursor: 'pointer',
                fontSize: SIZES.fontSize.md,
                '&:hover': { color: theme.palette.primary.main }
              }}
              onClick={() => navigate(`/admin/articles/${row.id}`)}
            >
              {row.title}
              {row.featured && (
                <Chip
                  icon={<StarIcon />}
                  label={t('admin.articles.meta.featured')}
                  size="small"
                  color="warning"
                  sx={{ ml: 1 }}
                />
              )}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.secondary,
                mt: 0.5,
                fontSize: SIZES.fontSize.sm,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {row.excerpt}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <TimeIcon sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                <Typography variant="caption" sx={{ 
                  color: theme.palette.text.secondary,
                  fontSize: SIZES.fontSize.xs 
                }}>
                  {row.reading_time || 5} {t('admin.articles.meta.readingTime')}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <PersonIcon sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                <Typography variant="caption" sx={{ 
                  color: theme.palette.text.secondary,
                  fontSize: SIZES.fontSize.xs 
                }}>
                  {row.author?.name || t('admin.articles.meta.author')}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      )
    },
    {
      id: 'category',
      label: t('admin.articles.columns.category'),
      format: (value, row: ArticleSummary) => (
        <Typography variant="body2" sx={{ 
          color: theme.palette.text.primary,
          fontSize: SIZES.fontSize.sm 
        }}>
          {row.category_name || row.category}
        </Typography>
      )
    },
    {
      id: 'status',
      label: t('tables.columns.status'),
      align: 'center',
      format: (value, row: ArticleSummary) => (
        <Chip
          label={getStatusLabel(row.status)}
          color={row.status === 'published' ? 'success' : row.status === 'draft' ? 'warning' : 'default'}
          size="small"
        />
      )
    },
    {
      id: 'views_count',
      label: t('admin.articles.columns.views'),
      align: 'center',
      format: (value, row: ArticleSummary) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <ViewIcon sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
          <Typography variant="body2" sx={{ 
            color: theme.palette.text.primary,
            fontSize: SIZES.fontSize.sm 
          }}>
            {row.views_count || 0}
          </Typography>
        </Box>
      )
    },
    {
      id: 'created_at',
      label: t('admin.articles.columns.date'),
      format: (value, row: ArticleSummary) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <CalendarIcon sx={{ fontSize: 14, color: theme.palette.text.secondary }} />
          <Typography variant="body2" sx={{ 
            color: theme.palette.text.primary,
            fontSize: SIZES.fontSize.sm 
          }}>
            {formatDate(row.created_at)}
          </Typography>
        </Box>
      )
    },
    {
      id: 'actions',
      label: t('tables.columns.actions'),
      align: 'right',
      format: (value, row: ArticleSummary) => (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
          <Tooltip title={t('admin.articles.meta.viewTooltip')}>
            <IconButton
              size="small"
              onClick={() => navigate(`/admin/articles/${row.id}`)}
              sx={{ color: theme.palette.primary.main }}
            >
              <ViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('tables.actions.edit')}>
            <IconButton
              size="small"
              onClick={() => navigate(`/admin/articles/${row.id}/edit`)}
              sx={{ color: theme.palette.success.main }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('tables.actions.delete')}>
            <IconButton
              size="small"
              onClick={() => handleDeleteArticle(row.id)}
              sx={{ color: theme.palette.error.main }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ], [theme, navigate, handleDeleteArticle, getStatusLabel, t]);

  return (
    <Container maxWidth="xl" sx={{ py: SIZES.spacing.lg }}>
      {/* Заголовок страницы */}
      <Box sx={{ mb: SIZES.spacing.lg }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: SIZES.spacing.md }}>
          <Box>
            <Typography variant="h4" component="h1" sx={{
              fontWeight: 700,
              fontSize: SIZES.fontSize.xl,
              color: theme.palette.text.primary,
              mb: SIZES.spacing.xs
            }}>
              {t('admin.articles.title')}
            </Typography>
            <Typography variant="body1" sx={{
              color: theme.palette.text.secondary,
              fontSize: SIZES.fontSize.md
            }}>
              {t('admin.articles.subtitle')}
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/admin/articles/new')}
          >
            {t('admin.articles.createArticle')}
          </Button>
        </Box>
      </Box>

      {/* Статистика */}
      <Grid container spacing={3} sx={{ mb: SIZES.spacing.lg }}>
        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ ...cardStyles, textAlign: 'center', p: SIZES.spacing.lg }}>
            <ChartIcon sx={{ fontSize: 40, color: theme.palette.primary.main, mb: 1 }} />
            <Typography variant="h4" sx={{ fontSize: SIZES.fontSize.xl, fontWeight: 600, color: theme.palette.text.primary }}>
              {displayPagination.total_count}
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              {t('admin.articles.stats.totalArticles')}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ ...cardStyles, textAlign: 'center', p: SIZES.spacing.lg }}>
            <StarIcon sx={{ fontSize: 40, color: theme.palette.warning.main, mb: 1 }} />
            <Typography variant="h4" sx={{ fontSize: SIZES.fontSize.xl, fontWeight: 600, color: theme.palette.text.primary }}>
              {displayArticles.filter((a: ArticleSummary) => a.status === 'published').length}
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              {t('admin.articles.stats.published')}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ ...cardStyles, textAlign: 'center', p: SIZES.spacing.lg }}>
            <ViewIcon sx={{ fontSize: 40, color: theme.palette.success.main, mb: 1 }} />
            <Typography variant="h4" sx={{ fontSize: SIZES.fontSize.xl, fontWeight: 600, color: theme.palette.text.primary }}>
              {displayArticles.reduce((sum: number, a: ArticleSummary) => sum + (a.views_count || 0), 0)}
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              {t('admin.articles.stats.views')}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ ...cardStyles, textAlign: 'center', p: SIZES.spacing.lg }}>
            <EditIcon sx={{ fontSize: 40, color: theme.palette.primary.main, mb: 1 }} />
            <Typography variant="h4" sx={{ fontSize: SIZES.fontSize.xl, fontWeight: 600, color: theme.palette.text.primary }}>
              {displayArticles.filter((a: ArticleSummary) => a.status === 'draft').length}
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              {t('admin.articles.stats.drafts')}
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Фильтры */}
      <Box sx={{ ...cardStyles, mb: SIZES.spacing.lg, p: SIZES.spacing.lg }}>
        <Typography variant="h6" sx={{
          color: theme.palette.text.primary,
          mb: SIZES.spacing.md,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          fontSize: SIZES.fontSize.lg,
          fontWeight: 600
        }}>
          <SearchIcon />
          {t('admin.articles.searchAndFilters')}
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder={t('admin.articles.searchPlaceholder')}
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <SearchIcon sx={{ color: theme.palette.text.secondary }} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Select
              value={selectedCategory}
              onChange={handleCategoryChange}
              label={t('admin.articles.filters.category')}
              options={[
                { value: '', label: t('admin.articles.filters.allCategories') },
                ...categories.map((category: any) => ({
                  value: category.key || category.name,
                  label: category.name
                }))
              ]}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Select
              value={selectedSort}
              onChange={handleSortChange}
              label={t('admin.articles.filters.sorting')}
              options={[
                { value: 'recent', label: t('admin.articles.sorting.recent') },
                { value: 'oldest', label: t('admin.articles.sorting.oldest') },
                { value: 'popular', label: t('admin.articles.sorting.popular') }
              ]}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Таблица статей */}
      <Box sx={{ ...cardStyles, p: SIZES.spacing.lg }}>
        {isLoading ? (
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            py: 8
          }}>
            <CircularProgress size={48} sx={{ mb: 2 }} />
            <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
              {t('admin.articles.loadingArticles')}
            </Typography>
          </Box>
        ) : error ? (
          <Box sx={{ p: SIZES.spacing.lg }}>
            <Alert severity="error">
              {t('admin.articles.loadingError')}
            </Alert>
          </Box>
        ) : displayArticles.length === 0 ? (
          <Box sx={{
            textAlign: 'center',
            py: 8,
            px: 4
          }}>
            <Typography variant="h6" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
              {t('admin.articles.articlesNotFound')}
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/admin/articles/new')}
            >
              {t('admin.articles.createFirstArticle')}
            </Button>
          </Box>
        ) : (
          <>
            {/* Таблица */}
            <Table
              columns={columns}
              rows={displayArticles}
            />

            {/* Пагинация */}
            {displayPagination.total_pages > 1 && (
              <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                pt: SIZES.spacing.lg,
                mt: SIZES.spacing.md,
                borderTop: `1px solid ${theme.palette.divider}`
              }}>
                <Pagination
                  count={displayPagination.total_pages}
                  page={currentPage}
                  onChange={handlePageChange}
                />
              </Box>
            )}
          </>
        )}
      </Box>
    </Container>
  );
};

export default ArticlesPage;