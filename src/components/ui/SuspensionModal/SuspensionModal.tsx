import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  Box,
  Typography,
  Chip,
  CircularProgress,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ru } from 'date-fns/locale';
import { format, addDays, addWeeks, addMonths } from 'date-fns';
import { 
  useSuspendUserMutation, 
  useUnsuspendUserMutation, 
  useGetSuspensionInfoQuery,
  type SuspensionInfo 
} from '../../../api/users.api';
import type { User } from '../../../types/user';

interface SuspensionModalProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  onSuccess?: (action: 'suspend' | 'unsuspend', userInfo: User) => void;
}

type SuspensionDuration = 'custom' | '1day' | '3days' | '1week' | '2weeks' | '1month' | 'permanent';

export const SuspensionModal: React.FC<SuspensionModalProps> = ({
  open,
  onClose,
  user,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const [reason, setReason] = useState('');
  const [duration, setDuration] = useState<SuspensionDuration>('1week');
  const [customDate, setCustomDate] = useState<Date | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  // Переводы для длительности и причин
  const getDurationOptions = () => [
    { value: '1day', label: t('admin.users.suspensionModal.durations.1day'), days: 1 },
    { value: '3days', label: t('admin.users.suspensionModal.durations.3days'), days: 3 },
    { value: '1week', label: t('admin.users.suspensionModal.durations.1week'), days: 7 },
    { value: '2weeks', label: t('admin.users.suspensionModal.durations.2weeks'), days: 14 },
    { value: '1month', label: t('admin.users.suspensionModal.durations.1month'), days: 30 },
    { value: 'permanent', label: t('admin.users.suspensionModal.durations.permanent') },
    { value: 'custom', label: t('admin.users.suspensionModal.durations.custom') },
  ];

  const getCommonReasons = () => [
    t('admin.users.suspensionModal.commonReasons.rulesViolation'),
    t('admin.users.suspensionModal.commonReasons.spam'),
    t('admin.users.suspensionModal.commonReasons.suspicious'),
    t('admin.users.suspensionModal.commonReasons.userRequest'),
    t('admin.users.suspensionModal.commonReasons.technical'),
    t('admin.users.suspensionModal.commonReasons.other'),
  ];

  // API хуки
  const [suspendUser, { isLoading: isSuspending }] = useSuspendUserMutation();
  const [unsuspendUser, { isLoading: isUnsuspending }] = useUnsuspendUserMutation();
  const { 
    data: suspensionData, 
    isLoading: isLoadingSuspension,
    refetch: refetchSuspension 
  } = useGetSuspensionInfoQuery(user?.id || 0, { 
    skip: !user?.id || !open 
  });

  const suspensionInfo: SuspensionInfo | null = suspensionData?.data || null;
  const isCurrentlySuspended = suspensionInfo?.is_suspended || false;

  // Сброс формы при открытии/закрытии
  React.useEffect(() => {
    if (open && user) {
      setReason('');
      setDuration('1week');
      setCustomDate(null);
      setErrors([]);
      refetchSuspension();
    }
  }, [open, user, refetchSuspension]);

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (!isCurrentlySuspended) {
      if (!reason.trim()) {
        newErrors.push(t('admin.users.suspensionModal.validation.reasonRequired'));
      }

      if (duration === 'custom' && !customDate) {
        newErrors.push(t('admin.users.suspensionModal.validation.dateRequired'));
      }

      if (duration === 'custom' && customDate && customDate <= new Date()) {
        newErrors.push(t('admin.users.suspensionModal.validation.dateFuture'));
      }
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const calculateEndDate = (): string | undefined => {
    if (duration === 'permanent') {
      return undefined;
    }

    if (duration === 'custom') {
      return customDate ? customDate.toISOString() : undefined;
    }

    const option = getDurationOptions().find(opt => opt.value === duration);
    if (option?.days) {
      return addDays(new Date(), option.days).toISOString();
    }

    return undefined;
  };

  const handleSuspend = async () => {
    if (!user || !validateForm()) return;

    try {
      const endDate = calculateEndDate();
      
      await suspendUser({
        userId: user.id,
        data: {
          reason: reason.trim(),
          until_date: endDate,
        },
      }).unwrap();

      onSuccess?.('suspend', user);
      onClose();
    } catch (error: any) {
      setErrors([error?.data?.message || t('admin.users.suspensionModal.errors.suspend')]);
    }
  };

  const handleUnsuspend = async () => {
    if (!user) return;

    try {
      await unsuspendUser(user.id).unwrap();
      onSuccess?.('unsuspend', user);
      onClose();
    } catch (error: any) {
      setErrors([error?.data?.message || t('admin.users.suspensionModal.errors.unsuspend')]);
    }
  };

  const handleReasonChipClick = (selectedReason: string) => {
    setReason(selectedReason);
  };

  const formatSuspensionInfo = (info: SuspensionInfo) => {
    const suspendedAt = info.suspended_at ? format(new Date(info.suspended_at), 'dd.MM.yyyy HH:mm', { locale: ru }) : t('admin.users.suspensionModal.errors.unknown');
    const suspendedUntil = info.suspended_until ? format(new Date(info.suspended_until), 'dd.MM.yyyy HH:mm', { locale: ru }) : null;
    
    return {
      suspendedAt,
      suspendedUntil,
      isPermanent: info.is_permanent,
      daysRemaining: info.days_remaining,
      suspendedBy: info.suspended_by || t('admin.users.suspensionModal.errors.unknown'),
      reason: info.reason || t('admin.users.suspensionModal.errors.noReason'),
    };
  };

  if (!user) return null;

  const isLoading = isLoadingSuspension || isSuspending || isUnsuspending;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { minHeight: '400px' }
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            {isCurrentlySuspended 
              ? t('admin.users.suspensionModal.titles.unsuspend') 
              : t('admin.users.suspensionModal.titles.suspend')}
            <Chip 
              label={isCurrentlySuspended 
                ? t('admin.users.suspensionModal.status.suspended') 
                : t('admin.users.suspensionModal.status.active')} 
              color={isCurrentlySuspended ? 'error' : 'success'}
              size="small"
            />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {user.first_name} {user.last_name} ({user.email})
          </Typography>
        </DialogTitle>

        <DialogContent>
          {isLoadingSuspension ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* Отображение ошибок */}
              {errors.length > 0 && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </Alert>
              )}

              {/* Информация о текущей блокировке */}
              {isCurrentlySuspended && suspensionInfo && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                  <Typography variant="body2" fontWeight="bold" gutterBottom>
                    {t('admin.users.suspensionModal.currentSuspension.title')}
                  </Typography>
                  {(() => {
                    const info = formatSuspensionInfo(suspensionInfo);
                    return (
                      <Box>
                        <Typography variant="body2">
                          <strong>{t('admin.users.suspensionModal.currentSuspension.reason')}</strong> {info.reason}
                        </Typography>
                        <Typography variant="body2">
                          <strong>{t('admin.users.suspensionModal.currentSuspension.suspendedAt')}</strong> {info.suspendedAt} {t('admin.users.suspensionModal.currentSuspension.suspendedBy')} {info.suspendedBy}
                        </Typography>
                        {info.isPermanent ? (
                          <Typography variant="body2">
                            <strong>{t('admin.users.suspensionModal.currentSuspension.duration')}</strong> {t('admin.users.suspensionModal.currentSuspension.permanent')}
                          </Typography>
                        ) : info.suspendedUntil ? (
                          <Typography variant="body2">
                            <strong>{t('admin.users.suspensionModal.currentSuspension.until')}</strong> {info.suspendedUntil}
                            {info.daysRemaining !== undefined && info.daysRemaining > 0 && (
                              <span> ({t('admin.users.suspensionModal.currentSuspension.remaining', { days: info.daysRemaining })})</span>
                            )}
                          </Typography>
                        ) : null}
                      </Box>
                    );
                  })()}
                </Alert>
              )}

              {/* Форма блокировки */}
              {!isCurrentlySuspended && (
                <Box>
                  {/* Причина блокировки */}
                  <Box mb={3}>
                    <Typography variant="body1" fontWeight="bold" gutterBottom>
                      {t('admin.users.suspensionModal.form.reasonLabel')}
                    </Typography>
                    
                    {/* Быстрые причины */}
                    <Box mb={2}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {t('admin.users.suspensionModal.form.reasonHelper')}
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={1}>
                        {getCommonReasons().map((commonReason) => (
                          <Chip
                            key={commonReason}
                            label={commonReason}
                            variant={reason === commonReason ? 'filled' : 'outlined'}
                            color={reason === commonReason ? 'primary' : 'default'}
                            size="small"
                            onClick={() => handleReasonChipClick(commonReason)}
                            sx={{ cursor: 'pointer' }}
                          />
                        ))}
                      </Box>
                    </Box>

                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder={t('admin.users.suspensionModal.form.reasonPlaceholder')}
                      variant="outlined"
                      error={errors.some(err => err.includes(t('admin.users.suspensionModal.validation.reasonRequired')))}
                    />
                  </Box>

                  {/* Срок блокировки */}
                  <Box>
                    <FormControl component="fieldset">
                      <FormLabel component="legend">
                        <Typography variant="body1" fontWeight="bold">
                          {t('admin.users.suspensionModal.form.durationLabel')}
                        </Typography>
                      </FormLabel>
                      <RadioGroup
                        value={duration}
                        onChange={(e) => setDuration(e.target.value as SuspensionDuration)}
                      >
                        {getDurationOptions().map((option) => (
                          <FormControlLabel
                            key={option.value}
                            value={option.value}
                            control={<Radio size="small" />}
                            label={option.label}
                          />
                        ))}
                      </RadioGroup>
                    </FormControl>

                    {/* Выбор даты для custom */}
                    {duration === 'custom' && (
                      <Box mt={2}>
                        <DatePicker
                          label={t('admin.users.suspensionModal.form.customDateLabel')}
                          value={customDate}
                          onChange={(newValue) => setCustomDate(newValue)}
                          minDate={new Date()}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              error: errors.some(err => err.includes(t('admin.users.suspensionModal.validation.dateRequired'))),
                            },
                          }}
                        />
                      </Box>
                    )}
                  </Box>
                </Box>
              )}

              {/* Подтверждение разблокировки */}
              {isCurrentlySuspended && (
                <Alert severity="info">
                  <Typography variant="body2">
                    {t('admin.users.suspensionModal.unsuspendConfirm.message')}
                  </Typography>
                </Alert>
              )}
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={onClose} 
            disabled={isLoading}
            color="inherit"
          >
            {t('admin.users.suspensionModal.buttons.cancel')}
          </Button>
          
          {isCurrentlySuspended ? (
            <Button
              onClick={handleUnsuspend}
              disabled={isLoading}
              variant="contained"
              color="success"
              startIcon={isUnsuspending ? <CircularProgress size={16} /> : null}
            >
              {isUnsuspending 
                ? t('admin.users.suspensionModal.buttons.unsuspending') 
                : t('admin.users.suspensionModal.buttons.unsuspend')}
            </Button>
          ) : (
            <Button
              onClick={handleSuspend}
              disabled={isLoading || !reason.trim()}
              variant="contained"
              color="error"
              startIcon={isSuspending ? <CircularProgress size={16} /> : null}
            >
              {isSuspending 
                ? t('admin.users.suspensionModal.buttons.suspending') 
                : t('admin.users.suspensionModal.buttons.suspend')}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}; 