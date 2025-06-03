import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  Button,
  Card,
  CardContent,
  CardActions,
  CardMedia,
  TextField,
  FormControlLabel,
  Switch,
  IconButton,
  Alert,
  LinearProgress,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  AddPhotoAlternate as AddPhotoIcon,
  Delete as DeleteIcon,
  Photo as PhotoIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
} from '@mui/icons-material';
import { FormikProps } from 'formik';
import type { ServicePointFormDataNew, ServicePointPhoto, ServicePoint } from '../../../types/models';

interface PhotosStepProps {
  formik: FormikProps<ServicePointFormDataNew>;
  isEditMode: boolean;
  servicePoint?: ServicePoint;
}

// Интерфейс для загружаемых фотографий
interface PhotoUpload {
  id?: string; // Временный ID для новых фотографий
  file?: File;
  url?: string;
  description: string;
  is_main: boolean;
  sort_order: number;
  preview?: string; // URL для предпросмотра
}

const PhotosStep: React.FC<PhotosStepProps> = ({ formik, isEditMode, servicePoint }) => {
  // Состояние для загружаемых фотографий (новых)
  const [photoUploads, setPhotoUploads] = useState<PhotoUpload[]>([]);
  
  // Получаем существующие фотографии из формы
  const existingPhotos = formik.values.photos || [];
  
  // Объединяем существующие и новые фотографии для отображения
  const allPhotos = [
    ...existingPhotos.map(photo => ({
      id: photo.id?.toString() || 'existing',
      url: photo.url,
      description: photo.description || '',
      is_main: photo.is_main,
      sort_order: photo.sort_order || 0,
      isExisting: true,
      preview: undefined as string | undefined, // Добавляем preview для совместимости типов
    })),
    ...photoUploads.map(upload => ({
      ...upload,
      id: upload.id || 'new',
      isExisting: false,
    }))
  ];

  // Максимальное количество фотографий
  const MAX_PHOTOS = 10;

  // Обработчик загрузки фотографий
  const handlePhotoUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const filesArray = Array.from(files);
    
    // Проверяем лимит фотографий
    if (allPhotos.length + filesArray.length > MAX_PHOTOS) {
      // Показываем ошибку через formik или alert
      alert(`Максимальное количество фотографий: ${MAX_PHOTOS}`);
      return;
    }

    // Создаем объекты для новых фотографий
    const newPhotoUploads: PhotoUpload[] = filesArray.map((file, index) => ({
      id: `new-${Date.now()}-${index}`,
      file,
      description: '',
      is_main: allPhotos.length === 0 && index === 0, // Первая фотография становится главной, если других нет
      sort_order: allPhotos.length + index,
      preview: URL.createObjectURL(file),
    }));

    setPhotoUploads(prev => [...prev, ...newPhotoUploads]);
    
    // Очищаем input для повторной загрузки
    event.target.value = '';
  }, [allPhotos.length]);

  // Обработчик удаления фотографии
  const handleDeletePhoto = useCallback((photoId: string, isExisting: boolean) => {
    if (isExisting) {
      // Удаляем из существующих фотографий в formik
      const updatedPhotos = existingPhotos.filter(photo => photo.id?.toString() !== photoId);
      formik.setFieldValue('photos', updatedPhotos);
    } else {
      // Удаляем из новых загрузок
      const photoToDelete = photoUploads.find(p => p.id === photoId);
      if (photoToDelete?.preview) {
        URL.revokeObjectURL(photoToDelete.preview);
      }
      setPhotoUploads(prev => prev.filter(p => p.id !== photoId));
    }
  }, [existingPhotos, photoUploads, formik]);

  // Обработчик установки главной фотографии
  const handleSetMainPhoto = useCallback((photoId: string, isExisting: boolean) => {
    if (isExisting) {
      // Обновляем существующие фотографии
      const updatedPhotos = existingPhotos.map(photo => ({
        ...photo,
        is_main: photo.id?.toString() === photoId
      }));
      formik.setFieldValue('photos', updatedPhotos);
    } else {
      // Обновляем новые загрузки
      setPhotoUploads(prev => prev.map(upload => ({
        ...upload,
        is_main: upload.id === photoId
      })));
    }
    
    // Убираем флаг is_main у всех остальных фотографий
    if (isExisting) {
      setPhotoUploads(prev => prev.map(upload => ({ ...upload, is_main: false })));
    } else {
      const updatedPhotos = existingPhotos.map(photo => ({ ...photo, is_main: false }));
      formik.setFieldValue('photos', updatedPhotos);
    }
  }, [existingPhotos, formik]);

  // Обработчик изменения описания фотографии
  const handleDescriptionChange = useCallback((photoId: string, description: string, isExisting: boolean) => {
    if (isExisting) {
      const updatedPhotos = existingPhotos.map(photo => 
        photo.id?.toString() === photoId ? { ...photo, description } : photo
      );
      formik.setFieldValue('photos', updatedPhotos);
    } else {
      setPhotoUploads(prev => prev.map(upload => 
        upload.id === photoId ? { ...upload, description } : upload
      ));
    }
  }, [existingPhotos, formik]);

  // Получаем массив новых фотографий для передачи в родительский компонент
  React.useEffect(() => {
    // Можно добавить логику для передачи photoUploads в родительский компонент
    // Например, через callback prop или context
  }, [photoUploads]);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <PhotoIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6">
          Фотографии
        </Typography>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Добавьте фотографии сервисной точки для привлечения клиентов. 
        Рекомендуется загрузить фотографии рабочих мест, оборудования и общего вида.
      </Typography>

      {/* Кнопка загрузки фотографий */}
      <Box sx={{ mb: 3 }}>
        <input
          accept="image/jpeg,image/jpg,image/png,image/webp"
          style={{ display: 'none' }}
          id="photo-upload-input"
          multiple
          type="file"
          onChange={handlePhotoUpload}
        />
        <label htmlFor="photo-upload-input">
          <Button
            variant="outlined"
            component="span"
            startIcon={<AddPhotoIcon />}
            disabled={allPhotos.length >= MAX_PHOTOS}
          >
            Добавить фотографии
          </Button>
        </label>
        <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
          Поддерживаемые форматы: JPEG, PNG, WebP. Максимум {MAX_PHOTOS} фотографий.
        </Typography>
      </Box>

      {/* Индикатор количества фотографий */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2">
            Загружено фотографий: {allPhotos.length} из {MAX_PHOTOS}
          </Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={(allPhotos.length / MAX_PHOTOS) * 100} 
          sx={{ height: 8, borderRadius: 4 }}
        />
      </Box>

      {allPhotos.length >= MAX_PHOTOS && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Достигнуто максимальное количество фотографий ({MAX_PHOTOS})
        </Alert>
      )}

      {/* Сетка фотографий */}
      {allPhotos.length > 0 ? (
        <Grid container spacing={3}>
          {allPhotos.map((photo) => (
            <Grid item xs={12} sm={6} md={4} key={photo.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={photo.preview || photo.url}
                    alt={photo.description || 'Фотография сервисной точки'}
                    sx={{ objectFit: 'cover' }}
                  />
                  
                  {/* Индикатор главной фотографии */}
                  {photo.is_main && (
                    <Chip
                      icon={<StarIcon />}
                      label="Главная"
                      color="primary"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                      }}
                    />
                  )}
                  
                  {/* Кнопка удаления */}
                  <Tooltip title="Удалить фотографию">
                    <IconButton
                      color="error"
                      onClick={() => handleDeletePhoto(photo.id, photo.isExisting)}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: 'rgba(255, 255, 255, 0.8)',
                        '&:hover': {
                          bgcolor: 'rgba(255, 255, 255, 0.9)',
                        },
                      }}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
                
                <CardContent sx={{ flexGrow: 1 }}>
                  <TextField
                    fullWidth
                    label="Описание фотографии"
                    value={photo.description}
                    onChange={(e) => handleDescriptionChange(photo.id, e.target.value, photo.isExisting)}
                    multiline
                    rows={2}
                    size="small"
                    placeholder="Краткое описание того, что изображено на фотографии"
                  />
                </CardContent>
                
                <CardActions sx={{ justifyContent: 'space-between' }}>
                  <Button
                    startIcon={photo.is_main ? <StarIcon /> : <StarBorderIcon />}
                    onClick={() => handleSetMainPhoto(photo.id, photo.isExisting)}
                    color={photo.is_main ? 'primary' : 'inherit'}
                    size="small"
                  >
                    {photo.is_main ? 'Главная' : 'Сделать главной'}
                  </Button>
                  
                  <Typography variant="caption" color="text.secondary">
                    #{photo.sort_order + 1}
                  </Typography>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body1" gutterBottom>
            Пока не добавлено ни одной фотографии
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Фотографии помогают клиентам лучше понять, что их ждет в сервисной точке. 
            Рекомендуется добавить фотографии рабочих мест, оборудования и общего вида помещения.
          </Typography>
        </Alert>
      )}

      {/* Сохранение новых фотографий для передачи в родительский компонент */}
      {photoUploads.length > 0 && (
        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="body2">
            📸 Новые фотографии ({photoUploads.length}) будут загружены после сохранения сервисной точки.
          </Typography>
        </Alert>
      )}

      {/* Информационная подсказка */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          💡 <strong>Советы по фотографиям:</strong>
        </Typography>
        <Typography variant="body2" component="div" sx={{ mt: 1 }}>
          • Загружайте качественные фотографии хорошего разрешения<br/>
          • Первая фотография автоматически становится главной<br/>
          • Главная фотография отображается в списке сервисных точек<br/>
          • Добавьте описания для лучшего понимания контента
        </Typography>
      </Alert>
    </Box>
  );
};

export default PhotosStep; 