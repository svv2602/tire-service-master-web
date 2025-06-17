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

import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
import { Button } from '../../components/ui';
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
   * Обработчик открытия диалога удаления
   */
  const handleDeleteClick = (category: ServiceCategoryData) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

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
    navigate('/services/new');
  };

  /**
   * Обработчик перехода к редактированию категории
   */
  const handleEditCategory = (categoryId: number) => {
    navigate(`/services/${categoryId}/edit`);
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
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={tablePageStyles.tableHeader}>
                <TableCell sx={tablePageStyles.tableCell}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: SIZES.spacing.xs }}>
                    <CategoryIcon fontSize="small" />
                    Название
                  </Box>
                </TableCell>
                <TableCell sx={tablePageStyles.tableCell}>Описание</TableCell>
                <TableCell sx={tablePageStyles.tableCell}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: SIZES.spacing.xs }}>
                    <ToggleOnIcon fontSize="small" />
                    Статус
                  </Box>
                </TableCell>
                <TableCell sx={tablePageStyles.tableCell}>Количество услуг</TableCell>
                <TableCell sx={tablePageStyles.tableCell}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: SIZES.spacing.xs }}>
                    <CalendarTodayIcon fontSize="small" />
                    Дата создания
                  </Box>
                </TableCell>
                <TableCell align="center" sx={tablePageStyles.tableCell}>
                  Действия
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={tablePageStyles.loadingCell}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={tablePageStyles.emptyCell}>
                    <Typography variant="body1" color="text.secondary">
                      {searchQuery ? 'Категории не найдены' : 'Категории услуг отсутствуют'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category) => (
                  <TableRow key={category.id} sx={tablePageStyles.tableRow}>
                    <TableCell sx={tablePageStyles.tableCell}>
                      <Typography variant="body1" fontWeight={500}>
                        {category.name}
                      </Typography>
                    </TableCell>
                    <TableCell sx={tablePageStyles.tableCell}>
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
                        {category.description || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={tablePageStyles.tableCell}>
                      <Chip
                        label={category.is_active ? 'Активна' : 'Неактивна'}
                        color={category.is_active ? 'success' : 'default'}
                        size="small"
                        icon={category.is_active ? <ToggleOnIcon /> : <ToggleOffIcon />}
                      />
                    </TableCell>
                    <TableCell sx={tablePageStyles.tableCell}>
                      <Typography variant="body2">
                        {category.services_count || 0}
                      </Typography>
                    </TableCell>
                    <TableCell sx={tablePageStyles.tableCell}>
                      <Typography variant="body2" color="text.secondary">
                        {category.created_at 
                          ? new Date(category.created_at).toLocaleDateString('ru-RU')
                          : '—'
                        }
                      </Typography>
                    </TableCell>
                    <TableCell align="center" sx={tablePageStyles.tableCell}>
                      <Box sx={tablePageStyles.actionsContainer}>
                        <Tooltip title="Редактировать">
                          <IconButton
                            size="small"
                            onClick={() => handleEditCategory(category.id)}
                            sx={tablePageStyles.actionButton}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Удалить">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteClick(category)}
                            disabled={!!(category.services_count && category.services_count > 0)}
                            sx={tablePageStyles.dangerButton}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

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
