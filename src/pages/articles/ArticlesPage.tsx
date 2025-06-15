import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
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
import { Alert } from '../../components/ui/Alert';
import { Pagination } from '../../components/ui/Pagination';
import { Chip } from '../../components/ui/Chip';

// Локальные импорты
import { useGetArticlesQuery, useGetCategoriesQuery } from '../../api/articles.api';
import { useArticleActions } from '../../hooks/useArticles';
import { ArticleSummary } from '../../types/articles';
import { SIZES } from '../../styles/theme';
import { 
  getButtonStyles, 
  getTextFieldStyles, 
  getChipStyles,
  getCardStyles
} from '../../styles/components';

// Константы для статусов
const ARTICLE_STATUS_LABELS = {
  published: 'Опубликовано',
  draft: 'Черновик',
  archived: 'Архив'
} as const;

const ArticlesPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const cardStyles = getCardStyles(theme);
  const buttonStyles = getButtonStyles(theme, 'primary');
  const textFieldStyles = getTextFieldStyles(theme);
  
  // Состояние для фильтров
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSort, setSelectedSort] = useState('recent');
  const [currentPage, setCurrentPage] = useState(1);

  // Подготовка фильтров для API
  const filters = {
    query: searchQuery || undefined,
    category: selectedCategory || undefined,
    page: currentPage,
    per_page: 12
  };

  // Хуки для данных
  const { data, error, isLoading, refetch } = useGetArticlesQuery(filters);
  const { data: categoriesData } = useGetCategoriesQuery();
  const { deleteArticle, loading: deleting } = useArticleActions();

  // Данные для отображения
  const displayArticles = data?.data || [];
  const displayPagination = data?.meta || {
    current_page: 1,
    per_page: 12,
    total_pages: 0,
    total_count: 0,
  };
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
    const token = localStorage.getItem('authToken');
    console.log('🔑 Токен авторизации:', token ? `${token.substring(0, 20)}...` : 'отсутствует');
  }, [displayArticles, displayPagination, filters, error, isLoading]);

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

  const handleDeleteArticle = async (articleId: number) => {
    if (window.confirm('Вы уверены, что хотите удалить эту статью?')) {
      try {
        console.log('Удаление статьи:', articleId);
        const result = await deleteArticle(articleId);
        
        if (result.success) {
          console.log('Статья успешно удалена');
          refetch(); // Обновляем список статей
        } else {
          console.error('Ошибка при удалении статьи:', result.error);
          alert(`Ошибка при удалении статьи: ${result.error}`);
        }
      } catch (error) {
        console.error('Ошибка при удалении статьи:', error);
        alert('Произошла ошибка при удалении статьи');
      }
    }
  };

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
              📚 База знаний
            </Typography>
            <Typography variant="body1" sx={{
              color: theme.palette.text.secondary,
              fontSize: SIZES.fontSize.md
            }}>
              Управление статьями и материалами для клиентов
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/articles/new')}
          >
            Создать статью
          </Button>
        </Box>
      </Box>

      {/* Статистика */}
      <Grid container spacing={3} sx={{ mb: SIZES.spacing.lg }}>
        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ ...cardStyles, textAlign: 'center', p: SIZES.spacing.lg }}>
            <ChartIcon sx={{ fontSize: 40, color: theme.palette.primary.main, mb: 1 }} />
            <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
              {displayPagination.total_count}
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              Всего статей
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ ...cardStyles, textAlign: 'center', p: SIZES.spacing.lg }}>
            <StarIcon sx={{ fontSize: 40, color: theme.palette.warning.main, mb: 1 }} />
            <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
              {displayArticles.filter((a: ArticleSummary) => a.status === 'published').length}
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              Опубликовано
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ ...cardStyles, textAlign: 'center', p: SIZES.spacing.lg }}>
            <ViewIcon sx={{ fontSize: 40, color: theme.palette.success.main, mb: 1 }} />
            <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
              {displayArticles.reduce((sum: number, a: ArticleSummary) => sum + (a.views_count || 0), 0)}
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              Просмотров
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ ...cardStyles, textAlign: 'center', p: SIZES.spacing.lg }}>
            <EditIcon sx={{ fontSize: 40, color: theme.palette.primary.main, mb: 1 }} />
            <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
              {displayArticles.filter((a: ArticleSummary) => a.status === 'draft').length}
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              Черновиков
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
          Поиск и фильтры
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Поиск статей..."
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
              label="Категория"
              options={[
                { value: '', label: 'Все категории' },
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
              label="Сортировка"
              options={[
                { value: 'recent', label: 'По дате (новые)' },
                { value: 'oldest', label: 'По дате (старые)' },
                { value: 'popular', label: 'По популярности' }
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
              Загрузка статей...
            </Typography>
          </Box>
        ) : error ? (
          <Box sx={{ p: SIZES.spacing.lg }}>
            <Alert severity="error" sx={{ mb: SIZES.spacing.md }}>
              Ошибка при загрузке статей
            </Alert>
          </Box>
        ) : displayArticles.length === 0 ? (
          <Box sx={{
            textAlign: 'center',
            py: 8,
            px: 4
          }}>
            <Typography variant="h6" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
              Статьи не найдены
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/articles/new')}
            >
              Создать первую статью
            </Button>
          </Box>
        ) : (
          <>
            {/* Таблица */}
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, fontSize: SIZES.fontSize.md }}>Статья</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: SIZES.fontSize.md }}>Категория</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: SIZES.fontSize.md }}>Статус</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: SIZES.fontSize.md }}>Просмотры</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: SIZES.fontSize.md }}>Дата</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, fontSize: SIZES.fontSize.md }}>Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {displayArticles.map((article: ArticleSummary) => (
                    <TableRow key={article.id} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                      <TableCell>
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
                              onClick={() => navigate(`/articles/${article.id}`)}
                            >
                              {article.title}
                              {article.featured && (
                                <Chip
                                  icon={<StarIcon />}
                                  label="Рекомендуемая"
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
                              {article.excerpt}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <TimeIcon sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                                <Typography variant="caption" sx={{ 
                                  color: theme.palette.text.secondary,
                                  fontSize: SIZES.fontSize.xs 
                                }}>
                                  {article.reading_time || 5} мин
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <PersonIcon sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                                <Typography variant="caption" sx={{ 
                                  color: theme.palette.text.secondary,
                                  fontSize: SIZES.fontSize.xs 
                                }}>
                                  {article.author?.name || 'Автор'}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ 
                          color: theme.palette.text.primary,
                          fontSize: SIZES.fontSize.sm 
                        }}>
                          {article.category_name || article.category}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={ARTICLE_STATUS_LABELS[article.status as keyof typeof ARTICLE_STATUS_LABELS]}
                          color={article.status === 'published' ? 'success' : article.status === 'draft' ? 'warning' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <ViewIcon sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                          <Typography variant="body2" sx={{ 
                            color: theme.palette.text.primary,
                            fontSize: SIZES.fontSize.sm 
                          }}>
                            {article.views_count || 0}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <CalendarIcon sx={{ fontSize: 14, color: theme.palette.text.secondary }} />
                          <Typography variant="body2" sx={{ 
                            color: theme.palette.text.primary,
                            fontSize: SIZES.fontSize.sm 
                          }}>
                            {formatDate(article.created_at)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                          <Tooltip title="Просмотр">
                            <IconButton
                              size="small"
                              onClick={() => navigate(`/articles/${article.id}`)}
                              sx={{ color: theme.palette.primary.main }}
                            >
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Редактировать">
                            <IconButton
                              size="small"
                              onClick={() => navigate(`/articles/${article.id}/edit`)}
                              sx={{ color: theme.palette.success.main }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Удалить">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteArticle(article.id)}
                              sx={{ color: theme.palette.error.main }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

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