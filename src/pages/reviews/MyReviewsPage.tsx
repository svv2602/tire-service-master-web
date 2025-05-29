import React, { useState } from 'react';
import {
  Box,
  Typography,
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
  Rating,
  Alert,
  TablePagination,
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
  DirectionsCar as CarIcon,
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
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
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
  const error = reviewsError;
  const reviews = reviewsData?.data || [];
  const totalItems = reviewsData?.pagination?.total_count || 0;

  // Обработчики событий
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

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
        <Typography variant="h4">Мои отзывы</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/reviews/new')}
        >
          Написать отзыв
        </Button>
      </Box>

      {/* Таблица отзывов */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Сервисная точка</TableCell>
              <TableCell>Отзыв</TableCell>
              <TableCell>Оценка</TableCell>
              <TableCell>Дата</TableCell>
              <TableCell align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reviews.map((review: Review) => (
              <TableRow key={review.id}>
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
                    {review.comment}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Rating value={review.rating} readOnly size="small" />
                </TableCell>

                <TableCell>
                  {formatDate(review.created_at)}
                </TableCell>

                <TableCell align="right">
                  <Tooltip title="Редактировать">
                    <IconButton onClick={() => handleEditClick(review)} size="small">
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Удалить">
                    <IconButton onClick={() => handleDeleteClick(review)} color="error" size="small">
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
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
          rowsPerPageOptions={[10, 25, 50]}
        />
      </TableContainer>

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