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
  Chip,
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
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  useGetServicesByCategoryIdQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
} from '../api/servicesList.api';
// Импорт функции прямого вызова API для удаления услуги
import { deleteService as directDeleteService } from '../api/directApi';
import { Service, ServiceFormData } from '../types/service';

const validationSchema = Yup.object({
  name: Yup.string()
    .required('Название услуги обязательно')
    .min(2, 'Название должно содержать минимум 2 символа')
    .max(100, 'Название не должно превышать 100 символов'),
  description: Yup.string()
    .max(500, 'Описание не должно превышать 500 символов'),
  default_duration: Yup.number()
    .required('Длительность обязательна')
    .min(1, 'Длительность должна быть минимум 1 минута')
    .max(1440, 'Длительность не должна превышать 1440 минут (24 часа)'),
  is_active: Yup.boolean(),
  sort_order: Yup.number().min(0, 'Порядок сортировки должен быть неотрицательным'),
});

interface ServicesListProps {
  categoryId: string;
}

export const ServicesList: React.FC<ServicesListProps> = ({ categoryId }) => {
  const theme = useTheme();
  const cardStyles = getCardStyles(theme);
  const buttonStyles = getButtonStyles(theme, 'primary');
  const secondaryButtonStyles = getButtonStyles(theme, 'secondary');
  const dangerButtonStyles = getButtonStyles(theme, 'error');
  const textFieldStyles = getTextFieldStyles(theme);
  const chipStyles = getChipStyles(theme);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const PER_PAGE = 10;

  const { data: response, isLoading } = useGetServicesByCategoryIdQuery({
    categoryId,
    params: {
      page,
      per_page: PER_PAGE,
      query: searchQuery || undefined,
    },
  });

  const services = response?.data || [];
  const totalPages = response?.pagination?.total_pages || 0;
  const [createService] = useCreateServiceMutation();
  const [updateService] = useUpdateServiceMutation();
  const [deleteService] = useDeleteServiceMutation();

  const formik = useFormik<ServiceFormData>({
    initialValues: {
      name: '',
      description: '',
      default_duration: 30,
      is_active: true,
      sort_order: 0,
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        if (selectedService) {
          await updateService({
            categoryId,
            id: selectedService.id.toString(),
            data: values,
          }).unwrap();
        } else {
          await createService({
            categoryId,
            data: values,
          }).unwrap();
        }
        handleCloseDialog();
      } catch (error: any) {
        console.error('Error saving service:', error);
        let errorMessage = 'Произошла ошибка при сохранении услуги';
        
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

  const handleOpenDialog = (service?: Service) => {
    if (service) {
      setSelectedService(service);
      formik.setValues({
        name: service.name,
        description: service.description || '',
        default_duration: service.default_duration,
        is_active: service.is_active,
        sort_order: service.sort_order || 0,
      });
    } else {
      setSelectedService(null);
      formik.resetForm();
    }
    setIsDialogOpen(true);
    setError(null);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedService(null);
    formik.resetForm();
    setError(null);
  };

  const handleOpenDeleteDialog = (service: Service) => {
    setServiceToDelete(service);
    setIsDeleteDialogOpen(true);
    setError(null);
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setServiceToDelete(null);
    setError(null);
  };

  // ВНИМАНИЕ: Импортируем функцию для прямого удаления услуги
  // В начале файла добавьте: import { deleteService as directDeleteService } from '../api/directApi';

  // Обходное решение без RTK Query - прямое удаление без использования RTK
  const handleDeleteService = async () => {
    if (!serviceToDelete) return;

    try {
      // Печатаем информацию о попытке удаления
      console.log('🗑️ ПРЯМОЕ УДАЛЕНИЕ УСЛУГИ БЕЗ RTK:');
      console.log(`- Категория ID: ${categoryId}`);
      console.log(`- Услуга ID: ${serviceToDelete.id}`);
      console.log(`- Название услуги: ${serviceToDelete.name}`);
      
      // Попытка прямого удаления через fetch
      const token = localStorage.getItem('tvoya_shina_token');
      if (!token) {
        throw new Error('Отсутствует токен авторизации');
      }
      
      // Явное преобразование ID в строки
      const catId = String(categoryId);
      const serviceId = String(serviceToDelete.id);
      
      console.log('API вызов:', `http://localhost:8000/api/v1/service_categories/${catId}/services/${serviceId}`);
      
      // Выполняем запрос на удаление напрямую через fetch
      const response = await fetch(`http://localhost:8000/api/v1/service_categories/${catId}/services/${serviceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      console.log('Статус ответа:', response.status, response.statusText);
      
      if (!response.ok) {
        let errorText = '';
        try {
          const errorData = await response.json();
          errorText = JSON.stringify(errorData);
        } catch (e) {
          errorText = await response.text();
        }
        throw new Error(`Ошибка при удалении услуги: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      console.log('✅ Услуга успешно удалена!');
      
      // Закрываем диалог подтверждения
      handleCloseDeleteDialog();
      
      // Обновляем список услуг
      window.location.reload(); // Временное решение для обновления списка
    } catch (error: any) {
      console.error('❌ Ошибка при удалении услуги:', error);
      let errorMessage = 'Произошла ошибка при удалении услуги';
      
      if (error.data?.error) {
        errorMessage = error.data.error;
      } else if (error.data?.message) {
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

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} мин`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours} ч`;
    }
    return `${hours} ч ${remainingMinutes} мин`;
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
        <TextField
          fullWidth
          label="Поиск услуг"
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
        {services.map((service: Service) => (
          <ListItem
            key={service.id}
            sx={{
              bgcolor: theme.palette.background.paper,
              mb: SIZES.spacing.xs,
              opacity: service.is_active ? 1 : 0.7,
              borderBottom: `1px solid ${theme.palette.divider}`,
              transition: '0.2s',
              '&:hover': {
                bgcolor: theme.palette.action.hover
              },
              '&:last-child': {
                borderBottom: 'none',
                mb: 0
              }
            }}
          >
            <ListItemText
              primary={
                <Box display="flex" alignItems="center" gap={SIZES.spacing.sm}>
                  <Typography 
                    variant="body1" 
                    component="span" 
                    sx={{ 
                      fontSize: SIZES.fontSize.md,
                      fontWeight: 500
                    }}
                  >
                    {service.name}
                  </Typography>
                  <Chip
                    icon={<ScheduleIcon />}
                    label={formatDuration(service.default_duration)}
                    size="small"
                    sx={{
                      ...chipStyles,
                      borderRadius: SIZES.borderRadius.sm
                    }}
                  />
                </Box>
              }
              secondary={
                <Box>
                  {service.description && (
                    <Typography
                      variant="body2"
                      sx={{ 
                        mb: SIZES.spacing.xs, 
                        fontSize: SIZES.fontSize.sm,
                        color: theme.palette.text.secondary
                      }}
                    >
                      {service.description}
                    </Typography>
                  )}
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: service.is_active 
                        ? theme.palette.success.main 
                        : theme.palette.text.disabled,
                      fontSize: SIZES.fontSize.xs
                    }}
                  >
                    {service.is_active ? 'Активна' : 'Неактивна'}
                  </Typography>
                </Box>
              }
            />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                aria-label="edit"
                onClick={() => handleOpenDialog(service)}
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
                onClick={() => handleOpenDeleteDialog(service)}
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

      {services.length === 0 && !isLoading && (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          py={SIZES.spacing.xl}
          sx={{
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: SIZES.borderRadius.md,
            backgroundColor: theme.palette.action.hover,
          }}
        >
          <Typography 
            variant="body2" 
            align="center"
            sx={{ 
              color: theme.palette.text.secondary,
              fontSize: SIZES.fontSize.md
            }}
          >
            {searchQuery ? 'Услуги не найдены' : 'В данной категории пока нет услуг'}
          </Typography>
        </Box>
      )}

      {totalPages > 1 && (
        <Box 
          display="flex" 
          justifyContent="center" 
          my={SIZES.spacing.md}
        >
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

      <Box display="flex" justifyContent="flex-end" mt={SIZES.spacing.md}>
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          sx={buttonStyles}
          onClick={() => handleOpenDialog()}
        >
          Добавить услугу
        </Button>
      </Box>

      {/* Диалог создания/редактирования услуги */}
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
            {selectedService ? 'Редактировать услугу' : 'Добавить услугу'}
          </DialogTitle>
          <DialogContent sx={{ pt: SIZES.spacing.md }}>
            <Box pt={SIZES.spacing.sm}>
              <TextField
                fullWidth
                id="name"
                name="name"
                label="Название услуги"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
                sx={{ ...textFieldStyles, mb: SIZES.spacing.md }}
              />
              
              <TextField
                fullWidth
                id="description"
                name="description"
                label="Описание"
                multiline
                rows={3}
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={formik.touched.description && formik.errors.description}
                sx={{ ...textFieldStyles, mb: SIZES.spacing.md }}
              />

              <TextField
                fullWidth
                id="default_duration"
                name="default_duration"
                label="Длительность (в минутах)"
                type="number"
                value={formik.values.default_duration}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.default_duration && Boolean(formik.errors.default_duration)}
                helperText={formik.touched.default_duration && formik.errors.default_duration}
                sx={{ ...textFieldStyles, mb: SIZES.spacing.md }}
                inputProps={{ min: 1, max: 1440 }}
              />

              <TextField
                fullWidth
                id="sort_order"
                name="sort_order"
                label="Порядок сортировки"
                type="number"
                value={formik.values.sort_order}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.sort_order && Boolean(formik.errors.sort_order)}
                helperText={formik.touched.sort_order && formik.errors.sort_order}
                sx={{ ...textFieldStyles, mb: SIZES.spacing.md }}
                inputProps={{ min: 0 }}
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
              {selectedService ? 'Сохранить' : 'Добавить'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Диалог подтверждения удаления */}
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
            Вы действительно хотите удалить услугу "{serviceToDelete?.name}"?
            Это действие нельзя будет отменить.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: SIZES.spacing.md }}>
          <Button onClick={handleCloseDeleteDialog} sx={secondaryButtonStyles}>Отмена</Button>
          <Button onClick={handleDeleteService} sx={dangerButtonStyles}>
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ServicesList;
