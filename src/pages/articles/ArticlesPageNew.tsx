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

// Константы для статусов
const ARTICLE_STATUS_LABELS = {
  published: 'Опубликовано',
  draft: 'Черновик',
  archived: 'Архив'
} as const;

const ArticlesPageNew: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
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
          message: `Статья "${article.title}" успешно удалена`,
          severity: 'success'
        });
        refetch();
      } else {
        setNotification({
          open: true,
          message: `Ошибка при удалении статьи: ${result.error}`,
          severity: 'error'
        });
      }
    } catch (error: any) {
      setNotification({
        open: true,
        message: 'Произошла ошибка при удалении статьи',
        severity: 'error'
      });
    }
  }, [deleteArticle, refetch]);

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
    title: 'База знаний (PageTable)',
    subtitle: 'Управление статьями и материалами для клиентов',
    actions: [
      {
        id: 'add',
        label: 'Создать статью',
        icon: <AddIcon />,
        onClick: () => navigate('/admin/articles/new'),
        variant: 'contained'
      }
    ]
  }), [navigate]);

  const searchConfig: SearchConfig = useMemo(() => ({
    placeholder: 'Поиск статей по названию или содержанию...',
    value: searchQuery,
    onChange: handleSearchChange
  }), [searchQuery, handleSearchChange]);

  const filtersConfig: FilterConfig[] = useMemo(() => [
    {
      id: 'category',
      label: 'Категория',
      type: 'select',
      value: selectedCategory,
      options: [
        { value: '', label: 'Все категории' },
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
      label: 'Статус',
      type: 'select',
      value: selectedStatus,
      options: [
        { value: '', label: 'Все статусы' },
        { value: 'published', label: 'Опубликовано' },
        { value: 'draft', label: 'Черновик' },
        { value: 'archived', label: 'Архив' }
      ],
      onChange: (value: any) => {
        setSelectedStatus(value);
        setPage(0);
      }
    }
  ], [selectedCategory, selectedStatus, categories]);

  const columns: Column<ArticleSummary>[] = useMemo(() => [
    {
      id: 'title',
      label: 'Статья',
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
                  label="Рекомендуемая"
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <TimeIcon sx={{ fontSize: 14, color: theme.palette.text.secondary }} />
                <Typography variant="caption">
                  {article.reading_time || 5} мин
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <PersonIcon sx={{ fontSize: 14, color: theme.palette.text.secondary }} />
                <Typography variant="caption">
                  {article.author?.name || 'Автор'}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      )
    },
    {
      id: 'category',
      label: 'Категория',
      align: 'center',
      hideOnMobile: true,
      render: (article: ArticleSummary) => (
        <Typography variant="body2">
          {article.category_name || article.category || '-'}
        </Typography>
      )
    },
    {
      id: 'status',
      label: 'Статус',
      align: 'center',
      render: (article: ArticleSummary) => (
        <Chip
          label={ARTICLE_STATUS_LABELS[article.status as keyof typeof ARTICLE_STATUS_LABELS]}
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
      label: 'Просмотры',
      align: 'center',
      hideOnMobile: true,
      render: (article: ArticleSummary) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'center' }}>
          <VisibilityIcon sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
          <Typography variant="body2">
            {article.views_count || 0}
          </Typography>
        </Box>
      )
    },
    {
      id: 'created_at',
      label: 'Дата создания',
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
  ], [theme.palette, navigate]);

  const actionsConfig: ActionConfig<ArticleSummary>[] = useMemo(() => [
    {
      label: 'Просмотр',
      icon: <ViewIcon />,
      onClick: (article: ArticleSummary) => navigate(`/admin/articles/${article.id}`),
      color: 'primary'
    },
    {
      label: 'Редактировать',
      icon: <EditIcon />,
      onClick: (article: ArticleSummary) => navigate(`/admin/articles/${article.id}/edit`),
      color: 'success'
    },
    {
      label: 'Удалить',
      icon: <DeleteIcon />,
      onClick: (article: ArticleSummary) => handleDeleteArticle(article),
      color: 'error',
      requireConfirmation: true,
      confirmationConfig: {
        title: 'Подтверждение удаления',
        message: 'Вы действительно хотите удалить эту статью? Это действие нельзя будет отменить.',
        confirmLabel: 'Удалить',
        cancelLabel: 'Отмена',
      }
    }
  ], [navigate, handleDeleteArticle]);

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
              Всего статей
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
              Опубликовано
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
              Просмотров
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
              Черновиков
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
          title: searchQuery || selectedCategory || selectedStatus ? 'Статьи не найдены' : 'Нет статей',
          description: searchQuery || selectedCategory || selectedStatus
            ? 'Попробуйте изменить критерии поиска'
            : 'Создайте первую статью для начала работы',
          action: (!searchQuery && !selectedCategory && !selectedStatus) ? {
            label: 'Создать статью',
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