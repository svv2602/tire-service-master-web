import React, { useState } from 'react';
import {
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Map as MapIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon,
  CalendarToday as CalendarTodayIcon,
  LocationCity as LocationCityIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { 
  useGetRegionsQuery, 
  useDeleteRegionMutation,
  useUpdateRegionMutation,
} from '../../api/regions.api';
import { Region } from '../../types/models';
import CitiesList from '../../components/CitiesList';

// Импорты UI компонентов
import {
  Box,
  Typography,
  Button,
  TextField,
  Alert,
  Chip,
  Pagination,
  Card,
} from '../../components/ui';

// Импорт централизованных стилей
import { getTablePageStyles } from '../../styles/components';
import Notification from '../../components/Notification';

const RegionsManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  
  // Инициализация централизованных стилей
  const tablePageStyles = getTablePageStyles(theme);
  
  // Состояние для поиска, фильтрации и пагинации
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  
  // Состояние для диалогов и уведомлений
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<{ id: number; name: string } | null>(null);
  const [expandedRegionId, setExpandedRegionId] = useState<number | null>(null);
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
  const [updateRegion] = useUpdateRegionMutation();

  // Обработчики событий
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setPage(0);
  };

  const handleActiveFilterChange = (event: any) => {
    setActiveFilter(event.target.value);
    setPage(0);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDeleteClick = (region: { id: number; name: string }) => {
    setSelectedRegion(region);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedRegion) {
      try {
        await deleteRegion(selectedRegion.id).unwrap();
        setNotification({
          open: true,
          message: `Регион "${selectedRegion.name}" успешно удален`,
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
        setDeleteDialogOpen(false);
        setSelectedRegion(null);
      }
    }
  };

  const handleToggleActive = async (regionId: number, currentStatus: boolean) => {
    try {
      await updateRegion({
        id: regionId,
        region: { is_active: !currentStatus }
      }).unwrap();
      setNotification({
        open: true,
        message: `Статус региона успешно ${!currentStatus ? 'активирован' : 'деактивирован'}`,
        severity: 'success'
      });
    } catch (error: any) {
      let errorMessage = 'Ошибка при изменении статуса региона';
      if (error.data?.message) {
        errorMessage = error.data.message;
      }
      setNotification({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    }
  };

  const handleExpandRegion = (regionId: number) => {
    setExpandedRegionId(expandedRegionId === regionId ? null : regionId);
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
      <Box sx={tablePageStyles.pageContainer}>
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
        <Typography variant="h4">Управление регионами и городами</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/admin/regions/new')}
        >
          Добавить регион
        </Button>
      </Box>

      {/* Фильтры и поиск */}
      <Card sx={tablePageStyles.searchContainer}>
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
      </Card>

      {/* Таблица регионов */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Регион</TableCell>
                <TableCell>Код</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationCityIcon fontSize="small" />
                    Города
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
              {regions.map((region: Region) => (
                <React.Fragment key={region.id}>
                  <TableRow hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <MapIcon color="action" />
                        <Typography>{region.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {region.code || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        icon={region.is_active ? <CheckIcon /> : <CloseIcon />}
                        label={region.is_active ? 'Активен' : 'Неактивен'}
                        color={region.is_active ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<LocationCityIcon />}
                        onClick={() => handleExpandRegion(region.id)}
                      >
                        {expandedRegionId === region.id ? 'Скрыть' : 'Показать'} города
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Tooltip title={new Date(region.created_at).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })} arrow>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarTodayIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            {new Date(region.created_at).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                          </Typography>
                        </Box>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Редактировать">
                        <IconButton 
                          size="small"
                          onClick={() => navigate(`/admin/regions/${region.id}/edit`)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Удалить">
                        <IconButton 
                          size="small"
                          onClick={() => handleDeleteClick(region)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={region.is_active ? "Деактивировать" : "Активировать"}>
                        <IconButton 
                          size="small"
                          onClick={() => handleToggleActive(region.id, region.is_active)}
                        >
                          {region.is_active ? <ToggleOffIcon /> : <ToggleOnIcon />}
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                  
                  {/* Развернутый список городов */}
                  {expandedRegionId === region.id && (
                    <TableRow>
                      <TableCell colSpan={6} sx={{ p: 0 }}>
                        <Box sx={{ bgcolor: 'grey.50', p: 3 }}>
                          <CitiesList regionId={region.id.toString()} />
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={tablePageStyles.paginationContainer}>
          <Pagination
            count={Math.ceil(totalItems / rowsPerPage)}
            page={page + 1}
            onChange={(newPage) => setPage(newPage - 1)}
            disabled={isLoading}
          />
        </Box>
      </Card>

      {/* Диалог подтверждения удаления */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить регион "{selectedRegion?.name}"?
            Все города в этом регионе также будут удалены.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Удалить
          </Button>
        </DialogActions>
      </Dialog>

      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={handleCloseNotification}
      />
    </Box>
  );
};

export default RegionsManagementPage;
