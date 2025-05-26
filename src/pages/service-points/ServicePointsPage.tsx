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
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { 
  useGetServicePointsQuery, 
  useDeleteServicePointMutation 
} from '../../api/servicePoints';
import { useGetRegionsQuery } from '../../api/regions';
import { useGetCitiesQuery } from '../../api/cities';

const ServicePointsPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Состояние для поиска, фильтрации и пагинации
  const [search, setSearch] = useState('');
  const [selectedCityId, setSelectedCityId] = useState<number | ''>('');
  const [selectedRegionId, setSelectedRegionId] = useState<number | ''>('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  
  // Состояние для диалогов
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedServicePoint, setSelectedServicePoint] = useState<{ id: number; name: string; partner_id: number } | null>(null);

  // RTK Query хуки
  const { 
    data: servicePointsData, 
    isLoading, 
    error 
  } = useGetServicePointsQuery({
    query: search || undefined,
    city_id: selectedCityId || undefined,
    page: page + 1, // API использует 1-based пагинацию
    per_page: rowsPerPage,
  });

  const { data: regionsData } = useGetRegionsQuery();
  const { data: citiesData } = useGetCitiesQuery(
    { region_id: selectedRegionId || undefined }, 
    { skip: !selectedRegionId }
  );

  const [deleteServicePoint, { isLoading: deleteLoading }] = useDeleteServicePointMutation();

  // Обработчики событий
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setPage(0); // Сбрасываем на первую страницу при поиске
  };

  const handleRegionChange = (event: any) => {
    const regionId = event.target.value;
    setSelectedRegionId(regionId);
    setSelectedCityId(''); // Сбрасываем выбранный город
    setPage(0);
  };

  const handleCityChange = (event: any) => {
    setSelectedCityId(event.target.value);
    setPage(0);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDeleteClick = (servicePoint: { id: number; name: string; partner_id: number }) => {
    setSelectedServicePoint(servicePoint);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedServicePoint) {
      try {
        await deleteServicePoint({ 
          partner_id: selectedServicePoint.partner_id, 
          id: selectedServicePoint.id 
        }).unwrap();
        setDeleteDialogOpen(false);
        setSelectedServicePoint(null);
      } catch (error) {
        console.error('Ошибка при удалении сервисной точки:', error);
      }
    }
  };

  const handleCloseDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedServicePoint(null);
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
          Ошибка при загрузке сервисных точек: {error.toString()}
        </Alert>
      </Box>
    );
  }

  const servicePoints = servicePointsData?.data || [];
  const totalItems = servicePointsData?.pagination?.total_count || 0;

  return (
    <Box sx={{ p: 3 }}>
      {/* Заголовок и кнопка добавления */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Сервисные точки</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/service-points/new')}
        >
          Добавить сервисную точку
        </Button>
      </Box>

      {/* Фильтры и поиск */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            placeholder="Поиск по названию или адресу"
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
            <InputLabel>Регион</InputLabel>
            <Select
              value={selectedRegionId}
              onChange={handleRegionChange}
              label="Регион"
            >
              <MenuItem value="">Все регионы</MenuItem>
              {regionsData?.regions?.map((region) => (
                <MenuItem key={region.id} value={region.id}>
                  {region.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Город</InputLabel>
            <Select
              value={selectedCityId}
              onChange={handleCityChange}
              label="Город"
              disabled={!selectedRegionId}
            >
              <MenuItem value="">Все города</MenuItem>
              {citiesData?.cities?.map((city) => (
                <MenuItem key={city.id} value={city.id}>
                  {city.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Таблица сервисных точек */}
      <Paper>
        <TableContainer>
          <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Название</TableCell>
                    <TableCell>Партнер</TableCell>
                    <TableCell>Адрес</TableCell>
                <TableCell>Контакты</TableCell>
                <TableCell>Статистика</TableCell>
                <TableCell align="right">Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
              {servicePoints.map((servicePoint) => (
                <TableRow key={servicePoint.id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="medium">
                        {servicePoint.name}
                      </Typography>
                      {servicePoint.description && (
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {servicePoint.description}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <BusinessIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {servicePoint.partner?.company_name || 'Не указан'}
                      </Typography>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <LocationIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {servicePoint.address}
                        </Typography>
                      </Box>
                      {servicePoint.city && (
                        <Typography variant="body2" color="text.secondary">
                          {servicePoint.city.name}
                          {servicePoint.city.region && `, ${servicePoint.city.region.name}`}
                        </Typography>
                      )}
                    </Box>
                      </TableCell>
                  
                      <TableCell>
                    <Box>
                      {servicePoint.contact_phone && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                          <PhoneIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                          <Typography variant="body2">
                            {servicePoint.contact_phone}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                      </TableCell>
                  
                      <TableCell>
                    <Box>
                      <Typography variant="body2">
                        Постов: {servicePoint.post_count || 1}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Рейтинг: {servicePoint.average_rating?.toFixed(1) || '0.0'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Клиентов: {servicePoint.total_clients_served || 0}
                      </Typography>
                    </Box>
                  </TableCell>
                  
                  <TableCell align="right">
                        <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Редактировать">
                        <IconButton
                            size="small"
                          onClick={() => navigate(`/service-points/${servicePoint.id}/edit`)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Удалить">
                        <IconButton
                            size="small"
                          onClick={() => handleDeleteClick({
                            id: servicePoint.id,
                            name: servicePoint.name,
                            partner_id: servicePoint.partner_id
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
              
              {servicePoints.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      {search || selectedCityId ? 'Сервисные точки не найдены' : 'Нет сервисных точек'}
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
            Вы уверены, что хотите удалить сервисную точку "{selectedServicePoint?.name}"?
            Это действие нельзя отменить.
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

export default ServicePointsPage; 