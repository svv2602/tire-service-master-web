import React from 'react';
import { Chip, Tooltip, Box, Typography } from '@mui/material';
import { CheckCircle, RadioButtonUnchecked } from '@mui/icons-material';
import type { TireSizeChipProps, TireSize } from '../../../types/tireSearch';
import { formatTireSize, formatTireType, getTireTypeColor } from '../../../types/tireSearch';

const TireSizeChip: React.FC<TireSizeChipProps> = ({
  tireSize,
  variant = 'default',
  showType = true,
  onClick,
  className
}) => {
  // Определяем цвет и иконку в зависимости от типа шин
  const getTypeConfig = (type: TireSize['type']) => {
    switch (type) {
      case 'stock':
        return {
          color: 'primary' as const,
          icon: <CheckCircle sx={{ fontSize: 16 }} />,
          label: 'Штатные',
          description: 'Рекомендованные производителем размеры шин'
        };
      case 'optional':
        return {
          color: 'default' as const,
          icon: <RadioButtonUnchecked sx={{ fontSize: 16 }} />,
          label: 'Опциональные',
          description: 'Альтернативные размеры шин'
        };
      default:
        return {
          color: 'default' as const,
          icon: null,
          label: 'Неизвестно',
          description: ''
        };
    }
  };

  const typeConfig = getTypeConfig(tireSize.type);
  const tireDisplay = formatTireSize(tireSize);

  // Компактный вариант - только размер
  if (variant === 'compact') {
    return (
      <Chip
        label={tireDisplay}
        size="small"
        color={typeConfig.color}
        onClick={onClick}
        className={className}
        sx={{
          fontWeight: 600,
          fontSize: '0.75rem',
          cursor: onClick ? 'pointer' : 'default',
          '&:hover': onClick ? {
            transform: 'scale(1.05)',
            transition: 'transform 0.2s ease'
          } : {}
        }}
      />
    );
  }

  // Детальный вариант - с полной информацией
  if (variant === 'detailed') {
    return (
      <Box
        onClick={onClick}
        className={className}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          p: 2,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          cursor: onClick ? 'pointer' : 'default',
          transition: 'all 0.2s ease',
          '&:hover': onClick ? {
            borderColor: 'primary.main',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            transform: 'translateY(-2px)'
          } : {}
        }}
      >
        <Typography variant="h6" component="div" sx={{ fontWeight: 700, mb: 1 }}>
          {tireDisplay}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
          {typeConfig.icon}
          <Typography variant="body2" color="text.secondary">
            {typeConfig.label}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Ширина: {tireSize.width}мм
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Высота: {tireSize.height}%
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Диаметр: R{tireSize.diameter}
          </Typography>
        </Box>

        {tireSize.axle && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
            Ось: {tireSize.axle === 'front' ? 'Передняя' : tireSize.axle === 'rear' ? 'Задняя' : 'Все'}
          </Typography>
        )}
      </Box>
    );
  }

  // Стандартный вариант - с типом и тултипом
  const chipContent = (
    <Chip
      label={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {showType && typeConfig.icon}
          <span style={{ fontWeight: 600 }}>{tireDisplay}</span>
          {showType && (
            <Typography
              component="span"
              variant="caption"
              sx={{
                ml: 0.5,
                opacity: 0.8,
                fontSize: '0.7rem'
              }}
            >
              {typeConfig.label}
            </Typography>
          )}
        </Box>
      }
      color={typeConfig.color}
      variant={tireSize.type === 'stock' ? 'filled' : 'outlined'}
      onClick={onClick}
      className={className}
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        '&:hover': onClick ? {
          transform: 'scale(1.05)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
        } : {}
      }}
    />
  );

  // Если есть описание типа, оборачиваем в Tooltip
  if (showType && typeConfig.description) {
    return (
      <Tooltip
        title={
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {tireDisplay} - {typeConfig.label}
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              {typeConfig.description}
            </Typography>
            <Box sx={{ mt: 1, display: 'flex', gap: 2 }}>
              <Typography variant="caption">
                Ширина: {tireSize.width}мм
              </Typography>
              <Typography variant="caption">
                Высота: {tireSize.height}%
              </Typography>
              <Typography variant="caption">
                Диаметр: R{tireSize.diameter}
              </Typography>
            </Box>
            {tireSize.axle && (
              <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                Рекомендуемая ось: {
                  tireSize.axle === 'front' ? 'Передняя' : 
                  tireSize.axle === 'rear' ? 'Задняя' : 
                  'Все оси'
                }
              </Typography>
            )}
          </Box>
        }
        placement="top"
        arrow
      >
        {chipContent}
      </Tooltip>
    );
  }

  return chipContent;
};

export default TireSizeChip;