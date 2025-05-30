import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Paper,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TablePagination,
  Alert,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import {
  useGetCarBrandsQuery,
  useCreateCarBrandMutation,
  useUpdateCarBrandMutation,
  useDeleteCarBrandMutation,
} from '../../api';
import { CarBrand, CarBrandFormData } from '../../types/car';

const validationSchema = yup.object({
  name: yup.string().required('Название обязательно'),
  is_active: yup.boolean(),
});

const CarBrandsPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingBrand, setEditingBrand] = useState<CarBrand | null>(null);

  // RTK Query хуки
  const { data: brandsData, isLoading, error: fetchError } = useGetCarBrandsQuery({
    page: page + 1,
    per_page: rowsPerPage,
    query: searchQuery || undefined,
  });

  const [createBrand, { error: createError }] = useCreateCarBrandMutation();
  const [updateBrand, { error: updateError }] = useUpdateCarBrandMutation();
  const [deleteBrand, { error: deleteError }] = useDeleteCarBrandMutation();

  const error = fetchError || createError || updateError || deleteError;
  const brands = brandsData?.data || [];
  const totalItems = brandsData?.pagination?.total_count || 0;

  const formik = useFormik<CarBrandFormData>({
    initialValues: {
      name: '',
      is_active: true,
      logo: null,
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        if (editingBrand) {
          await updateBrand({ id: editingBrand.id.toString(), data: values }).unwrap();
        } else {
          await createBrand(values).unwrap();
        }
        resetForm();
        setOpenDialog(false);
        setEditingBrand(null);
      } catch (err) {
        console.error('Failed to save brand:', err);
      }
    },
  });

  const handleOpenDialog = (brand?: CarBrand) => {
    if (brand) {
      setEditingBrand(brand);
      formik.setValues({
        name: brand.name,
        is_active: brand.is_active,
        logo: null, // При редактировании не загружаем старый логотип
      });
    } else {
      setEditingBrand(null);
      formik.resetForm();
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingBrand(null);
    formik.resetForm();
  };

  const handleDeleteBrand = async (id: number) => {
    try {
      await deleteBrand(id.toString()).unwrap();
    } catch (err) {
      console.error('Failed to delete brand:', err);
    }
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Бренды автомобилей</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Добавить бренд
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Произошла ошибка: {error.toString()}
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          placeholder="Поиск по названию"
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ minWidth: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Название</TableCell>
              <TableCell>Логотип</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Кол-во моделей</TableCell>
              <TableCell>Дата создания</TableCell>
              <TableCell align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {brands.map((brand: CarBrand) => (
              <TableRow key={brand.id}>
                <TableCell>{brand.id}</TableCell>
                <TableCell>{brand.name}</TableCell>
                <TableCell>
                  {brand.logo ? (
                    <img src={brand.logo} alt={brand.name} style={{ height: 40, width: 'auto' }} />
                  ) : (
                    'Нет логотипа'
                  )}
                </TableCell>
                <TableCell>{brand.is_active ? 'Активный' : 'Неактивный'}</TableCell>
                <TableCell>{brand.models_count}</TableCell>
                <TableCell>{new Date(brand.created_at).toLocaleDateString()}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Редактировать">
                    <IconButton onClick={() => handleOpenDialog(brand)} size="small">
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Удалить">
                    <IconButton
                      onClick={() => handleDeleteBrand(brand.id)}
                      size="small"
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={totalItems}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[10, 25, 50, 100]}
          labelRowsPerPage="Строк на странице:"
          labelDisplayedRows={({ from, to, count }) => 
            `${from}-${to} из ${count !== -1 ? count : `более чем ${to}`}`
          }
        />
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>
            {editingBrand ? 'Редактировать бренд' : 'Добавить бренд'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                name="name"
                label="Название"
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
              
              <input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.currentTarget.files?.[0];
                  formik.setFieldValue('logo', file || null);
                }}
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.is_active}
                    onChange={(e) => formik.setFieldValue('is_active', e.target.checked)}
                    name="is_active"
                  />
                }
                label="Активный"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Отмена</Button>
            <Button type="submit" variant="contained" color="primary">
              {editingBrand ? 'Сохранить' : 'Создать'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default CarBrandsPage;