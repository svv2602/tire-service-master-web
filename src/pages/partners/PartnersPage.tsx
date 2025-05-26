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
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon,
  Language as LanguageIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { 
  useGetPartnersQuery, 
  useDeletePartnerMutation, 
  useToggleActiveMutation 
} from '../../api/partners';

const PartnersPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Состояние для поиска и пагинации
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Состояние для диалогов
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [toggleDialogOpen, setToggleDialogOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<{ id: number; name: string; isActive: boolean } | null>(null);

  // RTK Query хуки
  const { 
    data: partnersData, 
    isLoading, 
    error 
  } = useGetPartnersQuery({
    query: search || undefined,
    page: page + 1, // API использует 1-based пагинацию
    per_page: rowsPerPage,
  });

  const [deletePartner, { isLoading: deleteLoading }] = useDeletePartnerMutation();
  const [toggleActive, { isLoading: toggleLoading }] = useToggleActiveMutation();

  // Обработчики событий
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setPage(0); // Сбрасываем на первую страницу при поиске
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDeleteClick = (partner: { id: number; company_name: string }) => {
    setSelectedPartner({ id: partner.id, name: partner.company_name, isActive: false });
    setDeleteDialogOpen(true);
  };

  const handleToggleClick = (partner: { id: number; company_name: string; is_active: boolean }) => {
    setSelectedPartner({ id: partner.id, name: partner.company_name, isActive: partner.is_active });
    setToggleDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedPartner) {
      try {
        await deletePartner(selectedPartner.id).unwrap();
        setDeleteDialogOpen(false);
        setSelectedPartner(null);
      } catch (error) {
        console.error('Ошибка при удалении партнера:', error);
      }
    }
  };

  const handleToggleConfirm = async () => {
    if (selectedPartner) {
      try {
        await toggleActive({ 
          id: selectedPartner.id, 
          active: !selectedPartner.isActive 
        }).unwrap();
        setToggleDialogOpen(false);
        setSelectedPartner(null);
      } catch (error) {
        console.error('Ошибка при изменении статуса партнера:', error);
      }
    }
  };

  const handleCloseDialogs = () => {
    setDeleteDialogOpen(false);
    setToggleDialogOpen(false);
    setSelectedPartner(null);
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
          Ошибка при загрузке партнеров: {error.toString()}
        </Alert>
      </Box>
    );
  }

  const partners = partnersData?.partners || [];
  const totalItems = partnersData?.total_items || 0;

  return (
    <Box sx={{ p: 3 }}>
      {/* Заголовок и кнопка добавления */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Партнеры</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/partners/new')}
        >
          Добавить партнера
        </Button>
      </Box>

      {/* Поиск */}
      <TextField
        fullWidth
        placeholder="Поиск по названию компании или контактному лицу"
        variant="outlined"
        value={search}
        onChange={handleSearchChange}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      {/* Таблица партнеров */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Компания</TableCell>
                <TableCell>Контактное лицо</TableCell>
                <TableCell>Контакты</TableCell>
                <TableCell>Местоположение</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {partners.map((partner) => (
                <TableRow key={partner.id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="medium">
                        {partner.company_name}
                      </Typography>
                      {partner.company_description && (
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {partner.company_description}
                        </Typography>
                      )}
                      {partner.website && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          <LanguageIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                          <Typography 
                            variant="body2" 
                            component="a" 
                            href={partner.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            sx={{ textDecoration: 'none', color: 'primary.main' }}
                          >
                            {partner.website}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2">
                      {partner.contact_person || 'Не указано'}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Box>
                      {partner.user?.email && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                          <EmailIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                          <Typography variant="body2">
                            {partner.user.email}
                          </Typography>
                        </Box>
                      )}
                      {partner.user?.phone && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <PhoneIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                          <Typography variant="body2">
                            {partner.user.phone}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Box>
                      {partner.region?.name && (
                        <Typography variant="body2">
                          {partner.region.name}
                        </Typography>
                      )}
                      {partner.city?.name && (
                        <Typography variant="body2" color="text.secondary">
                          {partner.city.name}
                        </Typography>
                      )}
                      {partner.legal_address && (
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {partner.legal_address}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Chip
                      label={partner.is_active ? 'Активен' : 'Неактивен'}
                      color={partner.is_active ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Редактировать">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/partners/${partner.id}/edit`)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title={partner.is_active ? 'Деактивировать' : 'Активировать'}>
                        <IconButton
                          size="small"
                          onClick={() => handleToggleClick(partner)}
                          disabled={toggleLoading}
                        >
                          {partner.is_active ? <ToggleOnIcon color="success" /> : <ToggleOffIcon />}
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Удалить">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteClick(partner)}
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
              
              {partners.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      {search ? 'Партнеры не найдены' : 'Нет партнеров'}
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
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Строк на странице:"
          labelDisplayedRows={({ from, to, count }) => 
            `${from}-${to} из ${count !== -1 ? count : `более чем ${to}`}`
          }
        />
      </Paper>

      {/* Диалог подтверждения удаления */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDialogs}>
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить партнера "{selectedPartner?.name}"?
            Это действие нельзя отменить.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Отмена</Button>
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

      {/* Диалог подтверждения изменения статуса */}
      <Dialog open={toggleDialogOpen} onClose={handleCloseDialogs}>
        <DialogTitle>Подтверждение изменения статуса</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите {selectedPartner?.isActive ? 'деактивировать' : 'активировать'} 
            партнера "{selectedPartner?.name}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Отмена</Button>
          <Button 
            onClick={handleToggleConfirm} 
            color="primary" 
            variant="contained"
            disabled={toggleLoading}
          >
            {toggleLoading ? 'Изменение...' : (selectedPartner?.isActive ? 'Деактивировать' : 'Активировать')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PartnersPage; 