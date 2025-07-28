import React, { useState, useMemo } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
} from '@mui/material';
import {
  Search as SearchIcon,
  ShoppingCart as OrderIcon,
  CheckCircle as ReadyIcon,
  LocalShipping as DeliveredIcon,
  Cancel as CancelIcon,
  Visibility as ViewIcon,
  Note as NoteIcon,
  FileDownload as ExportIcon,
  TrendingUp as StatsIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

// Компоненты UI
import { Table } from '../../components/ui/Table/Table';
import { Button } from '../../components/ui/Button/Button';
import { Snackbar } from '../../components/ui/Snackbar/Snackbar';
import { Pagination } from '../../components/ui/Pagination/Pagination';

// API и типы
import {
  useGetPartnerOrdersQuery,
  useMarkPartnerOrderAsReadyMutation,
  useMarkPartnerOrderAsDeliveredMutation,
  useCancelPartnerOrderMutation,
  useAddPartnerOrderNoteMutation,
  useGetPartnerOrdersStatsQuery,
  useExportPartnerOrdersMutation,
} from '../../api/partnerOrders.api';
import { Order, OrderFilters } from '../../types/order';
import { UserRole } from '../../types';

// Утилитарная функция для безопасного форматирования числовых значений
const formatCurrency = (value: number | string): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(numValue) ? '0.00' : numValue.toFixed(2);
};

const MyOrdersPage: React.FC = () => {
  const theme = useTheme();
  const { user } = useSelector((state: RootState) => state.auth);
  
  // Определяем partnerId на основе роли пользователя
  const partnerId = useMemo(() => {
    if (!user) return null;
    
    if (user.role === UserRole.PARTNER && user.partner?.id) {
      return user.partner.id;
    }
    
    if (user.role === UserRole.OPERATOR && user.operator?.partner_id) {
      return user.operator.partner_id;
    }
    
    return null;
  }, [user]);

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
  const [servicePointFilter, setServicePointFilter] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  });

  // Фильтры для API
  const filters: OrderFilters = useMemo(() => {
    const result: OrderFilters = {
      page: page + 1,
      per_page: rowsPerPage,
    };

    if (searchQuery.trim()) {
      result.search = searchQuery.trim();
    }

    if (statusFilter) {
      result.status = statusFilter;
    }

    if (servicePointFilter) {
      result.service_point_id = parseInt(servicePointFilter);
    }

    return result;
  }, [page, rowsPerPage, searchQuery, statusFilter, servicePointFilter]);

  // API запросы
  const {
    data: ordersResponse,
    isLoading,
    error,
  } = useGetPartnerOrdersQuery(
    { partner_id: partnerId!, filters },
    { skip: !partnerId }
  );

  const { data: statsData } = useGetPartnerOrdersStatsQuery(
    partnerId!,
    { skip: !partnerId }
  );

  // Мутации
  const [markAsReady] = useMarkPartnerOrderAsReadyMutation();
  const [markAsDelivered] = useMarkPartnerOrderAsDeliveredMutation();
  const [cancelOrder] = useCancelPartnerOrderMutation();
  const [addNote] = useAddPartnerOrderNoteMutation();
  const [exportOrders] = useExportPartnerOrdersMutation();

  // Обработчики уведомлений
  const showNotification = (message: string, severity: typeof notification.severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  // Данные для отображения
  const orders = ordersResponse?.orders || [];
  const totalCount = ordersResponse?.meta?.total_count || 0;
  const stats = statsData?.overview || {
    total_orders: 0,
    total_revenue: 0,
    active_service_points: 0,
    total_service_points: 0,
  };

  // Обработчики действий
  const handleMarkAsReady = async (order: Order) => {
    if (!partnerId) return;
    
    try {
      await markAsReady({ partner_id: partnerId, id: order.id }).unwrap();
      showNotification('Заказ отмечен как готовый к выдаче');
    } catch (error) {
      showNotification('Ошибка при изменении статуса заказа', 'error');
    }
  };

  const handleMarkAsDelivered = async (order: Order) => {
    if (!partnerId) return;
    
    try {
      await markAsDelivered({ partner_id: partnerId, id: order.id }).unwrap();
      showNotification('Заказ отмечен как выданный');
    } catch (error) {
      showNotification('Ошибка при изменении статуса заказа', 'error');
    }
  };

  const handleCancelOrder = async (order: Order) => {
    if (!partnerId) return;
    
    try {
      await cancelOrder({ 
        partner_id: partnerId, 
        id: order.id, 
        reason: 'Отменен партнером' 
      }).unwrap();
      showNotification('Заказ отменен');
    } catch (error) {
      showNotification('Ошибка при отмене заказа', 'error');
    }
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsViewDialogOpen(true);
  };

  const handleCloseViewDialog = () => {
    setIsViewDialogOpen(false);
    setSelectedOrder(null);
  };

  const handleAddNote = (order: Order) => {
    setSelectedOrder(order);
    setNoteText('');
    setIsNoteDialogOpen(true);
  };

  const handleCloseNoteDialog = () => {
    setIsNoteDialogOpen(false);
    setSelectedOrder(null);
    setNoteText('');
  };

  const handleSaveNote = async () => {
    if (!partnerId || !selectedOrder || !noteText.trim()) return;

    try {
      await addNote({
        partner_id: partnerId,
        id: selectedOrder.id,
        note: noteText.trim(),
      }).unwrap();
      showNotification('Заметка добавлена');
      handleCloseNoteDialog();
    } catch (error) {
      showNotification('Ошибка при добавлении заметки', 'error');
    }
  };

  const handleExport = async () => {
    if (!partnerId) return;
    
    try {
      const blob = await exportOrders({ partner_id: partnerId, filters }).unwrap();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `partner_orders_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showNotification('Данные экспортированы');
    } catch (error) {
      showNotification('Ошибка при экспорте данных', 'error');
    }
  };

  // Колонки таблицы
  const columns = [
    {
      id: 'ttn',
      key: 'ttn',
      label: 'ТТН',
      format: (value: string) => (
        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
          {value}
        </Typography>
      ),
    },
    {
      id: 'status',
      key: 'status',
      label: 'Статус',
      format: (value: string) => {
        const statusColors = {
          received: 'info',
          processing: 'warning',
          ready: 'success',
          delivered: 'success',
          canceled: 'error',
        } as const;

        const statusLabels = {
          received: 'Получен',
          processing: 'В обработке',
          ready: 'Готов к выдаче',
          delivered: 'Выдан',
          canceled: 'Отменен',
        } as const;

        return (
          <Chip
            label={statusLabels[value as keyof typeof statusLabels] || value}
            color={statusColors[value as keyof typeof statusColors] || 'default'}
            size="small"
          />
        );
      },
    },
    {
      id: 'customer_name',
      key: 'customer_name',
      label: 'Клиент',
      format: (value: string) => (
        <Typography variant="body2">{value}</Typography>
      ),
    },
    {
      id: 'customer_phone',
      key: 'customer_phone',
      label: 'Телефон',
      format: (value: string) => (
        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
          {value}
        </Typography>
      ),
    },
    {
      id: 'total_amount',
      key: 'total_amount',
      label: 'Сумма',
      format: (value: number | string) => (
        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
          {formatCurrency(value)} ₴
        </Typography>
      ),
    },
    {
      id: 'order_date',
      key: 'order_date',
      label: 'Дата заказа',
      format: (value: string) => (
        <Typography variant="body2">
          {new Date(value).toLocaleDateString('ru-RU')}
        </Typography>
      ),
    },
    {
      id: 'actions',
      key: 'actions',
      label: 'Действия',
      format: (_: any, order: Order) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Просмотр">
            <IconButton size="small" onClick={() => handleViewOrder(order)}>
              <ViewIcon />
            </IconButton>
          </Tooltip>
          
          {order.status === 'processing' && (
            <Tooltip title="Готов к выдаче">
              <IconButton 
                size="small" 
                color="success" 
                onClick={() => handleMarkAsReady(order)}
              >
                <ReadyIcon />
              </IconButton>
            </Tooltip>
          )}
          
          {order.status === 'ready' && (
            <Tooltip title="Выдан">
              <IconButton 
                size="small" 
                color="primary" 
                onClick={() => handleMarkAsDelivered(order)}
              >
                <DeliveredIcon />
              </IconButton>
            </Tooltip>
          )}
          
          {!['delivered', 'canceled'].includes(order.status) && (
            <Tooltip title="Отменить">
              <IconButton 
                size="small" 
                color="error" 
                onClick={() => handleCancelOrder(order)}
              >
                <CancelIcon />
              </IconButton>
            </Tooltip>
          )}
          
          <Tooltip title="Добавить заметку">
            <IconButton size="small" onClick={() => handleAddNote(order)}>
              <NoteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  // Если нет доступа к партнеру
  if (!partnerId) {
    return (
      <Box sx={pageStyles.pageContainer}>
        <Typography variant="h6" color="error">
          Доступ запрещен. Не удалось определить партнера.
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={pageStyles.pageContainer}>
        <Typography variant="h6" color="error">
          Ошибка при загрузке заказов
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={pageStyles.pageContainer}>
      {/* Статистика */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <StatsIcon color="primary" />
                <Box>
                  <Typography variant="h6">{stats.total_orders}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Всего заказов
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ReadyIcon color="success" />
                <Box>
                  <Typography variant="h6">{stats.active_service_points}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Активных точек
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <DeliveredIcon color="info" />
                <Box>
                  <Typography variant="h6">{stats.total_service_points}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Всего точек
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h6" color="success.main">₴</Typography>
                <Box>
                  <Typography variant="h6">{formatCurrency(stats.total_revenue)}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Общая выручка
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Header */}
      <Box sx={pageStyles.headerContainer}>
        <Box sx={pageStyles.titleContainer}>
          <OrderIcon sx={pageStyles.titleIcon} />
          <Box>
            <Typography variant="h4" component="h1">
              Мои заказы товаров
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {totalCount > 0 && `Всего заказов: ${totalCount}`}
            </Typography>
          </Box>
        </Box>
        
        <Button
          variant="outlined"
          startIcon={<ExportIcon />}
          onClick={handleExport}
          disabled={isLoading || orders.length === 0}
        >
          Экспорт
        </Button>
      </Box>

      {/* Filters */}
      <Box sx={pageStyles.filtersContainer}>
        <TextField
          size="small"
          placeholder="Поиск по ТТН, клиенту, телефону..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 300 }}
        />
        
        <TextField
          select
          size="small"
          label="Статус"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">Все статусы</MenuItem>
          <MenuItem value="received">Получен</MenuItem>
          <MenuItem value="processing">В обработке</MenuItem>
          <MenuItem value="ready">Готов к выдаче</MenuItem>
          <MenuItem value="delivered">Выдан</MenuItem>
          <MenuItem value="canceled">Отменен</MenuItem>
        </TextField>
      </Box>

      {/* Table */}
      <Box sx={pageStyles.tableContainer}>
        {orders.length > 0 ? (
          <Table
            columns={columns}
            rows={orders}
            loading={isLoading}
            onRowClick={(order) => handleViewOrder(order)}
          />
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">
              {isLoading ? 'Загрузка...' : 'Заказы не найдены'}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Pagination */}
      {totalCount > rowsPerPage && (
        <Box sx={pageStyles.paginationContainer}>
          <Pagination
            count={Math.ceil(totalCount / rowsPerPage)}
            page={page + 1}
            onChange={(newPage) => setPage(newPage - 1)}
            color="primary"
          />
        </Box>
      )}

      {/* View Order Dialog */}
      <Dialog open={isViewDialogOpen} onClose={handleCloseViewDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <OrderIcon />
            <Typography variant="h6">
              Заказ {selectedOrder?.ttn}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Информация о заказе
                  </Typography>
                  <Typography variant="body2">
                    <strong>ТТН:</strong> {selectedOrder.ttn}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Статус:</strong> {selectedOrder.status}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Дата заказа:</strong> {new Date(selectedOrder.order_date).toLocaleDateString('ru-RU')}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Сумма:</strong> {formatCurrency(selectedOrder.total_amount)} ₴
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Информация о клиенте
                  </Typography>
                  <Typography variant="body2">
                    <strong>Имя:</strong> {selectedOrder.customer_name}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Телефон:</strong> {selectedOrder.customer_phone}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Email:</strong> Не указан
                  </Typography>
                </Grid>
                
                {selectedOrder.order_items && selectedOrder.order_items.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                      Товары в заказе
                    </Typography>
                    {selectedOrder.order_items.map((item, index) => (
                      <Box key={index} sx={{ mb: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                        <Typography variant="body2">
                          <strong>{item.name}</strong> (Артикул: {item.artikul})
                        </Typography>
                        <Typography variant="body2">
                          Количество: {item.quantity} × {formatCurrency(item.price)} ₴ = {formatCurrency(item.sum)} ₴
                        </Typography>
                      </Box>
                    ))}
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewDialog}>Закрыть</Button>
        </DialogActions>
      </Dialog>

      {/* Add Note Dialog */}
      <Dialog open={isNoteDialogOpen} onClose={handleCloseNoteDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Добавить заметку</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Текст заметки"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNoteDialog}>Отмена</Button>
          <Button 
            onClick={handleSaveNote} 
            variant="contained"
            disabled={!noteText.trim()}
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notifications */}
      <Snackbar
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={handleCloseNotification}
      />
    </Box>
  );
};

export default MyOrdersPage; 