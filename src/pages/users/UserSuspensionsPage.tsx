import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  Tooltip,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  Block as BlockIcon,
  LockOpen as UnblockIcon,
  Info as InfoIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  Business as BusinessIcon,
  Engineering as EngineeringIcon,
  SupervisorAccount as ManagerIcon,
} from '@mui/icons-material';
import { format, isAfter, differenceInDays } from 'date-fns';
import { ru } from 'date-fns/locale';

// API хуки
import { 
  useGetUsersQuery, 
  useSuspendUserMutation, 
  useUnsuspendUserMutation,
  useGetSuspensionInfoQuery,
  type SuspensionInfo 
} from '../../api/users.api';

// Компоненты
import { Pagination } from '../../components/ui/Pagination';
import { LoadingScreen } from '../../components/LoadingScreen';
import { SuspensionModal } from '../../components/ui/SuspensionModal';

// Типы
import type { User } from '../../types/user';

const UserSuspensionsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();

  // Состояние для фильтров и поиска
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(20);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired'>('active');
  const [roleFilter, setRoleFilter] = useState<string>('');

  // Состояние для модальных окон
  const [suspensionModal, setSuspensionModal] = useState<{
    open: boolean;
    user: User | null;
  }>({
    open: false,
    user: null,
  });

  const [detailsDialog, setDetailsDialog] = useState<{
    open: boolean;
    user: User | null;
  }>({
    open: false,
    user: null,
  });

  // API запросы - исправлена логика для получения только заблокированных пользователей
  const {
    data: usersData,
    isLoading: usersLoading,
    refetch: refetchUsers,
  } = useGetUsersQuery({
    page,
    per_page: rowsPerPage,
    search: search || undefined,
    role: roleFilter || undefined,
    is_suspended: true, // Всегда получаем только заблокированных пользователей
  });

  const [unsuspendUser] = useUnsuspendUserMutation();

  // Обработка данных - убираем клиентскую фильтрацию, так как сервер уже отфильтровал
  const users = usersData?.data || [];
  const pagination = usersData?.pagination;

  // Функции для работы со статусами (объявляем до использования в useMemo)
  const getSuspensionStatus = (user: User) => {
    if (!user.is_suspended) return 'none';
    
    if (!user.suspended_until) return 'permanent';
    
    const now = new Date();
    const suspendedUntil = new Date(user.suspended_until);
    
    if (isAfter(now, suspendedUntil)) return 'expired';
    
    const daysRemaining = differenceInDays(suspendedUntil, now);
    if (daysRemaining <= 7) return 'expiring';
    
    return 'active';
  };

  // Дополнительная фильтрация по статусу блокировки (только для UI)
  const filteredUsers = useMemo(() => {
    if (statusFilter === 'all') return users;
    
    return users.filter(user => {
      const status = getSuspensionStatus(user);
      if (statusFilter === 'active') {
        return status === 'active' || status === 'expiring' || status === 'permanent';
      }
      if (statusFilter === 'expired') {
        return status === 'expired';
      }
      return true;
    });
  }, [users, statusFilter]);

  // Функции для работы с иконками ролей
  const getRoleIcon = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return <AdminIcon />;
      case 'partner':
        return <BusinessIcon />;
      case 'operator':
        return <EngineeringIcon />;
      case 'manager':
        return <ManagerIcon />;
      default:
        return <PersonIcon />;
    }
  };

  const getRoleColor = (role: string): 'primary' | 'secondary' | 'success' | 'warning' | 'error' => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'error';
      case 'partner':
        return 'primary';
      case 'operator':
        return 'secondary';
      case 'manager':
        return 'warning';
      default:
        return 'success';
    }
  };

  const getStatusChip = (user: User) => {
    const status = getSuspensionStatus(user);
    
    switch (status) {
      case 'active':
        return (
          <Chip
            size="small"
            label={t('admin.users.suspensions.statusChips.active')}
            color="error"
            variant="filled"
            icon={<BlockIcon />}
          />
        );
      case 'expiring':
        const daysLeft = differenceInDays(new Date(user.suspended_until!), new Date());
        return (
          <Chip
            size="small"
            label={t('admin.users.suspensions.statusChips.expiring', { days: daysLeft })}
            color="warning"
            variant="filled"
            icon={<ScheduleIcon />}
          />
        );
      case 'expired':
        return (
          <Chip
            size="small"
            label={t('admin.users.suspensions.statusChips.expired')}
            color="success"
            variant="outlined"
            icon={<UnblockIcon />}
          />
        );
      case 'permanent':
        return (
          <Chip
            size="small"
            label={t('admin.users.suspensions.statusChips.permanent')}
            color="error"
            variant="filled"
            icon={<BlockIcon />}
          />
        );
      default:
        return null;
    }
  };

  // Обработчики
  const handleUnsuspend = async (user: User) => {
    try {
      await unsuspendUser(user.id).unwrap();
      refetchUsers();
    } catch (error) {
      console.error(t('admin.users.suspensions.errors.unblockError'), error);
    }
  };

  const handleShowDetails = (user: User) => {
    setDetailsDialog({ open: true, user });
  };

  const handleSuspensionModalSuccess = () => {
    refetchUsers();
    setSuspensionModal({ open: false, user: null });
  };

  // Статистика - работаем с отфильтрованными пользователями
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter(user => getSuspensionStatus(user) === 'active').length;
    const expiring = users.filter(user => getSuspensionStatus(user) === 'expiring').length;
    const expired = users.filter(user => getSuspensionStatus(user) === 'expired').length;
    const permanent = users.filter(user => getSuspensionStatus(user) === 'permanent').length;
    
    return { total, active, expiring, expired, permanent };
  }, [users]);

  if (usersLoading) {
    return <LoadingScreen />;
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Заголовок страницы */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              onClick={() => navigate('/admin')}
              sx={{ mr: 1 }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4">
              {t('admin.users.suspensions.title')}
            </Typography>
          </Box>
        </Box>

        {/* Статистика */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography color="textSecondary" gutterBottom>
                  {t('admin.users.suspensions.statistics.total')}
                </Typography>
                <Typography variant="h4">
                  {stats.total}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography color="error" gutterBottom>
                  {t('admin.users.suspensions.statistics.active')}
                </Typography>
                <Typography variant="h4" color="error">
                  {stats.active}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography color="warning.main" gutterBottom>
                  {t('admin.users.suspensions.statistics.expiring')}
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {stats.expiring}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography color="success.main" gutterBottom>
                  {t('admin.users.suspensions.statistics.expired')}
                </Typography>
                <Typography variant="h4" color="success.main">
                  {stats.expired}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography color="textSecondary" gutterBottom>
                  {t('admin.users.suspensions.statistics.permanent')}
                </Typography>
                <Typography variant="h4">
                  {stats.permanent}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Фильтры */}
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder={t('admin.users.suspensions.filters.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
              }}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>{t('admin.users.suspensions.filters.statusLabel')}</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'expired')}
                label={t('admin.users.suspensions.filters.statusLabel')}
              >
                <MenuItem value="all">{t('admin.users.suspensions.filters.statusOptions.all')}</MenuItem>
                <MenuItem value="active">{t('admin.users.suspensions.filters.statusOptions.active')}</MenuItem>
                <MenuItem value="expired">{t('admin.users.suspensions.filters.statusOptions.expired')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>{t('admin.users.suspensions.filters.roleLabel')}</InputLabel>
              <Select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                label={t('admin.users.suspensions.filters.roleLabel')}
              >
                <MenuItem value="">{t('admin.users.suspensions.filters.roleOptions.all')}</MenuItem>
                <MenuItem value="admin">{t('admin.users.suspensions.filters.roleOptions.admin')}</MenuItem>
                <MenuItem value="manager">{t('admin.users.suspensions.filters.roleOptions.manager')}</MenuItem>
                <MenuItem value="partner">{t('admin.users.suspensions.filters.roleOptions.partner')}</MenuItem>
                <MenuItem value="operator">{t('admin.users.suspensions.filters.roleOptions.operator')}</MenuItem>
                <MenuItem value="client">{t('admin.users.suspensions.filters.roleOptions.client')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Таблица заблокированных пользователей */}
      <Paper sx={{ overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('admin.users.suspensions.table.columns.user')}</TableCell>
                <TableCell>{t('admin.users.suspensions.table.columns.role')}</TableCell>
                <TableCell>{t('admin.users.suspensions.table.columns.reason')}</TableCell>
                <TableCell>{t('admin.users.suspensions.table.columns.suspendedAt')}</TableCell>
                <TableCell>{t('admin.users.suspensions.table.columns.suspendedUntil')}</TableCell>
                <TableCell>{t('admin.users.suspensions.table.columns.suspendedBy')}</TableCell>
                <TableCell>{t('admin.users.suspensions.table.columns.status')}</TableCell>
                <TableCell align="center">{t('admin.users.suspensions.table.columns.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="textSecondary">
                      {search || roleFilter 
                        ? t('admin.users.suspensions.table.emptyStates.notFound') 
                        : t('admin.users.suspensions.table.emptyStates.noSuspended')}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {search || roleFilter 
                        ? t('admin.users.suspensions.table.emptyStates.trySearch')
                        : t('admin.users.suspensions.table.emptyStates.allActive')}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {user.full_name || `${user.first_name} ${user.last_name}`}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {user.email}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={user.role || t('admin.users.suspensions.table.defaultValues.unknownRole')}
                        color={getRoleColor(user.role || '')}
                        variant="outlined"
                        icon={getRoleIcon(user.role || '')}
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title={user.suspension_reason || t('admin.users.suspensions.table.defaultValues.noReason')}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            maxWidth: 150, 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {user.suspension_reason || t('admin.users.suspensions.table.defaultValues.noReason')}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {user.suspended_at 
                          ? format(new Date(user.suspended_at), 'dd.MM.yyyy HH:mm', { locale: ru })
                          : t('admin.users.suspensions.table.defaultValues.unknownDate')
                        }
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {user.suspended_until 
                          ? format(new Date(user.suspended_until), 'dd.MM.yyyy HH:mm', { locale: ru })
                          : t('admin.users.suspensions.table.defaultValues.permanent')
                        }
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {user.suspended_by_name || t('admin.users.suspensions.table.defaultValues.unknownModerator')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {getStatusChip(user)}
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title={t('admin.users.suspensions.actions.showDetails')}>
                          <IconButton
                            size="small"
                            onClick={() => handleShowDetails(user)}
                            color="info"
                          >
                            <InfoIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t('admin.users.suspensions.actions.unblock')}>
                          <IconButton
                            size="small"
                            onClick={() => handleUnsuspend(user)}
                            color="success"
                          >
                            <UnblockIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t('admin.users.suspensions.actions.modifySuspension')}>
                          <IconButton
                            size="small"
                            onClick={() => setSuspensionModal({ open: true, user })}
                            color="warning"
                          >
                            <ScheduleIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Пагинация - исправлена логика, учитывается что может не быть записей */}
      {pagination && pagination.total_pages > 1 && filteredUsers.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={pagination.total_pages}
            page={pagination.current_page}
            onChange={(newPage) => setPage(newPage)}
            disabled={usersLoading}
          />
        </Box>
      )}

      {/* Модальное окно блокировки/изменения блокировки */}
      <SuspensionModal
        open={suspensionModal.open}
        onClose={() => setSuspensionModal({ open: false, user: null })}
        user={suspensionModal.user}
        onSuccess={handleSuspensionModalSuccess}
      />

      {/* Диалог с подробностями блокировки */}
      <Dialog
        open={detailsDialog.open}
        onClose={() => setDetailsDialog({ open: false, user: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {t('admin.users.suspensions.detailsDialog.title')}
        </DialogTitle>
        <DialogContent>
          {detailsDialog.user && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {detailsDialog.user.full_name || `${detailsDialog.user.first_name} ${detailsDialog.user.last_name}`}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                {detailsDialog.user.email}
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>{t('admin.users.suspensions.detailsDialog.fields.reason')}</strong> {detailsDialog.user.suspension_reason || t('admin.users.suspensions.table.defaultValues.noReason')}
                </Typography>
                <Typography variant="body2">
                  <strong>{t('admin.users.suspensions.detailsDialog.fields.suspendedAt')}</strong> {
                    detailsDialog.user.suspended_at 
                      ? format(new Date(detailsDialog.user.suspended_at), 'dd.MM.yyyy HH:mm', { locale: ru })
                      : t('admin.users.suspensions.table.defaultValues.unknownDate')
                  }
                </Typography>
                <Typography variant="body2">
                  <strong>{t('admin.users.suspensions.detailsDialog.fields.suspendedUntil')}</strong> {
                    detailsDialog.user.suspended_until 
                      ? format(new Date(detailsDialog.user.suspended_until), 'dd.MM.yyyy HH:mm', { locale: ru })
                      : t('admin.users.suspensions.table.defaultValues.permanent')
                  }
                </Typography>
                <Typography variant="body2">
                  <strong>{t('admin.users.suspensions.detailsDialog.fields.suspendedBy')}</strong> {detailsDialog.user.suspended_by_name || t('admin.users.suspensions.table.defaultValues.unknownModerator')}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialog({ open: false, user: null })}>
            {t('admin.users.suspensions.detailsDialog.actions.close')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserSuspensionsPage; 