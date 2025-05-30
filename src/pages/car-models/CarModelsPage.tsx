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
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DirectionsCar as CarIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { 
  useGetCarModelsQuery, 
  useDeleteCarModelMutation,
  useToggleCarModelActiveMutation,
  useGetCarBrandsQuery
} from '../../api';
import { CarModel, CarBrand } from '../../types/car';

const CarModelsPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Состояние для поиска, фильтрации и пагинации
  const [search, setSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState<number | ''>('');
  const [activeFilter, setActiveFilter] = useState<string>('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  
  // Состояние для диалогов
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<{ id: number; name: string; brand_id: number } | null>(null);

  // RTK Query хуки
  const { 
    data: modelsData, 
    isLoading, 
    error 
  } = useGetCarModelsQuery({
    query: search || undefined,
    brand_id: brandFilter || undefined,
    is_active: activeFilter !== '' ? activeFilter === "1" : undefined,
    page: page + 1,
    per_page: rowsPerPage,
  });

  const { data: brandsData } = useGetCarBrandsQuery({ is_active: true });

  const [deleteModel] = useDeleteCarModelMutation();
  const [toggleActive] = useToggleCarModelActiveMutation();

  // Обработчики событий
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setPage(0); // Сбрасываем на первую страницу при поиске
  };

  const handleBrandFilterChange = (event: any) => {
    setBrandFilter(event.target.value);
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

  const handleDeleteClick = (model: { id: number; name: string; brand_id: number }) => {
    setSelectedModel(model);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedModel) {
      try {
        await deleteModel(selectedModel.id.toString()).unwrap();
        setDeleteDialogOpen(false);
        setSelectedModel(null);
      } catch (error) {
        console.error('Ошибка при удалении модели:', error);
      }
    }
  };

  const handleCloseDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedModel(null);
  };

  const handleToggleActive = async (id: number, currentActive: boolean) => {
    try {
      await toggleActive({ id: id.toString(), is_active: !currentActive }).unwrap();
    } catch (error) {
      console.error('Ошибка при изменении статуса активности:', error);
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
          Ошибка при загрузке моделей: {error.toString()}
        </Alert>
      </Box>
    );
  }

  const models = modelsData?.data || [];
  const totalItems = modelsData?.pagination?.total_count || 0;
  const brands = brandsData?.data || [];

  return (
    <Box sx={{ p: 3 }}>
      {/* Заголовок и кнопка добавления */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Модели автомобилей</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/car-models/new')}
        >
          Добавить модель
        </Button>
      </Box>

      {/* Фильтры и поиск */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            placeholder="Поиск по названию модели"
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
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Бренд</InputLabel>
            <Select
              value={brandFilter}
              onChange={handleBrandFilterChange}
              label="Бренд"
            >
              <MenuItem value="">Все бренды</MenuItem>
              {brands.map((brand: CarBrand) => (
                <MenuItem key={brand.id} value={brand.id}>
                  {brand.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Статус</InputLabel>
            <Select
              value={activeFilter}
              onChange={handleActiveFilterChange}
              label="Статус"
            >
              <MenuItem value="">Все</MenuItem>
              <MenuItem value="1">Активные</MenuItem>
              <MenuItem value="0">Неактивные</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Таблица моделей */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Модель</TableCell>
                <TableCell>Бренд</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell>Дата создания</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {models.map((model: CarModel) => (
                <TableRow key={model.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CarIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="subtitle1" fontWeight="medium">
                        {model.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2">
                      {model.brand?.name}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Chip 
                      label={model.is_active ? 'Активная' : 'Неактивная'}
                      color={model.is_active ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>

                  <TableCell>
                    {new Date(model.created_at).toLocaleDateString()}
                  </TableCell>

                  <TableCell align="right">
                    <Tooltip title="Редактировать">
                      <IconButton onClick={() => navigate(`/car-models/${model.id}/edit`)} size="small">
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Удалить">
                      <IconButton
                        onClick={() => handleDeleteClick(model)}
                        size="small"
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
        </TableContainer>
      </Paper>

      {/* Диалог подтверждения удаления */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <Typography>
            Вы действительно хотите удалить модель "{selectedModel?.name}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CarModelsPage; 