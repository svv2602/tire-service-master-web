import React, { useState, useMemo, useCallback } from 'react';
import {
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
  LocationOn as LocationOnIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon,
  CalendarToday as CalendarTodayIcon,
  LocationCity as LocationCityIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
  useGetRegionsQuery,
  useDeleteRegionMutation,
  useUpdateRegionMutation,
} from '../../api/regions.api';
import { Region } from '../../types/models';
import Notification from '../../components/Notification';

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
import { getTablePageStyles } from '../../styles/components';

const RegionsPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  
  // Инициализация централизованных стилей
  const tablePageStyles = getTablePageStyles(theme);
  
  // Состояние для поиска, фильтрации и пагинации
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('');
  const [page, setPage] = useState(0);
  const rowsPerPage = 25;
  
  // Состояние для диалогов и уведомлений
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<{ id: number; name: string } | null>(null);
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
    data: regionsData, 
    isLoading, 
    error 
  } = useGetRegionsQuery({
    search: search || undefined,
    is_active: activeFilter !== '' ? activeFilter === 'true' : undefined,
    page: page + 1,
    per_page: rowsPerPage,
  });

  const [deleteRegion] = useDeleteRegionMutation();
  const [toggleActive] = useUpdateRegionMutation();

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

  const handleDeleteClick = useCallback((region: Region) => {
    setSelectedRegion({ id: region.id, name: region.name });
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedRegion) return;
    
    try {
      await deleteRegion(selectedRegion.id).unwrap();
      setNotification({
        open: true,
        message: 'Регион успешно удален',
        severity: 'success'
      });
      setDeleteDialogOpen(false);
      setSelectedRegion(null);
    } catch (error: any) {
      let errorMessage = 'Ошибка при удалении региона';
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
  }, [selectedRegion, deleteRegion]);

  const handleToggleActive = useCallback(async (region: Region) => {
    try {
      await toggleActive({
        id: region.id,
        region: { ...region, is_active: !region.is_active }
      }).unwrap();
      setNotification({
        open: true,
        message: `Регион ${!region.is_active ? 'активирован' : 'деактивирован'}`,
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
  }, [toggleActive]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteDialogOpen(false);
    setSelectedRegion(null);
  }, []);

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  // Определение колонок для UI Table
  const columns: Column[] = useMemo(() => [
    {
      id: 'region',
      label: 'Регион',
      minWidth: 200,
      wrap: true,
      format: (value: any, row: any) => {
        const region = row as Region;
        return (
          <Box sx={tablePageStyles.avatarContainer}>
            <LocationOnIcon color="action" />
            <Typography>{region.name}</Typography>
          </Box>
        );
      },
    },
    {
      id: 'code',
      label: 'Код',
      minWidth: 100,
      format: (value: any, row: any) => {
        const region = row as Region;
        return (
          <Chip 
            label={region.code}
            variant="outlined"
            size="small"
          />
        );
      },
    },
    {
      id: 'status',
      label: 'Статус',
      minWidth: 120,
      align: 'center' as const,
      format: (value: any, row: any) => {
        const region = row as Region;
        return (
          <Chip 
            label={region.is_active ? 'Активен' : 'Неактивен'}
            color={region.is_active ? 'success' : 'default'}
            size="small"
          />
        );
      },
    },
    {
      id: 'cities_count',
      label: 'Кол-во городов',
      minWidth: 140,
      format: (value: any, row: any) => {
        const region = row as Region;
        return (
          <Tooltip title="Количество городов">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationCityIcon fontSize="small" />
              <Typography>
                {region.cities_count !== undefined ? region.cities_count : 'Н/Д'}
              </Typography>
            </Box>
          </Tooltip>
        );
      },
    },
    {
      id: 'created_at',
      label: 'Дата создания',
      minWidth: 140,
      format: (value: any, row: any) => {
        const region = row as Region;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarTodayIcon fontSize="small" color="action" />
            <Typography sx={{ color: theme.palette.text.secondary }}>
              {new Date(region.created_at).toLocaleDateString('ru-RU')}
            </Typography>
          </Box>
        );
      },
    },
    {
      id: 'actions',
      label: 'Действия',
      minWidth: 150,
      align: 'right' as const,
      format: (value: any, row: any) => {
        const region = row as Region;
        return (
          <Box sx={tablePageStyles.actionsContainer}>
            <Tooltip title={region.is_active ? 'Деактивировать' : 'Активировать'}>
              <IconButton
                size="small"
                onClick={() => handleToggleActive(region)}
                color={region.is_active ? 'success' : 'default'}
                sx={tablePageStyles.actionButton}
              >
                {region.is_active ? <ToggleOnIcon /> : <ToggleOffIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Редактировать">
              <IconButton
                size="small"
                onClick={() => navigate(`/regions/${region.id}/edit`)}
                sx={tablePageStyles.actionButton}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Удалить">
              <IconButton
                size="small"
                onClick={() => handleDeleteClick(region)}
                color="error"
                sx={tablePageStyles.actionButton}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
  ], [tablePageStyles, theme.palette.text.secondary, handleToggleActive, navigate, handleDeleteClick]);

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
          Ошибка при загрузке регионов: {error.toString()}
        </Alert>
      </Box>
    );
  }

  const regions = regionsData?.data || [];
  const totalItems = regionsData?.pagination?.total_count || 0;

  return (
    <Box sx={tablePageStyles.pageContainer}>
      {/* Заголовок и кнопка добавления */}
      <Box sx={tablePageStyles.pageHeader}>
        <Typography variant="h4" sx={tablePageStyles.pageTitle}>
          Регионы
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/regions/new')}
          sx={tablePageStyles.createButton}
        >
          Добавить регион
        </Button>
      </Box>

      {/* Фильтры и поиск */}
      <Box sx={tablePageStyles.filtersContainer}>
        <TextField
          placeholder="Поиск по названию региона"
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

      {/* Таблица регионов с UI Table компонентом */}
      <Box sx={tablePageStyles.tableContainer}>
        <Table 
          columns={columns}
          rows={regions}
        />
        
        {/* Пагинация */}
        <Box sx={tablePageStyles.paginationContainer}>
          <Pagination
            count={Math.ceil(totalItems / rowsPerPage)}
            page={page + 1}
            onChange={handleChangePage}
            color="primary"
            disabled={totalItems <= rowsPerPage}
          />
        </Box>
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
            Вы уверены, что хотите удалить регион "{selectedRegion?.name}"?
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

export default RegionsPage;