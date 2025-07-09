import React, { useState } from 'react';
import {
  Box,
  CardMedia,
  IconButton,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  useTheme,
  Fade,
  Backdrop,
  Stack
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Close as CloseIcon,
  PhotoLibrary as PhotoLibraryIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface Photo {
  id: number;
  url: string;
  description?: string;
  is_main: boolean;
  sort_order: number;
}

interface PhotoGalleryProps {
  photos: Photo[];
  height?: number | string;
  showCounter?: boolean;
  fallbackIcon?: React.ReactNode;
}

/**
 * Компонент фотогалереи для сервисных точек
 * Отображает главную фотографию крупно с возможностью просмотра всех фото в модальном окне
 */
const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  photos = [],
  height = 200,
  showCounter = true,
  fallbackIcon = '🚗'
}) => {
  const theme = useTheme();
  const { t } = useTranslation('components');
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  // Сортируем фотографии: главная первая, затем по sort_order
  const sortedPhotos = [...photos].sort((a, b) => {
    if (a.is_main && !b.is_main) return -1;
    if (!a.is_main && b.is_main) return 1;
    return a.sort_order - b.sort_order;
  });

  const mainPhoto = sortedPhotos[0];
  const hasPhotos = sortedPhotos.length > 0;

  const handleOpenModal = () => {
    if (hasPhotos) {
      setModalOpen(true);
      setCurrentPhotoIndex(0);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handlePrevPhoto = () => {
    setCurrentPhotoIndex((prev) => 
      prev === 0 ? sortedPhotos.length - 1 : prev - 1
    );
  };

  const handleNextPhoto = () => {
    setCurrentPhotoIndex((prev) => 
      prev === sortedPhotos.length - 1 ? 0 : prev + 1
    );
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowLeft') {
      handlePrevPhoto();
    } else if (event.key === 'ArrowRight') {
      handleNextPhoto();
    } else if (event.key === 'Escape') {
      handleCloseModal();
    }
  };

  return (
    <>
      {/* Основное изображение */}
      <Box
        sx={{
          position: 'relative',
          height,
          cursor: hasPhotos ? 'pointer' : 'default',
          overflow: 'hidden',
          borderRadius: 1,
          '&:hover .photo-overlay': {
            opacity: hasPhotos ? 1 : 0,
          }
        }}
        onClick={handleOpenModal}
      >
        {hasPhotos ? (
          <CardMedia
            component="img"
            image={mainPhoto.url}
            alt={mainPhoto.description || t('photoGallery.servicePointPhoto')}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)'
              }
            }}
          />
        ) : (
          <Box
            sx={{
              height: '100%',
              background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '4rem'
            }}
          >
            {fallbackIcon}
          </Box>
        )}

        {/* Оверлей с информацией о количестве фото */}
        {hasPhotos && sortedPhotos.length > 1 && showCounter && (
          <Box
            className="photo-overlay"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              fontSize: '0.875rem',
              fontWeight: 500,
              opacity: 0,
              transition: 'opacity 0.3s ease'
            }}
          >
            <PhotoLibraryIcon sx={{ fontSize: '1rem' }} />
            {sortedPhotos.length}
          </Box>
        )}

        {/* Индикатор главного фото */}
        {hasPhotos && mainPhoto.is_main && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 8,
              left: 8,
              bgcolor: 'rgba(76, 175, 80, 0.9)',
              color: 'white',
              px: 1,
              py: 0.25,
              borderRadius: 0.5,
              fontSize: '0.75rem',
              fontWeight: 600
            }}
          >
            {t('photoGallery.mainPhoto')}
          </Box>
        )}
      </Box>

      {/* Модальное окно с галереей */}
      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'rgba(0, 0, 0, 0.95)',
            boxShadow: 'none',
            overflow: 'visible'
          }
        }}
      >
        <DialogContent
          sx={{
            p: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative'
          }}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {/* Кнопка закрытия */}
          <IconButton
            onClick={handleCloseModal}
            sx={{
              position: 'absolute',
              top: -60,
              right: 0,
              color: 'white',
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.2)'
              },
              zIndex: 1
            }}
          >
            <CloseIcon />
          </IconButton>

          {/* Основное изображение */}
          <Box
            sx={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '80vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <img
              src={sortedPhotos[currentPhotoIndex]?.url}
              alt={sortedPhotos[currentPhotoIndex]?.description || t('photoGallery.servicePointPhoto')}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                borderRadius: theme.spacing(1)
              }}
            />

            {/* Навигационные кнопки */}
            {sortedPhotos.length > 1 && (
              <>
                <IconButton
                  onClick={handlePrevPhoto}
                  sx={{
                    position: 'absolute',
                    left: -60,
                    color: 'white',
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.2)'
                    }
                  }}
                >
                  <ChevronLeftIcon />
                </IconButton>

                <IconButton
                  onClick={handleNextPhoto}
                  sx={{
                    position: 'absolute',
                    right: -60,
                    color: 'white',
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.2)'
                    }
                  }}
                >
                  <ChevronRightIcon />
                </IconButton>
              </>
            )}
          </Box>

          {/* Информация о фото */}
          <Box
            sx={{
              mt: 2,
              textAlign: 'center',
              color: 'white'
            }}
          >
            {sortedPhotos[currentPhotoIndex]?.description && (
              <Typography variant="body1" sx={{ mb: 1 }}>
                {sortedPhotos[currentPhotoIndex].description}
              </Typography>
            )}
            
            {sortedPhotos.length > 1 && (
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                {t('photoGallery.photoCounter', { current: currentPhotoIndex + 1, total: sortedPhotos.length })}
              </Typography>
            )}
          </Box>

          {/* Миниатюры (если больше 1 фото) */}
          {sortedPhotos.length > 1 && (
            <Stack
              direction="row"
              spacing={1}
              sx={{
                mt: 2,
                maxWidth: '90vw',
                overflowX: 'auto',
                pb: 1
              }}
            >
              {sortedPhotos.map((photo, index) => (
                <Box
                  key={photo.id}
                  onClick={() => setCurrentPhotoIndex(index)}
                  sx={{
                    width: 60,
                    height: 60,
                    flexShrink: 0,
                    cursor: 'pointer',
                    border: index === currentPhotoIndex ? '2px solid white' : '2px solid transparent',
                    borderRadius: 1,
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    opacity: index === currentPhotoIndex ? 1 : 0.7,
                    '&:hover': {
                      opacity: 1,
                      transform: 'scale(1.05)'
                    }
                  }}
                >
                  <img
                    src={photo.url}
                    alt={photo.description || t('photoGallery.photoNumber', { number: index + 1 })}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </Box>
              ))}
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button
            onClick={handleCloseModal}
            variant="contained"
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              color: 'black',
              '&:hover': {
                bgcolor: 'white'
              }
            }}
          >
            {t('photoGallery.close')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PhotoGallery; 