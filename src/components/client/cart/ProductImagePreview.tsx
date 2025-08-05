import React, { useState } from 'react';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Close as CloseIcon,
  ZoomIn as ZoomInIcon,
  ShoppingCart as ShoppingCartIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface ProductImagePreviewProps {
  imageUrl?: string;
  productName: string;
  brand: string;
  model: string;
  size?: string;
  season?: string;
  onClick?: () => void;
  width?: number;
  height?: number;
}

export const ProductImagePreview: React.FC<ProductImagePreviewProps> = ({
  imageUrl,
  productName,
  brand,
  model,
  size,
  season,
  onClick,
  width = 120,
  height = 120,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageClick = () => {
    if (onClick) {
      onClick();
    } else if (imageUrl && !imageError) {
      setDialogOpen(true);
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const renderImage = (isDialog = false) => {
    const imageSize = isDialog ? (isMobile ? 280 : 400) : Math.min(width, height);
    
    if (!imageUrl || imageError) {
      return (
        <Box
          sx={{
            width: imageSize,
            height: imageSize,
            bgcolor: 'grey.100',
            border: '2px dashed',
            borderColor: 'grey.300',
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: isDialog ? 'default' : (!imageUrl || imageError) ? 'default' : 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': !isDialog ? {
              borderColor: 'primary.main',
              bgcolor: 'grey.50',
            } : {},
          }}
          onClick={!isDialog && imageUrl && !imageError ? handleImageClick : undefined}
        >
          <ShoppingCartIcon 
            sx={{ 
              fontSize: isDialog ? 48 : 32, 
              color: 'grey.400',
              mb: 1 
            }} 
          />
          <Typography 
            variant={isDialog ? "body1" : "caption"} 
            color="text.secondary"
            textAlign="center"
            sx={{ px: 1 }}
          >
            {isDialog ? 'Изображение недоступно' : 'Нет фото'}
          </Typography>
        </Box>
      );
    }

    return (
      <Box
        sx={{
          position: 'relative',
          width: imageSize,
          height: imageSize,
          borderRadius: 2,
          overflow: 'hidden',
          cursor: isDialog ? 'default' : 'pointer',
          transition: 'all 0.2s ease',
          '&:hover': !isDialog ? {
            transform: 'scale(1.02)',
            boxShadow: theme.shadows[4],
          } : {},
        }}
        onClick={!isDialog ? handleImageClick : undefined}
      >
        <img
          src={imageUrl}
          alt={`${brand} ${model}`}
          onError={handleImageError}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: theme.spacing(1),
          }}
        />
        
        {!isDialog && (
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: 'rgba(0, 0, 0, 0.6)',
              borderRadius: '50%',
              p: 0.5,
              opacity: 0,
              transition: 'opacity 0.2s ease',
              '.MuiBox-root:hover &': {
                opacity: 1,
              },
            }}
          >
            <ZoomInIcon sx={{ fontSize: 16, color: 'white' }} />
          </Box>
        )}
      </Box>
    );
  };

  return (
    <>
      {renderImage()}
      
      {/* Диалог предпросмотра */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" component="div">
              {t('common.preview', 'Предпросмотр изображения')}
            </Typography>
            <IconButton
              onClick={() => setDialogOpen(false)}
              size="small"
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ textAlign: 'center', pb: 3 }}>
          {renderImage(true)}
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              {brand} {model}
            </Typography>
            
            {size && (
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {t('cart.items.size', 'Размер')}: {size}
              </Typography>
            )}
            
            {season && (
              <Typography variant="body2" color="text.secondary">
                {t('cart.items.season', 'Сезон')}: {season}
              </Typography>
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductImagePreview;