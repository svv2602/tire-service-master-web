/**
 * CarBrandsPage - Страница управления брендами автомобилей
 * 
 * Функциональность:
 * - Просмотр всех брендов автомобилей в табличном формате
 * - Поиск брендов по названию
 * - Фильтрация по статусу активности
 * - Создание новых брендов
 * - Редактирование существующих брендов
 * - Удаление брендов с подтверждением
 * - Переключение статуса активности
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
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DirectionsCar as CarIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon,
  CalendarToday as CalendarTodayIcon,
  FormatListNumbered as FormatListNumberedIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { 
  useGetCarBrandsQuery, 
  useDeleteCarBrandMutation,
  useToggleCarBrandActiveMutation,
} from '../../api';
import { CarBrand } from '../../types/car';
import { Button } from '../../components/ui';
import { Pagination } from '../../components/ui';
import Notification from '../../components/Notification';
import { getTablePageStyles, SIZES } from '../../styles';

const PER_PAGE = 25;

/**
 * Компонент страницы управления брендами автомобилей
 */
const CarBrandsPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const tablePageStyles = getTablePageStyles(theme);
  
  // Состояние для поиска, фильтрации и пагинации
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('');
  const [page, setPage] = useState(0);
  
  // Состояние для диалогов и уведомлений
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<{ id: number; name: string } | null>(null);
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
    data: brandsData, 
    isLoading, 
    error 
  } = useGetCarBrandsQuery({
    query: search || undefined,
    is_active: activeFilter !== '' ? activeFilter === 'true' : undefined,
    page: page + 1,
    per_page: PER_PAGE,
  });

  const [deleteBrand] = useDeleteCarBrandMutation();
  const [toggleActive] = useToggleCarBrandActiveMutation();

  /**
   * Обработчик изменения поискового запроса
   */
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setPage(0);
  };

  /**
   * Обработчик изменения фильтра по статусу
   */
  const handleActiveFilterChange = (event: any) => {
    setActiveFilter(event.target.value);
    setPage(0);
  };

  /**
   * Обработчик смены страницы пагинации
   */
  const handlePageChange = (newPage: number) => {
    setPage(newPage - 1);
  };

  /**
   * Обработчик открытия диалога удаления
   */
  const handleDeleteClick = (brand: { id: number; name: string }) => {
    setSelectedBrand(brand);
    setDeleteDialogOpen(true);
  };

  /**
   * Обработчик подтверждения удаления бренда
   */
  const handleDeleteConfirm = async () => {
    if (selectedBrand) {
      try {
        await deleteBrand(selectedBrand.id.toString()).unwrap();
        setNotification({
          open: true,
          message: `Бренд "${selectedBrand.name}" успешно удален`,
          severity: 'success'
        });
        setDeleteDialogOpen(false);
        setSelectedBrand(null);
      } catch (error: any) {
        let errorMessage = 'Ошибка при удалении бренда';
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

  /**
   * Обработчик закрытия диалога удаления
   */
  const handleCloseDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedBrand(null);
  };

  /**
   * Обработчик переключения статуса активности бренда
   */
  const handleToggleActive = async (id: number, currentActive: boolean) => {
    try {
      await toggleActive({ id: id.toString(), is_active: !currentActive }).unwrap();
      setNotification({
        open: true,
        message: `Статус бренда успешно изменен`,
        severity: 'success'
      });
    } catch (error: any) {
      let errorMessage = 'Ошибка при изменении статуса';
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

  /**
   * Обработчик закрытия уведомлений
   */
  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  /**
   * Обработчик перехода к созданию нового бренда
   */
  const handleAddBrand = () => {
    navigate('/car-brands/new');
  };

  // Отображение состояний загрузки и ошибок
  if (isLoading) {
    return (
      <Box sx={tablePageStyles.loadingContainer}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: theme.spacing(SIZES.spacing.md) }}>
          Загрузка брендов...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={tablePageStyles.pageContainer}>
        <Alert severity="error" sx={tablePageStyles.errorAlert}>
          Ошибка при загрузке брендов: {error.toString()}
        </Alert>
      </Box>
    );
  }

  const brands = brandsData?.data || [];
  const totalItems = brandsData?.pagination?.total_count || 0;

  return (
    <Box sx={tablePageStyles.pageContainer}>
      {/* Заголовок страницы */}
      <Box sx={tablePageStyles.headerContainer}>
        <Typography variant="h4" component="h1" sx={tablePageStyles.pageTitle}>
          Бренды автомобилей
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddBrand}
        >
          Добавить бренд
        </Button>
      </Box>

      {/* Фильтры и поиск */}
      <Box sx={tablePageStyles.filtersContainer}>
        <TextField
          placeholder="Поиск по названию бренда"
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
          <InputLabel>Статус</InputLabel>
          <Select
            value={activeFilter}
            onChange={handleActiveFilterChange}
            label="Статус"
          >
            <MenuItem value="">Все</MenuItem>
            <MenuItem value="true">Активные</MenuItem>
            <MenuItem value="false">Неактивные</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Таблица брендов */}
      <Box sx={tablePageStyles.tableContainer}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={tablePageStyles.tableHeader}>
                <TableCell sx={tablePageStyles.tableCell}>Бренд</TableCell>
                <TableCell sx={tablePageStyles.tableCell}>Статус</TableCell>
                <TableCell sx={tablePageStyles.tableCell}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: SIZES.spacing.xs }}>
                    <FormatListNumberedIcon fontSize="small" />
                    Кол-во моделей
                  </Box>
                </TableCell>
                <TableCell sx={tablePageStyles.tableCell}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: SIZES.spacing.xs }}>
                    <CalendarTodayIcon fontSize="small" />
                    Дата создания
                  </Box>
                </TableCell>
                <TableCell align="right" sx={tablePageStyles.tableCell}>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {brands.map((brand: CarBrand) => (
                <TableRow key={brand.id} sx={tablePageStyles.tableRow}>
                  <TableCell sx={tablePageStyles.tableCell}>
                    <Box sx={tablePageStyles.avatarContainer}>
                      {brand.logo ? (
                        <Avatar 
                          src={brand.logo} 
                          alt={brand.name}
                          variant="rounded"
                          sx={{ 
                            width: SIZES.icon.medium * 1.5, 
                            height: SIZES.icon.medium * 1.5,
                            borderRadius: SIZES.borderRadius.xs
                          }}
                        >
                          <CarIcon />
                        </Avatar>
                      ) : (
                        <Avatar 
                          variant="rounded" 
                          sx={{ 
                            width: SIZES.icon.medium * 1.5, 
                            height: SIZES.icon.medium * 1.5,
                            borderRadius: SIZES.borderRadius.xs
                          }}
                        >
                          <CarIcon />
                        </Avatar>
                      )}
                      <Typography variant="body1" fontWeight={500}>
                        {brand.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={tablePageStyles.tableCell}>
                    <Chip 
                      label={brand.is_active ? 'Активен' : 'Неактивен'}
                      color={brand.is_active ? 'success' : 'default'}
                      size="small"
                      sx={tablePageStyles.statusChip}
                    />
                  </TableCell>
                  <TableCell sx={tablePageStyles.tableCell}>
                    <Tooltip title="Количество моделей">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: SIZES.spacing.xs }}>
                        <FormatListNumberedIcon fontSize="small" />
                        <Typography variant="body2">
                          {brand.models_count !== undefined ? brand.models_count : 'Н/Д'}
                        </Typography>
                      </Box>
                    </Tooltip>
                  </TableCell>
                  <TableCell sx={tablePageStyles.tableCell}>
                    <Tooltip title={new Date(brand.created_at).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })} arrow>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: SIZES.spacing.xs }}>
                        <CalendarTodayIcon fontSize="small" color="action" />
                        <Typography variant="body2" sx={tablePageStyles.dateText}>
                          {new Date(brand.created_at).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </Typography>
                      </Box>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="right" sx={tablePageStyles.tableCell}>
                    <Box sx={tablePageStyles.actionsContainer}>
                      <Tooltip title="Редактировать">
                        <IconButton 
                          size="small"
                          onClick={() => navigate(`/car-brands/${brand.id}/edit`)}
                          sx={tablePageStyles.actionButton}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Удалить">
                        <IconButton 
                          size="small"
                          onClick={() => handleDeleteClick(brand)}
                          sx={tablePageStyles.dangerButton}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={brand.is_active ? "Деактивировать" : "Активировать"}>
                        <IconButton 
                          size="small"
                          onClick={() => handleToggleActive(brand.id, brand.is_active)}
                          sx={{
                            ...tablePageStyles.actionButton,
                            color: brand.is_active ? theme.palette.warning.main : theme.palette.success.main,
                          }}
                        >
                          {brand.is_active ? <ToggleOffIcon /> : <ToggleOnIcon />}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Пагинация */}
        {totalItems > PER_PAGE && (
          <Box sx={tablePageStyles.paginationContainer}>
            <Pagination
              count={Math.ceil(totalItems / PER_PAGE)}
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
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: tablePageStyles.dialogPaper
        }}
      >
        <DialogTitle sx={tablePageStyles.dialogTitle}>
          Подтверждение удаления
        </DialogTitle>
        <DialogContent>
          <Typography>
            Вы действительно хотите удалить бренд "{selectedBrand?.name}"?
            Это действие нельзя будет отменить.
          </Typography>
        </DialogContent>
        <DialogActions sx={tablePageStyles.dialogActions}>
          <Button 
            variant="outlined"
            onClick={handleCloseDialog}
          >
            Отмена
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
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
        onClose={handleCloseNotification}
      />
    </Box>
  );
};

export default CarBrandsPage;