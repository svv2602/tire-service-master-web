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
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  useGetCarModelsByBrandIdQuery,
  useCreateCarModelMutation,
  useUpdateCarModelMutation,
  useDeleteCarModelMutation,
} from '../api/carModels.api';
import { CarModel, CarModelFormData } from '../types/car';

const validationSchema = Yup.object({
  name: Yup.string()
    .required('Название модели обязательно')
    .min(2, 'Название должно содержать минимум 2 символа')
    .max(100, 'Название не должно превышать 100 символов'),
  is_active: Yup.boolean(),
  brand_id: Yup.number().required('ID бренда обязателен'),
});

interface CarModelsListProps {
  brandId: string;
}

const CarModelsList: React.FC<CarModelsListProps> = ({ brandId }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<CarModel | null>(null);
  const [modelToDelete, setModelToDelete] = useState<CarModel | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: models, isLoading } = useGetCarModelsByBrandIdQuery(brandId);
  const [createModel] = useCreateCarModelMutation();
  const [updateModel] = useUpdateCarModelMutation();
  const [deleteModel] = useDeleteCarModelMutation();

  const formik = useFormik<CarModelFormData>({
    initialValues: {
      name: '',
      is_active: true,
      brand_id: parseInt(brandId),
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        if (selectedModel) {
          await updateModel({
            brandId,
            id: selectedModel.id.toString(),
            data: values,
          }).unwrap();
        } else {
          await createModel({
            brandId,
            data: values,
          }).unwrap();
        }
        handleCloseDialog();
      } catch (error: any) {
        console.error('Error saving model:', error);
        let errorMessage = 'Произошла ошибка при сохранении модели';
        
        if (error.data?.errors) {
          const errors = error.data.errors as Record<string, string[]>;
          errorMessage = Object.entries(errors)
            .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
            .join('; ');
        } else if (error.data?.message) {
          errorMessage = error.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        setError(errorMessage);
      }
    },
  });

  const handleOpenDialog = (model?: CarModel) => {
    if (model) {
      setSelectedModel(model);
      formik.setValues({
        name: model.name,
        is_active: model.is_active,
        brand_id: parseInt(brandId),
      });
    } else {
      setSelectedModel(null);
      formik.resetForm();
    }
    setIsDialogOpen(true);
    setError(null);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedModel(null);
    formik.resetForm();
    setError(null);
  };

  const handleOpenDeleteDialog = (model: CarModel) => {
    setModelToDelete(model);
    setIsDeleteDialogOpen(true);
    setError(null);
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setModelToDelete(null);
    setError(null);
  };

  const handleDeleteModel = async () => {
    if (!modelToDelete) return;

    try {
      await deleteModel({
        brandId,
        id: modelToDelete.id.toString(),
      }).unwrap();
      handleCloseDeleteDialog();
    } catch (error: any) {
      console.error('Error deleting model:', error);
      let errorMessage = 'Произошла ошибка при удалении модели';
      
      if (error.data?.message) {
        errorMessage = error.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={2}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Модели</Typography>
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          color="primary"
          onClick={() => handleOpenDialog()}
        >
          Добавить модель
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <List>
        {models?.map((model) => (
          <ListItem
            key={model.id}
            sx={{
              bgcolor: 'background.paper',
              mb: 1,
              borderRadius: 1,
              opacity: model.is_active ? 1 : 0.6,
            }}
          >
            <ListItemText
              primary={model.name}
              secondary={model.is_active ? 'Активна' : 'Неактивна'}
            />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                aria-label="edit"
                onClick={() => handleOpenDialog(model)}
                sx={{ mr: 1 }}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={() => handleOpenDeleteDialog(model)}
              >
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      <Dialog open={isDialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>
            {selectedModel ? 'Редактировать модель' : 'Добавить модель'}
          </DialogTitle>
          <DialogContent>
            <Box pt={1}>
              <TextField
                fullWidth
                id="name"
                name="name"
                label="Название модели"
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
                sx={{ mb: 2 }}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.is_active}
                    onChange={(e) => formik.setFieldValue('is_active', e.target.checked)}
                    name="is_active"
                  />
                }
                label="Активна"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Отмена</Button>
            <Button type="submit" variant="contained" color="primary">
              {selectedModel ? 'Сохранить' : 'Добавить'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog
        open={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы действительно хотите удалить модель "{modelToDelete?.name}"?
            Это действие нельзя будет отменить.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Отмена</Button>
          <Button onClick={handleDeleteModel} color="error" variant="contained">
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CarModelsList; 