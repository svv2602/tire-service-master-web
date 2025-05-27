import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useGetServicesQuery, useDeleteServiceMutation } from '../../api';
import { Service } from '../../types/service';

const ServicesPage: React.FC = () => {
  // Состояние страницы
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<number | ''>('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  
  // RTK Query хуки
  const { data: servicesResponse, isLoading: isLoadingServices, error: servicesError } = useGetServicesQuery();
  
  // const { data: categoriesData } = useGetServiceCategoriesQuery(); // Временно отключено - API не существует
  const [deleteService] = useDeleteServiceMutation();
  
  // Извлекаем массив услуг из ответа API
  const servicesData = servicesResponse?.data || [];
  const totalServices = servicesResponse?.pagination?.total_count || 0;
  
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
  
  const handleDeleteService = async (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить эту услугу?')) {
      try {
        await deleteService(id).unwrap();
      } catch (error) {
        console.error('Ошибка при удалении услуги:', error);
      }
    }
  };
  
  // Рендер компонента
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Управление услугами
      </Typography>
      
      {servicesError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {servicesError instanceof Error ? servicesError.message : 'Произошла ошибка при загрузке услуг'}
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
        
        {/* Временно отключен фильтр по категориям
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
              {(categoriesData || []).map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        */}
        
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
                <TableCell>Описание</TableCell>
                <TableCell>Длительность (мин)</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoadingServices ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : (servicesData || []).map((service) => (
                <TableRow key={service.id}>
                  <TableCell>{service.id}</TableCell>
                  <TableCell>{service.name}</TableCell>
                  <TableCell>{service.description}</TableCell>
                  <TableCell>{service.default_duration}</TableCell>
                  <TableCell>
                    <Chip
                      label={service.is_active ? 'Активна' : 'Неактивна'}
                      color={service.is_active ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(service)}
                      title="Редактировать"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteService(service.id.toString())}
                      title="Удалить"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalServices}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
      
      {/* Диалог создания/редактирования услуги */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {editingService ? 'Редактирование услуги' : 'Создание новой услуги'}
        </DialogTitle>
        <DialogContent>
          {/* Форма редактирования/создания */}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          <Button variant="contained" onClick={handleCloseDialog}>
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ServicesPage; 