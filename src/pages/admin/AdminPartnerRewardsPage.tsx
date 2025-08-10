import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  TextField,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  GetApp,
  FilterList,
  Clear,
  Info,
  Payment,
  Cancel,
  Visibility,
  LocalAtm,
  Assignment,
  Store,
  Person,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { uk } from 'date-fns/locale';
import { useTheme } from '@mui/material/styles';
import {
  useGetRewardsQuery,
  useMarkRewardAsPaidMutation,
  useCancelRewardMutation,
  useLazyExportRewardsQuery,
  PartnerReward,
} from '../../api/partnerRewards.api';
import { getTablePageStyles } from '../../styles/tablePageStyles';
import { Pagination } from '../../components/ui';

const AdminPartnerRewardsPage: React.FC = () => {
  const theme = useTheme();
  const tablePageStyles = getTablePageStyles(theme);
  
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    status: '',
    supplier_id: '',
    date_from: null as Date | null,
    date_to: null as Date | null,
  });

  const [selectedReward, setSelectedReward] = useState<PartnerReward | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [paymentNotes, setPaymentNotes] = useState('');
  const [cancelReason, setCancelReason] = useState('');

  const {
    data: rewardsData,
    isLoading,
    error,
    refetch,
  } = useGetRewardsQuery({
    page,
    per_page: 20,
    status: filters.status || undefined,
    supplier_id: filters.supplier_id ? Number(filters.supplier_id) : undefined,
    date_from: filters.date_from ? filters.date_from.toISOString().split('T')[0] : undefined,
    date_to: filters.date_to ? filters.date_to.toISOString().split('T')[0] : undefined,
  });

  const [markAsPaid] = useMarkRewardAsPaidMutation();
  const [cancelReward] = useCancelRewardMutation();
  const [exportRewards] = useLazyExportRewardsQuery();

  const rewards = rewardsData?.partner_rewards?.data || [];
  const pagination = rewardsData?.pagination;
  const statistics = rewardsData?.statistics;

  const handleFilterChange = (field: string, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      supplier_id: '',
      date_from: null,
      date_to: null,
    });
    setPage(1);
  };

  const handleViewDetails = (reward: PartnerReward) => {
    setSelectedReward(reward);
    setDetailsDialogOpen(true);
  };

  const handleMarkAsPaid = async () => {
    if (!selectedReward) return;

    try {
      await markAsPaid({
        id: selectedReward.id,
        notes: paymentNotes,
      }).unwrap();
      
      setPaymentDialogOpen(false);
      setPaymentNotes('');
      setSelectedReward(null);
      refetch();
    } catch (error) {
      console.error('Ошибка отметки как оплачено:', error);
    }
  };

  const handleCancelReward = async () => {
    if (!selectedReward) return;

    try {
      await cancelReward({
        id: selectedReward.id,
        reason: cancelReason,
      }).unwrap();
      
      setCancelDialogOpen(false);
      setCancelReason('');
      setSelectedReward(null);
      refetch();
    } catch (error) {
      console.error('Ошибка отмены вознаграждения:', error);
    }
  };

  const handleExport = async () => {
    try {
      const exportParams = {
        status: filters.status || undefined,
        supplier_id: filters.supplier_id ? Number(filters.supplier_id) : undefined,
        date_from: filters.date_from ? filters.date_from.toISOString().split('T')[0] : undefined,
        date_to: filters.date_to ? filters.date_to.toISOString().split('T')[0] : undefined,
        format: 'csv' as const,
      };

      const result = await exportRewards(exportParams);

      if ('data' in result && result.data) {
        // Создаем ссылку для скачивания CSV
        const blob = result.data instanceof Blob ? result.data : new Blob([result.data as string], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `partner_rewards_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Ошибка экспорта:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'paid': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Ожидает';
      case 'paid': return 'Выплачено';
      case 'cancelled': return 'Отменено';
      default: return status;
    }
  };

  const getOrderTypeLabel = (reward: PartnerReward) => {
    // Используем готовое поле order_type из API
    return reward.order_type || 'Неизвестно';
  };

  if (error) {
    return (
      <Box sx={tablePageStyles.pageContainer}>
        <Alert severity="error">
          Ошибка загрузки данных: {error.toString()}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={tablePageStyles.pageContainer}>
      {/* Заголовок страницы */}
      <Box sx={tablePageStyles.headerContainer}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <LocalAtm sx={{ fontSize: 32, color: theme.palette.primary.main }} />
          <Typography variant="h4" component="h1" sx={tablePageStyles.pageTitle}>
            Вознаграждения партнеров
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Управление системой вознаграждений по заказам товаров и услуг
        </Typography>
      </Box>

      {/* Статистика */}
      {statistics && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocalAtm color="warning" />
                  <Box>
                    <Typography variant="h6" component="div">
                      {statistics.total_pending?.toLocaleString() || 0} грн
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                      Ожидает выплаты
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
                  <Payment color="success" />
                  <Box>
                    <Typography variant="h6" component="div">
                      {statistics.total_paid?.toLocaleString() || 0} грн
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                      Выплачено
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
                  <Person color="primary" />
                  <Box>
                    <Typography variant="h6" component="div">
                      {statistics.total_partners || 0}
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                      Партнеров с вознаграждениями
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
                  <Store color="info" />
                  <Box>
                    <Typography variant="h6" component="div">
                      {statistics.total_suppliers || 0}
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                      Поставщиков с вознаграждениями
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Фильтры */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <FilterList />
            <Typography variant="h6">Фильтры</Typography>
          </Box>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                select
                label="Статус"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                size="small"
              >
                <MenuItem value="">Все статусы</MenuItem>
                <MenuItem value="pending">Ожидает</MenuItem>
                <MenuItem value="paid">Выплачено</MenuItem>
                <MenuItem value="cancelled">Отменено</MenuItem>
              </TextField>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={uk}>
                <DatePicker
                  label="Дата от"
                  value={filters.date_from}
                  onChange={(date) => handleFilterChange('date_from', date)}
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={uk}>
                <DatePicker
                  label="Дата до"
                  value={filters.date_to}
                  onChange={(date) => handleFilterChange('date_to', date)}
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <Button
                variant="outlined"
                startIcon={<Clear />}
                onClick={clearFilters}
                size="small"
                fullWidth
              >
                Очистить
              </Button>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <Button
                variant="contained"
                startIcon={<GetApp />}
                onClick={handleExport}
                size="small"
                fullWidth
              >
                Экспорт
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Таблица вознаграждений */}
      <Card>
        <CardContent>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : rewards.length === 0 ? (
            <Alert severity="info">
              Вознаграждения не найдены
            </Alert>
          ) : (
            <>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Партнер</TableCell>
                      <TableCell>Поставщик</TableCell>
                      <TableCell>Тип заказа</TableCell>
                      <TableCell>Сумма</TableCell>
                      <TableCell>Статус</TableCell>
                      <TableCell>Дата расчета</TableCell>
                      <TableCell>Действия</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rewards.map((reward) => (
                      <TableRow key={reward.id}>
                        <TableCell>{reward.id}</TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              {reward.partner_info?.company_name || `Партнер #${reward.partner_id || 'undefined'}`}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {reward.partner_info?.contact_person ? `ID: ${reward.partner_info.id}` : `ID: ${reward.partner_id || 'undefined'}`}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {reward.supplier_info?.name || `Поставщик #${reward.supplier_id || 'undefined'}`}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Chip
                              size="small"
                              label={getOrderTypeLabel(reward)}
                              color={reward.tire_order_id ? 'primary' : 'secondary'}
                              variant="outlined"
                            />
                            {reward.order_details && (
                              <Typography variant="caption" color="primary" sx={{ display: 'block', mt: 0.5, cursor: 'pointer', textDecoration: 'underline' }}>
                                Заказ #{reward.order_details.id}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            {reward.formatted_amount || `${reward.calculated_amount || 0} грн`}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={getStatusLabel(reward.payment_status)}
                            color={getStatusColor(reward.payment_status) as any}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {reward.formatted_calculated_at || 'Неизвестно'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Подробности">
                              <IconButton 
                                size="small" 
                                onClick={() => handleViewDetails(reward)}
                              >
                                <Visibility />
                              </IconButton>
                            </Tooltip>
                            
                            {reward.payment_status === 'pending' && (
                              <>
                                <Tooltip title="Отметить как выплачено">
                                  <IconButton
                                    size="small"
                                    color="success"
                                    onClick={() => {
                                      setSelectedReward(reward);
                                      setPaymentDialogOpen(true);
                                    }}
                                  >
                                    <Payment />
                                  </IconButton>
                                </Tooltip>
                                
                                <Tooltip title="Отменить">
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => {
                                      setSelectedReward(reward);
                                      setCancelDialogOpen(true);
                                    }}
                                  >
                                    <Cancel />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Пагинация */}
              {pagination && pagination.total_pages > 1 && (
                <Box sx={tablePageStyles.paginationContainer}>
                  <Pagination
                    count={pagination.total_pages}
                    page={page}
                    onChange={(newPage: number) => setPage(newPage)}
                    color="primary"
                  />
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Диалог подробностей */}
      <Dialog 
        open={detailsDialogOpen} 
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Подробности вознаграждения #{selectedReward?.id}</DialogTitle>
        <DialogContent>
          {selectedReward && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Информация о партнере
                </Typography>
                <Typography>Компания: {selectedReward.partner_info?.company_name || `Партнер #${selectedReward.partner_id}`}</Typography>
                <Typography>Контакт: {selectedReward.partner_info?.contact_person || 'Не указан'}</Typography>
                <Typography>Email: {selectedReward.partner_info?.email || 'Не указан'}</Typography>
                <Typography>Телефон: {selectedReward.partner_info?.phone || 'Не указан'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Информация о заказе
                </Typography>
                <Typography>Тип: {getOrderTypeLabel(selectedReward)}</Typography>
                <Typography>ID заказа: {selectedReward.order_details?.id || selectedReward.tire_order_id || selectedReward.order_id || 'Неизвестно'}</Typography>
                <Typography>Статус: {selectedReward.order_details?.status_display || 'Неизвестно'}</Typography>
                <Typography>Сумма заказа: {selectedReward.order_details?.total_amount?.toLocaleString() || 0} грн</Typography>
                {selectedReward.order_details?.client_name && (
                  <Typography>Клиент: {selectedReward.order_details.client_name}</Typography>
                )}
                {selectedReward.order_details?.customer_name && (
                  <Typography>Покупатель: {selectedReward.order_details.customer_name}</Typography>
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Информация о поставщике
                </Typography>
                <Typography>Название: {selectedReward.supplier_info?.name || `Поставщик #${selectedReward.supplier_id}`}</Typography>
                <Typography>Код: {selectedReward.supplier_info?.firm_id || 'Не указан'}</Typography>
                <Typography>Статус: {selectedReward.supplier_info?.is_active ? 'Активен' : 'Неактивен'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Правило вознаграждения
                </Typography>
                <Typography>Тип: {selectedReward.rule_info?.rule_type_display || 'Неизвестно'}</Typography>
                <Typography>Размер: {selectedReward.rule_info?.amount_display || 'Не указан'}</Typography>
                <Typography>Приоритет: {selectedReward.rule_info?.priority || 'Не указан'}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Примечания
                </Typography>
                <Typography>{selectedReward.notes || 'Нет примечаний'}</Typography>
              </Grid>
              {selectedReward.paid_at && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Дата выплаты
                  </Typography>
                  <Typography>
                    {new Date(selectedReward.paid_at).toLocaleDateString('uk-UA')}
                  </Typography>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>

      {/* Диалог подтверждения выплаты */}
      <Dialog 
        open={paymentDialogOpen} 
        onClose={() => setPaymentDialogOpen(false)}
      >
        <DialogTitle>Подтвердить выплату</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Отметить вознаграждение как выплаченное?
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Примечания к выплате"
            value={paymentNotes}
            onChange={(e) => setPaymentNotes(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleMarkAsPaid} variant="contained" color="success">
            Подтвердить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог отмены */}
      <Dialog 
        open={cancelDialogOpen} 
        onClose={() => setCancelDialogOpen(false)}
      >
        <DialogTitle>Отменить вознаграждение</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Вы уверены, что хотите отменить это вознаграждение?
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Причина отмены"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            sx={{ mt: 2 }}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>Отмена</Button>
          <Button 
            onClick={handleCancelReward} 
            variant="contained" 
            color="error"
            disabled={!cancelReason.trim()}
          >
            Отменить вознаграждение
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminPartnerRewardsPage;