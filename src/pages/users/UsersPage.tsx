import React, { useState } from 'react';
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
import { User } from '../../types/user';
import { useSnackbar } from 'notistack';

const UsersPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const { enqueueSnackbar } = useSnackbar();

  const { 
    data: usersData,
    isLoading,
    error,
    refetch
  } = useGetUsersQuery({
    page: page.toString(),
    per_page: pageSize.toString(),
    query: searchQuery || undefined,
  });

  const [deleteUser] = useDeleteUserMutation();
  const [updateUser] = useUpdateUserMutation();

  const users = (usersData?.users || []) as User[];
  const totalItems = usersData?.totalItems || 0;

  const handleSearch = () => {
    setPage(1);
    refetch();
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

  const handleAddUser = () => {
    navigate('/users/create');
  };

  const handleEditUser = (id: string) => {
    navigate(`/users/${id}/edit`);
  };

  const handleDeleteClick = (id: string) => {
    setUserToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
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
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const handleToggleStatus = async (user: User) => {
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
        id: user.id,
        data: updateData
      }).unwrap();
      enqueueSnackbar('Статус пользователя успешно обновлен', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Ошибка при обновлении статуса пользователя', { variant: 'error' });
    }
  };

  // Вспомогательные функции для отображения роли
  const getRoleName = (role?: string): string => {
    if (!role) return 'Неизвестно';
    
    switch(role) {
      case 'admin': return 'Администратор';
      case 'manager': return 'Менеджер';
      case 'operator': return 'Оператор';
      case 'client': return 'Клиент';
      default: return role;
    }
  };
  
  const getRoleColor = (role?: string): 'error' | 'warning' | 'primary' | 'success' | 'default' => {
    if (!role) return 'default';
    
    switch(role) {
      case 'admin': return 'error';
      case 'manager': return 'warning';
      case 'operator': return 'primary';
      case 'client': return 'success';
      default: return 'default';
    }
  };

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
                    <TableCell>ID</TableCell>
                    <TableCell>Имя</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Телефон</TableCell>
                    <TableCell>Роль</TableCell>
                    <TableCell>Статус</TableCell>
                    <TableCell>Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow
                      key={user.id}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        {user.id}
                      </TableCell>
                      <TableCell>{user.first_name} {user.last_name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone || '-'}</TableCell>
                      <TableCell>
                        <Chip 
                          label={getRoleName(user.role)}
                          color={getRoleColor(user.role)} 
                          size="small" 
                          icon={<PersonIcon />}
                        />
                      </TableCell>
                      <TableCell>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={user.is_active === true}
                              onChange={() => handleToggleStatus(user)}
                              color="primary"
                            />
                          }
                          label={user.is_active === true ? "Активен" : "Неактивен"}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            onClick={() => handleEditUser(user.id)}
                            startIcon={<EditIcon />}
                            variant="outlined"
                            color="primary"
                          >
                            Ред.
                          </Button>
                          <Button
                            size="small"
                            onClick={() => handleDeleteClick(user.id)}
                            startIcon={<DeleteIcon />}
                            variant="outlined"
                            color="error"
                            disabled={user.role === 'admin'} // Не даем удалять админов
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