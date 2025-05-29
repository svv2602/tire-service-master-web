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
  SelectChangeEvent,
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  LocationCity as LocationCityIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { 
  useGetCitiesQuery, 
  useDeleteCityMutation,
  useUpdateCityMutation,
} from '../../api/cities.api';
import { 
  useGetRegionsQuery 
} from '../../api/regions.api';
import { ApiResponse, City, CityFilter, CityFormData, Region } from '../../types/models';

const CitiesPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Состояние для поиска и пагинации
  const [search, setSearch] = useState('');
  const [regionId, setRegionId] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  
  // Состояние для диалогов
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // RTK Query хуки
  const { 
    data: citiesData, 
    isLoading: citiesLoading, 
    error: citiesError 
  } = useGetCitiesQuery({
    query: search || undefined,
    region_id: regionId ? Number(regionId) : undefined,
    page: page + 1,
    per_page: rowsPerPage,
  } as CityFilter);

  const { data: regionsData } = useGetRegionsQuery({} as any);
  const [deleteCity, { isLoading: deleteLoading }] = useDeleteCityMutation();
  const [updateCity] = useUpdateCityMutation();

  const isLoading = citiesLoading || deleteLoading;
  const error = citiesError;
  const cities = citiesData?.data || [];
  const totalItems = citiesData?.pagination?.total_count || 0;
  const regions = regionsData?.data || [];

  // Обработчики событий
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setPage(0);
  };

  const handleRegionChange = (event: SelectChangeEvent<string>) => {
    setRegionId(event.target.value);
    setPage(0);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDeleteClick = (city: City) => {
    setSelectedCity(city);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedCity) {
      try {
        await deleteCity(Number(selectedCity.id)).unwrap();
        setSuccessMessage('Город успешно удален');
        setDeleteDialogOpen(false);
        setSelectedCity(null);
      } catch (error) {
        console.error('Ошибка при удалении города:', error);
        setErrorMessage('Не удалось удалить город');
      }
    }
  };

  const handleToggleStatus = async (city: City) => {
    try {
      await updateCity({
        id: Number(city.id),
        city: { is_active: !city.is_active }
      }).unwrap();
    } catch (error) {
      console.error('Ошибка при изменении статуса:', error);
    }
  };

  const handleCloseDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedCity(null);
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
          Ошибка при загрузке городов: {error.toString()}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Заголовок */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Города</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/cities/new')}
        >
          Добавить город
        </Button>
      </Box>

      {/* Фильтры и поиск */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            placeholder="Поиск по названию города"
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
          
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Регион</InputLabel>
            <Select
              value={regionId}
              onChange={handleRegionChange}
              label="Регион"
            >
              <MenuItem value="">Все регионы</MenuItem>
              {regions.map((region: Region) => (
                <MenuItem key={region.id} value={region.id}>
                  {region.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Таблица городов */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Название</TableCell>
              <TableCell>Регион</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cities.map((city: City) => (
              <TableRow key={city.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationCityIcon color="action" />
                    <Typography>{city.name}</Typography>
                  </Box>
                </TableCell>

                <TableCell>
                  {regions.find(r => r.id === city.region_id)?.name}
                </TableCell>

                <TableCell>
                  <Chip
                    icon={city.is_active ? <CheckIcon /> : <CloseIcon />}
                    label={city.is_active ? 'Активен' : 'Неактивен'}
                    color={city.is_active ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>

                <TableCell align="right">
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Tooltip title="Редактировать">
                      <IconButton
                        onClick={() => navigate(`/cities/${city.id}/edit`)}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Удалить">
                      <IconButton
                        onClick={() => handleDeleteClick(city)}
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
          rowsPerPageOptions={[10, 25, 50]}
        />
      </TableContainer>

      {/* Диалог подтверждения удаления */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDialog}
      >
        <DialogTitle>
          Подтверждение удаления
        </DialogTitle>
        <DialogContent>
          <Typography>
            Вы действительно хотите удалить город {selectedCity?.name}?
            Это действие нельзя будет отменить.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            Отмена
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CitiesPage; 