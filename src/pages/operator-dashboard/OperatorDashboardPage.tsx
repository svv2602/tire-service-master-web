import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Event as EventIcon,
  People as PeopleIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

// Компоненты
import { OperatorServicePointSwitcher } from '../../components/ui/OperatorServicePointSwitcher/OperatorServicePointSwitcher';
import { OperatorPointStats } from '../../components/ui/OperatorPointStats/OperatorPointStats';
import { useOperatorServicePoint } from '../../hooks/useOperatorServicePoint';
import { useUserRole } from '../../hooks/useUserRole';
import { getTablePageStyles } from '../../styles';

// Типы для вкладок
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`operator-tabpanel-${index}`}
      aria-labelledby={`operator-tab-${index}`}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </Box>
  );
};

const OperatorDashboardPage: React.FC = () => {
  const theme = useTheme();
  const tablePageStyles = getTablePageStyles(theme);
  const { isOperator } = useUserRole();
  const { 
    selectedPoint, 
    isLoading, 
    error, 
    hasMultiplePoints,
    servicePoints 
  } = useOperatorServicePoint();

  // Состояние вкладок
  const [activeTab, setActiveTab] = useState(0);

  // Обработчик смены вкладки
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Если пользователь не оператор
  if (!isOperator) {
    return (
      <Box sx={tablePageStyles.pageContainer}>
        <Alert severity="warning">
          <Typography variant="body1" fontWeight="bold">
            Доступ запрещен
          </Typography>
          <Typography variant="body2">
            Эта страница доступна только операторам сервисных точек.
          </Typography>
        </Alert>
      </Box>
    );
  }

  // Состояние загрузки
  if (isLoading) {
    return (
      <Box sx={tablePageStyles.loadingContainer}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Загрузка данных оператора...
        </Typography>
      </Box>
    );
  }

  // Ошибка загрузки
  if (error) {
    return (
      <Box sx={tablePageStyles.errorContainer}>
        <Alert severity="error">
          <Typography variant="body1" fontWeight="bold">
            Ошибка загрузки данных
          </Typography>
          <Typography variant="body2">
            Не удалось загрузить информацию о назначенных сервисных точках. 
            Попробуйте обновить страницу.
          </Typography>
        </Alert>
      </Box>
    );
  }

  // Нет назначенных точек
  if (servicePoints.length === 0) {
    return (
      <Box sx={tablePageStyles.pageContainer}>
        <Alert severity="info">
          <Typography variant="body1" fontWeight="bold">
            Нет назначенных сервисных точек
          </Typography>
          <Typography variant="body2">
            Вы не назначены ни на одну сервисную точку. 
            Обратитесь к администратору или менеджеру партнера для назначения.
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={tablePageStyles.pageContainer}>
      {/* Заголовок страницы */}
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <DashboardIcon color="primary" fontSize="large" />
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Дашборд оператора
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Управление и статистика по назначенным сервисным точкам
          </Typography>
        </Box>
      </Box>

      {/* Переключатель сервисных точек */}
      <Box mb={3}>
        <OperatorServicePointSwitcher 
          variant="card"
          showStats={true}
        />
      </Box>

      {/* Контент в зависимости от выбранной точки */}
      {selectedPoint ? (
        <>
          {/* Вкладки статистики */}
          <Card sx={{ mb: 3 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={activeTab} 
                onChange={handleTabChange}
                aria-label="operator dashboard tabs"
              >
                <Tab 
                  icon={<TrendingUpIcon />} 
                  label="Сегодня" 
                  id="operator-tab-0"
                  aria-controls="operator-tabpanel-0"
                />
                <Tab 
                  icon={<EventIcon />} 
                  label="Неделя" 
                  id="operator-tab-1"
                  aria-controls="operator-tabpanel-1"
                />
                <Tab 
                  icon={<PeopleIcon />} 
                  label="Месяц" 
                  id="operator-tab-2"
                  aria-controls="operator-tabpanel-2"
                />
                <Tab 
                  icon={<StarIcon />} 
                  label="Все время" 
                  id="operator-tab-3"
                  aria-controls="operator-tabpanel-3"
                />
              </Tabs>
            </Box>

            {/* Панели вкладок */}
            <TabPanel value={activeTab} index={0}>
              <OperatorPointStats 
                variant="card" 
                period="today" 
                showDetails={true}
              />
            </TabPanel>

            <TabPanel value={activeTab} index={1}>
              <OperatorPointStats 
                variant="card" 
                period="week" 
                showDetails={true}
              />
            </TabPanel>

            <TabPanel value={activeTab} index={2}>
              <OperatorPointStats 
                variant="card" 
                period="month" 
                showDetails={true}
              />
            </TabPanel>

            <TabPanel value={activeTab} index={3}>
              <OperatorPointStats 
                variant="card" 
                period="all" 
                showDetails={true}
              />
            </TabPanel>
          </Card>

          {/* Быстрые действия */}
          <Grid container spacing={3}>
            {/* Карточка быстрых ссылок */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Быстрые действия
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={2}>
                    <Box 
                      component="a" 
                      href="/bookings"
                      sx={{ 
                        textDecoration: 'none',
                        color: 'inherit',
                        p: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        }
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={2}>
                        <EventIcon color="primary" />
                        <Box>
                          <Typography variant="body1" fontWeight="bold">
                            Управление записями
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Просмотр и редактирование бронирований
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    <Box 
                      component="a" 
                      href="/reviews"
                      sx={{ 
                        textDecoration: 'none',
                        color: 'inherit',
                        p: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        }
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={2}>
                        <StarIcon color="primary" />
                        <Box>
                          <Typography variant="body1" fontWeight="bold">
                            Отзывы клиентов
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Просмотр отзывов о работе точки
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Карточка информации */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Информация
                  </Typography>
                  
                  {hasMultiplePoints && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        💡 Вы назначены на <strong>{servicePoints.length}</strong> сервисных точек. 
                        Используйте переключатель выше для выбора точки.
                      </Typography>
                    </Alert>
                  )}

                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Текущая рабочая точка:
                    </Typography>
                    <Typography variant="body1" fontWeight="bold" gutterBottom>
                      {selectedPoint.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      📍 {selectedPoint.address}
                    </Typography>
                    {selectedPoint.partner_name && (
                      <Typography variant="body2" color="text.secondary">
                        Партнер: {selectedPoint.partner_name}
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      ) : (
        /* Подсказка для выбора точки */
        <Alert severity="info">
          <Typography variant="body1" fontWeight="bold">
            Выберите сервисную точку
          </Typography>
          <Typography variant="body2">
            Выберите сервисную точку в переключателе выше для просмотра статистики и управления данными.
          </Typography>
        </Alert>
      )}
    </Box>
  );
};

export default OperatorDashboardPage; 