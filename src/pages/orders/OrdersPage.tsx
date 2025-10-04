import React, { useState, useMemo } from 'react';
// import { useTranslation } from 'react-i18next'; // Убрано - используем прямые тексты
import { Box, TextField, MenuItem, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from '../../components/ui';
import { InputAdornment } from '@mui/material';;
import {
  Search as SearchIcon,
  ShoppingCart as OrderIcon,
  CheckCircle as ReadyIcon,
  LocalShipping as DeliveredIcon,
  Cancel as CancelIcon,
  Visibility as ViewIcon,
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
  useGetOrdersQuery,
  useMarkOrderAsReadyMutation,
  useMarkOrderAsDeliveredMutation,
  useCancelOrderMutation,
} from '../../api/orders.api';
import { Order, OrderFilters } from '../../types/order';

const OrdersPage: React.FC = () => {
  // const { t } = useTranslation(); // Убрано - используем прямые тексты
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
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({ open: false, message: '', severity: 'info' });

  // Фильтры для API
  const filters: OrderFilters = useMemo(() => {
    const result: OrderFilters = {};
    if (statusFilter) result.status = statusFilter;
    if (searchQuery.trim()) {
      // Определяем тип поиска
      if (searchQuery.includes('+')) {
        result.phone = searchQuery.trim();
      } else if (/^\d+$/.test(searchQuery.trim())) {
        result.ttn = searchQuery.trim();
      } else {
        result.customer = searchQuery.trim();
      }
    }
    return result;
  }, [statusFilter, searchQuery]);

  // API запросы
  const { data: ordersData, isLoading, error, refetch } = useGetOrdersQuery({
    ...filters,
    page: page + 1,
    per_page: rowsPerPage,
  });

  // Мутации
  const [markAsReady] = useMarkOrderAsReadyMutation();
  const [markAsDelivered] = useMarkOrderAsDeliveredMutation();
  const [cancelOrder] = useCancelOrderMutation();

  const orders = ordersData?.orders || [];
  const totalCount = ordersData?.meta?.total_count || 0;

  // Конфигурация действий для ActionsMenu
  const orderActions: ActionItem<Order>[] = useMemo(() => [
    {
      id: 'view',
      label: 'Просмотреть',
      icon: <ViewIcon />,
      onClick: (order: Order) => handleViewOrder(order),
      color: 'primary',
      tooltip: 'Просмотреть'
    },
    {
      id: 'mark_ready',
      label: 'Отметить готовым',
      icon: <ReadyIcon />,
      onClick: (order: Order) => handleMarkAsReady(order.id),
      color: 'success',
      tooltip: 'Отметить готовым',
      visible: (order: Order) => order.can_mark_as_ready
    },
    {
      id: 'mark_delivered',
      label: 'Отметить выданным',
      icon: <DeliveredIcon />,
      onClick: (order: Order) => handleMarkAsDelivered(order.id),
      color: 'primary',
      tooltip: 'Отметить выданным',
      visible: (order: Order) => order.can_mark_as_delivered
    },
    {
      id: 'cancel',
      label: 'Отменить заказ',
      icon: <CancelIcon />,
      onClick: (order: Order) => handleCancelOrder(order.id),
      color: 'error',
      tooltip: 'Отменить заказ',
      visible: (order: Order) => order.can_cancel,
      requireConfirmation: true,
      confirmationConfig: {
        title: 'Подтвердите действие',
        message: 'Вы уверены, что хотите отменить этот заказ?',
        confirmLabel: 'Отменить заказ',
        cancelLabel: 'Отменить',
      }
    }
  ], []);

  // Конфигурация колонок таблицы
  const columns = [
    {
      id: 'ttn',
      label: 'ТТН',
      minWidth: 80,
      maxWidth: 150,
      wrap: true,
      format: (value: any, order: Order) => (
        <Box sx={{ 
          wordBreak: 'break-word', 
          overflowWrap: 'break-word', 
          hyphens: 'auto',
          whiteSpace: 'normal',
          lineHeight: 1.2,
          maxWidth: '100%'
        }}>
          <Box sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
            {order.ttn}
          </Box>
          {order.number && (
            <Box sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
              №{order.number}
            </Box>
          )}
        </Box>
      ),
    },
    {
      id: 'status',
      label: 'Статус',
      minWidth: 80,
      maxWidth: 120,
      align: 'center' as const,
      format: (value: any, order: Order) => (
        <Chip
          label={order.status_label}
          size="small"
          sx={{
            backgroundColor: order.status_color,
            color: 'white',
            fontWeight: 'bold',
          }}
        />
      ),
    },
    {
      id: 'customer',
      label: 'Клиент',
      minWidth: 140,
      maxWidth: 200,
      wrap: true,
      format: (value: any, order: Order) => (
        <Box sx={{ 
          wordBreak: 'break-word', 
          overflowWrap: 'break-word', 
          hyphens: 'auto',
          whiteSpace: 'normal',
          lineHeight: 1.2,
          maxWidth: '100%'
        }}>
          <Box sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
            {order.customer_name}
          </Box>
          <Typography variant="body2" sx={{ 
            wordBreak: 'break-word', 
            overflowWrap: 'break-word', 
            color: 'text.secondary',
            whiteSpace: 'normal',
            lineHeight: 1.2
          }}>
            {order.formatted_phone || 'Не указано'}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'service_point',
      label: 'Точка выдачи',
      minWidth: 120,
      maxWidth: 180,
      wrap: true,
      hideOnMobile: true,
      format: (value: any, order: Order) => (
        <Box sx={{ 
          wordBreak: 'break-word', 
          overflowWrap: 'break-word', 
          hyphens: 'auto',
          whiteSpace: 'normal',
          lineHeight: 1.2,
          maxWidth: '100%'
        }}>
          <Box sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
            {order.point_name}
          </Box>
          {order.third_party_point && (
            <Chip
              label="Сторонняя"
              size="small"
              color="warning"
              variant="outlined"
              sx={{ mt: 0.5, fontSize: '0.7rem' }}
            />
          )}
        </Box>
      ),
    },
    {
      id: 'order_info',
      label: 'Заказ',
      minWidth: 80,
      maxWidth: 110,
      align: 'right' as const,
      format: (value: any, order: Order) => (
        <Box sx={{ 
          wordBreak: 'break-word', 
          textAlign: 'right',
          overflowWrap: 'break-word',
          whiteSpace: 'normal',
          lineHeight: 1.2
        }}>
          <Box sx={{ fontSize: '0.9rem' }}>
            {order.total_quantity} шт.
          </Box>
          <Box sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            {order.total_amount} ₴
          </Box>
        </Box>
      ),
    },
    {
      id: 'order_date',
      label: 'Дата заказа',
      minWidth: 90,
      maxWidth: 130,
      hideOnMobile: true,
      format: (value: any, order: Order) => (
        <Box sx={{ 
          fontSize: '0.9rem', 
          wordBreak: 'break-word', 
          overflowWrap: 'break-word',
          whiteSpace: 'normal',
          lineHeight: 1.2
        }}>
          {order.formatted_order_date}
        </Box>
      ),
    },
    {
      id: 'supplier',
      label: 'Поставщик',
      minWidth: 100,
      maxWidth: 150,
      hideOnMobile: true,
      format: (value: any, order: Order) => (
        <Box sx={{ 
          wordBreak: 'break-word', 
          overflowWrap: 'break-word', 
          hyphens: 'auto',
          whiteSpace: 'normal',
          lineHeight: 1.2,
          maxWidth: '100%'
        }}>
          {order.supplier_name ? (
            <Box>
              <Box sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                {order.supplier_name}
              </Box>
              {order.supplier_firm_id && (
                <Box sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                  ID: {order.supplier_firm_id}
                </Box>
              )}
            </Box>
          ) : (
            <Box sx={{ fontSize: '0.9rem', color: 'text.secondary', fontStyle: 'italic' }}>
              Не указан
            </Box>
          )}
        </Box>
      ),
    },
    {
      id: 'actions',
      label: 'Действия',
      minWidth: 80,
      maxWidth: 120,
      align: 'center' as const,
      format: (value: any, order: Order) => (
        <ActionsMenu 
          actions={orderActions} 
          item={order} 
          menuThreshold={1}
          sx={{ display: 'flex', justifyContent: 'center' }}
        />
      ),
    },
  ];

  // Обработчики событий
  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsViewDialogOpen(true);
  };

  const handleMarkAsReady = async (orderId: number) => {
    try {
      await markAsReady(orderId).unwrap();
      setNotification({
        open: true,
        message: 'Заказ отмечен как готовый к выдаче',
        severity: 'success',
      });
      refetch();
    } catch (error: any) {
      const errorMessage = error?.data?.error || error?.message || 'Ошибка при выполнении действия';
      setNotification({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    }
  };

  const handleMarkAsDelivered = async (orderId: number) => {
    try {
      await markAsDelivered(orderId).unwrap();
      setNotification({
        open: true,
        message: 'Заказ отмечен как выданный',
        severity: 'success',
      });
      refetch();
    } catch (error: any) {
      const errorMessage = error?.data?.error || error?.message || 'Ошибка при выполнении действия';
      setNotification({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    try {
      await cancelOrder({ id: orderId, reason: 'Отменен оператором' }).unwrap();
      setNotification({
        open: true,
        message: 'Заказ отменен',
        severity: 'success',
      });
      refetch();
    } catch (error: any) {
      const errorMessage = error?.data?.error || error?.message || 'Ошибка при выполнении действия';
      setNotification({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    }
  };

  const statusOptions = [
    { value: '', label: 'Все статусы' },
    { value: 'received', label: 'Получен' },
    { value: 'processing', label: 'В обработке' },
    { value: 'ready', label: 'Готов к выдаче' },
    { value: 'delivered', label: 'Выдан' },
    { value: 'canceled', label: 'Отменен' },
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
              Заказы интернет-магазинов
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {totalCount > 0 && `Всего: ${totalCount}`}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Фильтры */}
      <Box sx={pageStyles.filtersContainer}>
        <TextField
          placeholder="Поиск по ТТН, имени клиента или телефону..."
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
          sx={{ minWidth: 200 }}
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
        {orders.length > 0 ? (
          <Table
            columns={columns}
            rows={orders}
            loading={isLoading}
            onRowClick={(order) => handleViewOrder(order)}
            sx={{
              '& .MuiTableCell-root': {
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                whiteSpace: 'normal',
                lineHeight: 1.3,
                padding: '8px 12px',
                verticalAlign: 'top'
              }
            }}
          />
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">
              Заказы не найдены
            </Typography>
          </Box>
        )}
      </Box>

      {/* Пагинация */}
      {totalCount > rowsPerPage && (
        <Box sx={pageStyles.paginationContainer}>
          <Pagination
            count={Math.ceil(totalCount / rowsPerPage)}
            page={page + 1}
            onChange={(newPage) => setPage(newPage - 1)}
            color="primary"
            showFirstButton
            showLastButton
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
          Заказ {selectedOrder?.ttn}
        </DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box sx={{ pt: 1 }}>
              {/* Информация о заказе */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Клиент:
                    </Typography>
                    <Typography>{selectedOrder.customer_name}</Typography>
                    <Typography>{selectedOrder.formatted_phone}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Статус:
                    </Typography>
                    <Chip
                      label={selectedOrder.status_label}
                      sx={{
                        backgroundColor: selectedOrder.status_color,
                        color: 'white',
                      }}
                    />
                  </Box>
                </Box>
              </Box>

              {/* Товары */}
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                  Товары:
                </Typography>
                {selectedOrder.order_items?.map((item, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: 2,
                      mb: 1,
                      backgroundColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50',
                      borderRadius: 1,
                    }}
                  >
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        Артикул: {item.artikul}
                      </Typography>
                      {item.name && <Typography variant="body2">{item.name}</Typography>}
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2">{item.unit_description}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {item.formatted_sum}
                      </Typography>
                    </Box>
                  </Box>
                ))}
                
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  fontWeight: 'bold', 
                  fontSize: '1.1rem',
                  mt: 2,
                  pt: 2,
                  borderTop: '1px solid',
                  borderColor: 'divider'
                }}>
                  <Typography variant="h6">Итого:</Typography>
                  <Typography variant="h6">{selectedOrder.total_amount} ₴</Typography>
                </Box>
              </Box>
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

export default OrdersPage; 