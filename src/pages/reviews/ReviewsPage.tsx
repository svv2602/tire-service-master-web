// filepath: /home/snisar/mobi_tz/tire-service-master-web/src/pages/reviews/ReviewsPage.tsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  InputAdornment,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Avatar,
  Rating,
  FormControl,
  InputLabel,
  MenuItem,
  useTheme, // Добавлен импорт темы
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Reply as ReplyIcon,
  Star as StarIcon,
  Business as BusinessIcon,
  DirectionsCar as CarIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { 
  useGetReviewsQuery, 
  useDeleteReviewMutation,
  useUpdateReviewMutation,
  useGetServicePointsQuery,
} from '../../api';
import { Review as ModelReview, ReviewStatus, ReviewFormData, ReviewFilter } from '../../types/review';
import { ServicePoint, Review as DBReview } from '../../types/models';
import { SelectChangeEvent } from '@mui/material/Select';
// Импорты централизованной системы стилей
import { SIZES } from '../../styles/theme';
import { 
  getCardStyles, 
  getButtonStyles, 
  getTextFieldStyles, 
  getTableStyles, 
  getChipStyles 
} from '../../styles/components';

// Импорты UI компонентов
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/TextField';
import { Alert } from '../../components/ui/Alert';
import { Chip } from '../../components/ui/Chip';
import { Select } from '../../components/ui/Select';
import { Pagination } from '../../components/ui/Pagination';
import { Modal } from '../../components/ui/Modal';

// Расширяем интерфейс для отображения, не наследуя от ModelReview
interface ReviewWithClient {
  id: number;
  user_id: number;
  service_point_id: number;
  booking_id: number;
  rating: number;
  comment: string;
  status: ReviewStatus;
  response?: string;
  created_at: string;
  updated_at: string;
  client?: {
    first_name: string;
    last_name: string;
  };
  text?: string;
  user?: {
    first_name: string;
    last_name: string;
  };
  service_point?: {
    id: number;
    name: string;
  };
  booking?: {
    id: number;
    scheduled_at: string;
    client?: {
      car?: {
        carBrand?: { name: string };
        carModel?: { name: string };
      }
    };
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
  
  // Получение темы и централизованных стилей
  const theme = useTheme();
  const cardStyles = getCardStyles(theme);
  const buttonStyles = getButtonStyles(theme, 'primary');
  const textFieldStyles = getTextFieldStyles(theme);
  const tableStyles = getTableStyles(theme);
  const chipStyles = getChipStyles(theme);
  
  // Состояние для поиска, фильтрации и пагинации
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | ''>('');
  const [servicePointId, setServicePointId] = useState<string>('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  
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

  const isLoading = reviewsLoading || deleteLoading;
  const error = reviewsError;
  const reviews = (Array.isArray(reviewsData?.data) 
    ? reviewsData?.data.map((review: any) => ({
        ...review,
        user_id: review.client_id || 0,
        booking_id: review.booking?.id || 0,
        status: review.status || 'pending',
        user: review.user || { first_name: '', last_name: '' }
      }))
    : []) as ReviewWithClient[];
  const totalItems = reviews.length;
  const servicePoints = (servicePointsData as unknown as ServicePoint[]) || [];

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

  const handleDeleteConfirm = async () => {
    if (selectedReview) {
      try {
        await deleteReview(selectedReview.id.toString()).unwrap();
        setDeleteDialogOpen(false);
        setSelectedReview(null);
      } catch (error) {
        console.error('Ошибка при удалении отзыва:', error);
      }
    }
  };

  const handleStatusChange = async (review: ReviewWithClient, status: ReviewStatus) => {
    try {
      await updateReview({
        id: review.id.toString(),
        data: { status } as Partial<ReviewFormData>
      }).unwrap();
    } catch (error) {
      console.error('Ошибка при изменении статуса:', error);
    }
  };

  const handleCloseDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedReview(null);
  };

  // Вспомогательные функции
  const getClientInitials = (review: ReviewWithClient) => {
    const firstName = review.client?.first_name || review.user?.first_name || '';
    const lastName = review.client?.last_name || review.user?.last_name || '';
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
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: SIZES.spacing.lg }}>
        <Alert severity="error">
          Ошибка при загрузке отзывов: {error.toString()}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: SIZES.spacing.lg }}>
      {/* Заголовок */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: SIZES.spacing.md 
      }}>
        <Typography
          sx={{ 
            fontSize: SIZES.fontSize.xl, 
            fontWeight: 600,
            color: theme.palette.text.primary
          }}
        >
          Отзывы
        </Typography>
      </Box>

      {/* Фильтры и поиск */}
      <Box sx={{ 
        p: SIZES.spacing.md, 
        mb: SIZES.spacing.md
      }}>
        <Box sx={{ display: 'flex', gap: SIZES.spacing.md, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            placeholder="Поиск по тексту отзыва"
            variant="outlined"
            size="small"
            value={search}
            onChange={handleSearchChange}
            sx={{ minWidth: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              label="Статус"
              displayEmpty
            >
              <MenuItem value="">Все статусы</MenuItem>
              {Object.entries(REVIEW_STATUSES).map(([value, { label }]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 200 }}>
            <Select
              value={servicePointId}
              onChange={handleServicePointChange}
              label="Сервисная точка"
              displayEmpty
            >
              <MenuItem value="">Все точки</MenuItem>
              {servicePoints.map((point) => (
                <MenuItem key={point.id} value={point.id.toString()}>
                  {point.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Таблица отзывов */}
      <TableContainer sx={{
        backgroundColor: 'transparent',
        boxShadow: 'none',
        border: 'none'
      }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Клиент</TableCell>
              <TableCell>Сервисная точка</TableCell>
              <TableCell>Отзыв</TableCell>
              <TableCell>Оценка</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Дата</TableCell>
              <TableCell align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reviews.map((review: ReviewWithClient) => (
              <TableRow key={review.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: SIZES.spacing.xs }}>
                    <Avatar sx={{ 
                      bgcolor: theme.palette.primary.main,
                      width: 36,
                      height: 36,
                      fontSize: SIZES.fontSize.md
                    }}>
                      {getClientInitials(review)}
                    </Avatar>
                    <Box>
                      <Typography sx={{ fontSize: SIZES.fontSize.md, fontWeight: 500 }}>
                        {review.client?.first_name || review.user?.first_name} {review.client?.last_name || review.user?.last_name}
                      </Typography>
                      <Typography 
                        sx={{ 
                          fontSize: SIZES.fontSize.sm, 
                          color: theme.palette.text.secondary 
                        }}
                      >
                        {review.booking?.client?.car?.carBrand?.name} {review.booking?.client?.car?.carModel?.name}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>

                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: SIZES.spacing.xs }}>
                    <BusinessIcon color="action" />
                    <Typography sx={{ fontSize: SIZES.fontSize.md }}>
                      {review.service_point?.name}
                    </Typography>
                  </Box>
                </TableCell>

                <TableCell>
                  <Typography
                    sx={{
                      fontSize: SIZES.fontSize.md,
                      maxWidth: 300,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {review.text || review.comment}
                  </Typography>
                  {review.response && (
                    <Box sx={{ mt: SIZES.spacing.xs, display: 'flex', alignItems: 'flex-start', gap: SIZES.spacing.xs }}>
                      <ReplyIcon color="action" sx={{ fontSize: '1rem' }} />
                      <Typography
                        sx={{
                          fontSize: SIZES.fontSize.sm,
                          color: theme.palette.text.secondary,
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
                </TableCell>

                <TableCell>
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
                </TableCell>

                <TableCell>
                  <Chip
                    label={REVIEW_STATUSES[review.status as ReviewStatus].label}
                    color={REVIEW_STATUSES[review.status as ReviewStatus].color}
                    size="small"
                  />
                </TableCell>

                <TableCell>
                  <Typography sx={{ fontSize: SIZES.fontSize.md }}>
                    {formatDate(review.created_at)}
                  </Typography>
                </TableCell>

                <TableCell align="right">
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: SIZES.spacing.xs }}>
                    {review.status === 'pending' && (
                      <>
                        <Tooltip title="Одобрить">
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
                        <Tooltip title="Отклонить">
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
                      </>
                    )}
                    <Tooltip title="Ответить">
                      <IconButton 
                        onClick={() => navigate(`/reviews/${review.id}/reply`)}
                        size="small"
                        sx={{
                          '&:hover': {
                            backgroundColor: `${theme.palette.primary.main}15`
                          }
                        }}
                      >
                        <ReplyIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Удалить">
                      <IconButton
                        onClick={() => handleDeleteClick(review)}
                        size="small"
                        sx={{
                          '&:hover': {
                            backgroundColor: `${theme.palette.error.main}15`
                          }
                        }}
                      >
                        <DeleteIcon color="error" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          p: 2 
        }}>
          <Pagination
            count={Math.ceil(totalItems / rowsPerPage)}
            page={page + 1}
            onChange={handleChangePage}
            color="primary"
            disabled={totalItems <= rowsPerPage}
          />
        </Box>
      </TableContainer>

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
          {selectedReview?.client?.first_name || selectedReview?.user?.first_name} {selectedReview?.client?.last_name || selectedReview?.user?.last_name}?
          Это действие нельзя будет отменить.
        </Typography>
      </Modal>
    </Box>
  );
};

export default ReviewsPage;
