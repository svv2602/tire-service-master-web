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
  useTheme,
} from '@mui/material';
import { SIZES } from '../styles/theme';
import { 
  getCardStyles, 
  getButtonStyles, 
  getTextFieldStyles,
  getChipStyles
} from '../styles/components';
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
  const theme = useTheme();
  const cardStyles = getCardStyles(theme);
  const buttonStyles = getButtonStyles(theme, 'primary');
  const secondaryButtonStyles = getButtonStyles(theme, 'secondary');
  const dangerButtonStyles = getButtonStyles(theme, 'error');
  const textFieldStyles = getTextFieldStyles(theme);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<CarModel | null>(null);
  const [modelToDelete, setModelToDelete] = useState<CarModel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const PER_PAGE = 10;

  const { data: response, isLoading } = useGetCarModelsByBrandIdQuery({
    brandId,
    params: {
      page,
      per_page: PER_PAGE,
      query: searchQuery || undefined,
    },
  });

  const models = response?.car_models || [];
  const totalPages = response?.total_items ? Math.ceil(response.total_items / PER_PAGE) : 0;
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

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(1); // Сбрасываем страницу при поиске
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={SIZES.spacing.lg}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={cardStyles}>
      <Box mb={SIZES.spacing.md}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontSize: SIZES.fontSize.lg,
            fontWeight: 600
          }}
        >
          Модели
        </Typography>
      </Box>

      <Box mb={SIZES.spacing.md}>
        <TextField
          fullWidth
          label="Поиск моделей"
          variant="outlined"
          value={searchQuery}
          onChange={handleSearch}
          size="small"
          sx={textFieldStyles}
        />
      </Box>

      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: SIZES.spacing.md,
            borderRadius: SIZES.borderRadius.sm
          }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      <List sx={{ 
        mb: SIZES.spacing.md, 
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: SIZES.borderRadius.md,
        overflow: 'hidden'
      }}>
        {models.map((model) => (
          <ListItem
            key={model.id}
            sx={{
              bgcolor: theme.palette.background.paper,
              borderBottom: `1px solid ${theme.palette.divider}`,
              opacity: model.is_active ? 1 : 0.7,
              transition: '0.2s',
              '&:hover': {
                bgcolor: theme.palette.action.hover
              },
              '&:last-child': {
                borderBottom: 'none'
              }
            }}
          >
            <ListItemText
              primary={
                <Typography sx={{ fontSize: SIZES.fontSize.md, fontWeight: 500 }}>
                  {model.name}
                </Typography>
              }
              secondary={
                <Typography 
                  sx={{ 
                    fontSize: SIZES.fontSize.sm,
                    color: model.is_active ? theme.palette.success.main : theme.palette.text.disabled 
                  }}
                >
                  {model.is_active ? 'Активна' : 'Неактивна'}
                </Typography>
              }
            />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                aria-label="edit"
                onClick={() => handleOpenDialog(model)}
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
                onClick={() => handleOpenDeleteDialog(model)}
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
      </List>

      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mb={SIZES.spacing.md}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            sx={{
              '& .MuiPaginationItem-root': {
                borderRadius: SIZES.borderRadius.sm
              }
            }}
          />
        </Box>
      )}

      <Box display="flex" justifyContent="flex-end" mt={SIZES.spacing.lg}>
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          sx={buttonStyles}
          onClick={() => handleOpenDialog()}
        >
          Добавить модель
        </Button>
      </Box>

      <Dialog 
        open={isDialogOpen} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            ...cardStyles,
            borderRadius: SIZES.borderRadius.md,
            p: 0
          }
        }}
      >
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle sx={{ 
            borderBottom: `1px solid ${theme.palette.divider}`,
            fontSize: SIZES.fontSize.lg,
            fontWeight: 600,
            pb: SIZES.spacing.md
          }}>
            {selectedModel ? 'Редактировать модель' : 'Добавить модель'}
          </DialogTitle>
          <DialogContent sx={{ pt: SIZES.spacing.md }}>
            <Box pt={SIZES.spacing.sm}>
              <TextField
                fullWidth
                id="name"
                name="name"
                label="Название модели"
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
                sx={{ ...textFieldStyles, mb: SIZES.spacing.md }}
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
                label="Активна"
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: SIZES.spacing.md, pt: 0 }}>
            <Button onClick={handleCloseDialog} sx={secondaryButtonStyles}>Отмена</Button>
            <Button type="submit" variant="contained" sx={buttonStyles}>
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
        PaperProps={{
          sx: {
            ...cardStyles,
            borderRadius: SIZES.borderRadius.md,
            minWidth: 400,
            p: 0
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: `1px solid ${theme.palette.divider}`,
          fontSize: SIZES.fontSize.lg,
          fontWeight: 600,
          color: theme.palette.error.main
        }}>
          Подтверждение удаления
        </DialogTitle>
        <DialogContent sx={{ pt: SIZES.spacing.md }}>
          <DialogContentText sx={{ fontSize: SIZES.fontSize.md }}>
            Вы действительно хотите удалить модель "{modelToDelete?.name}"?
            Это действие нельзя будет отменить.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: SIZES.spacing.md }}>
          <Button onClick={handleCloseDeleteDialog} sx={secondaryButtonStyles}>Отмена</Button>
          <Button onClick={handleDeleteModel} sx={dangerButtonStyles}>
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CarModelsList; 