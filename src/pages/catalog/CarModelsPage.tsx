import React, { useEffect, useState, useCallback } from 'react';
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
import { fetchCarModels, deleteCarModel, createCarModel, updateCarModel, clearError } from '../../store/slices/carModelsSlice';
import { fetchCarBrands } from '../../store/slices/carBrandsSlice';
import { useFormik } from 'formik';
import * as yup from 'yup';

// Схема валидации для модели автомобиля
const validationSchema = yup.object({
  name: yup.string().required('Название модели обязательно'),
  brand_id: yup.number().required('Бренд обязателен'),
});

const CarModelsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { carModels, loading, error, totalItems } = useSelector((state: RootState) => state.carModels);
  const { carBrands } = useSelector((state: RootState) => state.carBrands);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCarModel, setEditingCarModel] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [brandFilter, setBrandFilter] = useState<number | ''>('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Загрузка моделей и брендов при монтировании компонента
  useEffect(() => {
    dispatch(fetchCarBrands({ active: true }));
    loadCarModels();
  }, [page, rowsPerPage, searchQuery, brandFilter]);

  const loadCarModels = useCallback(() => {    dispatch(fetchCarModels({      page: page + 1,      per_page: rowsPerPage,      query: searchQuery || undefined    }));  }, [dispatch, page, rowsPerPage, searchQuery]);

  // Обработчики пагинации
  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Формик для формы модели
  const formik = useFormik({
    initialValues: {
      name: '',
      brand_id: 0,
      is_active: true,
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        if (editingCarModel) {
          await dispatch(updateCarModel({ id: editingCarModel.id, data: values })).unwrap();
          setSuccessMessage('Модель успешно обновлена');
        } else {
          await dispatch(createCarModel(values)).unwrap();
          setSuccessMessage('Модель успешно создана');
        }
        handleCloseDialog();
        loadCarModels();
      } catch (error) {
        console.error('Ошибка при сохранении:', error);
      }
    },
  });

  // Открытие диалога создания/редактирования
  const handleOpenDialog = (carModel?: any) => {
    if (carModel) {
      setEditingCarModel(carModel);
      formik.setValues({
        name: carModel.name,
        brand_id: carModel.brand_id,
        is_active: carModel.is_active,
      });
    } else {
      setEditingCarModel(null);
      formik.resetForm();
    }
    setOpenDialog(true);
  };

  // Закрытие диалога
  const handleCloseDialog = () => {
    setOpenDialog(false);
    formik.resetForm();
    setEditingCarModel(null);
  };

  // Удаление модели
  const handleDeleteCarModel = async (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить эту модель?')) {
      try {
        await dispatch(deleteCarModel(id)).unwrap();
        setSuccessMessage('Модель успешно удалена');
        loadCarModels();
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

  // Обработчик фильтра по бренду
  const handleBrandFilterChange = (event: SelectChangeEvent<number | string>) => {
    const value = event.target.value;
    setBrandFilter(value === '' ? '' : Number(value));
    setPage(0);
  };

  // Закрытие уведомления
  const handleCloseSnackbar = () => {
    setSuccessMessage(null);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Управление моделями автомобилей</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Добавить модель
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
            <InputLabel id="brand-filter-label">Фильтр по бренду</InputLabel>
            <Select
              labelId="brand-filter-label"
              id="brand-filter"
              value={brandFilter}
              label="Фильтр по бренду"
              onChange={handleBrandFilterChange}
            >
              <MenuItem value="">Все бренды</MenuItem>
              {carBrands.map((brand) => (
                <MenuItem key={brand.id} value={brand.id}>
                  {brand.name}
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
                  <TableCell>Бренд</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell align="right">Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {carModels.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      Модели не найдены
                    </TableCell>
                  </TableRow>
                ) : (
                  carModels.map((model) => (
                    <TableRow key={model.id}>
                      <TableCell>{model.id}</TableCell>
                      <TableCell>{model.name}</TableCell>
                      <TableCell>{model.brand?.name || `Бренд ID ${model.brand_id}`}</TableCell>
                      <TableCell>
                        <Chip
                          label={model.is_active ? 'Активна' : 'Неактивна'}
                          color={model.is_active ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Редактировать">
                          <IconButton
                            color="primary"
                            onClick={() => handleOpenDialog(model)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Удалить">
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteCarModel(model.id)}
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

      {/* Диалог создания/редактирования модели */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>
            {editingCarModel ? 'Редактирование модели' : 'Добавление модели'}
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              id="name"
              name="name"
              label="Название модели"
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
              error={formik.touched.brand_id && Boolean(formik.errors.brand_id)}
            >
              <InputLabel id="brand-label">Бренд</InputLabel>
              <Select
                labelId="brand-label"
                id="brand_id"
                name="brand_id"
                value={formik.values.brand_id}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                label="Бренд"
              >
                {carBrands.map((brand) => (
                  <MenuItem key={brand.id} value={brand.id}>
                    {brand.name}
                  </MenuItem>
                ))}
              </Select>
              {formik.touched.brand_id && formik.errors.brand_id && (
                <FormHelperText>{formik.errors.brand_id as string}</FormHelperText>
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
              label="Активна"
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

export default CarModelsPage; 