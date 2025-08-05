import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  Button,
  CircularProgress,
  Alert,
  Skeleton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGetSupplierSizesByDiameterQuery, type SupplierTireSize, type SizeFilter } from '../../../api/supplierSizes.api';
import { createTireOffersUrl } from '../../../utils/tireSearchUtils';

export interface SupplierTireDiameterCardProps {
  diameter: string; // Например: "17" или "R17"
  searchParams?: {
    brand?: string;
    seasonality?: string;
    manufacturer?: string;
  };
  filterSizes?: SizeFilter[]; // Фильтр по конкретным размерам из результатов поиска
  className?: string;
}

const SupplierTireDiameterCard: React.FC<SupplierTireDiameterCardProps> = ({
  diameter,
  searchParams = {},
  filterSizes,
  className
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation('tireSearch');
  
  // Нормализуем диаметр
  const normalizedDiameter = diameter.replace(/[^0-9]/g, '');
  
  // Запрос размеров из прайсов поставщиков с фильтрацией
  const {
    data: sizesData,
    isLoading,
    error,
    isSuccess
  } = useGetSupplierSizesByDiameterQuery(
    { 
      diameter: normalizedDiameter,
      sizes: filterSizes 
    },
    {
      skip: !normalizedDiameter,
      refetchOnMountOrArgChange: true
    }
  );

  // Обработка клика по размеру - переход к предложениям
  const handleSizeClick = (size: SupplierTireSize) => {
    // Создаем объект размера в формате TireSize для совместимости
    const tireSize = {
      width: size.width,
      height: size.height,
      diameter: size.diameter,
      type: 'stock' as const, // Добавляем обязательное поле type
      display: size.display
    };
    
    const offersUrl = createTireOffersUrl(tireSize, searchParams);
    navigate(offersUrl);
  };

  // Рендер состояния загрузки
  const renderLoading = () => (
    <Card className={className} sx={{ height: '100%', borderRadius: 2 }}>
      <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Skeleton variant="text" width="60%" height={40} sx={{ mx: 'auto', mb: 1 }} />
          <Skeleton variant="text" width="40%" height={20} sx={{ mx: 'auto' }} />
        </Box>
        
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Skeleton variant="text" width="80%" height={30} sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} variant="rectangular" width={120} height={36} sx={{ borderRadius: 3 }} />
            ))}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  // Рендер состояния ошибки
  const renderError = () => (
    <Card className={className} sx={{ height: '100%', borderRadius: 2 }}>
      <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h4" component="h3" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
            Диаметр R{normalizedDiameter}
          </Typography>
        </Box>
        
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="body2">
            {t('supplierSizes.error')}
          </Typography>
        </Alert>
      </CardContent>
    </Card>
  );

  // Рендер пустого состояния
  const renderEmpty = () => (
    <Card className={className} sx={{ height: '100%', borderRadius: 2 }}>
      <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h4" component="h3" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
            Диаметр R{normalizedDiameter}
          </Typography>
        </Box>
        
        <Alert severity="info" sx={{ textAlign: 'center' }}>
          <Typography variant="body2">
            {t('supplierSizes.empty', { diameter: normalizedDiameter })}
          </Typography>
        </Alert>
      </CardContent>
    </Card>
  );

  // Основной рендер с данными
  const renderContent = () => {
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
              Диаметр R{normalizedDiameter}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('supplierSizes.available', { count: sizesData?.total_sizes || 0 })}
              {sizesData?.filter_applied && (
                <Typography component="span" variant="caption" sx={{ display: 'block', color: 'primary.main', mt: 0.5 }}>
                  {t('supplierSizes.filteredFromOriginal', { count: sizesData?.original_sizes_count || 0 })}
                </Typography>
              )}
            </Typography>
          </Box>

          {/* Доступные размеры */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, textAlign: 'center' }}>
              {t('supplierSizes.clickToSearch')}
            </Typography>
            
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap justifyContent="center">
              {(sizesData?.sizes || []).map((size, index) => (
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
            
            {/* Источник данных */}
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                {sizesData?.filter_applied 
                  ? t('supplierSizes.dataSourceFiltered')
                  : t('supplierSizes.dataSource')
                }
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };

  // Условный рендер в зависимости от состояния
  if (isLoading) return renderLoading();
  if (error) return renderError();
  if (isSuccess) {
    // Если нет данных или размеров, не рендерим компонент
    if (!sizesData?.sizes || sizesData.sizes.length === 0) {
      return null;
    }
    return renderContent();
  }
  
  return null;
};

export default SupplierTireDiameterCard;