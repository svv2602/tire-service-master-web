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
  Divider,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Chip,
  Stack
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  ShoppingCart as CartIcon,
  LocalOffer as OfferIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAddToUnifiedCartMutation } from '../../../api/unifiedTireCart.api';
import { useAppSelector } from '../../../store';
import { SupplierProduct } from '../../../api/suppliers.api';

interface OrderModalProps {
  open: boolean;
  onClose: () => void;
  product: SupplierProduct | null;
}

interface ContactInfo {
  name: string;
  phone: string;
}

const OrderModal: React.FC<OrderModalProps> = ({ open, onClose, product }) => {
  const { t } = useTranslation(['client', 'common']);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  
  const [quantity, setQuantity] = useState(1);
  const [comment, setComment] = useState('');
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    name: '',
    phone: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [addToCart, { isLoading: isAddingToCart }] = useAddToUnifiedCartMutation();

  // Автозаполнение контактных данных для авторизованных пользователей
  useEffect(() => {
    if (isAuthenticated && user) {
      setContactInfo({
        name: user.first_name || '',
        phone: user.phone || ''
      });
    } else {
      setContactInfo({ name: '', phone: '' });
    }
  }, [isAuthenticated, user]);

  // Сброс формы при открытии модального окна
  useEffect(() => {
    if (open) {
      setQuantity(1);
      setComment('');
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

    if (!contactInfo.name.trim()) {
      newErrors.name = 'Имя обязательно для заполнения';
    }

    if (!contactInfo.phone.trim()) {
      newErrors.phone = 'Телефон обязателен для заполнения';
    } else if (!/^\+?[0-9]{10,15}$/.test(contactInfo.phone.replace(/[\s\-\(\)]/g, ''))) {
      newErrors.phone = 'Некорректный формат телефона';
    }

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
      } else if (error.status === 401) {
        setErrors({ submit: 'Необходима авторизация для добавления в корзину' });
      } else {
        setErrors({ submit: 'Произошла ошибка при добавлении товара в корзину' });
      }
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
        <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
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

        {/* Выбор количества */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Количество
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
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
            <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
              Итого: <strong>{formatPrice(totalPrice)}</strong>
            </Typography>
          </Box>
        </Box>

        {/* Комментарий */}
        <TextField
          label="Комментарий (необязательно)"
          multiline
          rows={2}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          fullWidth
          sx={{ mb: 3 }}
          placeholder="Дополнительные пожелания к заказу..."
        />

        <Divider sx={{ my: 2 }} />

        {/* Контактная информация */}
        <Typography variant="subtitle1" gutterBottom>
          Контактная информация
        </Typography>
        
        {isAuthenticated && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Данные заполнены автоматически из вашего профиля
          </Alert>
        )}

        <TextField
          label="Имя *"
          value={contactInfo.name}
          onChange={(e) => setContactInfo({ ...contactInfo, name: e.target.value })}
          fullWidth
          sx={{ mb: 2 }}
          error={!!errors.name}
          helperText={errors.name}
          placeholder="Ваше имя"
        />

        <TextField
          label="Телефон *"
          value={contactInfo.phone}
          onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
          fullWidth
          sx={{ mb: 2 }}
          error={!!errors.phone}
          helperText={errors.phone || 'Формат: +380671234567'}
          placeholder="+380671234567"
        />

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
    </Dialog>
  );
};

export default OrderModal;