import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
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
} from '@mui/material';
import { Table, Column } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
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
import { 
  useGetRegionsQuery,
  useCreateRegionMutation,
  useUpdateRegionMutation,
  useDeleteRegionMutation
} from '../../api';
import { Region, RegionFilter, RegionFormData } from '../../types/models';

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

const RegionsPage: React.FC = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingRegion, setEditingRegion] = useState<Region | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);

  // RTK Query хуки
  const { data: regionsData, isLoading: regionsLoading, error: regionsError } = useGetRegionsQuery({
    query: searchQuery || undefined,
    page: page + 1,
    per_page: 10, // Фиксированное значение
  } as RegionFilter);

  const [createRegion] = useCreateRegionMutation();
  const [updateRegion] = useUpdateRegionMutation();
  const [deleteRegion] = useDeleteRegionMutation();

  // Извлекаем данные из response
  const regions = regionsData?.data || [];
  const totalPages = regionsData?.pagination?.total_pages || 0;
  const isLoading = regionsLoading;

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
          setSuccessMessage('Регион успешно обновлен');
        } else {
          await createRegion(values).unwrap();
          setSuccessMessage('Регион успешно создан');
        }
        handleCloseDialog();
      } catch (error) {
        console.error('Ошибка при сохранении:', error);
      }
    },
  });

  // Открытие диалога создания/редактирования
  const handleOpenDialog = (region?: Region) => {
    if (region) {
      setEditingRegion(region);
      formik.setValues({
        name: region.name,
        code: region.code || '',
        is_active: region.is_active ?? true,
      });
    } else {
      setEditingRegion(null);
      formik.resetForm();
    }
    setOpenDialog(true);
  };

  // Закрытие диалога
  const handleCloseDialog = () => {
    setOpenDialog(false);
    formik.resetForm();
    setEditingRegion(null);
  };

  // Закрытие уведомления
  const handleCloseSnackbar = () => {
    setSuccessMessage(null);
  };

  // Обработчик поиска
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };

  const handleDeleteClick = (region: Region) => {
    setSelectedRegion(region);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedRegion) {
      try {
        await deleteRegion(selectedRegion.id).unwrap();
        setDeleteDialogOpen(false);
        setSelectedRegion(null);
        setSuccessMessage('Регион успешно удален');
      } catch (error) {
        console.error('Ошибка при удалении региона:', error);
      }
    }
  };

  const handleToggleStatus = async (region: Region) => {
    try {
      await updateRegion({
        id: region.id,
        region: { is_active: !region.is_active }
      }).unwrap();
      setSuccessMessage(`Статус региона "${region.name}" успешно изменен`);
    } catch (error) {
      console.error('Ошибка при изменении статуса:', error);
    }
  };

  // Конфигурация колонок для UI Table
  const columns: Column[] = [
    {
      id: 'id',
      label: 'ID',
      minWidth: 70,
      format: (value: number) => value.toString()
    },
    {
      id: 'name',
      label: 'Название',
      minWidth: 200,
      wrap: true,
      format: (value: string) => (
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {value}
        </Typography>
      )
    },
    {
      id: 'code',
      label: 'Код',
      minWidth: 100,
      format: (value: string) => value || '-'
    },
    {
      id: 'is_active',
      label: 'Статус',
      align: 'center',
      format: (value: boolean) => (
        <Chip
          label={value ? 'Активен' : 'Неактивен'}
          color={value ? 'success' : 'error'}
          size="small"
        />
      )
    },
    {
      id: 'actions',
      label: 'Действия',
      align: 'right',
      minWidth: 150,
      format: (value: any, row: Region) => (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Tooltip title={row.is_active ? 'Деактивировать' : 'Активировать'}>
            <IconButton
              onClick={() => handleToggleStatus(row)}
              size="small"
              color={row.is_active ? 'error' : 'success'}
            >
              {row.is_active ? <CloseIcon /> : <CheckIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Редактировать">
            <IconButton
              onClick={() => handleOpenDialog(row)}
              size="small"
              color="primary"
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Удалить">
            <IconButton
              onClick={() => handleDeleteClick(row)}
              size="small"
              color="error"
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Управление регионами</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Добавить регион
        </Button>
      </Box>

      {regionsError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {regionsError.toString()}
        </Alert>
      )}

      <Paper sx={{ mb: 3, p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TextField
            label="Поиск по названию"
            variant="outlined"
            size="small"
            fullWidth
            value={searchQuery}
            onChange={handleSearch}
            InputProps={{
              startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
            }}
          />
        </Box>
      </Paper>

      <Box sx={{ mb: 3 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Table
              columns={columns}
              rows={regions}
            />
            {regions.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  Регионы не найдены
                </Typography>
              </Box>
            )}
          </>
        )}
      </Box>

      {/* Пагинация */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page + 1}
            onChange={(newPage: number) => setPage(newPage - 1)}
            color="primary"
          />
        </Box>
      )}

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

      {/* Диалог подтверждения удаления */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить регион "{selectedRegion?.name}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Удалить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Уведомления */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RegionsPage; 