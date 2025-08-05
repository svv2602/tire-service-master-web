import React, { useState } from 'react';
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
  IconButton,
  TextField,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Stack,
  Card,
  CardContent,
  Container
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  ShoppingCart as ShoppingCartIcon,
  Store as StoreIcon,
  Clear as ClearIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import ClientLayout from '../../../components/client/ClientLayout';
import {
  useGetTireCartsQuery,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
  useClearCartMutation,
  useDeleteCartMutation,
  useCreateTireOrdersMutation,
  TireCart
} from '../../../api/tireCarts.api';
import { useAppSelector } from '../../../store';

const CartPage: React.FC = () => {
  const { t } = useTranslation(['client', 'common']);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [orderData, setOrderData] = useState({
    client_name: '',
    client_phone: '',
    comment: ''
  });
  const [selectedCartForOrder, setSelectedCartForOrder] = useState<TireCart | null>(null);

  const {
    data: carts = [],
    isLoading,
    isError,
    error
  } = useGetTireCartsQuery(undefined, {
    skip: !isAuthenticated
  });

  const [updateCartItem, { isLoading: isUpdatingItem }] = useUpdateCartItemMutation();
  const [removeCartItem, { isLoading: isRemovingItem }] = useRemoveCartItemMutation();
  const [clearCart, { isLoading: isClearingCart }] = useClearCartMutation();
  const [deleteCart, { isLoading: isDeletingCart }] = useDeleteCartMutation();
  const [createOrders, { isLoading: isCreatingOrders }] = useCreateTireOrdersMutation();

  // Автозаполнение контактных данных
  React.useEffect(() => {
    if (isAuthenticated && user) {
      setOrderData(prev => ({
        ...prev,
        client_name: user.first_name || '',
        client_phone: user.phone || ''
      }));
    }
  }, [isAuthenticated, user]);

  const handleQuantityChange = async (cartId: number, itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    try {
      await updateCartItem({
        cartId,
        itemId,
        quantity: newQuantity
      }).unwrap();
    } catch (error) {
      console.error('Ошибка обновления количества:', error);
    }
  };

  const handleRemoveItem = async (cartId: number, itemId: number) => {
    try {
      await removeCartItem({ cartId, itemId }).unwrap();
    } catch (error) {
      console.error('Ошибка удаления товара:', error);
    }
  };

  const handleClearCart = async (cartId: number) => {
    try {
      await clearCart(cartId).unwrap();
    } catch (error) {
      console.error('Ошибка очистки корзины:', error);
    }
  };

  const handleDeleteCart = async (cartId: number) => {
    try {
      await deleteCart(cartId).unwrap();
    } catch (error) {
      console.error('Ошибка удаления корзины:', error);
    }
  };

  const handleOrderCart = (cart: TireCart) => {
    setSelectedCartForOrder(cart);
    setOrderDialogOpen(true);
  };

  const handleCreateOrder = async () => {
    if (!selectedCartForOrder || !orderData.client_name.trim() || !orderData.client_phone.trim()) {
      return;
    }

    try {
      const result = await createOrders({
        client_name: orderData.client_name,
        client_phone: orderData.client_phone,
        comment: orderData.comment
      }).unwrap();

      setOrderDialogOpen(false);
      setSelectedCartForOrder(null);
      setOrderData({ client_name: '', client_phone: '', comment: '' });

      // Перенаправляем на страницу заказов
      navigate('/client/orders');
    } catch (error) {
      console.error('Ошибка создания заказа:', error);
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

  if (!isAuthenticated) {
    return (
      <ClientLayout>
        <Container maxWidth="lg">
          <Alert severity="warning" sx={{ mt: 3 }}>
            Для просмотра корзины необходимо войти в систему
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
            Ошибка загрузки корзины. Попробуйте обновить страницу.
          </Alert>
        </Container>
      </ClientLayout>
    );
  }

  if (carts.length === 0) {
    return (
      <ClientLayout>
        <Container maxWidth="lg">
          <Box textAlign="center" py={8}>
            <ShoppingCartIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              Корзина пуста
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Добавьте товары в корзину, чтобы оформить заказ
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/client/tire-offers')}
              startIcon={<ShoppingCartIcon />}
            >
              Перейти к покупкам
            </Button>
          </Box>
        </Container>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <Container maxWidth="lg">
        <Box sx={{ py: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Корзина ({carts.reduce((total, cart) => total + cart.items_count, 0)} товаров)
          </Typography>

          {carts.map((cart) => (
            <Card key={cart.id} sx={{ mb: 3 }}>
              <CardContent>
                {/* Заголовок корзины с поставщиком */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <StoreIcon color="primary" />
                    <Box>
                      <Typography variant="h6">
                        {cart.supplier.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {cart.items_count} товаров на сумму {formatPrice(cart.total_amount)}
                      </Typography>
                    </Box>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleClearCart(cart.id)}
                      disabled={isClearingCart}
                      startIcon={<ClearIcon />}
                    >
                      Очистить
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleOrderCart(cart)}
                      disabled={cart.items.length === 0}
                      startIcon={<ReceiptIcon />}
                    >
                      Заказать
                    </Button>
                  </Stack>
                </Box>

                <Divider sx={{ mb: 2 }} />

                {/* Таблица товаров */}
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Товар</TableCell>
                        <TableCell>Размер</TableCell>
                        <TableCell>Сезон</TableCell>
                        <TableCell>Цена</TableCell>
                        <TableCell>Количество</TableCell>
                        <TableCell>Сумма</TableCell>
                        <TableCell>Действия</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {cart.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" fontWeight="bold">
                                {item.supplier_tire_product.brand} {item.supplier_tire_product.model}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {item.supplier_tire_product.name}
                              </Typography>
                              {!item.available && (
                                <Chip 
                                  label="Недоступен" 
                                  size="small" 
                                  color="error" 
                                  sx={{ ml: 1 }} 
                                />
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={item.supplier_tire_product.size} 
                              size="small" 
                              color="primary" 
                            />
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={
                                item.supplier_tire_product.season === 'winter' ? 'Зимние' :
                                item.supplier_tire_product.season === 'summer' ? 'Летние' : 'Всесезонные'
                              } 
                              size="small" 
                              color="secondary" 
                            />
                          </TableCell>
                          <TableCell>
                            {formatPrice(item.price_at_order)}
                          </TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              <IconButton
                                size="small"
                                onClick={() => handleQuantityChange(cart.id, item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1 || isUpdatingItem}
                              >
                                <RemoveIcon />
                              </IconButton>
                              <TextField
                                value={item.quantity}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value) || 1;
                                  handleQuantityChange(cart.id, item.id, value);
                                }}
                                type="number"
                                inputProps={{ min: 1, max: 99 }}
                                sx={{ width: 60 }}
                                size="small"
                              />
                              <IconButton
                                size="small"
                                onClick={() => handleQuantityChange(cart.id, item.id, item.quantity + 1)}
                                disabled={item.quantity >= 99 || isUpdatingItem}
                              >
                                <AddIcon />
                              </IconButton>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography fontWeight="bold">
                              {formatPrice(item.total_price)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <IconButton
                              color="error"
                              onClick={() => handleRemoveItem(cart.id, item.id)}
                              disabled={isRemovingItem}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Диалог оформления заказа */}
        <Dialog open={orderDialogOpen} onClose={() => setOrderDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Оформление заказа</DialogTitle>
          <DialogContent>
            {selectedCartForOrder && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Поставщик: {selectedCartForOrder.supplier.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {selectedCartForOrder.items_count} товаров на сумму {formatPrice(selectedCartForOrder.total_amount)}
                </Typography>
                
                <Divider sx={{ my: 2 }} />

                <TextField
                  label="Имя *"
                  value={orderData.client_name}
                  onChange={(e) => setOrderData({ ...orderData, client_name: e.target.value })}
                  fullWidth
                  sx={{ mb: 2 }}
                  required
                />

                <TextField
                  label="Телефон *"
                  value={orderData.client_phone}
                  onChange={(e) => setOrderData({ ...orderData, client_phone: e.target.value })}
                  fullWidth
                  sx={{ mb: 2 }}
                  required
                  placeholder="+380671234567"
                />

                <TextField
                  label="Комментарий"
                  value={orderData.comment}
                  onChange={(e) => setOrderData({ ...orderData, comment: e.target.value })}
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Дополнительные пожелания к заказу..."
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOrderDialogOpen(false)}>
              Отмена
            </Button>
            <Button
              variant="contained"
              onClick={handleCreateOrder}
              disabled={
                isCreatingOrders || 
                !orderData.client_name.trim() || 
                !orderData.client_phone.trim()
              }
              startIcon={isCreatingOrders ? <CircularProgress size={20} /> : <ReceiptIcon />}
            >
              {isCreatingOrders ? 'Оформление...' : 'Оформить заказ'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ClientLayout>
  );
};

export default CartPage;