import React, { useState, useMemo } from 'react';
import { Box, TextField, MenuItem, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from '../../components/ui';
import { InputAdornment } from '@mui/material';;
import {
  Search as SearchIcon,
  ShoppingCart as OrderIcon,
  CheckCircle as ConfirmIcon,
  LocalShipping as ProcessingIcon,
  Done as CompleteIcon,
  Cancel as CancelIcon,
  Archive as ArchiveIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

// Компоненты UI
import { Table } from '../../components/ui/Table/Table';
import { Button } from '../../components/ui/Button/Button';
import { Snackbar } from '../../components/ui/Snackbar/Snackbar';
import { Pagination } from '../../components/ui/Pagination/Pagination';
import { ActionsMenu, ActionItem } from '../../components/ui/ActionsMenu/ActionsMenu';

// API и типы
import {
  useGetAllTireOrdersQuery,
  useConfirmTireOrderMutation,
  useStartProcessingTireOrderMutation,
  useCompleteTireOrderMutation,
  useCancelTireOrderMutation,
  useArchiveTireOrderMutation,
  TireOrder,
} from '../../api/tireCarts.api';

interface TireOrderFilters {
  status?: string;
  supplier_id?: string;
  search?: string;
}

const UserOrdersPage: React.FC = () => {
  const theme = useTheme();

  // Стили страницы
  const pageStyles = {
    pageContainer: {
      padding: theme.spacing(2),
      maxWidth: '100%',
    },
    headerContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing(3),
    },
    titleContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(1),
    },
    titleIcon: {
      fontSize: '2rem',
      color: theme.palette.primary.main,
    },
    filtersContainer: {
      display: 'flex',
      gap: theme.spacing(2),
      marginBottom: theme.spacing(3),
      flexWrap: 'wrap' as const,
    },
    tableContainer: {
      marginBottom: theme.spacing(3),
    },
    paginationContainer: {
      display: 'flex',
      justifyContent: 'center',
      marginTop: theme.spacing(2),
    },
  };

  // Состояние
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(20);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<TireOrder | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({ open: false, message: '', severity: 'info' });

  // Фильтры для API
  const filters: TireOrderFilters = useMemo(() => {
    const result: TireOrderFilters = {};
    if (statusFilter) result.status = statusFilter;
    if (searchQuery.trim()) {
      result.search = searchQuery.trim();
    }
    return result;
  }, [statusFilter, searchQuery]);

  // API запросы
  const {
    data: ordersResponse,
    isLoading,
    error,
    refetch,
  } = useGetAllTireOrdersQuery({
    page: page + 1,
    per_page: rowsPerPage,
    ...filters,
  });

  // Мутации
  const [confirmOrder] = useConfirmTireOrderMutation();
  const [startProcessing] = useStartProcessingTireOrderMutation();
  const [completeOrder] = useCompleteTireOrderMutation();
  const [cancelOrder] = useCancelTireOrderMutation();
  const [archiveOrder] = useArchiveTireOrderMutation();

  const orders = ordersResponse?.orders || [];
  const totalCount = ordersResponse?.pagination?.total_count || 0;

  // Отладочная информация
  React.useEffect(() => {
    if (orders.length > 0) {
      console.log('First order supplier:', orders[0].supplier);
      console.log('First order full data:', orders[0]);
    }
  }, [orders]);

  // Обработчики действий
  const handleConfirmOrder = async (id: number) => {
    try {
      await confirmOrder(id).unwrap();
      setNotification({
        open: true,
        message: 'Заказ подтвержден',
        severity: 'success',
      });
      refetch();
    } catch (error: any) {
      setNotification({
        open: true,
        message: error.data?.error || 'Ошибка при подтверждении заказа',
        severity: 'error',
      });
    }
  };

  const handleStartProcessing = async (id: number) => {
    try {
      await startProcessing(id).unwrap();
      setNotification({
        open: true,
        message: 'Заказ взят в обработку',
        severity: 'success',
      });
      refetch();
    } catch (error: any) {
      setNotification({
        open: true,
        message: error.data?.error || 'Ошибка при взятии заказа в обработку',
        severity: 'error',
      });
    }
  };

  const handleCompleteOrder = async (id: number) => {
    try {
      await completeOrder(id).unwrap();
      setNotification({
        open: true,
        message: 'Заказ выполнен',
        severity: 'success',
      });
      refetch();
    } catch (error: any) {
      setNotification({
        open: true,
        message: error.data?.error || 'Ошибка при завершении заказа',
        severity: 'error',
      });
    }
  };

  const handleCancelOrder = async (id: number) => {
    try {
      await cancelOrder(id).unwrap();
      setNotification({
        open: true,
        message: 'Заказ отменен',
        severity: 'success',
      });
      refetch();
    } catch (error: any) {
      setNotification({
        open: true,
        message: error.data?.error || 'Ошибка при отмене заказа',
        severity: 'error',
      });
    }
  };

  const handleArchiveOrder = async (id: number) => {
    try {
      await archiveOrder(id).unwrap();
      setNotification({
        open: true,
        message: 'Заказ архивирован',
        severity: 'success',
      });
      refetch();
    } catch (error: any) {
      setNotification({
        open: true,
        message: error.data?.error || 'Ошибка при архивировании заказа',
        severity: 'error',
      });
    }
  };

  // Функция для получения статуса заказа
  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { label: string; color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' }> = {
      draft: { label: 'Корзина', color: 'default' },
      submitted: { label: 'Отправлен', color: 'info' },
      confirmed: { label: 'Подтвержден', color: 'primary' },
      processing: { label: 'В обработке', color: 'warning' },
      completed: { label: 'Выполнен', color: 'success' },
      cancelled: { label: 'Отменен', color: 'error' },
      archived: { label: 'Архивирован', color: 'default' },
    };
    return statusMap[status] || { label: status, color: 'default' };
  };

  // Функция для получения доступных действий
  const getOrderActions = (order: TireOrder): ActionItem[] => {
    const actions: ActionItem[] = [];

    // Просмотр
    actions.push({
      label: 'Просмотр',
      icon: <ViewIcon />,
      onClick: () => {
        setSelectedOrder(order);
        setIsViewDialogOpen(true);
      },
    });

    // Действия в зависимости от статуса
    switch (order.status) {
      case 'submitted':
        actions.push({
          label: 'Подтвердить',
          icon: <ConfirmIcon />,
          onClick: () => handleConfirmOrder(order.id),
          color: 'primary',
        });
        break;
      case 'confirmed':
        actions.push({
          label: 'В обработку',
          icon: <ProcessingIcon />,
          onClick: () => handleStartProcessing(order.id),
          color: 'warning',
        });
        break;
      case 'processing':
        actions.push({
          label: 'Завершить',
          icon: <CompleteIcon />,
          onClick: () => handleCompleteOrder(order.id),
          color: 'success',
        });
        break;
    }

    // Отмена (если возможна)
    if (['submitted', 'confirmed', 'processing'].includes(order.status)) {
      actions.push({
        label: 'Отменить',
        icon: <CancelIcon />,
        onClick: () => handleCancelOrder(order.id),
        color: 'error',
      });
    }

    // Архивирование (если не draft)
    if (order.status !== 'draft') {
      actions.push({
        label: 'Архивировать',
        icon: <ArchiveIcon />,
        onClick: () => handleArchiveOrder(order.id),
      });
    }

    return actions;
  };

  // Колонки таблицы
  const columns = [
    {
      id: 'id',
      label: 'ID',
      format: (value: any, order: TireOrder) => `#${order.id}`,
    },
    {
      id: 'client_info',
      label: 'Клиент',
      format: (value: any, order: TireOrder) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {order.client_name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {order.client_phone}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'supplier',
      label: 'Поставщик',
      format: (value: any, order: TireOrder) => {
        if (!order.supplier || !order.supplier.name) {
          return 'Не указан';
        }
        return String(order.supplier.name);
      },
    },
    {
      id: 'total_amount',
      label: 'Сумма',
      format: (value: any, order: TireOrder) => `${order.total_amount || 0} ₴`,
    },
    {
      id: 'status',
      label: 'Статус',
      format: (value: any, order: TireOrder) => {
        const statusInfo = getStatusInfo(order.status);
        return (
          <Chip
            label={statusInfo.label}
            color={statusInfo.color}
            size="small"
          />
        );
      },
    },
    {
      id: 'created_at',
      label: 'Создан',
      format: (value: any, order: TireOrder) => 
        new Date(order.created_at).toLocaleDateString('ru-RU'),
    },
    {
      id: 'actions',
      label: 'Действия',
      format: (value: any, order: TireOrder) => (
        <ActionsMenu actions={getOrderActions(order)} item={order} />
      ),
    },
  ];

  const statusOptions = [
    { value: '', label: 'Все статусы' },
    { value: 'submitted', label: 'Отправлен' },
    { value: 'confirmed', label: 'Подтвержден' },
    { value: 'processing', label: 'В обработке' },
    { value: 'completed', label: 'Выполнен' },
    { value: 'cancelled', label: 'Отменен' },
    { value: 'archived', label: 'Архивирован' },
  ];

  if (isLoading) {
    return (
      <Box sx={pageStyles.pageContainer}>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography>Загрузка заказов...</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={pageStyles.pageContainer}>
      {/* Заголовок */}
      <Box sx={pageStyles.headerContainer}>
        <Box sx={pageStyles.titleContainer}>
          <OrderIcon sx={pageStyles.titleIcon} />
          <Box>
            <Typography variant="h4" component="h1">
              Заказы пользователей
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {totalCount > 0 && `Всего заказов: ${totalCount}`}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Фильтры */}
      <Box sx={pageStyles.filtersContainer}>
        <TextField
          placeholder="Поиск по имени клиента или телефону..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          variant="outlined"
          size="small"
          sx={{ minWidth: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        
        <TextField
          select
          label="Статус"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          variant="outlined"
          size="small"
          sx={{ minWidth: 150 }}
        >
          {statusOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {/* Таблица */}
      <Box sx={pageStyles.tableContainer}>
        <Table
          columns={columns}
          rows={orders}
          loading={isLoading}
          empty={<Typography>Заказы не найдены</Typography>}
        />
      </Box>

      {/* Пагинация */}
      {totalCount > rowsPerPage && (
        <Box sx={pageStyles.paginationContainer}>
          <Pagination
            count={Math.ceil(totalCount / rowsPerPage)}
            page={page + 1}
            onChange={(newPage) => setPage(newPage - 1)}
            disabled={isLoading}
          />
        </Box>
      )}

      {/* Диалог просмотра заказа */}
      <Dialog
        open={isViewDialogOpen}
        onClose={() => setIsViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Заказ #{selectedOrder?.id}
        </DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Информация о клиенте
              </Typography>
              <Typography>Имя: {selectedOrder.client_name}</Typography>
              <Typography>Телефон: {selectedOrder.client_phone}</Typography>
              
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Детали заказа
              </Typography>
              <Typography>Статус: {getStatusInfo(selectedOrder.status).label}</Typography>
              <Typography>Сумма: {selectedOrder.total_amount || 0} ₴</Typography>
              <Typography>
                Поставщик: {selectedOrder.supplier?.name ? String(selectedOrder.supplier.name) : 'Не указан'}
              </Typography>
              
              {selectedOrder.comment && (
                <>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Комментарий
                  </Typography>
                  <Typography>{selectedOrder.comment}</Typography>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsViewDialogOpen(false)}>
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>

      {/* Уведомления */}
      <Snackbar
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={() => setNotification({ ...notification, open: false })}
      />
    </Box>
  );
};

export default UserOrdersPage;