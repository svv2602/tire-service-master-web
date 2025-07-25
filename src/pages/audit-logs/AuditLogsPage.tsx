import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  IconButton,
  Tooltip,
  Chip,
  Avatar,
  Button,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Download as DownloadIcon,
  Assessment as StatsIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  useGetAuditLogsQuery,
  useGetAuditStatsQuery,
  useLazyExportAuditLogsQuery,
  type AuditLog,
  type AuditLogsQueryParams,
} from '../../api/auditLogs.api';
import { PageTable } from '../../components/PageTable';
import type { Column } from '../../components/PageTable';
import { AuditLogFilters } from './components/AuditLogFilters';
import { AuditLogDetailModal } from './components/AuditLogDetailModal';
import { AuditStatsModal } from './components/AuditStatsModal';
import { useDebounce } from '../../hooks/useDebounce';
import { getTablePageStyles } from '../../styles/tablePageStyles';
import { useTheme } from '@mui/material/styles';

const AuditLogsPage: React.FC = () => {
  const theme = useTheme();
  const tablePageStyles = getTablePageStyles(theme);

  // Состояния фильтров
  const [filters, setFilters] = useState<AuditLogsQueryParams>({
    page: 1,
    per_page: 50,
  });

  // Состояния модальных окон
  const [detailModal, setDetailModal] = useState<{
    open: boolean;
    logId: number | null;
  }>({ open: false, logId: null });

  const [statsModal, setStatsModal] = useState(false);

  // Дебаунс для поисковых фильтров
  const debouncedFilters = useDebounce(filters, 500);

  // API хуки
  const {
    data: logsData,
    isLoading,
    error,
    refetch,
  } = useGetAuditLogsQuery(debouncedFilters);

  const {
    data: statsData,
    isLoading: isLoadingStats,
  } = useGetAuditStatsQuery({ days: 30 });

  const [exportLogs, { isLoading: isExporting }] = useLazyExportAuditLogsQuery();

  // Данные из API
  const logs = logsData?.data || [];
  const meta = logsData?.meta || {
    current_page: 1,
    total_pages: 1,
    total_count: 0,
    per_page: 50,
    filters_applied: {},
  };

  // Обработчики
  const handleFiltersChange = useCallback((newFilters: Partial<AuditLogsQueryParams>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: newFilters.page !== undefined ? newFilters.page : 1, // Сброс на первую страницу при изменении фильтров
    }));
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  }, []);

  const handleViewDetail = useCallback((log: AuditLog) => {
    setDetailModal({ open: true, logId: log.id });
  }, []);

  const handleExport = useCallback(async () => {
    try {
      const result = await exportLogs(debouncedFilters);
      if ('data' in result && result.data) {
        // Создаем ссылку для скачивания
        const url = window.URL.createObjectURL(result.data);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit_logs_${format(new Date(), 'yyyy-MM-dd_HH-mm', { locale: ru })}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Ошибка экспорта:', error);
    }
  }, [exportLogs, debouncedFilters]);

  // Функции для отображения
  const getActionColor = (action: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (action) {
      case 'created': return 'success';
      case 'updated': return 'info';
      case 'deleted': return 'error';
      case 'suspended': return 'warning';
      case 'unsuspended': return 'success';
      case 'assigned': return 'primary';
      case 'unassigned': return 'secondary';
      case 'login': return 'success';
      case 'logout': return 'default';
      default: return 'default';
    }
  };

  const getResourceIcon = (resourceType: string | null) => {
    switch (resourceType) {
      case 'User': return '👤';
      case 'Booking': return '📅';
      case 'ServicePoint': return '🏪';
      case 'Operator': return '👨‍💼';
      case 'Partner': return '🤝';
      case 'Client': return '👥';
      case 'Review': return '⭐';
      default: return '📄';
    }
  };

  // Конфигурация заголовка
  const headerConfig = useMemo(() => ({
    title: 'Аудит системы',
    subtitle: `Всего записей: ${meta.total_count}`,
    actions: [
      {
        label: 'Обновить',
        icon: <RefreshIcon />,
        onClick: refetch,
        variant: 'outlined' as const,
      },
      {
        label: 'Статистика',
        icon: <StatsIcon />,
        onClick: () => setStatsModal(true),
        variant: 'outlined' as const,
      },
      {
        label: 'Экспорт CSV',
        icon: <DownloadIcon />,
        onClick: handleExport,
        variant: 'contained' as const,
        disabled: isExporting,
      },
    ],
  }), [meta.total_count, refetch, handleExport, isExporting]);

  // Конфигурация колонок
  const columns: Column[] = useMemo(() => [
    {
      id: 'timestamp',
      label: 'Время',
      minWidth: 150,
      format: (_value: any, row: AuditLog) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {format(new Date(row.created_at), 'dd.MM.yyyy', { locale: ru })}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {format(new Date(row.created_at), 'HH:mm:ss', { locale: ru })}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'user',
      label: 'Пользователь',
      minWidth: 180,
      format: (_value: any, row: AuditLog) => (
        <Box display="flex" alignItems="center" gap={1}>
          <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
            {row.user_name ? row.user_name.charAt(0).toUpperCase() : '?'}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight="medium">
              {row.user_name || 'Система'}
            </Typography>
            {row.user_email && (
              <Typography variant="caption" color="text.secondary">
                {row.user_email}
              </Typography>
            )}
          </Box>
        </Box>
      ),
    },
    {
      id: 'action',
      label: 'Действие',
      minWidth: 140,
      format: (_value: any, row: AuditLog) => (
        <Chip
          label={row.action_description}
          color={getActionColor(row.action)}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      id: 'resource',
      label: 'Ресурс',
      minWidth: 200,
      format: (_value: any, row: AuditLog) => (
        <Box display="flex" alignItems="center" gap={1}>
          <span style={{ fontSize: '1.2em' }}>
            {getResourceIcon(row.resource_type)}
          </span>
          <Box>
            <Typography variant="body2" fontWeight="medium">
              {row.resource_type || 'N/A'}
              {row.resource_id && ` #${row.resource_id}`}
            </Typography>
            {row.resource_name && (
              <Typography variant="caption" color="text.secondary" noWrap>
                {row.resource_name}
              </Typography>
            )}
          </Box>
        </Box>
      ),
    },
    {
      id: 'ip_address',
      label: 'IP адрес',
      minWidth: 120,
      hideOnMobile: true,
      format: (_value: any, row: AuditLog) => (
        <Typography variant="body2" fontFamily="monospace">
          {row.ip_address || 'N/A'}
        </Typography>
      ),
    },
    {
      id: 'actions',
      label: 'Действия',
      align: 'center',
      minWidth: 80,
      format: (_value: any, row: AuditLog) => (
        <Tooltip title="Подробности">
          <IconButton
            size="small"
            onClick={() => handleViewDetail(row)}
            color="primary"
          >
            <ViewIcon />
          </IconButton>
        </Tooltip>
      ),
    },
  ], [handleViewDetail]);

  // Конфигурация пагинации
  const paginationConfig = useMemo(() => ({
    page: meta.current_page,
    rowsPerPage: meta.per_page,
    totalItems: meta.total_count,
    onPageChange: handlePageChange,
  }), [meta, handlePageChange]);

  if (error) {
    return (
      <Box sx={tablePageStyles.pageContainer}>
        <Card>
          <CardContent>
            <Typography color="error">
              Ошибка загрузки аудит логов: {error.toString()}
            </Typography>
            <Button onClick={refetch} variant="outlined" sx={{ mt: 2 }}>
              Повторить попытку
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={tablePageStyles.pageContainer}>
      {/* Статистика */}
      {statsData && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary">
                  {statsData.data.total_logs.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Всего записей (30 дн.)
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main">
                  {statsData.data.top_users.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Активных пользователей
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="info.main">
                  {Object.keys(statsData.data.actions).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Типов действий
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="warning.main">
                  {statsData.data.resources.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Типов ресурсов
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Основная таблица */}
      <PageTable<AuditLog>
        header={headerConfig}
        columns={columns}
        rows={logs}
        loading={isLoading}
        pagination={paginationConfig}
        responsive={true}
        customFilters={
          <AuditLogFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            appliedFiltersCount={Object.keys(meta.filters_applied).length}
          />
        }
        empty={
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              {Object.keys(meta.filters_applied).length > 0 
                ? 'Логи не найдены с указанными фильтрами' 
                : 'Логи отсутствуют'
              }
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {Object.keys(meta.filters_applied).length > 0 
                ? 'Попробуйте изменить критерии поиска'
                : 'Аудит логи появятся при выполнении действий в системе'
              }
            </Typography>
          </Box>
        }
      />

      {/* Модальные окна */}
      <AuditLogDetailModal
        open={detailModal.open}
        logId={detailModal.logId}
        onClose={() => setDetailModal({ open: false, logId: null })}
      />

      <AuditStatsModal
        open={statsModal}
        onClose={() => setStatsModal(false)}
      />
    </Box>
  );
};

export default AuditLogsPage; 