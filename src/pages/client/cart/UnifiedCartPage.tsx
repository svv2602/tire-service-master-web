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
import ProductImagePreview from '../../../components/client/cart/ProductImagePreview';
import {
  useGetUnifiedTireCartQuery,
  useUpdateUnifiedCartItemMutation,
  useRemoveUnifiedCartItemMutation,
  useClearUnifiedCartMutation,
  useCreateOrdersFromUnifiedCartMutation,
  useCreateSupplierOrderMutation,
  UnifiedTireCart,
  UnifiedTireCartItem,
  SupplierGroup
} from '../../../api/unifiedTireCart.api';
import { useAppSelector } from '../../../store';

const UnifiedCartPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  // Состояния
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [isCreatingOrders, setIsCreatingOrders] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null); // Для заказа одного поставщика
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
  } = useGetUnifiedTireCartQuery();

  const [updateCartItem] = useUpdateUnifiedCartItemMutation();
  const [removeCartItem] = useRemoveUnifiedCartItemMutation();
  const [clearCart] = useClearUnifiedCartMutation();
  const [createOrders] = useCreateOrdersFromUnifiedCartMutation();
  const [createSupplierOrder] = useCreateSupplierOrderMutation();

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
              {t('cart.empty.title')}
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {t('cart.empty.message')}
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/client/tire-offers')}
              startIcon={<ShoppingCartIcon />}
            >
              {t('cart.empty.goShopping')}
            </Button>
          </Box>
        </Container>
      </ClientLayout>
    );
  }

  // Обработчики изменения количества
  const handleQuantityChange = async (itemId: number, newQuantity: number) => {
    console.log('handleQuantityChange called:', { itemId, newQuantity });
    if (newQuantity < 1) return;
    
    try {
      const result = await updateCartItem({ item_id: itemId, quantity: newQuantity }).unwrap();
      console.log('Количество обновлено:', result);
    } catch (error) {
      console.error('Ошибка обновления количества:', error);
    }
  };

  // Обработчик удаления товара
  const handleRemoveItem = async (itemId: number) => {
    console.log('handleRemoveItem called:', { itemId });
    try {
      const result = await removeCartItem({ item_id: itemId }).unwrap();
      console.log('Товар удален:', result);
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

  // Обработчик создания заказов (для всех поставщиков)
  const handleCreateAllOrders = async () => {
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
      setSelectedSupplierId(null); // Сбрасываем выбранного поставщика
      
      // Показываем успешное сообщение и перенаправляем
      alert(`Заказы успешно созданы! Количество заказов: ${result.orders.length}`);
      navigate('/client/orders');
      
    } catch (error) {
      console.error('Ошибка создания заказов:', error);
    } finally {
      setIsCreatingOrders(false);
    }
  };

  // Обработчик создания заказа для одного поставщика
  const handleCreateSingleSupplierOrder = async () => {
    if (!contactInfo.name.trim() || !contactInfo.phone.trim() || !selectedSupplierId) {
      return;
    }

    setIsCreatingOrders(true);
    try {
      const result = await createSupplierOrder({
        supplier_id: parseInt(selectedSupplierId),
        client_name: contactInfo.name,
        client_phone: contactInfo.phone,
        comment: supplierComments[selectedSupplierId] || ''
      }).unwrap();

      setOrderDialogOpen(false);
      setSelectedSupplierId(null); // Сбрасываем выбранного поставщика
      
      // Показываем успешное сообщение и перенаправляем
      alert(`Заказ успешно создан! ID заказа: ${result.orders[0]?.id}`);
      navigate('/client/orders');
      
    } catch (error) {
      console.error('Ошибка создания заказа поставщика:', error);
    } finally {
      setIsCreatingOrders(false);
    }
  };

  // Универсальный обработчик создания заказов
  const handleCreateOrders = () => {
    if (selectedSupplierId) {
      // Создаем заказ для одного поставщика
      handleCreateSingleSupplierOrder();
    } else {
      // Создаем заказы для всех поставщиков
      handleCreateAllOrders();
    }
  };

  // Переключение раскрытия поставщика
  const toggleSupplierExpanded = (supplierId: string) => {
    setExpandedSuppliers(prev => ({
      ...prev,
      [supplierId]: !prev[supplierId]
    }));
  };

  // Обработчик создания заказа для конкретного поставщика
  const handleCreateSupplierOrder = (supplierId: string) => {
    const supplier = cart?.suppliers?.find(s => s.id.toString() === supplierId);
    if (!supplier) return;

    // Сохраняем ID выбранного поставщика
    setSelectedSupplierId(supplierId);
    
    // Устанавливаем комментарий для этого поставщика (если его еще нет)
    setSupplierComments(prev => ({
      ...prev,
      [supplierId]: prev[supplierId] || ''
    }));
    
    // Всегда открываем модальное окно для подтверждения и ввода данных
    setOrderDialogOpen(true);
    
    console.log('Открытие модального окна для заказа поставщика:', supplier.name);
  };

  // Рендер товара
  const renderCartItem = (item: UnifiedTireCartItem) => (
    <Card key={item.id} variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          {/* Изображение товара */}
          <Grid item xs={12} sm={2}>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <ProductImagePreview
                imageUrl={item.product.image_url}
                productName={item.product.name}
                brand={item.product.brand}
                model={item.product.model}
                size={item.product.size}
                season={item.product.season}
                width={100}
                height={100}
              />
            </Box>
          </Grid>

          {/* Информация о товаре */}
          <Grid item xs={12} sm={5}>
            <Typography variant="h6" gutterBottom>
              {item.product.brand} {item.product.model}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('cart.items.size')}: {item.product.size}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('cart.items.season')}: {item.product.season}
            </Typography>
            <Chip 
              label={item.available ? t('cart.items.inStock') : t('cart.items.outOfStock')} 
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
                {t('cart.items.currentPrice')}: {item.current_price.toFixed(0)} ₴
              </Typography>
            )}
          </Grid>

          {/* Количество */}
          <Grid item xs={12} sm={2}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {t('cart.items.quantity')}
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ justifyContent: 'center' }}>
                <IconButton
                  size="small"
                  onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  sx={{
                    bgcolor: 'primary.100',
                    color: 'primary.main',
                    '&:hover': { bgcolor: 'primary.200' },
                    '&:disabled': { 
                      bgcolor: 'grey.300',
                      color: 'grey.500'
                    }
                  }}
                >
                  <RemoveIcon fontSize="small" />
                </IconButton>
                <Box
                  sx={{
                    minWidth: 50,
                    textAlign: 'center',
                    py: 1,
                    px: 2,
                    bgcolor: 'primary.50',
                    border: '2px solid',
                    borderColor: 'primary.main',
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold' }}>
                    {item.quantity}
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                  sx={{
                    bgcolor: 'primary.100',
                    color: 'primary.main',
                    '&:hover': { bgcolor: 'primary.200' }
                  }}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Box>
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
            {t('cart.items.total')}: {item.total_price.toFixed(0)} ₴
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
                {group.items_count} {t('cart.supplier.totalItems')} • {group.total_amount.toFixed(0)} ₴
              </Typography>
            </Box>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            {group.items.map(renderCartItem)}
            
            {/* Кнопка оформления заказа для поставщика */}
            <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h6" color="primary.main" gutterBottom>
                    {t('cart.supplier.totalBySupplier')}: {group.total_amount.toFixed(0)} ₴
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {group.items_count} {t('cart.supplier.totalItems')} {t('cart.supplier.from')} {group.name}
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<ReceiptIcon />}
                  onClick={() => handleCreateSupplierOrder(supplierId)}
                  sx={{
                    minWidth: 200,
                    py: 1.5,
                    bgcolor: 'success.main',
                    '&:hover': { bgcolor: 'success.dark' }
                  }}
                >
                  {t('cart.supplier.createOrder')}
                </Button>
              </Stack>
            </Box>
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
              {t('cart.title')}
            </Typography>
          <Typography variant="body1" color="text.secondary">
{cart.total_items_count} {t('cart.supplier.totalItems')} {t('cart.supplier.from')} {suppliersCount} {t('cart.summary.suppliers')}
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
                  onClick={() => {
                    setSelectedSupplierId(null); // Сбрасываем выбранного поставщика для заказа всех
                    setOrderDialogOpen(true);
                  }}
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
          onClose={() => {
            setOrderDialogOpen(false);
            setSelectedSupplierId(null); // Сбрасываем выбранного поставщика при закрытии
          }}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Typography variant="h6">
              <ReceiptIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              {selectedSupplierId 
                ? `${t('cart.order.dialog.title')} - ${cart?.suppliers?.find(s => s.id.toString() === selectedSupplierId)?.name}` 
                : t('cart.order.dialog.title')
              }
            </Typography>
          </DialogTitle>
          
          <DialogContent dividers>
            <Stack spacing={3}>
              {/* Контактные данные */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  {t('cart.order.dialog.contactInfo')}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>{t('cart.order.dialog.name')}</InputLabel>
                      <OutlinedInput
                        value={contactInfo.name}
                        onChange={(e) => setContactInfo(prev => ({ ...prev, name: e.target.value }))}
                        startAdornment={
                          <InputAdornment position="start">
                            <PersonIcon />
                          </InputAdornment>
                        }
                        label={t('cart.order.dialog.name')}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>{t('cart.order.dialog.phone')}</InputLabel>
                      <OutlinedInput
                        value={contactInfo.phone}
                        onChange={(e) => setContactInfo(prev => ({ ...prev, phone: e.target.value }))}
                        startAdornment={
                          <InputAdornment position="start">
                            <PhoneIcon />
                          </InputAdornment>
                        }
                        label={t('cart.order.dialog.phone')}
                      />
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>

              {/* Комментарии для поставщиков */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  {t('cart.order.dialog.comments')}
                </Typography>
                <Stack spacing={2}>
                  {(selectedSupplierId 
                    ? cart.suppliers.filter(s => s.id.toString() === selectedSupplierId)
                    : cart.suppliers
                  ).map((group) => (
                    <Box key={group.id}>
                      <Typography variant="subtitle2" gutterBottom>
                        {group.name}
                      </Typography>
                      <TextField
                        fullWidth
                        multiline
                        rows={2}
                        placeholder={t('cart.order.dialog.commentPlaceholder', { supplierName: group.name })}
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
                  {t('cart.order.dialog.summary', { 
                    count: selectedSupplierId ? 1 : suppliersCount 
                  })}
                </Typography>
                <Stack spacing={1}>
                  {(selectedSupplierId 
                    ? cart.suppliers.filter(s => s.id.toString() === selectedSupplierId)
                    : cart.suppliers
                  ).map((group) => (
                    <Box key={group.id} sx={{ p: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
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
            <Button onClick={() => {
              setOrderDialogOpen(false);
              setSelectedSupplierId(null); // Сбрасываем выбранного поставщика при отмене
            }}>
              {t('cart.order.dialog.cancel')}
            </Button>
            <Button
              variant="contained"
              onClick={handleCreateOrders}
              disabled={!contactInfo.name.trim() || !contactInfo.phone.trim() || isCreatingOrders}
              startIcon={isCreatingOrders ? <CircularProgress size={20} /> : <ReceiptIcon />}
            >
              {isCreatingOrders ? t('cart.order.dialog.creating') : t('cart.order.dialog.create')}
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