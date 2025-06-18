import React, { useState, useCallback, useMemo } from 'react';
import {
  InputAdornment,
  CircularProgress,
  IconButton,
  Tooltip,
  Avatar,
  Chip,
  Switch,
  FormControlLabel,
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
  useUpdateClientMutation,
} from '../../api/clients.api';
import { Client } from '../../types/client';
import { ClientFilter } from '../../types/models';
import { ApiResponse } from '../../types/models';
import { useDebounce } from '../../hooks/useDebounce';

// Импорты UI компонентов
import { 
  Box,
  Button, 
  TextField, 
  Alert, 
  Pagination, 
  Modal,
  Typography,
  Table,
  type Column 
} from '../../components/ui';

// Импорт централизованных стилей
import { getTablePageStyles } from '../../styles/components';

// Константы
const PER_PAGE = 25;

const ClientsPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  
  // Инициализация стилей
  const tablePageStyles = getTablePageStyles(theme);
  
  // Состояние для поиска и пагинации
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [showInactive, setShowInactive] = useState(false);
  
  // Состояние для диалогов
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Дебаунсированный поиск
  const debouncedSearch = useDebounce(search, 300);

  // Формируем параметры запроса
  const queryParams = useMemo(() => ({
    query: debouncedSearch,
    page: page + 1,
    per_page: PER_PAGE,
    active: showInactive ? undefined : true,
  } as ClientFilter), [debouncedSearch, page, showInactive]);

  // RTK Query хуки
  const { 
    data: clientsData, 
    isLoading: clientsLoading, 
    error: clientsError 
  } = useGetClientsQuery(queryParams, {
    refetchOnMountOrArgChange: true,
  });

  const [deleteClient, { isLoading: deleteLoading }] = useDeleteClientMutation();
  const [updateClient] = useUpdateClientMutation();

  const isLoading = clientsLoading || deleteLoading;
  const error = clientsError;
  const clients = (clientsData as unknown as ApiResponse<Client>)?.data || [];
  const totalItems = (clientsData as unknown as ApiResponse<Client>)?.pagination?.total_count || 0;

  // Мемоизированные обработчики событий
  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
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
        setErrorMessage(null);
      } catch (error: any) {
        let errorMessage = 'Ошибка при удалении клиента';
        
        if (error.data?.error) {
          errorMessage = error.data.error;
        } else if (error.data?.message) {
          errorMessage = error.data.message;
        } else if (error.data?.errors) {
          const errors = error.data.errors as Record<string, string[]>;
          errorMessage = Object.entries(errors)
            .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
            .join('; ');
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        setErrorMessage(errorMessage);
        setDeleteDialogOpen(false);
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

  const handleToggleStatus = useCallback(async (client: Client) => {
    try {
      const updateData = {
        user: {
          is_active: !client.is_active,
        }
      };
      
      await updateClient({ 
        id: client.id.toString(), 
        client: updateData 
      }).unwrap();
      setErrorMessage(null);
    } catch (error: any) {
      let errorMessage = 'Ошибка при изменении статуса клиента';
      
      if (error.data?.error) {
        errorMessage = error.data.error;
      } else if (error.data?.message) {
        errorMessage = error.data.message;
      } else if (error.data?.errors) {
        const errors = error.data.errors as Record<string, string[]>;
        errorMessage = Object.entries(errors)
          .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
          .join('; ');
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setErrorMessage(errorMessage);
    }
  }, [updateClient]);

  // Определение колонок таблицы
  const columns: Column[] = useMemo(() => [
    {
      id: 'client',
      label: 'Клиент',
      minWidth: 200,
      wrap: true,
      format: (_, row: Client) => (
        <Box sx={tablePageStyles.avatarContainer}>
          <Avatar sx={{ opacity: row.is_active ? 1 : 0.5 }}>
            <PersonIcon />
          </Avatar>
          <Box>
            <Typography color={row.is_active ? 'text.primary' : 'text.secondary'}>
              {row.first_name} {row.last_name}
              {!row.is_active && <Chip label="Деактивирован" size="small" color="error" sx={{ ml: 1 }} />}
            </Typography>
          </Box>
        </Box>
      )
    },
    {
      id: 'phone',
      label: 'Телефон',
      minWidth: 150,
      wrap: true
    },
    {
      id: 'email',
      label: 'Email',
      minWidth: 200,
      wrap: true
    },
    {
      id: 'status',
      label: 'Статус',
      minWidth: 100,
      align: 'center' as const,
      format: (_, row: Client) => (
        <FormControlLabel
          control={
            <Switch
              checked={row.is_active}
              onChange={() => handleToggleStatus(row)}
              size="small"
            />
          }
          label=""
          sx={{ m: 0 }}
        />
      )
    },
    {
      id: 'actions',
      label: 'Действия',
      minWidth: 150,
      align: 'right' as const,
      format: (_, row: Client) => (
        <Box sx={tablePageStyles.actionsContainer}>
          <Tooltip title="Автомобили">
            <IconButton
              onClick={() => handleViewCars(row.id.toString())}
              size="small"
              color="primary"
              sx={tablePageStyles.actionButton}
            >
              <CarIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Редактировать">
            <IconButton
              onClick={() => handleEditClient(row.id.toString())}
              size="small"
              sx={tablePageStyles.actionButton}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Удалить">
            <IconButton
              onClick={() => handleDeleteClick(row)}
              size="small"
              color="error"
              sx={tablePageStyles.actionButton}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ], [tablePageStyles, handleToggleStatus, handleViewCars, handleEditClient, handleDeleteClick]);

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
      {/* Отображение ошибок */}
      {errorMessage && (
        <Box sx={{ mb: 2 }}>
          <Alert severity="error" onClose={() => setErrorMessage(null)}>
            {errorMessage}
          </Alert>
        </Box>
      )}

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
        <FormControlLabel
          control={
            <Switch
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              color="primary"
            />
          }
          label={
            <Box sx={{ display: 'flex', flexDirection: 'column', ml: 1 }}>
              <Typography variant="body2">
                Показать деактивированных
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {showInactive ? 'Показаны все клиенты' : 'Показаны только активные'}
              </Typography>
            </Box>
          }
          sx={{ ml: 2 }}
        />
      </Box>

      {/* Статистика */}
      <Box sx={{ mb: 2, display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Найдено клиентов: <strong>{totalItems}</strong>
        </Typography>
        {clients.length > 0 && (
          <>
            <Typography variant="body2" color="success.main">
              Активных: <strong>{clients.filter(client => client.is_active).length}</strong>
            </Typography>
            {clients.filter(client => !client.is_active).length > 0 && (
              <Typography variant="body2" color="error.main">
                Деактивированных: <strong>{clients.filter(client => !client.is_active).length}</strong>
              </Typography>
            )}
          </>
        )}
        <Typography variant="caption" color="text.secondary">
          {!showInactive && '(только активные)'}
          {showInactive && '(включая деактивированных)'}
        </Typography>
      </Box>

      {/* Новая UI таблица клиентов */}
      <Table 
        columns={columns} 
        rows={clients}
        sx={{
          '& .MuiTableRow-root': {
            opacity: (row: Client) => row.is_active ? 1 : 0.6
          }
        }}
      />

      {/* Пагинация */}
      <Box sx={tablePageStyles.paginationContainer}>
        <Pagination
          count={Math.ceil(totalItems / PER_PAGE)}
          page={page + 1}
          onChange={(newPage) => setPage(newPage - 1)}
          color="primary"
          disabled={totalItems <= PER_PAGE}
        />
      </Box>

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
