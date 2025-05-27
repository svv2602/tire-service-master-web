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
  Map as MapIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { 
  useGetRegionsQuery, 
  useDeleteRegionMutation,
  useUpdateRegionMutation,
} from '../../api/regions.api';
import { Region, RegionFilter, RegionFormData, ApiResponse } from '../../types/models';

const RegionsPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Состояние для поиска и пагинации
  const [search, setSearch] = useState('');
  const [active, setActive] = useState<string>('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  
  // Состояние для диалогов
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);

  // RTK Query хуки
  const { 
    data: regionsData, 
    isLoading: regionsLoading, 
    error: regionsError 
  } = useGetRegionsQuery({
    query: search || undefined,
    active: active ? active === 'true' : undefined,
    page: page + 1,
    per_page: rowsPerPage,
  } as RegionFilter);

  const [deleteRegion, { isLoading: deleteLoading }] = useDeleteRegionMutation();
  const [updateRegion] = useUpdateRegionMutation();

  const isLoading = regionsLoading || deleteLoading;
  const error = regionsError;
  const regions = (regionsData as unknown as ApiResponse<Region>)?.data || [];
  const totalItems = (regionsData as unknown as ApiResponse<Region>)?.total || 0;

  // Обработчики событий
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setPage(0);
  };

  const handleActiveChange = (event: SelectChangeEvent<string>) => {
    setActive(event.target.value);
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
    setSelectedRegion(region);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedRegion) {
      try {
        await deleteRegion(selectedRegion.id).unwrap();
        setDeleteDialogOpen(false);
        setSelectedRegion(null);
      } catch (error) {
        console.error('Ошибка при удалении региона:', error);
      }
    }
  };

  const handleToggleStatus = async (region: Region) => {
    try {
      await updateRegion({
        id: region.id,
        region: { is_active: !region.is_active } as Partial<RegionFormData>
      }).unwrap();
    } catch (error) {
      console.error('Ошибка при изменении статуса:', error);
    }
  };

  const handleCloseDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedRegion(null);
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

  return (
    <Box sx={{ p: 3 }}>
      {/* Заголовок */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Регионы</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/regions/new')}
        >
          Добавить регион
        </Button>
      </Box>

      {/* Фильтры и поиск */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            placeholder="Поиск по названию региона"
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
            <InputLabel>Статус</InputLabel>
            <Select
              value={active}
              onChange={handleActiveChange}
              label="Статус"
            >
              <MenuItem value="">Все статусы</MenuItem>
              <MenuItem value="true">Активные</MenuItem>
              <MenuItem value="false">Неактивные</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Таблица регионов */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Название</TableCell>
              <TableCell>Код</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {regions.map((region: Region) => (
              <TableRow key={region.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MapIcon color="action" />
                    <Typography>{region.name}</Typography>
                  </Box>
                </TableCell>

                <TableCell>{region.code}</TableCell>

                <TableCell>
                  <Chip
                    icon={region.is_active ? <CheckIcon /> : <CloseIcon />}
                    label={region.is_active ? 'Активен' : 'Неактивен'}
                    color={region.is_active ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>

                <TableCell align="right">
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Tooltip title="Редактировать">
                      <IconButton
                        onClick={() => navigate(`/regions/${region.id}/edit`)}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={region.is_active ? 'Деактивировать' : 'Активировать'}>
                      <IconButton
                        onClick={() => handleToggleStatus(region)}
                        size="small"
                        color={region.is_active ? 'error' : 'success'}
                      >
                        {region.is_active ? <CloseIcon /> : <CheckIcon />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Удалить">
                      <IconButton
                        onClick={() => handleDeleteClick(region)}
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
            Вы действительно хотите удалить регион {selectedRegion?.name}?
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

export default RegionsPage; 