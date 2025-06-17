import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
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
import { useTheme } from '@mui/material/styles';
import { 
  useGetClientsQuery, 
  useDeleteClientMutation,
} from '../../api/clients.api';
import { Client, ClientFilter } from '../../types/client';
import { ApiResponse } from '../../types/models';
import { useDebounce } from '../../hooks/useDebounce';

// Импорты UI компонентов
import { 
  Button, 
  TextField, 
  Alert, 
  Pagination, 
  Modal,
  Typography 
} from '../../components/ui';

// Импорт централизованных стилей
import { getTablePageStyles } from '../../styles/components';

// Мемоизированный компонент строки клиента
const ClientRow = React.memo<{
  client: Client;
  onEdit: (id: string) => void;
  onDelete: (client: Client) => void;
  onViewCars: (id: string) => void;
  tablePageStyles: any;
}>(({ client, onEdit, onDelete, onViewCars, tablePageStyles }) => (
  <TableRow sx={tablePageStyles.tableRow}>
    <TableCell>
      <Box sx={tablePageStyles.avatarContainer}>
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
      <Box sx={tablePageStyles.actionsContainer}>
        <Tooltip title="Автомобили">
          <IconButton
            onClick={() => onViewCars(client.id.toString())}
            size="small"
            color="primary"
            sx={tablePageStyles.actionButton}
          >
            <CarIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Редактировать">
          <IconButton
            onClick={() => onEdit(client.id.toString())}
            size="small"
            sx={tablePageStyles.actionButton}
          >
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Удалить">
          <IconButton
            onClick={() => onDelete(client)}
            size="small"
            color="error"
            sx={tablePageStyles.actionButton}
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
  const theme = useTheme();
  
  // Инициализация стилей
  const tablePageStyles = getTablePageStyles(theme);
  
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
      <Box sx={tablePageStyles.loadingContainer}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={tablePageStyles.errorContainer}>
        <Alert severity="error">
          Ошибка при загрузке клиентов: {error.toString()}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={tablePageStyles.pageContainer}>
      {/* Заголовок */}
      <Box sx={tablePageStyles.pageHeader}>
        <Typography variant="h4" sx={tablePageStyles.pageTitle}>
          Клиенты
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddClient}
          sx={tablePageStyles.createButton}
        >
          Добавить клиента
        </Button>
      </Box>

      {/* Поиск */}
      <Box sx={tablePageStyles.filtersContainer}>
        <TextField
          placeholder="Поиск по имени, фамилии, email или номеру телефона..."
          variant="outlined"
          size="small"
          value={search}
          onChange={handleSearchChange}
          sx={tablePageStyles.searchField}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Таблица клиентов */}
      <TableContainer sx={tablePageStyles.tableContainer}>
        <Table>
          <TableHead sx={tablePageStyles.tableHeader}>
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
                tablePageStyles={tablePageStyles}
              />
            ))}
          </TableBody>
        </Table>
        <Box sx={tablePageStyles.paginationContainer}>
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