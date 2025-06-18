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
} from '@mui/icons-material';
import { FormikProps } from 'formik';
import type { ServicePointFormDataNew, ServicePointPhoto, ServicePoint } from '../../../types/models';
import { HiddenElement, StyledList } from '../../../components/styled/CommonComponents';

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
  // Состояние для новых загружаемых фотографий
  const [newPhotos, setNewPhotos] = useState<NewPhotoData[]>([]);
  
  // Максимальное количество фотографий
  const MAX_PHOTOS = 10;

  // Получаем существующие фотографии из формы
  const existingPhotos = useMemo(() => {
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

  // Общее количество фотографий
  const totalPhotosCount = existingPhotos.length + newPhotos.length;

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
    const updatedPhotos = [...(formik.values.photos || [])];
    const photoToDelete = updatedPhotos[photoIndex];
    
    // Если фотография имеет ID (существует в БД), помечаем для удаления
    if (photoToDelete.id) {
      updatedPhotos[photoIndex] = { ...photoToDelete, _destroy: true };
    } else {
      // Удаляем из массива если это новая фотография без ID
      updatedPhotos.splice(photoIndex, 1);
    }
    
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

  // Проверка имеет ли точка главную фотографию
  const hasMainPhoto = useMemo(() => {
    const existingMain = existingPhotos.some(photo => photo.is_main);
    const newMain = newPhotos.some(photo => photo.is_main);
    return existingMain || newMain;
  }, [existingPhotos, newPhotos]);

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
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <PhotoIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6">
          Фотографии сервисной точки
        </Typography>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Добавьте качественные фотографии сервисной точки. Хорошие фотографии помогают привлечь больше клиентов.
        Первая фотография или фотография с флагом "Главная" будет отображаться как основная.
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
              Перетащите фотографии сюда или нажмите для выбора
            </Typography>
            <Button
              variant="contained"
              component="span"
              startIcon={<AddPhotoIcon />}
              disabled={totalPhotosCount >= MAX_PHOTOS}
              sx={{ mt: 2 }}
            >
              Выбрать фотографии
            </Button>
          </Box>
        </label>
        <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 2 }}>
          Поддерживаемые форматы: JPEG, PNG, WebP. Максимум {MAX_PHOTOS} фотографий. Максимальный размер файла: 5MB.
        </Typography>
      </Paper>

      {/* Индикатор прогресса загрузки */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2">
            Загружено фотографий: {totalPhotosCount} из {MAX_PHOTOS}
          </Typography>
          {!hasMainPhoto && totalPhotosCount > 0 && (
            <Chip 
              label="Нет главной фотографии" 
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
          Достигнуто максимальное количество фотографий ({MAX_PHOTOS}). 
          Удалите некоторые фотографии, чтобы добавить новые.
        </Alert>
      )}

      {!hasMainPhoto && totalPhotosCount > 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Рекомендуется установить одну из фотографий как главную. Главная фотография будет отображаться в списке сервисных точек.
        </Alert>
      )}

      {/* Сетка фотографий */}
      {totalPhotosCount > 0 ? (
        <Box>
          <Typography variant="h6" gutterBottom>
            Фотографии ({totalPhotosCount})
          </Typography>
          <Grid container spacing={3}>
            {/* Существующие фотографии */}
            {existingPhotos.map((photo, index) => (
              <Grid item xs={12} sm={6} md={4} key={`existing-${photo.id || index}`}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={photo.url}
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
                    
                    {/* Индикатор существующей фотографии */}
                    <Chip
                      label="Загружена"
                      color="success"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 48,
                      }}
                    />
                    
                    {/* Кнопка удаления */}
                    <Tooltip title="Удалить фотографию">
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteExistingPhoto(index)}
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
                      label="Описание фотографии"
                      value={photo.description || ''}
                      onChange={(e) => handleUpdateExistingPhotoDescription(index, e.target.value)}
                      multiline
                      rows={2}
                      size="small"
                      placeholder="Краткое описание фотографии"
                    />
                  </CardContent>
                  
                  <CardActions sx={{ justifyContent: 'space-between', pt: 0 }}>
                    <Button
                      startIcon={photo.is_main ? <StarIcon /> : <StarBorderIcon />}
                      onClick={() => handleSetMainExistingPhoto(index)}
                      color={photo.is_main ? 'primary' : 'inherit'}
                      size="small"
                      disabled={photo.is_main}
                    >
                      {photo.is_main ? 'Главная' : 'Сделать главной'}
                    </Button>
                    
                    <Typography variant="caption" color="text.secondary">
                      #{photo.sort_order || index + 1}
                    </Typography>
                  </CardActions>
                </Card>
              </Grid>
            ))}

            {/* Новые фотографии */}
            {newPhotos.map((photo) => (
              <Grid item xs={12} sm={6} md={4} key={`new-${photo.tempId}`}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={photo.preview}
                      alt={photo.description || 'Новая фотография'}
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
                    
                    {/* Индикатор новой фотографии */}
                    <Chip
                      label="Новая"
                      color="info"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 48,
                      }}
                    />
                    
                    {/* Кнопка удаления */}
                    <Tooltip title="Удалить фотографию">
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
                      label="Описание фотографии"
                      value={photo.description}
                      onChange={(e) => handleUpdateNewPhotoDescription(photo.tempId, e.target.value)}
                      multiline
                      rows={2}
                      size="small"
                      placeholder="Краткое описание фотографии"
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
        </Box>
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

      {/* Информация о новых фотографиях */}
      {newPhotos.length > 0 && (
        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="body2">
            📸 Новые фотографии ({newPhotos.length}) будут загружены при сохранении сервисной точки.
          </Typography>
        </Alert>
      )}

      {/* Советы */}
      <Box sx={{ mt: 4 }}>
        <Divider sx={{ mb: 3 }} />
        <Typography variant="h6" gutterBottom>
          💡 Советы для лучших фотографий
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" component="div">
              <strong>Что фотографировать:</strong>
              <StyledList gap={8} sx={{ mt: 1, pl: 2.5 }}>
                <ListItem disablePadding>
                  <ListItemText primary="Общий вид сервисного центра" />
                </ListItem>
                <ListItem disablePadding>
                  <ListItemText primary="Рабочие места и оборудование" />
                </ListItem>
                <ListItem disablePadding>
                  <ListItemText primary="Зону ожидания клиентов" />
                </ListItem>
                <ListItem disablePadding>
                  <ListItemText primary="Парковку и въезд" />
                </ListItem>
              </StyledList>
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" component="div">
              <strong>Качество фотографий:</strong>
              <StyledList gap={8} sx={{ mt: 1, pl: 2.5 }}>
                <ListItem disablePadding>
                  <ListItemText primary="Хорошее освещение" />
                </ListItem>
                <ListItem disablePadding>
                  <ListItemText primary="Высокое разрешение" />
                </ListItem>
                <ListItem disablePadding>
                  <ListItemText primary="Четкие, не размытые снимки" />
                </ListItem>
                <ListItem disablePadding>
                  <ListItemText primary="Привлекательные ракурсы" />
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