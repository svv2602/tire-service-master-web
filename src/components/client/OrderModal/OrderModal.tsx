import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
  CircularProgress,
  IconButton,
  Chip,
  Stack
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  ShoppingCart as CartIcon
} from '@mui/icons-material';

import { useAddToUnifiedCartMutation } from '../../../api/unifiedTireCart.api';
import { useAppSelector } from '../../../store';
import { SupplierProduct } from '../../../api/suppliers.api';
import { GuestCartDialog } from '../cart/GuestCartDialog';

interface OrderModalProps {
  open: boolean;
  onClose: () => void;
  product: SupplierProduct | null;
}



const OrderModal: React.FC<OrderModalProps> = ({ open, onClose, product }) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  
  const [quantity, setQuantity] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showGuestDialog, setShowGuestDialog] = useState(false);
  
  const [addToCart, { isLoading: isAddingToCart }] = useAddToUnifiedCartMutation();



  // Сброс формы при открытии модального окна
  useEffect(() => {
    if (open) {
      setQuantity(1);
      setErrors({});
    }
  }, [open]);

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= 99) {
      setQuantity(newQuantity);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (quantity < 1) {
      newErrors.quantity = 'Количество должно быть не менее 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!product || !validateForm()) {
      return;
    }

    // Если пользователь не авторизован, показываем диалог выбора
    if (!isAuthenticated) {
      setShowGuestDialog(true);
      return;
    }

    // Для авторизованных пользователей - сразу добавляем в корзину
    await addToCartDirectly();
  };

  const addToCartDirectly = async () => {
    if (!product) return;

    try {
      await addToCart({
        supplier_tire_product_id: product.id,
        quantity
      }).unwrap();

      // Успешное добавление в корзину
      onClose();
      
      // Можно добавить уведомление об успехе
      console.log('Товар успешно добавлен в корзину');
      
    } catch (error: any) {
      console.error('Ошибка добавления в корзину:', error);
      
      // Обработка специфических ошибок
      if (error.status === 422) {
        setErrors({ submit: 'Товар закончился на складе' });
      } else {
        setErrors({ submit: 'Произошла ошибка при добавлении товара в корзину' });
      }
    }
  };

  const handleGuestContinue = async () => {
    // Продолжаем как гость - добавляем товар в корзину
    await addToCartDirectly();
  };

  const handleLoginSuccess = async () => {
    // После успешного входа добавляем товар в корзину
    await addToCartDirectly();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uk-UA', {
      style: 'currency',
      currency: 'UAH',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const totalPrice = product ? parseFloat(product.price_uah || '0') * quantity : 0;

  if (!product) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" gap={1}>
          <CartIcon color="primary" />
          <Typography variant="h6" component="span">
            Заказать товар
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Информация о товаре */}
        <Box sx={{ 
          mb: 3, 
          p: 2, 
          border: 1, 
          borderColor: 'divider', 
          borderRadius: 1,
          display: 'flex',
          gap: 2
        }}>
          {/* Фото товара */}
          {product.image_url && (
            <Box
              component="img"
              src={product.image_url}
              alt={`${product.brand} ${product.model}`}
              sx={{
                width: 120,
                height: 120,
                objectFit: 'cover',
                borderRadius: 1,
                flexShrink: 0
              }}
            />
          )}
          
          {/* Информация о товаре */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" gutterBottom>
              {product.brand} {product.model}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
              <Chip label={product.size} size="small" color="primary" />
              <Chip 
                label={product.season === 'winter' ? 'Зимние' : 
                      product.season === 'summer' ? 'Летние' : 'Всесезонные'} 
                size="small" 
                color="secondary" 
              />
            </Stack>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {product.name}
            </Typography>
            <Typography variant="h6" color="primary">
              {formatPrice(parseFloat(product.price_uah || '0'))} за шт.
            </Typography>
          </Box>
        </Box>

        {/* Выбор количества */}
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Typography variant="subtitle1" gutterBottom>
            Количество
          </Typography>
          <Box display="flex" alignItems="center" justifyContent="center" gap={1} sx={{ mb: 2 }}>
            <IconButton 
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1}
              size="small"
            >
              <RemoveIcon />
            </IconButton>
            <TextField
              value={quantity}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 1;
                handleQuantityChange(value);
              }}
              type="number"
              inputProps={{ min: 1, max: 99 }}
              sx={{ width: 80 }}
              size="small"
              error={!!errors.quantity}
              helperText={errors.quantity}
            />
            <IconButton 
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={quantity >= 99}
              size="small"
            >
              <AddIcon />
            </IconButton>
          </Box>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
            Итого: {formatPrice(totalPrice)}
          </Typography>
        </Box>





        {/* Ошибки отправки */}
        {errors.submit && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {errors.submit}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} disabled={isAddingToCart}>
          Отмена
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isAddingToCart}
          startIcon={isAddingToCart ? <CircularProgress size={20} /> : <CartIcon />}
          sx={{ minWidth: 140 }}
        >
          {isAddingToCart ? 'Добавление...' : 'Добавить в корзину'}
        </Button>
      </DialogActions>

      {/* Диалог для гостевых пользователей */}
      <GuestCartDialog
        open={showGuestDialog}
        onClose={() => setShowGuestDialog(false)}
        onContinueAsGuest={handleGuestContinue}
        onLoginSuccess={handleLoginSuccess}
      />
    </Dialog>
  );
};

export default OrderModal;