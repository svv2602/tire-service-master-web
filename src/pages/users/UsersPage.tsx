/**
 * Страница управления пользователями (PageTable версия)
 * 
 * Функциональность:
 * - Отображение списка пользователей с помощью PageTable
 * - Поиск по email, имени, фамилии, телефону
 * - Фильтрация активных/неактивных пользователей
 * - Пагинация результатов
 * - Редактирование и деактивация пользователей
 * - Отображение ролей с цветовой индикацией
 * - Подтверждения email и телефона
 * - Унифицированный UI с остальными страницами
 */

import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import {
  Box,
  Typography,
  Avatar,
  Tooltip,
  useTheme
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Person as PersonIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  RestoreFromTrash as RestoreIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import {
  useGetUsersQuery,
  useDeleteUserMutation,
  useUpdateUserMutation
} from '../../api/users.api';
import type { User, UserFormData } from '../../types/user';
import { useDebounce } from '../../hooks/useDebounce';

// Импорты UI компонентов
import {
  Alert,
  Chip,
  ActionsMenu,
} from '../../components/ui';
import type { ActionItem } from '../../components/ui';

// Импорт PageTable компонента
import { PageTable } from '../../components/common/PageTable';
import type { 
  PageHeaderConfig, 
  SearchConfig, 
  FilterConfig,
  ActionConfig
} from '../../components/common/PageTable';
import type { Column } from '../../components/ui/Table/Table';
import Notification from '../../components/Notification';

export const UsersPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { t } = useTranslation();
  
  // Redux state
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [showInactive, setShowInactive] = useState(false);
  
  // Состояние для уведомлений
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  // Дебаунс для поиска
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Сброс страницы при изменении фильтра
  React.useEffect(() => {
    setPage(1);
  }, [showInactive, debouncedSearchQuery]);

  // API хуки
  const {
    data: usersData,
    isLoading,
    error
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
      case 'admin': return t('forms.user.roles.admin');
      case 'manager': return t('forms.user.roles.manager');
      case 'partner': return t('forms.user.roles.partner');
      case 'operator': return t('forms.user.roles.operator');
      case 'client': return t('forms.user.roles.client');
      default: return t('common.unknown');
    }
  }, [t]);
  
  const getRoleColor = useCallback((role: string): 'error' | 'warning' | 'primary' | 'success' | 'info' => {
    switch(role) {
      case 'admin': return 'error';      // Красный - высший уровень доступа
      case 'manager': return 'warning';  // Оранжевый - управленческая роль
      case 'partner': return 'success';  // Зеленый - партнерская роль (важная бизнес-роль)
      case 'operator': return 'primary'; // Синий - операционная роль
      case 'client': return 'info';      // Голубой - клиентская роль
      default: return 'info';
    }
  }, []);

  // Функция для получения инициалов пользователя
  const getUserInitials = useCallback((user: User): string => {
    if (user.first_name && user.last_name) {
      return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();
    }
    if (user.first_name) {
      return user.first_name.charAt(0).toUpperCase();
    }
    if (user.last_name) {
      return user.last_name.charAt(0).toUpperCase();
    }
    // Локализованный инициал для пользователя без имени/фамилии
    return t('admin.users.initials.default');
  }, [t]);

  // Обработчики событий
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleEdit = useCallback((user: User) => {
    navigate(`/admin/users/${user.id}/edit`);
  }, [navigate]);

  const handleDeactivate = useCallback(async (user: User) => {
    try {
      await deleteUser(user.id.toString()).unwrap();
      setNotification({
        open: true,
        message: t('notifications.success.deactivated'),
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deactivating user:', error);
      setNotification({
        open: true,
        message: t('notifications.error.deletingFailed'),
        severity: 'error'
      });
    }
  }, [deleteUser]);

  const handleToggleStatus = useCallback(async (user: User) => {
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

      setNotification({
        open: true,
        message: user.is_active ? t('notifications.success.deactivated') : t('notifications.success.activated'),
        severity: 'success'
      });
    } catch (error) {
      console.error('Error changing user status:', error);
      setNotification({
        open: true,
        message: t('notifications.error.savingFailed'),
        severity: 'error'
      });
    }
  }, [updateUser]);

  const handleCloseNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, open: false }));
  }, []);

  // Конфигурация заголовка
  const headerConfig: PageHeaderConfig = useMemo(() => ({
    title: t('admin.users.userManagement'),
    actions: [
      {
        id: 'create-user',
        label: t('admin.users.createUser'),
        icon: <AddIcon />,
        onClick: () => navigate('/admin/users/new'),
        variant: 'contained',
      }
    ]
  }), [navigate, t]);

  // Конфигурация поиска
  const searchConfig: SearchConfig = useMemo(() => ({
    placeholder: t('admin.users.searchPlaceholder'),
    value: searchQuery,
    onChange: handleSearchChange,
  }), [searchQuery, handleSearchChange, t]);

  // Конфигурация фильтров
  const filtersConfig: FilterConfig[] = useMemo(() => [
    {
      id: 'show_inactive',
      label: t('admin.users.userStatus'),
      type: 'select',
      value: showInactive ? 'all' : 'active',
      options: [
        { value: 'active', label: t('admin.users.onlyActive') },
        { value: 'all', label: t('admin.users.allUsers') }
      ],
      onChange: (value: string) => setShowInactive(value === 'all'),
    }
  ], [showInactive, t]);

  // Конфигурация действий для ActionsMenu
  const userActions: ActionItem<User>[] = useMemo(() => [
    {
      id: 'view',
      label: t('admin.users.view'),
      icon: <VisibilityIcon />,
      onClick: (user: User) => navigate(`/admin/users/${user.id}`),
      color: 'info',
      tooltip: t('admin.users.viewTooltip')
    },
    {
      id: 'edit',
      label: t('tables.actions.edit'),
      icon: <EditIcon />,
      onClick: (user: User) => handleEdit(user),
      color: 'primary',
      tooltip: t('admin.users.editTooltip')
    },
    {
      id: 'toggle-status',
      label: (user: User) => user.is_active ? t('admin.users.deactivate') : t('admin.users.activate'),
      icon: (user: User) => user.is_active ? <DeleteIcon /> : <RestoreIcon />,
      onClick: (user: User) => user.is_active ? handleDeactivate(user) : handleToggleStatus(user),
      color: (user: User) => user.is_active ? 'error' : 'success',
      tooltip: (user: User) => user.is_active ? t('admin.users.deactivateTooltip') : t('admin.users.activateTooltip'),
      requireConfirmation: true,
      confirmationConfig: {
        title: t('admin.users.confirmStatusChange'),
        message: t('admin.users.confirmStatusMessage'),
        confirmLabel: t('common.confirm'),
        cancelLabel: t('common.cancel')
      }
    }
  ], [handleEdit, handleDeactivate, handleToggleStatus, navigate, t]);

  // Конфигурация колонок
  const columns: Column[] = useMemo(() => [
    {
      id: 'user',
      label: t('tables.columns.user'),
      wrap: true,
      minWidth: 200,
      format: (_value: any, row: User) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ 
            bgcolor: 'primary.main',
            opacity: row.is_active ? 1 : 0.5 
          }}>
            {getUserInitials(row)}
          </Avatar>
          <Box>
            <Typography 
              variant="body2" 
              fontWeight="medium" 
              color={row.is_active ? 'text.primary' : 'text.secondary'}
              sx={{ wordBreak: 'break-word' }}
            >
              {row.first_name} {row.last_name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ID: {row.id}
            </Typography>
            {!row.is_active && (
              <Chip label={t('admin.users.deactivated')} size="small" color="error" sx={{ ml: 1 }} />
            )}
          </Box>
        </Box>
      )
    },
    {
      id: 'email',
      label: t('tables.columns.email'),
      wrap: true,
      hideOnMobile: true,
      format: (_value: any, row: User) => (
        <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
          {row.email}
        </Typography>
      )
    },
    {
      id: 'phone',
      label: t('tables.columns.phone'),
      wrap: true,
      hideOnMobile: true,
      format: (_value: any, row: User) => (
        <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
          {row.phone || t('admin.users.notSpecified')}
        </Typography>
      )
    },
    {
      id: 'role',
      label: t('tables.columns.role'),
      align: 'center',
      format: (_value: any, row: User) => (
        <Chip
          label={getRoleName(row.role)}
          color={getRoleColor(row.role)}
          size="medium"
          sx={{
            fontWeight: 600,
            fontSize: '0.875rem',
            minWidth: 100,
            '& .MuiChip-label': {
              padding: '6px 12px',
            }
          }}
        />
      )
    },
    {
      id: 'status',
      label: t('tables.columns.status'),
      align: 'center',
      format: (_value: any, row: User) => (
        <Chip
          label={row.is_active ? t('admin.users.active') : t('admin.users.deactivated')}
          color={row.is_active ? 'success' : 'error'}
          size="small"
        />
      )
    },
    {
      id: 'verifications',
      label: t('admin.users.verifications'),
      align: 'center',
      hideOnMobile: true,
      format: (_value: any, row: User) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
          {row.email_verified ? (
            <Tooltip title={t('admin.users.emailVerified')}>
              <CheckIcon color="success" fontSize="small" />
            </Tooltip>
          ) : (
            <Tooltip title={t('admin.users.emailNotVerified')}>
              <CloseIcon color="error" fontSize="small" />
            </Tooltip>
          )}
          {row.phone_verified ? (
            <Tooltip title={t('admin.users.phoneVerified')}>
              <CheckIcon color="success" fontSize="small" />
            </Tooltip>
          ) : (
            <Tooltip title={t('admin.users.phoneNotVerified')}>
              <CloseIcon color="error" fontSize="small" />
            </Tooltip>
          )}
        </Box>
      )
    },
    {
      id: 'actions',
      label: t('tables.columns.actions'),
      align: 'center',
      minWidth: 120,
      format: (_value: any, row: User) => (
        <ActionsMenu actions={userActions} item={row} menuThreshold={1} />
      )
    }
  ], [getRoleName, getRoleColor, getUserInitials, userActions, t]);

  // Конфигурация пагинации
  const paginationConfig = useMemo(() => ({
    page: page,
    rowsPerPage: 25,
    totalItems: totalItems,
    onPageChange: handlePageChange,
  }), [page, totalItems, handlePageChange]);

  // Отображение ошибки загрузки
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {t('notifications.error.loadingFailed')}: {error.toString()}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Статистика */}
      {users.length > 0 && (
        <Box sx={{ mb: 2, display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Локализованная строка с количеством пользователей */}
          <Typography variant="body2" color="text.secondary">
            {t('admin.users.stats.foundUsers', { count: totalItems })}
          </Typography>
          <Typography variant="body2" color="success.main">
            {t('admin.users.stats.activeUsers', { count: activeUsersCount })}
          </Typography>
          {inactiveUsersCount > 0 && (
            <Typography variant="body2" color="error.main">
              {t('admin.users.stats.deactivatedUsers', { count: inactiveUsersCount })}
            </Typography>
          )}
          <Typography variant="caption" color="text.secondary">
            {!showInactive ? t('admin.users.stats.onlyActive') : t('admin.users.stats.withDeactivated')}
          </Typography>
        </Box>
      )}

      {/* PageTable */}
      <PageTable<User>
        header={headerConfig}
        search={searchConfig}
        filters={filtersConfig}
        columns={columns}
        rows={users}
        loading={isLoading}
        pagination={paginationConfig}
        responsive={true}
        empty={
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              {searchQuery ? t('admin.users.usersNotFound') : t('admin.users.noUsers')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {searchQuery ? t('admin.users.changeSearchCriteria') : t('admin.users.createFirstUser')}
            </Typography>
          </Box>
        }
      />

      {/* Notification */}
      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={handleCloseNotification}
      />
    </Box>
  );
};

export default UsersPage; 