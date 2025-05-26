import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Button,
  IconButton,
  Card,
  CardMedia,
  CardActions,
  CardContent,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  PhotoCamera as PhotoCameraIcon,
  Delete as DeleteIcon,
  OpenInNew as OpenInNewIcon,
  CloudUpload as CloudUploadIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { AppDispatch } from '../../store';
import { fetchServicePointById, clearError } from '../../store/slices/servicePointsSlice';
import { useNavigate, useParams } from 'react-router-dom';
import { servicePointsApi } from '../../api';

const ServicePointPhotosPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { selectedServicePoint, loading, error } = useSelector((state: RootState) => state.servicePoints);
  
  const [photos, setPhotos] = useState<any[]>([]);
  const [photoLoading, setPhotoLoading] = useState<boolean>(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [photoToDelete, setPhotoToDelete] = useState<number | null>(null);

  const fetchPhotos = useCallback(async () => {
    if (!id) return;
    
    setPhotoLoading(true);
    setPhotoError(null);
    
    try {
      const response = await servicePointsApi.getPhotos(Number(id));
      setPhotos(response || []);
    } catch (error: any) {
      setPhotoError(error.response?.data?.error || 'Не удалось загрузить фотографии');
    } finally {
      setPhotoLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      dispatch(fetchServicePointById(Number(id)));
      fetchPhotos();
    }
    
    return () => {
      // Очистка при размонтировании компонента
      dispatch(clearError());
    };
  }, [id, dispatch, fetchPhotos]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !files.length || !id) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    setPhotoError(null);
    
    const formData = new FormData();
    formData.append('photo', files[0]);
    
    try {
      await servicePointsApi.uploadPhoto(Number(id), formData);
      await fetchPhotos();
    } catch (error: any) {
      setPhotoError(error.response?.data?.error || 'Не удалось загрузить фотографию');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteClick = (photoId: number) => {
    setPhotoToDelete(photoId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!photoToDelete || !id) {
      setDeleteDialogOpen(false);
      return;
    }
    
    setPhotoLoading(true);
    setPhotoError(null);
    
    try {
      await servicePointsApi.deletePhoto(Number(id), photoToDelete);
      await fetchPhotos();
    } catch (error: any) {
      setPhotoError(error.response?.data?.error || 'Не удалось удалить фотографию');
    } finally {
      setPhotoLoading(false);
      setDeleteDialogOpen(false);
      setPhotoToDelete(null);
    }
  };

  const handleBack = () => {
    navigate(`/service-points/${id}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => dispatch(clearError())}>
          {error}
        </Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack}>
          Вернуться назад
        </Button>
      </Box>
    );
  }

  if (!selectedServicePoint) {
    return (
      <Box>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Сервисная точка не найдена
        </Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/service-points')}>
          Вернуться к списку
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Фотографии: {selectedServicePoint.name}
        </Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack}>
          Назад к точке
        </Button>
      </Box>

      {photoError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setPhotoError(null)}>
          {photoError}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <PhotoCameraIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6">Загрузить новую фотографию</Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />
        
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="photo-upload"
            type="file"
            onChange={handleFileChange}
            disabled={isUploading}
          />
          <label htmlFor="photo-upload">
            <Button
              variant="contained"
              component="span"
              startIcon={<CloudUploadIcon />}
              disabled={isUploading}
            >
              Выбрать фото
            </Button>
          </label>
          
          {isUploading && (
            <Box sx={{ mt: 2, width: '100%' }}>
              <CircularProgress variant="determinate" value={uploadProgress} />
            </Box>
          )}
        </Box>
      </Paper>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Фотографии сервисной точки
        </Typography>
        <Divider />
      </Box>

      {photoLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : photos.length > 0 ? (
        <Grid container spacing={3}>
          {photos.map((photo) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={photo.id}>
              <Card>
                <CardMedia
                  component="img"
                  height="200"
                  image={photo.photo_url}
                  alt={`Фото ${photo.id}`}
                />
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    {`Фото #${photo.id}`}
                  </Typography>
                </CardContent>
                <CardActions>
                  <IconButton 
                    href={photo.photo_url} 
                    target="_blank" 
                    size="small" 
                    color="primary"
                    aria-label="открыть полное изображение"
                  >
                    <OpenInNewIcon />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    color="error"
                    aria-label="удалить"
                    onClick={() => handleDeleteClick(photo.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            У этой сервисной точки еще нет фотографий
          </Typography>
        </Box>
      )}

      {/* Диалог подтверждения удаления */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы уверены, что хотите удалить эту фотографию? Это действие нельзя отменить.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ServicePointPhotosPage; 