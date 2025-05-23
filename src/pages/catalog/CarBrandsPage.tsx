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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchCarBrands, deleteCarBrand, createCarBrand, updateCarBrand, clearError } from '../../store/slices/carBrandsSlice';
import { useFormik } from 'formik';
import * as yup from 'yup';

// Схема валидации для бренда
const validationSchema = yup.object({
  name: yup.string().required('Название бренда обязательно'),
  logo_url: yup.string(),
});

const CarBrandsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { carBrands, loading, error, totalItems } = useSelector((state: RootState) => state.carBrands);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingBrand, setEditingBrand] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Загрузка брендов при монтировании компонента
  useEffect(() => {
    loadBrands();
  }, [page, rowsPerPage, searchQuery]);

  const loadBrands = () => {
    dispatch(fetchCarBrands({
      page: page + 1,
      per_page: rowsPerPage,
      query: searchQuery || undefined
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

  // Формик для формы бренда
  const formik = useFormik({
    initialValues: {
      name: '',
      logo_url: '',
      is_active: true,
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        if (editingBrand) {
          await dispatch(updateCarBrand({ id: editingBrand.id, data: values })).unwrap();
          setSuccessMessage('Бренд успешно обновлен');
        } else {
          await dispatch(createCarBrand(values)).unwrap();
          setSuccessMessage('Бренд успешно создан');
        }
        handleCloseDialog();
        loadBrands();
      } catch (error) {
        console.error('Ошибка при сохранении:', error);
      }
    },
  });

  // Открытие диалога создания/редактирования
  const handleOpenDialog = (brand?: any) => {
    if (brand) {
      setEditingBrand(brand);
      formik.setValues({
        name: brand.name,
        logo_url: brand.logo_url || '',
        is_active: brand.is_active,
      });
    } else {
      setEditingBrand(null);
      formik.resetForm();
    }
    setOpenDialog(true);
  };

  // Закрытие диалога
  const handleCloseDialog = () => {
    setOpenDialog(false);
    formik.resetForm();
    setEditingBrand(null);
  };

  // Удаление бренда
  const handleDeleteBrand = async (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить этот бренд?')) {
      try {
        await dispatch(deleteCarBrand(id)).unwrap();
        setSuccessMessage('Бренд успешно удален');
        loadBrands();
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

  // Закрытие уведомления
  const handleCloseSnackbar = () => {
    setSuccessMessage(null);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Управление брендами автомобилей</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Добавить бренд
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => dispatch(clearError())}>
          {error}
        </Alert>
      )}

      <Paper sx={{ mb: 3, p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
                  <TableCell>Логотип</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell align="right">Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {carBrands.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      Бренды не найдены
                    </TableCell>
                  </TableRow>
                ) : (
                  carBrands.map((brand) => (
                    <TableRow key={brand.id}>
                      <TableCell>{brand.id}</TableCell>
                      <TableCell>{brand.name}</TableCell>
                      <TableCell>
                        {brand.logo_url ? (
                          <img 
                            src={brand.logo_url} 
                            alt={`Логотип ${brand.name}`} 
                            style={{ maxHeight: 40, maxWidth: 80 }} 
                          />
                        ) : '—'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={brand.is_active ? 'Активен' : 'Неактивен'}
                          color={brand.is_active ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Редактировать">
                          <IconButton
                            color="primary"
                            onClick={() => handleOpenDialog(brand)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Удалить">
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteBrand(brand.id)}
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

      {/* Диалог создания/редактирования бренда */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>
            {editingBrand ? 'Редактирование бренда' : 'Добавление бренда'}
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              id="name"
              name="name"
              label="Название бренда"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
              margin="normal"
            />
            <TextField
              fullWidth
              id="logo_url"
              name="logo_url"
              label="URL логотипа"
              value={formik.values.logo_url}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.logo_url && Boolean(formik.errors.logo_url)}
              helperText={formik.touched.logo_url && formik.errors.logo_url}
              margin="normal"
            />
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

export default CarBrandsPage;