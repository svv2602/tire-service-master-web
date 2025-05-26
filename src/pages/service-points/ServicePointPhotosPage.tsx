import React, { useState } from 'react';
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
  CardContent,
  CardActions,
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
import { useNavigate, useParams } from 'react-router-dom';
import { 
  useGetServicePointByIdQuery,
  useGetServicePointPhotosQuery,
  useUploadServicePointPhotoMutation,
  useDeleteServicePointPhotoMutation,
} from '../../api';

const ServicePointPhotosPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [photoToDelete, setPhotoToDelete] = useState<number | null>(null);

  const { 
    data: servicePointResponse,
    isLoading: servicePointLoading,
    error: servicePointError 
  } = useGetServicePointByIdQuery(Number(id), {
    skip: !id
  });

  const {
    data: photos,
    isLoading: photosLoading,
    error: photosError,
    refetch: refetchPhotos
  } = useGetServicePointPhotosQuery(Number(id), {
    skip: !id
  });

  const [uploadPhoto] = useUploadServicePointPhotoMutation();
  const [deletePhoto] = useDeleteServicePointPhotoMutation();

  const servicePoint = servicePointResponse?.data;
  const isLoading = servicePointLoading || photosLoading;
  const error = servicePointError || photosError;

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !files.length || !id) return;
    
    setIsUploading(true);
    
    const formData = new FormData();
    formData.append('photo', files[0]);
    
    try {
      await uploadPhoto({ id: Number(id), photo: formData }).unwrap();
      await refetchPhotos();
    } catch (error) {
      console.error('Ошибка при загрузке фото:', error);
    } finally {
      setIsUploading(false);
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
    
    try {
      await deletePhoto({ servicePointId: Number(id), photoId: photoToDelete }).unwrap();
      await refetchPhotos();
    } catch (error) {
      console.error('Ошибка при удалении фото:', error);
    } finally {
      setDeleteDialogOpen(false);
      setPhotoToDelete(null);
    }
  };

  const handleBack = () => {
    navigate(`/service-points/${id}`);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error.toString()}
        </Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack}>
          Вернуться назад
        </Button>
      </Box>
    );
  }

  if (!servicePoint) {
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
          Фотографии: {servicePoint.name}
        </Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack}>
          Назад к точке
        </Button>
      </Box>

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
              <CircularProgress />
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

      {photosLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : photos && photos.length > 0 ? (
        <Grid container spacing={3}>
          {photos.map((photo) => (
            <Grid item xs={12} sm={6} md={4} key={photo.id}>
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
                    onClick={() => handleDeleteClick(photo.id)}
                    aria-label="удалить фото"
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography variant="body1" color="text.secondary" align="center">
          Нет загруженных фотографий
        </Typography>
      )}

      {/* Диалог подтверждения удаления */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы действительно хотите удалить это фото? Это действие нельзя будет отменить.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ServicePointPhotosPage; 