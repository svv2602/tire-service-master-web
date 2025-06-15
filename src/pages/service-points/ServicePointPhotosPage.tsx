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
  Add as AddIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useGetServicePointPhotosQuery,
  useUploadServicePointPhotoMutation,
  useDeleteServicePointPhotoMutation,
} from '../../api';
import { ServicePointPhoto } from '../../types/servicePoint';
import { HiddenElement } from '../../components/styled/CommonComponents';

const ServicePointPhotosPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [photoToDelete, setPhotoToDelete] = useState<string | null>(null);

  const {
    data: photosResponse,
    isLoading: photosLoading,
    error: photosError,
    refetch: refetchPhotos
  } = useGetServicePointPhotosQuery(id || '', {
    skip: !id
  });

  const [uploadPhoto] = useUploadServicePointPhotoMutation();
  const [deletePhoto] = useDeleteServicePointPhotoMutation();

  const photos = photosResponse;
  const isLoading = photosLoading;
  const error = photosError;

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !files.length || !id) return;
    
    setIsUploading(true);
    
    try {
      await uploadPhoto({ servicePointId: id, file: files[0] }).unwrap();
      await refetchPhotos();
    } catch (error) {
      console.error('Ошибка при загрузке фото:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteClick = (photoId: string) => {
    setPhotoToDelete(photoId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!photoToDelete || !id) {
      setDeleteDialogOpen(false);
      return;
    }
    
    try {
      await deletePhoto({ servicePointId: id, photoId: photoToDelete }).unwrap();
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

  if (!photos || !photos.data || !Array.isArray(photos.data) || photos.data.length === 0) {
    return (
      <Box>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Нет загруженных фотографий
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
          Фотографии: {id}
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
          <HiddenElement
            component="input"
            accept="image/*"
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
      ) : photos && photos.data && Array.isArray(photos.data) && photos.data.length > 0 ? (
        <Grid container spacing={3}>
          {photos.data.map((photo: any) => (
            <Grid item xs={12} sm={6} md={4} key={photo.id}>
              <Card>
                <CardMedia
                  component="img"
                  height="200"
                  image={photo.url}
                  alt={`Фото ${photo.id}`}
                />
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    {photo.description || `Фото #${photo.id}`}
                  </Typography>
                </CardContent>
                <CardActions>
                  <IconButton 
                    href={photo.url} 
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