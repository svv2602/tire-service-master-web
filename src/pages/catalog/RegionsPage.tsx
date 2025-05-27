import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
  TablePagination,
} from '@mui/material';
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
import { useNavigate } from 'react-router-dom';
import { 
  useGetRegionsQuery,
  useCreateRegionMutation,
  useUpdateRegionMutation,
  useDeleteRegionMutation
} from '../../api';
import { Region, RegionFilter, RegionFormData, ApiResponse } from '../../types/models';

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
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingRegion, setEditingRegion] = useState<Region | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);

  // RTK Query хуки
  const { data: regionsData, isLoading: regionsLoading, error: regionsError } = useGetRegionsQuery({
    query: searchQuery || undefined,
    page: page + 1,
    per_page: rowsPerPage,
  } as RegionFilter);

  const [createRegion] = useCreateRegionMutation();
  const [updateRegion] = useUpdateRegionMutation();
  const [deleteRegion] = useDeleteRegionMutation();

  // Обработчики пагинации
  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

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

  // Удаление региона
  const handleDeleteRegion = async (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить этот регион?')) {
      try {
        await deleteRegion(id).unwrap();
        setSuccessMessage('Регион успешно удален');
      } catch (error: any) {
        console.error('Ошибка при удалении:', error);
      }
    }
  };

  // Обработчик поиска
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };

  // Закрытие уведомления
  const handleCloseSnackbar = () => {
    setSuccessMessage(null);
  };

  const isLoading = regionsLoading;
  const error = regionsError;
  const regions = (regionsData as unknown as ApiResponse<Region>)?.data || [];
  const totalItems = (regionsData as unknown as ApiResponse<Region>)?.total || 0;

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
      } catch (error) {
        console.error('Ошибка при удалении региона:', error);
      }
    }
  };

  const handleToggleStatus = async (region: Region) => {
    try {
      await updateRegion({
        id: region.id,
        region: { is_active: !region.is_active } as Partial<RegionFormData>
      }).unwrap();
    } catch (error) {
      console.error('Ошибка при изменении статуса:', error);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Управление регионами</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/catalog/regions/new')}
        >
          Добавить регион
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error.toString()}
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

      <TableContainer component={Paper}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Название</TableCell>
                  <TableCell>Код</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell align="right">Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {regions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      Регионы не найдены
                    </TableCell>
                  </TableRow>
                ) : (
                  regions.map((region: Region) => (
                    <TableRow key={region.id}>
                      <TableCell>{region.id}</TableCell>
                      <TableCell>{region.name}</TableCell>
                      <TableCell>{region.code || '—'}</TableCell>
                      <TableCell>
                        <Chip
                          icon={region.is_active ? <CheckIcon /> : <CloseIcon />}
                          label={region.is_active ? 'Активен' : 'Неактивен'}
                          color={region.is_active ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Редактировать">
                          <IconButton onClick={() => handleOpenDialog(region)} size="small">
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={region.is_active ? 'Деактивировать' : 'Активировать'}>
                          <IconButton
                            onClick={() => handleToggleStatus(region)}
                            size="small"
                            color={region.is_active ? 'error' : 'success'}
                          >
                            {region.is_active ? <CloseIcon /> : <CheckIcon />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Удалить">
                          <IconButton onClick={() => handleDeleteClick(region)} size="small" color="error">
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            
            <TablePagination
              component="div"
              count={totalItems}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[10, 25, 50]}
            />
          </>
        )}
      </TableContainer>

      {/* Диалог создания/редактирования */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>
            {editingRegion ? 'Редактировать регион' : 'Добавить новый регион'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                id="name"
                name="name"
                label="Название региона"
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
              <TextField
                fullWidth
                id="code"
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
                    onChange={(e) => formik.setFieldValue('is_active', e.target.checked)}
                    name="is_active"
                  />
                }
                label="Активен"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Отмена</Button>
            <Button type="submit" variant="contained" disabled={formik.isSubmitting}>
              {editingRegion ? 'Сохранить' : 'Создать'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Уведомление об успехе */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success">
          {successMessage}
        </Alert>
      </Snackbar>

      {/* Диалог подтверждения удаления */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <Typography>
            Вы действительно хотите удалить регион {selectedRegion?.name}?
            Это действие нельзя будет отменить.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RegionsPage; 