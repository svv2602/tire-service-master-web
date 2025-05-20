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
  Tooltip,
  Chip,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocationOn as LocationIcon,
  Language as LanguageIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Business as BusinessIcon,
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
  const [partnerToDeleteName, setPartnerToDeleteName] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>('company_name');

  const loadPartners = useCallback(() => {
    dispatch(fetchPartners({
      page,
      per_page: pageSize,
      query: searchQuery || undefined,
      sort_by: sortBy,
    }));
  }, [dispatch, page, pageSize, searchQuery, sortBy]);

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

  const handleSortChange = (event: SelectChangeEvent) => {
    setSortBy(event.target.value);
  };

  const handleAddPartner = () => {
    navigate('/partners/create');
  };

  const handleEditPartner = (id: number) => {
    navigate(`/partners/${id}/edit`);
  };

  const handleDeleteClick = (id: number, name: string) => {
    setPartnerToDelete(id);
    setPartnerToDeleteName(name);
    setDeleteError(null);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (partnerToDelete) {
      try {
        await dispatch(deletePartner(partnerToDelete)).unwrap();
        setDeleteDialogOpen(false);
        setPartnerToDelete(null);
        setPartnerToDeleteName(null);
        loadPartners();
      } catch (error: any) {
        console.error('Ошибка при удалении:', error);
        let errorMessage = 'Ошибка при удалении партнера';
        
        if (error.message) {
          errorMessage = error.message;
        } else if (error.error) {
          errorMessage = error.error;
        }
        
        if (error.message) {
          setDeleteError(error.message);
        } else {
          setDeleteError(errorMessage);
        }
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setPartnerToDelete(null);
    setPartnerToDeleteName(null);
    setDeleteError(null);
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
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            label="Поиск"
            variant="outlined"
            value={searchQuery}
            onChange={handleSearchInputChange}
            onKeyPress={handleSearchKeyPress}
            fullWidth
            sx={{ flexGrow: 1, minWidth: '250px' }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            placeholder="Введите название компании или имя контактного лица"
          />
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Сортировать по</InputLabel>
            <Select
              value={sortBy}
              label="Сортировать по"
              onChange={handleSortChange}
            >
              <MenuItem value="company_name">Названию компании</MenuItem>
              <MenuItem value="contact_person">Контактному лицу</MenuItem>
              <MenuItem value="created_at">Дате создания</MenuItem>
            </Select>
          </FormControl>
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
                    <TableCell>Контактная информация</TableCell>
                    <TableCell>Реквизиты</TableCell>
                    <TableCell>Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {partners.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Box sx={{ py: 3 }}>
                          <Typography variant="body1" gutterBottom>Партнеры не найдены</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {searchQuery ? 
                              'Попробуйте изменить параметры поиска' : 
                              'Добавьте первого партнера, нажав на кнопку "Добавить партнера"'}
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    partners.map((partner) => (
                      <TableRow
                        key={partner.id}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell component="th" scope="row">
                          {partner.id}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="body1" fontWeight={500}>{partner.company_name}</Typography>
                            {partner.company_description && (
                              <Tooltip title={partner.company_description}>
                                <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 200 }}>
                                  {partner.company_description.length > 50 
                                    ? `${partner.company_description.substring(0, 50)}...` 
                                    : partner.company_description}
                                </Typography>
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          {partner.contact_person || '-'}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {partner.user?.email && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <EmailIcon fontSize="small" color="action" />
                                <Typography variant="body2">{partner.user.email}</Typography>
                              </Box>
                            )}
                            {partner.user?.phone && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <PhoneIcon fontSize="small" color="action" />
                                <Typography variant="body2">{partner.user.phone}</Typography>
                              </Box>
                            )}
                            {partner.website && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LanguageIcon fontSize="small" color="action" />
                                <a href={partner.website} target="_blank" rel="noopener noreferrer">
                                  {partner.website}
                                </a>
                              </Box>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {partner.tax_number && (
                              <Chip 
                                icon={<BusinessIcon />} 
                                label={`ИНН: ${partner.tax_number}`} 
                                variant="outlined" 
                                size="small" 
                              />
                            )}
                            {partner.legal_address && (
                              <Tooltip title={partner.legal_address}>
                                <Chip 
                                  icon={<LocationIcon />} 
                                  label="Юридический адрес" 
                                  variant="outlined" 
                                  size="small" 
                                />
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
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
                              onClick={() => handleDeleteClick(partner.id, partner.company_name)}
                              startIcon={<DeleteIcon />}
                              variant="outlined"
                              color="error"
                            >
                              Удал.
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <Divider />
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Всего записей: {totalItems}
              </Typography>
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
          <Typography>
            Вы действительно хотите удалить партнера "{partnerToDeleteName}"?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Это действие удалит партнера и все связанные с ним данные, включая учетную запись пользователя.
            Данное действие нельзя отменить.
          </Typography>
          
          {deleteError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {deleteError}
            </Alert>
          )}
          
          {deleteError && deleteError.includes('сервисные точки') && (
            <Box sx={{ mt: 2, bgcolor: 'background.default', p: 1, borderRadius: 1 }}>
              <Typography variant="subtitle2" color="error">
                Сначала необходимо удалить сервисные точки, связанные с этим партнером.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Отмена</Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Удалить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PartnersPage; 