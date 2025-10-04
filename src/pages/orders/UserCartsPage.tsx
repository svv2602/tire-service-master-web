import React, { useState, useMemo } from 'react';
import { Box, TextField, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Typography, Card, CardContent, Divider, List, ListItem, ListItemText } from '../../components/ui';
import { InputAdornment } from '@mui/material';;
import {
  Search as SearchIcon,
  ShoppingCart as CartIcon,
  Person as PersonIcon,
  Clear as ClearIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  ShoppingBag as ConvertIcon,
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
  useGetAllTireCartsQuery,
  useClearCartMutation,
  useDeleteCartMutation,
  TireCart,
  TireCartItem,
} from '../../api/tireCarts.api';

interface TireCartFilters {
  user_id?: string;
  search?: string;
}

const UserCartsPage: React.FC = () => {
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
  const [selectedCart, setSelectedCart] = useState<TireCart | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({ open: false, message: '', severity: 'info' });

  // Фильтры для API
  const filters: TireCartFilters = useMemo(() => {
    const result: TireCartFilters = {};
    if (searchQuery.trim()) {
      result.search = searchQuery.trim();
    }
    return result;
  }, [searchQuery]);

  // API запросы
  const {
    data: cartsResponse,
    isLoading,
    error,
    refetch,
  } = useGetAllTireCartsQuery({
    page: page + 1,
    per_page: rowsPerPage,
    ...filters,
  });

  // Мутации
  const [clearCart] = useClearCartMutation();
  const [deleteCart] = useDeleteCartMutation();

  const carts = cartsResponse?.carts || [];
  const totalCount = cartsResponse?.pagination?.total_count || 0;

  // Обработчики действий
  const handleClearCart = async (id: number) => {
    try {
      await clearCart(id).unwrap();
      setNotification({
        open: true,
        message: 'Корзина очищена',
        severity: 'success',
      });
      refetch();
    } catch (error: any) {
      setNotification({
        open: true,
        message: error.data?.error || 'Ошибка при очистке корзины',
        severity: 'error',
      });
    }
  };

  const handleDeleteCart = async (id: number) => {
    try {
      await deleteCart(id).unwrap();
      setNotification({
        open: true,
        message: 'Корзина удалена',
        severity: 'success',
      });
      refetch();
    } catch (error: any) {
      setNotification({
        open: true,
        message: error.data?.error || 'Ошибка при удалении корзины',
        severity: 'error',
      });
    }
  };

  // Функция для получения доступных действий
  const getCartActions = (cart: TireCart): ActionItem[] => {
    const actions: ActionItem[] = [];

    // Просмотр
    actions.push({
      label: 'Просмотр',
      icon: <ViewIcon />,
      onClick: () => {
        setSelectedCart(cart);
        setIsViewDialogOpen(true);
      },
    });

    // Очистить корзину
    if (cart.total_items_count > 0) {
      actions.push({
        label: 'Очистить',
        icon: <ClearIcon />,
        onClick: () => handleClearCart(cart.id),
        color: 'warning',
        requireConfirmation: true,
        confirmationConfig: {
          title: 'Подтверждение очистки',
          message: 'Вы уверены, что хотите очистить эту корзину?',
        },
      });
    }

    // Удалить корзину
    actions.push({
      label: 'Удалить',
      icon: <DeleteIcon />,
      onClick: () => handleDeleteCart(cart.id),
      color: 'error',
      requireConfirmation: true,
      confirmationConfig: {
        title: 'Подтверждение удаления',
        message: 'Вы уверены, что хотите удалить эту корзину?',
      },
    });

    return actions;
  };

  // Колонки таблицы
  const columns = [
    {
      id: 'id',
      label: 'ID',
      format: (value: any, cart: TireCart) => `#${cart.id}`,
    },
    {
      id: 'user_info',
      label: 'Пользователь',
      format: (value: any, cart: TireCart) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonIcon color="action" />
          <Box>
            <Typography variant="body2" fontWeight="medium">
              {cart.user?.first_name} {cart.user?.last_name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {cart.user?.email}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'items_count',
      label: 'Товаров',
      format: (value: any, cart: TireCart) => (
        <Chip
          label={`${cart.total_items_count} шт.`}
          color={cart.total_items_count > 0 ? 'primary' : 'default'}
          size="small"
        />
      ),
    },
    {
      id: 'total_amount',
      label: 'Сумма',
      format: (value: any, cart: TireCart) => (
        <Typography fontWeight="medium">
          {cart.total_amount || 0} ₴
        </Typography>
      ),
    },
    {
      id: 'suppliers_count',
      label: 'Поставщиков',
      format: (value: any, cart: TireCart) => cart.suppliers?.length || 0,
    },
    {
      id: 'updated_at',
      label: 'Обновлена',
      format: (value: any, cart: TireCart) => 
        new Date(cart.updated_at).toLocaleDateString('ru-RU'),
    },
    {
      id: 'actions',
      label: 'Действия',
      format: (value: any, cart: TireCart) => (
        <ActionsMenu actions={getCartActions(cart)} item={cart} />
      ),
    },
  ];

  if (isLoading) {
    return (
      <Box sx={pageStyles.pageContainer}>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography>Загрузка корзин...</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={pageStyles.pageContainer}>
      {/* Заголовок */}
      <Box sx={pageStyles.headerContainer}>
        <Box sx={pageStyles.titleContainer}>
          <CartIcon sx={pageStyles.titleIcon} />
          <Box>
            <Typography variant="h4" component="h1">
              Корзины пользователей
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {totalCount > 0 && `Всего корзин: ${totalCount}`}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Фильтры */}
      <Box sx={pageStyles.filtersContainer}>
        <TextField
          placeholder="Поиск по имени или email пользователя..."
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
      </Box>

      {/* Таблица */}
      <Box sx={pageStyles.tableContainer}>
        <Table
          columns={columns}
          rows={carts}
          loading={isLoading}
          empty={<Typography>Корзины не найдены</Typography>}
        />
      </Box>

      {/* Пагинация */}
      {totalCount > rowsPerPage && (
        <Box sx={pageStyles.paginationContainer}>
          <Pagination
            count={Math.ceil(totalCount / rowsPerPage)}
            page={page + 1}
            onChange={(newPage) => setPage(newPage - 1)}
            disabled={isLoading}
          />
        </Box>
      )}

      {/* Диалог просмотра корзины */}
      <Dialog
        open={isViewDialogOpen}
        onClose={() => setIsViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Корзина #{selectedCart?.id}
        </DialogTitle>
        <DialogContent>
          {selectedCart && (
            <Box>
              {/* Информация о пользователе */}
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Информация о пользователе
                  </Typography>
                  <Typography>
                    Имя: {selectedCart.user?.first_name} {selectedCart.user?.last_name}
                  </Typography>
                  <Typography>Email: {selectedCart.user?.email}</Typography>
                  <Typography>Телефон: {selectedCart.user?.phone || 'Не указан'}</Typography>
                </CardContent>
              </Card>

              {/* Статистика корзины */}
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Статистика корзины
                  </Typography>
                  <Typography>Всего товаров: {selectedCart.total_items_count}</Typography>
                  <Typography>Общая сумма: {selectedCart.total_amount || 0} ₴</Typography>
                  <Typography>Поставщиков: {selectedCart.suppliers?.length || 0}</Typography>
                  <Typography>
                    Последнее обновление: {new Date(selectedCart.updated_at).toLocaleString('ru-RU')}
                  </Typography>
                </CardContent>
              </Card>

              {/* Товары в корзине */}
              {selectedCart.tire_cart_items && selectedCart.tire_cart_items.length > 0 && (
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Товары в корзине
                    </Typography>
                    <List>
                      {selectedCart.tire_cart_items.map((item: TireCartItem, index: number) => (
                        <React.Fragment key={item.id}>
                          <ListItem>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <Typography>
                                    {item.supplier_tire_product?.name || 'Товар не найден'}
                                  </Typography>
                                  <Typography fontWeight="medium">
                                    {item.quantity} × {item.current_price} ₴ = {item.quantity * item.current_price} ₴
                                  </Typography>
                                </Box>
                              }
                              secondary={
                                <Typography variant="body2" color="text.secondary">
                                  Поставщик: {item.supplier_tire_product?.supplier?.name || 'Не указан'}
                                </Typography>
                              }
                            />
                          </ListItem>
                          {index < selectedCart.tire_cart_items.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              )}

              {selectedCart.total_items_count === 0 && (
                <Card>
                  <CardContent>
                    <Typography color="text.secondary" textAlign="center">
                      Корзина пуста
                    </Typography>
                  </CardContent>
                </Card>
              )}
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

export default UserCartsPage;