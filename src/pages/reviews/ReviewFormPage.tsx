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
import { useTranslation } from 'react-i18next';
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
import { useGetClientsQuery } from '../../api/clients.api';
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
  const { t } = useTranslation();
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
  const { data: clientsData, isLoading: clientsLoading } = useGetClientsQuery({ per_page: 100 });
  const { data: clientBookingsData, isLoading: adminBookingsLoading } = useGetBookingsByClientQuery(
    selectedClientId, 
    { skip: !selectedClientId || selectedClientId === '' }
  );
  const { data: servicePointsData } = useGetServicePointsQuery({});
  // Для редактирования/удаления
  const { data: reviewData, isLoading: reviewLoading, error: reviewError } = useGetReviewByIdQuery(id!, { skip: !isEditMode });
  
  // Отладочная информация
  React.useEffect(() => {
    if (isEditMode) {
      console.log('🔍 Режим редактирования, ID:', id);
      console.log('📊 Данные отзыва:', reviewData);
      console.log('⏳ Загрузка:', reviewLoading);
      console.log('❌ Ошибка:', reviewError);
    }
  }, [isEditMode, id, reviewData, reviewLoading, reviewError]);
  const [updateReview, { isLoading: isUpdating }] = useUpdateReviewMutation();
  const [deleteReview, { isLoading: isDeleting }] = useDeleteReviewMutation();

  // Получаем роль пользователя
  const userRole = useSelector((state: RootState) => state.auth.user?.role);
  const isAdmin = userRole === 'admin';
  const userId = useSelector((state: RootState) => state.auth.user?.id);

  // При редактировании — заполняем поля из reviewData
  React.useEffect(() => {
    if (isEditMode && reviewData) {
      console.log('📝 Загружаем данные отзыва для редактирования:', reviewData);
      setSelectedClientId(String(reviewData.client?.id || ''));
      setSelectedBookingId(reviewData.booking?.id ? String(reviewData.booking.id) : '');
      setSelectedServicePointId(String(reviewData.service_point?.id || ''));
      setRating(reviewData.rating || 0);
      setComment(reviewData.comment || '');
      setStatus(reviewData.status || 'published');
    }
  }, [isEditMode, reviewData]);

  const handleBack = () => {
    navigate('/my-reviews');
  };

  // Функция для проверки валидности формы
  const isFormValid = () => {
    if (!selectedClientId) return false;
    if (!selectedBookingId && !selectedServicePointId) return false;
    if (!rating || rating === 0) return false;
    if (!comment || comment.trim() === '') return false;
    return true;
  };

  // Функция для получения списка незаполненных обязательных полей
  const getRequiredFieldErrors = () => {
    const errors: string[] = [];
    
    if (!selectedClientId) {
      errors.push(t('forms.review.requiredFields.client'));
    }
    
    if (!selectedBookingId && !selectedServicePointId) {
      errors.push(t('forms.review.requiredFields.bookingOrServicePoint'));
    }
    
    if (!rating || rating === 0) {
      errors.push(t('forms.review.requiredFields.rating'));
    }
    
    if (!comment || comment.trim() === '') {
      errors.push(t('forms.review.requiredFields.reviewText'));
    }
    
    return errors;
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
      if (!isFormValid()) {
        setFormError(t('forms.review.validation.fillAllFields'));
        return;
      }
      if (isEditMode && id) {
        await updateReview({
          id,
          data: {
            service_point_id: service_point_id,
            rating,
            comment,
            ...(selectedBookingId ? { booking_id: selectedBookingId } : {}),
            client_id: selectedClientId,
            status,
          } as any,
        }).unwrap();
        setSuccess(true);
        // Перенаправление на страницу списка отзывов после успешного редактирования
        setTimeout(() => navigate('/admin/reviews'), 1500);
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
              client_id: selectedClientId,
              service_point_id: service_point_id,
              rating,
              comment,
              status,
            }
          }).unwrap();
        }
        setSuccess(true);
        // Перенаправление на страницу списка отзывов после успешного создания
        setTimeout(() => navigate('/admin/reviews'), 1500);
        setSelectedClientId('');
        setSelectedBookingId('');
        setSelectedServicePointId('');
        setRating(0);
        setComment('');
        setStatus('published');
      }
    } catch (error: any) {
      setFormError(error?.data?.message || t('forms.review.messages.saveError'));
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteReview(id).unwrap();
      setDeleteDialogOpen(false);
      navigate('/admin/reviews');
    } catch (error: any) {
      setFormError(error?.data?.message || t('forms.review.messages.deleteError'));
    }
  };

  if (isAdmin) {
    if (clientsLoading || adminBookingsLoading || (isEditMode && reviewLoading)) {
      return <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px"><CircularProgress /></Box>;
    }

    return (
      <Box sx={{ padding: SIZES.spacing.xl }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          {isEditMode ? t('forms.review.title.editAdmin') : t('forms.review.title.createAdmin')}
        </Typography>
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {isEditMode ? t('forms.review.messages.updateSuccess') : t('forms.review.messages.createSuccess')} {t('forms.review.messages.redirecting')}
          </Alert>
        )}
        {formError && (
          <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>
        )}
        <Paper sx={{ ...cardStyles, maxWidth: 600 }}>
          <form onSubmit={handleAdminSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: SIZES.spacing.xl }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>{t('forms.review.fields.client')}</InputLabel>
                <Select
                  value={selectedClientId}
                  label={t("forms.review.fields.client")}
                  onChange={e => {
                    setSelectedClientId(e.target.value);
                    setSelectedBookingId('');
                  }}
                  disabled={isEditMode}
                >
                  <MenuItem value="">{t('forms.review.placeholders.selectClient')}</MenuItem>
                  {clientsData?.data.map((client: any) => (
                    <MenuItem key={client.id} value={client.id}>
                      {client.user?.last_name || 'Фамилия'} {client.user?.first_name || 'Имя'} ({client.user?.email || 'email'})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>{t('forms.review.fields.booking')}</InputLabel>
                <Select
                  value={selectedBookingId}
                  label={t("forms.review.fields.booking")}
                  onChange={e => setSelectedBookingId(e.target.value)}
                  disabled={!selectedClientId || !clientBookingsData?.data?.length || isEditMode}
                >
                  <MenuItem value="">{t('forms.review.placeholders.withoutBooking')}</MenuItem>
                  {clientBookingsData?.data?.map(booking => (
                    <MenuItem key={booking.id} value={booking.id}>
                      {booking.service_point?.name} - {new Date(booking.booking_date).toLocaleDateString()}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>{t('forms.review.fields.servicePoint')}</InputLabel>
                <Select
                  value={selectedServicePointId}
                  label={t("forms.review.fields.servicePoint")}
                  onChange={e => setSelectedServicePointId(e.target.value)}
                  disabled={!!selectedBookingId || isEditMode}
                >
                  <MenuItem value="">{t('forms.review.placeholders.selectServicePoint')}</MenuItem>
                  {servicePointsData?.data?.map((point: ServicePoint) => (
                    <MenuItem key={point.id} value={point.id}>{point.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Box>
                <Typography component="legend" sx={{ fontSize: SIZES.fontSize.md, fontWeight: 500, marginBottom: SIZES.spacing.sm }}>
                  {t('forms.review.fields.rating')}
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
                label={t("forms.review.fields.reviewText")}
                value={comment}
                onChange={e => setComment(e.target.value)}
                sx={textFieldStyles}
              />
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>{t('forms.review.fields.status')}</InputLabel>
                <Select
                  value={status}
                  label={t("forms.review.fields.status")}
                  onChange={e => setStatus(e.target.value as ReviewStatus)}
                >
                  <MenuItem value="published">{t('forms.review.statuses.published')}</MenuItem>
                  <MenuItem value="pending">{t('forms.review.statuses.pending')}</MenuItem>
                  <MenuItem value="rejected">{t('forms.review.statuses.rejected')}</MenuItem>
                </Select>
              </FormControl>

              {/* Уведомление о незаполненных обязательных полях */}
              {(!isFormValid()) && (
                <Alert severity="warning" sx={{ mt: 3 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {t('forms.review.validation.fillAllFields')}:
                  </Typography>
                  <Box component="ul" sx={{ pl: 2, mb: 0, mt: 1 }}>
                    {getRequiredFieldErrors().map((field, index) => (
                      <Typography variant="body2" component="li" key={index}>
                        {field}
                      </Typography>
                    ))}
                  </Box>
                </Alert>
              )}

              {/* Информационное сообщение при заполненной форме */}
              {isFormValid() && !success && (
                <Alert severity="info" sx={{ mt: 3 }}>
                  {t('forms.review.validation.allFieldsFilled')}
                </Alert>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: SIZES.spacing.md, marginTop: SIZES.spacing.lg }}>
                <Button onClick={() => navigate('/admin/reviews')} sx={secondaryButtonStyles}>{t('forms.review.buttons.cancel')}</Button>
                <Box>
                  {isEditMode && (
                    <Button color="error" sx={{ mr: 2 }} onClick={() => setDeleteDialogOpen(true)} disabled={isDeleting}>
                      {isDeleting ? t('forms.review.messages.deleting') : t('forms.review.buttons.delete')}
                    </Button>
                  )}
                  <Button type="submit" variant="contained" disabled={isSubmitting || isUpdating || !isFormValid()} startIcon={<StarIcon />} sx={primaryButtonStyles}>
                    {isEditMode ? (isUpdating ? t('forms.review.messages.saving') : t('forms.review.buttons.saveChanges')) : (isSubmitting ? 'Сохранение...' : t('forms.review.buttons.save'))}
                  </Button>
                </Box>
              </Box>
            </Box>
          </form>
        </Paper>
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>{t('common.confirmDelete')}</DialogTitle>
          <DialogContent>
            <Typography>{t('forms.review.messages.deleteConfirm')}</Typography>
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
          {t('forms.review.messages.noBookings')}
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
              <Alert severity="success">{t('forms.review.messages.createSuccess')}</Alert>
            )}
            {formError && (
              <Alert severity="error">{formError}</Alert>
            )}
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>{t('forms.review.placeholders.selectBooking')}</InputLabel>
              <Select
                name="booking_id"
                value={selectedBookingId}
                onChange={e => setSelectedBookingId(e.target.value)}
                label={t("forms.review.placeholders.selectBooking")}
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
                {t('forms.review.fields.yourRating')}
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
                {isSubmitting ? 'Сохранение...' : t('forms.review.buttons.publish')}
              </Button>
            </Box>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default ReviewFormPage;