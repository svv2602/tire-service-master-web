/**
 * NewServicesPage - Страница управления категориями услуг
 * 
 * Функциональность:
 * - Просмотр всех категорий услуг в табличном формате
 * - Поиск категорий по названию
 * - Создание новых категорий
 * - Редактирование существующих категорий
 * - Удаление категорий (с проверкой наличия услуг)
 * - Пагинация результатов
 * - Централизованная система стилей для консистентного дизайна
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  CircularProgress,
  IconButton,
  Tooltip,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Category as CategoryIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon,
  CalendarToday as CalendarTodayIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
  useGetServiceCategoriesQuery,
  useDeleteServiceCategoryMutation,
} from '../../api/services.api';
import { ServiceCategoryData } from '../../types/service';
import { Button, Table, type Column } from '../../components/ui';
import { Pagination } from '../../components/ui';
import Notification from '../../components/Notification';
import { getTablePageStyles, SIZES } from '../../styles';

const PER_PAGE = 10;

/**
 * Компонент страницы управления категориями услуг
 */
export const ServicesPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const tablePageStyles = getTablePageStyles(theme);
  
  // Состояния компонента
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<ServiceCategoryData | null>(null);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // API хуки
  const { 
    data: response, 
    isLoading, 
    error, 
    refetch 
  } = useGetServiceCategoriesQuery({
    page: page + 1,
    per_page: PER_PAGE,
    query: searchQuery || undefined,
  });

  const [deleteCategory] = useDeleteServiceCategoryMutation();

  // Извлечение данных из ответа API
  const categories = response?.data || [];
  const totalCount = response?.pagination?.total_count || 0;

  /**
   * Обработчик поиска категорий
   */
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setPage(0);
  };

  /**
   * Мемоизированные обработчики событий
   */
  const handleDeleteClick = useCallback((category: ServiceCategoryData) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  }, []);

  const handleEditCategory = useCallback((categoryId: number) => {
    navigate(`/admin/services/${categoryId}/edit`);
  }, [navigate]);

  /**
   * Конфигурация колонок таблицы
   */
  const columns: Column[] = useMemo(() => [
    {
      id: 'name',
      label: 'Название',
      wrap: true,
      format: (value, row: ServiceCategoryData) => (
        <Box sx={tablePageStyles.avatarContainer}>
          <CategoryIcon sx={{ color: 'primary.main', mr: 1 }} />
          <Typography variant="body1" fontWeight={500}>
            {row.name}
          </Typography>
        </Box>
      )
    },
    {
      id: 'description',
      label: 'Описание',
      wrap: true,
      format: (value, row: ServiceCategoryData) => (
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ 
            maxWidth: 200,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {row.description || '—'}
        </Typography>
      )
    },
    {
      id: 'is_active',
      label: 'Статус',
      align: 'center',
      format: (value, row: ServiceCategoryData) => (
        <Chip
          label={row.is_active ? 'Активна' : 'Неактивна'}
          color={row.is_active ? 'success' : 'default'}
          size="small"
          icon={row.is_active ? <ToggleOnIcon /> : <ToggleOffIcon />}
        />
      )
    },
    {
      id: 'services_count',
      label: 'Количество услуг',
      align: 'center',
      format: (value, row: ServiceCategoryData) => (
        <Typography variant="body2">
          {row.services_count || 0}
        </Typography>
      )
    },
    {
      id: 'created_at',
      label: 'Дата создания',
      format: (value, row: ServiceCategoryData) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CalendarTodayIcon fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary">
            {row.created_at 
              ? new Date(row.created_at).toLocaleDateString('ru-RU')
              : '—'
            }
          </Typography>
        </Box>
      )
    },
    {
      id: 'actions',
      label: 'Действия',
      align: 'center',
      format: (value, row: ServiceCategoryData) => (
        <Box sx={tablePageStyles.actionsContainer}>
          <Tooltip title="Редактировать">
            <IconButton
              size="small"
              onClick={() => handleEditCategory(row.id)}
              sx={tablePageStyles.actionButton}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Удалить">
            <IconButton
              size="small"
              onClick={() => handleDeleteClick(row)}
              disabled={!!(row.services_count && row.services_count > 0)}
              sx={tablePageStyles.dangerButton}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ], [tablePageStyles, handleDeleteClick, handleEditCategory]);

  /**
   * Обработчик подтверждения удаления категории
   */
  const handleDeleteConfirm = async () => {
    if (categoryToDelete) {
      try {
        await deleteCategory(categoryToDelete.id).unwrap();
        setDeleteDialogOpen(false);
        setCategoryToDelete(null);
        setNotification({
          open: true,
          message: 'Категория услуг успешно удалена',
          severity: 'success',
        });
        refetch();
      } catch (error) {
        console.error('Ошибка при удалении категории:', error);
        setNotification({
          open: true,
          message: 'Ошибка при удалении категории услуг',
          severity: 'error',
        });
      }
    }
  };

  /**
   * Обработчик перехода к созданию новой категории
   */
  const handleAddCategory = () => {
    navigate('/admin/services/new');
  };

  /**
   * Обработчик смены страницы пагинации
   */
  const handlePageChange = (newPage: number) => {
    setPage(newPage - 1);
  };

  // Обработка ошибки загрузки
  if (error) {
    return (
      <Box sx={tablePageStyles.pageContainer}>
        <Alert severity="error">
          Ошибка при загрузке категорий услуг
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={tablePageStyles.pageContainer}>
      {/* Заголовок страницы */}
      <Box sx={tablePageStyles.headerContainer}>
        <Typography variant="h4" component="h1" sx={tablePageStyles.pageTitle}>
          Категории услуг
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddCategory}
        >
          Добавить категорию
        </Button>
      </Box>

      {/* Фильтры и поиск */}
      <Box sx={tablePageStyles.filtersContainer}>
        <TextField
          placeholder="Поиск по названию категории..."
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          sx={tablePageStyles.searchField}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Таблица категорий */}
      <Box sx={tablePageStyles.tableContainer}>
        {isLoading ? (
          <Box sx={tablePageStyles.loadingContainer}>
            <CircularProgress />
          </Box>
        ) : categories.length === 0 ? (
          <Box sx={tablePageStyles.loadingContainer}>
            <Typography variant="body1" color="text.secondary">
              {searchQuery ? 'Категории не найдены' : 'Категории услуг отсутствуют'}
            </Typography>
          </Box>
        ) : (
          <Table
            columns={columns}
            rows={categories}
          />
        )}

        {/* Пагинация */}
        {totalCount > PER_PAGE && (
          <Box sx={tablePageStyles.paginationContainer}>
            <Pagination
              count={Math.ceil(totalCount / PER_PAGE)}
              page={page + 1}
              onChange={handlePageChange}
              disabled={isLoading}
            />
          </Box>
        )}
      </Box>

      {/* Диалог подтверждения удаления */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setCategoryToDelete(null);
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: tablePageStyles.dialogPaper
        }}
      >
        <DialogTitle sx={tablePageStyles.dialogTitle}>
          Удалить категорию услуг
        </DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить категорию "{categoryToDelete?.name}"?
          </Typography>
          {categoryToDelete?.services_count && categoryToDelete.services_count > 0 && (
            <Alert severity="warning" sx={{ mt: theme.spacing(SIZES.spacing.md) }}>
              В этой категории есть услуги. Удаление невозможно.
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={tablePageStyles.dialogActions}>
          <Button
            variant="outlined"
            onClick={() => {
              setDeleteDialogOpen(false);
              setCategoryToDelete(null);
            }}
          >
            Отмена
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            variant="contained"
            color="error"
            disabled={!!(categoryToDelete?.services_count && categoryToDelete.services_count > 0)}
          >
            Удалить
          </Button>
        </DialogActions>
      </Dialog>

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

export default ServicesPage;
