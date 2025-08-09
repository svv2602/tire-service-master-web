import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  LinearProgress,
  useTheme,
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { RewardStatistics } from '../../../api/partnerRewards.api';

interface RewardStatisticsChartProps {
  statistics: RewardStatistics;
}

const RewardStatisticsChart: React.FC<RewardStatisticsChartProps> = ({ statistics }) => {
  const theme = useTheme();

  // Данные для круговой диаграммы статусов
  const statusData = [
    {
      name: 'К выплате',
      value: statistics.total_pending || 0,
      color: theme.palette.warning.main,
    },
    {
      name: 'Выплачено',
      value: statistics.total_paid || 0,
      color: theme.palette.success.main,
    },
    {
      name: 'Отменено',
      value: statistics.total_cancelled || 0,
      color: theme.palette.error.main,
    },
  ].filter(item => item.value > 0);

  // Данные для сравнения
  const comparisonData = [
    {
      name: 'Текущий месяц',
      value: statistics.current_month || 0,
    },
    {
      name: 'Общая сумма',
      value: (statistics.total_paid || 0) + (statistics.total_pending || 0),
    },
  ];

  const totalAmount = (statistics.total_pending || 0) + (statistics.total_paid || 0) + (statistics.total_cancelled || 0);
  const paidPercentage = totalAmount > 0 ? ((statistics.total_paid || 0) / totalAmount) * 100 : 0;
  const pendingPercentage = totalAmount > 0 ? ((statistics.total_pending || 0) / totalAmount) * 100 : 0;

  return (
    <Grid container spacing={3}>
      {/* Круговая диаграмма распределения */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2, height: 300 }}>
          <Typography variant="subtitle1" gutterBottom align="center">
            Распределение вознаграждений
          </Typography>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value.toLocaleString()} ₴`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${(value as number).toLocaleString()} ₴`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '90%' }}>
              <Typography variant="body2" color="text.secondary">
                Нет данных для отображения
              </Typography>
            </Box>
          )}
        </Paper>
      </Grid>

      {/* Прогресс-бары */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2, height: 300 }}>
          <Typography variant="subtitle1" gutterBottom>
            Статистика выплат
          </Typography>
          <Box sx={{ mt: 3 }}>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Выплачено</Typography>
                <Typography variant="body2">
                  {paidPercentage.toFixed(1)}% ({(statistics.total_paid || 0).toLocaleString()} ₴)
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={paidPercentage}
                color="success"
                sx={{ height: 8, borderRadius: 1 }}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">К выплате</Typography>
                <Typography variant="body2">
                  {pendingPercentage.toFixed(1)}% ({(statistics.total_pending || 0).toLocaleString()} ₴)
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={pendingPercentage}
                color="warning"
                sx={{ height: 8, borderRadius: 1 }}
              />
            </Box>

            <Box sx={{ mt: 4, p: 2, bgcolor: theme.palette.grey[50], borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Ключевые показатели:
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="body2">Активные договоренности:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {statistics.total_agreements || 0}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="body2">Поставщики:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {statistics.active_suppliers || 0}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="body2">Доход за месяц:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                  {(statistics.current_month || 0).toLocaleString()} ₴
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Grid>

      {/* Сравнительная диаграмма */}
      <Grid item xs={12}>
        <Paper sx={{ p: 2, height: 300 }}>
          <Typography variant="subtitle1" gutterBottom>
            Сравнение доходов
          </Typography>
          {comparisonData.some(item => item.value > 0) ? (
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `${(value as number).toLocaleString()} ₴`} />
                <Legend />
                <Bar 
                  dataKey="value" 
                  fill={theme.palette.primary.main}
                  name="Сумма (₴)"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '90%' }}>
              <Typography variant="body2" color="text.secondary">
                Недостаточно данных для сравнения
              </Typography>
            </Box>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
};

export default RewardStatisticsChart;