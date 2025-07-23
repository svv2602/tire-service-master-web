import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Pagination,
  Button,
  Paper,
  Fade,
  useTheme
} from '@mui/material';
import {
  Build as BuildIcon,
  School as SchoolIcon,
  DirectionsCar as CarIcon
} from '@mui/icons-material';

import ClientLayout from '../../components/client/ClientLayout';
import ArticleCard from '../../components/knowledge-base/ArticleCard';
import ArticleFilters from '../../components/knowledge-base/ArticleFilters';
import { useArticles, useArticleCategories, usePopularArticles } from '../../hooks/useArticles';
import { ArticlesFilters } from '../../types/articles';
import { getThemeColors, getCardStyles, getButtonStyles } from '../../styles';

// SEO импорты
import { SEOHead } from '../../components/common/SEOHead';
import { useSEO } from '../../hooks/useSEO';

const KnowledgeBasePage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { useSEOFromAPI } = useSEO();
  const colors = getThemeColors(theme);
  const cardStyles = getCardStyles(theme, 'primary');
  const buttonStyles = getButtonStyles(theme, 'primary');

  // SEO конфигурация из API
  const seoConfig = useSEOFromAPI('knowledge-base');

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
    <ClientLayout>
      <SEOHead {...seoConfig} />
      <Box sx={{ minHeight: '100vh', backgroundColor: colors.backgroundPrimary }}>
        {/* Hero секция */}
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 600, mb: 2, color: theme.palette.text.primary }}>
              {t('forms.articles.knowledgeBase.title')}
            </Typography>
            <Typography variant="h6" sx={{ mb: 0, color: theme.palette.text.secondary }}>
              {t('forms.articles.knowledgeBase.subtitle')}
            </Typography>
          </Box>

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
        </Container>

        <Container maxWidth="lg" sx={{ py: 6 }}>
          {/* Рекомендуемые статьи */}
          {!searchQuery && !selectedCategory && (
            <Fade in timeout={600}>
              <Box sx={{ mb: 8 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
                  <Box>
                    <Typography variant="h4" component="h2" sx={{ fontWeight: 700, color: colors.textPrimary, mb: 1 }}>
                      {t('forms.articles.knowledgeBase.featuredTitle')}
                    </Typography>
                    <Typography variant="body1" sx={{ color: colors.textSecondary }}>
                      {t('forms.articles.knowledgeBase.featuredSubtitle')}
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

          {/* Результаты поиска или все статьи */}
          <Fade in timeout={400}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
                <Box>
                  <Typography variant="h4" component="h2" sx={{ fontWeight: 700, color: colors.textPrimary, mb: 1 }}>
                    {searchQuery ? t('forms.articles.knowledgeBase.searchResults', { query: searchQuery }) : 
                     selectedCategory ? t('forms.articles.knowledgeBase.categoryResults', { category: categories.find(c => c.key === selectedCategory)?.name }) : 
                     t('forms.articles.knowledgeBase.allArticles')}
                  </Typography>
                  {!loading && (
                    <Typography variant="body1" sx={{ color: colors.textSecondary }}>
                      {t('forms.articles.knowledgeBase.articlesFound', { count: pagination.total_count })}
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
                    {t('forms.articles.knowledgeBase.errors.loadingError')}
                  </Typography>
                  <Typography variant="body1" sx={{ color: colors.textSecondary, mb: 3 }}>
                    {error}
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => fetchArticles()}
                    sx={buttonStyles}
                  >
                    {t('forms.articles.knowledgeBase.errors.tryAgain')}
                  </Button>
                </Paper>
              ) : articles.length === 0 ? (
                <Paper sx={{ ...cardStyles, textAlign: 'center', py: 8 }}>
                  <Typography variant="h1" sx={{ fontSize: '4rem', mb: 2 }}>🔍</Typography>
                  <Typography variant="h6" sx={{ color: colors.textPrimary, mb: 1 }}>
                    {t('forms.articles.knowledgeBase.emptyStates.notFound')}
                  </Typography>
                  <Typography variant="body1" sx={{ color: colors.textSecondary, mb: 3 }}>
                    {searchQuery || selectedCategory ? 
                      t('forms.articles.knowledgeBase.emptyStates.changeFilters') : 
                      t('forms.articles.knowledgeBase.emptyStates.noArticles')}
                  </Typography>
                  {(searchQuery || selectedCategory) && (
                    <Button
                      variant="contained"
                      onClick={handleClearFilters}
                      sx={buttonStyles}
                    >
                      {t('forms.articles.knowledgeBase.emptyStates.clearFilters')}
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
                      {t('forms.articles.knowledgeBase.infoBlocks.expertAdvice.title')}
                    </Typography>
                    <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                      {t('forms.articles.knowledgeBase.infoBlocks.expertAdvice.description')}
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Paper sx={{ ...cardStyles, textAlign: 'center', p: 4 }}>
                    <SchoolIcon sx={{ fontSize: 48, color: colors.primary, mb: 2 }} />
                    <Typography variant="h6" sx={{ color: colors.textPrimary, mb: 1, fontWeight: 600 }}>
                      {t('forms.articles.knowledgeBase.infoBlocks.detailedGuides.title')}
                    </Typography>
                    <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                      {t('forms.articles.knowledgeBase.infoBlocks.detailedGuides.description')}
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Paper sx={{ ...cardStyles, textAlign: 'center', p: 4 }}>
                    <CarIcon sx={{ fontSize: 48, color: colors.primary, mb: 2 }} />
                    <Typography variant="h6" sx={{ color: colors.textPrimary, mb: 1, fontWeight: 600 }}>
                      {t('forms.articles.knowledgeBase.infoBlocks.allVehicles.title')}
                    </Typography>
                    <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                      {t('forms.articles.knowledgeBase.infoBlocks.allVehicles.description')}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Fade>
          )}
        </Container>
      </Box>
    </ClientLayout>
  );
};

export default KnowledgeBasePage; 