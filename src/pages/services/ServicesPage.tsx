// filepath: /home/snisar/mobi_tz/tire-service-master-web/src/pages/services/ServicesPage.tsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  useTheme,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Category as CategoryIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon,
  CalendarToday as CalendarTodayIcon,
  FormatListNumbered as FormatListNumberedIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { 
  useGetServiceCategoriesQuery, 
  useDeleteServiceCategoryMutation,
  useToggleServiceCategoryActiveMutation,
} from '../../api/serviceCategories.api';
import { ServiceCategoryData } from '../../types/service';
import { Pagination } from '../../components/ui';
import Notification from '../../components/Notification';

// Импорт централизованной системы стилей
import { getTablePageStyles, SIZES } from '../../styles';

/**
 * Страница управления категориями услуг
 * 
 * Функциональность:
 * - Отображение категорий услуг в карточном виде
 * - Поиск и фильтрация по статусу активности
 * - Создание, редактирование и удаление категорий
 * - Переключение статуса активности
 * - Пагинация результатов
 * - Централизованная система стилей для консистентного UI
 */
const ServicesPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const theme = useTheme();
  
  // Централизованная система стилей
  const tablePageStyles = getTablePageStyles(theme);
  
  // Состояние для поиска, фильтрации и пагинации
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const PER_PAGE = 12; // Для карточного интерфейса
  
  // Состояние для диалогов и уведомлений
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<{ id: number; name: string } | null>(null);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  // RTK Query хуки
  const { 
    data: categoriesData, 
    isLoading, 
    error 
  } = useGetServiceCategoriesQuery({
    query: search || undefined,
    active: activeFilter !== '' ? activeFilter === 'true' : undefined,
    page,
    per_page: PER_PAGE,
  });

  const [deleteCategory] = useDeleteServiceCategoryMutation();
  const [toggleActive] = useToggleServiceCategoryActiveMutation();

  const categories = categoriesData?.data || [];
  const totalPages = categoriesData?.pagination?.total_pages || 0;

  // Обработчики событий
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const handleActiveFilterChange = (event: any) => {
    setActiveFilter(event.target.value);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleDeleteClick = (category: { id: number; name: string }) => {
    setSelectedCategory(category);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedCategory) {
      try {
        await deleteCategory(selectedCategory.id.toString()).unwrap();
        setNotification({
          open: true,
          message: t('admin.services.messages.deleteSuccess', { name: selectedCategory.name }),
          severity: 'success'
        });
        setDeleteDialogOpen(false);
        setSelectedCategory(null);
      } catch (error: any) {
        let errorMessage = t('admin.services.messages.deleteError');
        if (error.data?.message) {
          errorMessage = error.data.message;
        } else if (error.data?.errors) {
          errorMessage = Object.values(error.data.errors).join(', ');
        }
        setNotification({
          open: true,
          message: errorMessage,
          severity: 'error'
        });
      }
    }
  };

  const handleCloseDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedCategory(null);
  };

  const handleToggleActive = async (id: number, currentActive: boolean) => {
    try {
      await toggleActive({ id: id.toString(), is_active: !currentActive }).unwrap();
      setNotification({
        open: true,
        message: t('admin.services.messages.statusSuccess'),
        severity: 'success'
      });
    } catch (error: any) {
      let errorMessage = t('admin.services.messages.statusError');
      if (error.data?.message) {
        errorMessage = error.data.message;
      } else if (error.data?.errors) {
        errorMessage = Object.values(error.data.errors).join(', ');
      }
      setNotification({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    }
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  // Показываем индикатор загрузки
  if (isLoading) {
    return (
      <Box sx={tablePageStyles.loadingContainer}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={tablePageStyles.container}>
      {/* Заголовок с кнопкой добавления */}
      <Box sx={tablePageStyles.headerContainer}>
        <Typography variant="h4" sx={tablePageStyles.title}>
          {t('admin.services.title')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/admin/services/new')}
          sx={tablePageStyles.primaryButton}
        >
          {t('admin.services.createCategory')}
        </Button>
      </Box>

      {/* Фильтры и поиск */}
      <Box sx={tablePageStyles.filtersContainer}>
        <TextField
          placeholder={t('admin.services.searchPlaceholder')}
          variant="outlined"
          size="small"
          value={search}
          onChange={handleSearchChange}
          sx={tablePageStyles.searchField}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        
        <FormControl size="small" sx={tablePageStyles.filterSelect}>
          <InputLabel>{t('tables.columns.status')}</InputLabel>
          <Select
            value={activeFilter}
            onChange={handleActiveFilterChange}
            label={t('tables.columns.status')}
          >
            <MenuItem value="">{t('filters.statusOptions.all')}</MenuItem>
            <MenuItem value="true">{t('filters.statusOptions.active')}</MenuItem>
            <MenuItem value="false">{t('filters.statusOptions.inactive')}</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Сообщения об ошибках */}
      {error && (
        <Alert severity="error" sx={tablePageStyles.errorAlert}>
          {t('admin.services.loadingError')}
        </Alert>
      )}

      {/* Карточки категорий */}
      <Grid container spacing={SIZES.spacing.md}>
        {categories.map((category: ServiceCategoryData) => (
          <Grid item xs={12} sm={6} md={4} key={category.id}>
            <Card
              sx={{
                ...tablePageStyles.card,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                opacity: category.is_active ? 1 : 0.7,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  boxShadow: theme.shadows[4],
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1, p: SIZES.spacing.md }}>
                {/* Заголовок с иконкой */}
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: SIZES.spacing.sm, 
                  mb: SIZES.spacing.sm 
                }}>
                  <CategoryIcon sx={{ 
                    mt: 0.5, 
                    color: theme.palette.primary.main,
                    fontSize: SIZES.fontSize.lg
                  }} />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography 
                      variant="h6"
                      sx={tablePageStyles.cardTitle}
                    >
                      {category.name}
                    </Typography>
                    {category.description && (
                      <Typography
                        variant="body2"
                        sx={{
                          ...tablePageStyles.cardDescription,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {category.description}
                      </Typography>
                    )}
                  </Box>
                </Box>

                {/* Статус и метрики */}
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: SIZES.spacing.xs, 
                  mt: SIZES.spacing.sm,
                  flexWrap: 'wrap'
                }}>
                  <Chip 
                    label={category.is_active ? t('statuses.activeCategory') : t('statuses.inactiveCategory')}
                    color={category.is_active ? 'success' : 'default'}
                    size="small"
                    sx={tablePageStyles.statusChip}
                  />
                  {category.services_count !== undefined && (
                    <Tooltip title={t('admin.services.servicesCount')}>
                      <Chip
                        icon={<FormatListNumberedIcon sx={{ fontSize: '16px !important' }} />}
                        label={category.services_count}
                        size="small"
                        variant="outlined"
                        sx={tablePageStyles.metricChip}
                      />
                    </Tooltip>
                  )}
                </Box>

                {/* Дата создания */}
                {category.created_at && (
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: SIZES.spacing.xs, 
                    mt: SIZES.spacing.sm 
                  }}>
                    <CalendarTodayIcon 
                      fontSize="small" 
                      sx={{ color: theme.palette.text.secondary }}
                    />
                    <Typography 
                      variant="caption"
                      sx={tablePageStyles.dateText}
                    >
                      {new Date(category.created_at).toLocaleDateString('ru-RU', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </Typography>
                  </Box>
                )}
              </CardContent>

              {/* Действия */}
              <CardActions sx={{ 
                justifyContent: 'flex-start', 
                p: SIZES.spacing.sm, 
                pt: 0,
                gap: SIZES.spacing.xs
              }}>
                <Tooltip title={t('tables.actions.edit')}>
                  <IconButton 
                    size="small"
                    onClick={() => navigate(`/admin/services/${category.id}/edit`)}
                    sx={tablePageStyles.actionButton}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t('tables.actions.delete')}>
                  <IconButton 
                    size="small"
                    onClick={() => handleDeleteClick(category)}
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
                <Tooltip title={category.is_active ? t('tables.actions.deactivate') : t('tables.actions.activate')}>
                  <IconButton 
                    size="small"
                    onClick={() => handleToggleActive(category.id, category.is_active)}
                    sx={{
                      ...tablePageStyles.actionButton,
                      color: category.is_active ? theme.palette.warning.main : theme.palette.success.main,
                      '&:hover': {
                        backgroundColor: category.is_active 
                          ? `${theme.palette.warning.main}15`
                          : `${theme.palette.success.main}15`
                      }
                    }}
                  >
                    {category.is_active ? <ToggleOffIcon fontSize="small" /> : <ToggleOnIcon fontSize="small" />}
                  </IconButton>
                </Tooltip>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Пустое состояние */}
      {categories.length === 0 && !isLoading && (
        <Box sx={tablePageStyles.emptyStateContainer}>
          <CategoryIcon sx={tablePageStyles.emptyStateIcon} />
          <Typography variant="h6" sx={tablePageStyles.emptyStateTitle}>
            {search || activeFilter !== '' ? t('admin.services.categoriesNotFound') : t('admin.services.noCategories')}
          </Typography>
          <Typography variant="body2" sx={tablePageStyles.emptyStateDescription}>
            {search || activeFilter !== '' 
              ? t('admin.services.changeCriteria')
              : t('admin.services.createFirstCategory')
            }
          </Typography>
          {!search && activeFilter === '' && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/admin/services/new')}
              sx={tablePageStyles.primaryButton}
            >
              {t('admin.services.createCategory')}
            </Button>
          )}
        </Box>
      )}

      {/* Пагинация */}
      {totalPages > 1 && (
        <Box sx={tablePageStyles.paginationContainer}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            size="large"
          />
        </Box>
      )}

      {/* Диалог подтверждения удаления */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: tablePageStyles.dialogPaper
        }}
      >
        <DialogTitle sx={tablePageStyles.dialogTitle}>
          {t('admin.services.confirmDelete.title')}
        </DialogTitle>
        <DialogContent sx={{ pt: SIZES.spacing.sm }}>
          <DialogContentText sx={tablePageStyles.dialogText}>
            {t('admin.services.confirmDelete.message', { name: selectedCategory?.name })}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={tablePageStyles.dialogActions}>
          <Button 
            onClick={handleCloseDialog}
            sx={tablePageStyles.secondaryButton}
          >
            {t('common.cancel')}
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            variant="contained"
            sx={tablePageStyles.dangerButton}
          >
            {t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Уведомления */}
      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={handleCloseNotification}
      />
    </Box>
  );
};

export default ServicesPage;
