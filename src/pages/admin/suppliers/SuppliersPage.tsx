import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Alert,
  Tooltip,
  Menu,
  MenuItem,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
  Upload as UploadIcon,
  Key as KeyIcon,
  Store as StoreIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  Inventory as InventoryIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  useGetSuppliersQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
  useToggleSupplierActiveMutation,
  useRegenerateSupplierApiKeyMutation,
  type Supplier,
  type SupplierFormData,
  type SupplierWithStats,
} from '../../../api/suppliers.api';
import { getTablePageStyles } from '../../../styles/tablePageStyles';
import { useTheme } from '@mui/material/styles';
import AdminPageWrapper from '../../../components/admin/AdminPageWrapper';

const SuppliersPage: React.FC = () => {
  const { t } = useTranslation(['admin', 'common']);
  const theme = useTheme();
  const navigate = useNavigate();
  const tablePageStyles = getTablePageStyles(theme);

  // Состояние страницы
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeOnly, setActiveOnly] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierWithStats | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Форма поставщика
  const [formData, setFormData] = useState<SupplierFormData>({
    firm_id: '',
    name: '',
    is_active: true,
    priority: 1,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // API хуки
  const { 
    data: suppliersResponse, 
    isLoading, 
    error,
    refetch 
  } = useGetSuppliersQuery({
    page,
    per_page: 20,
    active_only: activeOnly,
    search: searchQuery || undefined,
  });

  const [createSupplier, { isLoading: isCreating }] = useCreateSupplierMutation();
  const [updateSupplier, { isLoading: isUpdating }] = useUpdateSupplierMutation();
  const [deleteSupplier, { isLoading: isDeleting }] = useDeleteSupplierMutation();
  const [toggleActive, { isLoading: isToggling }] = useToggleSupplierActiveMutation();
  const [regenerateApiKey, { isLoading: isRegenerating }] = useRegenerateSupplierApiKeyMutation();

  const suppliers = suppliersResponse?.data || [];
  const totalPages = suppliersResponse?.meta?.total_pages || 1;

  // Валидация формы
  const validateForm = (data: SupplierFormData): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!data.firm_id.trim()) {
      errors.firm_id = 'Firm ID обязателен';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(data.firm_id)) {
      errors.firm_id = 'Firm ID может содержать только буквы, цифры, дефисы и подчеркивания';
    }

    if (!data.name.trim()) {
      errors.name = 'Название обязательно';
    } else if (data.name.trim().length < 2) {
      errors.name = 'Название должно содержать минимум 2 символа';
    }

    if (data.priority < 1 || data.priority > 10) {
      errors.priority = 'Приоритет должен быть от 1 до 10';
    }

    return errors;
  };

  // Обработчики событий
  const handleCreateSupplier = async () => {
    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      await createSupplier(formData).unwrap();
      setIsCreateDialogOpen(false);
      resetForm();
      refetch();
    } catch (error: any) {
      console.error('Ошибка создания поставщика:', error);
      setFormErrors({ general: error?.data?.error || 'Ошибка создания поставщика' });
    }
  };

  const handleUpdateSupplier = async () => {
    if (!selectedSupplier) return;

    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      await updateSupplier({ id: selectedSupplier.id, data: formData }).unwrap();
      setIsEditDialogOpen(false);
      resetForm();
      refetch();
    } catch (error: any) {
      console.error('Ошибка обновления поставщика:', error);
      setFormErrors({ general: error?.data?.error || 'Ошибка обновления поставщика' });
    }
  };

  const handleDeleteSupplier = async () => {
    if (!selectedSupplier) return;

    try {
      await deleteSupplier(selectedSupplier.id).unwrap();
      setIsDeleteDialogOpen(false);
      setSelectedSupplier(null);
      refetch();
    } catch (error: any) {
      console.error('Ошибка удаления поставщика:', error);
    }
  };

  const handleToggleActive = async (supplier: SupplierWithStats) => {
    try {
      await toggleActive(supplier.id).unwrap();
      refetch();
    } catch (error: any) {
      console.error('Ошибка переключения активности:', error);
    }
  };

  const handleRegenerateApiKey = async (supplier: SupplierWithStats) => {
    try {
      await regenerateApiKey(supplier.id).unwrap();
      refetch();
      setAnchorEl(null);
    } catch (error: any) {
      console.error('Ошибка регенерации API ключа:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      firm_id: '',
      name: '',
      is_active: true,
      priority: 1,
    });
    setFormErrors({});
    setSelectedSupplier(null);
  };

  const openEditDialog = (supplier: SupplierWithStats) => {
    setSelectedSupplier(supplier);
    setFormData({
      firm_id: supplier.firm_id,
      name: supplier.name,
      is_active: supplier.is_active,
      priority: supplier.priority,
    });
    setFormErrors({});
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (supplier: SupplierWithStats) => {
    setSelectedSupplier(supplier);
    setIsDeleteDialogOpen(true);
  };

  // Получение текста статуса синхронизации
  const getSyncStatusText = (status: string) => {
    switch (status) {
      case 'never': return 'Не синхронизировано';
      case 'recent': return 'Недавно';
      case 'today': return 'Сегодня';
      case 'week': return 'На неделе';
      case 'old': return 'Давно';
      default: return 'Неизвестно';
    }
  };

  // Получение цвета статуса синхронизации
  const getSyncStatusColor = (status: string) => {
    switch (status) {
      case 'never': return 'default';
      case 'recent': return 'success';
      case 'today': return 'success';
      case 'week': return 'warning';
      case 'old': return 'error';
      default: return 'default';
    }
  };

  // Получение тултипа статуса синхронизации
  const getSyncStatusTooltip = (status: string) => {
    switch (status) {
      case 'never': return 'Прайс-лист еще не загружался';
      case 'recent': return 'Обновлено в течение последнего часа';
      case 'today': return 'Обновлено сегодня';
      case 'week': return 'Обновлено на этой неделе';
      case 'old': return 'Устарело (более недели назад)';
      default: return 'Статус неизвестен';
    }
  };

  return (
    <AdminPageWrapper>
      <Box sx={tablePageStyles.pageContainer}>
        {/* Заголовок страницы */}
        <Box sx={tablePageStyles.headerContainer}>
          <Box>
            <Typography variant="h4" component="h1" sx={tablePageStyles.pageTitle}>
              <StoreIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Поставщики
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Управление поставщиками и мониторинг прайс-листов
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsCreateDialogOpen(true)}
            sx={tablePageStyles.addButton}
          >
            Добавить поставщика
          </Button>
        </Box>

        {/* Фильтры */}
        <Box sx={tablePageStyles.filtersContainer}>
          <TextField
            placeholder="Поиск по названию или Firm ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            sx={{ minWidth: 300 }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={activeOnly}
                onChange={(e) => setActiveOnly(e.target.checked)}
              />
            }
            label="Только активные"
          />
          <IconButton onClick={() => refetch()} disabled={isLoading}>
            <RefreshIcon />
          </IconButton>
        </Box>

        {/* Загрузка */}
        {isLoading && <LinearProgress sx={{ mb: 2 }} />}

        {/* Ошибка */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Ошибка загрузки поставщиков
          </Alert>
        )}

        {/* Список поставщиков */}
        <Grid container spacing={3}>
          {suppliers.map((supplier) => (
            <Grid item xs={12} md={6} lg={4} key={supplier.id}>
              <Card sx={{ height: '100%', position: 'relative' }}>
                <CardContent>
                  {/* Меню действий */}
                  <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                    <IconButton
                      onClick={(e) => {
                        setSelectedSupplier(supplier);
                        setAnchorEl(e.currentTarget);
                      }}
                      size="small"
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>

                  {/* Основная информация */}
                  <Box sx={{ mb: 2 }}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Typography variant="h6" component="h3">
                        {supplier.name}
                      </Typography>
                      <Chip
                        size="small"
                        label={supplier.is_active ? 'Активен' : 'Неактивен'}
                        color={supplier.is_active ? 'success' : 'default'}
                        variant="outlined"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Firm ID: {supplier.firm_id}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Приоритет: {supplier.priority}
                    </Typography>
                  </Box>

                  {/* Статистика */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Статистика:
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={1}>
                      <Chip
                        icon={<InventoryIcon />}
                        label={`${supplier.statistics.products_count} товаров`}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        icon={<CheckCircleIcon />}
                        label={`${supplier.statistics.in_stock_products_count} в наличии`}
                        size="small"
                        variant="outlined"
                        color="success"
                      />
                    </Box>
                  </Box>

                  {/* Статус синхронизации */}
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Синхронизация:
                    </Typography>
                    <Tooltip title={getSyncStatusTooltip(supplier.statistics.sync_status)} placement="top">
                      <Chip
                        label={getSyncStatusText(supplier.statistics.sync_status)}
                        size="small"
                        color={getSyncStatusColor(supplier.statistics.sync_status)}
                        variant="outlined"
                      />
                    </Tooltip>
                    {supplier.statistics.last_sync_ago && (
                      <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                        {supplier.statistics.last_sync_ago}
                      </Typography>
                    )}
                  </Box>

                  {/* Кнопки действий */}
                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => navigate(`/admin/suppliers/${supplier.id}`)}
                    >
                      Подробнее
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color={supplier.is_active ? 'error' : 'success'}
                      onClick={() => handleToggleActive(supplier)}
                      disabled={isToggling}
                    >
                      {supplier.is_active ? 'Деактивировать' : 'Активировать'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Пагинация */}
        {totalPages > 1 && (
          <Box sx={tablePageStyles.paginationContainer}>
            <Button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              Назад
            </Button>
            <Typography variant="body2">
              Страница {page} из {totalPages}
            </Typography>
            <Button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              Далее
            </Button>
          </Box>
        )}

        {/* Меню действий */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          <MenuItem onClick={() => {
            if (selectedSupplier) openEditDialog(selectedSupplier);
            setAnchorEl(null);
          }}>
            <EditIcon sx={{ mr: 1 }} fontSize="small" />
            Редактировать
          </MenuItem>
          <MenuItem onClick={() => {
            if (selectedSupplier) navigate(`/admin/suppliers/${selectedSupplier.id}/upload`);
            setAnchorEl(null);
          }}>
            <UploadIcon sx={{ mr: 1 }} fontSize="small" />
            Загрузить прайс
          </MenuItem>
          <MenuItem onClick={() => {
            if (selectedSupplier) handleRegenerateApiKey(selectedSupplier);
          }} disabled={isRegenerating}>
            <KeyIcon sx={{ mr: 1 }} fontSize="small" />
            Новый API ключ
          </MenuItem>
          <MenuItem onClick={() => {
            if (selectedSupplier) openDeleteDialog(selectedSupplier);
            setAnchorEl(null);
          }}>
            <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
            Удалить
          </MenuItem>
        </Menu>

        {/* Диалог создания поставщика */}
        <Dialog open={isCreateDialogOpen} onClose={() => setIsCreateDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Добавить поставщика</DialogTitle>
          <DialogContent>
            {formErrors.general && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {formErrors.general}
              </Alert>
            )}
            <TextField
              autoFocus
              margin="dense"
              label="Firm ID"
              fullWidth
              variant="outlined"
              value={formData.firm_id}
              onChange={(e) => setFormData({ ...formData, firm_id: e.target.value })}
              error={!!formErrors.firm_id}
              helperText={formErrors.firm_id}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Название"
              fullWidth
              variant="outlined"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={!!formErrors.name}
              helperText={formErrors.name}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Приоритет"
              type="number"
              fullWidth
              variant="outlined"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 1 })}
              error={!!formErrors.priority}
              helperText={formErrors.priority}
              inputProps={{ min: 1, max: 10 }}
              sx={{ mb: 2 }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
              }
              label="Активен"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsCreateDialogOpen(false)}>
              Отмена
            </Button>
            <Button 
              onClick={handleCreateSupplier} 
              variant="contained"
              disabled={isCreating}
            >
              Создать
            </Button>
          </DialogActions>
        </Dialog>

        {/* Диалог редактирования поставщика */}
        <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Редактировать поставщика</DialogTitle>
          <DialogContent>
            {formErrors.general && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {formErrors.general}
              </Alert>
            )}
            <TextField
              margin="dense"
              label="Firm ID"
              fullWidth
              variant="outlined"
              value={formData.firm_id}
              onChange={(e) => setFormData({ ...formData, firm_id: e.target.value })}
              error={!!formErrors.firm_id}
              helperText={formErrors.firm_id}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Название"
              fullWidth
              variant="outlined"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={!!formErrors.name}
              helperText={formErrors.name}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Приоритет"
              type="number"
              fullWidth
              variant="outlined"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 1 })}
              error={!!formErrors.priority}
              helperText={formErrors.priority}
              inputProps={{ min: 1, max: 10 }}
              sx={{ mb: 2 }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
              }
              label="Активен"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsEditDialogOpen(false)}>
              Отмена
            </Button>
            <Button 
              onClick={handleUpdateSupplier} 
              variant="contained"
              disabled={isUpdating}
            >
              Сохранить
            </Button>
          </DialogActions>
        </Dialog>

        {/* Диалог удаления поставщика */}
        <Dialog open={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)}>
          <DialogTitle>Удалить поставщика</DialogTitle>
          <DialogContent>
            <Typography>
              Вы уверены, что хотите удалить поставщика "{selectedSupplier?.name}"?
              Это действие нельзя отменить.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsDeleteDialogOpen(false)}>
              Отмена
            </Button>
            <Button 
              onClick={handleDeleteSupplier} 
              color="error" 
              variant="contained"
              disabled={isDeleting}
            >
              Удалить
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AdminPageWrapper>
  );
};

export default SuppliersPage;