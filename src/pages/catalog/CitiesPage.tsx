import React, { useState, useEffect } from 'react';
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
  Check as CheckIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { 
  useGetCitiesQuery, 
  useDeleteCityMutation,
  useUpdateCityMutation,
} from '../../api';
import { useGetRegionsQuery } from '../../api';
import { City, CityFilter, Region, ApiResponse } from '../../types/models';

// Схема валидации для города
const validationSchema = yup.object({
  name: yup.string().required('Название города обязательно'),
  code: yup.string().required('Код города обязателен'),
  region_id: yup.number().required('Регион обязателен'),
});

interface CitiesQueryParams {
  page?: number;
  per_page?: number;
  query?: string;
  region_id?: number;
}

interface RegionsQueryParams {
  active?: boolean;
}

// Локальные интерфейсы для фильтров
interface RegionFilter {
  query?: string;
  page?: number;
  per_page?: number;
}

interface CityFormData {
  name: string;
  region_id: string;
  code?: string;
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

  // RTK Query хуки
  const { data: citiesData, isLoading: citiesLoading, error: citiesError } = useGetCitiesQuery({
    query: search || undefined,
    region_id: regionFilter || undefined,
    page: page + 1,
    per_page: rowsPerPage,
  });

  const { data: regionsData } = useGetRegionsQuery({});
  const [updateCity] = useUpdateCityMutation();
  const [deleteCity] = useDeleteCityMutation();

  const isLoading = citiesLoading;
  const error = citiesError;
  const cities = (citiesData as unknown as ApiResponse<City>)?.data || [];
  const totalItems = (citiesData as unknown as ApiResponse<City>)?.total || 0;
  const regions = (regionsData as unknown as ApiResponse<Region>)?.data || [];

  // Обработчики пагинации
  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Формик для формы города
  const initialValues: CityFormData = {
    name: '',
    code: '',
    region_id: '',
    is_active: true,
  };

  const formik = useFormik<CityFormData>({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      try {
        if (editingCity) {
          await updateCity({ 
            id: editingCity.id, 
            city: {
              ...values,
              region_id: parseInt(values.region_id)
            }
          }).unwrap();
          setSuccessMessage('Город успешно обновлен');
          handleCloseDialog();
        } else {
          // Создание города пока не реализовано
          console.log('Создание города:', values);
          setSuccessMessage('Функция создания города будет добавлена позже');
          handleCloseDialog();
        }
      } catch (error) {
        console.error('Ошибка при сохранении:', error);
      }
    },
  });

  // Открытие диалога создания/редактирования
  const handleOpenDialog = (city?: City) => {
    if (city) {
      setEditingCity(city);
      formik.setValues({
        name: city.name,
        code: city.name.toLowerCase().replace(/\s+/g, '_'),
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
    if (window.confirm('Вы уверены, что хотите удалить этот город?')) {
      try {
        await deleteCity(id).unwrap();
        setSuccessMessage('Город успешно удален');
      } catch (error: any) {
        console.error('Ошибка при удалении:', error);
      }
    }
  };

  // Обработчик поиска
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setPage(0);
  };

  // Обработчик фильтра по региону
  const handleRegionFilterChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    setRegionFilter(value);
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

  const handleDeleteConfirm = async () => {
    if (selectedCity) {
      try {
        await deleteCity(selectedCity.id).unwrap();
        setDeleteDialogOpen(false);
        setSelectedCity(null);
      } catch (error) {
        console.error('Ошибка при удалении города:', error);
      }
    }
  };

  const handleToggleStatus = async (city: City) => {
    try {
      await updateCity({
        id: city.id,
        city: { is_active: !city.is_active } as Partial<City>
      }).unwrap();
    } catch (error) {
      console.error('Ошибка при изменении статуса:', error);
    }
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
        <Alert severity="error" sx={{ mb: 2 }}>
          {error.toString()}
        </Alert>
      )}

      <Paper sx={{ mb: 3, p: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            label="Поиск"
            variant="outlined"
            size="small"
            value={search}
            onChange={handleSearch}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Регион</InputLabel>
            <Select
              value={regionFilter}
              label="Регион"
              onChange={handleRegionFilterChange}
            >
              <MenuItem value="">Все регионы</MenuItem>
              {regions.map((region: Region) => (
                <MenuItem key={region.id} value={region.id}>
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
                <TableCell>Код</TableCell>
                <TableCell>Регион</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : cities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Нет данных
                  </TableCell>
                </TableRow>
              ) : (
                cities.map((city: City) => (
                  <TableRow key={city.id}>
                    <TableCell>{city.name}</TableCell>
                    <TableCell>{city.name.toLowerCase().replace(/\s+/g, '_')}</TableCell>
                    <TableCell>{city.region?.name}</TableCell>
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
                          size="small"
                          onClick={() => handleOpenDialog(city)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={city.is_active ? 'Деактивировать' : 'Активировать'}>
                        <IconButton
                          size="small"
                          onClick={() => handleToggleStatus(city)}
                          color={city.is_active ? 'error' : 'success'}
                        >
                          {city.is_active ? <CloseIcon /> : <CheckIcon />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Удалить">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteClick(city)}
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
        </TableContainer>

        <TablePagination
          component="div"
          count={totalItems}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCity ? 'Редактирование города' : 'Добавление города'}
        </DialogTitle>
        <form onSubmit={formik.handleSubmit}>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="Название города"
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
              <TextField
                fullWidth
                label="Код города"
                name="code"
                value={formik.values.code}
                onChange={formik.handleChange}
                error={formik.touched.code && Boolean(formik.errors.code)}
                helperText={formik.touched.code && formik.errors.code}
              />
              <FormControl fullWidth error={formik.touched.region_id && Boolean(formik.errors.region_id)}>
                <InputLabel>Регион</InputLabel>
                <Select
                  name="region_id"
                  value={formik.values.region_id}
                  onChange={formik.handleChange}
                  label="Регион"
                >
                  {regions.map((region: Region) => (
                    <MenuItem key={region.id} value={region.id}>
                      {region.name}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.region_id && formik.errors.region_id && (
                  <FormHelperText>{formik.errors.region_id}</FormHelperText>
                )}
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
              {editingCity ? 'Сохранить' : 'Добавить'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar
        open={Boolean(successMessage)}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="success">
          {successMessage}
        </Alert>
      </Snackbar>

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
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CitiesPage; 