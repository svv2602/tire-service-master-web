import React, { useState, useCallback, useEffect, useMemo } from 'react';
import MuiAutocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import { debounce } from '@mui/material/utils';
import { styled, useTheme } from '@mui/material/styles';
import { AutoCompleteProps, AutoCompleteOption } from './types';
import { tokens } from '../../../styles/theme/tokens';

// Стилизованный Autocomplete
const StyledAutocomplete = styled(MuiAutocomplete)(({ theme }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    '& .MuiAutocomplete-inputRoot': {
      fontFamily: tokens.typography.fontFamily,
      fontSize: tokens.typography.fontSize.md,
      transition: tokens.transitions.duration.normal,
      
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: themeColors.primary,
        borderWidth: '2px',
      },
    },
    
    '& .MuiAutocomplete-tag': {
      backgroundColor: theme.palette.mode === 'dark' 
        ? themeColors.backgroundSecondary 
        : themeColors.backgroundTertiary,
      color: themeColors.textPrimary,
      margin: tokens.spacing.xxs,
      borderRadius: tokens.borderRadius.sm,
      fontSize: tokens.typography.fontSize.sm,
      fontFamily: tokens.typography.fontFamily,
      transition: tokens.transitions.duration.normal,
    },
    
    '& .MuiAutocomplete-listbox': {
      fontFamily: tokens.typography.fontFamily,
      padding: tokens.spacing.xs,
      
      '& .MuiAutocomplete-option': {
        padding: `${tokens.spacing.xs} ${tokens.spacing.sm}`,
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
            ? 'rgba(255, 255, 255, 0.08)' 
            : 'rgba(0, 0, 0, 0.04)',
        },
      },
    },
    
    '& .MuiAutocomplete-noOptions': {
      fontFamily: tokens.typography.fontFamily,
      fontSize: tokens.typography.fontSize.sm,
      color: themeColors.textSecondary,
      padding: tokens.spacing.md,
    },
    
    '& .MuiAutocomplete-loading': {
      fontFamily: tokens.typography.fontFamily,
      fontSize: tokens.typography.fontSize.sm,
      color: themeColors.textSecondary,
      padding: tokens.spacing.md,
    },
    
    '& .MuiAutocomplete-endAdornment': {
      top: 'calc(50% - 14px)',
      
      '& .MuiAutocomplete-popupIndicator': {
        color: themeColors.textSecondary,
        transition: tokens.transitions.duration.normal,
      },
      
      '& .MuiAutocomplete-clearIndicator': {
        color: themeColors.textSecondary,
        visibility: 'visible',
        opacity: 0.6,
        
        '&:hover': {
          opacity: 1,
          backgroundColor: theme.palette.mode === 'dark' 
            ? 'rgba(255, 255, 255, 0.08)' 
            : 'rgba(0, 0, 0, 0.04)',
        },
      },
    },
  };
});

/**
 * Компонент AutoComplete - поле с автодополнением и асинхронным поиском
 */
const AutoComplete = <T extends AutoCompleteOption>({
  options: initialOptions,
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
}: AutoCompleteProps<T>) => {
  // Состояние компонента
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState<T[]>(initialOptions);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  /**
   * Обработчик асинхронного поиска с debounce
   */
  const debouncedSearch = useMemo(
    () =>
      debounce(async (query: string) => {
        if (!onSearch || query.length < minSearchLength) {
          return;
        }

        setLoading(true);
        try {
          const results = await onSearch(query);
          setOptions(results);
        } catch (error) {
          console.error('Ошибка при поиске:', error);
          setOptions([]);
        } finally {
          setLoading(false);
        }
      }, debounceMs),
    [onSearch, minSearchLength, debounceMs]
  );

  /**
   * Обработчик изменения значения в поле ввода
   */
  const handleInputChange = useCallback(
    (event: React.SyntheticEvent, newInputValue: string) => {
      setInputValue(newInputValue);
      if (onSearch) {
        debouncedSearch(newInputValue);
      }
    },
    [debouncedSearch, onSearch]
  );

  /**
   * Обработчик выбора значения
   */
  const handleChange = useCallback(
    (event: React.SyntheticEvent, newValue: T | null) => {
      onChange?.(newValue);
    },
    [onChange]
  );

  /**
   * Сброс опций при закрытии
   */
  useEffect(() => {
    if (!open) {
      setOptions(initialOptions);
    }
  }, [open, initialOptions]);

  const theme = useTheme();
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return (
    <StyledAutocomplete<T, false, false, false>
      options={options}
      value={value}
      onChange={handleChange}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      getOptionLabel={(option) => option.label}
      loading={loading}
      loadingText={loadingText}
      noOptionsText={noOptionsText}
      renderInput={(params) => (
        <TextField
          {...params}
          {...TextFieldProps}
          label={label}
          placeholder={placeholder}
          InputProps={{
            ...params.InputProps,
            ...TextFieldProps.InputProps,
            endAdornment: (
              <React.Fragment>
                {loading && (
                  <CircularProgress 
                    color="inherit" 
                    size={20} 
                    sx={{
                      color: themeColors.primary,
                      marginRight: tokens.spacing.xs,
                      transition: tokens.transitions.duration.normal,
                    }}
                  />
                )}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
          sx={{
            '& .MuiInputLabel-root': {
              fontFamily: tokens.typography.fontFamily,
              fontSize: tokens.typography.fontSize.md,
              transition: tokens.transitions.duration.normal,
              
              '&.Mui-focused': {
                color: themeColors.primary,
              },
            },
            ...TextFieldProps.sx,
          }}
        />
      )}
      {...AutocompleteProps}
      sx={{
        width: '100%',
        ...sx,
      }}
    />
  );
};

export default AutoComplete; 