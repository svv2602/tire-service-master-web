import React, { useState, useEffect, useCallback } from 'react';
import {
  Autocomplete,
  TextField,
  Box,
  Chip,
  Typography,
  CircularProgress,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { useLazyGetSearchAutocompleteQuery } from '../../../api/auditLogs.api';
import { useDebounce } from '../../../hooks/useDebounce';

interface AutocompleteSearchFieldProps {
  field: 'user_email' | 'resource_type' | 'action' | 'ip_address';
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  helperText?: string;
  disabled?: boolean;
}

export const AutocompleteSearchField: React.FC<AutocompleteSearchFieldProps> = ({
  field,
  label,
  value,
  onChange,
  placeholder,
  helperText,
  disabled = false,
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Дебаунс для поискового запроса
  const debouncedInputValue = useDebounce(inputValue, 300);

  // API хук для автокомплита
  const [triggerAutocomplete, { data: autocompleteData, isLoading }] = useLazyGetSearchAutocompleteQuery();

  // Загрузка предложений при изменении ввода
  useEffect(() => {
    if (debouncedInputValue && debouncedInputValue.length >= 2) {
      triggerAutocomplete({ field, query: debouncedInputValue });
    } else {
      setSuggestions([]);
    }
  }, [debouncedInputValue, field, triggerAutocomplete]);

  // Обновление предложений при получении данных
  useEffect(() => {
    if (autocompleteData?.suggestions) {
      setSuggestions(autocompleteData.suggestions);
    }
  }, [autocompleteData]);

  // Синхронизация с внешним значением
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInputChange = useCallback((event: React.SyntheticEvent, newInputValue: string) => {
    setInputValue(newInputValue);
  }, []);

  const handleChange = useCallback((event: React.SyntheticEvent, newValue: string | null) => {
    const selectedValue = newValue || '';
    setInputValue(selectedValue);
    onChange(selectedValue);
  }, [onChange]);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Опции для автокомплита
  const options = suggestions.length > 0 ? suggestions : [];

  return (
    <Autocomplete
      freeSolo
      options={options}
      value={value}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      onChange={handleChange}
      onOpen={handleOpen}
      onClose={handleClose}
      open={isOpen}
      loading={isLoading}
      disabled={disabled}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          helperText={helperText}
          size="small"
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                <SearchIcon color="action" fontSize="small" />
              </Box>
            ),
            endAdornment: (
              <>
                {isLoading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      renderOption={(props, option) => (
        <Box component="li" {...props}>
          <Typography variant="body2">{option}</Typography>
        </Box>
      )}
      renderTags={(value, getTagProps) =>
        value.map((option, index) => (
          <Chip
            variant="outlined"
            label={option}
            size="small"
            {...getTagProps({ index })}
            key={option}
          />
        ))
      }
      noOptionsText={
        inputValue.length < 2 
          ? "Введите минимум 2 символа для поиска"
          : isLoading 
            ? "Поиск..."
            : "Нет предложений"
      }
      loadingText="Поиск предложений..."
      clearText="Очистить"
      openText="Открыть"
      closeText="Закрыть"
      sx={{
        '& .MuiAutocomplete-inputRoot': {
          paddingLeft: '8px !important',
        },
      }}
    />
  );
}; 