import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Button,
  IconButton,
  Chip,
  Avatar,
  Divider,
  Stack,
  Tooltip
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  DirectionsCar,
  Build,
  CalendarToday,
  LocationOn,
  Info
} from '@mui/icons-material';
import TireSizeChip from '../TireSizeChip/TireSizeChip';
import type { TireConfigurationCardProps } from '../../../types/tireSearch';
import { formatYearRange } from '../../../types/tireSearch';

const TireConfigurationCard: React.FC<TireConfigurationCardProps> = ({
  configuration,
  onClick,
  onFavoriteToggle,
  isFavorite = false,
  showYear = true,
  showTireSizes = true,
  compact = false,
  className
}) => {
  // Группируем размеры шин по типу
  const stockSizes = configuration.tire_sizes.filter(size => size.type === 'stock');
  const optionalSizes = configuration.tire_sizes.filter(size => size.type === 'optional');
  
  // Получаем уникальные диаметры
  const diameterSet = new Set(configuration.tire_sizes.map(size => size.diameter));
  const uniqueDiameters = Array.from(diameterSet).sort((a, b) => a - b);

  // Определяем логотип бренда (заглушка)
  const getBrandLogo = (brandName: string) => {
    // В реальном приложении здесь будет логика получения логотипа
    return brandName && brandName.length > 0 ? brandName.charAt(0).toUpperCase() : '?';
  };

  // Компактный вариант карточки
  if (compact) {
    return (
      <Card
        className={className}
        onClick={onClick}
        sx={{
          cursor: onClick ? 'pointer' : 'default',
          transition: 'all 0.2s ease',
          '&:hover': onClick ? {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          } : {},
          borderRadius: 2
        }}
      >
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: 'primary.main',
                fontSize: '0.875rem',
                fontWeight: 600
              }}
            >
              {getBrandLogo(configuration.brand_name)}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600 }}>
                {configuration.full_name}
              </Typography>
              {showYear && (
                <Typography variant="caption" color="text.secondary">
                  {configuration.years_display}
                </Typography>
              )}
            </Box>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onFavoriteToggle?.();
              }}
              color={isFavorite ? 'error' : 'default'}
            >
              {isFavorite ? <Favorite /> : <FavoriteBorder />}
            </IconButton>
          </Box>

          {showTireSizes && (
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {configuration.tire_sizes.slice(0, 3).map((size, index) => (
                <TireSizeChip
                  key={index}
                  tireSize={size}
                  variant="compact"
                  showType={false}
                />
              ))}
              {configuration.tire_sizes.length > 3 && (
                <Chip
                  size="small"
                  label={`+${configuration.tire_sizes.length - 3}`}
                  variant="outlined"
                />
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    );
  }

  // Полная версия карточки
  return (
    <Card
      className={className}
      onClick={onClick}
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        '&:hover': onClick ? {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
        } : {},
        borderRadius: 3,
        overflow: 'visible',
        position: 'relative'
      }}
    >
      {/* Заголовок карточки */}
      <CardContent sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              bgcolor: 'primary.main',
              fontSize: '1.25rem',
              fontWeight: 700
            }}
          >
            {getBrandLogo(configuration.brand_name)}
          </Avatar>
          
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" component="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
              {configuration.brand_name} {configuration.model_name}
            </Typography>
            
            {showYear && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {configuration.years_display}
                </Typography>
              </Box>
            )}

            {/* Информация о диаметрах */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
              <Build sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                Диаметры: R{uniqueDiameters.join(', R')}
              </Typography>
            </Box>

            {/* Количество размеров */}
            <Typography variant="caption" color="text.secondary">
              {configuration.tire_sizes.length} размер{configuration.tire_sizes.length > 1 ? 'ов' : ''} шин
            </Typography>
          </Box>

          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              onFavoriteToggle?.();
            }}
            color={isFavorite ? 'error' : 'default'}
            sx={{
              '&:hover': {
                transform: 'scale(1.1)'
              }
            }}
          >
            {isFavorite ? <Favorite /> : <FavoriteBorder />}
          </IconButton>
        </Box>

        {/* Размеры шин */}
        {showTireSizes && (
          <>
            <Divider sx={{ my: 2 }} />
            
            {/* Штатные размеры */}
            {stockSizes.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: 'primary.main' }}>
                  Штатные размеры
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {stockSizes.map((size, index) => (
                    <TireSizeChip
                      key={`stock-${index}`}
                      tireSize={size}
                      showType={false}
                    />
                  ))}
                </Stack>
              </Box>
            )}

            {/* Опциональные размеры */}
            {optionalSizes.length > 0 && (
              <Box sx={{ mb: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: 'text.secondary' }}>
                  Опциональные размеры
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {optionalSizes.map((size, index) => (
                    <TireSizeChip
                      key={`optional-${index}`}
                      tireSize={size}
                      showType={false}
                    />
                  ))}
                </Stack>
              </Box>
            )}
          </>
        )}
      </CardContent>

      {/* Действия */}
      <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
        <Button
          variant="contained"
          startIcon={<LocationOn />}
          onClick={(e) => {
            e.stopPropagation();
            // Здесь будет переход к поиску сервисных точек
            console.log('Поиск сервиса для:', configuration.full_name);
          }}
          sx={{ borderRadius: 2 }}
        >
          Найти сервис
        </Button>
        
        <Button
          variant="outlined"
          startIcon={<Info />}
          onClick={(e) => {
            e.stopPropagation();
            // Здесь будет показ подробной информации
            console.log('Подробнее о:', configuration.full_name);
          }}
          sx={{ borderRadius: 2 }}
        >
          Подробнее
        </Button>

        {/* Информация о версии данных */}
        <Box sx={{ ml: 'auto' }}>
          <Tooltip title={`Версия данных: ${configuration.data_version}`}>
            <Chip
              size="small"
              label={`v${configuration.data_version}`}
              variant="outlined"
              sx={{ fontSize: '0.7rem' }}
            />
          </Tooltip>
        </Box>
      </CardActions>

      {/* Индикатор релевантности (если есть) */}
      {configuration.match_score && configuration.match_score > 0.8 && (
        <Box
          sx={{
            position: 'absolute',
            top: -8,
            right: 16,
            bgcolor: 'success.main',
            color: 'success.contrastText',
            px: 1,
            py: 0.5,
            borderRadius: 1,
            fontSize: '0.75rem',
            fontWeight: 600,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        >
          Точное совпадение
        </Box>
      )}
    </Card>
  );
};

export default TireConfigurationCard;