import React, { useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  CircularProgress,
  Alert,
  DialogContentText,
  Pagination,
  Stack,
  Chip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  LocationCity as LocationCityIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  useGetCitiesQuery,
  useCreateCityMutation,
  useUpdateCityMutation,
  useDeleteCityMutation,
} from '../api/cities.api';
import { City, CityFormData } from '../types/models';

const validationSchema = Yup.object({
  name: Yup.string()
    .required('Название города обязательно')
    .min(2, 'Название должно содержать минимум 2 символа')
    .max(100, 'Название не должно превышать 100 символов'),
  is_active: Yup.boolean(),
  region_id: Yup.number().required('ID региона обязателен'),
});

interface CitiesListProps {
  regionId: string | number;
}

const CitiesList: React.FC<CitiesListProps> = ({ regionId }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [cityToDelete, setCityToDelete] = useState<City | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const PER_PAGE = 10;

  // RTK Query хуки
  const { data: response, isLoading } = useGetCitiesQuery({
    region_id: typeof regionId === 'string' ? parseInt(regionId) : regionId,
    page,
    per_page: PER_PAGE,
    query: searchQuery || undefined,
  });

  const cities = response?.data || [];
  const totalPages = response?.pagination?.total_count ? Math.ceil(response.pagination.total_count / PER_PAGE) : 0;
  const [createCity] = useCreateCityMutation();
  const [updateCity] = useUpdateCityMutation();
  const [deleteCity] = useDeleteCityMutation();

  const formik = useFormik<CityFormData>({
    initialValues: {
      name: '',
      is_active: true,
      region_id: typeof regionId === 'string' ? parseInt(regionId) : regionId,
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        if (selectedCity) {
          await updateCity({
            id: selectedCity.id,
            city: values,
          }).unwrap();
        } else {
          await createCity(values).unwrap();
        }
        handleCloseDialog();
        setError(null);
      } catch (err: any) {
        console.error('Ошибка при сохранении города:', err);
        setError(err?.data?.message || 'Произошла ошибка при сохранении города');
      }
    },
  });

  const handleOpenDialog = (city?: City) => {
    if (city) {
      setSelectedCity(city);
      formik.setValues({
        name: city.name,
        is_active: city.is_active,
        region_id: city.region_id,
      });
    } else {
      setSelectedCity(null);
      formik.setValues({
        name: '',
        is_active: true,
        region_id: typeof regionId === 'string' ? parseInt(regionId) : regionId,
      });
    }
    setIsDialogOpen(true);
    setError(null);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedCity(null);
    formik.resetForm();
    setError(null);
  };

  const handleOpenDeleteDialog = (city: City) => {
    setCityToDelete(city);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setCityToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (cityToDelete) {
      try {
        await deleteCity(cityToDelete.id).unwrap();
        handleCloseDeleteDialog();
        setError(null);
      } catch (err: any) {
        console.error('Ошибка при удалении города:', err);
        setError(err?.data?.message || 'Произошла ошибка при удалении города');
        handleCloseDeleteDialog();
      }
    }
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <LocationCityIcon />
        Города в регионе
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        variant="outlined"
        placeholder="Поиск городов..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ mb: 2 }}
      />

      <List>
        {cities.map((city) => (
          <ListItem key={city.id} divider>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle1">{city.name}</Typography>
                  <Chip 
                    icon={city.is_active ? <CheckIcon /> : <CloseIcon />}
                    label={city.is_active ? 'Активен' : 'Неактивен'}
                    color={city.is_active ? 'success' : 'error'}
                    size="small"
                  />
                </Box>
              }
              secondary={`ID: ${city.id}`}
            />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                aria-label="edit"
                onClick={() => handleOpenDialog(city)}
                sx={{ mr: 1 }}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={() => handleOpenDeleteDialog(city)}
                color="error"
              >
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}

        {cities.length === 0 && (
          <ListItem>
            <ListItemText
              primary="Города не найдены"
              secondary="В этом регионе пока нет городов"
            />
          </ListItem>
        )}
      </List>

      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mb={2}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}

      <Box display="flex" justifyContent="flex-end">
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          color="primary"
          onClick={() => handleOpenDialog()}
        >
          Добавить город
        </Button>
      </Box>

      {/* Диалог создания/редактирования города */}
      <Dialog open={isDialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>
            {selectedCity ? 'Редактировать город' : 'Добавить город'}
          </DialogTitle>
          <DialogContent>
            <Box pt={1}>
              <TextField
                fullWidth
                id="name"
                name="name"
                label="Название города"
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
                sx={{ mb: 2 }}
              />
              <FormControlLabel
                control={
                  <Switch
                    id="is_active"
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
            <Button type="submit" variant="contained">
              {selectedCity ? 'Сохранить' : 'Создать'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Диалог подтверждения удаления */}
      <Dialog open={isDeleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы действительно хотите удалить город "{cityToDelete?.name}"?
            Это действие нельзя будет отменить.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Отмена</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CitiesList;
