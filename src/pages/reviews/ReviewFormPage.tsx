import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Rating,
  TextField,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  useTheme,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useGetBookingsByClientQuery,
  useCreateReviewMutation,
  useGetReviewByIdQuery,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
  useGetUsersQuery,
  useGetServicePointsQuery,
} from '../../api';
import { Booking } from '../../types/models';
import { User } from '../../types/user';
import { ServicePoint } from '../../types/models';
import { getCardStyles, getButtonStyles, getTextFieldStyles } from '../../styles/components';
import { SIZES } from '../../styles/theme';
import { ReviewStatus } from '../../types/review';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

/**
 * Компонент формы создания отзыва о сервисной точке
 * Позволяет клиентам оставлять отзывы на основе завершенных бронирований
 * 
 * Функциональность:
 * - Выбор бронирования из списка завершенных
 * - Выставление рейтинга от 1 до 5 звезд
 * - Написание текстового отзыва
 * - Валидация всех полей формы
 * 
 * Использует централизованную систему стилей для консистентного UI
 */

const ReviewFormPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [createReview, { isLoading: isSubmitting }] = useCreateReviewMutation();
  // Централизованные стили
  const cardStyles = getCardStyles(theme);
  const primaryButtonStyles = getButtonStyles(theme, 'primary');
  const secondaryButtonStyles = getButtonStyles(theme, 'secondary');
  const textFieldStyles = getTextFieldStyles(theme);
  // Получаем id из URL
  const { id } = useParams<{ id?: string }>();
  const isEditMode = !!id;

  // Состояния формы
  const [selectedClientId, setSelectedClientId] = React.useState<string>('');
  const [selectedBookingId, setSelectedBookingId] = React.useState<string>('');
  const [selectedServicePointId, setSelectedServicePointId] = React.useState<string>('');
  const [rating, setRating] = React.useState<number>(0);
  const [comment, setComment] = React.useState('');
  const [status, setStatus] = React.useState<ReviewStatus>('published');
  const [formError, setFormError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  // RTK Query хуки
  const { data: usersData, isLoading: usersLoading } = useGetUsersQuery({ role: 'client', per_page: 100 });
  const { data: clientBookingsData, isLoading: adminBookingsLoading } = useGetBookingsByClientQuery(
    selectedClientId, 
    { skip: !selectedClientId || selectedClientId === '' }
  );
  const { data: servicePointsData } = useGetServicePointsQuery({});
  // Для редактирования/удаления
  const { data: reviewData, isLoading: reviewLoading } = useGetReviewByIdQuery(id!, { skip: !isEditMode });
  const [updateReview, { isLoading: isUpdating }] = useUpdateReviewMutation();
  const [deleteReview, { isLoading: isDeleting }] = useDeleteReviewMutation();

  // Получаем роль пользователя
  const userRole = useSelector((state: RootState) => state.auth.user?.role);
  const isAdmin = userRole === 'admin';
  const userId = useSelector((state: RootState) => state.auth.user?.id);

  // При редактировании — заполняем поля из reviewData
  React.useEffect(() => {
    if (isEditMode && reviewData) {
      setSelectedClientId(String(reviewData.client_id));
      setSelectedBookingId(reviewData.booking?.id ? String(reviewData.booking.id) : '');
      setSelectedServicePointId(String(reviewData.service_point_id));
      setRating(reviewData.rating);
      setComment(reviewData.comment);
      setStatus(reviewData.status || 'published');
    }
  }, [isEditMode, reviewData]);

  const handleBack = () => {
    navigate('/my-reviews');
  };

  // Универсальный submit для админа
  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      let service_point_id = selectedServicePointId;
      if (selectedBookingId && clientBookingsData?.data) {
        const booking = clientBookingsData.data.find(b => String(b.id) === selectedBookingId);
        if (booking) {
          service_point_id = String(booking.service_point_id);
        }
      }
      if (!selectedClientId || !service_point_id || !rating || !comment) {
        setFormError('Заполните все обязательные поля');
        return;
      }
      if (isEditMode && id) {
        await updateReview({
          id,
          data: {
            service_point_id,
            rating,
            comment,
            ...(selectedBookingId ? { booking_id: Number(selectedBookingId) } : {}),
            client_id: Number(selectedClientId),
            status,
          } as any,
        }).unwrap();
        setSuccess(true);
      } else {
        if (selectedBookingId) {
          // Старый путь — с бронированием
          await createReview({
            client_id: Number(selectedClientId),
            data: {
              booking_id: Number(selectedBookingId),
              rating,
              comment,
            }
          }).unwrap();
        } else {
          // Новый путь — без бронирования (POST /reviews)
          await createReview({
            data: {
              review: {
                client_id: Number(selectedClientId),
                service_point_id: Number(service_point_id),
                rating,
                comment,
              }
            }
          }).unwrap();
        }
        setSuccess(true);
        setSelectedClientId('');
        setSelectedBookingId('');
        setSelectedServicePointId('');
        setRating(0);
        setComment('');
        setStatus('published');
      }
    } catch (error: any) {
      setFormError(error?.data?.message || 'Ошибка при сохранении отзыва');
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteReview(id).unwrap();
      setDeleteDialogOpen(false);
      navigate('/admin/reviews');
    } catch (error: any) {
      setFormError(error?.data?.message || 'Ошибка при удалении отзыва');
    }
  };

  if (isAdmin) {
    if (usersLoading || adminBookingsLoading || (isEditMode && reviewLoading)) {
      return <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px"><CircularProgress /></Box>;
    }

    return (
      <Box sx={{ padding: SIZES.spacing.xl }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          {isEditMode ? 'Редактирование отзыва (режим администратора)' : 'Создание/редактирование отзыва (режим администратора)'}
        </Typography>
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>{isEditMode ? 'Отзыв успешно обновлён!' : 'Отзыв успешно создан!'}</Alert>
        )}
        {formError && (
          <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>
        )}
        <Paper sx={{ ...cardStyles, maxWidth: 600 }}>
          <form onSubmit={handleAdminSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: SIZES.spacing.xl }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Клиент</InputLabel>
                <Select
                  value={selectedClientId}
                  label="Клиент"
                  onChange={e => {
                    setSelectedClientId(e.target.value);
                    setSelectedBookingId('');
                  }}
                  disabled={isEditMode}
                >
                  <MenuItem value="">Выберите клиента</MenuItem>
                  {usersData?.data.map((user: User) => (
                    <MenuItem key={user.id} value={user.id}>{user.last_name} {user.first_name} ({user.email})</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Бронирование</InputLabel>
                <Select
                  value={selectedBookingId}
                  label="Бронирование"
                  onChange={e => setSelectedBookingId(e.target.value)}
                  disabled={!selectedClientId || !clientBookingsData?.data?.length || isEditMode}
                >
                  <MenuItem value="">Без бронирования</MenuItem>
                  {clientBookingsData?.data?.map(booking => (
                    <MenuItem key={booking.id} value={booking.id}>
                      {booking.service_point?.name} - {new Date(booking.booking_date).toLocaleDateString()}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Сервисная точка</InputLabel>
                <Select
                  value={selectedServicePointId}
                  label="Сервисная точка"
                  onChange={e => setSelectedServicePointId(e.target.value)}
                  disabled={!!selectedBookingId || isEditMode}
                >
                  <MenuItem value="">Выберите точку</MenuItem>
                  {servicePointsData?.data?.map((point: ServicePoint) => (
                    <MenuItem key={point.id} value={point.id}>{point.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Box>
                <Typography component="legend" sx={{ fontSize: SIZES.fontSize.md, fontWeight: 500, marginBottom: SIZES.spacing.sm }}>
                  Оценка
                </Typography>
                <Rating
                  name="rating"
                  value={rating}
                  onChange={(_e, newValue) => setRating(newValue || 0)}
                  size="large"
                  sx={{ '& .MuiRating-iconFilled': { color: theme.palette.primary.main }, '& .MuiRating-iconHover': { color: theme.palette.primary.light } }}
                />
              </Box>
              <TextField
                fullWidth
                multiline
                rows={4}
                name="comment"
                label="Текст отзыва"
                value={comment}
                onChange={e => setComment(e.target.value)}
                sx={textFieldStyles}
              />
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Статус</InputLabel>
                <Select
                  value={status}
                  label="Статус"
                  onChange={e => setStatus(e.target.value as ReviewStatus)}
                >
                  <MenuItem value="published">Опубликован</MenuItem>
                  <MenuItem value="pending">На модерации</MenuItem>
                  <MenuItem value="rejected">Отклонён</MenuItem>
                </Select>
              </FormControl>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: SIZES.spacing.md, marginTop: SIZES.spacing.lg }}>
                <Button onClick={() => navigate('/admin/reviews')} sx={secondaryButtonStyles}>Отмена</Button>
                <Box>
                  {isEditMode && (
                    <Button color="error" sx={{ mr: 2 }} onClick={() => setDeleteDialogOpen(true)} disabled={isDeleting}>
                      {isDeleting ? 'Удаление...' : 'Удалить'}
                    </Button>
                  )}
                  <Button type="submit" variant="contained" disabled={isSubmitting || isUpdating} startIcon={<StarIcon />} sx={primaryButtonStyles}>
                    {isEditMode ? (isUpdating ? 'Сохранение...' : 'Сохранить изменения') : (isSubmitting ? 'Сохранение...' : 'Сохранить отзыв')}
                  </Button>
                </Box>
              </Box>
            </Box>
          </form>
        </Paper>
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Подтверждение удаления</DialogTitle>
          <DialogContent>
            <Typography>Вы действительно хотите удалить этот отзыв?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Отмена</Button>
            <Button onClick={handleDelete} color="error" disabled={isDeleting}>Удалить</Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }

  // Если форма пользователя не использует formik, удаляем инициализацию formik
  if (!isAdmin && adminBookingsLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }
  const bookings = clientBookingsData?.data || [];
  if (!isAdmin && bookings.length === 0) {
    return (
      <Box sx={{ padding: SIZES.spacing.xl }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: SIZES.spacing.sm, 
          marginBottom: SIZES.spacing.xl 
        }}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={handleBack}
            sx={secondaryButtonStyles}
          >
            Назад
          </Button>
          <Typography 
            variant="h4"
            sx={{
              fontSize: SIZES.fontSize.xl,
              fontWeight: 600,
            }}
          >
            Новый отзыв
          </Typography>
        </Box>
        <Alert severity="info">
          У вас пока нет завершенных бронирований. После завершения обслуживания вы сможете оставить отзыв.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: SIZES.spacing.xl }}>
      {/* Заголовок */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: SIZES.spacing.sm, 
        marginBottom: SIZES.spacing.xl 
      }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={handleBack}
          sx={secondaryButtonStyles}
        >
          Назад
        </Button>
        <Typography 
          variant="h4"
          sx={{
            fontSize: SIZES.fontSize.xl,
            fontWeight: 600,
          }}
        >
          Новый отзыв
        </Typography>
      </Box>

      {/* Форма для пользователя */}
      <Paper sx={{ ...cardStyles, maxWidth: 600 }}>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setFormError(null);
            setSuccess(false);
            if (!selectedBookingId || !rating || !comment) {
              setFormError('Заполните все обязательные поля');
              return;
            }
            try {
              await createReview({
                client_id: userId!,
                data: {
                  booking_id: Number(selectedBookingId),
                  rating,
                  comment,
                } as any
              }).unwrap();
              setSuccess(true);
              setSelectedBookingId('');
              setRating(0);
              setComment('');
            } catch (error: any) {
              setFormError(error?.data?.message || 'Ошибка при сохранении отзыва');
            }
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: SIZES.spacing.xl 
          }}>
            {success && (
              <Alert severity="success">Отзыв успешно создан!</Alert>
            )}
            {formError && (
              <Alert severity="error">{formError}</Alert>
            )}
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Выберите бронирование</InputLabel>
              <Select
                name="booking_id"
                value={selectedBookingId}
                onChange={e => setSelectedBookingId(e.target.value)}
                label="Выберите бронирование"
                sx={{
                  ...textFieldStyles,
                  '& .MuiSelect-select': {
                    borderRadius: SIZES.borderRadius.sm,
                  }
                }}
              >
                {bookings.map((booking: Booking) => (
                  <MenuItem key={booking.id} value={booking.id}>
                    {booking.service_point?.name} - {new Date(booking.booking_date).toLocaleDateString()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box>
              <Typography 
                component="legend"
                sx={{
                  fontSize: SIZES.fontSize.md,
                  fontWeight: 500,
                  marginBottom: SIZES.spacing.sm,
                }}
              >
                Ваша оценка
              </Typography>
              <Rating
                name="rating"
                value={rating}
                onChange={(_event, newValue) => setRating(newValue || 0)}
                size="large"
                sx={{
                  '& .MuiRating-iconFilled': {
                    color: theme.palette.primary.main,
                  },
                  '& .MuiRating-iconHover': {
                    color: theme.palette.primary.light,
                  },
                }}
              />
            </Box>

            <TextField
              fullWidth
              multiline
              rows={4}
              name="comment"
              label="Текст отзыва"
              value={comment}
              onChange={e => setComment(e.target.value)}
              sx={textFieldStyles}
            />

            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              gap: SIZES.spacing.md, 
              marginTop: SIZES.spacing.lg 
            }}>
              <Button 
                onClick={handleBack}
                sx={secondaryButtonStyles}
              >
                Отмена
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting}
                startIcon={<StarIcon />}
                sx={primaryButtonStyles}
              >
                {isSubmitting ? 'Сохранение...' : 'Опубликовать отзыв'}
              </Button>
            </Box>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default ReviewFormPage;