import React, { useState, useEffect, useCallback } from 'react';
import {
  Autocomplete,
  TextField,
  CircularProgress,
  styled,
  useTheme,
} from '@mui/material';
import { debounce } from '@mui/material/utils';
import { AutoCompleteProps, AutoCompleteOption } from './types';
import { tokens } from '../../../styles/theme/tokens';

// Стилизованный Autocomplete с any для обхода проблем типизации
const StyledAutocomplete = styled(Autocomplete)(({ theme }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    '& .MuiAutocomplete-tag': {
      backgroundColor: theme.palette.mode === 'dark' 
        ? themeColors.backgroundSecondary 
        : themeColors.backgroundTertiary,
      color: themeColors.textPrimary,
      margin: tokens.spacing.xxs,
      borderRadius: tokens.borderRadius.sm,
      fontSize: tokens.typography.fontSize.sm,
      fontFamily: tokens.typography.fontFamily,
    },
    
    '& .MuiAutocomplete-option': {
      padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
      fontFamily: tokens.typography.fontFamily,
      borderRadius: tokens.borderRadius.sm,
      fontSize: tokens.typography.fontSize.md,
      transition: tokens.transitions.duration.fast,
      minHeight: '36px',
      
      '&[aria-selected="true"]': {
        backgroundColor: theme.palette.mode === 'dark' 
          ? themeColors.backgroundSecondary 
          : themeColors.backgroundTertiary,
      },
      
      '&.Mui-focused': {
        backgroundColor: theme.palette.mode === 'dark' 
          ? `${themeColors.primary}20` 
          : `${tokens.colors.primary.light}20`,
      },
    },
    
    '& .MuiOutlinedInput-root': {
      borderRadius: tokens.borderRadius.md,
      transition: tokens.transitions.duration.normal,
      
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: themeColors.borderHover,
      },
      
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: tokens.colors.primary.main,
        borderWidth: '2px',
      },
      
      '&.Mui-error .MuiOutlinedInput-notchedOutline': {
        borderColor: themeColors.error,
      },
      
      '&.Mui-disabled .MuiOutlinedInput-notchedOutline': {
        borderColor: themeColors.borderPrimary,
      },
    },
    
    '& .MuiFormLabel-root': {
      fontFamily: tokens.typography.fontFamily,
      fontSize: tokens.typography.fontSize.sm,
      
      '&.Mui-focused': {
        color: tokens.colors.primary.main,
      },
      
      '&.Mui-error': {
        color: themeColors.error,
      },
      
      '&.Mui-disabled': {
        color: themeColors.textMuted,
      },
    },
    
    '& .MuiFormHelperText-root': {
      fontFamily: tokens.typography.fontFamily,
      fontSize: tokens.typography.fontSize.xs,
      marginTop: tokens.spacing.xs,
      
      '&.Mui-error': {
        color: themeColors.error,
      },
    },
  };
});

/**
 * Компонент AutoComplete - поле с автодополнением
 * 
 * @example
 * <AutoComplete
 *   options={options}
 *   value={value}
 *   onChange={setValue}
 *   label="Выберите опцию"
 * />
 */
export const AutoComplete: React.FC<AutoCompleteProps> = ({
  options: initialOptions = [],
  value,
  onChange,
  placeholder,
  label,
  onSearch,
  debounceMs = 300,
  minSearchLength = 2,
  noOptionsText = 'Нет доступных вариантов',
  loadingText = 'Загрузка...',
  TextFieldProps = {},
  AutocompleteProps = {},
  sx,
}) => {
  const theme = useTheme();
  const [options, setOptions] = useState<AutoCompleteOption[]>(initialOptions);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  // Функция для асинхронного поиска с debounce
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (!onSearch || query.length < minSearchLength) {
        setLoading(false);
        return;
      }

      try {
        const results = await onSearch(query);
        setOptions(results);
      } catch (error) {
        console.error('Error searching options:', error);
      } finally {
        setLoading(false);
      }
    }, debounceMs),
    [onSearch, minSearchLength, debounceMs]
  );

  // Обработка изменения ввода
  const handleInputChange = (_event: React.SyntheticEvent, newInputValue: string) => {
    setInputValue(newInputValue);
    
    if (onSearch && newInputValue.length >= minSearchLength) {
      setLoading(true);
      debouncedSearch(newInputValue);
    }
  };

  // Обработка изменения значения
  const handleChange = (_event: React.SyntheticEvent, newValue: any) => {
    if (onChange) {
      onChange(newValue);
    }
  };

  // Обновление опций при изменении initialOptions
  useEffect(() => {
    if (initialOptions) {
      setOptions(initialOptions);
    }
  }, [initialOptions]);

  return (
    <StyledAutocomplete
      options={options}
      value={value}
      onChange={handleChange as any}
      onInputChange={handleInputChange}
      inputValue={inputValue}
      loading={loading}
      loadingText={loadingText}
      noOptionsText={noOptionsText}
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      getOptionLabel={(option: any) => option?.label || ''}
      isOptionEqualToValue={(option: any, val: any) => option?.id === val?.id}
      renderInput={(params) => (
        <TextField
          {...params}
          {...TextFieldProps}
          label={label}
          placeholder={placeholder}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      sx={sx}
      {...AutocompleteProps as any}
    />
  );
};

export default AutoComplete; 