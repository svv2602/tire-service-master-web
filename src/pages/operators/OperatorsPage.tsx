import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Avatar,
  useTheme,
  Button,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  FilterList as FilterIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

// API хуки
import {
  useGetOperatorsQuery,
  useDeleteOperatorMutation,
  useUpdateOperatorMutation,
} from '../../api/operators.api';
import { useGetServicePointsQuery } from '../../api/servicePoints.api';

// Типы
import type { Operator } from '../../types/operator';

// UI компоненты
import { PageTable } from '../../components/common/PageTable';
import type { Column, FilterConfig } from '../../components/common/PageTable';
import { ActionsMenu, Alert, Notification } from '../../components/ui';
import type { ActionItem } from '../../components/ui';
import { OperatorAssignmentModal } from '../../components/ui/OperatorAssignmentModal';

// Хуки и утилиты
import { useDebounce } from '../../hooks/useDebounce';
import { useUserRole } from '../../hooks/useUserRole';
import { useNotification } from '../../hooks/useNotification';
import { getTablePageStyles } from '../../styles';

// Интерфейсы для фильтров
interface OperatorFilters {
  search: string;
  is_active: string;
  partner_id: string;
  has_assignments: string;
  service_point_ids: string;
}

const OperatorsPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const permissions = useUserRole();
  const { showSuccess, showError, showWarning } = useNotification();
  const tablePageStyles = getTablePageStyles(theme);

  // Состояние
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [filters, setFilters] = useState<OperatorFilters>({
    search: '',
    is_active: '',
    partner_id: '',
    has_assignments: '',
    service_point_ids: '',
  });
  
  // Модальные окна
  const [assignmentModal, setAssignmentModal] = useState<{
    open: boolean;
    operator: Operator | null;
  }>({
    open: false,
    operator: null,
  });

  // Debounced поиск
  const debouncedSearch = useDebounce(filters.search, 300);

  // API запросы
  const queryParams = useMemo(() => {
    const params: any = {
      page: page + 1,
      per_page: rowsPerPage,
    };

    if (debouncedSearch) params.search = debouncedSearch;
    if (filters.is_active) params.is_active = filters.is_active === 'true';
    if (filters.partner_id) params.partner_id = filters.partner_id;
    if (filters.has_assignments) params.has_assignments = filters.has_assignments === 'true';
    if (filters.service_point_ids) params.service_point_ids = filters.service_point_ids;

    // Автоматическая фильтрация для партнеров
    if (permissions.isPartner && permissions.partnerId) {
      params.partner_id = permissions.partnerId;
    }

    return params;
  }, [page, rowsPerPage, debouncedSearch, filters, permissions]);

  const {
    data: operatorsData,
    isLoading: operatorsLoading,
    error: operatorsError,
    refetch: refetchOperators,
  } = useGetOperatorsQuery(queryParams);

  const { data: servicePointsData } = useGetServicePointsQuery({});

  // Мутации
  const [deleteOperator] = useDeleteOperatorMutation();
  const [updateOperator] = useUpdateOperatorMutation();

  // Обработка данных
  const operators = operatorsData?.data || [];
  const totalCount = operatorsData?.meta?.total || 0;

  const servicePointsMap = useMemo(() => {
    if (!servicePointsData?.data) return {};
    return servicePointsData.data.reduce((acc, point) => {
      acc[point.id] = point;
      return acc;
    }, {} as Record<number, any>);
  }, [servicePointsData]);

  // Конфигурация колонок
  const columns: Column<Operator>[] = [
    {
      id: 'operator_info',
      label: 'Оператор',
      sortable: false,
      render: (operator) => (
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            <PersonIcon />
          </Avatar>
          <Box>
            <Typography variant="subtitle2" fontWeight="bold">
              {operator.user?.full_name || `${operator.user?.first_name} ${operator.user?.last_name}`}
            </Typography>
            <Box display="flex" alignItems="center" gap={1} mt={0.5}>
              <EmailIcon fontSize="small" color="action" />
              <Typography variant="caption" color="text.secondary">
                {operator.user?.email}
              </Typography>
            </Box>
            {operator.user?.phone && (
              <Box display="flex" alignItems="center" gap={1}>
                <PhoneIcon fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary">
                  {operator.user?.phone}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      ),
    },
    {
      id: 'partner',
      label: 'Партнер',
      sortable: true,
      hideOnMobile: true,
      render: (operator) => (
        <Typography variant="body2">
          {operator.partner_name || 'Не указан'}
        </Typography>
      ),
    },
    {
      id: 'service_points',
      label: 'Сервисные точки',
      sortable: false,
      render: (operator) => {
        const assignedPoints = operator.service_point_ids || [];
        
        if (assignedPoints.length === 0) {
          return (
            <Chip 
              label="Не назначен" 
              size="small" 
              variant="outlined" 
              color="default"
            />
          );
        }

        if (assignedPoints.length === 1) {
          const point = servicePointsMap[assignedPoints[0]];
          return (
            <Tooltip title={point?.address || ''}>
              <Chip 
                label={point?.name || `Точка #${assignedPoints[0]}`}
                size="small" 
                color="primary"
                icon={<LocationIcon />}
                onClick={() => handleServicePointClick(assignedPoints[0])}
                sx={{ cursor: 'pointer' }}
              />
            </Tooltip>
          );
        }

        return (
          <Box display="flex" gap={0.5} flexWrap="wrap">
            <Chip 
              label={`${assignedPoints.length} точек`}
              size="small" 
              color="primary"
              icon={<LocationIcon />}
              onClick={() => handleOpenAssignmentModal(operator)}
              sx={{ cursor: 'pointer' }}
            />
          </Box>
        );
      },
    },
    {
      id: 'access_level',
      label: 'Уровень доступа',
      sortable: true,
      hideOnMobile: true,
      render: (operator) => (
        <Chip 
          label={`Уровень ${operator.access_level}`}
          size="small"
          color={operator.access_level >= 3 ? 'success' : 'default'}
        />
      ),
    },
    {
      id: 'status',
      label: 'Статус',
      sortable: true,
      render: (operator) => (
        <Chip 
          label={operator.is_active ? 'Активен' : 'Неактивен'}
          size="small"
          color={operator.is_active ? 'success' : 'error'}
        />
      ),
    },
    {
      id: 'created_at',
      label: 'Дата создания',
      sortable: true,
      hideOnMobile: true,
      render: (operator) => (
        <Typography variant="body2">
          {new Date(operator.created_at).toLocaleDateString('ru-RU')}
        </Typography>
      ),
    },
  ];

  // Конфигурация фильтров
  const filterConfigs: FilterConfig[] = [
    {
      key: 'search',
      type: 'text',
      label: 'Поиск по имени, email, телефону',
      placeholder: 'Введите для поиска...',
    },
    {
      key: 'is_active',
      type: 'select',
      label: 'Статус',
      options: [
        { value: '', label: 'Все' },
        { value: 'true', label: 'Активные' },
        { value: 'false', label: 'Неактивные' },
      ],
    },
    {
      key: 'has_assignments',
      type: 'select',
      label: 'Назначения',
      options: [
        { value: '', label: 'Все' },
        { value: 'true', label: 'С назначениями' },
        { value: 'false', label: 'Без назначений' },
      ],
    },
  ];

  // Если пользователь - админ или менеджер, добавляем фильтр по партнерам
  if (permissions.isAdmin || permissions.isManager) {
    filterConfigs.push({
      key: 'partner_id',
      type: 'select',
      label: 'Партнер',
      options: [
        { value: '', label: 'Все партнеры' },
        // TODO: Загрузить список партнеров
      ],
    });
  }

  // Действия для операторов
  const getOperatorActions = useCallback((operator: Operator): ActionItem[] => {
    const actions: ActionItem[] = [];

    // Управление назначениями
    actions.push({
      id: 'manage-assignments',
      label: 'Управление назначениями',
      icon: <AssignmentIcon />,
      onClick: () => handleOpenAssignmentModal(operator),
      color: 'primary',
    });

    // Редактирование (для админов, менеджеров и партнеров)
    if (permissions.canManageOperators) {
      actions.push({
        id: 'edit',
        label: 'Редактировать',
        icon: <EditIcon />,
        onClick: () => handleEditOperator(operator),
        color: 'primary',
      });
    }

    // Удаление/деактивация (только для админов и менеджеров)
    if (permissions.isAdmin || permissions.isManager) {
      actions.push({
        id: 'delete',
        label: operator.is_active ? 'Деактивировать' : 'Удалить',
        icon: <DeleteIcon />,
        onClick: () => handleDeleteOperator(operator),
        color: 'error',
        requiresConfirmation: true,
        confirmationText: `Вы уверены, что хотите ${operator.is_active ? 'деактивировать' : 'удалить'} оператора ${operator.user?.full_name}?`,
      });
    }

    return actions;
  }, [permissions]);

  // Обработчики событий
  const handleOpenAssignmentModal = (operator: Operator) => {
    setAssignmentModal({
      open: true,
      operator,
    });
  };

  const handleCloseAssignmentModal = () => {
    setAssignmentModal({
      open: false,
      operator: null,
    });
  };

  const handleAssignmentSuccess = () => {
    refetchOperators();
    showSuccess('Назначения успешно обновлены');
  };

  const handleServicePointClick = (servicePointId: number) => {
    // Переход на страницу сервисной точки или открытие модального окна
    navigate(`/admin/service-points/${servicePointId}`);
  };

  const handleEditOperator = (operator: Operator) => {
    // Переход на страницу редактирования оператора
    navigate(`/admin/operators/${operator.id}/edit`);
  };

  const handleDeleteOperator = async (operator: Operator) => {
    try {
      if (operator.is_active) {
        // Деактивация
        await updateOperator({
          id: operator.id,
          is_active: false,
        }).unwrap();
        showSuccess('Оператор деактивирован');
      } else {
        // Удаление
        await deleteOperator(operator.id).unwrap();
        showSuccess('Оператор удален');
      }
      refetchOperators();
    } catch (error: any) {
      showError(`Ошибка: ${error.message}`);
    }
  };

  const handleCreateOperator = () => {
    navigate('/admin/operators/new');
  };

  const handleFilterChange = useCallback((newFilters: Partial<OperatorFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(0); // Сброс на первую страницу при изменении фильтров
  }, []);

  // Конфигурация заголовка
  const headerConfig = {
    title: 'Управление операторами',
    subtitle: `Всего операторов: ${totalCount}`,
    actions: permissions.canManageOperators ? [
      {
        label: 'Добавить оператора',
        onClick: handleCreateOperator,
        variant: 'contained' as const,
        color: 'primary' as const,
        startIcon: <AddIcon />,
      },
    ] : [],
  };

  return (
    <Box sx={tablePageStyles.pageContainer}>
      <PageTable
        // Данные
        data={operators}
        columns={columns}
        totalCount={totalCount}
        loading={operatorsLoading}
        error={operatorsError ? 'Ошибка загрузки операторов' : undefined}

        // Пагинация
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}

        // Фильтрация
        filters={filters}
        filterConfigs={filterConfigs}
        onFiltersChange={handleFilterChange}

        // Заголовок
        headerConfig={headerConfig}

        // Действия
        getRowActions={getOperatorActions}

        // Дополнительные настройки
        enableSelection={false}
        stickyHeader
        showFilters
      />

      {/* Модальное окно управления назначениями */}
      <OperatorAssignmentModal
        open={assignmentModal.open}
        onClose={handleCloseAssignmentModal}
        operator={assignmentModal.operator}
        onAssignmentSuccess={handleAssignmentSuccess}
      />
    </Box>
  );
};

export default OperatorsPage; 