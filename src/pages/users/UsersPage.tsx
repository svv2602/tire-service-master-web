import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
  FormControlLabel,
  Switch,
  Pagination,
  DialogTitle,
  DialogContent,
  DialogActions,
  TablePagination,
  Avatar,
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Person as PersonIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { 
  useGetUsersQuery,
  useDeleteUserMutation,
  useUpdateUserMutation,
} from '../../api';
import { User } from '../../types/models';
import { useSnackbar } from 'notistack';
import { useDebounce } from '../../hooks/useDebounce';

// Мемоизированный компонент строки пользователя
const UserRow = React.memo<{
  user: User;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (user: User) => void;
  getRoleName: (role?: string) => string;
  getRoleColor: (role?: string) => 'error' | 'warning' | 'primary' | 'success' | 'default';
}>(({ user, onEdit, onDelete, onToggleStatus, getRoleName, getRoleColor }) => (
  <TableRow>
    <TableCell>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Avatar>
          <PersonIcon />
        </Avatar>
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {user.first_name} {user.last_name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {user.email}
          </Typography>
        </Box>
      </Box>
    </TableCell>
    <TableCell>
      <Chip
        label={getRoleName(user.role)}
        color={getRoleColor(user.role)}
        size="small"
      />
    </TableCell>
    <TableCell>
      <FormControlLabel
        control={
          <Switch
            checked={user.is_active}
            onChange={() => onToggleStatus(user)}
            size="small"
          />
        }
        label={user.is_active ? 'Активен' : 'Неактивен'}
      />
    </TableCell>
    <TableCell>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {user.email_verified ? (
          <CheckIcon color="success" fontSize="small" />
        ) : (
          <CloseIcon color="error" fontSize="small" />
        )}
        <Typography variant="body2">
          {user.email_verified ? 'Подтвержден' : 'Не подтвержден'}
        </Typography>
      </Box>
    </TableCell>
    <TableCell align="right">
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        <Tooltip title="Редактировать">
          <IconButton
            onClick={() => onEdit(user.id.toString())}
            size="small"
          >
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Удалить">
          <IconButton
            onClick={() => onDelete(user.id.toString())}
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

UserRow.displayName = 'UserRow';

const UsersPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const { enqueueSnackbar } = useSnackbar();

  // Дебаунсированный поиск
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Мемоизированные параметры запроса
  const queryParams = useMemo(() => ({
    page: page.toString(),
    per_page: pageSize.toString(),
    query: debouncedSearch || undefined,
  }), [page, pageSize, debouncedSearch]);

  const { 
    data: usersData,
    isLoading,
    error,
    refetch
  } = useGetUsersQuery(queryParams);

  const [deleteUser] = useDeleteUserMutation();
  const [updateUser] = useUpdateUserMutation();

  const users = (usersData?.users || []) as User[];
  const totalItems = usersData?.totalItems || 0;

  // Мемоизированные вспомогательные функции
  const getRoleName = useCallback((role?: string): string => {
    if (!role) return 'Неизвестно';
    
    switch(role) {
      case 'admin': return 'Администратор';
      case 'manager': return 'Менеджер';
      case 'partner': return 'Партнер';
      case 'client': return 'Клиент';
      default: return role;
    }
  }, []);
  
  const getRoleColor = useCallback((role?: string): 'error' | 'warning' | 'primary' | 'success' | 'default' => {
    if (!role) return 'default';
    
    switch(role) {
      case 'admin': return 'error';
      case 'manager': return 'warning';
      case 'partner': return 'primary';
      case 'client': return 'success';
      default: return 'default';
    }
  }, []);

  // Мемоизированные обработчики событий
  const handleSearchInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(1); // Сбрасываем страницу при поиске
  }, []);

  const handlePageChange = useCallback((event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  }, []);

  const handleAddUser = useCallback(() => {
    navigate('/users/create');
  }, [navigate]);

  const handleEditUser = useCallback((id: string) => {
    navigate(`/users/${id}/edit`);
  }, [navigate]);

  const handleDeleteClick = useCallback((id: string) => {
    setUserToDelete(id);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (userToDelete) {
      try {
        await deleteUser(userToDelete).unwrap();
        await refetch();
      } catch (error) {
        console.error('Ошибка при удалении пользователя:', error);
      }
    }
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  }, [userToDelete, deleteUser, refetch]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  }, []);

  const handleToggleStatus = useCallback(async (user: User) => {
    try {
      const updateData = {
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        is_active: !user.is_active,
        email_verified: user.email_verified,
        phone_verified: user.phone_verified
      };
      await updateUser({
        id: user.id.toString(),
        data: updateData
      }).unwrap();
      enqueueSnackbar('Статус пользователя успешно обновлен', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Ошибка при обновлении статуса пользователя', { variant: 'error' });
    }
  }, [updateUser, enqueueSnackbar]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Пользователи</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddUser}
        >
          Добавить пользователя
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="Поиск"
            variant="outlined"
            value={searchQuery}
            onChange={handleSearchInputChange}
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Paper>

      <Paper>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ p: 3 }}>
            <Alert severity="error">
              Ошибка при загрузке пользователей: {error.toString()}
            </Alert>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table sx={{ minWidth: 650 }} aria-label="table of users">
                <TableHead>
                  <TableRow>
                    <TableCell>Пользователь</TableCell>
                    <TableCell>Роль</TableCell>
                    <TableCell>Статус</TableCell>
                    <TableCell>Email подтвержден</TableCell>
                    <TableCell align="right">Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <UserRow
                      key={user.id}
                      user={user}
                      onEdit={handleEditUser}
                      onDelete={handleDeleteClick}
                      onToggleStatus={handleToggleStatus}
                      getRoleName={getRoleName}
                      getRoleColor={getRoleColor}
                    />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
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
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          Вы действительно хотите удалить этого пользователя? Это действие нельзя будет отменить.
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

export default UsersPage; 