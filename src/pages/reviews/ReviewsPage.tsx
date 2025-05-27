import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Paper,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TablePagination,
  Avatar,
  Rating,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
import { Review, ReviewStatus, ReviewFormData, ReviewFilter } from '../../types/review';
import { ServicePoint } from '../../types/models';
import { SelectChangeEvent } from '@mui/material/Select';

// Расширяем интерфейс Review для отображения
interface ReviewWithClient extends Review {
  client?: {
    first_name: string;
    last_name: string;
  };
  text?: string; // Альтернативное поле для comment
  booking?: {
    id: number;
    scheduled_at: string;
    clientCar?: {
      carBrand?: { name: string };
      carModel?: { name: string };
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
  const reviews = (reviewsData as unknown as ReviewWithClient[]) || [];
  const totalItems = reviews.length;
  const servicePoints = (servicePointsData as unknown as ServicePoint[]) || [];

  // Обработчики событий
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setPage(0);
  };

  const handleStatusFilterChange = (event: SelectChangeEvent<ReviewStatus | ''>) => {
    setStatusFilter(event.target.value as ReviewStatus | '');
    setPage(0);
  };

  const handleServicePointChange = (event: SelectChangeEvent<string>) => {
    setServicePointId(event.target.value);
    setPage(0);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Ошибка при загрузке отзывов: {error.toString()}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Заголовок */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Отзывы</Typography>
      </Box>

      {/* Фильтры и поиск */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
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
            <InputLabel>Статус</InputLabel>
            <Select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              label="Статус"
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
            <InputLabel>Сервисная точка</InputLabel>
            <Select
              value={servicePointId}
              onChange={handleServicePointChange}
              label="Сервисная точка"
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
      </Paper>

      {/* Таблица отзывов */}
      <TableContainer component={Paper}>
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
            {reviews.map((review) => (
              <TableRow key={review.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {getClientInitials(review)}
                    </Avatar>
                    <Box>
                      <Typography>
                        {review.client?.first_name || review.user?.first_name} {review.client?.last_name || review.user?.last_name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {review.booking?.clientCar?.carBrand?.name} {review.booking?.clientCar?.carModel?.name}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>

                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BusinessIcon color="action" />
                    <Typography>{review.service_point?.name}</Typography>
                  </Box>
                </TableCell>

                <TableCell>
                  <Typography
                    sx={{
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
                    <Box sx={{ mt: 1, display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      <ReplyIcon color="action" sx={{ fontSize: '1rem' }} />
                      <Typography
                        variant="body2"
                        color="textSecondary"
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
                </TableCell>

                <TableCell>
                  <Rating value={review.rating} readOnly size="small" />
                </TableCell>

                <TableCell>
                  <Chip
                    icon={REVIEW_STATUSES[review.status as ReviewStatus].icon as React.ReactElement}
                    label={REVIEW_STATUSES[review.status as ReviewStatus].label}
                    color={REVIEW_STATUSES[review.status as ReviewStatus].color}
                    size="small"
                  />
                </TableCell>

                <TableCell>
                  <Typography variant="body2">
                    {formatDate(review.created_at)}
                  </Typography>
                </TableCell>

                <TableCell align="right">
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    {review.status === 'pending' && (
                      <>
                        <Tooltip title="Одобрить">
                          <IconButton
                            onClick={() => handleStatusChange(review, 'published')}
                            size="small"
                            color="success"
                          >
                            <CheckIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Отклонить">
                          <IconButton
                            onClick={() => handleStatusChange(review, 'rejected')}
                            size="small"
                            color="error"
                          >
                            <CloseIcon />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                    <Tooltip title="Ответить">
                      <IconButton 
                        onClick={() => navigate(`/reviews/${review.id}/reply`)}
                        size="small"
                      >
                        <ReplyIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Удалить">
                      <IconButton
                        onClick={() => handleDeleteClick(review)}
                        size="small"
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={totalItems}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[10, 25, 50, 100]}
        />
      </TableContainer>

      {/* Диалог подтверждения удаления */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <Typography>
            Вы действительно хотите удалить отзыв клиента{' '}
            {selectedReview?.client?.first_name || selectedReview?.user?.first_name} {selectedReview?.client?.last_name || selectedReview?.user?.last_name}?
            Это действие нельзя будет отменить.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReviewsPage; 