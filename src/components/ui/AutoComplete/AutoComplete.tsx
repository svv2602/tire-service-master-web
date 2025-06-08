import React, { useState, useCallback, useEffect, useMemo } from 'react';
import MuiAutocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import { debounce } from '@mui/material/utils';
import { AutoCompleteProps, AutoCompleteOption } from './types';

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

  return (
    <MuiAutocomplete<T, false, false, false>
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
                {loading && <CircularProgress color="inherit" size={20} />}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
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