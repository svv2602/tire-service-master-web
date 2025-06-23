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

import React, { useState, useCallback, useMemo } from 'react';
import {
  InputAdornment,
  CircularProgress,
  IconButton,
  Tooltip,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  Typography,
  Table,
  type Column
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

  // Мемоизированные обработчики событий
  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setPage(0);
  }, []);

  const handleActiveFilterChange = useCallback((event: any) => {
    setActiveFilter(event.target.value);
    setPage(0);
  }, []);

  const handleChangePage = useCallback((newPage: number) => {
    setPage(newPage - 1);
  }, []);

  const handleDeleteClick = useCallback((brand: CarBrand) => {
    setSelectedBrand({ id: brand.id, name: brand.name });
    setDeleteDialogOpen(true);
  }, []);

  const handleEditClick = useCallback((brandId: number) => {
    navigate(`/admin/car-brands/${brandId}/edit`);
  }, [navigate]);

  const handleToggleActive = useCallback(async (brand: CarBrand) => {
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
    } catch (error) {
      setNotification({
        open: true,
        message: 'Ошибка при изменении статуса бренда',
        severity: 'error'
      });
    }
  }, [toggleActive]);

  const handleDeleteConfirm = useCallback(async () => {
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
      
      if (error.data?.error) {
        errorMessage = error.data.error;
      } else if (error.data?.message) {
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
  }, [selectedBrand, deleteBrand]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteDialogOpen(false);
    setSelectedBrand(null);
  }, []);

  const handleCloseNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, open: false }));
  }, []);

  // Конфигурация колонок таблицы
  const columns: Column[] = useMemo(() => [
    {
      id: 'brand',
      label: 'Бренд',
      wrap: true,
      format: (value, row: CarBrand) => (
        <Box sx={tablePageStyles.avatarContainer}>
          {row.logo ? (
            <Avatar 
              src={getLogoUrl(row.logo)} 
              alt={row.name}
              variant="rounded"
              sx={{ 
                width: SIZES.icon.medium * 1.5, 
                height: SIZES.icon.medium * 1.5,
                borderRadius: SIZES.borderRadius.xs
              }}
            />
          ) : (
            <Avatar
              variant="rounded"
              sx={{ 
                width: SIZES.icon.medium * 1.5, 
                height: SIZES.icon.medium * 1.5,
                borderRadius: SIZES.borderRadius.xs,
                bgcolor: 'grey.200'
              }}
            >
              <CarIcon color="disabled" />
            </Avatar>
          )}
          <Typography variant="body2" fontWeight="medium">
            {row.name}
          </Typography>
        </Box>
      )
    },
    {
      id: 'is_active',
      label: 'Статус',
      align: 'center',
      format: (value, row: CarBrand) => (
        <Tooltip title={`Нажмите чтобы ${row.is_active ? 'деактивировать' : 'активировать'}`}>
          <IconButton
            onClick={() => handleToggleActive(row)}
            color={row.is_active ? 'success' : 'default'}
            size="small"
          >
            {row.is_active ? <ToggleOnIcon /> : <ToggleOffIcon />}
          </IconButton>
        </Tooltip>
      )
    },
    {
      id: 'models_count',
      label: 'Кол-во моделей',
      align: 'center',
      format: (value, row: CarBrand) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
          <FormatListNumberedIcon fontSize="small" color="action" />
          <Typography variant="body2">
            {row.models_count || 0}
          </Typography>
        </Box>
      )
    },
    {
      id: 'created_at',
      label: 'Дата создания',
      align: 'center',
      format: (value, row: CarBrand) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
          <CalendarTodayIcon fontSize="small" color="action" />
          <Typography variant="body2">
            {new Date(row.created_at).toLocaleDateString('ru-RU')}
          </Typography>
        </Box>
      )
    },
    {
      id: 'actions',
      label: 'Действия',
      align: 'right',
      format: (value, row: CarBrand) => (
        <Box sx={tablePageStyles.actionsContainer}>
          <Tooltip title="Редактировать">
            <IconButton
              onClick={() => handleEditClick(row.id)}
              size="small"
              sx={tablePageStyles.actionButton}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Удалить">
            <IconButton
              onClick={() => handleDeleteClick(row)}
              size="small"
              color="error"
              sx={tablePageStyles.actionButton}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ], [tablePageStyles, getLogoUrl, handleToggleActive, handleEditClick, handleDeleteClick]);

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
          ❌ Ошибка при загрузке брендов: {error.toString()}
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
          onClick={() => navigate('/admin/car-brands/new')}
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
      <Box sx={tablePageStyles.tableContainer}>
        <Table
          columns={columns}
          rows={brands}
        />
        
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