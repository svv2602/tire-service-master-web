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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TablePagination,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  useTheme,
  Alert,
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
import Notification from '../../components/Notification';
import { 
  SIZES,
  getCardStyles,
  getButtonStyles,
  getTextFieldStyles,
  getTableStyles,
} from '../../styles';

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
  const [page, setPage] = useState(0);
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

  const handleActiveFilterChange = (event: SelectChangeEvent<string>) => {
    setActiveFilter(event.target.value);
    setPage(0);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
          sx={{
            borderRadius: SIZES.borderRadius.sm,
            fontSize: SIZES.fontSize.md
          }}
        >
          Ошибка при загрузке брендов: {queryError.toString()}
        </Alert>
      </Box>
    );
  }

  const brands = brandsData?.data || [];
  const totalItems = brandsData?.pagination?.total_count || 0;

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
          sx={buttonStyles}
        >
          Добавить бренд
        </Button>
      </Box>

      {/* Фильтры и поиск */}
      <Paper sx={{ 
        ...cardStyles,
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
            sx={{ 
              ...textFieldStyles, 
              minWidth: 300 
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Статус</InputLabel>
            <Select
              value={activeFilter}
              onChange={handleActiveFilterChange}
              label="Статус"
              sx={textFieldStyles}
            >
              <MenuItem value="">Все</MenuItem>
              <MenuItem value="true">Активные</MenuItem>
              <MenuItem value="false">Неактивные</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Таблица брендов */}
      <Paper sx={cardStyles}>
        <TableContainer sx={tableStyles.tableContainer}>
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
                        color={brand.is_active ? 'success' : 'default'}
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
        <TablePagination
          component="div"
          count={totalItems}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[10, 25, 50, 100]}
          labelRowsPerPage="Строк на странице:"
          labelDisplayedRows={({ from, to, count }) => 
            `${from}-${to} из ${count !== -1 ? count : `более чем ${to}`}`
          }
          sx={{
            borderTop: `1px solid ${theme.palette.divider}`,
            '& .MuiTablePagination-select': {
              fontSize: SIZES.fontSize.sm
            },
            '& .MuiTablePagination-displayedRows': {
              fontSize: SIZES.fontSize.sm
            }
          }}
        />
      </Paper>

      {/* Диалог подтверждения удаления */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={handleCloseDialog}
        PaperProps={{
          sx: {
            ...cardStyles,
            borderRadius: SIZES.borderRadius.md,
            minWidth: 400
          }
        }}
      >
        <DialogTitle sx={{ 
          fontSize: SIZES.fontSize.lg, 
          fontWeight: 600,
          pb: SIZES.spacing.sm
        }}>
          Подтверждение удаления
        </DialogTitle>
        <DialogContent sx={{ pb: SIZES.spacing.md }}>
          <Typography sx={{ fontSize: SIZES.fontSize.md }}>
            Вы действительно хотите удалить бренд "{selectedBrand?.name}"?
            Это действие нельзя будет отменить.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ 
          p: SIZES.spacing.lg, 
          gap: SIZES.spacing.sm 
        }}>
          <Button 
            onClick={handleCloseDialog} 
            variant="outlined"
            sx={buttonStyles}
          >
            Отмена
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            sx={{
              borderRadius: SIZES.borderRadius.sm,
              '&:hover': {
                backgroundColor: theme.palette.error.dark
              }
            }}
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