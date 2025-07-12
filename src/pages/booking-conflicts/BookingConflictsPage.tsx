import React, { useState, useEffect, useMemo } from 'react';
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
  Autocomplete,
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
import { useGetServicePointsQuery } from '../../api/servicePoints.api';
import { useGetSlotsForCategoryQuery } from '../../api/availability.api';
import AvailabilitySelector from '../../components/availability/AvailabilitySelector';
import { format, parseISO, addDays } from 'date-fns';
import type { AvailableTimeSlot } from '../../types/availability';

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

  // Состояния для диалогов
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [analysisDialogOpen, setAnalysisDialogOpen] = useState(false);
  const [resolutionType, setResolutionType] = useState('');
  const [newStartTime, setNewStartTime] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [selectedConflicts, setSelectedConflicts] = useState<number[]>([]);
  const [currentConflict, setCurrentConflict] = useState<BookingConflict | null>(null);
  
  // Состояния для AvailabilitySelector
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [currentServicePointId, setCurrentServicePointId] = useState<number>(0);
  const [currentCategoryId, setCurrentCategoryId] = useState<number>(0);
  
  // Состояния для анализа конфликтов
  const [analysisParams, setAnalysisParams] = useState({
    service_point_id: '',
    seasonal_schedule_id: '',
  });
  const [selectedConflict, setSelectedConflict] = useState<BookingConflict | null>(null);

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
  const { data: servicePointsData } = useGetServicePointsQuery({ per_page: 100 });
  
  const [analyzeConflicts, { isLoading: analyzeLoading }] = useAnalyzeBookingConflictsMutation();
  const [previewConflicts, { isLoading: previewLoading }] = usePreviewBookingConflictsMutation();
  const [resolveConflict, { isLoading: resolveLoading }] = useResolveBookingConflictMutation();
  const [ignoreConflict, { isLoading: ignoreLoading }] = useIgnoreBookingConflictMutation();
  const [bulkResolveConflicts, { isLoading: bulkResolveLoading }] = useBulkResolveBookingConflictsMutation();

  // API для получения доступных временных слотов
  const { data: availabilityData, isLoading: isLoadingAvailability } = useGetSlotsForCategoryQuery(
    {
      servicePointId: currentServicePointId,
      categoryId: currentCategoryId,
      date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''
    },
    { 
      skip: !currentServicePointId || !currentCategoryId || !selectedDate || resolutionType !== 'manual_reschedule',
      refetchOnMountOrArgChange: true
    }
  );

  // Преобразование данных API в формат для AvailabilitySelector
  const availableTimeSlots = useMemo(() => {
    if (!availabilityData?.slots || availabilityData.slots.length === 0) {
      return [];
    }

    return availabilityData.slots.map(slot => ({
      time: slot.start_time,
      available_posts: slot.available_posts || 0,
      total_posts: slot.total_posts || 0,
      bookings_count: slot.bookings_count || 0,
      duration_minutes: slot.duration_minutes,
      can_book: (slot.available_posts || 0) > 0
    })).sort((a, b) => a.time.localeCompare(b.time));
  }, [availabilityData]);

  // Получение данных для селектов
  const servicePoints = servicePointsData?.data || [];

  // Функции для получения читаемых названий
  const getServicePointName = (id: number) => {
    const servicePoint = servicePoints.find(sp => sp.id === id);
    return servicePoint ? servicePoint.name : `ID: ${id}`;
  };

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
      if (analysisParams.seasonal_schedule_id) params.seasonal_schedule_id = parseInt(analysisParams.seasonal_schedule_id);

      const result = await analyzeConflicts(params).unwrap();
      showNotification(result.message || t('bookingConflicts.messages.analysisComplete'), 'success');
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

      if (resolutionType === 'manual_reschedule') {
        if (selectedDate && selectedTimeSlot) {
          // Формируем новое время в правильном формате
          const newDateTime = new Date(selectedDate);
          const [hours, minutes] = selectedTimeSlot.split(':').map(Number);
          newDateTime.setHours(hours, minutes, 0, 0);
          
          params.new_booking_date = format(selectedDate, 'yyyy-MM-dd');
          params.new_start_time = selectedTimeSlot;
        } else {
          showNotification('Выберите дату и время для переноса', 'warning');
          return;
        }
      }

      const result = await resolveConflict(params).unwrap();
      showNotification(result.message || t('bookingConflicts.messages.conflictResolved'), 'success');
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
      showNotification(result.message || t('bookingConflicts.messages.conflictIgnored'), 'success');
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
      showNotification(result.message || t('bookingConflicts.messages.bulkResolutionComplete'), 'success');
      setSelectedConflicts([]);
      resetResolveDialog();
      refetchConflicts();
    } catch (error: any) {
      showNotification(error.data?.error || t('bookingConflicts.messages.bulkResolveError'), 'error');
    }
  };

  const resetResolveDialog = () => {
    setSelectedConflict(null);
    setCurrentConflict(null);
    setResolutionType('');
    setResolutionNotes('');
    setNewStartTime('');
    setSelectedDate(null);
    setSelectedTimeSlot(null);
    setCurrentServicePointId(0);
    setCurrentCategoryId(0);
  };

  const openResolveDialog = (conflict: BookingConflict) => {
    setSelectedConflict(conflict);
    setCurrentConflict(conflict);
    setResolveDialogOpen(true);
    
    // Отладочная информация
    console.log('🔍 Данные конфликта для AvailabilitySelector:', {
      conflict: conflict,
      servicePoint: conflict.booking.service_point,
      serviceCategory: conflict.booking.service_category
    });
    
    // Инициализируем данные для AvailabilitySelector
    if (conflict.booking.service_point?.id) {
      const servicePointId = Number(conflict.booking.service_point.id);
      console.log('✅ Установлен servicePointId:', servicePointId);
      setCurrentServicePointId(servicePointId);
    }
    if (conflict.booking.service_category?.id) {
      const categoryId = Number(conflict.booking.service_category.id);
      console.log('✅ Установлен categoryId:', categoryId);
      setCurrentCategoryId(categoryId);
    }
    // Устанавливаем завтра как дату по умолчанию для переноса
    setSelectedDate(addDays(new Date(), 1));
  };

  // Обработчики для AvailabilitySelector
  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    setSelectedTimeSlot(null); // Сбрасываем время при изменении даты
  };

  const handleTimeSlotChange = (timeSlot: string | null, slotData?: AvailableTimeSlot) => {
    setSelectedTimeSlot(timeSlot);
    
    if (timeSlot && selectedDate) {
      // Формируем datetime-local строку для newStartTime
      const dateTimeString = `${format(selectedDate, 'yyyy-MM-dd')}T${timeSlot}`;
      setNewStartTime(dateTimeString);
    } else {
      setNewStartTime('');
    }
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
          {t('bookingConflicts.title')}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<PreviewIcon />}
            onClick={() => setAnalysisDialogOpen(true)}
          >
            {t('bookingConflicts.buttons.previewConflicts')}
          </Button>
          <Button
            variant="outlined"
            startIcon={<PlayIcon />}
            onClick={() => setAnalysisDialogOpen(true)}
          >
            {t('bookingConflicts.buttons.analyzeConflicts')}
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => refetchConflicts()}
          >
            {t('bookingConflicts.buttons.refresh')}
          </Button>
        </Box>
      </Box>

      {/* Статистика */}
      {statisticsData && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="warning.main">
                  {statisticsData.statistics.total_pending}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('bookingConflicts.statistics.pendingConflicts')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="error.main">
                  {statisticsData.statistics.by_type.schedule_change || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('bookingConflicts.conflictType.schedule_change')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="warning.main">
                  {statisticsData.statistics.by_type.service_point_status || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('bookingConflicts.conflictType.service_point_status')}
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
                <InputLabel>{t('bookingConflicts.filters.status')}</InputLabel>
                <Select
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  label={t('bookingConflicts.filters.status')}
                >
                  <MenuItem value="">{t('bookingConflicts.filters.allStatuses')}</MenuItem>
                  <MenuItem value="pending">{t('bookingConflicts.status.pending')}</MenuItem>
                  <MenuItem value="resolved">{t('bookingConflicts.status.resolved')}</MenuItem>
                  <MenuItem value="ignored">{t('bookingConflicts.status.ignored')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>{t('bookingConflicts.filters.conflictType')}</InputLabel>
                <Select
                  value={filters.conflict_type || ''}
                  onChange={(e) => handleFilterChange('conflict_type', e.target.value)}
                  label={t('bookingConflicts.filters.conflictType')}
                >
                  <MenuItem value="">{t('bookingConflicts.filters.allTypes')}</MenuItem>
                  <MenuItem value="schedule_change">{t('bookingConflicts.conflictType.schedule_change')}</MenuItem>
                  <MenuItem value="service_point_status">{t('bookingConflicts.conflictType.service_point_status')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Autocomplete
                options={servicePoints}
                getOptionLabel={(option) => option.name}
                value={servicePoints.find(sp => sp.id.toString() === filters.service_point_id?.toString()) || null}
                onChange={(_, value) => handleFilterChange('service_point_id', value?.id)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t('bookingConflicts.filters.servicePoint')}
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={() => setFilters({ status: '', conflict_type: '', page: 1, per_page: 20 })}
              >
                {t('bookingConflicts.filters.clear')}
              </Button>
            </Grid>
            {selectedConflicts.length > 0 && (
              <Grid item xs={12} md={2}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setResolveDialogOpen(true)}
                >
                  {t('bookingConflicts.actions.bulkResolve')} ({selectedConflicts.length})
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
          {t('bookingConflicts.messages.noConflicts')}
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
                        <Typography variant="subtitle2">{t('bookingConflicts.bookingInfo.id')}:</Typography>
                        <Typography variant="body2">
                          {t('bookingConflicts.bookingInfo.id')}: {conflict.booking.id}<br />
                          {t('bookingConflicts.bookingInfo.date')}: {conflict.booking.start_time ? new Date(conflict.booking.start_time).toLocaleDateString('ru-RU') : 'Не указана'}<br />
                          {t('bookingConflicts.bookingInfo.time')}: {conflict.booking.start_time ? new Date(conflict.booking.start_time).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : 'Не указано'}<br />
                          {t('bookingConflicts.bookingInfo.servicePoint')}: {conflict.booking.service_point.name}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2">{t('bookingConflicts.bookingInfo.client')}:</Typography>
                        <Typography variant="body2">
                          {conflict.booking.client.name}<br />
                          {conflict.booking.client.email}
                        </Typography>
                      </Grid>
                    </Grid>
                    {conflict.resolution_notes && (
                      <Alert severity="info" sx={{ mt: 2 }}>
                        <Typography variant="body2">
                          <strong>{t('bookingConflicts.dialogs.resolve.notes')}:</strong> {conflict.resolution_notes}
                        </Typography>
                      </Alert>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {conflict.status === 'pending' && (
                      <>
                        <Tooltip title={t('bookingConflicts.actions.resolve')}>
                          <IconButton
                            color="primary"
                            onClick={() => openResolveDialog(conflict)}
                          >
                            <CheckCircleIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t('bookingConflicts.actions.ignore')}>
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
          {selectedConflicts.length > 0 ? t('bookingConflicts.dialogs.resolve.bulkTitle') : t('bookingConflicts.dialogs.resolve.singleTitle')}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>{t('bookingConflicts.dialogs.resolve.resolutionType')}</InputLabel>
                <Select
                  value={resolutionType}
                  onChange={(e) => setResolutionType(e.target.value)}
                  label={t('bookingConflicts.dialogs.resolve.resolutionType')}
                >
                  <MenuItem value="auto_reschedule">{t('bookingConflicts.resolutionType.auto_reschedule')}</MenuItem>
                  <MenuItem value="manual_reschedule">{t('bookingConflicts.resolutionType.manual_reschedule')}</MenuItem>
                  <MenuItem value="cancel">{t('bookingConflicts.resolutionType.cancel')}</MenuItem>
                  <MenuItem value="ignore">{t('bookingConflicts.resolutionType.ignore')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {resolutionType === 'manual_reschedule' && (
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  {t('bookingConflicts.dialogs.resolve.selectNewDateTime')}
                </Typography>
                {currentServicePointId && currentCategoryId ? (
                  <AvailabilitySelector
                    servicePointId={currentServicePointId}
                    categoryId={currentCategoryId}
                    selectedDate={selectedDate}
                    selectedTimeSlot={selectedTimeSlot}
                    availableTimeSlots={availableTimeSlots}
                    isLoading={isLoadingAvailability}
                    onDateChange={handleDateChange}
                    onTimeSlotChange={handleTimeSlotChange}
                  />
                ) : (
                  <Alert severity="warning">
                    {t('bookingConflicts.dialogs.resolve.missingServicePointInfo')}
                  </Alert>
                )}
                
                {/* Отображение выбранного времени */}
                {selectedDate && selectedTimeSlot && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      <strong>{t('bookingConflicts.dialogs.resolve.selectedDateTime')}:</strong>{' '}
                      {format(selectedDate, 'dd.MM.yyyy')} в {selectedTimeSlot}
                    </Typography>
                  </Alert>
                )}
              </Grid>
            )}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('bookingConflicts.dialogs.resolve.notes')}
                multiline
                rows={3}
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder={t('bookingConflicts.dialogs.resolve.notesPlaceholder')}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResolveDialogOpen(false)}>{t('bookingConflicts.buttons.cancel')}</Button>
          <Button
            onClick={selectedConflicts.length > 0 ? handleBulkResolve : handleResolveConflict}
            variant="contained"
            disabled={!resolutionType || resolveLoading || bulkResolveLoading}
          >
            {resolveLoading || bulkResolveLoading ? <CircularProgress size={20} /> : t('bookingConflicts.buttons.save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог анализа */}
      <Dialog open={analysisDialogOpen} onClose={() => setAnalysisDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('bookingConflicts.dialogs.analysis.title')}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t('bookingConflicts.dialogs.analysis.description')}
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Autocomplete
                options={servicePoints}
                getOptionLabel={(option) => option.name}
                value={servicePoints.find(sp => sp.id.toString() === analysisParams.service_point_id) || null}
                onChange={(_, value) => setAnalysisParams(prev => ({ ...prev, service_point_id: value?.id.toString() || '' }))}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t('bookingConflicts.dialogs.analysis.servicePoint')}
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('bookingConflicts.dialogs.analysis.seasonalSchedule')}
                type="number"
                value={analysisParams.seasonal_schedule_id}
                onChange={(e) => setAnalysisParams(prev => ({ ...prev, seasonal_schedule_id: e.target.value }))}
                helperText={t('bookingConflicts.dialogs.analysis.selectSchedule')}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAnalysisDialogOpen(false)}>{t('bookingConflicts.buttons.cancel')}</Button>
          <Button
            onClick={handlePreview}
            variant="outlined"
            disabled={previewLoading}
          >
            {previewLoading ? <CircularProgress size={20} /> : t('bookingConflicts.buttons.previewConflicts')}
          </Button>
          <Button
            onClick={handleAnalyze}
            variant="contained"
            disabled={analyzeLoading}
          >
            {analyzeLoading ? <CircularProgress size={20} /> : t('bookingConflicts.buttons.analyzeConflicts')}
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