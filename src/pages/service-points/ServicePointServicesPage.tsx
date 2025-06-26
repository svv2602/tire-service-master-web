import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Chip,
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
  useTheme,
  Tooltip,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Category as CategoryIcon,
  Schedule as ScheduleIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchWithAuth } from '../../api/apiUtils';
import { ServiceCategory } from '../../types';

// Импорты UI компонентов
import { Table, type Column } from '../../components/ui';

// Импорт централизованных стилей
import { getTablePageStyles } from '../../styles';

interface ServicePointService {
  id: number;
  name: string;
  description?: string;
  price: number;
  category_id: number;
  category?: ServiceCategory;
  current_price_for_service_point?: number;
}

const ServicePointServicesPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  
  // Инициализация централизованных стилей
  const tablePageStyles = getTablePageStyles(theme);
  
  const [servicePoint, setServicePoint] = useState<any>(null);
  const [services, setServices] = useState<ServicePointService[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<ServicePointService | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<number | ''>('');
  
  // Мемоизированные обработчики событий
  const handleDeleteClick = useCallback((service: ServicePointService) => {
    setServiceToDelete(service);
    setDeleteDialogOpen(true);
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleCategoryChange = useCallback((e: any) => {
    setCategoryFilter(e.target.value);
  }, []);

  // Конфигурация колонок таблицы
  const columns: Column[] = useMemo(() => [
    {
      id: 'id',
      label: 'ID',
      minWidth: 50,
      align: 'center',
    },
    {
      id: 'name',
      label: 'Название',
      wrap: true,
      format: (value, row: ServicePointService) => (
        <Box sx={tablePageStyles.avatarContainer}>
          <CategoryIcon sx={{ color: 'primary.main', mr: 1 }} />
          <Typography variant="body2" fontWeight="medium">
            {row.name}
          </Typography>
        </Box>
      )
    },
    {
      id: 'category',
      label: 'Категория',
      wrap: true,
      format: (value, row: ServicePointService) => (
        <Chip 
          label={row.category?.name || 'Без категории'} 
          variant="outlined" 
          size="small"
        />
      )
    },
    {
      id: 'description',
      label: 'Описание',
      wrap: true,
      format: (value, row: ServicePointService) => (
        <Typography variant="body2" color="text.secondary">
          {row.description || '—'}
        </Typography>
      )
    },

    {
      id: 'price',
      label: 'Цена',
      align: 'center',
      format: (value, row: ServicePointService) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
          <MoneyIcon fontSize="small" color="action" />
          <Typography variant="body2" fontWeight="medium">
            {row.current_price_for_service_point || row.price || 'По запросу'} ₽
          </Typography>
        </Box>
      )
    },
    {
      id: 'actions',
      label: 'Действия',
      align: 'right',
      format: (value, row: ServicePointService) => (
        <Box sx={tablePageStyles.actionsContainer}>
          <Tooltip title="Удалить услугу">
            <IconButton
              onClick={() => handleDeleteClick(row)}
              size="small"
              color="error"
              sx={tablePageStyles.actionButton}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ], [tablePageStyles, handleDeleteClick]);
  const fetchServicePoint = useCallback(async () => {
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
  }, [id]);
  
  const fetchServices = useCallback(async () => {
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
  }, [id]);
  
  useEffect(() => {
    if (id) {
      fetchServicePoint();
      fetchServices();
    }
  }, [id, fetchServicePoint, fetchServices]);
  
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
      
      fetchServices();
      setAddDialogOpen(false);
      setSelectedService(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    }
  };
  
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
  
  const handleBack = () => {
    navigate(`/service-points/${id}`);
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
                {/* TODO: Load categories from API */}
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Paper>
      
      {/* Таблица услуг */}
      <Box sx={tablePageStyles.tableContainer}>
        {loading ? (
          <Box sx={tablePageStyles.loadingContainer}>
            <CircularProgress />
          </Box>
        ) : (
          <Table
            columns={columns}
            rows={filteredServices}
          />
        )}
      </Box>
      
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
                {/* TODO: Load available services from API */}
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