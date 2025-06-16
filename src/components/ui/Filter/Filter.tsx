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
import { styled, useTheme } from '@mui/material/styles';
import FilterListIcon from '@mui/icons-material/FilterList';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { tokens } from '../../../styles/theme/tokens';

// Стилизованные компоненты
const StyledPaper = styled(Paper)(({ theme }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    padding: tokens.spacing.md,
    borderRadius: tokens.borderRadius.md,
    backgroundColor: themeColors.backgroundPrimary,
    border: `1px solid ${themeColors.borderPrimary}`,
    boxShadow: tokens.shadows.sm,
    transition: tokens.transitions.duration.normal,
  };
});

const FilterHeader = styled(Box)(({ theme }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    padding: tokens.spacing.sm,
    borderRadius: tokens.borderRadius.sm,
    transition: `background-color ${tokens.transitions.duration.fast} ${tokens.transitions.easing.easeInOut}`,
    
    '&:hover': {
      backgroundColor: theme.palette.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.05)' 
        : 'rgba(0, 0, 0, 0.03)',
    },
  };
});

const StyledIconButton = styled(IconButton)(({ theme }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    color: themeColors.textSecondary,
    transition: `all ${tokens.transitions.duration.normal} ${tokens.transitions.easing.easeInOut}`,
    
    '&:hover': {
      backgroundColor: theme.palette.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.08)' 
        : 'rgba(0, 0, 0, 0.04)',
      color: themeColors.textPrimary,
    },
    
    '&.Mui-disabled': {
      color: themeColors.textDisabled,
    },
  };
});

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
  const theme = useTheme();
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;

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
          <FilterListIcon sx={{ 
            mr: tokens.spacing.sm,
            color: themeColors.primary,
            fontSize: tokens.typography.fontSize.xl,
          }} />
          <Typography 
            variant="subtitle1"
            sx={{
              fontFamily: tokens.typography.fontFamily,
              fontSize: tokens.typography.fontSize.md,
              fontWeight: tokens.typography.fontWeight.medium,
              color: themeColors.textPrimary,
            }}
          >
            {title}
          </Typography>
        </Box>
        <StyledIconButton
          size="small"
          disabled={disabled}
          sx={{ 
            transform: expanded ? 'rotate(180deg)' : 'none',
            transition: `transform ${tokens.transitions.duration.normal} ${tokens.transitions.easing.easeInOut}`,
          }}
        >
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </StyledIconButton>
      </FilterHeader>
      
      <Collapse 
        in={expanded} 
        timeout={parseInt(tokens.transitions.duration.normal)}
        sx={{
          transition: `all ${tokens.transitions.duration.normal} ${tokens.transitions.easing.easeInOut}`,
        }}
      >
        <Box sx={{ mt: tokens.spacing.md }}>
          <Stack spacing={tokens.spacing.md}>
            {children}
            
            <Stack
              direction="row"
              spacing={tokens.spacing.sm}
              justifyContent="flex-end"
              sx={{ mt: tokens.spacing.md }}
            >
              <Button
                variant="outlined"
                onClick={handleReset}
                disabled={disabled}
                sx={{
                  fontFamily: tokens.typography.fontFamily,
                  fontSize: tokens.typography.fontSize.md,
                  fontWeight: tokens.typography.fontWeight.medium,
                  transition: tokens.transitions.duration.normal,
                  borderRadius: tokens.borderRadius.md,
                  textTransform: 'none',
                  padding: `${tokens.spacing.xs} ${tokens.spacing.md}`,
                }}
              >
                Сбросить
              </Button>
              <Button
                variant="contained"
                onClick={handleApply}
                disabled={disabled}
                sx={{
                  fontFamily: tokens.typography.fontFamily,
                  fontSize: tokens.typography.fontSize.md,
                  fontWeight: tokens.typography.fontWeight.medium,
                  transition: tokens.transitions.duration.normal,
                  borderRadius: tokens.borderRadius.md,
                  textTransform: 'none',
                  padding: `${tokens.spacing.xs} ${tokens.spacing.md}`,
                  backgroundColor: themeColors.primary,
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark' 
                      ? themeColors.primaryDark 
                      : themeColors.primaryLight,
                  },
                }}
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