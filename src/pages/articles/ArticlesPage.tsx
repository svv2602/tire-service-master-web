import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Grid,
  Alert,
  CircularProgress,
  Fade,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
  InputAdornment
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

// Локальные импорты
import { useGetArticlesQuery, useGetCategoriesQuery } from '../../api/articles.api';
import { ArticleSummary } from '../../types/articles';

// Константы для статусов
const ARTICLE_STATUS_LABELS = {
  published: 'Опубликовано',
  draft: 'Черновик',
  archived: 'Архив'
} as const;

const ArticlesPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  // Состояние для фильтров
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSort, setSelectedSort] = useState('recent');
  const [currentPage, setCurrentPage] = useState(1);

  // Подготовка фильтров для API
  const filters = {
    query: searchQuery || undefined,
    category: selectedCategory || undefined,
    sort: selectedSort as 'recent' | 'popular' | 'oldest',
    page: currentPage,
    per_page: 12
  };

  // Хуки для данных
  const { data, error, isLoading, refetch } = useGetArticlesQuery(filters);
  const { data: categoriesData } = useGetCategoriesQuery();

  // Данные для отображения
  const displayArticles = data?.data || [];
  const displayPagination = data?.meta || {
    current_page: 1,
    per_page: 12,
    total_pages: 0,
    total_count: 0,
  };
  const categories = categoriesData || [];

  // Цвета темы
  const colors = {
    primary: theme.palette.primary.main,
    secondary: theme.palette.secondary.main,
    success: theme.palette.success.main,
    warning: theme.palette.warning.main,
    error: theme.palette.error.main,
    textPrimary: theme.palette.text.primary,
    textSecondary: theme.palette.text.secondary,
    background: theme.palette.background.default,
    backgroundPaper: theme.palette.background.paper,
    divider: theme.palette.divider
  };

  // Стили
  const cardStyles = {
    p: 3,
    borderRadius: 3,
    boxShadow: theme.shadows[2],
    border: `1px solid ${colors.divider}`,
    bgcolor: colors.backgroundPaper,
    transition: 'all 0.3s ease',
    '&:hover': {
      boxShadow: theme.shadows[4],
      transform: 'translateY(-2px)'
    }
  };

  // Обработчики событий
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (event: any) => {
    setSelectedCategory(event.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (event: any) => {
    setSelectedSort(event.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
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
        refetch();
      } catch (error) {
        console.error('Ошибка при удалении статьи:', error);
      }
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Заголовок страницы */}
      <Fade in timeout={500}>
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography variant="h4" component="h1" sx={{
                fontWeight: 700,
                color: colors.textPrimary,
                mb: 1
              }}>
                📚 База знаний
              </Typography>
              <Typography variant="body1" sx={{
                color: colors.textSecondary,
                fontSize: '1.1rem'
              }}>
                Управление статьями и материалами для клиентов
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/articles/new')}
              size="large"
            >
              Создать статью
            </Button>
          </Box>
        </Box>
      </Fade>

      {/* Статистика */}
      <Fade in timeout={700}>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ ...cardStyles, textAlign: 'center' }}>
              <ChartIcon sx={{ fontSize: 40, color: colors.primary, mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: colors.textPrimary }}>
                {displayPagination.total_count}
              </Typography>
              <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                Всего статей
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ ...cardStyles, textAlign: 'center' }}>
              <StarIcon sx={{ fontSize: 40, color: colors.warning, mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: colors.textPrimary }}>
                {displayArticles.filter((a: ArticleSummary) => a.status === 'published').length}
              </Typography>
              <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                Опубликовано
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ ...cardStyles, textAlign: 'center' }}>
              <ViewIcon sx={{ fontSize: 40, color: colors.success, mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: colors.textPrimary }}>
                {displayArticles.reduce((sum: number, a: ArticleSummary) => sum + (a.views_count || 0), 0)}
              </Typography>
              <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                Просмотров
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ ...cardStyles, textAlign: 'center' }}>
              <EditIcon sx={{ fontSize: 40, color: colors.primary, mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: colors.textPrimary }}>
                {displayArticles.filter((a: ArticleSummary) => a.status === 'draft').length}
              </Typography>
              <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                Черновиков
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Fade>

      {/* Фильтры */}
      <Fade in timeout={900}>
        <Paper sx={{ ...cardStyles, mb: 3 }}>
          <Typography variant="h6" sx={{
            color: colors.textPrimary,
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1
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
                      <SearchIcon sx={{ color: colors.textSecondary }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Категория</InputLabel>
                <Select
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  label="Категория"
                >
                  <MenuItem value="">Все категории</MenuItem>
                  {categories.map((category: any) => (
                    <MenuItem key={category.key || category.name} value={category.key || category.name}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Сортировка</InputLabel>
                <Select
                  value={selectedSort}
                  onChange={handleSortChange}
                  label="Сортировка"
                >
                  <MenuItem value="recent">По дате (новые)</MenuItem>
                  <MenuItem value="oldest">По дате (старые)</MenuItem>
                  <MenuItem value="popular">По популярности</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>
      </Fade>

      {/* Таблица статей */}
      <Fade in timeout={1100}>
        <Paper sx={cardStyles}>
          {isLoading ? (
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              py: 8
            }}>
              <CircularProgress size={48} sx={{ mb: 2 }} />
              <Typography variant="body1" sx={{ color: colors.textSecondary }}>
                Загрузка статей...
              </Typography>
            </Box>
          ) : error ? (
            <Box sx={{ p: 4 }}>
              <Alert severity="error" sx={{ mb: 2 }}>
                Ошибка при загрузке статей
              </Alert>
            </Box>
          ) : displayArticles.length === 0 ? (
            <Box sx={{
              textAlign: 'center',
              py: 8,
              px: 4
            }}>
              <Typography variant="h6" sx={{ color: colors.textSecondary, mb: 2 }}>
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
                      <TableCell sx={{ fontWeight: 700 }}>Статья</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Категория</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Статус</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Просмотры</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Дата</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Действия</TableCell>
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
                                  color: colors.textPrimary,
                                  cursor: 'pointer',
                                  '&:hover': { color: colors.primary }
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
                                  color: colors.textSecondary,
                                  mt: 0.5,
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
                                  <TimeIcon sx={{ fontSize: 16, color: colors.textSecondary }} />
                                  <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                                    {article.reading_time || 5} мин
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <PersonIcon sx={{ fontSize: 16, color: colors.textSecondary }} />
                                  <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                                    {article.author?.name || 'Автор'}
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: colors.textPrimary }}>
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
                            <ViewIcon sx={{ fontSize: 16, color: colors.textSecondary }} />
                            <Typography variant="body2" sx={{ color: colors.textPrimary }}>
                              {article.views_count || 0}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <CalendarIcon sx={{ fontSize: 14, color: colors.textSecondary }} />
                            <Typography variant="body2" sx={{ color: colors.textPrimary }}>
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
                                sx={{ color: colors.primary }}
                              >
                                <ViewIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Редактировать">
                              <IconButton
                                size="small"
                                onClick={() => navigate(`/articles/${article.id}/edit`)}
                                sx={{ color: colors.success }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Удалить">
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteArticle(article.id)}
                                sx={{ color: colors.error }}
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
                  pt: 3,
                  borderTop: `1px solid ${theme.palette.divider}`
                }}>
                  <Pagination
                    count={displayPagination.total_pages}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                    size="large"
                    showFirstButton
                    showLastButton
                  />
                </Box>
              )}
            </>
          )}
        </Paper>
      </Fade>
    </Container>
  );
};

export default ArticlesPage;