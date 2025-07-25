import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Chip,
  SelectChangeEvent,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';

// Типы
export interface ServicePoint {
  id: number;
  name: string;
  address: string;
  partner_name?: string;
  is_active: boolean;
  work_status: string;
}

export interface ServicePointSelectorProps {
  servicePoints: ServicePoint[];
  selectedPointId: number | null;
  onPointChange: (pointId: number | null) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  showPartnerName?: boolean;
  size?: 'small' | 'medium';
}

export const ServicePointSelector: React.FC<ServicePointSelectorProps> = ({
  servicePoints,
  selectedPointId,
  onPointChange,
  label = 'Сервисная точка',
  placeholder = 'Выберите точку для работы',
  disabled = false,
  showPartnerName = false,
  size = 'medium',
}) => {
  // Обработчик изменения
  const handleChange = (event: SelectChangeEvent<number>) => {
    const value = event.target.value;
    onPointChange(value === 0 ? null : Number(value));
  };

  // Получение активных точек
  const activePoints = servicePoints.filter(point => 
    point.is_active && point.work_status === 'working'
  );

  // Получение выбранной точки
  const selectedPoint = servicePoints.find(point => point.id === selectedPointId);

  return (
    <FormControl fullWidth size={size} disabled={disabled}>
      <InputLabel id="service-point-selector-label">
        {label}
      </InputLabel>
      
      <Select
        labelId="service-point-selector-label"
        value={selectedPointId || 0}
        label={label}
        onChange={handleChange}
        renderValue={(value) => {
          if (value === 0) {
            return (
              <Typography variant="body2" color="text.secondary">
                {placeholder}
              </Typography>
            );
          }
          
          if (selectedPoint) {
            return (
              <Box display="flex" alignItems="center" gap={1}>
                <LocationIcon fontSize="small" color="primary" />
                <Box>
                  <Typography variant="body2" fontWeight="bold">
                    {selectedPoint.name}
                  </Typography>
                  {showPartnerName && selectedPoint.partner_name && (
                    <Typography variant="caption" color="text.secondary">
                      {selectedPoint.partner_name}
                    </Typography>
                  )}
                </Box>
              </Box>
            );
          }
          
          return placeholder;
        }}
      >
        {/* Опция "Все точки" или "Не выбрано" */}
        <MenuItem value={0}>
          <Box display="flex" alignItems="center" gap={1}>
            <BusinessIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {placeholder}
            </Typography>
          </Box>
        </MenuItem>

        {/* Активные сервисные точки */}
        {activePoints.map((point) => (
          <MenuItem key={point.id} value={point.id}>
            <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
              <Box display="flex" alignItems="center" gap={1}>
                <LocationIcon fontSize="small" color="primary" />
                <Box>
                  <Typography variant="body2" fontWeight="bold">
                    {point.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {point.address}
                  </Typography>
                  {showPartnerName && point.partner_name && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      {point.partner_name}
                    </Typography>
                  )}
                </Box>
              </Box>
              
              {/* Статус активности */}
              <Chip
                label="Активна"
                size="small"
                color="success"
                variant="outlined"
              />
            </Box>
          </MenuItem>
        ))}

        {/* Если нет активных точек */}
        {activePoints.length === 0 && (
          <MenuItem disabled>
            <Typography variant="body2" color="text.secondary">
              Нет доступных сервисных точек
            </Typography>
          </MenuItem>
        )}
      </Select>
    </FormControl>
  );
}; 