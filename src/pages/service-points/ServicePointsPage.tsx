import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Paper,
  Divider,
  CircularProgress,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  PhotoCamera as PhotoCameraIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { AppDispatch } from '../../store';
import { fetchServicePoints, deleteServicePoint } from '../../store/slices/servicePointsSlice';
import { useNavigate } from 'react-router-dom';

const ServicePointsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { servicePoints, loading, error, totalItems } = useSelector((state: RootState) => state.servicePoints);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [servicePointToDelete, setServicePointToDelete] = useState<{ partnerId: number, id: number } | null>(null);

  const loadServicePoints = useCallback(() => {
    dispatch(fetchServicePoints({
      page,
      per_page: pageSize,
      query: searchQuery || undefined,
    }));
  }, [dispatch, page, pageSize, searchQuery]);

  useEffect(() => {
    loadServicePoints();
  }, [loadServicePoints]);

  const handleSearch = () => {
    setPage(1); // Сбрасываем на первую страницу при поиске
    loadServicePoints();
  };

  const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleSearchKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleAddServicePoint = () => {
    navigate('/service-points/create');
  };

  const handleEditServicePoint = (partnerId: number, id: number) => {
    navigate(`/partners/${partnerId}/service-points/${id}/edit`);
  };

  const handleDeleteClick = (partnerId: number, id: number) => {
    setServicePointToDelete({ partnerId, id });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (servicePointToDelete) {
      await dispatch(deleteServicePoint(servicePointToDelete));
      loadServicePoints();
    }
    setDeleteDialogOpen(false);
    setServicePointToDelete(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setServicePointToDelete(null);
  };

  const handleViewServicePoint = (id: number) => {
    navigate(`/service-points/${id}`);
  };

  const handleViewPhotos = (id: number) => {
    navigate(`/service-points/${id}/photos`);
  };

  const getStatusColor = (statusId: number) => {
    switch (statusId) {
      case 1: // Активна
        return 'success';
      case 2: // Приостановлена
        return 'warning';
      case 3: // Заблокирована
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusName = (statusId: number) => {
    switch (statusId) {
      case 1:
        return 'Активна';
      case 2:
        return 'Приостановлена';
      case 3:
        return 'Заблокирована';
      default:
        return 'Неизвестно';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Точки обслуживания</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddServicePoint}
        >
          Добавить точку
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="Поиск"
            variant="outlined"
            value={searchQuery}
            onChange={handleSearchInputChange}
            onKeyPress={handleSearchKeyPress}
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Button variant="contained" onClick={handleSearch}>
            Поиск
          </Button>
        </Box>
      </Paper>

      <Paper>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ p: 3, color: 'error.main' }}>
            <Typography>Ошибка: {error}</Typography>
          </Box>
        ) : (
          <>
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="table of service points">
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Название</TableCell>
                    <TableCell>Партнер</TableCell>
                    <TableCell>Адрес</TableCell>
                    <TableCell>Статус</TableCell>
                    <TableCell>Рейтинг</TableCell>
                    <TableCell>Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {servicePoints.map((point) => (
                    <TableRow
                      key={point.id}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        {point.id}
                      </TableCell>
                      <TableCell>{point.name}</TableCell>
                      <TableCell>{point.partner?.company_name || '-'}</TableCell>
                      <TableCell>{point.address}</TableCell>
                      <TableCell>
                        <Chip 
                          label={getStatusName(point.status_id)} 
                          color={getStatusColor(point.status_id) as 'success' | 'warning' | 'error' | 'default'} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>{point.rating?.toFixed(1) || '-'}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            onClick={() => handleViewServicePoint(point.id)}
                            startIcon={<VisibilityIcon />}
                            variant="outlined"
                          >
                            Просмотр
                          </Button>
                          <Button
                            size="small"
                            onClick={() => handleEditServicePoint(point.partner_id, point.id)}
                            startIcon={<EditIcon />}
                            variant="outlined"
                          >
                            Ред.
                          </Button>
                          <Button
                            size="small"
                            onClick={() => handleViewPhotos(point.id)}
                            startIcon={<PhotoCameraIcon />}
                            variant="outlined"
                            color="primary"
                          >
                            Фото
                          </Button>
                          <Button
                            size="small"
                            onClick={() => handleDeleteClick(point.partner_id, point.id)}
                            startIcon={<DeleteIcon />}
                            variant="outlined"
                            color="error"
                          >
                            Удал.
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Divider />
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
              <Pagination
                count={Math.ceil(totalItems / pageSize)}
                page={page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          </>
        )}
      </Paper>

      {/* Диалог подтверждения удаления */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <Typography>Вы действительно хотите удалить эту точку обслуживания?</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Это действие удалит точку обслуживания и все связанные с ней данные. Данное действие нельзя отменить.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Отмена</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ServicePointsPage; 