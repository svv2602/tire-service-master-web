// filepath: /home/snisar/mobi_tz/tire-service-master-web/src/pages/reviews/ReviewsPage.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  InputAdornment,
  MenuItem,
  useTheme, // Добавлен импорт темы
  IconButton,
} from '@mui/material';
import {
  Search as SearchIcon,
  Delete as DeleteIcon,
  Reply as ReplyIcon,
  Edit as EditIcon,
  Star as StarIcon,
  Business as BusinessIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Add as AddIcon,
  Pause as PauseIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { 
  useGetReviewsQuery, 
  useDeleteReviewMutation,
  useUpdateReviewMutation,
  useGetServicePointsQuery,
} from '../../api';
import { ReviewStatus, ReviewFormData, ReviewFilter } from '../../types/review';

// Импорты централизованной системы стилей
import { SIZES } from '../../styles/theme';
import { getTablePageStyles } from '../../styles/components';

// Импорты UI компонентов
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/TextField';
import { Chip } from '../../components/ui/Chip';
import { Select } from '../../components/ui/Select';
import { Pagination } from '../../components/ui/Pagination';
import { Modal } from '../../components/ui/Modal';
import { Table, Column } from '../../components/ui/Table';
import Typography from '../../components/ui/Typography';
import { Avatar } from '../../components/ui/Avatar';
import Rating from '../../components/ui/Rating/Rating';
import { Alert } from '../../components/ui/Alert';
import { Tooltip } from '../../components/ui/Tooltip';
import { Progress } from '../../components/ui/Progress';

// Расширяем интерфейс для отображения с полными данными от сериализатора
interface ReviewWithClient {
  id: number;
  user_id?: number;
  client_id: number;
  service_point_id: number;
  booking_id?: number;
  rating: number;
  comment: string;
  text?: string; // Алиас для comment
  status: ReviewStatus;
  is_published?: boolean;
  response?: string;
  created_at: string;
  updated_at: string;
  
  // Данные клиента от сериализатора
  client: {
    id: number;
    first_name: string;
    last_name: string;
    user?: {
      id: number;
      email: string;
      phone: string;
      first_name: string;
      last_name: string;
    };
  };
  
  // Данные сервисной точки от сериализатора
  service_point: {
    id: number;
    name: string;
    address: string;
    phone: string;
  };
  
  // Данные бронирования от сериализатора (опционально)
  booking?: {
    id: number;
    booking_date: string;
    start_time: string;
    end_time: string;
  };
}

// Статусы отзывов с типизацией
const REVIEW_STATUSES: Record<ReviewStatus, {
  label: string;
  color: 'error' | 'info' | 'success' | 'warning';
  icon: React.ReactNode;
}> = {
  pending: { label: 'На модерации', color: 'warning', icon: <StarIcon /> },
  published: { label: 'Опубликован', color: 'success', icon: <CheckIcon /> },
  rejected: { label: 'Отклонен', color: 'error', icon: <CloseIcon /> },
};

const ReviewsPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Получение темы
  const theme = useTheme();
  
  // Инициализация централизованных стилей
  const tablePageStyles = getTablePageStyles(theme);
  
  // Состояние для поиска, фильтрации и пагинации
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | ''>('');
  const [servicePointId, setServicePointId] = useState<string>('');
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(25);
  
  // Состояние для диалогов
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<ReviewWithClient | null>(null);

  // RTK Query хуки
  const { 
    data: reviewsData, 
    isLoading: reviewsLoading, 
    error: reviewsError 
  } = useGetReviewsQuery({
    search: search || undefined,
    status: statusFilter || undefined,
    service_point_id: servicePointId ? Number(servicePointId) : undefined,
    page: page + 1,
    per_page: rowsPerPage,
  } as ReviewFilter);

  const { data: servicePointsData } = useGetServicePointsQuery({} as any);
  const [deleteReview, { isLoading: deleteLoading }] = useDeleteReviewMutation();
  const [updateReview] = useUpdateReviewMutation();

  // Отладочная информация для диагностики
  useEffect(() => {
    console.log('🔍 ReviewsPage Debug Info:');
    console.log('📊 servicePointsData:', servicePointsData);
    console.log('🏢 servicePoints.data:', servicePointsData?.data);
  }, [servicePointsData]);

  const isLoading = reviewsLoading || deleteLoading;
  const error = reviewsError;
  
  // Обрабатываем данные отзывов от сериализатора
  const reviews = (Array.isArray(reviewsData) 
    ? reviewsData.map((review: any) => ({
        ...review,
        user_id: review.user_id || review.client_id || review.client?.id,
        client_id: review.client_id || review.client?.id,
        booking_id: review.booking?.id || 0,
        // Используем статус из API (не перезаписываем!)
        status: review.status || (review.is_published ? 'published' : 'pending'),
        // Гарантируем наличие данных клиента
        client: review.client || {
          id: review.client_id || 0,
          first_name: 'Неизвестно',
          last_name: '',
          user: review.client?.user || null
        },
        // Гарантируем наличие данных сервисной точки
        service_point: review.service_point || {
          id: review.service_point_id || 0,
          name: 'Неизвестная точка',
          address: '',
          phone: ''
        }
      }))
    : []) as ReviewWithClient[];
  
  const totalItems = reviews.length;
  const servicePoints = servicePointsData?.data || [];

  // Обработчики событий
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setPage(0);
  };

  const handleStatusFilterChange = (value: string | number) => {
    setStatusFilter(value as ReviewStatus | '');
    setPage(0);
  };

  const handleServicePointChange = (value: string | number) => {
    setServicePointId(value as string);
    setPage(0);
  };

  const handleChangePage = (newPage: number) => {
    setPage(newPage - 1);
  };

  const handleDeleteClick = (review: ReviewWithClient) => {
    setSelectedReview(review);
    setDeleteDialogOpen(true);
  };

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDeleteConfirm = async () => {
    if (selectedReview) {
      try {
        await deleteReview(selectedReview.id.toString()).unwrap();
        setDeleteDialogOpen(false);
        setSelectedReview(null);
        setErrorMessage(null);
      } catch (error: any) {
        let errorMessage = 'Произошла ошибка при удалении отзыва';
        
        // Обрабатываем различные форматы ошибок от API
        if (error.data?.error) {
          // Основной формат ошибок с ограничениями
          errorMessage = error.data.error;
        } else if (error.data?.message) {
          // Альтернативный формат
          errorMessage = error.data.message;
        } else if (error.data?.errors) {
          // Ошибки валидации
          const errors = error.data.errors as Record<string, string[]>;
          errorMessage = Object.entries(errors)
            .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
            .join('; ');
        } else if (error.message) {
          errorMessage = error.message;
        }
        setErrorMessage(errorMessage);
      }
    }
  };

  const handleStatusChange = async (review: ReviewWithClient, status: ReviewStatus) => {
    try {
      await updateReview({
        id: review.id.toString(),
        data: { status } as Partial<ReviewFormData>
      }).unwrap();
      setErrorMessage(null);
    } catch (error: any) {
      let errorMessage = 'Произошла ошибка при изменении статуса отзыва';
      
      // Обрабатываем различные форматы ошибок от API
      if (error.data?.error) {
        errorMessage = error.data.error;
      } else if (error.data?.message) {
        errorMessage = error.data.message;
      } else if (error.data?.errors) {
        const errors = error.data.errors as Record<string, string[]>;
        errorMessage = Object.entries(errors)
          .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
          .join('; ');
      } else if (error.message) {
        errorMessage = error.message;
      }
      setErrorMessage(errorMessage);
    }
  };

  const handleCloseDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedReview(null);
  };

  // Конфигурация колонок для таблицы
  const columns: Column[] = [
    {
      id: 'client',
      label: 'Клиент',
      wrap: true,
      format: (value: any, review: ReviewWithClient) => (
        <Box sx={tablePageStyles.avatarContainer}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            {getClientInitials(review)}
          </Avatar>
          <Box>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {review.client?.user?.first_name || 'Имя'} {review.client?.user?.last_name || 'Фамилия'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {review.client?.user?.phone || 'Телефон не указан'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ID: {review.client?.id}
            </Typography>
          </Box>
        </Box>
      )
    },
    {
      id: 'service_point',
      label: 'Сервисная точка',
      wrap: true,
      format: (value: any, review: ReviewWithClient) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BusinessIcon color="action" />
          <Box>
            <Typography variant="body2">
              {review.service_point?.name || `Точка #${review.service_point_id}`}
            </Typography>
            {review.booking && (
              <Typography variant="caption" color="text.secondary">
                Бронирование #{review.booking.id}
              </Typography>
            )}
          </Box>
        </Box>
      )
    },
    {
      id: 'comment',
      label: 'Отзыв',
      wrap: true,
      format: (value: any, review: ReviewWithClient) => (
        <Box>
          <Typography
            variant="body2"
            sx={{
              maxWidth: 300,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              marginBottom: 1,
            }}
          >
            {review.text || review.comment}
          </Typography>
          {review.response && (
            <Box sx={{ mt: 1, display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <ReplyIcon color="action" sx={{ fontSize: '1rem' }} />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  maxWidth: 280,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {review.response}
              </Typography>
            </Box>
          )}
        </Box>
      )
    },
    {
      id: 'rating',
      label: 'Оценка',
      align: 'center',
      format: (value: any, review: ReviewWithClient) => (
        <Rating 
          value={review.rating} 
          readOnly 
          size="small" 
          sx={{
            '& .MuiRating-iconFilled': {
              color: theme.palette.warning.main
            }
          }} 
        />
      )
    },
    {
      id: 'status',
      label: 'Статус',
      align: 'center',
      format: (value: any, review: ReviewWithClient) => (
        <Chip
          label={REVIEW_STATUSES[review.status as ReviewStatus].label}
          color={REVIEW_STATUSES[review.status as ReviewStatus].color}
          size="small"
        />
      )
    },
    {
      id: 'created_at',
      label: 'Дата',
      format: (value: any, review: ReviewWithClient) => (
        <Typography variant="body2">
          {formatDate(review.created_at)}
        </Typography>
      )
    },
    {
      id: 'actions',
      label: 'Действия',
      align: 'right',
      format: (value: any, review: ReviewWithClient) => (
        <Box sx={tablePageStyles.actionsContainer}>
          {/* Кнопки управления статусом */}
          {review.status !== 'published' && (
            <Tooltip title="Одобрить отзыв">
              <IconButton
                onClick={() => handleStatusChange(review, 'published')}
                size="small"
                sx={{
                  '&:hover': {
                    backgroundColor: `${theme.palette.success.main}15`
                  }
                }}
              >
                <CheckIcon color="success" />
              </IconButton>
            </Tooltip>
          )}
          {review.status !== 'rejected' && (
            <Tooltip title="Отклонить отзыв">
              <IconButton
                onClick={() => handleStatusChange(review, 'rejected')}
                size="small"
                sx={{
                  '&:hover': {
                    backgroundColor: `${theme.palette.error.main}15`
                  }
                }}
              >
                <CloseIcon color="error" />
              </IconButton>
            </Tooltip>
          )}
          {review.status === 'published' && (
            <Tooltip title="Снять с публикации">
              <IconButton
                onClick={() => handleStatusChange(review, 'pending')}
                size="small"
                sx={{
                  '&:hover': {
                    backgroundColor: `${theme.palette.warning.main}15`
                  }
                }}
              >
                <PauseIcon color="warning" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Редактировать отзыв">
            <IconButton
              onClick={() => navigate(`/admin/reviews/${review.id}/edit`)}
              size="small"
              sx={tablePageStyles.actionButton}
            >
              <EditIcon color="info" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Ответить на отзыв">
            <IconButton
              onClick={() => navigate(`/admin/reviews/${review.id}/reply`)}
              size="small"
              sx={tablePageStyles.actionButton}
            >
              <ReplyIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Удалить отзыв">
            <IconButton
              onClick={() => handleDeleteClick(review)}
              size="small"
              sx={tablePageStyles.actionButton}
            >
              <DeleteIcon color="error" />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

  // Вспомогательные функции
  const getClientInitials = (review: ReviewWithClient) => {
    const firstName = review.client?.user?.first_name || '';
    const lastName = review.client?.user?.last_name || '';
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || 'П';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Отображение состояний загрузки и ошибок
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Progress variant="circular" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: SIZES.spacing.lg }}>
        <Alert severity="error">
          ❌ Ошибка при загрузке отзывов: {error.toString()}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={tablePageStyles.pageContainer}>
      {/* Отображение ошибок */}
      {errorMessage && (
        <Box sx={{ mb: 2 }}>
          <Alert severity="error" onClose={() => setErrorMessage(null)}>
            {errorMessage}
          </Alert>
        </Box>
      )}

      {/* Заголовок и кнопки действий */}
      <Box sx={tablePageStyles.pageHeader}>
        <Typography variant="h4" sx={tablePageStyles.pageTitle}>
          Отзывы
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/admin/reviews/new')}
          sx={tablePageStyles.createButton}
        >
          Добавить отзыв
        </Button>
      </Box>

      {/* Фильтры */}
      <Box sx={tablePageStyles.filtersContainer}>
        <TextField
          placeholder="Поиск по тексту отзыва, имени клиента или телефону..."
          variant="outlined"
          size="small"
          value={search}
          onChange={handleSearchChange}
          sx={tablePageStyles.searchField}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        
        <Select
          value={statusFilter}
          onChange={handleStatusFilterChange}
          label="Статус"
          size="small"
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">Все статусы</MenuItem>
          {Object.entries(REVIEW_STATUSES).map(([value, { label }]) => (
            <MenuItem key={value} value={value}>
              {label}
            </MenuItem>
          ))}
        </Select>

        <Select
          value={servicePointId}
          onChange={handleServicePointChange}
          label="Сервисная точка"
          size="small"
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">Все точки</MenuItem>
          {servicePoints.map((point) => (
            <MenuItem key={point.id} value={point.id.toString()}>
              {point.name}
            </MenuItem>
          ))}
        </Select>
      </Box>

      {/* Статистика */}
      <Box sx={{ 
        mb: 2, 
        display: 'flex', 
        gap: 3, 
        flexWrap: 'wrap', 
        alignItems: 'center' 
      }}>
        <Typography variant="body2" color="text.secondary">
          Найдено отзывов: <strong>{totalItems}</strong>
        </Typography>
        {reviews.length > 0 && (
          <>
            <Typography variant="body2" color="success.main">
              Опубликованных: <strong>{reviews.filter(r => r.status === 'published').length}</strong>
            </Typography>
            <Typography variant="body2" color="warning.main">
              На модерации: <strong>{reviews.filter(r => r.status === 'pending').length}</strong>
            </Typography>
            <Typography variant="body2" color="error.main">
              Отклоненных: <strong>{reviews.filter(r => r.status === 'rejected').length}</strong>
            </Typography>
          </>
        )}
      </Box>

      {/* Таблица отзывов */}
      <Box sx={tablePageStyles.tableContainer}>
        <Table
          columns={columns}
          rows={reviews}
        />
        
        {/* Пагинация */}
        {Math.ceil(totalItems / rowsPerPage) > 1 && (
          <Box sx={tablePageStyles.paginationContainer}>
            <Pagination
              count={Math.ceil(totalItems / rowsPerPage)}
              page={page + 1}
              onChange={handleChangePage}
              disabled={isLoading}
            />
          </Box>
        )}
      </Box>

      {/* Модальное окно подтверждения удаления */}
      <Modal 
        open={deleteDialogOpen} 
        onClose={handleCloseDialog}
        title="Подтверждение удаления"
        maxWidth={400}
        actions={
          <>
            <Button onClick={handleCloseDialog}>
              Отмена
            </Button>
            <Button onClick={handleDeleteConfirm} color="error" variant="contained">
              Удалить
            </Button>
          </>
        }
      >
        <Typography sx={{ fontSize: SIZES.fontSize.md }}>
          Вы действительно хотите удалить отзыв клиента{' '}
          {selectedReview?.client?.user?.first_name} {selectedReview?.client?.user?.last_name}?
          Это действие нельзя будет отменить.
        </Typography>
      </Modal>
    </Box>
  );
};

export default ReviewsPage;
