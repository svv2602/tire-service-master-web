import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Grid,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';

import Notification from '../../../components/Notification';
import ConfirmDialog from '../../../components/ConfirmDialog';
import {
  useGetAgreementExceptionsQuery,
  useCreateAgreementExceptionMutation,
  useUpdateAgreementExceptionMutation,
  useDeleteAgreementExceptionMutation,
  useGetExceptionTireBrandsQuery,
  useGetExceptionTireDiametersQuery,
  AgreementException,
} from '../../../api/agreementExceptions.api';

interface ExceptionsManagerProps {
  agreementId: number;
}

// Схема валидации
const validationSchema = yup.object({
  exception_type: yup.string().required('Тип исключения обязателен'),
  application_scope: yup.string().required('Область применения обязательна'),
  priority: yup.number().required('Приоритет обязателен').min(0, 'Приоритет не может быть отрицательным'),
  exception_amount: yup.number().when('exception_type', {
    is: 'fixed_amount',
    then: (schema) => schema.required('Сумма обязательна').min(0.01, 'Сумма должна быть больше 0'),
    otherwise: (schema) => schema.nullable(),
  }),
  exception_percentage: yup.number().when('exception_type', {
    is: 'percentage',
    then: (schema) => schema.required('Процент обязателен').min(0.01, 'Процент должен быть больше 0').max(100, 'Процент не может быть больше 100'),
    otherwise: (schema) => schema.nullable(),
  }),
});

const ExceptionsManager: React.FC<ExceptionsManagerProps> = ({ agreementId }) => {
  // State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingException, setEditingException] = useState<AgreementException | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [exceptionToDelete, setExceptionToDelete] = useState<AgreementException | null>(null);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  // API hooks
  const { data: exceptionsResponse, isLoading: exceptionsLoading } = useGetAgreementExceptionsQuery({ agreementId });
  const { data: brandsResponse, isLoading: brandsLoading } = useGetExceptionTireBrandsQuery(agreementId);
  const { data: diametersResponse, isLoading: diametersLoading } = useGetExceptionTireDiametersQuery(agreementId);
  
  const [createException, { isLoading: isCreating }] = useCreateAgreementExceptionMutation();
  const [updateException, { isLoading: isUpdating }] = useUpdateAgreementExceptionMutation();
  const [deleteException, { isLoading: isDeleting }] = useDeleteAgreementExceptionMutation();

  const exceptions = exceptionsResponse?.data || [];
  const brands = brandsResponse?.data || [];
  const diameters = diametersResponse?.data || [];

  // Formik
  const formik = useFormik({
    initialValues: {
      tire_brand_id: '',
      tire_diameter: '',
      exception_type: 'fixed_amount',
      exception_amount: '',
      exception_percentage: '',
      application_scope: 'per_order',
      priority: 0,
      active: true,
      description: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const exceptionData = {
          tire_brand_id: values.tire_brand_id ? Number(values.tire_brand_id) : undefined,
          tire_diameter: values.tire_diameter || undefined,
          exception_type: values.exception_type as 'fixed_amount' | 'percentage',
          exception_amount: values.exception_amount ? Number(values.exception_amount) : undefined,
          exception_percentage: values.exception_percentage ? Number(values.exception_percentage) : undefined,
          application_scope: values.application_scope as 'per_order' | 'per_item',
          priority: Number(values.priority),
          active: values.active,
          description: values.description || undefined,
        };

        if (editingException) {
          await updateException({
            agreementId,
            id: editingException.id,
            exception: exceptionData,
          }).unwrap();
          
          setNotification({
            open: true,
            message: 'Исключение успешно обновлено',
            severity: 'success',
          });
        } else {
          await createException({
            agreementId,
            exception: exceptionData,
          }).unwrap();
          
          setNotification({
            open: true,
            message: 'Исключение успешно создано',
            severity: 'success',
          });
        }

        handleCloseDialog();
      } catch (error: any) {
        setNotification({
          open: true,
          message: error?.data?.message || 'Ошибка при сохранении исключения',
          severity: 'error',
        });
      }
    },
  });

  const handleCreateClick = () => {
    setEditingException(null);
    formik.resetForm();
    setDialogOpen(true);
  };

  const handleEditClick = (exception: AgreementException) => {
    setEditingException(exception);
    formik.setValues({
      tire_brand_id: exception.tire_brand_id?.toString() || '',
      tire_diameter: exception.tire_diameter || '',
      exception_type: exception.exception_type,
      exception_amount: exception.exception_amount?.toString() || '',
      exception_percentage: exception.exception_percentage?.toString() || '',
      application_scope: exception.application_scope,
      priority: exception.priority,
      active: exception.active,
      description: exception.description || '',
    });
    setDialogOpen(true);
  };

  const handleDeleteClick = (exception: AgreementException) => {
    setExceptionToDelete(exception);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!exceptionToDelete) return;

    try {
      await deleteException({
        agreementId,
        id: exceptionToDelete.id,
      }).unwrap();

      setNotification({
        open: true,
        message: 'Исключение успешно удалено',
        severity: 'success',
      });

      setDeleteDialogOpen(false);
      setExceptionToDelete(null);
    } catch (error: any) {
      setNotification({
        open: true,
        message: error?.data?.message || 'Ошибка при удалении исключения',
        severity: 'error',
      });
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingException(null);
    formik.resetForm();
  };

  const getExceptionTypeColor = (type: string) => {
    return type === 'fixed_amount' ? 'primary' : 'secondary';
  };

  const getApplicationScopeColor = (scope: string) => {
    return scope === 'per_order' ? 'success' : 'warning';
  };

  if (exceptionsLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Заголовок и кнопка добавления */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Исключения ({exceptions.length})
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateClick}
          size="small"
        >
          Добавить исключение
        </Button>
      </Box>

      {/* Информационный блок */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          Исключения позволяют настроить особые условия комиссии для конкретных брендов шин и диаметров.
          Исключения с более высоким приоритетом применяются первыми.
        </Typography>
      </Alert>

      {/* Таблица исключений */}
      {exceptions.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Исключения не настроены. Нажмите "Добавить исключение" для создания первого правила.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Бренд</TableCell>
                <TableCell>Диаметр</TableCell>
                <TableCell>Тип</TableCell>
                <TableCell>Значение</TableCell>
                <TableCell>Область</TableCell>
                <TableCell>Приоритет</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell align="center">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {exceptions.map((exception) => (
                <TableRow key={exception.id} hover>
                  <TableCell>
                    <Typography variant="body2">
                      {exception.tire_brand_text}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {exception.tire_diameter_text}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={exception.exception_type_text}
                      color={getExceptionTypeColor(exception.exception_type)}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      {exception.value_text}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={exception.application_scope_text}
                      color={getApplicationScopeColor(exception.application_scope)}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {exception.priority}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={exception.active ? 'Активно' : 'Неактивно'}
                      color={exception.active ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Редактировать">
                      <IconButton
                        size="small"
                        onClick={() => handleEditClick(exception)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Удалить">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteClick(exception)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Диалог создания/редактирования */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">
              {editingException ? 'Редактирование исключения' : 'Создание исключения'}
            </Typography>
            <IconButton onClick={handleCloseDialog}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <form onSubmit={formik.handleSubmit}>
          <DialogContent dividers>
            <Grid container spacing={3}>
              {/* Бренд шин */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Бренд шин</InputLabel>
                  <Select
                    name="tire_brand_id"
                    value={formik.values.tire_brand_id}
                    onChange={formik.handleChange}
                    label="Бренд шин"
                    disabled={brandsLoading}
                  >
                    <MenuItem value="">Все бренды</MenuItem>
                    {brands.map((brand) => (
                      <MenuItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Диаметр */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Диаметр</InputLabel>
                  <Select
                    name="tire_diameter"
                    value={formik.values.tire_diameter}
                    onChange={formik.handleChange}
                    label="Диаметр"
                    disabled={diametersLoading}
                  >
                    <MenuItem value="">Все диаметры</MenuItem>
                    {diameters.map((diameter) => (
                      <MenuItem key={diameter.value} value={diameter.value}>
                        {diameter.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Тип исключения */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={formik.touched.exception_type && Boolean(formik.errors.exception_type)}>
                  <InputLabel>Тип исключения *</InputLabel>
                  <Select
                    name="exception_type"
                    value={formik.values.exception_type}
                    onChange={(e) => {
                      formik.handleChange(e);
                      // Сброс значений при смене типа
                      if (e.target.value === 'fixed_amount') {
                        formik.setFieldValue('exception_percentage', '');
                      } else {
                        formik.setFieldValue('exception_amount', '');
                      }
                    }}
                    label="Тип исключения *"
                  >
                    <MenuItem value="fixed_amount">Фиксированная сумма</MenuItem>
                    <MenuItem value="percentage">Процент от суммы</MenuItem>
                  </Select>
                  {formik.touched.exception_type && formik.errors.exception_type && (
                    <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                      {formik.errors.exception_type}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {/* Область применения */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={formik.touched.application_scope && Boolean(formik.errors.application_scope)}>
                  <InputLabel>Область применения *</InputLabel>
                  <Select
                    name="application_scope"
                    value={formik.values.application_scope}
                    onChange={formik.handleChange}
                    label="Область применения *"
                  >
                    <MenuItem value="per_order">За весь заказ</MenuItem>
                    <MenuItem value="per_item">За каждую единицу товара</MenuItem>
                  </Select>
                  {formik.touched.application_scope && formik.errors.application_scope && (
                    <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                      {formik.errors.application_scope}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {/* Значение исключения */}
              {formik.values.exception_type === 'fixed_amount' && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    name="exception_amount"
                    label="Сумма (грн) *"
                    value={formik.values.exception_amount}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.exception_amount && Boolean(formik.errors.exception_amount)}
                    helperText={formik.touched.exception_amount && formik.errors.exception_amount}
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </Grid>
              )}

              {formik.values.exception_type === 'percentage' && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    name="exception_percentage"
                    label="Процент (%) *"
                    value={formik.values.exception_percentage}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.exception_percentage && Boolean(formik.errors.exception_percentage)}
                    helperText={formik.touched.exception_percentage && formik.errors.exception_percentage}
                    inputProps={{ min: 0, max: 100, step: 0.01 }}
                  />
                </Grid>
              )}

              {/* Приоритет */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  name="priority"
                  label="Приоритет *"
                  value={formik.values.priority}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.priority && Boolean(formik.errors.priority)}
                  helperText={(formik.touched.priority && formik.errors.priority) || 'Чем больше число, тем выше приоритет'}
                  inputProps={{ min: 0, step: 1 }}
                />
              </Grid>

              {/* Активность */}
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formik.values.active}
                      onChange={(e) => formik.setFieldValue('active', e.target.checked)}
                    />
                  }
                  label="Активное исключение"
                />
              </Grid>

              {/* Описание */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  name="description"
                  label="Описание"
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  placeholder="Дополнительное описание исключения..."
                />
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions>
            <Button onClick={handleCloseDialog}>
              Отмена
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={isCreating || isUpdating}
            >
              {isCreating || isUpdating ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Диалог подтверждения удаления */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Подтверждение удаления"
        message={`Вы уверены, что хотите удалить исключение "${exceptionToDelete?.full_description}"?`}
        confirmText="Удалить"
        cancelText="Отмена"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setExceptionToDelete(null);
        }}
      />

      {/* Уведомления */}
      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
      />
    </Box>
  );
};

export default ExceptionsManager;