/**
 * ServicePointPhotosPage - Страница управления фотографиями точки обслуживания
 * 
 * Функциональность:
 * - Просмотр всех фотографий точки обслуживания
 * - Загрузка новых фотографий
 * - Удаление существующих фотографий
 * - Просмотр фотографий в полном размере
 * - Централизованная система стилей для консистентного дизайна
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  CircularProgress,
  IconButton,
  CardMedia,
  CardContent,
  CardActions,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  useTheme,
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
  useGetServicePointPhotosQuery,
  useUploadServicePointPhotoMutation,
  useDeleteServicePointPhotoMutation,
} from '../../api';
import { ServicePointPhoto } from '../../types/servicePoint';

// Импорт централизованной системы стилей
import { 
  getTablePageStyles,
  SIZES 
} from '../../styles';

// Импорт UI компонентов
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { Card } from '../../components/ui/Card';

/**
 * Компонент скрытого элемента для загрузки файлов
 */
const HiddenElement: React.FC<{
  component: string;
  accept: string;
  id: string;
  type: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
}> = ({ component, accept, id, type, onChange, disabled }) => (
  <input
    style={{ display: 'none' }}
    accept={accept}
    id={id}
    type={type}
    onChange={onChange}
    disabled={disabled}
  />
);

const ServicePointPhotosPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const tablePageStyles = getTablePageStyles(theme);
  
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
      <Box sx={tablePageStyles.loadingContainer}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={tablePageStyles.container}>
        <Alert severity="error" sx={tablePageStyles.errorAlert}>
          {error.toString()}
        </Alert>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={handleBack}
          sx={tablePageStyles.secondaryButton}
        >
          Вернуться назад
        </Button>
      </Box>
    );
  }

  if (!photos || !photos.data || !Array.isArray(photos.data) || photos.data.length === 0) {
    return (
      <Box sx={tablePageStyles.container}>
        <Box sx={tablePageStyles.emptyStateContainer}>
          <PhotoCameraIcon sx={tablePageStyles.emptyStateIcon} />
          <Typography variant="h6" sx={tablePageStyles.emptyStateTitle}>
            Нет загруженных фотографий
          </Typography>
          <Typography variant="body2" sx={tablePageStyles.emptyStateDescription}>
            Загрузите первую фотографию для этой точки обслуживания
          </Typography>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate('/service-points')}
            sx={tablePageStyles.primaryButton}
          >
            Вернуться к списку
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={tablePageStyles.container}>
      {/* Заголовок страницы */}
      <Box sx={tablePageStyles.headerContainer}>
        <Typography 
          variant="h4" 
          sx={tablePageStyles.title}
        >
          Фотографии точки обслуживания
        </Typography>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={handleBack}
          sx={tablePageStyles.secondaryButton}
        >
          Назад к точке
        </Button>
      </Box>

      {/* Блок загрузки новой фотографии */}
      <Card sx={{ 
        ...tablePageStyles.card, 
        marginBottom: SIZES.spacing.lg 
      }}>
        <CardContent sx={{ padding: SIZES.spacing.lg }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginBottom: SIZES.spacing.md 
          }}>
            <PhotoCameraIcon sx={{ 
              marginRight: SIZES.spacing.sm, 
              color: theme.palette.primary.main,
              fontSize: SIZES.fontSize.lg
            }} />
            <Typography 
              variant="h6" 
              sx={{
                fontSize: SIZES.fontSize.lg,
                fontWeight: 600
              }}
            >
              Загрузить новую фотографию
            </Typography>
          </Box>
          
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            padding: SIZES.spacing.md,
            border: `2px dashed ${theme.palette.divider}`,
            borderRadius: SIZES.borderRadius.md,
            backgroundColor: theme.palette.action.hover
          }}>
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
                sx={tablePageStyles.primaryButton}
              >
                Выбрать фото
              </Button>
            </label>
            
            {isUploading && (
              <Box sx={{ 
                marginTop: SIZES.spacing.md, 
                display: 'flex',
                alignItems: 'center',
                gap: SIZES.spacing.sm
              }}>
                <CircularProgress size={20} />
                <Typography variant="body2" color="text.secondary">
                  Загрузка...
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Заголовок галереи */}
      <Box sx={{ marginBottom: SIZES.spacing.lg }}>
        <Typography 
          variant="h6" 
          sx={{
            fontSize: SIZES.fontSize.lg,
            fontWeight: 600,
            marginBottom: SIZES.spacing.sm
          }}
        >
          Галерея фотографий ({photos.data.length})
        </Typography>
      </Box>

      {/* Галерея фотографий */}
      {photosLoading ? (
        <Box sx={tablePageStyles.loadingContainer}>
          <CircularProgress />
        </Box>
      ) : photos && photos.data && Array.isArray(photos.data) && photos.data.length > 0 ? (
        <Grid container spacing={SIZES.spacing.md}>
          {photos.data.map((photo: any) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={photo.id}>
              <Card sx={{
                ...tablePageStyles.card,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  boxShadow: theme.shadows[4],
                  transform: 'translateY(-2px)'
                }
              }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={photo.url || photo.photo_url}
                  alt={photo.description || 'Фото точки обслуживания'}
                  sx={{
                    objectFit: 'cover',
                    borderRadius: `${SIZES.borderRadius.md}px ${SIZES.borderRadius.md}px 0 0`
                  }}
                />
                <CardContent sx={{ 
                  flexGrow: 1, 
                  padding: SIZES.spacing.md 
                }}>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{
                      fontSize: SIZES.fontSize.sm,
                      lineHeight: 1.4
                    }}
                  >
                    {photo.description || 'Без описания'}
                  </Typography>
                  {photo.is_main && (
                    <Typography 
                      variant="caption" 
                      sx={{
                        color: theme.palette.primary.main,
                        fontWeight: 600,
                        marginTop: SIZES.spacing.xs,
                        display: 'block'
                      }}
                    >
                      Главное фото
                    </Typography>
                  )}
                </CardContent>
                <CardActions sx={{ 
                  justifyContent: 'space-between',
                  padding: SIZES.spacing.sm
                }}>
                  <IconButton
                    size="small"
                    onClick={() => window.open(photo.url || photo.photo_url, '_blank')}
                    sx={{
                      color: theme.palette.primary.main,
                      '&:hover': {
                        backgroundColor: `${theme.palette.primary.main}15`
                      }
                    }}
                  >
                    <OpenInNewIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteClick(photo.id)}
                    sx={{
                      color: theme.palette.error.main,
                      '&:hover': {
                        backgroundColor: `${theme.palette.error.main}15`
                      }
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : null}

      {/* Диалог подтверждения удаления */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: tablePageStyles.dialogPaper
        }}
      >
        <DialogTitle sx={tablePageStyles.dialogTitle}>
          Подтверждение удаления
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={tablePageStyles.dialogText}>
            Вы действительно хотите удалить эту фотографию?
            Это действие нельзя будет отменить.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={tablePageStyles.dialogActions}>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            sx={tablePageStyles.secondaryButton}
          >
            Отмена
          </Button>
          <Button 
            onClick={handleConfirmDelete}
            variant="contained"
            sx={tablePageStyles.dangerButton}
          >
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ServicePointPhotosPage; 