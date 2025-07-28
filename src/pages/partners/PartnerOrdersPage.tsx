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
import { useParams } from 'react-router-dom';

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

const PartnerOrdersPage: React.FC = () => {
  const theme = useTheme();
  const { partnerId } = useParams<{ partnerId: string }>();
  const partnerIdNum = Number(partnerId);

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
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({ open: false, message: '', severity: 'info' });

  // Фильтры для API
  const filters: OrderFilters = useMemo(() => {
    const result: OrderFilters = {};
    if (statusFilter) result.status = statusFilter;
    if (servicePointFilter) result.service_point_id = Number(servicePointFilter);
    if (searchQuery.trim()) {
      if (searchQuery.includes('+')) {
        result.phone = searchQuery.trim();
      } else if (/^\d+$/.test(searchQuery.trim())) {
        result.ttn = searchQuery.trim();
      } else {
        result.customer = searchQuery.trim();
      }
    }
    return result;
  }, [statusFilter, servicePointFilter, searchQuery]);

  // API запросы
  const { data: ordersData, isLoading, error, refetch } = useGetPartnerOrdersQuery({
    partner_id: partnerIdNum,
    filters,
    page: page + 1,
    per_page: rowsPerPage,
  });

  const { data: statsData } = useGetPartnerOrdersStatsQuery(partnerIdNum);

  // Мутации
  const [markAsReady] = useMarkPartnerOrderAsReadyMutation();
  const [markAsDelivered] = useMarkPartnerOrderAsDeliveredMutation();
  const [cancelOrder] = useCancelPartnerOrderMutation();
  const [addNote] = useAddPartnerOrderNoteMutation();
  const [exportOrders] = useExportPartnerOrdersMutation();

  const orders = ordersData?.orders || [];
  const totalCount = ordersData?.meta?.total_count || 0;
  const stats = ordersData?.stats;

  // Конфигурация колонок таблицы
  const columns = [
    {
      id: 'ttn',
      label: 'ТТН',
      format: (value: any, order: Order) => (
        <Box>
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
      format: (value: any, order: Order) => (
        <Box>
          <Box sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
            {order.customer_name}
          </Box>
          <Box sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
            {order.formatted_phone}
          </Box>
        </Box>
      ),
    },
    {
      id: 'service_point',
      label: 'Точка выдачи',
      format: (value: any, order: Order) => (
        <Box>
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
      format: (value: any, order: Order) => (
        <Box>
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
      hideOnMobile: true,
      format: (value: any, order: Order) => (
        <Box sx={{ fontSize: '0.9rem' }}>
          {order.formatted_order_date}
        </Box>
      ),
    },
    {
      id: 'actions',
      label: 'Действия',
      format: (value: any, order: Order) => (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          <Tooltip title="Просмотр">
            <IconButton
              size="small"
              color="primary"
              onClick={() => handleViewOrder(order)}
            >
              <ViewIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Добавить заметку">
            <IconButton
              size="small"
              color="info"
              onClick={() => handleAddNote(order)}
            >
              <NoteIcon />
            </IconButton>
          </Tooltip>
          
          {order.can_mark_as_ready && (
            <Tooltip title="Отметить как готов">
              <Button
                size="small"
                variant="contained"
                color="success"
                startIcon={<ReadyIcon />}
                onClick={() => handleMarkAsReady(order.id)}
                sx={{ minWidth: 'auto', px: 1 }}
              >
                Готов
              </Button>
            </Tooltip>
          )}
          
          {order.can_mark_as_delivered && (
            <Tooltip title="Отметить как выдан">
              <Button
                size="small"
                variant="contained"
                color="primary"
                startIcon={<DeliveredIcon />}
                onClick={() => handleMarkAsDelivered(order.id)}
                sx={{ minWidth: 'auto', px: 1 }}
              >
                Выдать
              </Button>
            </Tooltip>
          )}
          
          {order.can_cancel && (
            <Tooltip title="Отменить заказ">
              <Button
                size="small"
                variant="outlined"
                color="error"
                startIcon={<CancelIcon />}
                onClick={() => handleCancelOrder(order.id)}
                sx={{ minWidth: 'auto', px: 1 }}
              >
                Отмена
              </Button>
            </Tooltip>
          )}
        </Box>
      ),
    },
  ];

  // Обработчики событий
  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsViewDialogOpen(true);
  };

  const handleAddNote = (order: Order) => {
    setSelectedOrder(order);
    setNoteText(order.notes || '');
    setIsNoteDialogOpen(true);
  };

  const handleMarkAsReady = async (orderId: number) => {
    try {
      await markAsReady({ partner_id: partnerIdNum, id: orderId }).unwrap();
      setNotification({
        open: true,
        message: 'Заказ отмечен как готовый к выдаче',
        severity: 'success',
      });
      refetch();
    } catch (error) {
      setNotification({
        open: true,
        message: 'Ошибка при изменении статуса заказа',
        severity: 'error',
      });
    }
  };

  const handleMarkAsDelivered = async (orderId: number) => {
    try {
      await markAsDelivered({ partner_id: partnerIdNum, id: orderId }).unwrap();
      setNotification({
        open: true,
        message: 'Заказ отмечен как выданный',
        severity: 'success',
      });
      refetch();
    } catch (error) {
      setNotification({
        open: true,
        message: 'Ошибка при изменении статуса заказа',
        severity: 'error',
      });
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    try {
      await cancelOrder({ 
        partner_id: partnerIdNum, 
        id: orderId, 
        reason: 'Отменен партнером' 
      }).unwrap();
      setNotification({
        open: true,
        message: 'Заказ отменен',
        severity: 'success',
      });
      refetch();
    } catch (error) {
      setNotification({
        open: true,
        message: 'Ошибка при отмене заказа',
        severity: 'error',
      });
    }
  };

  const handleSaveNote = async () => {
    if (!selectedOrder) return;
    
    try {
      await addNote({
        partner_id: partnerIdNum,
        id: selectedOrder.id,
        note: noteText,
      }).unwrap();
      
      setNotification({
        open: true,
        message: 'Заметка добавлена',
        severity: 'success',
      });
      
      setIsNoteDialogOpen(false);
      setSelectedOrder(null);
      setNoteText('');
      refetch();
    } catch (error) {
      setNotification({
        open: true,
        message: 'Ошибка при добавлении заметки',
        severity: 'error',
      });
    }
  };

  const handleExport = async () => {
    try {
      const blob = await exportOrders({
        partner_id: partnerIdNum,
        filters,
      }).unwrap();
      
      // Создаем ссылку для скачивания
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `orders_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setNotification({
        open: true,
        message: 'Экспорт успешно выполнен',
        severity: 'success',
      });
    } catch (error) {
      setNotification({
        open: true,
        message: 'Ошибка при экспорте данных',
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

  // Опции сервисных точек из статистики
  const servicePointOptions = useMemo(() => {
    const points = [{ value: '', label: 'Все точки' }];
    if (statsData?.service_points_stats) {
      statsData.service_points_stats.forEach(sp => {
        points.push({
          value: sp.id.toString(),
          label: `${sp.name} (${sp.city})`
        });
      });
    }
    return points;
  }, [statsData]);

  return (
    <Box sx={pageStyles.pageContainer}>
      {/* Статистика */}
      {stats && (
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" color="primary">
                    {stats.total_orders}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Всего заказов
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" color="warning.main">
                    {stats.active_orders}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Активных
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" color="success.main">
                    {stats.ready_orders}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Готово к выдаче
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" color="primary">
                    {stats.total_revenue} ₴
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Общий доход
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Заголовок */}
      <Box sx={pageStyles.headerContainer}>
        <Box sx={pageStyles.titleContainer}>
          <OrderIcon sx={pageStyles.titleIcon} />
          <Box>
            <Typography variant="h4" component="h1">
              Заказы партнера
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {totalCount > 0 && `Всего заказов: ${totalCount}`}
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<ExportIcon />}
            onClick={handleExport}
            disabled={totalCount === 0}
          >
            Экспорт
          </Button>
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
        
        <TextField
          select
          label="Точка выдачи"
          value={servicePointFilter}
          onChange={(e) => setServicePointFilter(e.target.value)}
          variant="outlined"
          size="small"
          sx={{ minWidth: 200 }}
        >
          {servicePointOptions.map((option) => (
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
          onRowClick={(order) => handleViewOrder(order)}
        />
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

              {/* Заметки */}
              {selectedOrder.notes && (
                <Box sx={{ mb: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Заметки:
                  </Typography>
                  <Typography>{selectedOrder.notes}</Typography>
                </Box>
              )}

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
                      backgroundColor: 'grey.50',
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

      {/* Диалог добавления заметки */}
      <Dialog
        open={isNoteDialogOpen}
        onClose={() => setIsNoteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Добавить заметку к заказу {selectedOrder?.ttn}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Заметка"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            variant="outlined"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsNoteDialogOpen(false)}>
            Отмена
          </Button>
          <Button onClick={handleSaveNote} variant="contained">
            Сохранить
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

export default PartnerOrdersPage; 