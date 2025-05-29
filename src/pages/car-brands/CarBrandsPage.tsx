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
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon,
  DirectionsCar as CarIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { 
  useGetCarBrandsQuery, 
  useCreateCarBrandMutation,
  useUpdateCarBrandMutation,
  useDeleteCarBrandMutation,
  useToggleCarBrandActiveMutation,
  useToggleCarBrandPopularMutation
} from '../../api';
import { CarBrand } from '../../types/car';

const CarBrandsPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Состояние для поиска, фильтрации и пагинации
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('');
  const [popularFilter, setPopularFilter] = useState<string>('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  
  // Состояние для диалогов
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<{ id: number; name: string } | null>(null);

  // RTK Query хуки
  const { 
    data: brandsData, 
    isLoading, 
    error 
  } = useGetCarBrandsQuery({
    query: search || undefined,
    is_active: activeFilter !== '' ? activeFilter === 'true' : undefined,
    is_popular: popularFilter !== '' ? popularFilter === 'true' : undefined,
    page: page + 1, // API использует 1-based пагинацию
    per_page: rowsPerPage,
  });

  const [deleteBrand, { isLoading: deleteLoading }] = useDeleteCarBrandMutation();
  const [toggleActive, { isLoading: toggleActiveLoading }] = useToggleCarBrandActiveMutation();
  const [togglePopular, { isLoading: togglePopularLoading }] = useToggleCarBrandPopularMutation();

  // Обработчики событий
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setPage(0); // Сбрасываем на первую страницу при поиске
  };

  const handleActiveFilterChange = (event: any) => {
    setActiveFilter(event.target.value);
    setPage(0);
  };

  const handlePopularFilterChange = (event: any) => {
    setPopularFilter(event.target.value);
    setPage(0);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
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
        setDeleteDialogOpen(false);
        setSelectedBrand(null);
      } catch (error) {
        console.error('Ошибка при удалении бренда:', error);
      }
    }
  };

  const handleCloseDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedBrand(null);
  };

  const handleToggleActive = async (id: number, currentActive: boolean) => {
    try {
      await toggleActive({ id: id.toString(), is_active: !currentActive }).unwrap();
    } catch (error) {
      console.error('Ошибка при изменении статуса активности:', error);
    }
  };

  const handleTogglePopular = async (id: number, currentPopular: boolean) => {
    try {
      await togglePopular({ id: id.toString(), is_popular: !currentPopular }).unwrap();
    } catch (error) {
      console.error('Ошибка при изменении статуса популярности:', error);
    }
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
          Ошибка при загрузке брендов: {error.toString()}
        </Alert>
      </Box>
    );
  }

  const brands = brandsData?.data || [];
  const totalItems = brandsData?.pagination?.total_count || 0;

  return (
    <Box sx={{ p: 3 }}>
      {/* Заголовок и кнопка добавления */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Бренды автомобилей</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/car-brands/new')}
        >
          Добавить бренд
        </Button>
      </Box>

      {/* Фильтры и поиск */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
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

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Популярность</InputLabel>
            <Select
              value={popularFilter}
              onChange={handlePopularFilterChange}
              label="Популярность"
            >
              <MenuItem value="">Все</MenuItem>
              <MenuItem value="true">Популярные</MenuItem>
              <MenuItem value="false">Обычные</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Таблица брендов */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Бренд</TableCell>
                <TableCell>Код</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell>Популярность</TableCell>
                <TableCell>Дата создания</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {brands.map((brand: CarBrand) => (
                <TableRow key={brand.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {brand.logo_url ? (
                        <Avatar 
                          src={brand.logo_url} 
                          sx={{ mr: 2, width: 40, height: 40 }}
                          alt={brand.name}
                        />
                      ) : (
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main', width: 40, height: 40 }}>
                          <CarIcon />
                        </Avatar>
                      )}
                      <Box>
                        <Typography variant="subtitle1" fontWeight="medium">
                          {brand.name}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {brand.code || 'Не указан'}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={brand.is_active ? 'Активен' : 'Неактивен'}
                        color={brand.is_active ? 'success' : 'default'}
                        size="small"
                      />
                      <Tooltip title={brand.is_active ? 'Деактивировать' : 'Активировать'}>
                        <IconButton
                          size="small"
                          onClick={() => handleToggleActive(brand.id, brand.is_active)}
                          disabled={toggleActiveLoading}
                        >
                          {brand.is_active ? <ToggleOnIcon color="success" /> : <ToggleOffIcon />}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={brand.is_popular ? 'Популярный' : 'Обычный'}
                        color={brand.is_popular ? 'warning' : 'default'}
                        size="small"
                        icon={brand.is_popular ? <StarIcon /> : <StarBorderIcon />}
                      />
                      <Tooltip title={brand.is_popular ? 'Убрать из популярных' : 'Добавить в популярные'}>
                        <IconButton
                          size="small"
                          onClick={() => handleTogglePopular(brand.id, brand.is_popular)}
                          disabled={togglePopularLoading}
                        >
                          {brand.is_popular ? <StarIcon color="warning" /> : <StarBorderIcon />}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2">
                      {brand.created_at 
                        ? new Date(brand.created_at).toLocaleDateString('ru-RU')
                        : 'Не указана'
                      }
                    </Typography>
                  </TableCell>
                  
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Редактировать">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/car-brands/${brand.id}/edit`)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Удалить">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteClick({
                            id: brand.id,
                            name: brand.name
                          })}
                          disabled={deleteLoading}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              
              {brands.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      {search || activeFilter !== '' || popularFilter !== '' ? 'Бренды не найдены' : 'Нет брендов'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Пагинация */}
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
        />
      </Paper>

      {/* Диалог подтверждения удаления */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить бренд "{selectedBrand?.name}"?
            Это действие нельзя отменить и может повлиять на связанные модели автомобилей.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            disabled={deleteLoading}
          >
            {deleteLoading ? 'Удаление...' : 'Удалить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CarBrandsPage; 