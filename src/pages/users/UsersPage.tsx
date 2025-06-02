import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
  Avatar,
  FormControlLabel,
  Switch,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Person as PersonIcon,
  Check as CheckIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import {
  useGetUsersQuery,
  useDeleteUserMutation,
  useUpdateUserMutation
} from '../../api/users.api';
import { getRoleId } from '../../utils/roles.utils';
import type { User } from '../../types/user';
import { useSnackbar } from 'notistack';
import { useDebounce } from '../../hooks/useDebounce';

// Мемоизированный компонент строки пользователя
const UserRow = React.memo<{
  user: User;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (user: User) => void;
  getRoleName: (role: string) => string;
  getRoleColor: (role: string) => 'error' | 'warning' | 'primary' | 'success' | 'default';
}>(({ user, onEdit, onDelete, onToggleStatus, getRoleName, getRoleColor }) => (
  <TableRow>
    <TableCell>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar sx={{ width: 32, height: 32 }}>
          <PersonIcon />
        </Avatar>
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {user.first_name} {user.last_name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            ID: {user.id}
          </Typography>
        </Box>
      </Box>
    </TableCell>
    <TableCell>{user.email}</TableCell>
    <TableCell>{user.phone}</TableCell>
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
        label=""
        sx={{ m: 0 }}
      />
    </TableCell>
    <TableCell>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {user.email_verified ? (
          <Tooltip title="Email подтвержден">
            <CheckIcon color="success" fontSize="small" />
          </Tooltip>
        ) : (
          <Tooltip title="Email не подтвержден">
            <CloseIcon color="error" fontSize="small" />
          </Tooltip>
        )}
        {user.phone_verified ? (
          <Tooltip title="Телефон подтвержден">
            <CheckIcon color="success" fontSize="small" />
          </Tooltip>
        ) : (
          <Tooltip title="Телефон не подтвержден">
            <CloseIcon color="error" fontSize="small" />
          </Tooltip>
        )}
      </Box>
    </TableCell>
    <TableCell>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Tooltip title="Редактировать">
          <IconButton
            onClick={() => onEdit(user.id)}
            size="small"
            color="primary"
          >
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Удалить">
          <IconButton
            onClick={() => onDelete(user.id)}
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

export const UsersPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const { enqueueSnackbar } = useSnackbar();

  // Дебаунс для поиска
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Отладочная информация
  React.useEffect(() => {
    const token = localStorage.getItem('tvoya_shina_token');
    console.log('UsersPage: проверка токена в localStorage:', token ? `${token.substring(0, 20)}...` : 'не найден');
  }, []);

  // API хуки
  const {
    data: usersData,
    isLoading,
    error,
    refetch
  } = useGetUsersQuery({
    page,
    per_page: 25,
    query: debouncedSearchQuery || undefined
  });

  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [updateUser] = useUpdateUserMutation();

  // Вычисляемые значения
  const users = usersData?.data || [];
  const totalPages = usersData?.pagination?.total_pages || 1;
  const totalItems = usersData?.totalItems || 0;

  // Мемоизированные вспомогательные функции
  const getRoleName = useCallback((role: string): string => {    
    switch(role) {
      case 'admin': return 'Администратор';
      case 'manager': return 'Менеджер';
      case 'partner': return 'Партнер';
      case 'operator': return 'Оператор';
      case 'client': return 'Клиент';
      default: return 'Неизвестно';
    }
  }, []);
  
  const getRoleColor = useCallback((role: string): 'error' | 'warning' | 'primary' | 'success' | 'default' => {
    switch(role) {
      case 'admin': return 'error';
      case 'manager': return 'warning';
      case 'partner': return 'primary';
      case 'operator': return 'success';
      case 'client': return 'default';
      default: return 'default';
    }
  }, []);

  // Обработчики событий
  const handleCreate = useCallback(() => {
    navigate('/users/new');
  }, [navigate]);

  const handleEdit = useCallback((id: string) => {
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
        enqueueSnackbar('Пользователь успешно удален', { variant: 'success' });
        await refetch();
      } catch (error: any) {
        console.error('Ошибка при удалении пользователя:', error);
        
        let errorMessage = 'Ошибка при удалении пользователя';
        
        if (error.status === 403) {
          errorMessage = 'У вас нет прав для удаления этого пользователя';
        } else if (error.status === 404) {
          errorMessage = 'Пользователь не найден';
        } else if (error.status === 422) {
          errorMessage = 'Невозможно удалить пользователя. Возможно, это ваш собственный аккаунт';
        } else if (error.data?.message) {
          errorMessage = error.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        enqueueSnackbar(errorMessage, { variant: 'error' });
      }
    }
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  }, [userToDelete, deleteUser, refetch, enqueueSnackbar]);

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
        middle_name: user.middle_name || '',
        phone: user.phone || '',
        role_id: user.role_id,
        is_active: !user.is_active
      };

      await updateUser({
        id: user.id.toString(),
        data: updateData
      }).unwrap();
      
      enqueueSnackbar('Статус пользователя успешно обновлен', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Ошибка при обновлении статуса пользователя', { variant: 'error' });
      console.error('Ошибка при обновлении статуса:', error);
    }
  }, [updateUser, enqueueSnackbar]);

  return (
    <Box>
      {/* Заголовок и кнопка создания */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Пользователи
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
        >
          Создать пользователя
        </Button>
      </Box>

      {/* Поиск */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Поиск по email, имени или фамилии..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 400 }}
        />
      </Box>

      {/* Статистика */}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Найдено пользователей: {totalItems}
      </Typography>

      {/* Контент */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 2 }}>
          Ошибка при загрузке пользователей: {error.toString()}
        </Alert>
      ) : (
        <>
          {/* Таблица пользователей */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Пользователь</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Телефон</TableCell>
                  <TableCell>Роль</TableCell>
                  <TableCell>Активен</TableCell>
                  <TableCell>Подтверждения</TableCell>
                  <TableCell>Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography color="text.secondary">
                        Пользователи не найдены
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <UserRow
                      key={user.id}
                      user={user}
                      onEdit={handleEdit}
                      onDelete={handleDeleteClick}
                      onToggleStatus={handleToggleStatus}
                      getRoleName={getRoleName}
                      getRoleColor={getRoleColor}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Пагинация */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(event, value) => setPage(value)}
                color="primary"
              />
            </Box>
          )}
        </>
      )}

      {/* Диалог подтверждения удаления */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить этого пользователя? Это действие нельзя отменить.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>
            Отмена
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={isDeleting}
          >
            {isDeleting ? 'Удаление...' : 'Удалить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UsersPage;