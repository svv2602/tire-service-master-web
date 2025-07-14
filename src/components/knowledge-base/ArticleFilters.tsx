import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Chip,
  Paper,
  InputAdornment,
  useTheme,
  CircularProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { ArticleCategory } from '../../types/articles';
import { getThemeColors, getCardStyles } from '../../styles';

interface ArticleFiltersProps {
  categories: ArticleCategory[];
  selectedCategory: string;
  searchQuery: string;
  onCategoryChange: (category: string) => void;
  onSearchChange: (query: string) => void;
  onClearFilters: () => void;
  loading?: boolean;
}

const ArticleFilters: React.FC<ArticleFiltersProps> = ({
  categories,
  selectedCategory,
  searchQuery,
  onCategoryChange,
  onSearchChange,
  onClearFilters,
  loading = false,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const colors = getThemeColors(theme);
  const cardStyles = getCardStyles(theme, 'primary');

  const hasActiveFilters = selectedCategory || searchQuery;

  return (
    <Paper sx={{ ...cardStyles, p: 3, mb: 4 }}>
      {/* Заголовок фильтров */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <FilterListIcon sx={{ mr: 1, color: colors.primary }} />
        <Typography variant="h6" sx={{ color: colors.textPrimary, fontWeight: 600 }}>
          {t('forms.articles.knowledgeBase.filters.search')}
        </Typography>
      </Box>

      {/* Поиск */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder={t('forms.articles.knowledgeBase.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: colors.textSecondary }} />
              </InputAdornment>
            ),
            endAdornment: loading ? (
              <InputAdornment position="end">
                <CircularProgress size={20} />
              </InputAdornment>
            ) : null,
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: colors.backgroundPrimary,
              '&:hover fieldset': {
                borderColor: colors.primary,
              },
              '&.Mui-focused fieldset': {
                borderColor: colors.primary,
              },
            },
          }}
        />
      </Box>

      {/* Категории */}
      <Box sx={{ mb: hasActiveFilters ? 2 : 0 }}>
        <Typography variant="subtitle2" sx={{ color: colors.textPrimary, mb: 2, fontWeight: 600 }}>
          {t('forms.articles.knowledgeBase.filters.category')}
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {/* Кнопка "Все" */}
          <Chip
            label={t('forms.articles.knowledgeBase.categories.all')}
            variant={!selectedCategory ? 'filled' : 'outlined'}
            onClick={() => onCategoryChange('')}
            sx={{
              backgroundColor: !selectedCategory ? colors.primary : 'transparent',
              color: !selectedCategory ? 'white' : colors.textPrimary,
              borderColor: colors.primary,
              fontWeight: 500,
              '&:hover': {
                backgroundColor: !selectedCategory ? colors.primary : colors.backgroundSecondary,
              },
            }}
          />
          
          {/* Категории */}
          {categories.map((category) => (
            <Chip
              key={category.key}
              label={`${category.icon} ${category.name}`}
              variant={selectedCategory === category.key ? 'filled' : 'outlined'}
              onClick={() => onCategoryChange(category.key)}
              sx={{
                backgroundColor: selectedCategory === category.key ? colors.primary : 'transparent',
                color: selectedCategory === category.key ? 'white' : colors.textPrimary,
                borderColor: colors.primary,
                fontWeight: 500,
                '&:hover': {
                  backgroundColor: selectedCategory === category.key ? colors.primary : colors.backgroundSecondary,
                },
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Активные фильтры и сброс */}
      {hasActiveFilters && (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          pt: 2,
          borderTop: `1px solid ${colors.border}`,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ color: colors.textSecondary }}>
              {t('forms.articles.knowledgeBase.filters.activeFilters')}:
            </Typography>
            {searchQuery && (
              <Chip
                label={`"${searchQuery}"`}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
            {selectedCategory && (
              <Chip
                label={categories.find(c => c.key === selectedCategory)?.name}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
          </Box>
          
          <Button
            variant="text"
            startIcon={<ClearIcon />}
            onClick={onClearFilters}
            sx={{ 
              color: colors.primary,
              fontWeight: 500,
              '&:hover': {
                backgroundColor: colors.backgroundSecondary,
              },
            }}
          >
            {t('forms.articles.knowledgeBase.emptyStates.clearFilters')}
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default ArticleFilters;
