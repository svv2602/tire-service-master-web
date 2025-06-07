import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Collapse,
  Stack,
  Button,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import FilterListIcon from '@mui/icons-material/FilterList';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

// Стилизованные компоненты
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
}));

const FilterHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  cursor: 'pointer',
  padding: theme.spacing(1),
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

export interface FilterProps {
  /** Заголовок фильтра */
  title?: string;
  /** Содержимое фильтра */
  children: React.ReactNode;
  /** Callback при применении фильтров */
  onApply?: () => void;
  /** Callback при сбросе фильтров */
  onReset?: () => void;
  /** Начальное состояние развернутости */
  defaultExpanded?: boolean;
  /** Флаг отключения компонента */
  disabled?: boolean;
  /** Дополнительный класс */
  className?: string;
}

/**
 * Компонент фильтрации с разворачиваемым содержимым
 * 
 * @example
 * ```tsx
 * <Filter
 *   title="Фильтры"
 *   onApply={handleApplyFilters}
 *   onReset={handleResetFilters}
 * >
 *   <TextField label="Поиск" />
 *   <Select label="Категория">
 *     <MenuItem value="all">Все</MenuItem>
 *     <MenuItem value="active">Активные</MenuItem>
 *   </Select>
 * </Filter>
 * ```
 */
export const Filter: React.FC<FilterProps> = ({
  title = 'Фильтры',
  children,
  onApply,
  onReset,
  defaultExpanded = false,
  disabled,
  className,
  ...props
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const handleToggle = () => {
    if (!disabled) {
      setExpanded(!expanded);
    }
  };

  const handleApply = () => {
    onApply?.();
  };

  const handleReset = () => {
    onReset?.();
  };

  return (
    <StyledPaper className={className} {...props}>
      <FilterHeader onClick={handleToggle}>
        <Box display="flex" alignItems="center">
          <FilterListIcon sx={{ mr: 1 }} />
          <Typography variant="subtitle1">{title}</Typography>
        </Box>
        <IconButton
          size="small"
          disabled={disabled}
          sx={{ transform: expanded ? 'rotate(180deg)' : 'none' }}
        >
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </FilterHeader>
      
      <Collapse in={expanded}>
        <Box sx={{ mt: 2 }}>
          <Stack spacing={2}>
            {children}
            
            <Stack
              direction="row"
              spacing={1}
              justifyContent="flex-end"
              sx={{ mt: 2 }}
            >
              <Button
                variant="outlined"
                onClick={handleReset}
                disabled={disabled}
              >
                Сбросить
              </Button>
              <Button
                variant="contained"
                onClick={handleApply}
                disabled={disabled}
              >
                Применить
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Collapse>
    </StyledPaper>
  );
};

export default Filter; 