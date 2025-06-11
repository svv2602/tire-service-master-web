import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Paper,
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
  TablePagination,
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
import Notification from '../../components/Notification';

const PER_PAGE = 10;

export const ServicesPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
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

  const categories = response?.data || [];
  const totalCount = response?.pagination?.total_count || 0;

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setPage(0);
  };

  const handleDeleteClick = (category: ServiceCategoryData) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

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

  const handleAddCategory = () => {
    navigate('/services/new');
  };

  const handleEditCategory = (categoryId: number) => {
    navigate(`/services/${categoryId}/edit`);
  };

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Ошибка при загрузке категорий услуг
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Заголовок и кнопка добавления */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3 
      }}>
        <Typography variant="h4" component="h1" sx={{ 
          fontWeight: 600,
          color: theme.palette.text.primary 
        }}>
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

      {/* Поиск */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Поиск по названию категории..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Таблица */}
      <Paper sx={{ overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CategoryIcon fontSize="small" />
                    Название
                  </Box>
                </TableCell>
                <TableCell>Описание</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ToggleOnIcon fontSize="small" />
                    Статус
                  </Box>
                </TableCell>
                <TableCell>Количество услуг</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarTodayIcon fontSize="small" />
                    Дата создания
                  </Box>
                </TableCell>
                <TableCell align="center">
                  Действия
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      {searchQuery ? 'Категории не найдены' : 'Категории услуг отсутствуют'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <Typography variant="body1" fontWeight={500}>
                        {category.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
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
                    <TableCell>
                      <Chip
                        label={category.is_active ? 'Активна' : 'Неактивна'}
                        color={category.is_active ? 'success' : 'default'}
                        size="small"
                        icon={category.is_active ? <ToggleOnIcon /> : <ToggleOffIcon />}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {category.services_count || 0}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {category.created_at 
                          ? new Date(category.created_at).toLocaleDateString('ru-RU')
                          : '—'
                        }
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <Tooltip title="Редактировать">
                          <IconButton
                            size="small"
                            onClick={() => handleEditCategory(category.id)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Удалить">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteClick(category)}
                            disabled={!!(category.services_count && category.services_count > 0)}
                            color="error"
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
        {totalCount > 0 && (
          <TablePagination
            component="div"
            count={totalCount}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={PER_PAGE}
            onRowsPerPageChange={() => {}} // Фиксированное количество строк
            rowsPerPageOptions={[PER_PAGE]}
            labelDisplayedRows={({ from, to, count }) =>
              `${from}–${to} из ${count !== -1 ? count : `больше чем ${to}`}`
            }
            labelRowsPerPage="Строк на странице:"
            sx={{
              borderTop: `1px solid ${theme.palette.divider}`,
              '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                color: theme.palette.text.secondary,
              },
            }}
          />
        )}
      </Paper>

      {/* Диалог подтверждения удаления */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setCategoryToDelete(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Удалить категорию услуг</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить категорию "{categoryToDelete?.name}"?
          </Typography>
          {categoryToDelete?.services_count && categoryToDelete.services_count > 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              В этой категории есть услуги. Удаление невозможно.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDeleteDialogOpen(false);
              setCategoryToDelete(null);
            }}
          >
            Отмена
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
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
