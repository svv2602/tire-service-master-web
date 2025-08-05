import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Card,
  CardContent,
  Divider,
  Stack,
  Container,
  Collapse,
  IconButton
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  Store as StoreIcon,
  Cancel as CancelIcon,
  Archive as ArchiveIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  ShoppingCart as ShoppingCartIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import ClientLayout from '../../../components/client/ClientLayout';
import {
  useGetTireOrdersQuery,
  useCancelTireOrderMutation,
  useArchiveTireOrderMutation,
  TireOrder
} from '../../../api/tireCarts.api';
import { useAppSelector } from '../../../store';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`orders-tabpanel-${index}`}
      aria-labelledby={`orders-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const OrdersPage: React.FC = () => {
  const { t } = useTranslation(['client', 'common']);
  const navigate = useNavigate();
  const { isAuthenticated, accessToken, user } = useAppSelector((state) => state.auth);

  const [currentTab, setCurrentTab] = useState(0);
  const [expandedOrders, setExpandedOrders] = useState<Set<number>>(new Set());
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedOrderForCancel, setSelectedOrderForCancel] = useState<TireOrder | null>(null);

  // Статусы для фильтрации (мемоизируем для стабильности ссылок)
  const statusFilters = useMemo(() => [
    '', // Все заказы
    'submitted,confirmed,processing', // Активные
    'completed', // Завершенные
    'cancelled', // Отмененные
    'archived' // Архивированные
  ], []);

  // Мемоизируем параметры запроса для предотвращения бесконечных запросов
  const queryParams = useMemo(() => ({
    page: 1,
    per_page: 50,
    status: statusFilters[currentTab]
  }), [currentTab]);

  const {
    data: ordersResponse,
    isLoading,
    isError,
    error
  } = useGetTireOrdersQuery(queryParams, {
    skip: !isAuthenticated // Включаем обратно после диагностики
  });

  const [cancelOrder, { isLoading: isCancellingOrder }] = useCancelTireOrderMutation();
  const [archiveOrder, { isLoading: isArchivingOrder }] = useArchiveTireOrderMutation();

  const orders = ordersResponse?.orders || [];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const toggleOrderExpansion = (orderId: number) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const handleCancelOrder = async () => {
    if (!selectedOrderForCancel) return;

    try {
      await cancelOrder(selectedOrderForCancel.id).unwrap();
      setCancelDialogOpen(false);
      setSelectedOrderForCancel(null);
    } catch (error) {
      console.error('Ошибка отмены заказа:', error);
    }
  };

  const handleArchiveOrder = async (orderId: number) => {
    try {
      await archiveOrder(orderId).unwrap();
    } catch (error) {
      console.error('Ошибка архивирования заказа:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'default';
      case 'submitted': return 'info';
      case 'confirmed': return 'primary';
      case 'processing': return 'warning';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      case 'archived': return 'default';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return 'Черновик';
      case 'submitted': return 'Отправлен';
      case 'confirmed': return 'Подтвержден';
      case 'processing': return 'В обработке';
      case 'completed': return 'Завершен';
      case 'cancelled': return 'Отменен';
      case 'archived': return 'Архивирован';
      default: return status;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uk-UA', {
      style: 'currency',
      currency: 'UAH',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isAuthenticated) {
    return (
      <ClientLayout>
        <Container maxWidth="lg">
          <Alert severity="warning" sx={{ mt: 3 }}>
            Для просмотра заказов необходимо войти в систему
          </Alert>
        </Container>
      </ClientLayout>
    );
  }

  if (isLoading) {
    return (
      <ClientLayout>
        <Container maxWidth="lg">
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress />
          </Box>
        </Container>
      </ClientLayout>
    );
  }

  if (isError) {
    return (
      <ClientLayout>
        <Container maxWidth="lg">
          <Alert severity="error" sx={{ mt: 3 }}>
            Ошибка загрузки заказов. Попробуйте обновить страницу.
          </Alert>
        </Container>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <Container maxWidth="lg">
        <Box sx={{ py: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Мои заказы
          </Typography>


          {/* Вкладки для фильтрации */}
          <Paper sx={{ mb: 3 }}>
            <Tabs
              value={currentTab}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
            >
              <Tab label="Все заказы" />
              <Tab label="Активные" />
              <Tab label="Завершенные" />
              <Tab label="Отмененные" />
              <Tab label="Архив" />
            </Tabs>
          </Paper>

          {/* Содержимое вкладок */}
          {[0, 1, 2, 3, 4].map((tabIndex) => (
            <TabPanel key={tabIndex} value={currentTab} index={tabIndex}>
              {orders.length === 0 ? (
                <Box textAlign="center" py={8}>
                  <ReceiptIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h5" gutterBottom>
                    {tabIndex === 0 ? 'У вас пока нет заказов' : 
                     tabIndex === 1 ? 'Нет активных заказов' :
                     tabIndex === 2 ? 'Нет завершенных заказов' :
                     tabIndex === 3 ? 'Нет отмененных заказов' :
                     'Архив пуст'}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    {tabIndex === 0 ? 'Создайте свой первый заказ в корзине' : 
                     'В данной категории заказов не найдено'}
                  </Typography>
                  {tabIndex === 0 && (
                    <Button
                      variant="contained"
                      onClick={() => navigate('/client/tire-offers')}
                      startIcon={<ShoppingCartIcon />}
                    >
                      Перейти к покупкам
                    </Button>
                  )}
                </Box>
              ) : (
                <Stack spacing={2}>
                  {orders.map((order) => (
                    <Card key={order.id} variant="outlined">
                      <CardContent>
                        {/* Заголовок заказа */}
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                          <Box display="flex" alignItems="center" gap={2}>
                            <ReceiptIcon color="primary" />
                            <Box>
                              <Typography variant="h6">
                                Заказ #{order.id}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {formatDate(order.created_at)}
                              </Typography>
                            </Box>
                          </Box>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Chip
                              label={getStatusLabel(order.status)}
                              color={getStatusColor(order.status) as any}
                              size="small"
                            />
                            <IconButton
                              onClick={() => toggleOrderExpansion(order.id)}
                              size="small"
                            >
                              {expandedOrders.has(order.id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </IconButton>
                          </Box>
                        </Box>

                        {/* Краткая информация */}
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <StoreIcon fontSize="small" color="action" />
                            <Typography variant="body2">
                              {order.supplier.name}
                            </Typography>
                          </Box>
                          <Typography variant="h6" color="primary">
                            {formatPrice(order.total_amount)}
                          </Typography>
                        </Box>

                        <Typography variant="body2" color="text.secondary">
                          {order.items_count} товаров
                        </Typography>

                        {/* Развернутая информация */}
                        <Collapse in={expandedOrders.has(order.id)}>
                          <Divider sx={{ my: 2 }} />
                          
                          {/* Контактная информация */}
                          <Box mb={2}>
                            <Typography variant="subtitle2" gutterBottom>
                              Контактная информация:
                            </Typography>
                            <Typography variant="body2">
                              Имя: {order.client_name}
                            </Typography>
                            <Typography variant="body2">
                              Телефон: {order.client_phone}
                            </Typography>
                            {order.comment && (
                              <Typography variant="body2">
                                Комментарий: {order.comment}
                              </Typography>
                            )}
                          </Box>

                          {/* Товары в заказе */}
                          <Box mb={2}>
                            <Typography variant="subtitle2" gutterBottom>
                              Товары в заказе:
                            </Typography>
                            <TableContainer>
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Товар</TableCell>
                                    <TableCell>Размер</TableCell>
                                    <TableCell>Количество</TableCell>
                                    <TableCell>Цена</TableCell>
                                    <TableCell>Сумма</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {order.items?.length > 0 ? (
                                    order.items.map((item) => (
                                      <TableRow key={item.id}>
                                        <TableCell>
                                          <Box>
                                            <Typography variant="body2" fontWeight="bold">
                                              {item.supplier_tire_product.brand} {item.supplier_tire_product.model}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                              {item.supplier_tire_product.name}
                                            </Typography>
                                          </Box>
                                        </TableCell>
                                        <TableCell>
                                          <Chip 
                                            label={item.supplier_tire_product.size} 
                                            size="small" 
                                            color="primary" 
                                          />
                                        </TableCell>
                                        <TableCell>{item.quantity} шт.</TableCell>
                                        <TableCell>{formatPrice(item.price_at_order)}</TableCell>
                                        <TableCell>
                                          <Typography fontWeight="bold">
                                            {formatPrice(item.total_price)}
                                          </Typography>
                                        </TableCell>
                                      </TableRow>
                                    ))
                                  ) : (
                                    <TableRow>
                                      <TableCell colSpan={5} align="center">
                                        <Box sx={{ py: 2 }}>
                                          <Typography variant="body2" color="text.secondary">
                                            В заказе нет товаров
                                          </Typography>
                                        </Box>
                                      </TableCell>
                                    </TableRow>
                                  )}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </Box>

                          {/* Действия с заказом */}
                          <Box display="flex" gap={1} justifyContent="flex-end">
                            {(order.status === 'submitted' || order.status === 'confirmed') && (
                              <Button
                                variant="outlined"
                                color="error"
                                size="small"
                                onClick={() => {
                                  setSelectedOrderForCancel(order);
                                  setCancelDialogOpen(true);
                                }}
                                startIcon={<CancelIcon />}
                              >
                                Отменить
                              </Button>
                            )}
                            {order.status !== 'archived' && order.status !== 'cancelled' && (
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={() => handleArchiveOrder(order.id)}
                                disabled={isArchivingOrder}
                                startIcon={<ArchiveIcon />}
                              >
                                В архив
                              </Button>
                            )}
                          </Box>
                        </Collapse>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              )}
            </TabPanel>
          ))}
        </Box>

        {/* Диалог подтверждения отмены заказа */}
        <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)}>
          <DialogTitle>Отмена заказа</DialogTitle>
          <DialogContent>
            <Typography>
              Вы уверены, что хотите отменить заказ #{selectedOrderForCancel?.id}?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Это действие нельзя будет отменить.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCancelDialogOpen(false)}>
              Нет, оставить
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleCancelOrder}
              disabled={isCancellingOrder}
              startIcon={isCancellingOrder ? <CircularProgress size={20} /> : <CancelIcon />}
            >
              {isCancellingOrder ? 'Отменяется...' : 'Да, отменить'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ClientLayout>
  );
};

export default OrdersPage;