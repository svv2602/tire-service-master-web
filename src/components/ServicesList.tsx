import React, { useState } from 'react';
import {
  Box,
  Typography,
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
  Chip,
  Tooltip,
  useTheme,
  Tabs,
  Tab,
} from '@mui/material';
import { SIZES } from '../styles/theme';
import { 
  getTablePageStyles
} from '../styles/components';
// UI компоненты
import { Table, Column } from './ui/Table';
import { Pagination as UIPagination, TabPanel } from './ui';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Build as BuildIcon,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  useGetServicesByCategoryIdQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
} from '../api/servicesList.api';
import { Service, ServiceFormData } from '../types/service';
import { useTranslation } from 'react-i18next';

const validationSchema = Yup.object({
  name: Yup.string()
    .required('Название услуги обязательно')
    .min(2, 'Название должно содержать минимум 2 символа')
    .max(100, 'Название не должно превышать 100 символов'),
  description: Yup.string()
    .max(500, 'Описание не должно превышать 500 символов'),
  is_active: Yup.boolean(),
  sort_order: Yup.number().min(0, 'Порядок сортировки должен быть неотрицательным'),
});

interface ServicesListProps {
  categoryId: string;
}

export const ServicesList: React.FC<ServicesListProps> = ({ categoryId }) => {
  const { t } = useTranslation('components');
  const theme = useTheme();
  const tablePageStyles = getTablePageStyles(theme);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(0);
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

  const validationSchemaWithTranslations = Yup.object({
    name: Yup.string()
      .required(t('servicesList.validation.nameRequired'))
      .min(2, t('servicesList.validation.nameMinLength'))
      .max(100, t('servicesList.validation.nameMaxLength')),
    name_uk: Yup.string()
      .min(2, t('servicesList.validation.nameMinLength'))
      .max(100, t('servicesList.validation.nameMaxLength')),
    description: Yup.string()
      .max(500, t('servicesList.validation.descriptionMaxLength')),
    description_uk: Yup.string()
      .max(500, t('servicesList.validation.descriptionMaxLength')),
    is_active: Yup.boolean(),
    sort_order: Yup.number().min(0, t('servicesList.validation.sortOrderMinValue')),
  });

  const formik = useFormik<ServiceFormData>({
    initialValues: {
      name: '',
      name_uk: '',
      description: '',
      description_uk: '',
      is_active: true,
      sort_order: 0,
    },
    validationSchema: validationSchemaWithTranslations,
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
        let errorMessage = t('servicesList.errors.savingError');
        
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
        name_uk: service.name_uk || '',
        description: service.description || '',
        description_uk: service.description_uk || '',
        is_active: service.is_active,
        sort_order: service.sort_order || 0,
      });
    } else {
      setSelectedService(null);
      formik.resetForm();
    }
    setIsDialogOpen(true);
    setActiveTab(0);
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

  const handleDeleteService = async () => {
    if (!serviceToDelete) return;

    try {
      const categoryIdStr = String(categoryId);
      const serviceIdStr = String(serviceToDelete.id);
      
      await deleteService({
        categoryId: categoryIdStr,
        id: serviceIdStr,
      }).unwrap();

      handleCloseDeleteDialog();
    } catch (error: any) {
      console.error('Ошибка при удалении услуги:', error);
      let errorMessage = t('servicesList.errors.deletingError');
      
      // Обрабатываем различные форматы ошибок от API
      if (error.data?.error) {
        // Основной формат ошибок с ограничениями
        errorMessage = error.data.error;
      } else if (error.data?.message) {
        // Альтернативный формат
        errorMessage = error.data.message;
      } else if (error.data?.errors) {
        // Ошибки валидации
        const errors = error.data.errors as Record<string, string[]>;
        errorMessage = Object.entries(errors)
          .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
          .join('; ');
      } else if (error.message) {
        // Общие ошибки
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(1);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  /**
   * Конфигурация колонок для UI Table
   */
  const columns: Column[] = [
    {
      id: 'name',
      label: t('servicesList.columns.name'),
      minWidth: 200,
      wrap: true,
      format: (value: string) => (
        <Typography 
          variant="body2" 
          sx={{ 
            fontWeight: 500,
            color: theme.palette.text.primary
          }}
        >
          {value}
        </Typography>
      )
    },
    {
      id: 'is_active',
      label: t('servicesList.columns.status'),
      align: 'center',
      format: (value: boolean) => (
        <Chip 
          label={value ? t('servicesList.status.active') : t('servicesList.status.inactive')}
          color={value ? 'success' : 'default'}
          size="small"
          sx={tablePageStyles.statusChip}
        />
      )
    },
    {
      id: 'actions',
      label: t('servicesList.columns.actions'),
      align: 'right',
      minWidth: 120,
      format: (value: any, row: Service) => (
        <Box sx={tablePageStyles.actionsContainer}>
          <Tooltip title={t('servicesList.actions.edit')}>
            <IconButton 
              size="small"
              onClick={() => handleOpenDialog(row)}
              sx={tablePageStyles.actionButton}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('servicesList.actions.delete')}>
            <IconButton 
              size="small"
              onClick={() => handleOpenDeleteDialog(row)}
              sx={{
                ...tablePageStyles.actionButton,
                '&:hover': {
                  backgroundColor: `${theme.palette.error.main}15`,
                  color: theme.palette.error.main
                }
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

  if (isLoading) {
    return (
      <Box sx={tablePageStyles.loadingContainer}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
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
        <BuildIcon />
        {t('servicesList.title')}
      </Typography>

      {/* Поиск и кнопка добавления */}
      <Box sx={tablePageStyles.filtersContainer}>
        <TextField
          placeholder={t('servicesList.searchPlaceholder')}
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={handleSearch}
          sx={tablePageStyles.searchField}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={tablePageStyles.primaryButton}
        >
          {t('servicesList.addService')}
        </Button>
      </Box>

      {/* Ошибки */}
      {error && (
        <Alert 
          severity="error" 
          sx={tablePageStyles.errorAlert}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {/* Таблица услуг с UI Table */}
      <Box sx={{ mb: 3 }}>
        <Table
          columns={columns}
          rows={services}
        />
      </Box>

      {/* Пустое состояние */}
      {services.length === 0 && !isLoading && (
        <Box sx={tablePageStyles.emptyStateContainer}>
          <Typography variant="h6" sx={tablePageStyles.emptyStateTitle}>
            {searchQuery ? t('servicesList.emptyState.notFound') : t('servicesList.emptyState.noServices')}
          </Typography>
          <Typography variant="body2" sx={tablePageStyles.emptyStateDescription}>
            {searchQuery 
              ? t('servicesList.emptyState.changeSearch')
              : t('servicesList.emptyState.addFirst')
            }
          </Typography>
          {!searchQuery && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={tablePageStyles.primaryButton}
            >
              {t('servicesList.addService')}
            </Button>
          )}
        </Box>
      )}

      {/* Пагинация */}
      {/* Пагинация с UI Pagination */}
      {totalPages > 1 && (
        <Box sx={tablePageStyles.paginationContainer}>
          <UIPagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}

      {/* Диалог создания/редактирования услуги */}
      <Dialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: tablePageStyles.dialogPaper
        }}
      >
        <DialogTitle sx={tablePageStyles.dialogTitle}>
          {selectedService ? t('servicesList.editService') : t('servicesList.newService')}
        </DialogTitle>
        <DialogContent sx={{ pt: SIZES.spacing.sm }}>
          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: SIZES.spacing.md }}
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}
          
          {/* Вкладки для языков */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: SIZES.spacing.lg }}>
            <Tabs value={activeTab} onChange={handleTabChange} aria-label="language tabs">
              <Tab label="Русский" />
              <Tab label="Українська" />
              <Tab label="Настройки" />
            </Tabs>
          </Box>

          <Box component="form" onSubmit={formik.handleSubmit}>
            {/* Вкладка русского языка */}
            <TabPanel value={activeTab} index={0}>
              <TextField
                fullWidth
                name="name"
                label={t('servicesList.form.serviceName')}
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
                sx={{ mb: SIZES.spacing.md }}
                required
              />
              <TextField
                fullWidth
                name="description"
                label={t('servicesList.form.description')}
                multiline
                rows={4}
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={formik.touched.description && formik.errors.description}
                sx={{ mb: SIZES.spacing.md }}
              />
            </TabPanel>

            {/* Вкладка украинского языка */}
            <TabPanel value={activeTab} index={1}>
              <TextField
                fullWidth
                name="name_uk"
                label="Назва послуги (укр)"
                value={formik.values.name_uk}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.name_uk && Boolean(formik.errors.name_uk)}
                helperText={formik.touched.name_uk && formik.errors.name_uk}
                sx={{ mb: SIZES.spacing.md }}
              />
              <TextField
                fullWidth
                name="description_uk"
                label="Опис послуги (укр)"
                multiline
                rows={4}
                value={formik.values.description_uk}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.description_uk && Boolean(formik.errors.description_uk)}
                helperText={formik.touched.description_uk && formik.errors.description_uk}
                sx={{ mb: SIZES.spacing.md }}
              />
            </TabPanel>

            {/* Вкладка настроек */}
            <TabPanel value={activeTab} index={2}>
              <TextField
                fullWidth
                name="sort_order"
                label={t('servicesList.form.sortOrder')}
                type="number"
                value={formik.values.sort_order}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.sort_order && Boolean(formik.errors.sort_order)}
                helperText={formik.touched.sort_order && formik.errors.sort_order}
                sx={{ mb: SIZES.spacing.md }}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.is_active}
                    onChange={(e) => formik.setFieldValue('is_active', e.target.checked)}
                    name="is_active"
                  />
                }
                label={t('servicesList.form.activeService')}
              />
            </TabPanel>
          </Box>
        </DialogContent>
        <DialogActions sx={tablePageStyles.dialogActions}>
          <Button 
            onClick={handleCloseDialog}
            sx={tablePageStyles.secondaryButton}
          >
            {t('servicesList.form.cancel')}
          </Button>
          <Button 
            onClick={formik.submitForm}
            variant="contained"
            disabled={formik.isSubmitting}
            sx={tablePageStyles.primaryButton}
          >
            {selectedService ? t('servicesList.form.save') : t('servicesList.form.create')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог подтверждения удаления */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: tablePageStyles.dialogPaper
        }}
      >
        <DialogTitle sx={tablePageStyles.dialogTitle}>
          {t('servicesList.deleteDialog.title')}
        </DialogTitle>
        <DialogContent sx={{ pt: SIZES.spacing.sm }}>
          <DialogContentText sx={tablePageStyles.dialogText}>
            {t('servicesList.deleteDialog.message', { name: serviceToDelete?.name })}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={tablePageStyles.dialogActions}>
          <Button 
            onClick={handleCloseDeleteDialog}
            sx={tablePageStyles.secondaryButton}
          >
            {t('servicesList.deleteDialog.cancel')}
          </Button>
          <Button 
            onClick={handleDeleteService}
            variant="contained"
            sx={tablePageStyles.dangerButton}
          >
            {t('servicesList.deleteDialog.confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ServicesList;
