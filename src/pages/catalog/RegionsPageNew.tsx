/**
 * Страница управления регионами (PageTable версия)
 * 
 * Функциональность:
 * - Отображение списка регионов с помощью PageTable
 * - Поиск регионов по названию
 * - Пагинация результатов
 * - Создание, редактирование и удаление регионов
 * - Переключение статуса активности
 * - Диалоги создания/редактирования с Formik валидацией
 * - Унифицированный UI с остальными страницами
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { 
  useGetRegionsQuery,
  useCreateRegionMutation,
  useUpdateRegionMutation,
  useDeleteRegionMutation
} from '../../api';
import { Region, RegionFilter, RegionFormData } from '../../types/models';
import { useSnackbar } from 'notistack';

// Импорты UI компонентов
import {
  Alert,
  Chip,
  Button,
} from '../../components/ui';

// Импорт PageTable компонента
import { PageTable } from '../../components/common/PageTable';
import type { 
  PageHeaderConfig, 
  SearchConfig, 
  ActionConfig
} from '../../components/common/PageTable';
import type { Column } from '../../components/ui/Table/Table';

// Схема валидации для региона
const validationSchema = yup.object({
  name: yup.string().required('Название региона обязательно'),
  code: yup.string(),
});

const initialValues: RegionFormData = {
  name: '',
  code: '',
  is_active: true,
};

export const RegionsPageNew: React.FC = () => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  
  const [openDialog, setOpenDialog] = useState(false);
  const [editingRegion, setEditingRegion] = useState<Region | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  // RTK Query хуки
  const { data: regionsData, isLoading, error } = useGetRegionsQuery({
    query: searchQuery || undefined,
    page: page,
    per_page: 10,
  } as RegionFilter);

  const [createRegion] = useCreateRegionMutation();
  const [updateRegion] = useUpdateRegionMutation();
  const [deleteRegion] = useDeleteRegionMutation();

  // Извлекаем данные из response
  const regions = regionsData?.data || [];
  const totalPages = regionsData?.pagination?.total_pages || 1;
  const totalItems = regionsData?.pagination?.total_count || 0;

  // Формик для формы региона
  const formik = useFormik({
    initialValues: initialValues,
    validationSchema,
    onSubmit: async (values) => {
      try {
        if (editingRegion) {
          await updateRegion({ 
            id: editingRegion.id, 
            region: values 
          }).unwrap();
          enqueueSnackbar('Регион успешно обновлен', { variant: 'success' });
        } else {
          await createRegion(values).unwrap();
          enqueueSnackbar('Регион успешно создан', { variant: 'success' });
        }
        handleCloseDialog();
      } catch (error) {
        console.error('Ошибка при сохранении:', error);
        enqueueSnackbar('Ошибка при сохранении региона', { variant: 'error' });
      }
    },
  });

  // Обработчики событий
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setPage(1); // Сброс на первую страницу при поиске
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleCreate = useCallback(() => {
    setEditingRegion(null);
    formik.resetForm();
    setOpenDialog(true);
  }, [formik]);

  const handleEdit = useCallback((region: Region) => {
    setEditingRegion(region);
    formik.setValues({
      name: region.name,
      code: region.code || '',
      is_active: region.is_active ?? true,
    });
    setOpenDialog(true);
  }, [formik]);

  const handleDelete = useCallback(async (region: Region) => {
    try {
      await deleteRegion(region.id).unwrap();
      enqueueSnackbar('Регион успешно удален', { variant: 'success' });
    } catch (error) {
      console.error('Ошибка при удалении региона:', error);
      enqueueSnackbar('Ошибка при удалении региона', { variant: 'error' });
    }
  }, [deleteRegion, enqueueSnackbar]);

  const handleToggleStatus = useCallback(async (region: Region) => {
    try {
      await updateRegion({
        id: region.id,
        region: { is_active: !region.is_active }
      }).unwrap();
      enqueueSnackbar(
        `Статус региона "${region.name}" успешно изменен`,
        { variant: 'success' }
      );
    } catch (error) {
      console.error('Ошибка при изменении статуса:', error);
      enqueueSnackbar('Ошибка при изменении статуса', { variant: 'error' });
    }
  }, [updateRegion, enqueueSnackbar]);

  // Закрытие диалога
  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
    formik.resetForm();
    setEditingRegion(null);
  }, [formik]);

  // Конфигурация заголовка
  const headerConfig: PageHeaderConfig = useMemo(() => ({
    title: 'Управление регионами (PageTable)',
    actions: [
      {
        id: 'create-region',
        label: 'Добавить регион',
        icon: <AddIcon />,
        onClick: handleCreate,
        variant: 'contained',
      }
    ]
  }), [handleCreate]);

  // Конфигурация поиска
  const searchConfig: SearchConfig = useMemo(() => ({
    placeholder: 'Поиск по названию региона...',
    value: searchQuery,
    onChange: handleSearchChange,
  }), [searchQuery, handleSearchChange]);

  // Конфигурация колонок
  const columns: Column[] = useMemo(() => [
    {
      id: 'id',
      label: 'ID',
      minWidth: 70,
      align: 'center',
      format: (_value: any, row: Region) => (
        <Typography variant="body2" fontWeight="medium">
          {row.id}
        </Typography>
      )
    },
    {
      id: 'name',
      label: 'Название',
      minWidth: 200,
      wrap: true,
      format: (_value: any, row: Region) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocationIcon color="primary" fontSize="small" />
          <Typography variant="body2" fontWeight="medium">
            {row.name}
          </Typography>
        </Box>
      )
    },
    {
      id: 'code',
      label: 'Код',
      minWidth: 100,
      hideOnMobile: true,
      format: (_value: any, row: Region) => (
        <Typography variant="body2">
          {row.code || '-'}
        </Typography>
      )
    },
    {
      id: 'status',
      label: 'Статус',
      align: 'center',
      format: (_value: any, row: Region) => (
        <Chip
          label={row.is_active ? 'Активен' : 'Неактивен'}
          color={row.is_active ? 'success' : 'error'}
          size="small"
        />
      )
    }
  ], []);

  // Конфигурация действий
  const actionsConfig: ActionConfig[] = useMemo(() => [
    {
      id: 'toggle-status',
      label: 'Переключить статус',
      icon: <CheckIcon />,
      onClick: (region: Region) => handleToggleStatus(region),
      color: 'primary',
    },
    {
      id: 'edit',
      label: 'Редактировать',
      icon: <EditIcon />,
      onClick: (region: Region) => handleEdit(region),
      color: 'primary',
    },
    {
      id: 'delete',
      label: 'Удалить',
      icon: <DeleteIcon />,
      onClick: (region: Region) => handleDelete(region),
      color: 'error',
      requireConfirmation: true,
      confirmationText: 'Вы уверены, что хотите удалить этот регион?',
    }
  ], [handleToggleStatus, handleEdit, handleDelete]);

  // Конфигурация пагинации
  const paginationConfig = useMemo(() => ({
    page: page,
    rowsPerPage: 10,
    totalItems: totalItems,
    onPageChange: handlePageChange,
  }), [page, totalItems, handlePageChange]);

  // Отображение ошибки загрузки
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Ошибка при загрузке регионов: {error.toString()}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Статистика */}
      {regions.length > 0 && (
        <Box sx={{ mb: 2, display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Найдено регионов: <strong>{totalItems}</strong>
          </Typography>
          <Typography variant="body2" color="success.main">
            Активных: <strong>{regions.filter(r => r.is_active).length}</strong>
          </Typography>
          {regions.filter(r => !r.is_active).length > 0 && (
            <Typography variant="body2" color="error.main">
              Неактивных: <strong>{regions.filter(r => !r.is_active).length}</strong>
            </Typography>
          )}
        </Box>
      )}

      {/* PageTable */}
      <PageTable<Region>
        header={headerConfig}
        search={searchConfig}
        columns={columns}
        rows={regions}
        actions={actionsConfig}
        loading={isLoading}
        pagination={paginationConfig}
        responsive={true}
        empty={
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              {searchQuery ? 'Регионы не найдены' : 'Нет регионов'}
            </Typography>
          </Box>
        }
      />

      {/* Диалог создания/редактирования */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingRegion ? 'Редактирование региона' : 'Создание региона'}
        </DialogTitle>
        <form onSubmit={formik.handleSubmit}>
          <DialogContent>
            <TextField
              fullWidth
              margin="normal"
              name="name"
              label="Название региона"
              value={formik.values.name}
              onChange={formik.handleChange}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
            />
            <TextField
              fullWidth
              margin="normal"
              name="code"
              label="Код региона"
              value={formik.values.code}
              onChange={formik.handleChange}
              error={formik.touched.code && Boolean(formik.errors.code)}
              helperText={formik.touched.code && formik.errors.code}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formik.values.is_active}
                  onChange={formik.handleChange}
                  name="is_active"
                />
              }
              label="Активен"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Отмена</Button>
            <Button type="submit" variant="contained" color="primary">
              {editingRegion ? 'Сохранить' : 'Создать'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default RegionsPageNew; 