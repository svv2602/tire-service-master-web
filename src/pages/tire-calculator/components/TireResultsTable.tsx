import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Box,
  Typography,
  Tooltip,
  IconButton,
  Alert,
  TableSortLabel
} from '@mui/material';
import {
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Speed as SpeedIcon
} from '@mui/icons-material';
import { TireAlternative } from '../../../types/tire-calculator';
import { calculateSpeedometerImpact } from '../../../utils/tire-calculator';
import { Button } from '../../../components/ui';
import { useTranslation } from 'react-i18next';

interface TireResultsTableProps {
  alternatives: TireAlternative[];
  originalDiameter: number;
}

type SortField = 'deviation' | 'width' | 'diameter' | 'size';
type SortDirection = 'asc' | 'desc';
type FilterType = 'all' | 'recommended' | 'warning' | 'info';

const TireResultsTable: React.FC<TireResultsTableProps> = ({
  alternatives,
  originalDiameter
}) => {
  const { t } = useTranslation();
  const [sortField, setSortField] = useState<SortField>('deviation');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [filterType, setFilterType] = useState<FilterType>('recommended'); // По умолчанию показываем только рекомендуемые

  // Фильтрация результатов
  const filteredAlternatives = useMemo(() => {
    return alternatives.filter(alternative => {
      const absDeviation = Math.abs(alternative.deviationPercent);
      
      switch (filterType) {
        case 'recommended':
          return absDeviation <= 1; // ±1%
        case 'warning':
          return absDeviation > 1 && absDeviation <= 2; // >1% до ±2%
        case 'info':
          return absDeviation > 2 && absDeviation <= 3; // >2% до ±3%
        case 'all':
        default:
          return true;
      }
    });
  }, [alternatives, filterType]);

  // Сортировка альтернативных размеров
  const sortedAlternatives = [...filteredAlternatives].sort((a, b) => {
    let aValue: number | string;
    let bValue: number | string;

    switch (sortField) {
      case 'deviation':
        aValue = Math.abs(a.deviationPercent);
        bValue = Math.abs(b.deviationPercent);
        break;
      case 'width':
        aValue = a.width;
        bValue = b.width;
        break;
      case 'diameter':
        aValue = a.diameter;
        bValue = b.diameter;
        break;
      case 'size':
        aValue = a.size;
        bValue = b.size;
        break;
      default:
        aValue = Math.abs(a.deviationPercent);
        bValue = Math.abs(b.deviationPercent);
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }

    return 0;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getDeviationColor = (deviationPercent: number) => {
    const absDeviation = Math.abs(deviationPercent);
    if (absDeviation <= 1) return 'success';      // Зеленый для ±1%
    if (absDeviation <= 2) return 'warning';      // Желтый для >1% до ±2%
    if (absDeviation <= 3) return 'info';         // Синий для >2% до ±3%
    return 'error';                               // Красный для >3%
  };

  const getRecommendationIcon = (alternative: TireAlternative) => {
    const absDeviation = Math.abs(alternative.deviationPercent);
    
    if (absDeviation <= 1) {
      return (
        <Tooltip title={t('tireCalculator.recommended')}>
          <CheckCircleIcon color="success" fontSize="small" />
        </Tooltip>
      );
    }
    if (absDeviation <= 2) {
      return (
        <Tooltip title={t('tireCalculator.attention')}>
          <WarningIcon color="warning" fontSize="small" />
        </Tooltip>
      );
    }
    if (absDeviation <= 3) {
      return (
        <Tooltip title={t('tireCalculator.check')}>
          <InfoIcon color="info" fontSize="small" />
        </Tooltip>
      );
    }
    return (
      <Tooltip title={t('tireCalculator.check')}>
        <WarningIcon color="error" fontSize="small" />
      </Tooltip>
    );
  };

  const getSpeedometerInfo = (alternative: TireAlternative) => {
    const impact = calculateSpeedometerImpact(originalDiameter, alternative.calculatedDiameter);
    return (
      <Tooltip title={impact.description}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <SpeedIcon fontSize="small" color="action" />
          <Typography variant="caption">
            {impact.deviationKmh > 0 ? '+' : ''}{impact.deviationKmh.toFixed(1)} км/ч
          </Typography>
        </Box>
      </Tooltip>
    );
  };

  if (alternatives.length === 0) {
    return (
      <Alert severity="info">
        {t('tireCalculator.found_sizes') + ' ' + t('tireCalculator.no_sizes_found_message')}
      </Alert>
    );
  }

  const getFilterCount = (type: FilterType): number => {
    switch (type) {
      case 'recommended':
        return alternatives.filter(alt => Math.abs(alt.deviationPercent) <= 1).length;
      case 'warning':
        return alternatives.filter(alt => {
          const absDeviation = Math.abs(alt.deviationPercent);
          return absDeviation > 1 && absDeviation <= 2;
        }).length;
      case 'info':
        return alternatives.filter(alt => {
          const absDeviation = Math.abs(alt.deviationPercent);
          return absDeviation > 2 && absDeviation <= 3;
        }).length;
      case 'all':
      default:
        return alternatives.length;
    }
  };

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {t('tireCalculator.found_sizes_summary', { count: alternatives.length, shown: filterType !== 'all' ? filteredAlternatives.length : alternatives.length })}
      </Typography>

      {/* Кнопки быстрого фильтра */}
      <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        <Button
          variant={filterType === 'recommended' ? 'contained' : 'outlined'}
          size="small"
          startIcon={<CheckCircleIcon />}
          onClick={() => setFilterType('recommended')}
          color="success"
        >
          {t('tireCalculator.recommended_with_count', { count: getFilterCount('recommended') })}
        </Button>
        
        <Button
          variant={filterType === 'warning' ? 'contained' : 'outlined'}
          size="small"
          startIcon={<WarningIcon />}
          onClick={() => setFilterType('warning')}
          color="warning"
        >
          {t('tireCalculator.attention_with_count', { count: getFilterCount('warning') })}
        </Button>
        
        <Button
          variant={filterType === 'info' ? 'contained' : 'outlined'}
          size="small"
          startIcon={<InfoIcon />}
          onClick={() => setFilterType('info')}
          color="info"
        >
          {t('tireCalculator.check_with_count', { count: getFilterCount('info') })}
        </Button>
        
        <Button
          variant={filterType === 'all' ? 'contained' : 'outlined'}
          size="small"
          onClick={() => setFilterType('all')}
        >
          {t('tireCalculator.all', { count: getFilterCount('all') })}
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {t('tireCalculator.col_recommendation')}
                  <Tooltip title={t('tireCalculator.recommendation')}>
                    <InfoIcon fontSize="small" color="action" />
                  </Tooltip>
                </Box>
              </TableCell>
              
              <TableCell>
                <TableSortLabel
                  active={sortField === 'size'}
                  direction={sortField === 'size' ? sortDirection : 'asc'}
                  onClick={() => handleSort('size')}
                >
                  {t('tireCalculator.col_tire_size')}
                </TableSortLabel>
              </TableCell>

              <TableCell align="center">
                <TableSortLabel
                  active={sortField === 'width'}
                  direction={sortField === 'width' ? sortDirection : 'asc'}
                  onClick={() => handleSort('width')}
                >
                  {t('tireCalculator.col_width')}
                </TableSortLabel>
              </TableCell>

              <TableCell align="center">{t('tireCalculator.col_profile')}</TableCell>

              <TableCell align="center">
                <TableSortLabel
                  active={sortField === 'diameter'}
                  direction={sortField === 'diameter' ? sortDirection : 'asc'}
                  onClick={() => handleSort('diameter')}
                >
                  {t('tireCalculator.col_diameter')}
                </TableSortLabel>
              </TableCell>

              <TableCell align="center">
                <TableSortLabel
                  active={sortField === 'deviation'}
                  direction={sortField === 'deviation' ? sortDirection : 'asc'}
                  onClick={() => handleSort('deviation')}
                >
                  {t('tireCalculator.col_deviation')}
                </TableSortLabel>
              </TableCell>

              <TableCell align="center">{t('tireCalculator.col_total_diameter')}</TableCell>
              <TableCell align="center">{t('tireCalculator.col_rim_width')}</TableCell>
              <TableCell align="center">{t('tireCalculator.col_speedometer')}</TableCell>
            </TableRow>
          </TableHead>
          
          <TableBody>
            {sortedAlternatives.map((alternative, index) => (
              <TableRow 
                key={index}
                sx={{ 
                  '&:hover': { bgcolor: 'action.hover' },
                  bgcolor: Math.abs(alternative.deviationPercent) <= 1 ? 'success.50' : 'inherit'
                }}
              >
                <TableCell>{getRecommendationIcon(alternative)}</TableCell>
                
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {alternative.size}
                  </Typography>
                </TableCell>

                <TableCell align="center">
                  <Typography variant="body2">
                    {alternative.width} мм
                  </Typography>
                </TableCell>

                <TableCell align="center">
                  <Typography variant="body2">
                    {alternative.profile}%
                  </Typography>
                </TableCell>

                <TableCell align="center">
                  <Typography variant="body2">
                    {alternative.diameter}"
                  </Typography>
                </TableCell>

                <TableCell align="center">
                  <Chip
                    label={`${alternative.deviationPercent > 0 ? '+' : ''}${alternative.deviationPercent.toFixed(2)}%`}
                    size="small"
                    color={getDeviationColor(alternative.deviationPercent)}
                    variant="outlined"
                  />
                </TableCell>

                <TableCell align="center">
                  <Typography variant="body2">
                    {alternative.calculatedDiameter.toFixed(1)} мм
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {alternative.deviationMm > 0 ? '+' : ''}{alternative.deviationMm.toFixed(1)} мм
                  </Typography>
                </TableCell>

                <TableCell align="center">
                  <Typography variant="caption" color="text.secondary">
                    {alternative.recommendedRimWidth}
                  </Typography>
                </TableCell>

                <TableCell align="center">
                  {getSpeedometerInfo(alternative)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TireResultsTable;
