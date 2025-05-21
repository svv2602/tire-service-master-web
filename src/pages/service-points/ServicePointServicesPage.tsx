import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  CircularProgress,
  Divider,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchWithAuth } from '../../api/apiUtils';
import { Service, ServiceCategory } from '../../types';

interface ServicePointService {
  id: number;
  name: string;
  description?: string;
  price: number;
  default_duration: number;
  category_id: number;
  category?: ServiceCategory;
  current_price_for_service_point?: number;
}

interface ApiResponse<T> {
  data: T[];
  pagination?: {
    total_count: number;
    total_pages: number;
    current_page: number;
    per_page: number;
  };
}

const ServicePointServicesPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [servicePoint, setServicePoint] = useState<any>(null);
  const [services, setServices] = useState<ServicePointService[]>([]);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<ServicePointService | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<number | ''>('');
  
  // Загрузка данных сервисной точки
  const fetchServicePoint = async () => {
    try {
      const response = await fetchWithAuth(`/api/v1/service_points/${id}`);
      if (!response.ok) {
        throw new Error('Не удалось загрузить данные точки обслуживания');
      }
      const data = await response.json();
      setServicePoint(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    }
  };
  
  // Загрузка услуг, связанных с точкой обслуживания
  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth(`/api/v1/service_points/${id}/services`);
      if (!response.ok) {
        throw new Error('Не удалось загрузить услуги');
      }
      const data = await response.json();
      setServices(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setLoading(false);
    }
  };
  
  // Загрузка всех доступных услуг для добавления
  const fetchAllServices = async () => {
    try {
      const response = await fetchWithAuth('/api/v1/services');
      if (!response.ok) {
        throw new Error('Не удалось загрузить список услуг');
      }
      const data = await response.json();
      setAllServices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Ошибка при загрузке списка услуг:', err);
    }
  };
  
  // Загрузка категорий услуг
  const fetchCategories = async () => {
    try {
      const response = await fetchWithAuth('/api/v1/service_categories');
      if (!response.ok) {
        throw new Error('Не удалось загрузить категории услуг');
      }
      const data = await response.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Ошибка при загрузке категорий услуг:', err);
    }
  };
  
  useEffect(() => {
    fetchServicePoint();
    fetchServices();
    fetchAllServices();
    fetchCategories();
  }, [id]);
  
  // Добавление услуги
  const handleAddService = async () => {
    if (!selectedService) return;
    
    try {
      const response = await fetchWithAuth(`/api/v1/service_points/${id}/services`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ service_id: selectedService }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Не удалось добавить услугу');
      }
      
      // После успешного добавления обновляем список услуг
      fetchServices();
      setAddDialogOpen(false);
      setSelectedService(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    }
  };
  
  // Удаление услуги
  const handleDeleteService = async () => {
    if (!serviceToDelete) return;
    
    try {
      const response = await fetchWithAuth(`/api/v1/service_points/${id}/services/${serviceToDelete.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Не удалось удалить услугу');
      }
      
      // После успешного удаления обновляем список услуг
      fetchServices();
      setDeleteDialogOpen(false);
      setServiceToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    }
  };
  
  // Фильтрация услуг
  const getFilteredServices = () => {
    let filtered = [...services];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(service => 
        service.name.toLowerCase().includes(query) || 
        (service.description && service.description.toLowerCase().includes(query))
      );
    }
    
    if (categoryFilter !== '') {
      filtered = filtered.filter(service => service.category_id === categoryFilter);
    }
    
    return filtered;
  };
  
  // Фильтрация всех услуг для диалога добавления
  const getFilteredAllServices = () => {
    // Получаем ID уже добавленных услуг
    const existingServiceIds = services.map(s => s.id);
    
    // Фильтруем услуги, которые еще не добавлены
    return allServices.filter(service => !existingServiceIds.includes(service.id));
  };
  
  const handleBack = () => {
    navigate(`/service-points/${id}`);
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  const handleCategoryChange = (e: any) => {
    setCategoryFilter(e.target.value);
  };
  
  if (loading && !servicePoint) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  const filteredServices = getFilteredServices();
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Управление услугами
          {servicePoint && <Typography variant="subtitle1" component="span"> – {servicePoint.name}</Typography>}
        </Typography>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={handleBack}
        >
          К точке обслуживания
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Фильтры</Typography>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={() => setAddDialogOpen(true)}
          >
            Добавить услугу
          </Button>
        </Box>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ width: { xs: '100%', md: '48%' } }}>
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
          <Box sx={{ width: { xs: '100%', md: '48%' } }}>
            <FormControl fullWidth>
              <InputLabel id="category-select-label">Категория</InputLabel>
              <Select
                labelId="category-select-label"
                value={categoryFilter}
                onChange={handleCategoryChange}
                label="Категория"
              >
                <MenuItem value="">Все категории</MenuItem>
                {categories.map(category => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Paper>
      
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Название</TableCell>
                <TableCell>Категория</TableCell>
                <TableCell>Описание</TableCell>
                <TableCell>Длительность (мин)</TableCell>
                <TableCell>Цена (₽)</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress size={30} />
                  </TableCell>
                </TableRow>
              ) : filteredServices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    Услуги не найдены
                  </TableCell>
                </TableRow>
              ) : (
                filteredServices.map(service => (
                  <TableRow key={service.id}>
                    <TableCell>{service.id}</TableCell>
                    <TableCell>{service.name}</TableCell>
                    <TableCell>{service.category?.name || 'Без категории'}</TableCell>
                    <TableCell>{service.description || '—'}</TableCell>
                    <TableCell>{service.default_duration}</TableCell>
                    <TableCell>{service.current_price_for_service_point || service.price || 'По запросу'} ₽</TableCell>
                    <TableCell>
                      <IconButton 
                        color="error" 
                        onClick={() => {
                          setServiceToDelete(service);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      
      {/* Диалог добавления услуги */}
      <Dialog 
        open={addDialogOpen} 
        onClose={() => setAddDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Добавить услугу</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel id="service-select-label">Услуга</InputLabel>
              <Select
                labelId="service-select-label"
                value={selectedService || ''}
                onChange={(e) => setSelectedService(e.target.value as number)}
                label="Услуга"
              >
                <MenuItem value="">Выберите услугу</MenuItem>
                {getFilteredAllServices().map(service => (
                  <MenuItem key={service.id} value={service.id}>
                    {service.name} ({service.default_duration} мин)
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Отмена</Button>
          <Button 
            variant="contained" 
            onClick={handleAddService}
            disabled={!selectedService}
          >
            Добавить
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Диалог удаления услуги */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Удаление услуги</DialogTitle>
        <DialogContent>
          <Typography>
            Вы действительно хотите удалить услугу "{serviceToDelete?.name}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Отмена</Button>
          <Button 
            variant="contained" 
            color="error" 
            onClick={handleDeleteService}
          >
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ServicePointServicesPage; 