import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Avatar,
  Stack,
  Button,
  Divider
} from '@mui/material';
import {
  DirectionsCar,
  Build,
  CalendarToday
} from '@mui/icons-material';
import type { TireSearchResult, TireSize, TireDiameterGroup } from '../../../types/tireSearch';

export interface TireDiameterCardProps {
  diameterGroup: TireDiameterGroup;
  onSizeClick: (size: TireSize, searchParams: any) => void;
  searchParams?: {
    brand?: string;
    seasonality?: string;
    manufacturer?: string;
  };
  className?: string;
}

const TireDiameterCard: React.FC<TireDiameterCardProps> = ({
  diameterGroup,
  onSizeClick,
  searchParams = {},
  className
}) => {
  // Группируем размеры по уникальности (width/height/diameter)
  const uniqueSizes = React.useMemo(() => {
    const sizeMap = new Map<string, TireSize>();
    
    diameterGroup.sizes.forEach(size => {
      const key = `${size.width}/${size.height}R${size.diameter}`;
      if (!sizeMap.has(key)) {
        sizeMap.set(key, size);
      }
    });
    
    return Array.from(sizeMap.values()).sort((a, b) => {
      // Сортируем по ширине, затем по высоте
      if (a.width !== b.width) return a.width - b.width;
      return a.height - b.height;
    });
  }, [diameterGroup.sizes]);

  // Получаем первую букву основного бренда для аватара
  const getMainBrandLetter = () => {
    if (diameterGroup.brands.length === 0) return '?';
    return diameterGroup.brands[0].charAt(0).toUpperCase();
  };

  // Обработка клика по размеру
  const handleSizeClick = (size: TireSize) => {
    onSizeClick(size, searchParams);
  };

  return (
    <Card
      className={className}
      sx={{
        height: '100%',
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        },
        borderRadius: 2
      }}
    >
      <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Заголовок карточки */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar
            sx={{
              width: 56,
              height: 56,
              bgcolor: 'primary.main',
              fontSize: '1.5rem',
              fontWeight: 700
            }}
          >
            {getMainBrandLetter()}
          </Avatar>
          
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h5" component="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
              Диаметр R{diameterGroup.diameter}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
              <DirectionsCar sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {diameterGroup.configurations.length} конфигурац{diameterGroup.configurations.length > 1 ? 'ий' : 'ия'}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
              <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {diameterGroup.yearRange.from} - {diameterGroup.yearRange.to}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Build sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {uniqueSizes.length} размер{uniqueSizes.length > 1 ? 'ов' : ''} шин
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Бренды */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Бренды:
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {diameterGroup.brands.slice(0, 4).map((brand, index) => (
              <Chip
                key={index}
                label={brand}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.75rem' }}
              />
            ))}
            {diameterGroup.brands.length > 4 && (
              <Chip
                label={`+${diameterGroup.brands.length - 4}`}
                size="small"
                variant="outlined"
                color="primary"
                sx={{ fontSize: '0.75rem' }}
              />
            )}
          </Stack>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Доступные размеры */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
            Доступные размеры (кликните для поиска предложений):
          </Typography>
          
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {uniqueSizes.map((size, index) => (
              <Button
                key={index}
                variant="outlined"
                size="small"
                onClick={() => handleSizeClick(size)}
                sx={{
                  minWidth: 'auto',
                  px: 2,
                  py: 0.5,
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  borderRadius: 2,
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                    transform: 'scale(1.05)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                {size.display}
              </Button>
            ))}
          </Stack>
        </Box>

        {/* Дополнительная информация */}
        {(searchParams.brand || searchParams.seasonality) && (
          <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              Параметры поиска:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {searchParams.brand && (
                <Chip
                  label={`Бренд: ${searchParams.brand}`}
                  size="small"
                  color="primary"
                  variant="filled"
                  sx={{ fontSize: '0.7rem' }}
                />
              )}
              {searchParams.seasonality && (
                <Chip
                  label={`Сезон: ${searchParams.seasonality}`}
                  size="small"
                  color="secondary"
                  variant="filled"
                  sx={{ fontSize: '0.7rem' }}
                />
              )}
            </Stack>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default TireDiameterCard;