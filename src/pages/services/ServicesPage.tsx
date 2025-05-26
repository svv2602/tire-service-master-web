import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchServices, fetchServiceCategories, deleteService } from '../../store/slices/servicesSlice';
import { Service } from '../../types/models';

const ServicesPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { services, serviceCategories, loading, error, totalItems } = useSelector((state: RootState) => state.services);
  
  // Состояние страницы
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<number | ''>('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  
  const loadServices = useCallback(async () => {
    try {
      const params: any = {
        page: page + 1,
        per_page: rowsPerPage,
      };
      
      if (searchQuery) {
        params.query = searchQuery;
      }
      
      if (categoryFilter !== '') {
        params.category_id = categoryFilter;
      }
      
      await dispatch(fetchServices(params));
    } catch (error) {
      console.error('Ошибка при загрузке услуг:', error);
    }
  }, [dispatch, page, rowsPerPage, searchQuery, categoryFilter]);
  
  useEffect(() => {
    dispatch(fetchServiceCategories());
    loadServices();
  }, [dispatch, loadServices]);
  
  // Обработчики событий
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };
  
  const handleCategoryFilterChange = (event: React.ChangeEvent<{ value: unknown }> | any) => {
    setCategoryFilter(event.target.value as number | '');
    setPage(0);
  };
  
  const handleOpenDialog = (service: Service | null = null) => {
    setEditingService(service);
    setOpenDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingService(null);
  };
  
  // Функции CRUD для услуг (заглушка)
  const handleSaveService = () => {
    // Реализация сохранения/обновления услуги через API
    handleCloseDialog();
    loadServices();
  };
  
  const handleDeleteService = (id: number) => {
    // Реализация удаления услуги через API
    if (window.confirm('Вы уверены, что хотите удалить эту услугу?')) {
      console.log('Удаляем услугу:', id);
      dispatch(deleteService(id));
      loadServices();
    }
  };
  
  // Рендер компонента
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Управление услугами
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {/* Фильтры и кнопка добавления */}
      <Box sx={{ display: 'flex', mb: 2, gap: 2, flexWrap: 'wrap' }}>
        <Box sx={{ width: { xs: '100%', md: '300px' } }}>
          <TextField
            fullWidth
            label="Поиск по названию"
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>
        
        <Box sx={{ width: { xs: '100%', md: '300px' } }}>
          <FormControl fullWidth>
            <InputLabel id="category-filter-label">Категория</InputLabel>
            <Select
              labelId="category-filter-label"
              value={categoryFilter}
              onChange={handleCategoryFilterChange}
              label="Категория"
            >
              <MenuItem value="">
                <em>Все категории</em>
              </MenuItem>
              {serviceCategories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        
        <Box sx={{ marginLeft: 'auto' }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Добавить услугу
          </Button>
        </Box>
      </Box>
      
      {/* Таблица услуг */}
      <Paper sx={{ width: '100%', mb: 2 }}>
        <TableContainer>
          <Table aria-label="Таблица услуг">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Название</TableCell>
                <TableCell>Категория</TableCell>
                <TableCell>Длительность (мин)</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : (
                services.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell>{service.id}</TableCell>
                    <TableCell>{service.name}</TableCell>
                    <TableCell>{service.category?.name || 'Нет категории'}</TableCell>
                    <TableCell>{service.default_duration}</TableCell>
                    <TableCell>
                      <Chip
                        label={service.is_active ? 'Активна' : 'Неактивна'}
                        color={service.is_active ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        aria-label="редактировать"
                        onClick={() => handleOpenDialog(service)}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        aria-label="удалить"
                        onClick={() => handleDeleteService(service.id)}
                        size="small"
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
              {!loading && services.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Услуги не найдены
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalItems}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Строк на странице:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} из ${count}`}
        />
      </Paper>
      
      {/* Диалог добавления/редактирования услуги */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingService ? 'Редактирование услуги' : 'Добавление новой услуги'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Название услуги"
              fullWidth
              value={editingService?.name || ''}
              // onChange здесь должен обновлять состояние editingService
            />
            
            <TextField
              label="Описание"
              fullWidth
              multiline
              rows={3}
              value={editingService?.description || ''}
              // onChange здесь должен обновлять состояние editingService
            />
            
            <FormControl fullWidth>
              <InputLabel>Категория</InputLabel>
              <Select
                value={editingService?.category_id || ''}
                label="Категория"
                // onChange здесь должен обновлять состояние editingService
              >
                {serviceCategories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              label="Длительность (мин)"
              type="number"
              fullWidth
              value={editingService?.default_duration || 30}
              // onChange здесь должен обновлять состояние editingService
            />
            
            <FormControl fullWidth>
              <InputLabel>Статус</InputLabel>
              <Select
                value={editingService?.is_active ? 1 : 0}
                label="Статус"
                // onChange здесь должен обновлять состояние editingService
              >
                <MenuItem value={1}>Активна</MenuItem>
                <MenuItem value={0}>Неактивна</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          <Button onClick={handleSaveService} variant="contained" color="primary">
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ServicesPage; 