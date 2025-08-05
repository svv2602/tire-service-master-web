import React from 'react';
import {
  Badge,
  IconButton,
  Tooltip,
  Box
} from '@mui/material';
import {
  ShoppingCart as ShoppingCartIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useGetTireCartsQuery } from '../../../api/tireCarts.api';
import { useAppSelector } from '../../../store';

const CartIndicator: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  
  // Загружаем корзины только для авторизованных пользователей
  const { 
    data: carts = [], 
    isLoading,
    isError,
    error
  } = useGetTireCartsQuery(undefined, {
    skip: !isAuthenticated
  });

  // Подсчитываем общее количество товаров во всех корзинах
  const totalItems = carts.reduce((total, cart) => total + cart.items_count, 0);

  const handleCartClick = () => {
    navigate('/client/cart');
  };

  // Не показываем индикатор для неавторизованных пользователей
  if (!isAuthenticated) {
    return null;
  }

  // Проверяем, является ли ошибка серьезной (не 404 - пустая корзина)
  const isSerialError = isError && error && 'status' in error && error.status !== 404;

  // Не показываем индикатор во время загрузки или при серьезной ошибке
  if (isLoading || isSerialError) {
    return (
      <Tooltip title="Корзина">
        <IconButton 
          color="inherit" 
          onClick={handleCartClick}
          sx={{ 
            color: 'inherit',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)'
            }
          }}
        >
          <ShoppingCartIcon />
        </IconButton>
      </Tooltip>
    );
  }

  return (
    <Tooltip title={`Корзина (${totalItems} товаров)`}>
      <IconButton 
        color="inherit" 
        onClick={handleCartClick}
        sx={{ 
          color: 'inherit',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)'
          }
        }}
      >
        <Badge 
          badgeContent={totalItems} 
          color="error"
          sx={{
            '& .MuiBadge-badge': {
              backgroundColor: '#f44336',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '0.75rem',
              minWidth: '20px',
              height: '20px',
              borderRadius: '10px'
            }
          }}
          invisible={totalItems === 0}
        >
          <ShoppingCartIcon />
        </Badge>
      </IconButton>
    </Tooltip>
  );
};

export default CartIndicator;