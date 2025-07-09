import React, { useState, useCallback, useMemo } from 'react';
import { Box, Typography as MuiTypography, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
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
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { 
  useGetReviewsQuery, 
  useDeleteReviewMutation,
  useUpdateReviewMutation,
  useGetServicePointsQuery,
} from '../../api';
import { ReviewStatus, ReviewFilter } from '../../types/review';

// Импорт PageTable и связанных компонентов
import { PageTable } from '../../components/common/PageTable';
import { 
  PageHeaderConfig, 
  SearchConfig, 
  FilterConfig 
} from '../../components/common/PageTable';
import { Column } from '../../components/ui/Table/Table';

// Импорты UI компонентов
import { Chip } from '../../components/ui/Chip';
import Typography from '../../components/ui/Typography';
import { Avatar } from '../../components/ui/Avatar';
import Rating from '../../components/ui/Rating/Rating';
import { Alert } from '../../components/ui/Alert';
import { ActionsMenu, ActionItem } from '../../components/ui/ActionsMenu/ActionsMenu';
import Notification from '../../components/Notification';

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

const ReviewsPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const theme = useTheme();

  // Статусы отзывов с типизацией (теперь внутри компонента, чтобы использовать t)
  const REVIEW_STATUSES: Record<ReviewStatus, {
    label: string;
    color: 'error' | 'info' | 'success' | 'warning';
    icon: React.ReactNode;
  }> = {
    pending: { label: t('admin.reviews.status.pending'), color: 'warning', icon: <StarIcon /> },
    published: { label: t('admin.reviews.status.published'), color: 'success', icon: <CheckIcon /> },
    rejected: { label: t('admin.reviews.status.rejected'), color: 'error', icon: <CloseIcon /> },
  };
  
  // Состояние для поиска, фильтрации и пагинации
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | ''>('');
  const [servicePointId, setServicePointId] = useState<string>('');
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(25);
  


  // RTK Query хуки
  const { 
    data: reviewsData, 
    isLoading: reviewsLoading, 
    error: reviewsError 
  } = useGetReviewsQuery({
    search: search || undefined,
    status: statusFilter || undefined,
    service_point_id: servicePointId ? Number(servicePointId) : undefined,
    page: page + 1, // Backend ожидает 1-based страницы
    per_page: rowsPerPage,
  } as ReviewFilter);

  const { data: servicePointsData } = useGetServicePointsQuery({} as any);
  const [deleteReview, { isLoading: deleteLoading }] = useDeleteReviewMutation();
  const [updateReview] = useUpdateReviewMutation();

  const isLoading = reviewsLoading || deleteLoading;
  
  // Обрабатываем данные отзывов от сериализатора
  const reviews = (reviewsData?.data 
    ? reviewsData.data.map((review: any) => ({
        ...review,
        user_id: review.user_id || review.client_id || review.client?.id,
        client_id: review.client_id || review.client?.id,
        booking_id: review.booking?.id || 0,
        status: review.status || (review.is_published ? 'published' : 'pending'),
        client: review.client || {
          id: review.client_id || 0,
          first_name: t('common.unknown'),
          last_name: '',
          user: review.client?.user || null
        },
        service_point: review.service_point || {
          id: review.service_point_id || 0,
          name: t('tables.columns.unknownServicePoint'),
          address: '',
          phone: ''
        }
      }))
    : []) as ReviewWithClient[];
  
  const totalItems = reviewsData?.pagination?.total_items || 0;
  const servicePoints = servicePointsData?.data || [];

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

  const handleCloseNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, open: false }));
  }, []);

  // Обработчики действий
  const handleUpdateReviewStatus = useCallback(async (review: ReviewWithClient, status: string) => {
    try {
      await updateReview({
        id: review.id.toString(),
        data: { status: status as ReviewStatus }
      }).unwrap();
      setNotification({
        open: true,
        message: status === 'published' ? t('admin.reviews.successPublish') : status === 'rejected' ? t('admin.reviews.successReject') : t('admin.reviews.successUnpublish'),
        severity: 'success'
      });
    } catch (error: any) {
      setNotification({
        open: true,
        message: error?.data?.message || t('admin.reviews.errorStatus'),
        severity: 'error'
      });
    }
  }, [updateReview, t]);

  const handleDeleteReview = useCallback(async (review: ReviewWithClient) => {
    try {
      await deleteReview(review.id.toString()).unwrap();
      setNotification({
        open: true,
        message: t('admin.reviews.successDelete'),
        severity: 'success'
      });
    } catch (error: any) {
      setNotification({
        open: true,
        message: error?.data?.message || t('admin.reviews.errorDelete'),
        severity: 'error'
      });
    }
  }, [deleteReview, t]);

  // Конфигурация действий для ActionsMenu
  const reviewActions: ActionItem<ReviewWithClient>[] = useMemo(() => [
    {
      id: 'approve',
      label: t('tables.actions.approve'),
      icon: <CheckIcon />,
      onClick: (review: ReviewWithClient) => handleUpdateReviewStatus(review, 'published'),
      color: 'success',
      tooltip: t('tables.actions.approve'),
      isVisible: (review: ReviewWithClient) => review.status !== 'published'
    },
    {
      id: 'reject',
      label: t('tables.actions.reject'),
      icon: <CloseIcon />,
      onClick: (review: ReviewWithClient) => handleUpdateReviewStatus(review, 'rejected'),
      color: 'error',
      tooltip: t('tables.actions.reject'),
      isVisible: (review: ReviewWithClient) => review.status !== 'rejected'
    },
    {
      id: 'unpublish',
      label: t('tables.actions.unpublish'),
      icon: <VisibilityOffIcon />,
      onClick: (review: ReviewWithClient) => handleUpdateReviewStatus(review, 'pending'),
      color: 'warning',
      tooltip: t('tables.actions.unpublish'),
      isVisible: (review: ReviewWithClient) => review.status === 'published'
    },
    {
      id: 'edit',
      label: t('tables.actions.edit'),
      icon: <EditIcon />,
      onClick: (review: ReviewWithClient) => navigate(`/admin/reviews/${review.id}/edit`),
      color: 'info',
      tooltip: t('admin.reviews.editReview')
    },
    {
      id: 'reply',
      label: t('tables.actions.reply'),
      icon: <ReplyIcon />,
      onClick: (review: ReviewWithClient) => navigate(`/admin/reviews/${review.id}/reply`),
      color: 'primary',
      tooltip: t('admin.reviews.replyReview')
    },
    {
      id: 'delete',
      label: t('tables.actions.delete'),
      icon: <DeleteIcon />,
      onClick: handleDeleteReview,
      color: 'error',
      tooltip: t('admin.reviews.deleteReview'),
      requireConfirmation: true,
      confirmationConfig: {
        title: t('admin.reviews.confirmDeleteTitle'),
        message: t('admin.reviews.confirmDeleteMessage'),
      }
    }
  ], [navigate, handleUpdateReviewStatus, handleDeleteReview, t]);

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

  // Конфигурация заголовка страницы
  const headerConfig: PageHeaderConfig = {
    title: t('admin.reviews.title'),
    subtitle: t('admin.reviews.subtitle', { count: totalItems }),
    actions: [
      {
        id: 'add',
        label: t('admin.reviews.addReview'),
        icon: <AddIcon />,
        onClick: () => navigate('/admin/reviews/new')
      }
    ]
  };

  // Конфигурация поиска
  const searchConfig: SearchConfig = {
    placeholder: t('admin.reviews.searchPlaceholder'),
    value: search,
    onChange: setSearch,
    showClearButton: true
  };

  // Конфигурация фильтров
  const filtersConfig: FilterConfig[] = [
    {
      id: 'status',
      label: t('tables.columns.status'),
      type: 'select',
      value: statusFilter,
      onChange: (value: string | number) => setStatusFilter(value as ReviewStatus | ''),
      options: [
        { value: '', label: t('admin.reviews.allStatuses') },
        ...Object.entries(REVIEW_STATUSES).map(([value, { label }]) => ({
          value,
          label
        }))
      ]
    },
    {
      id: 'service_point',
      label: t('tables.columns.servicePoint'),
      type: 'select',
      value: servicePointId,
      onChange: (value: string | number) => setServicePointId(value as string),
      options: [
        { value: '', label: t('admin.reviews.allServicePoints') },
        ...servicePoints.map(point => ({
          value: point.id.toString(),
          label: point.name
        }))
      ]
    }
  ];

  // Конфигурация колонок
  const columns: Column[] = [
    {
      id: 'client',
      label: t('tables.columns.client'),
      minWidth: 200,
      wrap: true,
      format: (value: any, review: ReviewWithClient) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
            {getClientInitials(review)}
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {review.client?.user?.first_name || t('tables.columns.firstName')} {review.client?.user?.last_name || t('tables.columns.lastName')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {review.client?.user?.phone || t('tables.columns.phoneNotSpecified')}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              ID: {review.client?.id}
            </Typography>
          </Box>
        </Box>
      )
    },
    {
      id: 'service_point',
      label: t('tables.columns.servicePoint'),
      minWidth: 180,
      wrap: true,
      hideOnMobile: true,
      format: (value: any, review: ReviewWithClient) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BusinessIcon color="action" />
          <Box>
            <Typography variant="body2">
              {review.service_point?.name || t('tables.columns.unknownServicePoint', { id: review.service_point_id })}
            </Typography>
            {review.booking && (
              <Typography variant="caption" color="text.secondary">
                {t('tables.columns.booking')} #{review.booking.id}
              </Typography>
            )}
          </Box>
        </Box>
      )
    },
    {
      id: 'comment',
      label: t('tables.columns.comment'),
      minWidth: 300,
      maxWidth: 400,
      wrap: true,
      format: (value: any, review: ReviewWithClient) => (
        <Box>
          <Typography
            variant="body2"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              marginBottom: review.response ? 1 : 0,
            }}
          >
            {review.text || review.comment}
          </Typography>
          {review.response && (
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <ReplyIcon color="action" sx={{ fontSize: '1rem', mt: 0.2 }} />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
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
      label: t('tables.columns.rating'),
      minWidth: 120,
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
      label: t('tables.columns.status'),
      minWidth: 140,
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
      label: t('tables.columns.date'),
      minWidth: 120,
      hideOnMobile: true,
      format: (value: any, review: ReviewWithClient) => (
        <Typography variant="body2">
          {formatDate(review.created_at)}
        </Typography>
      )
         },
     {
       id: 'actions',
       label: t('tables.columns.actions'),
       minWidth: 140,
       align: 'center',
       format: (value: any, review: ReviewWithClient) => (
         <ActionsMenu
           actions={reviewActions}
           item={review}
           menuThreshold={0}
         />
       )
     }
  ];

  // Статистика для отображения в заголовке
  const getStatistics = () => {
    if (reviews.length === 0) return null;
    
    const published = reviews.filter(r => r.status === 'published').length;
    const pending = reviews.filter(r => r.status === 'pending').length;
    const rejected = reviews.filter(r => r.status === 'rejected').length;
    
    return (
      <Box sx={{ 
        mb: 2, 
        display: 'flex', 
        gap: 3, 
        flexWrap: 'wrap', 
        alignItems: 'center' 
      }}>
        <Typography variant="body2" color="success.main">
          {t('admin.reviews.published')}: <strong>{published}</strong>
        </Typography>
        <Typography variant="body2" color="warning.main">
          {t('admin.reviews.pending')}: <strong>{pending}</strong>
        </Typography>
        <Typography variant="body2" color="error.main">
          {t('admin.reviews.rejected')}: <strong>{rejected}</strong>
        </Typography>
      </Box>
    );
  };

  return (
    <>
      {/* Основная таблица */}
      <PageTable<ReviewWithClient>
        header={headerConfig}
        search={searchConfig}
        filters={filtersConfig}
        columns={columns}
        rows={reviews}
        loading={isLoading}
        pagination={{
          page,
          rowsPerPage,
          totalItems,
          onPageChange: setPage
        }}
        customContent={getStatistics()}
      />

      {/* Компонент уведомлений */}
      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={handleCloseNotification}
      />
    </>
  );
};

export default ReviewsPage; 