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
} from '../../api/carBrands.api';
import { CarBrand } from '../../types/car';
import Notification from '../../components/Notification';
import config from '../../config';

// Импорты UI компонентов
import { 
  Box,
  Button, 
  TextField, 
  Typography 
} from '../../components/ui';
import { Pagination } from '../../components/ui/Pagination';

// Импорт централизованных стилей
import { getTablePageStyles, SIZES } from '../../styles';

const CarBrandsPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  
  // Инициализация централизованных стилей
  const tablePageStyles = getTablePageStyles(theme);
  
  // Функция для формирования URL логотипа
  const getLogoUrl = (logo: string | null): string | undefined => {
    if (!logo) return undefined;
    if (logo.startsWith('http') || logo.startsWith('/storage/')) {
      return logo;
    }
    return `${config.API_URL}${logo}`;
  };
  
  // Состояние для поиска, фильтрации и пагинации
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('');
  const [page, setPage] = useState(0);
  const rowsPerPage = 25;
  
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
    per_page: rowsPerPage,
  });

  const [deleteBrand] = useDeleteCarBrandMutation();
  const [toggleActive] = useToggleCarBrandActiveMutation();

  // Обработчики событий
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setPage(0);
  };

  const handleActiveFilterChange = (event: any) => {
    setActiveFilter(event.target.value);
    setPage(0);
  };

  const handleChangePage = (newPage: number) => {
    setPage(newPage - 1);
  };

  const handleDeleteClick = (brand: CarBrand) => {
    setSelectedBrand({ id: brand.id, name: brand.name });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedBrand) return;
    
    try {
      await deleteBrand(selectedBrand.id.toString()).unwrap();
      setNotification({
        open: true,
        message: 'Бренд успешно удален',
        severity: 'success'
      });
      setDeleteDialogOpen(false);
      setSelectedBrand(null);
    } catch (error: any) {
      let errorMessage = 'Ошибка при удалении бренда';
      
      // Обрабатываем различные форматы ошибок от API
      if (error.data?.error) {
        // Основной формат ошибок с ограничениями
        errorMessage = error.data.error;
      } else if (error.data?.message) {
        // Альтернативный формат
        errorMessage = error.data.message;
      } else if (error.data?.errors) {
        // Ошибки валидации
        errorMessage = Object.values(error.data.errors).join(', ');
      }
      
      setNotification({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedBrand(null);
  };

  const handleToggleActive = async (brand: CarBrand) => {
    try {
      await toggleActive({
        id: brand.id.toString(),
        is_active: !brand.is_active
      }).unwrap();
      setNotification({
        open: true,
        message: `Бренд ${!brand.is_active ? 'активирован' : 'деактивирован'}`,
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

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  // Отображение состояний загрузки и ошибок
  if (isLoading) {
    return (
      <Box sx={tablePageStyles.loadingContainer}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={tablePageStyles.errorContainer}>
        <Alert severity="error">
          Ошибка при загрузке брендов: {error.toString()}
        </Alert>
      </Box>
    );
  }

  const brands = brandsData?.data || [];
  const totalItems = brandsData?.pagination?.total_count || 0;

  return (
    <Box sx={tablePageStyles.pageContainer}>
      {/* Заголовок и кнопка добавления */}
      <Box sx={tablePageStyles.pageHeader}>
        <Typography variant="h4" sx={tablePageStyles.pageTitle}>
          Бренды автомобилей
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/car-brands/new')}
          sx={tablePageStyles.createButton}
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
      <Box>
        <TableContainer sx={tablePageStyles.tableContainer}>
          <Table>
            <TableHead sx={tablePageStyles.tableHeader}>
              <TableRow>
                <TableCell>Бренд</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FormatListNumberedIcon fontSize="small" />
                    Кол-во моделей
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarTodayIcon fontSize="small" />
                    Дата создания
                  </Box>
                </TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {brands.map((brand: CarBrand) => (
                <TableRow key={brand.id} sx={tablePageStyles.tableRow}>
                  <TableCell>
                    <Box sx={tablePageStyles.avatarContainer}>
                      {brand.logo ? (
                        <Avatar 
                          src={getLogoUrl(brand.logo)} 
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
                      <Typography variant="body1" fontWeight="medium">
                        {brand.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={brand.is_active ? 'Активен' : 'Неактивен'}
                      color={brand.is_active ? 'success' : 'default'}
                      size="small"
                      sx={tablePageStyles.statusChip}
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Количество моделей">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: SIZES.spacing.xs }}>
                        <FormatListNumberedIcon fontSize="small" />
                        <Typography variant="body2">
                          {brand.models_count !== undefined ? brand.models_count : 'Н/Д'}
                        </Typography>
                      </Box>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Tooltip title={new Date(brand.created_at).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })} arrow>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: SIZES.spacing.xs }}>
                        <CalendarTodayIcon fontSize="small" color="action" />
                        <Typography variant="body2" sx={tablePageStyles.dateText}>
                          {new Date(brand.created_at).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </Typography>
                      </Box>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="right">
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
                      <Tooltip title={brand.is_active ? 'Деактивировать' : 'Активировать'}>
                        <IconButton 
                          size="small"
                          onClick={() => handleToggleActive(brand)}
                          color={brand.is_active ? 'success' : 'default'}
                          sx={tablePageStyles.actionButton}
                        >
                          {brand.is_active ? <ToggleOnIcon /> : <ToggleOffIcon />}
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
        {totalItems > rowsPerPage && (
          <Box sx={tablePageStyles.paginationContainer}>
            <Pagination
              count={Math.ceil(totalItems / rowsPerPage)}
              page={page + 1}
              onChange={handleChangePage}
              disabled={isLoading}
            />
          </Box>
        )}
      </Box>

      {/* Диалог подтверждения удаления */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Подтвердите удаление
        </DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить бренд "{selectedBrand?.name}"?
            Это действие нельзя отменить.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ gap: 1, p: 2 }}>
          <Button 
            onClick={handleDeleteCancel}
            variant="outlined"
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