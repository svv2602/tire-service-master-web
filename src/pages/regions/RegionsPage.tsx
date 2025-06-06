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
import { SIZES } from '../../styles/theme';
import { 
  getCardStyles, 
  getButtonStyles, 
  getTextFieldStyles, 
  getTableStyles, 
  getChipStyles 
} from '../../styles/components';

const RegionsPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Получение темы и централизованных стилей
  const theme = useTheme();
  const cardStyles = getCardStyles(theme);
  const buttonStyles = getButtonStyles(theme, 'primary');
  const textFieldStyles = getTextFieldStyles(theme);
  const tableStyles = getTableStyles(theme);
  const chipStyles = getChipStyles(theme);
  
  // Состояние для поиска, фильтрации и пагинации
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  
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

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDeleteClick = (region: Region) => {
    setSelectedRegion({ id: region.id, name: region.name });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
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
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedRegion(null);
  };

  const handleToggleActive = async (region: Region) => {
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
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  // Отображение состояний загрузки и ошибок
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Ошибка при загрузке регионов: {error.toString()}
        </Alert>
      </Box>
    );
  }

  const regions = regionsData?.data || [];
  const totalItems = regionsData?.pagination?.total_count || 0;

  return (
    <Box sx={{ p: SIZES.spacing.lg }}>
      {/* Заголовок и кнопка добавления */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: SIZES.spacing.lg 
      }}>
        <Typography variant="h4" sx={{ fontSize: SIZES.fontSize.xl, fontWeight: 600 }}>
          Регионы
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/regions/new')}
          sx={buttonStyles}
        >
          Добавить регион
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
            placeholder="Поиск по названию региона"
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

      {/* Таблица регионов */}
      <Paper sx={cardStyles}>
        <TableContainer sx={tableStyles.tableContainer}>
          <Table>
            <TableHead sx={tableStyles.tableHead}>
              <TableRow>
                <TableCell>Регион</TableCell>
                <TableCell>Код</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: SIZES.spacing.xs }}>
                    <LocationCityIcon fontSize="small" />
                    Кол-во городов
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
              {regions.map((region: Region) => (
                <TableRow key={region.id} hover sx={tableStyles.tableRow}>
                  <TableCell sx={tableStyles.tableCell}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: SIZES.spacing.md }}>
                      <LocationOnIcon color="action" />
                      <Typography sx={{ fontSize: SIZES.fontSize.md }}>{region.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={tableStyles.tableCell}>
                    <Chip 
                      label={region.code}
                      variant="outlined"
                      size="small"
                      sx={chipStyles}
                    />
                  </TableCell>
                  <TableCell sx={tableStyles.tableCell}>
                    <Chip 
                      label={region.is_active ? 'Активен' : 'Неактивен'}
                      color={region.is_active ? 'success' : 'default'}
                      size="small"
                      sx={chipStyles}
                    />
                  </TableCell>
                  <TableCell sx={tableStyles.tableCell}>
                    <Tooltip title="Количество городов">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: SIZES.spacing.xs }}>
                        <LocationCityIcon fontSize="small" />
                        <Typography sx={{ fontSize: SIZES.fontSize.md }}>
                          {region.cities_count !== undefined ? region.cities_count : 'Н/Д'}
                        </Typography>
                      </Box>
                    </Tooltip>
                  </TableCell>
                  <TableCell sx={tableStyles.tableCell}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: SIZES.spacing.xs }}>
                      <CalendarTodayIcon fontSize="small" color="action" />
                      <Typography sx={{ fontSize: SIZES.fontSize.md, color: theme.palette.text.secondary }}>
                        {new Date(region.created_at).toLocaleDateString('ru-RU')}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right" sx={tableStyles.tableCell}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: SIZES.spacing.xs }}>
                      <Tooltip title={region.is_active ? 'Деактивировать' : 'Активировать'}>
                        <IconButton
                          size="small"
                          onClick={() => handleToggleActive(region)}
                          color={region.is_active ? 'success' : 'default'}
                          sx={{
                            '&:hover': {
                              backgroundColor: region.is_active 
                                ? `${theme.palette.action.hover}`
                                : `${theme.palette.success.main}15`
                            }
                          }}
                        >
                          {region.is_active ? <ToggleOnIcon /> : <ToggleOffIcon />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Редактировать">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/regions/${region.id}/edit`)}
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
                          onClick={() => handleDeleteClick(region)}
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
        
        {/* Пагинация */}
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={totalItems}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
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
        onClose={handleDeleteCancel}
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
          Подтвердите удаление
        </DialogTitle>
        <DialogContent sx={{ pb: SIZES.spacing.md }}>
          <Typography sx={{ fontSize: SIZES.fontSize.md }}>
            Вы уверены, что хотите удалить регион "{selectedRegion?.name}"?
            Это действие нельзя отменить.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ 
          p: SIZES.spacing.md, 
          gap: SIZES.spacing.sm 
        }}>
          <Button 
            onClick={handleDeleteCancel}
            sx={{
              ...buttonStyles,
              variant: 'outlined',
              borderRadius: SIZES.borderRadius.sm
            }}
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

export default RegionsPage;