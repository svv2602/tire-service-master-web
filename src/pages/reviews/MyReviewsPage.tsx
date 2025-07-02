import React, { useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  IconButton,
  Tooltip,
  Rating,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { Table, Column } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  useGetReviewsByClientQuery, 
  useDeleteReviewMutation,
  useUpdateReviewMutation,
} from '../../api';
import { Review } from '../../types/models';
import { RootState } from '../../store';

const MyReviewsPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Получаем userId из Redux store
  const userId = useSelector((state: RootState) => state.auth.user?.id);
  
  // Состояние для пагинации
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);
  
  // Состояние для диалогов
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [editedComment, setEditedComment] = useState('');
  const [editedRating, setEditedRating] = useState<number>(0);

  // RTK Query хуки
  const { 
    data: reviewsData, 
    isLoading: reviewsLoading, 
    error: reviewsError 
  } = useGetReviewsByClientQuery(userId?.toString() || '', { skip: !userId });

  const [deleteReview, { isLoading: deleteLoading }] = useDeleteReviewMutation();
  const [updateReview, { isLoading: updateLoading }] = useUpdateReviewMutation();

  const isLoading = reviewsLoading || deleteLoading || updateLoading;
  const reviews = reviewsData || [];
  const totalItems = reviews.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);

  // Обработчики событий
  const handleDeleteClick = (review: Review) => {
    setSelectedReview(review);
    setDeleteDialogOpen(true);
  };

  const handleEditClick = (review: Review) => {
    setSelectedReview(review);
    setEditedComment(review.comment);
    setEditedRating(review.rating);
    setEditDialogOpen(true);
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

  const handleEditConfirm = async () => {
    if (selectedReview) {
      try {
        await updateReview({
          id: selectedReview.id.toString(),
          data: {
            comment: editedComment,
            rating: editedRating,
          }
        }).unwrap();
        setEditDialogOpen(false);
        setSelectedReview(null);
      } catch (error) {
        console.error('Ошибка при обновлении отзыва:', error);
      }
    }
  };

  const handleCloseDialogs = () => {
    setDeleteDialogOpen(false);
    setEditDialogOpen(false);
    setSelectedReview(null);
    setEditedComment('');
    setEditedRating(0);
  };

  // Вспомогательные функции
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Конфигурация колонок для UI Table
  const columns: Column[] = [
    {
      id: 'service_point',
      label: 'Сервисная точка',
      minWidth: 200,
      wrap: true,
      format: (value: any, row: Review) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BusinessIcon color="action" />
          <Typography>{row.service_point?.name}</Typography>
        </Box>
      )
    },
    {
      id: 'comment',
      label: 'Отзыв',
      minWidth: 300,
      wrap: true,
      format: (value: string) => (
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
          {value}
        </Typography>
      )
    },
    {
      id: 'rating',
      label: 'Оценка',
      align: 'center',
      format: (value: number) => (
        <Rating value={value} readOnly size="small" />
      )
    },
    {
      id: 'created_at',
      label: 'Дата',
      format: (value: string) => formatDate(value)
    },
    {
      id: 'actions',
      label: 'Действия',
      align: 'right',
      minWidth: 120,
      format: (value: any, row: Review) => (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Tooltip title="Редактировать">
            <IconButton 
              onClick={() => handleEditClick(row)}
              size="small"
              color="primary"
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Удалить">
            <IconButton 
              onClick={() => handleDeleteClick(row)}
              size="small"
              color="error"
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

  // Отображение состояний загрузки и ошибок
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (reviewsError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Ошибка при загрузке отзывов: {reviewsError.toString()}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Заголовок */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Мои отзывы</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/admin/reviews/new')}
        >
          Написать отзыв
        </Button>
      </Box>

      {/* Таблица отзывов */}
      <Box sx={{ mb: 3 }}>
        <Table
          columns={columns}
          rows={reviews}
        />
        {reviews.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              У вас пока нет отзывов
            </Typography>
          </Box>
        )}
      </Box>

      {/* Пагинация */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(newPage: number) => setPage(newPage)}
            color="primary"
          />
        </Box>
      )}

      {/* Диалог удаления */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDialogs}>
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <Typography>
            Вы действительно хотите удалить этот отзыв?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Отмена</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Удалить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог редактирования */}
      <Dialog open={editDialogOpen} onClose={handleCloseDialogs} maxWidth="sm" fullWidth>
        <DialogTitle>Редактирование отзыва</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Rating
              value={editedRating}
              onChange={(event, newValue) => setEditedRating(newValue || 0)}
              size="large"
            />
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Текст отзыва"
              value={editedComment}
              onChange={(e) => setEditedComment(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Отмена</Button>
          <Button onClick={handleEditConfirm} variant="contained">
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyReviewsPage;
