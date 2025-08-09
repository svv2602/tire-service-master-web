import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Tabs,
  Tab,
  Alert,
} from '@mui/material';
import {
  TrendingUp,
  AccountBalance,
  Schedule,
  Assessment,
  Handshake,
  LocalAtm,
} from '@mui/icons-material';
import { useGetRewardStatisticsQuery } from '../../api/partnerRewards.api';
import { getTablePageStyles } from '../../styles/tablePageStyles';
import { useTheme } from '@mui/material/styles';
import PartnerRewardsList from './components/PartnerRewardsList';
import PartnerAgreementsList from './components/PartnerAgreementsList';
import RewardStatisticsChart from './components/RewardStatisticsChart';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`partner-rewards-tabpanel-${index}`}
      aria-labelledby={`partner-rewards-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const PartnerRewardsDashboard: React.FC = () => {
  const theme = useTheme();
  const tablePageStyles = getTablePageStyles(theme);
  const [activeTab, setActiveTab] = useState(0);

  const {
    data: statisticsData,
    isLoading: isLoadingStats,
    error: statsError,
  } = useGetRewardStatisticsQuery({});

  const statistics = statisticsData?.statistics;

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const StatisticCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    subtitle?: string;
  }> = ({ title, value, icon, color, subtitle }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: '12px',
              backgroundColor: `${color}20`,
              color: color,
              mr: 2,
            }}
          >
            {icon}
          </Box>
          <Box>
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              {typeof value === 'number' && value > 0 ? `${value.toLocaleString()} ₴` : value || '0'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (statsError) {
    return (
      <Box sx={tablePageStyles.pageContainer}>
        <Alert severity="error" sx={{ mb: 3 }}>
          Ошибка загрузки статистики вознаграждений
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={tablePageStyles.pageContainer}>
      {/* Заголовок */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          💰 Система вознаграждений
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Управление договоренностями с поставщиками и отслеживание вознаграждений
        </Typography>
      </Box>

      {/* Карточки статистики */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatisticCard
            title="К выплате"
            value={statistics?.total_pending || 0}
            icon={<Schedule />}
            color={theme.palette.warning.main}
            subtitle="Ожидают согласования"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatisticCard
            title="Выплачено"
            value={statistics?.total_paid || 0}
            icon={<AccountBalance />}
            color={theme.palette.success.main}
            subtitle="Всего получено"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatisticCard
            title="Текущий месяц"
            value={statistics?.current_month || 0}
            icon={<TrendingUp />}
            color={theme.palette.primary.main}
            subtitle="Заработок за месяц"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatisticCard
            title="Активные договоренности"
            value={statistics?.total_agreements || 0}
            icon={<Handshake />}
            color={theme.palette.info.main}
            subtitle={`С ${statistics?.active_suppliers || 0} поставщиками`}
          />
        </Grid>
      </Grid>

      {/* Графики и статистика */}
      {!isLoadingStats && statistics && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📊 Аналитика вознаграждений
            </Typography>
            <RewardStatisticsChart statistics={statistics} />
          </CardContent>
        </Card>
      )}

      {/* Табы */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="Разделы вознаграждений">
            <Tab 
              label="Мои вознаграждения" 
              icon={<LocalAtm />}
              iconPosition="start"
            />
            <Tab 
              label="Договоренности с поставщиками" 
              icon={<Handshake />}
              iconPosition="start"
            />
            <Tab 
              label="Отчеты и аналитика" 
              icon={<Assessment />}
              iconPosition="start"
            />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          <PartnerRewardsList />
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <PartnerAgreementsList />
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              📈 Расширенная аналитика
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Детальные отчеты и графики будут доступны в следующих версиях
            </Typography>
          </Box>
        </TabPanel>
      </Card>
    </Box>
  );
};

export default PartnerRewardsDashboard;