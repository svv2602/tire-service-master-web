/**
 * ArticlesPageNew - Новая версия страницы управления статьями
 * Миграция на PageTable компонент для унификации дизайна
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Chip,
  Typography,
  Grid,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Star as StarIcon,
  Schedule as TimeIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Article as ArticleIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Импорты UI компонентов
import { PageTable } from '../../components/common/PageTable';
import type { 
  PageHeaderConfig, 
  SearchConfig, 
  FilterConfig, 
  ActionConfig,
  Column
} from '../../components/common/PageTable';
import Notification from '../../components/Notification';

// Локальные импорты
import { useGetArticlesQuery, useGetCategoriesQuery } from '../../api/articles.api';
import { useArticleActions } from '../../hooks/useArticles';
import { ArticleSummary } from '../../types/articles';
import { getTablePageStyles, getCardStyles } from '../../styles/components';

const ArticlesPageNew: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const tablePageStyles = getTablePageStyles(theme);
  const cardStyles = getCardStyles(theme);
  
  // Состояние для поиска, фильтрации и пагинации
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [page, setPage] = useState(0);
  const PER_PAGE = 12;

  // Состояние для уведомлений
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  // Функция для получения переводов статусов
  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      published: t('admin.articles.status.published'),
      draft: t('admin.articles.status.draft'),
      archived: t('admin.articles.status.archived')
    };
    return statusMap[status] || status;
  };

  // Подготовка фильтров для API
  const filters = useMemo(() => ({
    query: searchQuery || undefined,
    category: selectedCategory || undefined,
    status: selectedStatus || undefined,
    page: page,
    per_page: PER_PAGE
  }), [searchQuery, selectedCategory, selectedStatus, page]);

  // Хуки для данных
  const { data, error, isLoading, refetch } = useGetArticlesQuery(filters);
  const { data: categoriesData } = useGetCategoriesQuery();
  const { deleteArticle } = useArticleActions();

  // Данные для отображения
  const articles = useMemo(() => data?.data || [], [data?.data]);
  const totalItems = useMemo(() => data?.meta?.total_count || 0, [data?.meta?.total_count]);
  const categories = categoriesData || [];

  // Обработчики событий
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setPage(0);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleDeleteArticle = useCallback(async (article: ArticleSummary) => {
    try {
      const result = await deleteArticle(article.id);
      
      if (result.success) {
        setNotification({
          open: true,
          message: t('admin.articles.messages.deleteSuccess', { title: article.title }),
          severity: 'success'
        });
        refetch();
      } else {
        setNotification({
          open: true,
          message: t('admin.articles.messages.deleteError', { error: result.error }),
          severity: 'error'
        });
      }
    } catch (error: any) {
      setNotification({
        open: true,
        message: t('admin.articles.messages.deleteErrorGeneral'),
        severity: 'error'
      });
    }
  }, [deleteArticle, refetch, t]);

  const handleCloseNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, open: false }));
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Статистические данные
  const stats = useMemo(() => {
    const published = articles.filter(a => a.status === 'published').length;
    const drafts = articles.filter(a => a.status === 'draft').length;
    const totalViews = articles.reduce((sum, a) => sum + (a.views_count || 0), 0);
    
    return { published, drafts, totalViews };
  }, [articles]);

  // Конфигурация PageTable
  const headerConfig: PageHeaderConfig = useMemo(() => ({
    title: t('admin.articles.title'),
    subtitle: t('admin.articles.subtitle'),
    actions: [
      {
        id: 'add',
        label: t('admin.articles.createArticle'),
        icon: <AddIcon />,
        onClick: () => navigate('/admin/articles/new'),
        variant: 'contained'
      }
    ]
  }), [navigate, t]);

  const searchConfig: SearchConfig = useMemo(() => ({
    placeholder: t('admin.articles.searchPlaceholder'),
    value: searchQuery,
    onChange: handleSearchChange
  }), [searchQuery, handleSearchChange, t]);

  const filtersConfig: FilterConfig[] = useMemo(() => [
    {
      id: 'category',
      label: t('admin.articles.filters.category'),
      type: 'select',
      value: selectedCategory,
      options: [
        { value: '', label: t('admin.articles.filters.allCategories') },
        ...categories.map((category: any) => ({
          value: category.key || category.name,
          label: category.name
        }))
      ],
      onChange: (value: any) => {
        setSelectedCategory(value);
        setPage(0);
      }
    },
    {
      id: 'status',
      label: t('admin.articles.filters.status'),
      type: 'select',
      value: selectedStatus,
      options: [
        { value: '', label: t('admin.articles.filters.allStatuses') },
        { value: 'published', label: t('admin.articles.status.published') },
        { value: 'draft', label: t('admin.articles.status.draft') },
        { value: 'archived', label: t('admin.articles.status.archived') }
      ],
      onChange: (value: any) => {
        setSelectedStatus(value);
        setPage(0);
      }
    }
  ], [selectedCategory, selectedStatus, categories, t]);

  const columns: Column<ArticleSummary>[] = useMemo(() => [
    {
      id: 'title',
      label: t('admin.articles.columns.article'),
      sortable: true,
      render: (article: ArticleSummary) => (
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  cursor: 'pointer',
                  '&:hover': { color: theme.palette.primary.main }
                }}
                onClick={() => navigate(`/admin/articles/${article.id}`)}
              >
                {article.title}
              </Typography>
              {article.featured && (
                <Chip
                  icon={<StarIcon sx={{ fontSize: '14px !important' }} />}
                  label={t('admin.articles.meta.featured')}
                  size="small"
                  color="warning"
                />
              )}
            </Box>
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.secondary,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                mb: 0.5
              }}
            >
              {article.excerpt}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon sx={{ fontSize: 14, color: theme.palette.text.secondary }} />
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                {article.author?.name || t('admin.articles.meta.unknownAuthor')}
              </Typography>
            </Box>
          </Box>
        </Box>
      )
    },
    {
      id: 'category',
      label: t('admin.articles.columns.category'),
      align: 'center',
      hideOnMobile: true,
      render: (article: ArticleSummary) => (
        <Typography variant="body2">
          {article.category_name || '—'}
        </Typography>
      )
    },
    {
      id: 'status',
      label: t('admin.articles.columns.status'),
      align: 'center',
      render: (article: ArticleSummary) => (
        <Chip
          label={getStatusLabel(article.status)}
          color={
            article.status === 'published' ? 'success' :
            article.status === 'draft' ? 'warning' : 'default'
          }
          size="small"
        />
      )
    },
    {
      id: 'views_count',
      label: t('admin.articles.columns.views'),
      align: 'center',
      hideOnMobile: true,
      render: (article: ArticleSummary) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'center' }}>
          <VisibilityIcon sx={{ fontSize: 14, color: theme.palette.text.secondary }} />
          <Typography variant="body2">
            {article.views_count || 0}
          </Typography>
        </Box>
      )
    },
    {
      id: 'created_at',
      label: t('admin.articles.columns.createdAt'),
      align: 'center',
      hideOnMobile: true,
      render: (article: ArticleSummary) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'center' }}>
          <CalendarIcon sx={{ fontSize: 14, color: theme.palette.text.secondary }} />
          <Typography variant="body2">
            {formatDate(article.created_at)}
          </Typography>
        </Box>
      )
    }
  ], [theme.palette, navigate, t, getStatusLabel]);

  const actionsConfig: ActionConfig<ArticleSummary>[] = useMemo(() => [
    {
      label: t('admin.articles.actions.view'),
      icon: <ViewIcon />,
      onClick: (article: ArticleSummary) => navigate(`/admin/articles/${article.id}`),
      color: 'primary'
    },
    {
      label: t('admin.articles.actions.edit'),
      icon: <EditIcon />,
      onClick: (article: ArticleSummary) => navigate(`/admin/articles/${article.id}/edit`),
      color: 'success'
    },
    {
      label: t('admin.articles.actions.delete'),
      icon: <DeleteIcon />,
      onClick: (article: ArticleSummary) => handleDeleteArticle(article),
      color: 'error',
      requireConfirmation: true,
      confirmationConfig: {
        title: t('admin.articles.deleteConfirmTitle'),
        message: t('admin.articles.deleteConfirmMessage'),
        confirmLabel: t('common.delete'),
        cancelLabel: t('common.cancel'),
      }
    }
  ], [navigate, handleDeleteArticle, t]);

  return (
    <Box sx={tablePageStyles.container}>
      {/* Статистика */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ ...cardStyles, textAlign: 'center', p: 2 }}>
            <ArticleIcon sx={{ fontSize: 40, color: theme.palette.primary.main, mb: 1 }} />
            <Typography variant="h4" sx={{ fontSize: '1.5rem', fontWeight: 600 }}>
              {totalItems}
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              {t('admin.articles.stats.total')}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ ...cardStyles, textAlign: 'center', p: 2 }}>
            <StarIcon sx={{ fontSize: 40, color: theme.palette.success.main, mb: 1 }} />
            <Typography variant="h4" sx={{ fontSize: '1.5rem', fontWeight: 600 }}>
              {stats.published}
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              {t('admin.articles.stats.published')}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ ...cardStyles, textAlign: 'center', p: 2 }}>
            <VisibilityIcon sx={{ fontSize: 40, color: theme.palette.info.main, mb: 1 }} />
            <Typography variant="h4" sx={{ fontSize: '1.5rem', fontWeight: 600 }}>
              {stats.totalViews}
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              {t('admin.articles.stats.views')}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ ...cardStyles, textAlign: 'center', p: 2 }}>
            <EditIcon sx={{ fontSize: 40, color: theme.palette.warning.main, mb: 1 }} />
            <Typography variant="h4" sx={{ fontSize: '1.5rem', fontWeight: 600 }}>
              {stats.drafts}
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              {t('admin.articles.stats.drafts')}
            </Typography>
          </Box>
        </Grid>
      </Grid>

      <PageTable<ArticleSummary>
        header={headerConfig}
        search={searchConfig}
        filters={filtersConfig}
        columns={columns}
        rows={articles}
        actions={actionsConfig}
        loading={isLoading}
        pagination={{
          page,
          totalItems,
          rowsPerPage: PER_PAGE,
          onPageChange: handlePageChange
        }}
        emptyState={{
          title: searchQuery || selectedCategory || selectedStatus ? t('admin.articles.noResultsFound') : t('admin.articles.noArticles'),
          description: searchQuery || selectedCategory || selectedStatus
            ? t('admin.articles.noResultsDescription')
            : t('admin.articles.noArticlesDescription'),
          action: (!searchQuery && !selectedCategory && !selectedStatus) ? {
            label: t('admin.articles.createArticle'),
            icon: <AddIcon />,
            onClick: () => navigate('/admin/articles/new')
          } : undefined
        }}
      />

      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={handleCloseNotification}
      />
    </Box>
  );
};

export default ArticlesPageNew; 