import React, { useState, useCallback, useMemo, useEffect } from 'react';
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
  IconButton,
  Alert,
  LinearProgress,
  Chip,
  Tooltip,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  AddPhotoAlternate as AddPhotoIcon,
  Delete as DeleteIcon,
  Photo as PhotoIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  CloudUpload as UploadIcon,
  Restore as RestoreIcon,
} from '@mui/icons-material';
import { FormikProps } from 'formik';
import type { ServicePointFormDataNew, ServicePointPhoto, ServicePoint } from '../../../types/models';
import { HiddenElement, StyledList } from '../../../components/styled/CommonComponents';
import { useTranslation } from 'react-i18next';

interface PhotosStepProps {
  formik: FormikProps<ServicePointFormDataNew>;
  isEditMode: boolean;
  servicePoint?: ServicePoint;
}

// Интерфейс для новых фотографий с файлами
interface NewPhotoData {
  tempId: string;
  file: File;
  preview: string;
  description: string;
  is_main: boolean;
  sort_order: number;
}

const PhotosStep: React.FC<PhotosStepProps> = ({ formik, isEditMode, servicePoint }) => {
  const { t } = useTranslation();
  // Состояние для новых загружаемых фотографий
  const [newPhotos, setNewPhotos] = useState<NewPhotoData[]>([]);
  
  // Максимальное количество фотографий
  const MAX_PHOTOS = 10;

  // Получаем существующие фотографии из формы (включая помеченные для удаления)
  const existingPhotos = useMemo(() => {
    return formik.values.photos?.filter(photo => photo.id && photo.id > 0) || [];
  }, [formik.values.photos]);

  // Получаем фотографии помеченные для удаления
  const photosMarkedForDeletion = useMemo(() => {
    return formik.values.photos?.filter(photo => photo.id && photo.id > 0 && (photo as any)._destroy) || [];
  }, [formik.values.photos]);

  // Получаем активные (не помеченные для удаления) существующие фотографии
  const activeExistingPhotos = useMemo(() => {
    return formik.values.photos?.filter(photo => !photo._destroy && photo.id && photo.id > 0) || [];
  }, [formik.values.photos]);

  // Восстанавливаем локальное состояние newPhotos из данных formik при монтировании
  useEffect(() => {
    const temporaryPhotos = formik.values.photos?.filter(photo => 
      photo.id === 0 && (photo as any).file
    ) || [];
    
    if (temporaryPhotos.length > 0) {
      const restoredNewPhotos: NewPhotoData[] = temporaryPhotos.map((photo, index) => ({
        tempId: `restored-${Date.now()}-${index}`,
        file: (photo as any).file,
        preview: photo.url,
        description: photo.description || '',
        is_main: photo.is_main,
        sort_order: photo.sort_order || 0,
      }));
      
      setNewPhotos(restoredNewPhotos);
      console.log('Восстановлено новых фотографий:', restoredNewPhotos.length);
    }
  }, []); // Выполняется только при монтировании

  // Общее количество фотографий (только активные, не помеченные для удаления)
  const totalPhotosCount = activeExistingPhotos.length + newPhotos.length;

  // Обработчик загрузки новых фотографий
  const handlePhotoUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const filesArray = Array.from(files);
    
    console.log('=== Загрузка новых фотографий ===');
    console.log('isEditMode:', isEditMode);
    console.log('Выбрано файлов:', filesArray.length);
    console.log('Текущее количество фотографий:', totalPhotosCount);
    console.log('Существующие фотографии:', existingPhotos.length);
    console.log('Новые фотографии:', newPhotos.length);
    
    // Проверяем лимит фотографий
    if (totalPhotosCount + filesArray.length > MAX_PHOTOS) {
      alert(`Максимальное количество фотографий: ${MAX_PHOTOS}`);
      return;
    }

    // Создаем объекты для новых фотографий
    const newPhotoData: NewPhotoData[] = filesArray.map((file, index) => ({
      tempId: `temp-${Date.now()}-${index}`,
      file,
      preview: URL.createObjectURL(file),
      description: '',
      is_main: totalPhotosCount === 0 && index === 0, // Первая фотография становится главной, если других нет
      sort_order: totalPhotosCount + index,
    }));

    console.log('Создано новых фотографий:', newPhotoData.length);
    console.log('Новые фотографии:', newPhotoData.map(p => ({ tempId: p.tempId, fileName: p.file.name, isMain: p.is_main })));

    setNewPhotos(prev => {
      const updated = [...prev, ...newPhotoData];
      console.log('Обновленное состояние newPhotos:', updated.length);
      return updated;
    });
    
    // Очищаем input для повторной загрузки
    event.target.value = '';
  }, [totalPhotosCount, isEditMode, existingPhotos.length, newPhotos.length]);

  // Обработчик удаления существующей фотографии
  const handleDeleteExistingPhoto = useCallback((photoIndex: number) => {
    console.log('=== Удаление существующей фотографии ===');
    console.log('photoIndex:', photoIndex);
    
    const updatedPhotos = [...(formik.values.photos || [])];
    const photoToDelete = updatedPhotos[photoIndex];
    
    console.log('Фотография для удаления:', {
      id: photoToDelete.id,
      url: photoToDelete.url,
      description: photoToDelete.description,
      isMain: photoToDelete.is_main
    });
    
    // Если фотография имеет ID (существует в БД), помечаем для удаления
    if (photoToDelete.id) {
      console.log('Помечаем существующую фотографию для удаления (ID > 0)');
      updatedPhotos[photoIndex] = { ...photoToDelete, _destroy: true };
    } else {
      console.log('Удаляем новую фотографию из массива (ID = 0)');
      // Удаляем из массива если это новая фотография без ID
      updatedPhotos.splice(photoIndex, 1);
    }
    
    console.log('Обновленный массив фотографий:', updatedPhotos.length);
    console.log('Фотографии помеченные для удаления:', updatedPhotos.filter(p => (p as any)._destroy).length);
    
    formik.setFieldValue('photos', updatedPhotos);
  }, [formik]);

  // Обработчик удаления новой фотографии
  const handleDeleteNewPhoto = useCallback((tempId: string) => {
    setNewPhotos(prev => {
      const photoToDelete = prev.find(p => p.tempId === tempId);
      if (photoToDelete?.preview) {
        URL.revokeObjectURL(photoToDelete.preview);
      }
      return prev.filter(p => p.tempId !== tempId);
    });
  }, []);

  // Обработчик отмены удаления фотографии
  const handleCancelDeletePhoto = useCallback((photoIndex: number) => {
    console.log('=== Отмена удаления фотографии ===');
    console.log('photoIndex:', photoIndex);
    
    const updatedPhotos = [...(formik.values.photos || [])];
    const photo = updatedPhotos[photoIndex];
    
    if (photo && (photo as any)._destroy) {
      console.log('Отменяем удаление фотографии с ID:', photo.id);
      // Убираем флаг _destroy
      updatedPhotos[photoIndex] = { ...photo, _destroy: false };
      formik.setFieldValue('photos', updatedPhotos);
    }
  }, [formik]);

  // Обработчик установки главной фотографии среди существующих
  const handleSetMainExistingPhoto = useCallback((photoIndex: number) => {
    const updatedPhotos = [...(formik.values.photos || [])];
    
    // Убираем флаг главной у всех фотографий
    updatedPhotos.forEach((photo, index) => {
      updatedPhotos[index] = { ...photo, is_main: index === photoIndex };
    });
    
    formik.setFieldValue('photos', updatedPhotos);
    
    // Убираем флаг главной у новых фотографий
    setNewPhotos(prev => prev.map(photo => ({ ...photo, is_main: false })));
  }, [formik]);

  // Обработчик установки главной фотографии среди новых
  const handleSetMainNewPhoto = useCallback((tempId: string) => {
    setNewPhotos(prev => prev.map(photo => ({
      ...photo,
      is_main: photo.tempId === tempId
    })));
    
    // Убираем флаг главной у существующих фотографий
    const updatedPhotos = [...(formik.values.photos || [])];
    updatedPhotos.forEach((photo, index) => {
      updatedPhotos[index] = { ...photo, is_main: false };
    });
    formik.setFieldValue('photos', updatedPhotos);
  }, [formik]);

  // Обработчик изменения описания существующей фотографии
  const handleUpdateExistingPhotoDescription = useCallback((photoIndex: number, description: string) => {
    const updatedPhotos = [...(formik.values.photos || [])];
    updatedPhotos[photoIndex] = { ...updatedPhotos[photoIndex], description };
    formik.setFieldValue('photos', updatedPhotos);
  }, [formik]);

  // Обработчик изменения описания новой фотографии
  const handleUpdateNewPhotoDescription = useCallback((tempId: string, description: string) => {
    setNewPhotos(prev => prev.map(photo => 
      photo.tempId === tempId ? { ...photo, description } : photo
    ));
  }, []);

  // Сохранение новых фотографий в формик при изменении
  React.useEffect(() => {
    console.log('=== useEffect для сохранения новых фотографий в formik ===');
    console.log('newPhotos.length:', newPhotos.length);
    console.log('isEditMode:', isEditMode);
    
    if (newPhotos.length === 0) {
      console.log('Нет новых фотографий для сохранения');
      return; // Не обновляем, если нет новых фотографий
    }

    // Преобразуем новые фотографии в формат для отправки на сервер
    const newPhotosData: ServicePointPhoto[] = newPhotos.map(photo => ({
      id: 0, // Временный ID для новых фотографий
      service_point_id: 0,
      url: photo.preview,
      description: photo.description,
      is_main: photo.is_main,
      sort_order: photo.sort_order,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      file: photo.file as any // Добавляем файл для загрузки
    }));

    console.log('Преобразованные новые фотографии:', newPhotosData.length);
    console.log('Детали новых фотографий:', newPhotosData.map(p => ({ 
      id: p.id, 
      fileName: (p as any).file?.name, 
      isMain: p.is_main,
      hasFile: !!(p as any).file 
    })));

    // Получаем только существующие фотографии (без временных)
    const existingPhotosOnly = (formik.values.photos || []).filter(photo => photo.id > 0 || photo._destroy);
    
    console.log('Существующие фотографии (без временных):', existingPhotosOnly.length);
    
    // Объединяем существующие и новые фотографии
    const allPhotos = [...existingPhotosOnly, ...newPhotosData];
    
    console.log('Общее количество фотографий для formik:', allPhotos.length);
    console.log('Фотографии с файлами:', allPhotos.filter(p => (p as any).file).length);
    
    formik.setFieldValue('photos', allPhotos);
  }, [newPhotos]); // Убираем formik из зависимостей чтобы избежать бесконечного цикла

  // Проверка имеет ли точка главную фотографию (только среди активных)
  const hasMainPhoto = useMemo(() => {
    const existingMain = activeExistingPhotos.some(photo => photo.is_main);
    const newMain = newPhotos.some(photo => photo.is_main);
    return existingMain || newMain;
  }, [activeExistingPhotos, newPhotos]);

  // Очистка URL preview при размонтировании
  React.useEffect(() => {
    return () => {
      newPhotos.forEach(photo => {
        if (photo.preview) {
          URL.revokeObjectURL(photo.preview);
        }
      });
    };
  }, []); // Пустой массив зависимостей - выполняется только при размонтировании

  return (
    <Box>
      {/* Заголовок шага */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <PhotoIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
          {t('forms.servicePoint.photos.title')}
        </Typography>
      </Box>

      {/* Кнопка добавления фото */}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t('forms.servicePoint.photos.description')}
      </Typography>

      {/* Блок загрузки фотографий */}
      <Paper sx={{ p: 3, mb: 3, border: '2px dashed', borderColor: 'primary.main', textAlign: 'center' }}>
        <HiddenElement
          component="input"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          id="photo-upload-input"
          multiple
          type="file"
          onChange={handlePhotoUpload}
        />
        <label htmlFor="photo-upload-input">
          <Box>
            <UploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              {t('forms.servicePoint.photos.dragOrClick')}
            </Typography>
            <Button
              variant="contained"
              component="span"
              startIcon={<AddPhotoIcon />}
              disabled={totalPhotosCount >= MAX_PHOTOS}
              sx={{ mt: 2 }}
            >
              {t('forms.servicePoint.photos.selectPhotos')}
            </Button>
          </Box>
        </label>
        <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 2 }}>
          {t('forms.servicePoint.photos.supportedFormats')}
        </Typography>
      </Paper>

      {/* Индикатор прогресса загрузки */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2">
            {t('forms.servicePoint.photos.loadedPhotos')} {totalPhotosCount} {t('forms.servicePoint.photos.of')} {MAX_PHOTOS}
          </Typography>
          {!hasMainPhoto && totalPhotosCount > 0 && (
            <Chip 
              label={t('forms.servicePoint.photos.noMainPhoto')} 
              color="warning" 
              size="small"
              icon={<StarBorderIcon />}
            />
          )}
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={(totalPhotosCount / MAX_PHOTOS) * 100} 
          sx={{ height: 8, borderRadius: 4 }}
          color={totalPhotosCount >= MAX_PHOTOS ? 'warning' : 'primary'}
        />
      </Box>

      {/* Предупреждения */}
      {totalPhotosCount >= MAX_PHOTOS && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {t('forms.servicePoint.photos.maxPhotosWarning')} 
          {t('forms.servicePoint.photos.removeSomePhotos')}
        </Alert>
      )}

      {!hasMainPhoto && totalPhotosCount > 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          {t('forms.servicePoint.photos.recommendMainPhoto')}
        </Alert>
      )}

      {/* Сетка фотографий */}
      {totalPhotosCount > 0 ? (
        <Box>
          <Typography variant="h6" gutterBottom>
            {t('forms.servicePoint.photos.photos')} ({totalPhotosCount})
          </Typography>
          <Grid container spacing={3}>
            {/* Существующие фотографии */}
            {existingPhotos.map((photo, index) => {
              const isMarkedForDeletion = (photo as any)._destroy;
              return (
                <Grid item xs={12} sm={6} md={4} key={`existing-${photo.id || index}`}>
                  <Card sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    opacity: isMarkedForDeletion ? 0.6 : 1,
                    border: isMarkedForDeletion ? '2px dashed #f44336' : 'none'
                  }}>
                    <Box sx={{ position: 'relative' }}>
                      <CardMedia
                        component="img"
                        height="200"
                        image={photo.url}
                        alt={photo.description || t('forms.servicePoint.photos.servicePointPhotoAlt')}
                        sx={{ 
                          objectFit: 'cover',
                          filter: isMarkedForDeletion ? 'grayscale(100%)' : 'none'
                        }}
                      />
                      
                      {/* Индикатор главной фотографии */}
                      {photo.is_main && !isMarkedForDeletion && (
                        <Chip
                          icon={<StarIcon />}
                          label={t('forms.servicePoint.photos.mainPhoto')}
                          color="primary"
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 8,
                            left: 8,
                          }}
                        />
                      )}
                      
                      {/* Индикатор статуса фотографии */}
                      <Chip
                        label={isMarkedForDeletion ? t('forms.servicePoint.photos.markedForDeletion') : t('forms.servicePoint.photos.loaded')}
                        color={isMarkedForDeletion ? "error" : "success"}
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 48,
                        }}
                      />
                      
                      {/* Кнопка удаления или восстановления */}
                      <Tooltip title={isMarkedForDeletion ? t('forms.servicePoint.photos.cancelDelete') : t('forms.servicePoint.photos.deletePhoto')}>
                        <IconButton
                          color={isMarkedForDeletion ? "primary" : "error"}
                          onClick={() => isMarkedForDeletion ? handleCancelDeletePhoto(index) : handleDeleteExistingPhoto(index)}
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            bgcolor: 'rgba(255, 255, 255, 0.9)',
                            '&:hover': {
                              bgcolor: 'rgba(255, 255, 255, 1)',
                            },
                          }}
                          size="small"
                        >
                          {isMarkedForDeletion ? <RestoreIcon /> : <DeleteIcon />}
                        </IconButton>
                      </Tooltip>
                    </Box>
                    
                    <CardContent sx={{ flexGrow: 1 }}>
                      <TextField
                        fullWidth
                        label={t('forms.servicePoint.photos.photoDescriptionLabel')}
                        value={photo.description || ''}
                        onChange={(e) => handleUpdateExistingPhotoDescription(index, e.target.value)}
                        multiline
                        rows={2}
                        size="small"
                        placeholder={t('forms.servicePoint.photos.photoDescriptionPlaceholder')}
                        disabled={isMarkedForDeletion}
                      />
                    </CardContent>
                    
                    <CardActions sx={{ justifyContent: 'space-between', pt: 0 }}>
                      <Button
                        startIcon={photo.is_main ? <StarIcon /> : <StarBorderIcon />}
                        onClick={() => handleSetMainExistingPhoto(index)}
                        color={photo.is_main ? 'primary' : 'inherit'}
                        size="small"
                        disabled={photo.is_main || isMarkedForDeletion}
                      >
                        {photo.is_main ? t('forms.servicePoint.photos.mainPhoto') : t('forms.servicePoint.photos.makeMain')}
                      </Button>
                      
                      <Typography variant="caption" color="text.secondary">
                        #{photo.sort_order || index + 1}
                      </Typography>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}

            {/* Новые фотографии */}
            {newPhotos.map((photo) => (
              <Grid item xs={12} sm={6} md={4} key={`new-${photo.tempId}`}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={photo.preview}
                      alt={photo.description || t('forms.servicePoint.photos.newPhotoAlt')}
                      sx={{ objectFit: 'cover' }}
                    />
                    
                    {/* Индикатор главной фотографии */}
                    {photo.is_main && (
                      <Chip
                        icon={<StarIcon />}
                        label={t('forms.servicePoint.photos.mainPhoto')}
                        color="primary"
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 8,
                          left: 8,
                        }}
                      />
                    )}
                    
                    {/* Индикатор новой фотографии */}
                    <Chip
                      label={t('forms.servicePoint.photos.newPhoto')}
                      color="info"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 48,
                      }}
                    />
                    
                    {/* Кнопка удаления */}
                    <Tooltip title={t('forms.servicePoint.photos.deletePhoto')}>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteNewPhoto(photo.tempId)}
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          bgcolor: 'rgba(255, 255, 255, 0.9)',
                          '&:hover': {
                            bgcolor: 'rgba(255, 255, 255, 1)',
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
                      label={t('forms.servicePoint.photos.photoDescriptionLabel')}
                      value={photo.description}
                      onChange={(e) => handleUpdateNewPhotoDescription(photo.tempId, e.target.value)}
                      multiline
                      rows={2}
                      size="small"
                      placeholder={t('forms.servicePoint.photos.photoDescriptionPlaceholder')}
                    />
                  </CardContent>
                  
                  <CardActions sx={{ justifyContent: 'space-between', pt: 0 }}>
                    <Button
                      startIcon={photo.is_main ? <StarIcon /> : <StarBorderIcon />}
                      onClick={() => handleSetMainNewPhoto(photo.tempId)}
                      color={photo.is_main ? 'primary' : 'inherit'}
                      size="small"
                      disabled={photo.is_main}
                    >
                      {photo.is_main ? t('forms.servicePoint.photos.mainPhoto') : t('forms.servicePoint.photos.makeMain')}
                    </Button>
                    
                    <Typography variant="caption" color="text.secondary">
                      #{photo.sort_order + 1}
                    </Typography>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      ) : (
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body1" gutterBottom>
            {t('forms.servicePoint.photos.noPhotos')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('forms.servicePoint.photos.photoHelp')} 
            {t('forms.servicePoint.photos.addPhotos')}
          </Typography>
        </Alert>
      )}

      {/* Информация о новых фотографиях */}
      {newPhotos.length > 0 && (
        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="body2">
            {t('forms.servicePoint.photos.newPhotosInfo')} {newPhotos.length}
          </Typography>
        </Alert>
      )}

      {/* Советы */}
      <Box sx={{ mt: 4 }}>
        <Divider sx={{ mb: 3 }} />
        <Typography variant="h6" gutterBottom>
          {t('forms.servicePoint.photos.tipsTitle')}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" component="div">
              <strong>{t('forms.servicePoint.photos.whatToTake')}:</strong>
              <StyledList gap={2} sx={{ mt: 1, pl: 2.5 }}>
                <ListItem disablePadding>
                  <ListItemText primary={t('forms.servicePoint.photos.generalView')} />
                </ListItem>
                <ListItem disablePadding>
                  <ListItemText primary={t('forms.servicePoint.photos.workPlaces')} />
                </ListItem>
                <ListItem disablePadding>
                  <ListItemText primary={t('forms.servicePoint.photos.waitingZone')} />
                </ListItem>
                <ListItem disablePadding>
                  <ListItemText primary={t('forms.servicePoint.photos.parking')} />
                </ListItem>
              </StyledList>
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" component="div">
              <strong>{t('forms.servicePoint.photos.photoQuality')}:</strong>
              <StyledList gap={2} sx={{ mt: 1, pl: 2.5 }}>
                <ListItem disablePadding>
                  <ListItemText primary={t('forms.servicePoint.photos.goodLighting')} />
                </ListItem>
                <ListItem disablePadding>
                  <ListItemText primary={t('forms.servicePoint.photos.highResolution')} />
                </ListItem>
                <ListItem disablePadding>
                  <ListItemText primary={t('forms.servicePoint.photos.clearImages')} />
                </ListItem>
                <ListItem disablePadding>
                  <ListItemText primary={t('forms.servicePoint.photos.attractiveAngles')} />
                </ListItem>
              </StyledList>
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default PhotosStep; 