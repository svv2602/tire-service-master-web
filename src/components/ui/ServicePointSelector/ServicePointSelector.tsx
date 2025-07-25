import React, { useState, useMemo } from 'react';
import {
  Box,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  OutlinedInput,
  Typography,
  Checkbox,
  ListItemText,
  Button,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Alert,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  CheckCircle as AssignedIcon,
  RadioButtonUnchecked as UnassignedIcon,
  SelectAll as SelectAllIcon,
  Clear as ClearAllIcon,
} from '@mui/icons-material';
import { useUserRole } from '../../../hooks/useUserRole';

export interface ServicePoint {
  id: number;
  name: string;
  address: string;
  phone?: string;
  is_active: boolean;
  partner_id: number;
  partner_name?: string;
}

export interface ServicePointSelectorProps {
  // Доступные сервисные точки
  availablePoints: ServicePoint[];
  // Уже назначенные точки
  assignedPointIds: number[];
  // Выбранные точки для назначения
  selectedPointIds: number[];
  // Callback при изменении выбора
  onSelectionChange: (selectedIds: number[]) => void;
  // Режим отображения
  variant?: 'select' | 'cards' | 'chips';
  // Показывать ли только активные точки
  showOnlyActive?: boolean;
  // Разрешить ли множественный выбор
  multiple?: boolean;
  // Заголовок
  label?: string;
  // Показывать ли статистику
  showStats?: boolean;
  // Ошибка валидации
  error?: string;
  // Режим только для чтения
  readOnly?: boolean;
}

export const ServicePointSelector: React.FC<ServicePointSelectorProps> = ({
  availablePoints,
  assignedPointIds = [],
  selectedPointIds = [],
  onSelectionChange,
  variant = 'select',
  showOnlyActive = true,
  multiple = true,
  label = 'Сервисные точки',
  showStats = false,
  error,
  readOnly = false,
}) => {
  const permissions = useUserRole();
  const [searchTerm, setSearchTerm] = useState('');

  // Фильтрация точек
  const filteredPoints = useMemo(() => {
    let points = availablePoints;

    // Фильтр по активности
    if (showOnlyActive) {
      points = points.filter(point => point.is_active);
    }

    // Фильтр по партнеру (если пользователь - партнер)
    if (permissions.isPartner && permissions.partnerId) {
      points = points.filter(point => point.partner_id === permissions.partnerId);
    }

    // Поиск
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      points = points.filter(point => 
        point.name.toLowerCase().includes(term) ||
        point.address.toLowerCase().includes(term)
      );
    }

    return points;
  }, [availablePoints, showOnlyActive, permissions, searchTerm]);

  // Статистика
  const stats = useMemo(() => {
    const total = filteredPoints.length;
    const assigned = assignedPointIds.length;
    const selected = selectedPointIds.length;
    const unassigned = total - assigned;

    return { total, assigned, selected, unassigned };
  }, [filteredPoints, assignedPointIds, selectedPointIds]);

  // Обработчики
  const handleSelectAll = () => {
    if (readOnly) return;
    const allIds = filteredPoints.map(point => point.id);
    onSelectionChange(allIds);
  };

  const handleClearAll = () => {
    if (readOnly) return;
    onSelectionChange([]);
  };

  const handlePointToggle = (pointId: number) => {
    if (readOnly) return;
    
    if (multiple) {
      const newSelection = selectedPointIds.includes(pointId)
        ? selectedPointIds.filter(id => id !== pointId)
        : [...selectedPointIds, pointId];
      onSelectionChange(newSelection);
    } else {
      onSelectionChange([pointId]);
    }
  };

  const isPointAssigned = (pointId: number) => assignedPointIds.includes(pointId);
  const isPointSelected = (pointId: number) => selectedPointIds.includes(pointId);

  // Рендер в зависимости от варианта
  if (variant === 'cards') {
    return (
      <Box>
        {/* Заголовок и статистика */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">{label}</Typography>
          {showStats && (
            <Box display="flex" gap={2}>
              <Chip 
                size="small" 
                label={`Всего: ${stats.total}`} 
                color="default" 
              />
              <Chip 
                size="small" 
                label={`Назначено: ${stats.assigned}`} 
                color="success" 
              />
              <Chip 
                size="small" 
                label={`Выбрано: ${stats.selected}`} 
                color="primary" 
              />
            </Box>
          )}
        </Box>

        {/* Действия */}
        {multiple && !readOnly && (
          <Box display="flex" gap={1} mb={2}>
            <Button
              size="small"
              startIcon={<SelectAllIcon />}
              onClick={handleSelectAll}
              disabled={selectedPointIds.length === filteredPoints.length}
            >
              Выбрать все
            </Button>
            <Button
              size="small"
              startIcon={<ClearAllIcon />}
              onClick={handleClearAll}
              disabled={selectedPointIds.length === 0}
            >
              Очистить
            </Button>
          </Box>
        )}

        {/* Ошибка */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Карточки точек */}
        <Grid container spacing={2}>
          {filteredPoints.map((point) => {
            const assigned = isPointAssigned(point.id);
            const selected = isPointSelected(point.id);

            return (
              <Grid item xs={12} sm={6} md={4} key={point.id}>
                <Card 
                  sx={{ 
                    cursor: readOnly ? 'default' : 'pointer',
                    border: selected ? 2 : 1,
                    borderColor: selected ? 'primary.main' : 'divider',
                    backgroundColor: assigned ? 'success.50' : 'background.paper',
                    '&:hover': readOnly ? {} : {
                      borderColor: 'primary.main',
                      boxShadow: 2,
                    }
                  }}
                  onClick={() => handlePointToggle(point.id)}
                >
                  <CardContent sx={{ pb: 2 }}>
                    {/* Заголовок с иконками */}
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <LocationIcon color="primary" fontSize="small" />
                        <Typography variant="subtitle2" fontWeight="bold">
                          {point.name}
                        </Typography>
                      </Box>
                      <Box display="flex" gap={0.5}>
                        {assigned && (
                          <Tooltip title="Уже назначено">
                            <AssignedIcon color="success" fontSize="small" />
                          </Tooltip>
                        )}
                        {selected && (
                          <Tooltip title="Выбрано для назначения">
                            <Checkbox 
                              checked 
                              size="small" 
                              sx={{ p: 0 }}
                              readOnly
                            />
                          </Tooltip>
                        )}
                      </Box>
                    </Box>

                    {/* Адрес */}
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      {point.address}
                    </Typography>

                    {/* Телефон */}
                    {point.phone && (
                      <Typography variant="caption" color="text.secondary">
                        📞 {point.phone}
                      </Typography>
                    )}

                    {/* Партнер (для админов) */}
                    {permissions.isAdmin && point.partner_name && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        Партнер: {point.partner_name}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Пустое состояние */}
        {filteredPoints.length === 0 && (
          <Box textAlign="center" py={4}>
            <Typography variant="body1" color="text.secondary">
              Нет доступных сервисных точек
            </Typography>
          </Box>
        )}
      </Box>
    );
  }

  if (variant === 'chips') {
    return (
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          {label}
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box display="flex" flexWrap="wrap" gap={1}>
          {filteredPoints.map((point) => {
            const assigned = isPointAssigned(point.id);
            const selected = isPointSelected(point.id);

            return (
              <Chip
                key={point.id}
                label={point.name}
                variant={selected ? "filled" : "outlined"}
                color={assigned ? "success" : selected ? "primary" : "default"}
                onClick={readOnly ? undefined : () => handlePointToggle(point.id)}
                onDelete={selected && !readOnly ? () => handlePointToggle(point.id) : undefined}
                icon={assigned ? <AssignedIcon /> : undefined}
                sx={{
                  cursor: readOnly ? 'default' : 'pointer',
                }}
              />
            );
          })}
        </Box>

        {filteredPoints.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            Нет доступных точек
          </Typography>
        )}
      </Box>
    );
  }

  // Вариант select (по умолчанию)
  return (
    <FormControl fullWidth error={!!error}>
      <InputLabel>{label}</InputLabel>
      <Select
        multiple={multiple}
        value={multiple ? selectedPointIds : (selectedPointIds[0] || '')}
        onChange={(event) => {
          const value = event.target.value;
          if (multiple) {
            onSelectionChange(typeof value === 'string' ? value.split(',').map(Number) : value as number[]);
          } else {
            onSelectionChange([value as number]);
          }
        }}
        input={<OutlinedInput label={label} />}
        renderValue={(selected) => {
          if (multiple) {
            const selectedIds = selected as number[];
            return (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selectedIds.map((id) => {
                  const point = filteredPoints.find(p => p.id === id);
                  return point ? (
                    <Chip 
                      key={id} 
                      label={point.name} 
                      size="small"
                      color={isPointAssigned(id) ? "success" : "primary"}
                    />
                  ) : null;
                })}
              </Box>
            );
          } else {
            const point = filteredPoints.find(p => p.id === selected);
            return point ? point.name : '';
          }
        }}
        readOnly={readOnly}
      >
        {filteredPoints.map((point) => {
          const assigned = isPointAssigned(point.id);
          const selected = isPointSelected(point.id);

          return (
            <MenuItem key={point.id} value={point.id}>
              {multiple && (
                <Checkbox checked={selected} />
              )}
              <ListItemText 
                primary={
                  <Box display="flex" alignItems="center" gap={1}>
                    <LocationIcon fontSize="small" />
                    {point.name}
                    {assigned && (
                      <Chip 
                        label="Назначено" 
                        size="small" 
                        color="success" 
                        variant="outlined"
                      />
                    )}
                  </Box>
                }
                secondary={point.address}
              />
            </MenuItem>
          );
        })}
      </Select>
      {error && (
        <Typography variant="caption" color="error" sx={{ mt: 1 }}>
          {error}
        </Typography>
      )}
    </FormControl>
  );
}; 