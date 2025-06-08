import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  InputAdornment,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Avatar,
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Person as PersonIcon,
  DirectionsCar as CarIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { 
  useGetClientsQuery, 
  useDeleteClientMutation,
} from '../../api/clients.api';
import { Client, ClientFilter } from '../../types/client';
import { ApiResponse } from '../../types/models';
import { useDebounce } from '../../hooks/useDebounce';

// Импорты UI компонентов
import Paper from '../../components/ui/Paper';
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/TextField';
import { Modal } from '../../components/ui/Modal';
import { Alert } from '../../components/ui/Alert';
import { Pagination } from '../../components/ui/Pagination';

// Мемоизированный компонент строки клиента
const ClientRow = React.memo<{
  client: Client;
  onEdit: (id: string) => void;
  onDelete: (client: Client) => void;
  onViewCars: (id: string) => void;
}>(({ client, onEdit, onDelete, onViewCars }) => (
  <TableRow>
    <TableCell>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Avatar>
          <PersonIcon />
        </Avatar>
        <Typography>
          {client.first_name} {client.last_name}
        </Typography>
      </Box>
    </TableCell>

    <TableCell>{client.phone}</TableCell>
    <TableCell>{client.email}</TableCell>

    <TableCell align="right">
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        <Tooltip title="Автомобили">
          <IconButton
            onClick={() => onViewCars(client.id.toString())}
            size="small"
            color="primary"
          >
            <CarIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Редактировать">
          <IconButton
            onClick={() => onEdit(client.id.toString())}
            size="small"
          >
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Удалить">
          <IconButton
            onClick={() => onDelete(client)}
            size="small"
            color="error"
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </TableCell>
  </TableRow>
));

ClientRow.displayName = 'ClientRow';

const ClientsPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Состояние для поиска и пагинации
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  
  // Состояние для диалогов
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Дебаунсированный поиск
  const debouncedSearch = useDebounce(search, 300);

  // Мемоизированные параметры запроса
  const queryParams = useMemo(() => ({
    query: debouncedSearch || undefined,
    page: page + 1,
    per_page: rowsPerPage,
  } as ClientFilter), [debouncedSearch, page, rowsPerPage]);

  // RTK Query хуки
  const { 
    data: clientsData, 
    isLoading: clientsLoading, 
    error: clientsError 
  } = useGetClientsQuery(queryParams);

  const [deleteClient, { isLoading: deleteLoading }] = useDeleteClientMutation();

  const isLoading = clientsLoading || deleteLoading;
  const error = clientsError;
  const clients = (clientsData as unknown as ApiResponse<Client>)?.data || [];
  const totalItems = (clientsData as unknown as ApiResponse<Client>)?.pagination?.total_count || 0;

  // Мемоизированные обработчики событий
  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setPage(0);
  }, []);

  const handleChangePage = useCallback((event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  const handleDeleteClick = useCallback((client: Client) => {
    setSelectedClient(client);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (selectedClient) {
      try {
        await deleteClient(selectedClient.id.toString()).unwrap();
        setDeleteDialogOpen(false);
        setSelectedClient(null);
      } catch (error) {
        console.error('Ошибка при удалении клиента:', error);
      }
    }
  }, [selectedClient, deleteClient]);

  const handleCloseDialog = useCallback(() => {
    setDeleteDialogOpen(false);
    setSelectedClient(null);
  }, []);

  const handleAddClient = useCallback(() => {
    navigate('/clients/new');
  }, [navigate]);

  const handleEditClient = useCallback((id: string) => {
    navigate(`/clients/${id}/edit`);
  }, [navigate]);

  const handleViewCars = useCallback((id: string) => {
    navigate(`/clients/${id}/cars`);
  }, [navigate]);

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

  return (
    <Box sx={{ p: 3 }}>
      {/* Заголовок */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Клиенты</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddClient}
        >
          Добавить клиента
        </Button>
      </Box>

      {/* Поиск */}
      <Paper sx={{ 
        p: 2, 
        mb: 3,
        backgroundColor: 'transparent',
        boxShadow: 'none',
        border: 'none'
      }}>
        <TextField
          placeholder="Поиск по имени, фамилии, email или номеру телефона..."
          variant="outlined"
          size="small"
          value={search}
          onChange={handleSearchChange}
          fullWidth
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
      <TableContainer component={Paper} sx={{
        backgroundColor: 'transparent',
        boxShadow: 'none',
        border: 'none'
      }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Клиент</TableCell>
              <TableCell>Телефон</TableCell>
              <TableCell>Email</TableCell>
              <TableCell align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clients.map((client: Client) => (
              <ClientRow
                key={client.id}
                client={client}
                onEdit={handleEditClient}
                onDelete={handleDeleteClick}
                onViewCars={handleViewCars}
              />
            ))}
          </TableBody>
        </Table>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          p: 2 
        }}>
          <Pagination
            count={Math.ceil(totalItems / rowsPerPage)}
            page={page + 1}
            onChange={(newPage) => setPage(newPage - 1)}
            color="primary"
            disabled={totalItems <= rowsPerPage}
          />
        </Box>
      </TableContainer>

      {/* Модальное окно подтверждения удаления */}
      <Modal 
        open={deleteDialogOpen} 
        onClose={handleCloseDialog}
        title="Подтверждение удаления"
        maxWidth={400}
        actions={
          <>
            <Button onClick={handleCloseDialog}>Отмена</Button>
            <Button onClick={handleDeleteConfirm} color="error" variant="contained">
              Удалить
            </Button>
          </>
        }
      >
        <Typography>
          Вы действительно хотите удалить клиента {selectedClient?.first_name} {selectedClient?.last_name}?
          Это действие нельзя будет отменить.
        </Typography>
      </Modal>
    </Box>
  );
};

export default ClientsPage; 