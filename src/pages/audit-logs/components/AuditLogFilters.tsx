import React, { useState, useCallback } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Button,
  Grid,
  Card,
  CardContent,
  Typography,
  Collapse,
  IconButton,
  Badge,
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ru } from 'date-fns/locale';
import { format } from 'date-fns';
import type { AuditLogsQueryParams } from '../../../api/auditLogs.api';

interface AuditLogFiltersProps {
  filters: AuditLogsQueryParams;
  onFiltersChange: (filters: Partial<AuditLogsQueryParams>) => void;
  appliedFiltersCount: number;
}

const ACTION_OPTIONS = [
  { value: 'created', label: 'Создание' },
  { value: 'updated', label: 'Обновление' },
  { value: 'deleted', label: 'Удаление' },
  { value: 'suspended', label: 'Блокировка' },
  { value: 'unsuspended', label: 'Разблокировка' },
  { value: 'assigned', label: 'Назначение' },
  { value: 'unassigned', label: 'Отзыв назначения' },
  { value: 'login', label: 'Вход в систему' },
  { value: 'logout', label: 'Выход из системы' },
];

const RESOURCE_TYPE_OPTIONS = [
  { value: 'User', label: '👤 Пользователь' },
  { value: 'Booking', label: '📅 Бронирование' },
  { value: 'ServicePoint', label: '🏪 Сервисная точка' },
  { value: 'Operator', label: '👨‍💼 Оператор' },
  { value: 'Partner', label: '🤝 Партнер' },
  { value: 'Client', label: '👥 Клиент' },
  { value: 'Review', label: '⭐ Отзыв' },
];

const PER_PAGE_OPTIONS = [25, 50, 100];

export const AuditLogFilters: React.FC<AuditLogFiltersProps> = ({
  filters,
  onFiltersChange,
  appliedFiltersCount,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [localFilters, setLocalFilters] = useState<AuditLogsQueryParams>(filters);

  // Обработчики изменения фильтров
  const handleLocalFilterChange = useCallback((key: keyof AuditLogsQueryParams, value: any) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1, // Сброс на первую страницу при изменении фильтров
    }));
  }, []);

  const handleApplyFilters = useCallback(() => {
    onFiltersChange(localFilters);
  }, [localFilters, onFiltersChange]);

  const handleClearFilters = useCallback(() => {
    const clearedFilters: AuditLogsQueryParams = {
      page: 1,
      per_page: filters.per_page || 50,
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  }, [filters.per_page, onFiltersChange]);

  const hasActiveFilters = Object.keys(localFilters).some(
    key => key !== 'page' && key !== 'per_page' && localFilters[key as keyof AuditLogsQueryParams]
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
      <Card variant="outlined">
        <CardContent sx={{ pb: expanded ? 2 : 1 }}>
          {/* Заголовок с кнопкой сворачивания */}
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={1}>
              <FilterIcon color="primary" />
              <Typography variant="h6" component="div">
                Фильтры
              </Typography>
              {appliedFiltersCount > 0 && (
                <Badge badgeContent={appliedFiltersCount} color="primary">
                  <Chip
                    label={`${appliedFiltersCount} активных`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Badge>
              )}
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              {hasActiveFilters && (
                <Button
                  size="small"
                  onClick={handleClearFilters}
                  startIcon={<ClearIcon />}
                  color="inherit"
                >
                  Очистить
                </Button>
              )}
              <IconButton
                onClick={() => setExpanded(!expanded)}
                size="small"
              >
                {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>
          </Box>

          {/* Быстрые фильтры (всегда видимы) */}
          <Box mt={2}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Email пользователя"
                  placeholder="user@example.com"
                  value={localFilters.user_email || ''}
                  onChange={(e) => handleLocalFilterChange('user_email', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Действие</InputLabel>
                  <Select
                    value={localFilters.action || ''}
                    label="Действие"
                    onChange={(e) => handleLocalFilterChange('action', e.target.value)}
                  >
                    <MenuItem value="">Все действия</MenuItem>
                    {ACTION_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Тип ресурса</InputLabel>
                  <Select
                    value={localFilters.resource_type || ''}
                    label="Тип ресурса"
                    onChange={(e) => handleLocalFilterChange('resource_type', e.target.value)}
                  >
                    <MenuItem value="">Все ресурсы</MenuItem>
                    {RESOURCE_TYPE_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleApplyFilters}
                  disabled={JSON.stringify(filters) === JSON.stringify(localFilters)}
                >
                  Применить
                </Button>
              </Grid>
            </Grid>
          </Box>

          {/* Расширенные фильтры */}
          <Collapse in={expanded}>
            <Box mt={3}>
              <Typography variant="subtitle2" gutterBottom color="text.secondary">
                Расширенные фильтры
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="ID пользователя"
                    type="number"
                    value={localFilters.user_id || ''}
                    onChange={(e) => handleLocalFilterChange('user_id', e.target.value ? Number(e.target.value) : undefined)}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="ID ресурса"
                    type="number"
                    value={localFilters.resource_id || ''}
                    onChange={(e) => handleLocalFilterChange('resource_id', e.target.value ? Number(e.target.value) : undefined)}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <DatePicker
                    label="Дата от"
                    value={localFilters.date_from ? new Date(localFilters.date_from) : null}
                    onChange={(date) => 
                      handleLocalFilterChange('date_from', date ? format(date, 'yyyy-MM-dd') : undefined)
                    }
                    slotProps={{
                      textField: {
                        size: 'small',
                        fullWidth: true,
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <DatePicker
                    label="Дата до"
                    value={localFilters.date_to ? new Date(localFilters.date_to) : null}
                    onChange={(date) => 
                      handleLocalFilterChange('date_to', date ? format(date, 'yyyy-MM-dd') : undefined)
                    }
                    slotProps={{
                      textField: {
                        size: 'small',
                        fullWidth: true,
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="IP адрес"
                    placeholder="192.168.1.1"
                    value={localFilters.ip_address || ''}
                    onChange={(e) => handleLocalFilterChange('ip_address', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Записей на странице</InputLabel>
                    <Select
                      value={localFilters.per_page || 50}
                      label="Записей на странице"
                      onChange={(e) => handleLocalFilterChange('per_page', Number(e.target.value))}
                    >
                      {PER_PAGE_OPTIONS.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              {/* Активные фильтры */}
              {appliedFiltersCount > 0 && (
                <Box mt={2}>
                  <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                    Активные фильтры:
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {filters.user_email && (
                      <Chip
                        label={`Email: ${filters.user_email}`}
                        size="small"
                        onDelete={() => onFiltersChange({ ...filters, user_email: undefined })}
                        color="primary"
                        variant="outlined"
                      />
                    )}
                    {filters.action && (
                      <Chip
                        label={`Действие: ${ACTION_OPTIONS.find(opt => opt.value === filters.action)?.label || filters.action}`}
                        size="small"
                        onDelete={() => onFiltersChange({ ...filters, action: undefined })}
                        color="primary"
                        variant="outlined"
                      />
                    )}
                    {filters.resource_type && (
                      <Chip
                        label={`Ресурс: ${RESOURCE_TYPE_OPTIONS.find(opt => opt.value === filters.resource_type)?.label || filters.resource_type}`}
                        size="small"
                        onDelete={() => onFiltersChange({ ...filters, resource_type: undefined })}
                        color="primary"
                        variant="outlined"
                      />
                    )}
                    {filters.user_id && (
                      <Chip
                        label={`User ID: ${filters.user_id}`}
                        size="small"
                        onDelete={() => onFiltersChange({ ...filters, user_id: undefined })}
                        color="primary"
                        variant="outlined"
                      />
                    )}
                    {filters.resource_id && (
                      <Chip
                        label={`Resource ID: ${filters.resource_id}`}
                        size="small"
                        onDelete={() => onFiltersChange({ ...filters, resource_id: undefined })}
                        color="primary"
                        variant="outlined"
                      />
                    )}
                    {filters.date_from && (
                      <Chip
                        label={`От: ${filters.date_from}`}
                        size="small"
                        onDelete={() => onFiltersChange({ ...filters, date_from: undefined })}
                        color="primary"
                        variant="outlined"
                      />
                    )}
                    {filters.date_to && (
                      <Chip
                        label={`До: ${filters.date_to}`}
                        size="small"
                        onDelete={() => onFiltersChange({ ...filters, date_to: undefined })}
                        color="primary"
                        variant="outlined"
                      />
                    )}
                    {filters.ip_address && (
                      <Chip
                        label={`IP: ${filters.ip_address}`}
                        size="small"
                        onDelete={() => onFiltersChange({ ...filters, ip_address: undefined })}
                        color="primary"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </Box>
              )}
            </Box>
          </Collapse>
        </CardContent>
      </Card>
    </LocalizationProvider>
  );
}; 