import React, { useState } from 'react';
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
  SelectChangeEvent,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { 
  useGetCitiesQuery, 
  useDeleteCityMutation,
  useUpdateCityMutation,
} from '../../api/cities.api';
import { useGetRegionsQuery } from '../../api/regions.api';
import { City, Region } from '../../types/models';
import { CityFilter } from '../../types/api';

// Схема валидации для города
const validationSchema = yup.object({
  name: yup.string().required('Название города обязательно'),
  region_id: yup.string().required('Регион обязателен'),
});

interface CityFormData {
  name: string;
  region_id: string;
  is_active?: boolean;
}

const CitiesPage: React.FC = () => {
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState<string>('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // RTK Query хуки
  const { data: citiesData, isLoading: citiesLoading, error: citiesError } = useGetCitiesQuery({
    query: search || undefined,
    region_id: regionFilter ? Number(regionFilter) : undefined,
    page: page + 1,
    per_page: rowsPerPage,
  });

  const { data: regionsData } = useGetRegionsQuery({});
  const [updateCity] = useUpdateCityMutation();
  const [deleteCity] = useDeleteCityMutation();

  const isLoading = citiesLoading;
  const error = citiesError;
  const cities = citiesData?.data || [];
  const totalItems = citiesData?.pagination?.total_count || 0;
  const regions = regionsData?.data || [];

  // Обработчики пагинации
  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Формик для формы города
  const formik = useFormik<CityFormData>({
    initialValues: {
      name: editingCity?.name || '',
      region_id: editingCity?.region_id?.toString() || '',
      is_active: editingCity?.is_active ?? true,
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        if (editingCity) {
          await updateCity({ 
            id: Number(editingCity.id),
            city: {
              name: values.name,
              region_id: Number(values.region_id),
              is_active: values.is_active
            }
          }).unwrap();
          setSuccessMessage('Город успешно обновлен');
          handleCloseDialog();
        } else {
          setSuccessMessage('Функция создания города будет добавлена позже');
          handleCloseDialog();
        }
      } catch (error) {
        console.error('Ошибка при сохранении города:', error);
      }
    },
  });

  // Открытие диалога создания/редактирования
  const handleOpenDialog = (city?: City) => {
    if (city) {
      setEditingCity(city);
      formik.setValues({
        name: city.name,
        region_id: city.region_id.toString(),
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
    try {
      await deleteCity(Number(id)).unwrap();
      setSuccessMessage('Город успешно удален');
      setDeleteDialogOpen(false);
      setSelectedCity(null);
    } catch (error) {
      console.error('Ошибка при удалении города:', error);
      setErrorMessage('Не удалось удалить город');
    }
  };

  // Обработчик поиска
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setPage(0);
  };

  // Обработчик фильтра по региону
  const handleRegionFilterChange = (event: SelectChangeEvent<string>) => {
    setRegionFilter(event.target.value);
    setPage(0);
  };

  // Закрытие уведомления
  const handleCloseSnackbar = () => {
    setSuccessMessage(null);
  };

  const handleDeleteClick = (city: City) => {
    setSelectedCity(city);
    setDeleteDialogOpen(true);
  };

  const handleToggleStatus = async (city: City) => {
    try {
      await updateCity({
        id: Number(city.id),
        city: { is_active: !city.is_active }
      }).unwrap();
    } catch (error) {
      console.error('Ошибка при изменении статуса:', error);
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        Произошла ошибка при загрузке данных: {(error as any)?.data?.message || 'Неизвестная ошибка'}
      </Alert>
    );
  }

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

      <Paper sx={{ mb: 2, p: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            label="Поиск"
            variant="outlined"
            size="small"
            value={search}
            onChange={handleSearch}
            InputProps={{
              startAdornment: <SearchIcon color="action" />,
            }}
            sx={{ minWidth: 200 }}
          />
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Регион</InputLabel>
            <Select
              value={regionFilter}
              onChange={handleRegionFilterChange}
              label="Регион"
            >
              <MenuItem value="">Все регионы</MenuItem>
              {regions.map((region: Region) => (
                <MenuItem key={region.id} value={region.id.toString()}>
                  {region.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Название</TableCell>
                <TableCell>Регион</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cities.map((city: City) => (
                <TableRow key={city.id}>
                  <TableCell>{city.name}</TableCell>
                  <TableCell>
                    {regions.find(r => r.id.toString() === city.region_id.toString())?.name}
                  </TableCell>
                  <TableCell>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={city.is_active}
                          onChange={() => handleToggleStatus(city)}
                          color="primary"
                        />
                      }
                      label={city.is_active ? 'Активен' : 'Неактивен'}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                      <Tooltip title="Редактировать">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(city)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Удалить">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteClick(city)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={totalItems}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Paper>

      {/* Диалог создания/редактирования */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>
            {editingCity ? 'Редактировать город' : 'Добавить город'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="Название"
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
              <FormControl fullWidth>
                <InputLabel>Регион</InputLabel>
                <Select
                  name="region_id"
                  value={formik.values.region_id}
                  onChange={formik.handleChange}
                  label="Регион"
                  error={formik.touched.region_id && Boolean(formik.errors.region_id)}
                >
                  {regions.map((region: Region) => (
                    <MenuItem key={region.id} value={region.id.toString()}>
                      {region.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControlLabel
                control={
                  <Switch
                    name="is_active"
                    checked={formik.values.is_active}
                    onChange={formik.handleChange}
                  />
                }
                label="Активен"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Отмена</Button>
            <Button type="submit" variant="contained" color="primary">
              {editingCity ? 'Сохранить' : 'Создать'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Диалог подтверждения удаления */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <Typography>
            Вы действительно хотите удалить город {selectedCity?.name}?
            Это действие нельзя будет отменить.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Отмена</Button>
          <Button
            onClick={() => selectedCity && handleDeleteCity(selectedCity.id)}
            color="error"
            variant="contained"
          >
            Удалить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Уведомление об успехе */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success">
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CitiesPage; 