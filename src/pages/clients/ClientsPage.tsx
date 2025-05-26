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
  Avatar,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  Verified as VerifiedIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { 
  useGetClientsQuery, 
  useDeleteClientMutation 
} from '../../api/clients';

const ClientsPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Состояние для поиска и пагинации
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  
  // Состояние для диалогов
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<{ id: number; name: string } | null>(null);

  // RTK Query хуки
  const { 
    data: clientsData, 
    isLoading, 
    error 
  } = useGetClientsQuery({
    query: search || undefined,
    page: page + 1, // API использует 1-based пагинацию
    per_page: rowsPerPage,
  });

  const [deleteClient, { isLoading: deleteLoading }] = useDeleteClientMutation();

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

  const handleDeleteClick = (client: { id: number; name: string }) => {
    setSelectedClient(client);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedClient) {
      try {
        await deleteClient(selectedClient.id).unwrap();
        setDeleteDialogOpen(false);
        setSelectedClient(null);
      } catch (error) {
        console.error('Ошибка при удалении клиента:', error);
      }
    }
  };

  const handleCloseDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedClient(null);
  };

  // Функция для получения инициалов
  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || 'К';
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
          Ошибка при загрузке клиентов: {error.toString()}
        </Alert>
      </Box>
    );
  }

  const clients = clientsData?.data || [];
  const totalItems = clientsData?.pagination?.total_count || 0;

  return (
    <Box sx={{ p: 3 }}>
      {/* Заголовок и кнопка добавления */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Клиенты</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/clients/new')}
        >
          Добавить клиента
        </Button>
      </Box>

      {/* Поиск */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          placeholder="Поиск по email, имени или фамилии"
          variant="outlined"
          size="small"
          value={search}
          onChange={handleSearchChange}
          sx={{ minWidth: 400 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {/* Таблица клиентов */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Клиент</TableCell>
                <TableCell>Контакты</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell>Настройки</TableCell>
                <TableCell>Дата регистрации</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                        {getInitials(client.user?.first_name, client.user?.last_name)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="medium">
                          {client.user?.first_name && client.user?.last_name 
                            ? `${client.user.first_name} ${client.user.last_name}`
                            : 'Имя не указано'
                          }
                        </Typography>
                        {client.user?.middle_name && (
                          <Typography variant="body2" color="text.secondary">
                            {client.user.middle_name}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Box>
                      {client.user?.email && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                          <EmailIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                          <Typography variant="body2">
                            {client.user.email}
                          </Typography>
                          {client.user.email_verified && (
                            <VerifiedIcon fontSize="small" sx={{ ml: 0.5, color: 'success.main' }} />
                          )}
                        </Box>
                      )}
                      {client.user?.phone && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <PhoneIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                          <Typography variant="body2">
                            {client.user.phone}
                          </Typography>
                          {client.user.phone_verified && (
                            <VerifiedIcon fontSize="small" sx={{ ml: 0.5, color: 'success.main' }} />
                          )}
                        </Box>
                      )}
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Chip
                      label={client.user?.is_active ? 'Активен' : 'Заблокирован'}
                      color={client.user?.is_active ? 'success' : 'error'}
                      size="small"
                      icon={client.user?.is_active ? <VerifiedIcon /> : <CancelIcon />}
                    />
                  </TableCell>
                  
                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        Уведомления: {client.preferred_notification_method || 'push'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Маркетинг: {client.marketing_consent ? 'Да' : 'Нет'}
                      </Typography>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2">
                      {client.user?.created_at 
                        ? new Date(client.user.created_at).toLocaleDateString('ru-RU')
                        : 'Не указана'
                      }
                    </Typography>
                    {client.user?.last_login && (
                      <Typography variant="body2" color="text.secondary">
                        Последний вход: {new Date(client.user.last_login).toLocaleDateString('ru-RU')}
                      </Typography>
                    )}
                  </TableCell>
                  
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Редактировать">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/clients/${client.id}/edit`)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Удалить">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteClick({
                            id: client.id,
                            name: client.user?.first_name && client.user?.last_name 
                              ? `${client.user.first_name} ${client.user.last_name}`
                              : client.user?.email || 'Клиент'
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
              
              {clients.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      {search ? 'Клиенты не найдены' : 'Нет клиентов'}
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
            Вы уверены, что хотите удалить клиента "{selectedClient?.name}"?
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

export default ClientsPage; 