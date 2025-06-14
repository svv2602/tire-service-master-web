import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
// Таблица пользователей обновлена для использования единых адаптивных стилей
// с минимальными закруглениями (2px) и горизонтальными скроллбарами
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
  Avatar,
  FormControlLabel,
  Switch,
  Tooltip,
  useMediaQuery,
  useTheme
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
import type { User, UserFormData } from '../../types/user';
import { useSnackbar } from 'notistack';
import { useDebounce } from '../../hooks/useDebounce';
import { getAdaptiveTableStyles } from '../../styles';

// Импорты UI компонентов
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/TextField';
import { Alert } from '../../components/ui/Alert';
import { Chip } from '../../components/ui/Chip';
import { Pagination } from '../../components/ui/Pagination';
import { Modal } from '../../components/ui/Modal';

// Мемоизированный компонент строки пользователя
const UserRow = React.memo<{
  user: User;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onToggleStatus: (user: User) => void;
  getRoleName: (role: string) => string;
  getRoleColor: (role: string) => 'error' | 'warning' | 'primary' | 'success' | 'default';
  isDeleting: boolean;
  tableStyles: any;
}>(({ user, onEdit, onDelete, onToggleStatus, getRoleName, getRoleColor, isDeleting, tableStyles }) => (
  <TableRow sx={{ ...tableStyles.tableRow, opacity: user.is_active ? 1 : 0.6 }}>
    <TableCell sx={tableStyles.tableCell}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar sx={{ width: 32, height: 32, opacity: user.is_active ? 1 : 0.5 }}>
          <PersonIcon />
        </Avatar>
        <Box>
          <Typography variant="body2" fontWeight="medium" color={user.is_active ? 'text.primary' : 'text.secondary'}>
            {user.first_name} {user.last_name}
            {!user.is_active && <Chip label="Деактивирован" size="small" color="error" sx={{ ml: 1 }} />}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            ID: {user.id}
          </Typography>
        </Box>
      </Box>
    </TableCell>
    <TableCell sx={tableStyles.tableCell}>{user.email}</TableCell>
    <TableCell sx={tableStyles.tableCell}>{user.phone}</TableCell>
    <TableCell sx={tableStyles.tableCell}>
      <Chip
        label={getRoleName(user.role)}
        color={getRoleColor(user.role)}
        size="small"
      />
    </TableCell>
    <TableCell sx={tableStyles.tableCell}>
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
    <TableCell sx={tableStyles.tableCell}>
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
    <TableCell sx={tableStyles.tableCell}>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Tooltip title="Редактировать">
          <IconButton
            onClick={() => onEdit(user.id)}
            size="small"
            color="primary"
            disabled={isDeleting}
          >
            <EditIcon />
          </IconButton>
        </Tooltip>
        {user.is_active ? (
          <Tooltip title="Деактивировать">
            <IconButton
              onClick={() => onDelete(user.id)}
              size="small"
              color="error"
              disabled={isDeleting}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title="Реактивировать">
            <IconButton
              onClick={() => onToggleStatus(user)}
              size="small"
              color="success"
              disabled={isDeleting}
            >
              <CheckIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </TableCell>
  </TableRow>
));

UserRow.displayName = 'UserRow';

export const UsersPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  
  // Получаем адаптивные стили таблицы
  const tableStyles = getAdaptiveTableStyles(theme, isMobile, isTablet);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [showInactive, setShowInactive] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  // Дебаунс для поиска
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Отладочная информация
  React.useEffect(() => {
    const token = localStorage.getItem('tvoya_shina_token');
    console.log('UsersPage: проверка токена в localStorage:', token ? `${token.substring(0, 20)}...` : 'не найден');
    console.log('UsersPage: фильтр showInactive:', showInactive);
    console.log('UsersPage: параметр active для API:', showInactive ? undefined : true);
  }, [showInactive]);

  // Сброс страницы при изменении фильтра
  React.useEffect(() => {
    setPage(1);
  }, [showInactive, debouncedSearchQuery]);

  // API хуки
  const {
    data: usersData,
    isLoading,
    error,
    refetch
  } = useGetUsersQuery({
    page,
    per_page: 25,
    query: debouncedSearchQuery || undefined,
    active: showInactive ? undefined : true
  });

  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [updateUser] = useUpdateUserMutation();

  // Вычисляемые значения
  const users = usersData?.data || [];
  const totalPages = usersData?.pagination?.total_pages || 1;
  const totalItems = usersData?.totalItems || 0;
  
  // Подсчет активных и неактивных пользователей
  const activeUsersCount = users.filter(user => user.is_active).length;
  const inactiveUsersCount = users.filter(user => !user.is_active).length;

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

  const handleEdit = (id: number) => {
    navigate(`/users/${id}/edit`);
  };

  const handleDelete = (id: number) => {
    setUserToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    try {
      await deleteUser(userToDelete.toString()).unwrap();
      enqueueSnackbar('Пользователь успешно деактивирован', { variant: 'success' });
    } catch (error) {
      console.error('Ошибка при деактивации пользователя:', error);
      enqueueSnackbar('Ошибка при деактивации пользователя', { variant: 'error' });
    } finally {
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      const updateData: UserFormData = {
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        middle_name: user.middle_name || '',
        phone: user.phone || '',
        role_id: user.role_id,
        is_active: !user.is_active,
        password: '',
        password_confirmation: ''
      };

      await updateUser({
        id: user.id.toString(),
        data: updateData
      }).unwrap();
      
      const action = user.is_active ? 'деактивирован' : 'активирован';
      enqueueSnackbar(`Пользователь ${action}`, { variant: 'success' });
    } catch (error) {
      console.error('Ошибка при изменении статуса пользователя:', error);
      enqueueSnackbar('Ошибка при изменении статуса пользователя', { variant: 'error' });
    }
  };

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  return (
    <Box>
      {/* Заголовок и кнопка создания */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Управление пользователями
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
          color="primary"
          size="large"
        >
          Создать пользователя
        </Button>
      </Box>

      {/* Поиск и фильтры */}
      <Box sx={{ 
        mb: 3, 
        display: 'flex', 
        gap: 2, 
        alignItems: 'center', 
        flexWrap: 'wrap',
        ...(isMobile && {
          flexDirection: 'column',
          alignItems: 'stretch',
        })
      }}>
        <TextField
          placeholder="Поиск по email, имени, фамилии или номеру телефона..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ 
            maxWidth: isMobile ? '100%' : 400, 
            flexGrow: 1 
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
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography variant="body2">
                Показать деактивированных
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {showInactive ? 'Показаны все пользователи' : 'Показаны только активные'}
              </Typography>
            </Box>
          }
        />
      </Box>

      {/* Статистика */}
      <Box sx={{ mb: 2, display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Найдено пользователей: <strong>{totalItems}</strong>
        </Typography>
        {users.length > 0 && (
          <>
            <Typography variant="body2" color="success.main">
              Активных: <strong>{activeUsersCount}</strong>
            </Typography>
            {inactiveUsersCount > 0 && (
              <Typography variant="body2" color="error.main">
                Деактивированных: <strong>{inactiveUsersCount}</strong>
              </Typography>
            )}
          </>
        )}
        <Typography variant="caption" color="text.secondary">
          {!showInactive && '(только активные)'}
          {showInactive && '(включая деактивированных)'}
        </Typography>
      </Box>

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
          <TableContainer 
            sx={{
              backgroundColor: 'transparent',
              boxShadow: 'none',
              border: 'none'
            }}
          >
            <Table sx={tableStyles.table}>
              <TableHead sx={tableStyles.tableHead}>
                <TableRow>
                  <TableCell sx={tableStyles.tableCell}>Пользователь</TableCell>
                  <TableCell sx={tableStyles.tableCell}>Email</TableCell>
                  <TableCell sx={tableStyles.tableCell}>Телефон</TableCell>
                  <TableCell sx={tableStyles.tableCell}>Роль</TableCell>
                  <TableCell sx={tableStyles.tableCell}>Активен</TableCell>
                  <TableCell sx={tableStyles.tableCell}>Подтверждения</TableCell>
                  <TableCell sx={tableStyles.tableCell}>Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow sx={tableStyles.tableRow}>
                    <TableCell colSpan={7} align="center" sx={tableStyles.tableCell}>
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
                      onDelete={handleDelete}
                      onToggleStatus={handleToggleStatus}
                      getRoleName={getRoleName}
                      getRoleColor={getRoleColor}
                      isDeleting={isDeleting}
                      tableStyles={tableStyles}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Пагинация */}
          {totalPages > 1 && (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              mt: 3
            }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </>
      )}

      {/* Модальное окно подтверждения удаления */}
      <Modal
        open={deleteDialogOpen}
        onClose={!isDeleting ? () => setDeleteDialogOpen(false) : undefined}
        title="Подтверждение деактивации"
        maxWidth={400}
        actions={
          <>
            <Button onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
              Отмена
            </Button>
            <Button
              onClick={handleConfirmDelete}
              color="error"
              variant="contained"
              disabled={isDeleting}
              startIcon={isDeleting ? <CircularProgress size={16} /> : null}
            >
              {isDeleting ? 'Деактивация...' : 'Деактивировать'}
            </Button>
          </>
        }
      >
        <Typography>
          Вы уверены, что хотите деактивировать этого пользователя? Пользователь будет исключен из активных операций, но его данные сохранятся в системе.
        </Typography>
      </Modal>
    </Box>
  );
};

export default UsersPage;