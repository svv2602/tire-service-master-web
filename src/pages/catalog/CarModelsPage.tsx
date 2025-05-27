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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
  useGetCarModelsQuery,
  useGetCarBrandsQuery,
  useCreateCarModelMutation,
  useUpdateCarModelMutation,
  useDeleteCarModelMutation,
} from '../../api';
import { CarModel, CarBrand } from '../../types/car';

const validationSchema = yup.object({
  name: yup.string().required('Название обязательно'),
  code: yup.string().required('Код обязателен'),
  brand_id: yup.number().required('Бренд обязателен'),
});

interface ModelFormValues {
  name: string;
  code: string;
  brand_id: number;
  is_active: boolean;
  is_popular: boolean;
  year_start?: number | null;
  year_end?: number | null;
}

const CarModelsPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrandId, setSelectedBrandId] = useState<number | ''>('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingModel, setEditingModel] = useState<CarModel | null>(null);

  // RTK Query хуки
  const { data: modelsData, isLoading, error: fetchError } = useGetCarModelsQuery({
    page: page + 1,
    per_page: rowsPerPage,
    query: searchQuery || undefined,
    brand_id: selectedBrandId || undefined,
  });

  const { data: brandsData } = useGetCarBrandsQuery({});
  const [createModel, { error: createError }] = useCreateCarModelMutation();
  const [updateModel, { error: updateError }] = useUpdateCarModelMutation();
  const [deleteModel, { error: deleteError }] = useDeleteCarModelMutation();

  const error = fetchError || createError || updateError || deleteError;
  const models = modelsData?.data || [];
  const totalItems = modelsData?.total || 0;
  const brands = brandsData?.data || [];

  const formik = useFormik<ModelFormValues>({
    initialValues: {
      name: '',
      code: '',
      brand_id: 0,
      is_active: true,
      is_popular: false,
      year_start: null,
      year_end: null,
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const submitData = {
          ...values,
          year_start: values.year_start || undefined,
          year_end: values.year_end || undefined,
        };
        
        if (editingModel) {
          await updateModel({ id: editingModel.id, data: submitData }).unwrap();
        } else {
          await createModel(submitData).unwrap();
        }
        resetForm();
        setOpenDialog(false);
        setEditingModel(null);
      } catch (err) {
        console.error('Failed to save model:', err);
      }
    },
  });

  const handleOpenDialog = (model?: CarModel) => {
    if (model) {
      setEditingModel(model);
      formik.setValues({
        name: model.name,
        code: model.code,
        brand_id: model.brand_id,
        is_active: model.is_active,
        is_popular: model.is_popular,
        year_start: model.year_start,
        year_end: model.year_end,
      });
    } else {
      setEditingModel(null);
      formik.resetForm();
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingModel(null);
    formik.resetForm();
  };

  const handleDeleteModel = async (id: string) => {
    try {
      await deleteModel(id).unwrap();
    } catch (err) {
      console.error('Failed to delete model:', err);
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
        <Typography variant="h4">Модели автомобилей</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Добавить модель
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Произошла ошибка: {error.toString()}
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
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
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Бренд</InputLabel>
            <Select
              value={selectedBrandId}
              onChange={(e) => setSelectedBrandId(e.target.value as number)}
              label="Бренд"
            >
              <MenuItem value="">Все бренды</MenuItem>
              {brands.map((brand: CarBrand) => (
                <MenuItem key={brand.id} value={brand.id}>
                  {brand.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Название</TableCell>
              <TableCell>Код</TableCell>
              <TableCell>Бренд</TableCell>
              <TableCell>Годы выпуска</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Популярная</TableCell>
              <TableCell align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {models.map((model: CarModel) => (
              <TableRow key={model.id}>
                <TableCell>{model.id}</TableCell>
                <TableCell>{model.name}</TableCell>
                <TableCell>{model.code}</TableCell>
                <TableCell>{model.brand?.name}</TableCell>
                <TableCell>
                  {model.year_start && model.year_end
                    ? `${model.year_start} - ${model.year_end}`
                    : '—'}
                </TableCell>
                <TableCell>{model.is_active ? 'Активная' : 'Неактивная'}</TableCell>
                <TableCell>{model.is_popular ? 'Да' : 'Нет'}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Редактировать">
                    <IconButton onClick={() => handleOpenDialog(model)} size="small">
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Удалить">
                    <IconButton
                      onClick={() => handleDeleteModel(model.id)}
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
            {editingModel ? 'Редактировать модель' : 'Добавить модель'}
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
              <TextField
                fullWidth
                name="code"
                label="Код"
                value={formik.values.code}
                onChange={formik.handleChange}
                error={formik.touched.code && Boolean(formik.errors.code)}
                helperText={formik.touched.code && formik.errors.code}
              />
              <FormControl fullWidth>
                <InputLabel>Бренд</InputLabel>
                <Select
                  name="brand_id"
                  value={formik.values.brand_id}
                  onChange={formik.handleChange}
                  error={formik.touched.brand_id && Boolean(formik.errors.brand_id)}
                  label="Бренд"
                >
                  {brands.map((brand: CarBrand) => (
                    <MenuItem key={brand.id} value={brand.id}>
                      {brand.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  name="year_start"
                  label="Год начала выпуска"
                  type="number"
                  value={formik.values.year_start || ''}
                  onChange={formik.handleChange}
                />
                <TextField
                  fullWidth
                  name="year_end"
                  label="Год окончания выпуска"
                  type="number"
                  value={formik.values.year_end || ''}
                  onChange={formik.handleChange}
                />
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Отмена</Button>
            <Button type="submit" variant="contained">
              {editingModel ? 'Сохранить' : 'Добавить'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default CarModelsPage; 