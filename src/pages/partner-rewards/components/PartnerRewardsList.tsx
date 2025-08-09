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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Pagination,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Edit,
  GetApp,
  FilterList,
  Clear,
  Info,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { uk } from 'date-fns/locale';
import {
  useGetRewardsQuery,
  useUpdateRewardMutation,
  useLazyExportRewardsQuery,
  PartnerReward,
} from '../../../api/partnerRewards.api';

const PartnerRewardsList: React.FC = () => {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    status: '',
    supplier_id: '',
    date_from: null as Date | null,
    date_to: null as Date | null,
  });
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    reward: PartnerReward | null;
    notes: string;
  }>({
    open: false,
    reward: null,
    notes: '',
  });

  const {
    data: rewardsData,
    isLoading,
    error,
  } = useGetRewardsQuery({
    page,
    per_page: 20,
    status: filters.status || undefined,
    supplier_id: filters.supplier_id ? Number(filters.supplier_id) : undefined,
    date_from: filters.date_from ? filters.date_from.toISOString().split('T')[0] : undefined,
    date_to: filters.date_to ? filters.date_to.toISOString().split('T')[0] : undefined,
  });

  const [updateReward] = useUpdateRewardMutation();
  const [exportRewards] = useLazyExportRewardsQuery();

  const rewards = rewardsData?.partner_rewards?.data || [];
  const pagination = rewardsData?.pagination;
  const statistics = rewardsData?.statistics;

  const handleFilterChange = (field: string, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(1); // Сброс на первую страницу при изменении фильтров
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

  const handleEditReward = (reward: PartnerReward) => {
    setEditDialog({
      open: true,
      reward,
      notes: reward.notes || '',
    });
  };

  const handleSaveReward = async () => {
    if (!editDialog.reward) return;

    try {
      await updateReward({
        id: editDialog.reward.id,
        data: { notes: editDialog.notes },
      }).unwrap();

      setEditDialog({ open: false, reward: null, notes: '' });
    } catch (error) {
      console.error('Ошибка обновления вознаграждения:', error);
    }
  };

  const handleExport = async () => {
    try {
      const result = await exportRewards({
        status: filters.status || undefined,
        supplier_id: filters.supplier_id ? Number(filters.supplier_id) : undefined,
        date_from: filters.date_from ? filters.date_from.toISOString().split('T')[0] : undefined,
        date_to: filters.date_to ? filters.date_to.toISOString().split('T')[0] : undefined,
        format: 'csv',
      }).unwrap();

      // Создаем ссылку для скачивания
      const url = window.URL.createObjectURL(result);
      const a = document.createElement('a');
      a.href = url;
      a.download = `partner_rewards_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Ошибка экспорта:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'paid':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  if (error) {
    return (
      <Alert severity="error">
        Ошибка загрузки вознаграждений
      </Alert>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={uk}>
      <Box>
        {/* Фильтры */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🔍 Фильтры
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  select
                  fullWidth
                  label="Статус"
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  size="small"
                >
                  <MenuItem value="">Все статусы</MenuItem>
                  <MenuItem value="pending">На согласовании</MenuItem>
                  <MenuItem value="paid">Выплачено</MenuItem>
                  <MenuItem value="cancelled">Отменено</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DatePicker
                  label="Дата от"
                  value={filters.date_from}
                  onChange={(value) => handleFilterChange('date_from', value)}
                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DatePicker
                  label="Дата до"
                  value={filters.date_to}
                  onChange={(value) => handleFilterChange('date_to', value)}
                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<Clear />}
                    onClick={clearFilters}
                    size="small"
                  >
                    Очистить
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<GetApp />}
                    onClick={handleExport}
                    size="small"
                  >
                    Экспорт
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Краткая статистика */}
        {statistics && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6} sm={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h6" color="warning.main">
                    {statistics.total_pending?.toLocaleString() || 0} ₴
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    К выплате
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h6" color="success.main">
                    {statistics.total_paid?.toLocaleString() || 0} ₴
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Выплачено
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h6" color="primary.main">
                    {statistics.current_month?.toLocaleString() || 0} ₴
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Текущий месяц
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h6" color="info.main">
                    {statistics.total_agreements || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Договоренности
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Таблица вознаграждений */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                💰 Мои вознаграждения ({pagination?.total_count || 0})
              </Typography>
            </Box>

            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : rewards.length === 0 ? (
              <Box sx={{ textAlign: 'center', p: 3 }}>
                <Typography variant="body1" color="text.secondary">
                  Вознаграждения не найдены
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Измените фильтры или дождитесь создания новых заказов
                </Typography>
              </Box>
            ) : (
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Дата</TableCell>
                        <TableCell>Поставщик</TableCell>
                        <TableCell>Заказ</TableCell>
                        <TableCell>Правило</TableCell>
                        <TableCell align="right">Сумма</TableCell>
                        <TableCell>Статус</TableCell>
                        <TableCell>Дата выплаты</TableCell>
                        <TableCell align="center">Действия</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rewards.map((reward) => (
                        <TableRow key={reward.id} hover>
                          <TableCell>
                            <Typography variant="body2">
                              {reward.formatted_calculated_at}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {/* Предполагаем, что в API есть информация о поставщике */}
                              Поставщик #{reward.supplier_id}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {reward.order_type}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {reward.order_number}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {/* Здесь будет информация о правиле из API */}
                              Правило #{reward.reward_rule_id}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {reward.formatted_amount}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={reward.payment_status_display}
                              color={getStatusColor(reward.payment_status) as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {reward.formatted_paid_at}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="Редактировать примечания">
                              <IconButton
                                size="small"
                                onClick={() => handleEditReward(reward)}
                              >
                                <Edit />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Пагинация */}
                {pagination && pagination.total_pages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Pagination
                      count={pagination.total_pages}
                      page={pagination.current_page}
                      onChange={(_, newPage) => setPage(newPage)}
                      color="primary"
                    />
                  </Box>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Диалог редактирования */}
        <Dialog
          open={editDialog.open}
          onClose={() => setEditDialog({ open: false, reward: null, notes: '' })}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Редактирование вознаграждения #{editDialog.reward?.id}
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Примечания"
              value={editDialog.notes}
              onChange={(e) => setEditDialog(prev => ({ ...prev, notes: e.target.value }))}
              sx={{ mt: 2 }}
              helperText="Добавьте свои комментарии к этому вознаграждению"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialog({ open: false, reward: null, notes: '' })}>
              Отмена
            </Button>
            <Button onClick={handleSaveReward} variant="contained">
              Сохранить
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default PartnerRewardsList;