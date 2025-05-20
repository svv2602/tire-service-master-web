import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
  CircularProgress,
  Snackbar,
  Alert,
  Tooltip,
  TablePagination,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
  SelectChangeEvent,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchCities, deleteCity, createCity, updateCity, clearError } from '../../store/slices/citiesSlice';
import { fetchRegions } from '../../store/slices/regionsSlice';
import { useFormik } from 'formik';
import * as yup from 'yup';

// Схема валидации для города
const validationSchema = yup.object({
  name: yup.string().required('Название города обязательно'),
  region_id: yup.number().required('Регион обязателен'),
});

const CitiesPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { cities, loading, error, totalItems } = useSelector((state: RootState) => state.cities);
  const { regions } = useSelector((state: RootState) => state.regions);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCity, setEditingCity] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState<number | ''>('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Загрузка городов и регионов при монтировании компонента
  useEffect(() => {
    dispatch(fetchRegions({ active: true }));
    loadCities();
  }, [page, rowsPerPage, searchQuery, regionFilter]);

  const loadCities = () => {
    dispatch(fetchCities({
      page: page + 1,
      per_page: rowsPerPage,
      query: searchQuery || undefined,
      region_id: regionFilter || undefined
    }));
  };

  // Обработчики пагинации
  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Формик для формы города
  const formik = useFormik({
    initialValues: {
      name: '',
      region_id: 0,
      is_active: true,
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        if (editingCity) {
          await dispatch(updateCity({ id: editingCity.id, data: values })).unwrap();
          setSuccessMessage('Город успешно обновлен');
        } else {
          await dispatch(createCity(values)).unwrap();
          setSuccessMessage('Город успешно создан');
        }
        handleCloseDialog();
        loadCities();
      } catch (error) {
        console.error('Ошибка при сохранении:', error);
      }
    },
  });

  // Открытие диалога создания/редактирования
  const handleOpenDialog = (city?: any) => {
    if (city) {
      setEditingCity(city);
      formik.setValues({
        name: city.name,
        region_id: city.region_id,
        is_active: city.is_active,
      });
    } else {
      setEditingCity(null);
      formik.resetForm();
    }
    setOpenDialog(true);
  };

  // Закрытие диалога
  const handleCloseDialog = () => {
    setOpenDialog(false);
    formik.resetForm();
    setEditingCity(null);
  };

  // Удаление города
  const handleDeleteCity = async (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить этот город?')) {
      try {
        await dispatch(deleteCity(id)).unwrap();
        setSuccessMessage('Город успешно удален');
        loadCities();
      } catch (error: any) {
        console.error('Ошибка при удалении:', error);
      }
    }
  };

  // Обработчик поиска
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };

  // Обработчик фильтра по региону
  const handleRegionFilterChange = (event: SelectChangeEvent<number | string>) => {
    const value = event.target.value;
    setRegionFilter(value === '' ? '' : Number(value));
    setPage(0);
  };

  // Закрытие уведомления
  const handleCloseSnackbar = () => {
    setSuccessMessage(null);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Управление городами</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Добавить город
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => dispatch(clearError())}>
          {error}
        </Alert>
      )}

      <Paper sx={{ mb: 3, p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField
            label="Поиск по названию"
            variant="outlined"
            size="small"
            fullWidth
            value={searchQuery}
            onChange={handleSearch}
            InputProps={{
              startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
            }}
          />
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel id="region-filter-label">Фильтр по региону</InputLabel>
            <Select
              labelId="region-filter-label"
              id="region-filter"
              value={regionFilter}
              label="Фильтр по региону"
              onChange={handleRegionFilterChange}
            >
              <MenuItem value="">Все регионы</MenuItem>
              {regions.map((region) => (
                <MenuItem key={region.id} value={region.id}>
                  {region.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Название</TableCell>
                  <TableCell>Регион</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell align="right">Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      Города не найдены
                    </TableCell>
                  </TableRow>
                ) : (
                  cities.map((city) => (
                    <TableRow key={city.id}>
                      <TableCell>{city.id}</TableCell>
                      <TableCell>{city.name}</TableCell>
                      <TableCell>{city.region?.name || `Регион ID ${city.region_id}`}</TableCell>
                      <TableCell>
                        <Chip
                          label={city.is_active ? 'Активен' : 'Неактивен'}
                          color={city.is_active ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Редактировать">
                          <IconButton
                            color="primary"
                            onClick={() => handleOpenDialog(city)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Удалить">
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteCity(city.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={totalItems}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Строк на странице:"
            />
          </>
        )}
      </TableContainer>

      {/* Диалог создания/редактирования города */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>
            {editingCity ? 'Редактирование города' : 'Добавление города'}
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              id="name"
              name="name"
              label="Название города"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
              margin="normal"
            />
            <FormControl
              fullWidth
              margin="normal"
              error={formik.touched.region_id && Boolean(formik.errors.region_id)}
            >
              <InputLabel id="region-label">Регион</InputLabel>
              <Select
                labelId="region-label"
                id="region_id"
                name="region_id"
                value={formik.values.region_id}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                label="Регион"
              >
                {regions.map((region) => (
                  <MenuItem key={region.id} value={region.id}>
                    {region.name}
                  </MenuItem>
                ))}
              </Select>
              {formik.touched.region_id && formik.errors.region_id && (
                <FormHelperText>{formik.errors.region_id as string}</FormHelperText>
              )}
            </FormControl>
            <FormControlLabel
              control={
                <Switch
                  checked={formik.values.is_active}
                  onChange={(e) => formik.setFieldValue('is_active', e.target.checked)}
                  name="is_active"
                  color="primary"
                />
              }
              label="Активен"
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Отмена</Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={formik.isSubmitting || !formik.isValid}
            >
              {formik.isSubmitting ? <CircularProgress size={24} /> : 'Сохранить'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar
        open={Boolean(successMessage)}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CitiesPage; 