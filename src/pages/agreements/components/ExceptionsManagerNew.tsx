import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  CircularProgress,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  Divider
} from '@mui/material';
import { Add, Edit, Delete, Close } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';

import { 
  useGetAgreementExceptionsQuery,
  useCreateAgreementExceptionMutation,
  useUpdateAgreementExceptionMutation,
  useDeleteAgreementExceptionMutation,
  useGetExceptionTireBrandsQuery,
  useGetExceptionTireDiametersQuery,
  AgreementException,
  CreateExceptionRequest
} from '../../../api/agreementExceptions.api';
import ExceptionBrandsManager from './ExceptionBrandsManager';
import ExceptionDiametersManager from './ExceptionDiametersManager';
import ConfirmDialog from '../../../components/ConfirmDialog';
import Notification from '../../../components/Notification';

interface ExceptionsManagerNewProps {
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

const ExceptionsManagerNew: React.FC<ExceptionsManagerNewProps> = ({ agreementId }) => {
  // State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingException, setEditingException] = useState<AgreementException | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [exceptionToDelete, setExceptionToDelete] = useState<AgreementException | null>(null);
  const [selectedBrandIds, setSelectedBrandIds] = useState<number[]>([]);
  const [selectedDiameters, setSelectedDiameters] = useState<string[]>([]);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });
  
  // Состояние для предупреждений о дублировании
  const [duplicateWarnings, setDuplicateWarnings] = useState<string[]>([]);

  // API hooks
  const { data: exceptionsResponse, isLoading: exceptionsLoading, refetch: refetchExceptions } = useGetAgreementExceptionsQuery({ agreementId });
  const { data: brandsResponse, isLoading: brandsLoading } = useGetExceptionTireBrandsQuery(agreementId);
  const { data: diametersResponse, isLoading: diametersLoading } = useGetExceptionTireDiametersQuery(agreementId);
  
  const [createException, { isLoading: isCreating }] = useCreateAgreementExceptionMutation();
  const [updateException, { isLoading: isUpdating }] = useUpdateAgreementExceptionMutation();
  const [deleteException, { isLoading: isDeleting }] = useDeleteAgreementExceptionMutation();

  const exceptions = exceptionsResponse?.data || [];
  const brands = brandsResponse?.data || [];
  const diameters = diametersResponse?.data || [];

  // Функция для проверки дублирования комбинаций бренд+диаметр
  const checkForDuplicates = (brandIds: number[], diameters: string[]): string[] => {
    const warnings: string[] = [];
    const currentExceptionId = editingException?.id;
    
    // Создаем комбинации для проверки
    const combinationsToCheck: Array<{brandId: number | null, diameter: string | null}> = [];
    
    if (brandIds.length === 0 && diameters.length === 0) {
      // Все бренды + все диаметры
      combinationsToCheck.push({ brandId: null, diameter: null });
    } else if (brandIds.length === 0) {
      // Все бренды + конкретные диаметры
      diameters.forEach(diameter => {
        combinationsToCheck.push({ brandId: null, diameter: diameter || null });
      });
    } else if (diameters.length === 0) {
      // Конкретные бренды + все диаметры
      brandIds.forEach(brandId => {
        combinationsToCheck.push({ brandId, diameter: null });
      });
    } else {
      // Конкретные бренды + конкретные диаметры
      brandIds.forEach(brandId => {
        diameters.forEach(diameter => {
          combinationsToCheck.push({ brandId, diameter: diameter || null });
        });
      });
    }
    
    // Проверяем каждую комбинацию против существующих исключений
    combinationsToCheck.forEach(({ brandId, diameter }) => {
      const conflictingExceptions = exceptions.filter(exception => {
        // Пропускаем текущее редактируемое исключение
        if (currentExceptionId && exception.id === currentExceptionId) return false;
        
        // Пропускаем неактивные исключения
        if (!exception.active) return false;
        
        // Дополнительная проверка - убеждаемся что исключение существует
        if (!exception.id) return false;
        
        // Логика проверки конфликта
        const brandConflict = checkBrandConflict(brandId, exception);
        const diameterConflict = checkDiameterConflict(diameter, exception);
        
        return brandConflict && diameterConflict;
      });
      
      conflictingExceptions.forEach(conflicting => {
        const brandText = getBrandDisplayText(brandId);
        const diameterText = getDiameterDisplayText(diameter);
        const conflictingBrandText = getBrandDisplayText(conflicting.tire_brand_id ?? null);
        const conflictingDiameterText = getDiameterDisplayText(conflicting.tire_diameter ?? null);
        
        warnings.push(
          `Комбинация "${brandText} + ${diameterText}" конфликтует с исключением #${conflicting.id} (${conflictingBrandText} + ${conflictingDiameterText})`
        );
      });
    });
    
    return Array.from(new Set(warnings)); // Убираем дубликаты
  };
  
  // Вспомогательные функции для проверки конфликтов
  const checkBrandConflict = (brandId: number | null, exception: AgreementException): boolean => {
    // Если оба null (все бренды) - конфликт
    if (brandId === null && exception.tire_brand_id === null) return true;
    
    // Если один null (все бренды), а другой конкретный - конфликт
    if (brandId === null || exception.tire_brand_id === null) return true;
    
    // Если оба конкретные - проверяем равенство
    return brandId === exception.tire_brand_id;
  };
  
  const checkDiameterConflict = (diameter: string | null, exception: AgreementException): boolean => {
    const normalizedDiameter = diameter?.trim() || null;
    const normalizedExceptionDiameter = exception.tire_diameter?.trim() || null;
    
    // Если оба null (все диаметры) - конфликт
    if (normalizedDiameter === null && normalizedExceptionDiameter === null) return true;
    
    // Если один null (все диаметры), а другой конкретный - конфликт
    if (normalizedDiameter === null || normalizedExceptionDiameter === null) return true;
    
    // Если оба конкретные - проверяем равенство
    return normalizedDiameter === normalizedExceptionDiameter;
  };
  
  // Функции для отображения текста
  const getBrandDisplayText = (brandId: number | null): string => {
    if (brandId === null) return 'Все бренды';
    const brand = brands.find(b => b.id === brandId);
    return brand ? brand.name : `Бренд ID: ${brandId}`;
  };
  
  const getDiameterDisplayText = (diameter: string | null): string => {
    return diameter ? `R${diameter}` : 'Все диаметры';
  };

  // Formik
  const formik = useFormik({
    initialValues: {
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
        const exceptionData: CreateExceptionRequest = {
          exception: {
            exception_type: values.exception_type as 'fixed_amount' | 'percentage',
            exception_amount: values.exception_type === 'fixed_amount' ? Number(values.exception_amount) : undefined,
            exception_percentage: values.exception_type === 'percentage' ? Number(values.exception_percentage) : undefined,
            application_scope: values.application_scope as 'per_order' | 'per_item',
            priority: values.priority,
            active: values.active,
            description: values.description || undefined,
            // Новые поля для множественного выбора
            tire_brand_ids: selectedBrandIds.length > 0 ? selectedBrandIds : undefined,
            tire_diameters: selectedDiameters.length > 0 ? selectedDiameters : undefined,
          },
        };

        if (editingException) {
          await updateException({
            agreementId,
            id: editingException.id,
            ...exceptionData,
          }).unwrap();
          
          setNotification({
            open: true,
            message: 'Исключение успешно обновлено',
            severity: 'success',
          });
        } else {
          await createException({
            agreementId,
            ...exceptionData,
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
    setSelectedBrandIds([]);
    setSelectedDiameters([]);
    formik.resetForm();
    setDialogOpen(true);
  };

  const handleEditClick = (exception: AgreementException) => {
    setEditingException(exception);
    setSelectedBrandIds(exception.tire_brand_ids || []);
    setSelectedDiameters(exception.tire_diameters || []);
    formik.setValues({
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

      // Принудительно обновляем данные для корректной валидации
      await refetchExceptions();

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
    setSelectedBrandIds([]);
    setSelectedDiameters([]);
    setDuplicateWarnings([]);
    formik.resetForm();
  };
  
  // useEffect для автоматической проверки дублирования
  React.useEffect(() => {
    // Отладочная информация в режиме разработки
    if (process.env.NODE_ENV === 'development' && dialogOpen) {
      console.log('🔍 Проверка дублирования:', {
        exceptionsCount: exceptions.length,
        exceptionsIds: exceptions.map(e => ({ id: e.id, active: e.active, brand: e.tire_brand_id, diameter: e.tire_diameter })),
        selectedBrandIds,
        selectedDiameters,
        editingException: editingException?.id
      });
    }
    
    if (dialogOpen && (selectedBrandIds.length > 0 || selectedDiameters.length > 0)) {
      const warnings = checkForDuplicates(selectedBrandIds, selectedDiameters);
      setDuplicateWarnings(warnings);
    } else if (dialogOpen && selectedBrandIds.length === 0 && selectedDiameters.length === 0) {
      // Проверяем случай "все бренды + все диаметры"
      const warnings = checkForDuplicates([], []);
      setDuplicateWarnings(warnings);
    } else {
      setDuplicateWarnings([]);
    }
  }, [selectedBrandIds, selectedDiameters, dialogOpen, exceptions, editingException]);

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
          startIcon={<Add />}
          onClick={handleCreateClick}
        >
          Добавить исключение
        </Button>
      </Box>

      {/* Таблица исключений */}
      {exceptions.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Тип</TableCell>
                <TableCell>Значение</TableCell>
                <TableCell>Область применения</TableCell>
                <TableCell>Бренды</TableCell>
                <TableCell>Диаметры</TableCell>
                <TableCell>Приоритет</TableCell>
                <TableCell align="center">Статус</TableCell>
                <TableCell align="center">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {exceptions.map((exception) => (
                <TableRow key={exception.id}>
                  <TableCell>
                    <Chip
                      label={exception.exception_type === 'fixed_amount' ? 'Фиксированная сумма' : 'Процент'}
                      color={getExceptionTypeColor(exception.exception_type)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {exception.value_text}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={exception.application_scope === 'per_order' ? 'За заказ' : 'За единицу'}
                      color={getApplicationScopeColor(exception.application_scope)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" noWrap title={exception.brands_description}>
                      {exception.brands_description || 'Все бренды'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" noWrap title={exception.diameters_description}>
                      {exception.diameters_description || 'Все диаметры'}
                    </Typography>
                  </TableCell>
                  <TableCell>{exception.priority}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={exception.active ? 'Активно' : 'Неактивно'}
                      color={exception.active ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleEditClick(exception)}
                      title="Редактировать"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteClick(exception)}
                      title="Удалить"
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Alert severity="info">
          Исключения не созданы. Будут применяться основные условия договоренности.
        </Alert>
      )}

      {/* Диалог создания/редактирования */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog} 
        maxWidth="lg" 
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">
              {editingException ? 'Редактирование исключения' : 'Создание исключения'}
            </Typography>
            <IconButton onClick={handleCloseDialog}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <form onSubmit={formik.handleSubmit}>
          <DialogContent dividers>
            <Grid container spacing={3}>
              {/* Основные параметры */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                  Основные параметры
                </Typography>
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
                </FormControl>
              </Grid>

              {/* Значение */}
              {formik.values.exception_type === 'fixed_amount' ? (
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="exception_amount"
                    label="Сумма (грн) *"
                    type="number"
                    value={formik.values.exception_amount}
                    onChange={formik.handleChange}
                    error={formik.touched.exception_amount && Boolean(formik.errors.exception_amount)}
                    helperText={formik.touched.exception_amount && formik.errors.exception_amount}
                  />
                </Grid>
              ) : (
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="exception_percentage"
                    label="Процент (%) *"
                    type="number"
                    value={formik.values.exception_percentage}
                    onChange={formik.handleChange}
                    error={formik.touched.exception_percentage && Boolean(formik.errors.exception_percentage)}
                    helperText={formik.touched.exception_percentage && formik.errors.exception_percentage}
                    inputProps={{ min: 0, max: 100, step: 0.01 }}
                  />
                </Grid>
              )}

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
                </FormControl>
              </Grid>

              {/* Приоритет */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="priority"
                  label="Приоритет *"
                  type="number"
                  value={formik.values.priority}
                  onChange={formik.handleChange}
                  error={formik.touched.priority && Boolean(formik.errors.priority)}
                  helperText={formik.touched.priority && formik.errors.priority}
                  inputProps={{ min: 0 }}
                />
              </Grid>

              {/* Описание */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="description"
                  label="Описание"
                  multiline
                  rows={2}
                  value={formik.values.description}
                  onChange={formik.handleChange}
                />
              </Grid>

              {/* Статус */}
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      name="active"
                      checked={formik.values.active}
                      onChange={formik.handleChange}
                    />
                  }
                  label="Активно"
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>

              {/* Бренды */}
              <Grid item xs={12} md={6}>
                <ExceptionBrandsManager
                  selectedBrandIds={selectedBrandIds}
                  availableBrands={brands}
                  onChange={setSelectedBrandIds}
                  brandsLoading={brandsLoading}
                />
              </Grid>

              {/* Диаметры */}
              <Grid item xs={12} md={6}>
                <ExceptionDiametersManager
                  selectedDiameters={selectedDiameters}
                  availableDiameters={diameters}
                  onChange={setSelectedDiameters}
                  diametersLoading={diametersLoading}
                />
              </Grid>
              
              {/* Предупреждения о дублировании */}
              {duplicateWarnings.length > 0 && (
                <Grid item xs={12}>
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      ⚠️ Обнаружены конфликты с существующими исключениями:
                    </Typography>
                    <Box component="ul" sx={{ pl: 2, mb: 0 }}>
                      {duplicateWarnings.map((warning, index) => (
                        <Box component="li" key={index} sx={{ mb: 0.5 }}>
                          <Typography variant="body2">{warning}</Typography>
                        </Box>
                      ))}
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Эти комбинации уже покрыты другими исключениями. Рекомендуется изменить параметры или деактивировать конфликтующие исключения.
                    </Typography>
                  </Alert>
                </Grid>
              )}
            </Grid>
          </DialogContent>

          <DialogActions>
            <Button onClick={handleCloseDialog}>Отмена</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isCreating || isUpdating}
              startIcon={isCreating || isUpdating ? <CircularProgress size={20} /> : undefined}
            >
              {editingException ? 'Обновить' : 'Создать'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Диалог подтверждения удаления */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Подтверждение удаления"
        message={`Вы действительно хотите удалить исключение "${exceptionToDelete?.description || 'без описания'}"?`}
        confirmText="Удалить"
        cancelText="Отмена"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialogOpen(false)}
      />

      {/* Уведомления */}
      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={() => setNotification({ ...notification, open: false })}
      />
    </Box>
  );
};

export default ExceptionsManagerNew;