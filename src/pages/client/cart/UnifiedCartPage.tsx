import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
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
  Container,
  Grid,
  Avatar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  ShoppingCart as ShoppingCartIcon,
  Store as StoreIcon,
  Clear as ClearIcon,
  Receipt as ReceiptIcon,
  ExpandMore as ExpandMoreIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  Comment as CommentIcon,
  LocalOffer as PriceIcon,
  Inventory as QuantityIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import ClientLayout from '../../../components/client/ClientLayout';
import {
  useGetUnifiedTireCartQuery,
  useUpdateUnifiedCartItemMutation,
  useRemoveUnifiedCartItemMutation,
  useClearUnifiedCartMutation,
  useCreateOrdersFromUnifiedCartMutation,
  UnifiedTireCart,
  UnifiedTireCartItem,
  SupplierGroup
} from '../../../api/unifiedTireCart.api';
import { useAppSelector } from '../../../store';

const UnifiedCartPage: React.FC = () => {
  const { t } = useTranslation(['client', 'common']);
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  // Состояния
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [isCreatingOrders, setIsCreatingOrders] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    name: user?.first_name || '',
    phone: user?.phone || ''
  });
  const [supplierComments, setSupplierComments] = useState<Record<string, string>>({});
  const [expandedSuppliers, setExpandedSuppliers] = useState<Record<string, boolean>>({});

  // API хуки
  const {
    data: cartResponse,
    isLoading,
    isError,
    error
  } = useGetUnifiedTireCartQuery(undefined, {
    skip: !isAuthenticated
  });

  const [updateCartItem] = useUpdateUnifiedCartItemMutation();
  const [removeCartItem] = useRemoveUnifiedCartItemMutation();
  const [clearCart] = useClearUnifiedCartMutation();
  const [createOrders] = useCreateOrdersFromUnifiedCartMutation();

  // Проверяем, является ли ошибка серьезной (не 404 - пустая корзина)
  const isSerialError = isError && error && 'status' in error && error.status !== 404;

  if (isSerialError) {
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

  const cart = cartResponse?.cart;
  const isEmpty = !cart || cart.total_items_count === 0;
  const suppliersCount = cart?.suppliers?.length || 0;

  if (isEmpty) {
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

  // Обработчики изменения количества
  const handleQuantityChange = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    try {
      await updateCartItem({ item_id: itemId, quantity: newQuantity }).unwrap();
    } catch (error) {
      console.error('Ошибка обновления количества:', error);
    }
  };

  // Обработчик удаления товара
  const handleRemoveItem = async (itemId: number) => {
    try {
      await removeCartItem({ item_id: itemId }).unwrap();
    } catch (error) {
      console.error('Ошибка удаления товара:', error);
    }
  };

  // Обработчик очистки корзины
  const handleClearCart = async () => {
    try {
      await clearCart().unwrap();
      setClearDialogOpen(false);
    } catch (error) {
      console.error('Ошибка очистки корзины:', error);
    }
  };

  // Обработчик создания заказов
  const handleCreateOrders = async () => {
    if (!contactInfo.name.trim() || !contactInfo.phone.trim()) {
      return;
    }

    setIsCreatingOrders(true);
    try {
      const result = await createOrders({
        client_name: contactInfo.name,
        client_phone: contactInfo.phone,
        comments_by_supplier: supplierComments
      }).unwrap();

      setOrderDialogOpen(false);
      
      // Показываем успешное сообщение и перенаправляем
      alert(`Заказы успешно созданы! Количество заказов: ${result.orders.length}`);
      navigate('/client/orders');
      
    } catch (error) {
      console.error('Ошибка создания заказов:', error);
    } finally {
      setIsCreatingOrders(false);
    }
  };

  // Переключение раскрытия поставщика
  const toggleSupplierExpanded = (supplierId: string) => {
    setExpandedSuppliers(prev => ({
      ...prev,
      [supplierId]: !prev[supplierId]
    }));
  };

  // Рендер товара
  const renderCartItem = (item: UnifiedTireCartItem) => (
    <Card key={item.id} variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          {/* Изображение товара */}
          <Grid item xs={12} sm={2}>
            <Avatar
              src={item.product.image_url}
              variant="rounded"
              sx={{ width: 80, height: 80, mx: 'auto' }}
            >
              <ShoppingCartIcon />
            </Avatar>
          </Grid>

          {/* Информация о товаре */}
          <Grid item xs={12} sm={5}>
            <Typography variant="h6" gutterBottom>
              {item.product.brand} {item.product.model}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Размер: {item.product.size}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Сезон: {item.product.season}
            </Typography>
            <Chip 
              label={item.available ? 'В наличии' : 'Нет в наличии'} 
              color={item.available ? 'success' : 'error'}
              size="small"
              sx={{ mt: 1 }}
            />
          </Grid>

          {/* Цена */}
          <Grid item xs={12} sm={2}>
            <Typography variant="h6" color="primary">
              {item.price_at_add.toFixed(0)} ₴
            </Typography>
            {item.current_price !== item.price_at_add && (
              <Typography variant="body2" color="text.secondary">
                Сейчас: {item.current_price.toFixed(0)} ₴
              </Typography>
            )}
          </Grid>

          {/* Количество */}
          <Grid item xs={12} sm={2}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <IconButton
                size="small"
                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                disabled={item.quantity <= 1}
              >
                <RemoveIcon />
              </IconButton>
              <TextField
                size="small"
                value={item.quantity}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 1;
                  handleQuantityChange(item.id, value);
                }}
                inputProps={{ min: 1, style: { textAlign: 'center', width: '60px' } }}
              />
              <IconButton
                size="small"
                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
              >
                <AddIcon />
              </IconButton>
            </Stack>
          </Grid>

          {/* Действия */}
          <Grid item xs={12} sm={1}>
            <IconButton
              color="error"
              onClick={() => handleRemoveItem(item.id)}
            >
              <DeleteIcon />
            </IconButton>
          </Grid>
        </Grid>

        {/* Общая стоимость товара */}
        <Box sx={{ mt: 2, textAlign: 'right' }}>
          <Typography variant="h6">
            Итого: {item.total_price.toFixed(0)} ₴
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

  // Рендер группы поставщика
  const renderSupplierGroup = (supplierId: string, group: SupplierGroup) => {
    const isExpanded = expandedSuppliers[supplierId] !== false; // По умолчанию раскрыто

    return (
      <Accordion 
        key={supplierId}
        expanded={isExpanded}
        onChange={() => toggleSupplierExpanded(supplierId)}
        sx={{ mb: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <StoreIcon sx={{ mr: 2, color: 'primary.main' }} />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6">
                {group.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {group.items_count} товар(ов) • {group.total_amount.toFixed(0)} ₴
              </Typography>
            </Box>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            {group.items.map(renderCartItem)}
          </Stack>
        </AccordionDetails>
      </Accordion>
    );
  };

  if (isLoading) {
    return (
      <ClientLayout>
        <Container maxWidth="lg">
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        </Container>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Заголовок */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            <ShoppingCartIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
            Корзина
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {cart.total_items_count} товар(ов) от {suppliersCount} поставщик(ов)
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* Товары в корзине */}
          <Grid item xs={12} md={8}>
            <Stack spacing={3}>
              {cart.suppliers.map((group) =>
                renderSupplierGroup(group.id.toString(), group)
              )}
            </Stack>
          </Grid>

          {/* Сводка заказа */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
              <Typography variant="h6" gutterBottom>
                Сводка заказа
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Товаров:</Typography>
                  <Typography>{cart.total_items_count}</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Поставщиков:</Typography>
                  <Typography>{suppliersCount}</Typography>
                </Box>
                
                <Divider />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6">Итого:</Typography>
                  <Typography variant="h6" color="primary">
                    {cart.total_amount.toFixed(0)} ₴
                  </Typography>
                </Box>
              </Stack>

              <Stack spacing={2} sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  startIcon={<ReceiptIcon />}
                  onClick={() => setOrderDialogOpen(true)}
                >
                  Оформить заказы
                </Button>
                
                <Button
                  variant="outlined"
                  color="error"
                  fullWidth
                  startIcon={<ClearIcon />}
                  onClick={() => setClearDialogOpen(true)}
                >
                  Очистить корзину
                </Button>
                
                <Button
                  variant="text"
                  fullWidth
                  onClick={() => navigate('/client/tire-offers')}
                >
                  Продолжить покупки
                </Button>
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        {/* Диалог оформления заказа */}
        <Dialog 
          open={orderDialogOpen} 
          onClose={() => setOrderDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Typography variant="h6">
              <ReceiptIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Оформление заказов
            </Typography>
          </DialogTitle>
          
          <DialogContent dividers>
            <Stack spacing={3}>
              {/* Контактные данные */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  Контактные данные
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Имя</InputLabel>
                      <OutlinedInput
                        value={contactInfo.name}
                        onChange={(e) => setContactInfo(prev => ({ ...prev, name: e.target.value }))}
                        startAdornment={
                          <InputAdornment position="start">
                            <PersonIcon />
                          </InputAdornment>
                        }
                        label="Имя"
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Телефон</InputLabel>
                      <OutlinedInput
                        value={contactInfo.phone}
                        onChange={(e) => setContactInfo(prev => ({ ...prev, phone: e.target.value }))}
                        startAdornment={
                          <InputAdornment position="start">
                            <PhoneIcon />
                          </InputAdornment>
                        }
                        label="Телефон"
                      />
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>

              {/* Комментарии для поставщиков */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  Комментарии для поставщиков
                </Typography>
                <Stack spacing={2}>
                  {cart.suppliers.map((group) => (
                    <Box key={group.id}>
                      <Typography variant="subtitle2" gutterBottom>
                        {group.name}
                      </Typography>
                      <TextField
                        fullWidth
                        multiline
                        rows={2}
                        placeholder={`Комментарий для ${group.name} (необязательно)`}
                        value={supplierComments[group.id.toString()] || ''}
                        onChange={(e) => setSupplierComments(prev => ({
                          ...prev,
                          [group.id.toString()]: e.target.value
                        }))}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <CommentIcon />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Box>
                  ))}
                </Stack>
              </Box>

              {/* Сводка заказов */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  Будет создано заказов: {suppliersCount}
                </Typography>
                <Stack spacing={1}>
                  {cart.suppliers.map((group) => (
                    <Box key={group.id} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Typography variant="subtitle2">
                        {group.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {group.items_count} товар(ов) • {group.total_amount.toFixed(0)} ₴
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Stack>
          </DialogContent>
          
          <DialogActions>
            <Button onClick={() => setOrderDialogOpen(false)}>
              Отмена
            </Button>
            <Button
              variant="contained"
              onClick={handleCreateOrders}
              disabled={!contactInfo.name.trim() || !contactInfo.phone.trim() || isCreatingOrders}
              startIcon={isCreatingOrders ? <CircularProgress size={20} /> : <ReceiptIcon />}
            >
              {isCreatingOrders ? 'Создание...' : 'Создать заказы'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Диалог очистки корзины */}
        <Dialog open={clearDialogOpen} onClose={() => setClearDialogOpen(false)}>
          <DialogTitle>Очистить корзину?</DialogTitle>
          <DialogContent>
            <Typography>
              Вы уверены, что хотите удалить все товары из корзины? Это действие нельзя отменить.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setClearDialogOpen(false)}>
              Отмена
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleClearCart}
              startIcon={<ClearIcon />}
            >
              Очистить
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ClientLayout>
  );
};

export default UnifiedCartPage;