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
  Star as StarIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { 
  useGetServicePointsQuery,
  useDeleteServicePointMutation,
  useGetRegionsQuery,
  useGetCitiesQuery,
} from '../../api';

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
  const { data: regionsData, isLoading: regionsLoading } = useGetRegionsQuery({});
  const { data: citiesData, isLoading: citiesLoading } = useGetCitiesQuery(
    { region_id: selectedRegionId || undefined }, 
    { skip: !selectedRegionId }
  );
  const { data: servicePointsData, isLoading: servicePointsLoading, error } = useGetServicePointsQuery({
    search,
    city_id: selectedCityId || undefined,
    region_id: selectedRegionId || undefined,
    page: page + 1,
    per_page: rowsPerPage,
  });
  const [deleteServicePoint, { isLoading: isDeleting }] = useDeleteServicePointMutation();

  const isLoading = servicePointsLoading || regionsLoading || citiesLoading || isDeleting;
  const servicePoints = servicePointsData?.data || [];
  const totalItems = servicePointsData?.meta?.total || 0;

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
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Название</TableCell>
              <TableCell>Адрес</TableCell>
              <TableCell>Контакты</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {servicePoints.map((servicePoint) => (
              <TableRow key={servicePoint.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BusinessIcon color="action" />
                    <Typography>{servicePoint.name}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationIcon color="action" />
                    <Typography>{servicePoint.address}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PhoneIcon color="action" />
                    <Typography>{servicePoint.contact_phone}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <StarIcon color={servicePoint.is_active ? "primary" : "disabled"} />
                    <Typography>{servicePoint.is_active ? 'Активна' : 'Неактивна'}</Typography>
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Tooltip title="Редактировать">
                      <IconButton 
                        onClick={() => navigate(`/service-points/${servicePoint.partner_id}/${servicePoint.id}/edit`)}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Удалить">
                      <IconButton
                        onClick={() => handleDeleteClick(servicePoint)}
                        size="small"
                        color="error"
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
        <TablePagination
          component="div"
          count={totalItems}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[10, 25, 50, 100]}
        />
      </TableContainer>

      {/* Диалог подтверждения удаления */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <Typography>
            Вы действительно хотите удалить сервисную точку "{selectedServicePoint?.name}"?
            Это действие нельзя будет отменить.
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

export default ServicePointsPage; 