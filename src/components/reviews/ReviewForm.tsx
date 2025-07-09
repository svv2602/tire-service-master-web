import React, { useState } from 'react';
import { 
  Box, Paper, Typography, Rating, TextField, Button, 
  FormControl, FormHelperText, CircularProgress, Alert 
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ReviewFormData } from '../../types/review';

interface ReviewFormProps {
  servicePointId?: string;
  onSubmit: (values: ReviewFormData) => Promise<void>;
  isSubmitting: boolean;
  error?: any;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ servicePointId, onSubmit, isSubmitting, error }) => {
  const { t } = useTranslation('components');
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  // Схема валидации
  const validationSchema = Yup.object({
    service_point_id: Yup.string().required(t('reviewForm.validation.selectServicePoint')),
    rating: Yup.number()
      .required(t('reviewForm.validation.ratingRequired'))
      .min(1, t('reviewForm.validation.ratingRequired')),
    comment: Yup.string()
      .required(t('reviewForm.validation.commentRequired'))
      .min(10, t('reviewForm.validation.commentMinLength'))
      .max(1000, t('reviewForm.validation.commentMaxLength')),
  });

  // Настройка formik
  const formik = useFormik({
    initialValues: {
      service_point_id: servicePointId || '',
      rating: 0,
      comment: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      await onSubmit(values);
    },
  });

  // Описание оценки в зависимости от количества звезд
  const getRatingLabel = (rating: number) => {
    if (rating >= 1 && rating <= 5) {
      return t(`reviewForm.ratingLabels.${rating}`);
    }
    return '';
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {t('reviewForm.title')}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {t('reviewForm.errorMessage')}
        </Alert>
      )}

      <form onSubmit={formik.handleSubmit}>
        <Box mb={3}>
          <Typography component="legend" gutterBottom>
            {t('reviewForm.fields.rating')}*
          </Typography>
          <Box display="flex" alignItems="center">
            <Rating
              name="rating"
              value={formik.values.rating}
              precision={1}
              size="large"
              onChange={(event, newValue) => {
                formik.setFieldValue('rating', newValue);
              }}
              onChangeActive={(event, newHover) => {
                setHoverRating(newHover);
              }}
            />
            <Box ml={2}>
              <Typography variant="body2">
                {getRatingLabel(hoverRating !== null ? hoverRating : formik.values.rating)}
              </Typography>
            </Box>
          </Box>
          {formik.touched.rating && formik.errors.rating && (
            <FormHelperText error>{formik.errors.rating}</FormHelperText>
          )}
        </Box>

        <FormControl fullWidth sx={{ mb: 3 }}>
          <TextField
            id="comment"
            name="comment"
            label={t('reviewForm.fields.comment')}
            multiline
            rows={4}
            value={formik.values.comment}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.comment && Boolean(formik.errors.comment)}
            helperText={formik.touched.comment && formik.errors.comment}
            placeholder={t('reviewForm.fields.commentPlaceholder')}
          />
          <Box display="flex" justifyContent="flex-end" mt={1}>
            <Typography variant="caption" color={formik.values.comment.length > 1000 ? 'error' : 'textSecondary'}>
              {formik.values.comment.length}/1000
            </Typography>
          </Box>
        </FormControl>

        <Box display="flex" justifyContent="flex-end">
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
          >
            {t('reviewForm.submitButton')}
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

export default ReviewForm; 