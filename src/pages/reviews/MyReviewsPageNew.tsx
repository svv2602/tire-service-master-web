import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box,
  Typography,
  Avatar,
  Rating,
  Chip,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
  Star as StarIcon,
  CalendarToday as CalendarTodayIcon,
  Comment as CommentIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useSelector } from 'react-redux';

// Импорты UI компонентов
import { PageTable } from '../../components/common/PageTable';
import Notification from '../../components/Notification';
import { getTablePageStyles } from '../../styles';

// Импорты API
import { 
  useGetReviewsByClientQuery, 
  useDeleteReviewMutation,
  useUpdateReviewMutation,
} from '../../api';

// Типы
import type { Review } from '../../types/models';
import type { RootState } from '../../store';

interface MyReviewsPageNewProps {}

const MyReviewsPageNew: React.FC<MyReviewsPageNewProps> = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const tablePageStyles = getTablePageStyles(theme);
  
  // Получаем userId из Redux store
  const userId = useSelector((state: RootState) => state.auth.user?.id);
  
  // Состояние для фильтров и поиска
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRating, setSelectedRating] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  // Константы
  const PER_PAGE = 10;

  // API запросы
  const { 
    data: reviewsData, 
    isLoading: reviewsLoading, 
    error: reviewsError 
  } = useGetReviewsByClientQuery(userId?.toString() || '', { skip: !userId });

  const [deleteReview] = useDeleteReviewMutation();
  const [updateReview] = useUpdateReviewMutation();

  const isLoading = reviewsLoading;
  const reviews = reviewsData || [];

  // Фильтрация данных
  const filteredData = useMemo(() => {
    let filtered = reviews;

    // Фильтр по поиску
    if (searchQuery) {
      filtered = filtered.filter(review => 
        review.comment?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.service_point?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Фильтр по рейтингу
    if (selectedRating !== 'all') {
      const ratingValue = parseInt(selectedRating);
      filtered = filtered.filter(review => review.rating === ratingValue);
    }

    return filtered;
  }, [reviews, searchQuery, selectedRating]);

  const totalItems = filteredData.length;

  // Обработчики событий
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    setPage(0);
  }, []);

  const handleRatingFilterChange = useCallback((rating: string) => {
    setSelectedRating(rating);
    setPage(0);
  }, []);

  const showNotification = useCallback((message: string, severity: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setNotification({ open: true, message, severity });
  }, []);

  const handleCloseNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, open: false }));
  }, []);

  // Обработка удаления
  const handleDelete = useCallback(async (review: Review) => {
    try {
      await deleteReview(review.id.toString()).unwrap();
      showNotification('Отзыв успешно удален', 'success');
    } catch (error) {
      console.error('Ошибка при удалении отзыва:', error);
      showNotification('Ошибка при удалении отзыва', 'error');
    }
  }, [deleteReview, showNotification]);

  // Форматирование даты
  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, []);

  // Конфигурация заголовка
  const headerConfig = useMemo(() => ({
    title: 'Мои отзывы',
    subtitle: 'Управление вашими отзывами о сервисных точках',
    actions: [
      {
        label: 'Написать отзыв',
        icon: <AddIcon />,
        onClick: () => navigate('/admin/reviews/new'),
        variant: 'contained' as const,
        color: 'primary' as const
      }
    ]
  }), [navigate]);

  // Конфигурация поиска
  const searchConfig = useMemo(() => ({
    placeholder: 'Поиск по тексту отзыва или названию сервиса...',
    value: searchQuery,
    onChange: handleSearchChange
  }), [searchQuery, handleSearchChange]);

  // Конфигурация фильтров
  const filtersConfig = useMemo(() => [
    {
      id: 'rating',
      key: 'rating',
      type: 'select' as const,
      label: 'Рейтинг',
      value: selectedRating,
      onChange: handleRatingFilterChange,
      options: [
        { value: 'all', label: 'Все оценки' },
        { value: '5', label: '5 звезд' },
        { value: '4', label: '4 звезды' },
        { value: '3', label: '3 звезды' },
        { value: '2', label: '2 звезды' },
        { value: '1', label: '1 звезда' }
      ]
    }
  ], [selectedRating, handleRatingFilterChange]);

  // Конфигурация колонок
  const columns = useMemo(() => [
    {
      id: 'review',
      key: 'comment' as keyof Review,
      label: 'Отзыв',
      sortable: false,
      render: (review: Review) => (
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}>
            <CommentIcon />
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
              <BusinessIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {review.service_point?.name || 'Неизвестная точка'}
              </Typography>
            </Box>
            <Typography 
              variant="body2" 
              sx={{ 
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                mb: 0.5
              }}
            >
              {review.comment}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CalendarTodayIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {formatDate(review.created_at)}
              </Typography>
            </Box>
          </Box>
        </Box>
      )
    },
    {
      id: 'service_point',
      key: 'service_point' as keyof Review,
      label: 'Сервисная точка',
      sortable: true,
      hideOnMobile: true,
      render: (review: Review) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <BusinessIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="body2">
            {review.service_point?.name || 'Неизвестная точка'}
          </Typography>
        </Box>
      )
    },
    {
      id: 'rating',
      key: 'rating' as keyof Review,
      label: 'Оценка',
      sortable: true,
      render: (review: Review) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Rating value={review.rating} readOnly size="small" />
          <Chip 
            label={`${review.rating}/5`}
            size="small"
            color="primary"
            icon={<StarIcon />}
          />
        </Box>
      )
    },
    {
      id: 'created_at',
      key: 'created_at' as keyof Review,
      label: 'Дата создания',
      sortable: true,
      hideOnMobile: true,
      render: (review: Review) => (
        <Typography variant="body2">
          {formatDate(review.created_at)}
        </Typography>
      )
    }
  ], [formatDate]);

  // Конфигурация действий
  const actionsConfig = useMemo(() => [
    {
      key: 'edit',
      label: 'Редактировать',
      icon: <EditIcon />,
      onClick: (review: Review) => navigate(`/admin/reviews/${review.id}/edit`),
      color: 'primary' as const
    },
    {
      key: 'delete',
      label: 'Удалить',
      icon: <DeleteIcon />,
      onClick: handleDelete,
      color: 'error' as const,
      confirmationText: 'Вы уверены, что хотите удалить этот отзыв?'
    }
  ], [navigate, handleDelete]);

  // Обработка случая, когда пользователь не авторизован
  if (!userId) {
    return (
      <Box sx={tablePageStyles.pageContainer}>
        <Alert severity="warning">
          Необходимо войти в систему для просмотра отзывов
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={tablePageStyles.pageContainer}>
      <PageTable<Review>
        header={headerConfig}
        search={searchConfig}
        filters={filtersConfig}
        columns={columns}
        rows={filteredData}
        actions={actionsConfig}
        loading={isLoading}
        pagination={{
          page,
          totalItems,
          rowsPerPage: PER_PAGE,
          onPageChange: handlePageChange
        }}
        emptyState={{
          title: searchQuery || selectedRating !== 'all' ? 'Отзывы не найдены' : 'У вас пока нет отзывов',
          description: searchQuery || selectedRating !== 'all'
            ? 'Попробуйте изменить критерии поиска'
            : 'Напишите первый отзыв о посещенной сервисной точке',
          action: (!searchQuery && selectedRating === 'all') ? {
            label: 'Написать отзыв',
            icon: <AddIcon />,
            onClick: () => navigate('/admin/reviews/new')
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

export default MyReviewsPageNew; 