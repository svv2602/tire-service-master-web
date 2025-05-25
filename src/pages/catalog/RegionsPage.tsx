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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchRegions, deleteRegion, createRegion, updateRegion, clearError } from '../../store/slices/regionsSlice';
import { useFormik } from 'formik';
import * as yup from 'yup';

// Схема валидации для региона
const validationSchema = yup.object({
  name: yup.string().required('Название региона обязательно'),
  code: yup.string(),
});

const RegionsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { regions, loading, error, totalItems } = useSelector((state: RootState) => state.regions);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingRegion, setEditingRegion] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Загрузка регионов при монтировании компонента
  useEffect(() => {
    loadRegions();
  }, [page, rowsPerPage, searchQuery, loadRegions]);

  const loadRegions = useCallback(() => {    dispatch(fetchRegions({      page: page + 1,      per_page: rowsPerPage,      query: searchQuery || undefined    }));  }, [dispatch, page, rowsPerPage, searchQuery]);

  // Обработчики пагинации
  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Формик для формы региона
  const formik = useFormik({
    initialValues: {
      name: '',
      code: '',
      is_active: true, // Always include is_active with a default value
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        if (editingRegion) {
          await dispatch(updateRegion({
            id: editingRegion.id,
            data: {
              ...values,
              is_active: values.is_active || false // Ensure is_active is always defined
            }
          })).unwrap();
          setSuccessMessage('Регион успешно обновлен');
        } else {
          await dispatch(createRegion({
            ...values,
            is_active: values.is_active || false // Ensure is_active is always defined
          })).unwrap();
          setSuccessMessage('Регион успешно создан');
        }
        handleCloseDialog();
        loadRegions();
      } catch (error) {
        console.error('Ошибка при сохранении:', error);
      }
    },
  });

  // Открытие диалога создания/редактирования
  const handleOpenDialog = (region?: any) => {
    if (region) {
      setEditingRegion(region);
      formik.setValues({
        name: region.name,
        code: region.code || '',
        is_active: region.is_active,
      });
    } else {
      setEditingRegion(null);
      formik.resetForm();
    }
    setOpenDialog(true);
  };

  // Закрытие диалога
  const handleCloseDialog = () => {
    setOpenDialog(false);
    formik.resetForm();
    setEditingRegion(null);
  };

  // Удаление региона
  const handleDeleteRegion = async (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить этот регион?')) {
      try {
        await dispatch(deleteRegion(id)).unwrap();
        setSuccessMessage('Регион успешно удален');
        loadRegions();
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
        <Typography variant="h4">Управление регионами</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Добавить регион
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
                  <TableCell>Код</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell align="right">Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {regions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      Регионы не найдены
                    </TableCell>
                  </TableRow>
                ) : (
                  regions.map((region) => (
                    <TableRow key={region.id}>
                      <TableCell>{region.id}</TableCell>
                      <TableCell>{region.name}</TableCell>
                      <TableCell>{region.code || '—'}</TableCell>
                      <TableCell>
                        <Chip
                          label={region.is_active ? 'Активен' : 'Неактивен'}
                          color={region.is_active ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Редактировать">
                          <IconButton
                            color="primary"
                            onClick={() => handleOpenDialog(region)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Удалить">
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteRegion(region.id)}
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

      {/* Диалог создания/редактирования региона */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>
            {editingRegion ? 'Редактирование региона' : 'Добавление региона'}
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              id="name"
              name="name"
              label="Название региона"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
              margin="normal"
            />
            <TextField
              fullWidth
              id="code"
              name="code"
              label="Код региона"
              value={formik.values.code}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.code && Boolean(formik.errors.code)}
              helperText={formik.touched.code && formik.errors.code}
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

export default RegionsPage; 