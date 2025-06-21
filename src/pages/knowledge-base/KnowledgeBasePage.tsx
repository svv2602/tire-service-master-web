import React, { useState, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Grid,
  Card,
  CardContent,
  Button,
  InputAdornment,
  Pagination,
  useTheme,
  Paper,
  Fade
} from '@mui/material';
import {
  Search as SearchIcon,
  Build as BuildIcon,
  DirectionsCar as CarIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import { useArticles, useArticleCategories, usePopularArticles } from '../../hooks/useArticles';
import { ArticlesFilters } from '../../types/articles';
import ClientNavigation from '../../components/client/ClientNavigation';
import ArticleCard from '../../components/knowledge-base/ArticleCard';
import ArticleFilters from '../../components/knowledge-base/ArticleFilters';
import { getThemeColors, getButtonStyles, getCardStyles } from '../../styles';

const KnowledgeBasePage: React.FC = () => {
  const theme = useTheme();
  const colors = getThemeColors(theme);
  const cardStyles = getCardStyles(theme, 'primary');
  const buttonStyles = getButtonStyles(theme, 'primary');

  // Состояние фильтров
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Мемоизированные фильтры
  const filters = useMemo<ArticlesFilters>(() => ({
    page: currentPage,
    per_page: 12,
    published: true, // Клиенты видят только опубликованные статьи
    search: searchQuery || undefined,
    category: selectedCategory || undefined,
  }), [currentPage, searchQuery, selectedCategory]);

  // Хуки для данных
  const { articles, loading, error, pagination, fetchArticles } = useArticles(filters);
  const { categories } = useArticleCategories();
  const { articles: featuredArticles, loading: featuredLoading } = usePopularArticles(6);

  // Обработчики
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setCurrentPage(1);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: colors.backgroundPrimary }}>
      {/* Навигация */}
      <ClientNavigation colors={colors} secondaryButtonStyles={getButtonStyles(theme, 'secondary')} />

      {/* Hero секция */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          py: 8
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', maxWidth: 800, mx: 'auto' }}>
            <Typography variant="h2" component="h1" sx={{ fontWeight: 700, mb: 3 }}>
              База знаний о шинах
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
              Полезные статьи, советы экспертов и руководства по выбору и уходу за шинами. 
              Все что нужно знать автомобилисту.
            </Typography>
            
            {/* Быстрый поиск */}
            <Box sx={{ maxWidth: 600, mx: 'auto' }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Найти статью..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'white',
                    borderRadius: 2,
                    '& fieldset': {
                      borderColor: 'transparent',
                    },
                    '&:hover fieldset': {
                      borderColor: 'transparent',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: theme.palette.primary.main,
                      borderWidth: 2,
                    },
                  },
                }}
              />
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Рекомендуемые статьи */}
        {!searchQuery && !selectedCategory && (
          <Fade in timeout={600}>
            <Box sx={{ mb: 8 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
                <Box>
                  <Typography variant="h4" component="h2" sx={{ fontWeight: 700, color: colors.textPrimary, mb: 1 }}>
                    Рекомендуемые статьи
                  </Typography>
                  <Typography variant="body1" sx={{ color: colors.textSecondary }}>
                    Самые полезные и популярные материалы
                  </Typography>
                </Box>
              </Box>

              {featuredLoading ? (
                <Grid container spacing={3}>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Grid item xs={12} md={6} lg={4} key={i}>
                      <Card sx={{ ...cardStyles, height: 400 }}>
                        <Box sx={{ height: 200, backgroundColor: colors.backgroundSecondary }} />
                        <CardContent>
                          <Box sx={{ height: 20, backgroundColor: colors.backgroundSecondary, mb: 1, borderRadius: 1 }} />
                          <Box sx={{ height: 16, backgroundColor: colors.backgroundSecondary, mb: 2, borderRadius: 1, width: '75%' }} />
                          <Box sx={{ height: 14, backgroundColor: colors.backgroundSecondary, mb: 1, borderRadius: 1 }} />
                          <Box sx={{ height: 14, backgroundColor: colors.backgroundSecondary, borderRadius: 1, width: '60%' }} />
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Grid container spacing={3}>
                  {featuredArticles.map((article) => (
                    <Grid item xs={12} md={6} lg={4} key={article.id}>
                      <ArticleCard article={article} variant="featured" />
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          </Fade>
        )}

        {/* Фильтры */}
        <ArticleFilters
          categories={categories}
          selectedCategory={selectedCategory}
          searchQuery={searchQuery}
          onCategoryChange={handleCategoryChange}
          onSearchChange={handleSearchChange}
          onClearFilters={handleClearFilters}
          loading={loading}
        />

        {/* Результаты поиска или все статьи */}
        <Fade in timeout={400}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
              <Box>
                <Typography variant="h4" component="h2" sx={{ fontWeight: 700, color: colors.textPrimary, mb: 1 }}>
                  {searchQuery ? `Результаты поиска "${searchQuery}"` : 
                   selectedCategory ? `Статьи: ${categories.find(c => c.key === selectedCategory)?.name}` : 
                   'Все статьи'}
                </Typography>
                {!loading && (
                  <Typography variant="body1" sx={{ color: colors.textSecondary }}>
                    Найдено статей: {pagination.total_count}
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Список статей */}
            {loading ? (
              <Grid container spacing={3}>
                {Array.from({ length: 9 }).map((_, i) => (
                  <Grid item xs={12} md={6} lg={4} key={i}>
                    <Card sx={{ ...cardStyles, height: 350 }}>
                      <Box sx={{ height: 180, backgroundColor: colors.backgroundSecondary }} />
                      <CardContent>
                        <Box sx={{ height: 20, backgroundColor: colors.backgroundSecondary, mb: 1, borderRadius: 1 }} />
                        <Box sx={{ height: 16, backgroundColor: colors.backgroundSecondary, mb: 2, borderRadius: 1, width: '75%' }} />
                        <Box sx={{ height: 14, backgroundColor: colors.backgroundSecondary, mb: 1, borderRadius: 1 }} />
                        <Box sx={{ height: 14, backgroundColor: colors.backgroundSecondary, borderRadius: 1, width: '60%' }} />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : error ? (
              <Paper sx={{ ...cardStyles, textAlign: 'center', py: 8 }}>
                <Typography variant="h1" sx={{ fontSize: '4rem', mb: 2 }}>❌</Typography>
                <Typography variant="h6" sx={{ color: colors.textPrimary, mb: 1 }}>
                  Ошибка загрузки
                </Typography>
                <Typography variant="body1" sx={{ color: colors.textSecondary, mb: 3 }}>
                  {error}
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => fetchArticles()}
                  sx={buttonStyles}
                >
                  Попробовать снова
                </Button>
              </Paper>
            ) : articles.length === 0 ? (
              <Paper sx={{ ...cardStyles, textAlign: 'center', py: 8 }}>
                <Typography variant="h1" sx={{ fontSize: '4rem', mb: 2 }}>🔍</Typography>
                <Typography variant="h6" sx={{ color: colors.textPrimary, mb: 1 }}>
                  Статьи не найдены
                </Typography>
                <Typography variant="body1" sx={{ color: colors.textSecondary, mb: 3 }}>
                  {searchQuery || selectedCategory ? 
                    'Попробуйте изменить параметры поиска' : 
                    'Статьи пока не добавлены'}
                </Typography>
                {(searchQuery || selectedCategory) && (
                  <Button
                    variant="contained"
                    onClick={handleClearFilters}
                    sx={buttonStyles}
                  >
                    Сбросить фильтры
                  </Button>
                )}
              </Paper>
            ) : (
              <>
                <Grid container spacing={3} sx={{ mb: 6 }}>
                  {articles.map((article) => (
                    <Grid item xs={12} md={6} lg={4} key={article.id}>
                      <ArticleCard article={article} />
                    </Grid>
                  ))}
                </Grid>

                {/* Пагинация */}
                {pagination.total_pages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Pagination
                      count={pagination.total_pages}
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
          </Box>
        </Fade>

        {/* Информационные блоки */}
        {!searchQuery && !selectedCategory && (
          <Fade in timeout={800}>
            <Grid container spacing={4} sx={{ mt: 8 }}>
              <Grid item xs={12} md={4}>
                <Paper sx={{ ...cardStyles, textAlign: 'center', p: 4 }}>
                  <BuildIcon sx={{ fontSize: 48, color: colors.primary, mb: 2 }} />
                  <Typography variant="h6" sx={{ color: colors.textPrimary, mb: 1, fontWeight: 600 }}>
                    Экспертные советы
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                    Профессиональные рекомендации от опытных мастеров шиномонтажа
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Paper sx={{ ...cardStyles, textAlign: 'center', p: 4 }}>
                  <SchoolIcon sx={{ fontSize: 48, color: colors.primary, mb: 2 }} />
                  <Typography variant="h6" sx={{ color: colors.textPrimary, mb: 1, fontWeight: 600 }}>
                    Подробные гиды
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                    Пошаговые инструкции по выбору, установке и обслуживанию шин
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Paper sx={{ ...cardStyles, textAlign: 'center', p: 4 }}>
                  <CarIcon sx={{ fontSize: 48, color: colors.primary, mb: 2 }} />
                  <Typography variant="h6" sx={{ color: colors.textPrimary, mb: 1, fontWeight: 600 }}>
                    Для всех авто
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                    Материалы для владельцев легковых автомобилей, внедорожников и коммерческого транспорта
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Fade>
        )}
      </Container>
    </Box>
  );
};

export default KnowledgeBasePage; 