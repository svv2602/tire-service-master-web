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
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { AppDispatch } from '../../store';
import { fetchPartners, deletePartner } from '../../store/slices/partnersSlice';
import { useNavigate } from 'react-router-dom';

const PartnersPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { partners, loading, error, totalItems } = useSelector((state: RootState) => state.partners);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [partnerToDelete, setPartnerToDelete] = useState<number | null>(null);

  const loadPartners = useCallback(() => {
    dispatch(fetchPartners({
      page,
      per_page: pageSize,
      query: searchQuery || undefined,
    }));
  }, [dispatch, page, pageSize, searchQuery]);

  useEffect(() => {
    loadPartners();
  }, [loadPartners]);

  const handleSearch = () => {
    setPage(1); // Сбрасываем на первую страницу при поиске
    loadPartners();
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

  const handleAddPartner = () => {
    navigate('/partners/create');
  };

  const handleEditPartner = (id: number) => {
    navigate(`/partners/${id}/edit`);
  };

  const handleDeleteClick = (id: number) => {
    setPartnerToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (partnerToDelete) {
      await dispatch(deletePartner(partnerToDelete));
      loadPartners();
    }
    setDeleteDialogOpen(false);
    setPartnerToDelete(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setPartnerToDelete(null);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Партнеры</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddPartner}
        >
          Добавить партнера
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
              <Table sx={{ minWidth: 650 }} aria-label="table of partners">
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Название компании</TableCell>
                    <TableCell>Контактное лицо</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Телефон</TableCell>
                    <TableCell>Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {partners.map((partner) => (
                    <TableRow
                      key={partner.id}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        {partner.id}
                      </TableCell>
                      <TableCell>{partner.company_name}</TableCell>
                      <TableCell>
                        {partner.contact_person || '-'}
                      </TableCell>
                      <TableCell>{partner.user?.email || '-'}</TableCell>
                      <TableCell>{partner.user?.phone || '-'}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            onClick={() => handleEditPartner(partner.id)}
                            startIcon={<EditIcon />}
                            variant="outlined"
                          >
                            Ред.
                          </Button>
                          <Button
                            size="small"
                            onClick={() => handleDeleteClick(partner.id)}
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
          <Typography>Вы действительно хотите удалить этого партнера?</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Это действие удалит партнера и все связанные с ним данные, включая сервисные точки.
            Данное действие нельзя отменить.
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

export default PartnersPage; 