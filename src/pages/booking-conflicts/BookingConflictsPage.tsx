import React, { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  IconButton,
  Tooltip,
  CircularProgress,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  VisibilityOff as IgnoreIcon,
  FilterList as FilterIcon,
  PlayArrow as PlayIcon,
  Preview as PreviewIcon,
} from '@mui/icons-material';
import { getTablePageStyles } from '../../styles/components';
import Notification from '../../components/Notification';
import { Pagination } from '../../components/ui/Pagination/Pagination';
import {
  useGetBookingConflictsQuery,
  useGetBookingConflictStatisticsQuery,
  useAnalyzeBookingConflictsMutation,
  usePreviewBookingConflictsMutation,
  useResolveBookingConflictMutation,
  useIgnoreBookingConflictMutation,
  useBulkResolveBookingConflictsMutation,
  BookingConflict,
  BookingConflictFilters,
} from '../../api/bookingConflicts.api';

const BookingConflictsPage: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation('components');
  const tablePageStyles = getTablePageStyles(theme);

  // Состояние для фильтров
  const [filters, setFilters] = useState<BookingConflictFilters>({
    status: '',
    conflict_type: '',
    page: 1,
    per_page: 20,
  });

  // Состояние для диалогов
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [analysisDialogOpen, setAnalysisDialogOpen] = useState(false);
  const [selectedConflict, setSelectedConflict] = useState<BookingConflict | null>(null);
  const [selectedConflicts, setSelectedConflicts] = useState<number[]>([]);
  const [resolutionType, setResolutionType] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [newStartTime, setNewStartTime] = useState('');
  const [analysisParams, setAnalysisParams] = useState({
    service_point_id: '',
    post_id: '',
    seasonal_schedule_id: '',
  });

  // Состояние для уведомлений
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  // API хуки
  const { data: conflictsData, isLoading: conflictsLoading, refetch: refetchConflicts } = useGetBookingConflictsQuery(filters);
  const { data: statisticsData, isLoading: statisticsLoading } = useGetBookingConflictStatisticsQuery();
  const [analyzeConflicts, { isLoading: analyzeLoading }] = useAnalyzeBookingConflictsMutation();
  const [previewConflicts, { isLoading: previewLoading }] = usePreviewBookingConflictsMutation();
  const [resolveConflict, { isLoading: resolveLoading }] = useResolveBookingConflictMutation();
  const [ignoreConflict, { isLoading: ignoreLoading }] = useIgnoreBookingConflictMutation();
  const [bulkResolveConflicts, { isLoading: bulkResolveLoading }] = useBulkResolveBookingConflictsMutation();

  // Обработчики
  const handleFilterChange = (key: keyof BookingConflictFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : value, // Сброс на первую страницу при изменении фильтров
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const showNotification = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setNotification({ open: true, message, severity });
  };

  const handleAnalyze = async () => {
    try {
      const params: any = {};
      if (analysisParams.service_point_id) params.service_point_id = parseInt(analysisParams.service_point_id);
      if (analysisParams.post_id) params.post_id = parseInt(analysisParams.post_id);
      if (analysisParams.seasonal_schedule_id) params.seasonal_schedule_id = parseInt(analysisParams.seasonal_schedule_id);

      const result = await analyzeConflicts(params).unwrap();
      showNotification(result.message, 'success');
      setAnalysisDialogOpen(false);
      refetchConflicts();
    } catch (error: any) {
      showNotification(error.data?.error || t('bookingConflicts.messages.analysisError'), 'error');
    }
  };

  const handlePreview = async () => {
    try {
      const params: any = {};
      if (analysisParams.service_point_id) params.service_point_id = parseInt(analysisParams.service_point_id);
      if (analysisParams.post_id) params.post_id = parseInt(analysisParams.post_id);
      if (analysisParams.seasonal_schedule_id) params.seasonal_schedule_id = parseInt(analysisParams.seasonal_schedule_id);

      const result = await previewConflicts(params).unwrap();
      showNotification(t('bookingConflicts.messages.conflictsFound', { count: result.count }), 'info');
      // Можно добавить отображение результатов предварительного просмотра
    } catch (error: any) {
      showNotification(error.data?.error || t('bookingConflicts.messages.previewError'), 'error');
    }
  };

  const handleResolveConflict = async () => {
    if (!selectedConflict) return;

    try {
      const params: any = {
        id: selectedConflict.id,
        resolution_type: resolutionType,
        notes: resolutionNotes,
      };

      if (resolutionType === 'manual_reschedule' && newStartTime) {
        params.new_start_time = newStartTime;
      }

      const result = await resolveConflict(params).unwrap();
      showNotification(result.message, 'success');
      setResolveDialogOpen(false);
      resetResolveDialog();
      refetchConflicts();
    } catch (error: any) {
      showNotification(error.data?.error || t('bookingConflicts.messages.resolveError'), 'error');
    }
  };

  const handleIgnoreConflict = async (conflict: BookingConflict) => {
    try {
      const result = await ignoreConflict({
        id: conflict.id,
        notes: t('bookingConflicts.messages.ignoring'),
      }).unwrap();
      showNotification(result.message, 'success');
      refetchConflicts();
    } catch (error: any) {
      showNotification(error.data?.error || t('bookingConflicts.messages.ignoreError'), 'error');
    }
  };

  const handleBulkResolve = async () => {
    if (selectedConflicts.length === 0) return;

    try {
      const result = await bulkResolveConflicts({
        conflict_ids: selectedConflicts,
        resolution_type: resolutionType,
        notes: resolutionNotes,
      }).unwrap();
      showNotification(result.message, 'success');
      setSelectedConflicts([]);
      resetResolveDialog();
      refetchConflicts();
    } catch (error: any) {
      showNotification(error.data?.error || t('bookingConflicts.messages.bulkResolveError'), 'error');
    }
  };

  const resetResolveDialog = () => {
    setSelectedConflict(null);
    setResolutionType('');
    setResolutionNotes('');
    setNewStartTime('');
  };

  const openResolveDialog = (conflict: BookingConflict) => {
    setSelectedConflict(conflict);
    setResolveDialogOpen(true);
  };

  const toggleConflictSelection = (conflictId: number) => {
    setSelectedConflicts(prev =>
      prev.includes(conflictId)
        ? prev.filter(id => id !== conflictId)
        : [...prev, conflictId]
    );
  };

  const getConflictTypeIcon = (type: string) => {
    switch (type) {
      case 'schedule_change':
        return <ScheduleIcon />;
      case 'service_point_status':
        return <WarningIcon />;
      case 'post_status':
        return <CancelIcon />;
      default:
        return <WarningIcon />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'resolved':
        return 'success';
      case 'ignored':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={tablePageStyles.pageContainer}>
      <Box sx={tablePageStyles.headerContainer}>
        <Typography variant="h4" sx={tablePageStyles.title}>
          Конфликты бронирований
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<PreviewIcon />}
            onClick={() => setPreviewDialogOpen(true)}
          >
            Предварительный просмотр
          </Button>
          <Button
            variant="outlined"
            startIcon={<PlayIcon />}
            onClick={() => setAnalysisDialogOpen(true)}
          >
            Запустить анализ
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => refetchConflicts()}
          >
            Обновить
          </Button>
        </Box>
      </Box>

      {/* Статистика */}
      {statisticsData && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="warning.main">
                  {statisticsData.statistics.total_pending}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Ожидают решения
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="error.main">
                  {statisticsData.statistics.by_type.schedule_change || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Изменения расписания
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="warning.main">
                  {statisticsData.statistics.by_type.service_point_status || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Статус точек
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="info.main">
                  {statisticsData.statistics.by_type.post_status || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Статус постов
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Фильтры */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Статус</InputLabel>
                <Select
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  label="Статус"
                >
                  <MenuItem value="">Все</MenuItem>
                  <MenuItem value="pending">Ожидает решения</MenuItem>
                  <MenuItem value="resolved">Решен</MenuItem>
                  <MenuItem value="ignored">Игнорируется</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Тип конфликта</InputLabel>
                <Select
                  value={filters.conflict_type || ''}
                  onChange={(e) => handleFilterChange('conflict_type', e.target.value)}
                  label="Тип конфликта"
                >
                  <MenuItem value="">Все</MenuItem>
                  <MenuItem value="schedule_change">Изменение расписания</MenuItem>
                  <MenuItem value="service_point_status">Статус сервисной точки</MenuItem>
                  <MenuItem value="post_status">Статус поста</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="ID сервисной точки"
                type="number"
                value={filters.service_point_id || ''}
                onChange={(e) => handleFilterChange('service_point_id', e.target.value ? parseInt(e.target.value) : undefined)}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={() => setFilters({ status: '', conflict_type: '', page: 1, per_page: 20 })}
              >
                Сбросить
              </Button>
            </Grid>
            {selectedConflicts.length > 0 && (
              <Grid item xs={12} md={2}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setResolveDialogOpen(true)}
                >
                  Массовое действие ({selectedConflicts.length})
                </Button>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Список конфликтов */}
      {conflictsLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : conflictsData?.booking_conflicts.length === 0 ? (
        <Alert severity="info">
          Конфликты не найдены
        </Alert>
      ) : (
        <>
          {conflictsData?.booking_conflicts.map((conflict) => (
            <Card key={conflict.id} sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Checkbox
                    checked={selectedConflicts.includes(conflict.id)}
                    onChange={() => toggleConflictSelection(conflict.id)}
                  />
                  <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      {getConflictTypeIcon(conflict.conflict_type)}
                      <Typography variant="h6">
                        {conflict.conflict_type_human}
                      </Typography>
                      <Chip
                        label={conflict.status_human}
                        color={getStatusColor(conflict.status) as any}
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {conflict.conflict_reason}
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2">Бронирование:</Typography>
                        <Typography variant="body2">
                          ID: {conflict.booking.id}<br />
                          Дата: {new Date(conflict.booking.start_time).toLocaleDateString('ru-RU')}<br />
                          Время: {new Date(conflict.booking.start_time).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}<br />
                          Сервисная точка: {conflict.booking.service_point.name}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2">Клиент:</Typography>
                        <Typography variant="body2">
                          {conflict.booking.client.name}<br />
                          {conflict.booking.client.email}
                        </Typography>
                      </Grid>
                    </Grid>
                    {conflict.resolution_notes && (
                      <Alert severity="info" sx={{ mt: 2 }}>
                        <Typography variant="body2">
                          <strong>Заметки:</strong> {conflict.resolution_notes}
                        </Typography>
                      </Alert>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {conflict.status === 'pending' && (
                      <>
                        <Tooltip title="Разрешить конфликт">
                          <IconButton
                            color="primary"
                            onClick={() => openResolveDialog(conflict)}
                          >
                            <CheckCircleIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Игнорировать конфликт">
                          <IconButton
                            color="default"
                            onClick={() => handleIgnoreConflict(conflict)}
                          >
                            <IgnoreIcon />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}

          {/* Пагинация */}
          {conflictsData && conflictsData.meta.total_pages > 1 && (
            <Box sx={tablePageStyles.paginationContainer}>
              <Pagination
                count={conflictsData.meta.total_pages}
                page={filters.page || 1}
                onChange={(newPage) => handlePageChange(newPage)}
              />
            </Box>
          )}
        </>
      )}

      {/* Диалог разрешения конфликта */}
      <Dialog open={resolveDialogOpen} onClose={() => setResolveDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedConflicts.length > 0 ? 'Массовое разрешение конфликтов' : 'Разрешение конфликта'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Тип разрешения</InputLabel>
                <Select
                  value={resolutionType}
                  onChange={(e) => setResolutionType(e.target.value)}
                  label="Тип разрешения"
                >
                  <MenuItem value="auto_reschedule">Автоматический перенос</MenuItem>
                  <MenuItem value="manual_reschedule">Ручной перенос</MenuItem>
                  <MenuItem value="cancel">Отмена бронирования</MenuItem>
                  <MenuItem value="ignore">Игнорирование</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {resolutionType === 'manual_reschedule' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Новое время"
                  type="datetime-local"
                  value={newStartTime}
                  onChange={(e) => setNewStartTime(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            )}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Заметки"
                multiline
                rows={3}
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Комментарий к решению"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResolveDialogOpen(false)}>Отмена</Button>
          <Button
            onClick={selectedConflicts.length > 0 ? handleBulkResolve : handleResolveConflict}
            variant="contained"
            disabled={!resolutionType || resolveLoading || bulkResolveLoading}
          >
            {resolveLoading || bulkResolveLoading ? <CircularProgress size={20} /> : 'Применить'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог анализа */}
      <Dialog open={analysisDialogOpen} onClose={() => setAnalysisDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Анализ конфликтов</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="ID сервисной точки (опционально)"
                type="number"
                value={analysisParams.service_point_id}
                onChange={(e) => setAnalysisParams(prev => ({ ...prev, service_point_id: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="ID поста (опционально)"
                type="number"
                value={analysisParams.post_id}
                onChange={(e) => setAnalysisParams(prev => ({ ...prev, post_id: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="ID сезонного расписания (опционально)"
                type="number"
                value={analysisParams.seasonal_schedule_id}
                onChange={(e) => setAnalysisParams(prev => ({ ...prev, seasonal_schedule_id: e.target.value }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAnalysisDialogOpen(false)}>Отмена</Button>
          <Button
            onClick={handlePreview}
            variant="outlined"
            disabled={previewLoading}
          >
            {previewLoading ? <CircularProgress size={20} /> : 'Предварительный просмотр'}
          </Button>
          <Button
            onClick={handleAnalyze}
            variant="contained"
            disabled={analyzeLoading}
          >
            {analyzeLoading ? <CircularProgress size={20} /> : 'Запустить анализ'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Уведомления */}
      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
      />
    </Box>
  );
};

export default BookingConflictsPage; 