import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  Button
} from '@mui/material';
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
        {/* Заголовок карточки - только диаметр */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h4" component="h3" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
            Диаметр R{diameterGroup.diameter}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            1 конфигурация
          </Typography>
        </Box>

        {/* Доступные размеры */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, textAlign: 'center' }}>
            Доступные размеры (кликните для поиска предложений)
          </Typography>
          
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap justifyContent="center">
            {uniqueSizes.map((size, index) => (
              <Button
                key={index}
                variant="outlined"
                size="medium"
                onClick={() => handleSizeClick(size)}
                sx={{
                  minWidth: 'auto',
                  px: 3,
                  py: 1,
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  borderRadius: 3,
                  textTransform: 'none',
                  borderWidth: 2,
                  '&:hover': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                    transform: 'scale(1.05)',
                    borderWidth: 2
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                {size.display}
              </Button>
            ))}
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TireDiameterCard;