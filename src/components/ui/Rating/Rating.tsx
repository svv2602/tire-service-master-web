import React from 'react';
import MuiRating from '@mui/material/Rating';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import FormHelperText from '@mui/material/FormHelperText';
import { styled, useTheme } from '@mui/material/styles';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { RatingProps } from './types';
import { tokens } from '../../../styles/theme/tokens';

/**
 * Стилизованный компонент FormControl
 */
const StyledFormControl = styled(FormControl)(({ theme }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing.xs,
  };
});

/**
 * Стилизованный компонент Rating
 */
const StyledRating = styled(MuiRating)(({ theme }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    '& .MuiRating-iconFilled': {
      color: theme.palette.mode === 'dark' ? '#FFD700' : '#FFB400',
    },
    '& .MuiRating-iconHover': {
      color: theme.palette.mode === 'dark' ? '#FFE066' : '#FFCC33',
    },
    '& .MuiRating-iconEmpty': {
      color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.26)',
    },
    '&.Mui-disabled': {
      opacity: 0.5,
    },
  };
});

/**
 * Компонент Rating - звездочный рейтинг с поддержкой различных размеров и состояний
 */
const Rating: React.FC<RatingProps> = ({
  value,
  onChange,
  max = 5,
  size = 'medium',
  readOnly = false,
  disabled = false,
  precision = 1,
  label,
  helperText,
  error = false,
  ...muiProps
}) => {
  /**
   * Обработчик изменения значения
   */
  const handleChange = (event: React.SyntheticEvent, newValue: number | null) => {
    onChange?.(newValue);
  };

  const theme = useTheme();
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return (
    <StyledFormControl error={error}>
      {label && (
        <FormLabel
          component="legend"
          error={error}
          sx={{
            fontFamily: tokens.typography.fontFamily,
            fontSize: tokens.typography.fontSize.sm,
            color: error ? themeColors.error : themeColors.textSecondary,
            marginBottom: tokens.spacing.xxs,
          }}
        >
          {label}
        </FormLabel>
      )}
      
      <StyledRating
        value={value}
        onChange={handleChange}
        max={max}
        size={size}
        readOnly={readOnly}
        disabled={disabled}
        precision={precision}
        icon={<StarIcon fontSize="inherit" />}
        emptyIcon={<StarBorderIcon fontSize="inherit" />}
        {...muiProps}
      />
      
      {helperText && (
        <FormHelperText 
          error={error}
          sx={{
            fontFamily: tokens.typography.fontFamily,
            fontSize: tokens.typography.fontSize.xs,
            marginTop: tokens.spacing.xxs,
            color: error ? themeColors.error : themeColors.textSecondary,
          }}
        >
          {helperText}
        </FormHelperText>
      )}
    </StyledFormControl>
  );
};

export default Rating; 