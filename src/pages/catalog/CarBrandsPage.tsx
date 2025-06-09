import React, { useState } from 'react';
import {
  Box,
  Typography,
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
  Avatar,
  FormControl,
  InputLabel,
  MenuItem,
  useTheme,
  SelectChangeEvent,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DirectionsCar as CarIcon,
  CalendarToday as CalendarTodayIcon,
  FormatListNumbered as FormatListNumberedIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { 
  useGetCarBrandsQuery, 
  useDeleteCarBrandMutation,
  useToggleCarBrandActiveMutation 
} from '../../api';
import { CarBrand } from '../../types/car';
import { 
  SIZES,
  getCardStyles,
  getButtonStyles,
  getTextFieldStyles,
  getTableStyles,
} from '../../styles';

// Импорты UI компонентов
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/TextField';
import { Modal } from '../../components/ui/Modal';
import { Alert } from '../../components/ui/Alert';
import { Select } from '../../components/ui/Select';
import { Switch } from '../../components/ui/Switch';
import { Pagination } from '../../components/ui/Pagination';
import { Snackbar } from '../../components/ui/Snackbar';

interface CarBrandsState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
}

const CarBrandsPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  
  // Получаем централизованные стили
  const cardStyles = getCardStyles(theme);
  const buttonStyles = getButtonStyles(theme, 'primary');
  const textFieldStyles = getTextFieldStyles(theme);
  const tableStyles = getTableStyles(theme);
  
  // Состояния
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<{ id: number; name: string } | null>(null);
  const [notification, setNotification] = useState<CarBrandsState>({
    open: false,
    message: '',
    severity: 'info'
  });

  // RTK Query хуки
  const { 
    data: brandsData, 
    isLoading, 
    error: queryError 
  } = useGetCarBrandsQuery({
    query: search || undefined,
    is_active: activeFilter !== '' ? activeFilter === 'true' : undefined,
    page: page,
    per_page: rowsPerPage,
  });

  const [deleteBrand] = useDeleteCarBrandMutation();
  const [toggleActive] = useToggleCarBrandActiveMutation();

  // Обработчики событий
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const handleActiveFilterChange = (value: string | number) => {
    setActiveFilter(value as string);
    setPage(1);
  };

  const handleChangePage = (newPage: number) => {
    setPage(newPage);
  };

  const handleDeleteClick = (brand: { id: number; name: string }) => {
    setSelectedBrand(brand);
    setDeleteDialogOpen(true);
  };

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

  const handleCloseDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedBrand(null);
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  if (isLoading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="400px" 
        sx={{ p: SIZES.spacing.lg }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (queryError) {
    return (
      <Box sx={{ p: SIZES.spacing.lg }}>
        <Alert 
          severity="error"
        >
          Ошибка при загрузке брендов: {queryError.toString()}
        </Alert>
      </Box>
    );
  }

  const brands = brandsData?.data || [];
  const totalItems = brandsData?.pagination?.total_count || 0;
  const totalPages = brandsData?.pagination?.total_pages || 1;

  return (
    <Box sx={{ p: SIZES.spacing.lg }}>
      {/* Заголовок и кнопка добавления */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: SIZES.spacing.lg 
      }}>
        <Typography variant="h4" sx={{ 
          fontSize: SIZES.fontSize.xl,
          fontWeight: 600
        }}>
          Бренды автомобилей
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/car-brands/new')}
        >
          Добавить бренд
        </Button>
      </Box>

      {/* Фильтры и поиск */}
      <Box sx={{ 
        p: SIZES.spacing.md,
        mb: SIZES.spacing.lg
      }}>
        <Box sx={{ 
          display: 'flex', 
          gap: SIZES.spacing.md, 
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <TextField
            placeholder="Поиск по названию бренда"
            variant="outlined"
            size="small"
            value={search}
            onChange={handleSearchChange}
            sx={{ minWidth: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={activeFilter}
              onChange={handleActiveFilterChange}
              label="Статус"
              displayEmpty
            >
              <MenuItem value="">Все</MenuItem>
              <MenuItem value="true">Активные</MenuItem>
              <MenuItem value="false">Неактивные</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Таблица брендов */}
      <TableContainer sx={{
        backgroundColor: 'transparent',
        boxShadow: 'none',
        border: 'none'
      }}>
        <Table>
          <TableHead sx={tableStyles.tableHead}>
            <TableRow>
              <TableCell>Бренд</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: SIZES.spacing.xs }}>
                  <FormatListNumberedIcon fontSize="small" />
                  Кол-во моделей
                </Box>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: SIZES.spacing.xs }}>
                  <CalendarTodayIcon fontSize="small" />
                  Дата создания
                </Box>
              </TableCell>
              <TableCell align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {brands.map((brand: CarBrand) => (
              <TableRow key={brand.id} hover sx={tableStyles.tableRow}>
                <TableCell sx={tableStyles.tableCell}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: SIZES.spacing.md }}>
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
                    <Typography sx={{ fontSize: SIZES.fontSize.md }}>{brand.name}</Typography>
                  </Box>
                </TableCell>
                <TableCell sx={tableStyles.tableCell}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Switch
                      checked={brand.is_active}
                      onChange={() => handleToggleActive(brand.id, brand.is_active)}
                    />
                    <Typography sx={{ ml: SIZES.spacing.sm }}>
                      {brand.is_active ? 'Активен' : 'Неактивен'}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell sx={tableStyles.tableCell}>
                  <Tooltip title="Количество моделей">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: SIZES.spacing.xs }}>
                      <FormatListNumberedIcon fontSize="small" />
                      <Typography sx={{ fontSize: SIZES.fontSize.md }}>
                        {brand.models_count !== undefined ? brand.models_count : 'Н/Д'}
                      </Typography>
                    </Box>
                  </Tooltip>
                </TableCell>
                <TableCell sx={tableStyles.tableCell}>
                  <Tooltip title={new Date(brand.created_at).toLocaleString('ru-RU', { 
                    day: '2-digit', 
                    month: '2-digit', 
                    year: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })} arrow>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: SIZES.spacing.xs }}>
                      <CalendarTodayIcon fontSize="small" color="action" />
                      <Typography sx={{ fontSize: SIZES.fontSize.md }}>
                        {new Date(brand.created_at).toLocaleDateString('ru-RU', { 
                          day: '2-digit', 
                          month: '2-digit', 
                          year: 'numeric' 
                        })}
                      </Typography>
                    </Box>
                  </Tooltip>
                </TableCell>
                <TableCell align="right" sx={tableStyles.tableCell}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: SIZES.spacing.xs }}>
                    <Tooltip title="Редактировать">
                      <IconButton 
                        size="small"
                        onClick={() => navigate(`/car-brands/${brand.id}/edit`)}
                        sx={{ 
                          color: theme.palette.primary.main,
                          '&:hover': {
                            backgroundColor: `${theme.palette.primary.main}15`
                          }
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Удалить">
                      <IconButton 
                        size="small"
                        onClick={() => handleDeleteClick(brand)}
                        color="error"
                        sx={{
                          '&:hover': {
                            backgroundColor: `${theme.palette.error.main}15`
                          }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        p: SIZES.spacing.md 
      }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={handleChangePage}
          color="primary"
          disabled={totalPages <= 1}
        />
      </Box>

      {/* Модальное окно подтверждения удаления */}
      <Modal 
        open={deleteDialogOpen} 
        onClose={handleCloseDialog}
        title="Подтверждение удаления"
        maxWidth={400}
        actions={
          <>
            <Button 
              onClick={handleCloseDialog} 
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
          </>
        }
      >
        <Typography sx={{ fontSize: SIZES.fontSize.md }}>
          Вы действительно хотите удалить бренд "{selectedBrand?.name}"?
          Это действие нельзя будет отменить.
        </Typography>
      </Modal>

      {/* Уведомления */}
      <Snackbar
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={handleCloseNotification}
        autoHideDuration={6000}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      />
    </Box>
  );
};

export default CarBrandsPage;