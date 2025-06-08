import React from 'react';
import MuiRating from '@mui/material/Rating';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import FormHelperText from '@mui/material/FormHelperText';
import { styled } from '@mui/material/styles';
import { RatingProps } from './types';

/**
 * Стилизованный компонент FormControl
 */
const StyledFormControl = styled(FormControl)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.5),
}));

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

  return (
    <StyledFormControl error={error}>
      {label && (
        <FormLabel
          component="legend"
          error={error}
        >
          {label}
        </FormLabel>
      )}
      
      <MuiRating
        value={value}
        onChange={handleChange}
        max={max}
        size={size}
        readOnly={readOnly}
        disabled={disabled}
        precision={precision}
        {...muiProps}
      />
      
      {helperText && (
        <FormHelperText error={error}>
          {helperText}
        </FormHelperText>
      )}
    </StyledFormControl>
  );
};

export default Rating; 