import React, { useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  FormControlLabel,
  CircularProgress,
  DialogContentText,
  useTheme,
  Skeleton
} from '@mui/material';
import { SIZES } from '../styles/theme';
import { 
  getButtonStyles, 
  getTextFieldStyles, 
  getChipStyles,
  getCardStyles
} from '../styles/components';
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

// Импорты UI компонентов
import { Button } from '../components/ui/Button';
import { TextField } from '../components/ui/TextField';
import { Modal } from '../components/ui/Modal';
import { Alert } from '../components/ui/Alert';
import { Switch } from '../components/ui/Switch';
import { Chip } from '../components/ui/Chip';
import { Pagination } from '../components/ui/Pagination';

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
  const theme = useTheme();
  const cardStyles = getCardStyles(theme);
  const buttonStyles = getButtonStyles(theme, 'primary');
  const secondaryButtonStyles = getButtonStyles(theme, 'secondary');
  const dangerButtonStyles = getButtonStyles(theme, 'error');
  const textFieldStyles = getTextFieldStyles(theme);

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

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={SIZES.spacing.lg}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={cardStyles}>
      <Typography 
        variant="h6" 
        gutterBottom 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: SIZES.spacing.sm,
          fontSize: SIZES.fontSize.lg,
          fontWeight: 600,
          mb: SIZES.spacing.md
        }}
      >
        <LocationCityIcon />
        Города в регионе
      </Typography>

      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: SIZES.spacing.md }} 
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        variant="outlined"
        placeholder="Поиск городов..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ mb: SIZES.spacing.md }}
      />

      <List sx={{ 
          bgcolor: theme.palette.background.paper,
          borderRadius: SIZES.borderRadius.md,
          border: `1px solid ${theme.palette.divider}`,
          overflow: 'hidden'
        }}>
        {cities.map((city) => (
          <ListItem 
            key={city.id} 
            divider 
            sx={{
              transition: '0.2s',
              '&:hover': {
                bgcolor: theme.palette.action.hover
              }
            }}
          >
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: SIZES.spacing.sm }}>
                  <Typography 
                    variant="subtitle1"
                    sx={{ fontSize: SIZES.fontSize.md, fontWeight: 500 }}
                  >
                    {city.name}
                  </Typography>
                  <Chip 
                    icon={city.is_active ? <CheckIcon /> : <CloseIcon />}
                    label={city.is_active ? 'Активен' : 'Неактивен'}
                    color={city.is_active ? 'success' : 'error'}
                    size="small"
                  />
                </Box>
              }
              secondary={
                <Typography 
                  variant="body2" 
                  sx={{ fontSize: SIZES.fontSize.sm, color: theme.palette.text.secondary }}
                >
                  ID: {city.id}
                </Typography>
              }
            />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                aria-label="edit"
                onClick={() => handleOpenDialog(city)}
                sx={{ 
                  mr: SIZES.spacing.sm,
                  '&:hover': { 
                    backgroundColor: `${theme.palette.primary.main}15` 
                  }
                }}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={() => handleOpenDeleteDialog(city)}
                color="error"
                sx={{ 
                  '&:hover': { 
                    backgroundColor: `${theme.palette.error.main}15` 
                  }
                }}
              >
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}

        {cities.length === 0 && (
          <ListItem>
            <ListItemText
              primary={
                <Typography sx={{ fontSize: SIZES.fontSize.md, fontWeight: 500 }}>
                  Города не найдены
                </Typography>
              }
              secondary={
                <Typography sx={{ fontSize: SIZES.fontSize.sm, color: theme.palette.text.secondary }}>
                  В этом регионе пока нет городов
                </Typography>
              }
            />
          </ListItem>
        )}
      </List>

      {totalPages > 1 && (
        <Box 
          display="flex" 
          justifyContent="center" 
          mb={SIZES.spacing.md}
          mt={SIZES.spacing.md}
        >
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}

      <Box display="flex" justifyContent="flex-end" mt={SIZES.spacing.md}>
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          onClick={() => handleOpenDialog()}
        >
          Добавить город
        </Button>
      </Box>

      {/* Модальное окно создания/редактирования города */}
      <Modal 
        open={isDialogOpen} 
        onClose={handleCloseDialog}
        title={selectedCity ? 'Редактировать город' : 'Добавить город'}
        maxWidth={600}
        actions={
          <>
            <Button onClick={handleCloseDialog}>Отмена</Button>
            <Button 
              onClick={() => formik.handleSubmit()} 
              variant="contained"
            >
              {selectedCity ? 'Сохранить' : 'Создать'}
            </Button>
          </>
        }
      >
        <Box pt={SIZES.spacing.sm}>
          <TextField
            fullWidth
            id="name"
            name="name"
            label="Название города"
            value={formik.values.name}
            onChange={formik.handleChange}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
            sx={{ mb: SIZES.spacing.md }}
          />
          <Switch
            label="Активен"
            checked={formik.values.is_active}
            onChange={(e) => formik.setFieldValue('is_active', e.target.checked)}
          />
        </Box>
      </Modal>

      {/* Модальное окно подтверждения удаления */}
      <Modal 
        open={isDeleteDialogOpen} 
        onClose={handleCloseDeleteDialog}
        title="Подтверждение удаления"
        maxWidth={400}
        actions={
          <>
            <Button onClick={handleCloseDeleteDialog}>Отмена</Button>
            <Button 
              onClick={handleConfirmDelete} 
              color="error" 
              variant="contained"
            >
              Удалить
            </Button>
          </>
        }
      >
        <Typography sx={{ fontSize: SIZES.fontSize.md }}>
          Вы действительно хотите удалить город "{cityToDelete?.name}"?
          Это действие нельзя будет отменить.
        </Typography>
      </Modal>
    </Box>
  );
};

export default CitiesList;
