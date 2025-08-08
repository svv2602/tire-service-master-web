import React from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Alert,
  AlertTitle,
  Stack,
  Divider
} from '@mui/material';
import {
  DirectionsCar as CarIcon,
  Settings as SettingsIcon,
  LocalOffer as OfferIcon,
  Category as CategoryIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import type { CarTireSearchResponse, CarBrand, CarModel, TireSize, TireOffer } from '../../../api/carTireSearch.api';

interface CarTireSearchResultsProps {
  result: CarTireSearchResponse;
  onBrandSelect?: (brandId: number) => void;
  onModelSelect?: (modelId: number) => void;
  onTireSizeSelect?: (tireSize: TireSize) => void;
  onTireOfferSelect?: (offer: TireOffer) => void;
  onRetry?: () => void;
}

const CarTireSearchResults: React.FC<CarTireSearchResultsProps> = ({
  result,
  onBrandSelect,
  onModelSelect,
  onTireSizeSelect,
  onTireOfferSelect,
  onRetry
}) => {
  const { t } = useTranslation(['tireSearch', 'common']);

  // Получение локализованного названия сезона
  const getSeasonLabel = (season: string): string => {
    switch (season) {
      case 'winter': return 'Зимние';
      case 'summer': return 'Летние';
      case 'all_season': return 'Всесезонные';
      default: return season;
    }
  };

  // Рендер результатов в зависимости от статуса
  const renderContent = () => {
    switch (result.status) {
      case 'brand_not_found':
        return (
          <Alert severity="warning">
            <AlertTitle>Марка автомобиля не найдена</AlertTitle>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {result.message}
            </Typography>
            {result.suggestions && result.suggestions.length > 0 && (
              <>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>
                  Попробуйте эти популярные марки:
                </Typography>
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                  {result.suggestions.map((brand) => (
                    <Chip
                      key={brand.id}
                      label={brand.name}
                      variant="outlined"
                      clickable
                      onClick={() => onBrandSelect?.(brand.id)}
                      icon={<CarIcon />}
                    />
                  ))}
                </Stack>
              </>
            )}
          </Alert>
        );

      case 'brand_ambiguous':
        return (
          <Alert severity="info">
            <AlertTitle>Уточните марку автомобиля</AlertTitle>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {result.message}
            </Typography>
            <Grid container spacing={2}>
              {result.brands?.map((brand) => (
                <Grid item xs={12} sm={6} md={4} key={brand.id}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': { 
                        bgcolor: 'action.hover',
                        boxShadow: 2
                      }
                    }}
                    onClick={() => onBrandSelect?.(brand.id)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <CarIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="h6">{brand.name}</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Моделей: {brand.models_count}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Размеров шин: {brand.configs_count}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Alert>
        );

      case 'model_required':
        return (
          <Alert severity="info">
            <AlertTitle>Укажите модель автомобиля</AlertTitle>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {result.message}
            </Typography>
            {result.popular_models && result.popular_models.length > 0 && (
              <>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>
                  Популярные модели {result.brand?.name}:
                </Typography>
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                  {result.popular_models.map((model) => (
                    <Chip
                      key={model.id}
                      label={model.name}
                      variant="outlined"
                      clickable
                      onClick={() => onModelSelect?.(model.id)}
                      icon={<SettingsIcon />}
                    />
                  ))}
                </Stack>
              </>
            )}
          </Alert>
        );

      case 'model_not_found':
        return (
          <Alert severity="warning">
            <AlertTitle>Модель не найдена</AlertTitle>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {result.message}
            </Typography>
            {result.available_models && result.available_models.length > 0 && (
              <>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>
                  Доступные модели {result.brand?.name}:
                </Typography>
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                  {result.available_models.slice(0, 10).map((model) => (
                    <Chip
                      key={model.id}
                      label={model.name}
                      variant="outlined"
                      clickable
                      onClick={() => onModelSelect?.(model.id)}
                      icon={<SettingsIcon />}
                    />
                  ))}
                </Stack>
              </>
            )}
          </Alert>
        );

      case 'model_ambiguous':
        return (
          <Alert severity="info">
            <AlertTitle>Уточните модель автомобиля</AlertTitle>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {result.message}
            </Typography>
            <Grid container spacing={2}>
              {result.models?.map((model) => (
                <Grid item xs={12} sm={6} md={4} key={model.id}>
                  <Card 
                    variant="outlined"
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': { 
                        bgcolor: 'action.hover',
                        boxShadow: 2
                      }
                    }}
                    onClick={() => onModelSelect?.(model.id)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <SettingsIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="h6">{model.name}</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Бренд: {model.brand_name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Размеров шин: {model.configs_count}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Alert>
        );

      case 'sizes_not_found':
        return (
          <Alert severity="warning">
            <AlertTitle>Размеры шин не найдены</AlertTitle>
            <Typography variant="body2">
              {result.message}
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Button variant="outlined" onClick={onRetry}>
                Попробовать другой поиск
              </Button>
            </Box>
          </Alert>
        );

      case 'success':
        return (
          <Box>
            <Alert severity="success" sx={{ mb: 3 }}>
              <AlertTitle>Найдены размеры шин</AlertTitle>
              <Typography variant="body2">
                {result.message}
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Chip 
                  icon={<CarIcon />} 
                  label={`${result.brand?.name} ${result.model?.name}`}
                  color="primary"
                  size="small"
                />
                {result.year && (
                  <Chip 
                    label={`${result.year} год`}
                    color="secondary"
                    size="small"
                    sx={{ ml: 1 }}
                  />
                )}
              </Box>
            </Alert>

            {/* Размеры шин */}
            {result.tire_sizes && result.tire_sizes.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <CategoryIcon sx={{ mr: 1 }} />
                  Доступные размеры ({result.tire_sizes.length})
                </Typography>
                <Grid container spacing={2}>
                  {result.tire_sizes.map((tireSize, index) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                      <Card 
                        variant="outlined"
                        sx={{ 
                          cursor: 'pointer',
                          '&:hover': { 
                            bgcolor: 'action.hover',
                            boxShadow: 2
                          }
                        }}
                        onClick={() => onTireSizeSelect?.(tireSize)}
                      >
                        <CardContent sx={{ textAlign: 'center' }}>
                          <Typography variant="h6" color="primary">
                            {tireSize.width}/{tireSize.height}R{tireSize.diameter}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {tireSize.type === 'stock' ? 'Стандартный' : tireSize.type}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {tireSize.year_from}-{tireSize.year_to || 'н.в.'}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {/* Предложения шин */}
            {result.tire_offers && result.tire_offers.length > 0 && (
              <Box>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <OfferIcon sx={{ mr: 1 }} />
                  Доступные предложения ({result.tire_offers.length})
                </Typography>
                <Grid container spacing={2}>
                  {result.tire_offers.map((offer) => (
                    <Grid item xs={12} sm={6} md={4} key={offer.id}>
                      <Card 
                        variant="outlined"
                        sx={{ 
                          cursor: 'pointer',
                          '&:hover': { 
                            bgcolor: 'action.hover',
                            boxShadow: 2
                          }
                        }}
                        onClick={() => onTireOfferSelect?.(offer)}
                      >
                        <CardContent>
                          <Typography variant="h6" color="primary" noWrap>
                            {offer.brand} {offer.model}
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                            {offer.size}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {getSeasonLabel(offer.season)}
                          </Typography>
                          <Typography variant="h6" color="success.main" sx={{ mt: 1 }}>
                            {offer.price?.toLocaleString()} грн
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Box>
        );

      default:
        return (
          <Alert severity="error">
            <AlertTitle>Неизвестная ошибка</AlertTitle>
            <Typography variant="body2">
              Произошла неизвестная ошибка при поиске. Попробуйте еще раз.
            </Typography>
          </Alert>
        );
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {renderContent()}
    </Box>
  );
};

export default CarTireSearchResults;