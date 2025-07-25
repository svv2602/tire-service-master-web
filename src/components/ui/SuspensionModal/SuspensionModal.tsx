import React, { useState } from 'react';
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

const DURATION_OPTIONS: Array<{ value: SuspensionDuration; label: string; days?: number }> = [
  { value: '1day', label: '1 день', days: 1 },
  { value: '3days', label: '3 дня', days: 3 },
  { value: '1week', label: '1 неделя', days: 7 },
  { value: '2weeks', label: '2 недели', days: 14 },
  { value: '1month', label: '1 месяц', days: 30 },
  { value: 'permanent', label: 'Постоянно' },
  { value: 'custom', label: 'Выбрать дату' },
];

const COMMON_REASONS = [
  'Нарушение правил использования',
  'Спам или неподобающее поведение',
  'Подозрительная активность',
  'Запрос пользователя',
  'Технические причины',
  'Другое',
];

export const SuspensionModal: React.FC<SuspensionModalProps> = ({
  open,
  onClose,
  user,
  onSuccess,
}) => {
  const [reason, setReason] = useState('');
  const [duration, setDuration] = useState<SuspensionDuration>('1week');
  const [customDate, setCustomDate] = useState<Date | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

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
        newErrors.push('Причина блокировки обязательна');
      }

      if (duration === 'custom' && !customDate) {
        newErrors.push('Выберите дату окончания блокировки');
      }

      if (duration === 'custom' && customDate && customDate <= new Date()) {
        newErrors.push('Дата окончания должна быть в будущем');
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

    const option = DURATION_OPTIONS.find(opt => opt.value === duration);
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
      setErrors([error?.data?.message || 'Ошибка при блокировке пользователя']);
    }
  };

  const handleUnsuspend = async () => {
    if (!user) return;

    try {
      await unsuspendUser(user.id).unwrap();
      onSuccess?.('unsuspend', user);
      onClose();
    } catch (error: any) {
      setErrors([error?.data?.message || 'Ошибка при разблокировке пользователя']);
    }
  };

  const handleReasonChipClick = (selectedReason: string) => {
    setReason(selectedReason);
  };

  const formatSuspensionInfo = (info: SuspensionInfo) => {
    const suspendedAt = info.suspended_at ? format(new Date(info.suspended_at), 'dd.MM.yyyy HH:mm', { locale: ru }) : 'Неизвестно';
    const suspendedUntil = info.suspended_until ? format(new Date(info.suspended_until), 'dd.MM.yyyy HH:mm', { locale: ru }) : null;
    
    return {
      suspendedAt,
      suspendedUntil,
      isPermanent: info.is_permanent,
      daysRemaining: info.days_remaining,
      suspendedBy: info.suspended_by || 'Неизвестно',
      reason: info.reason || 'Причина не указана',
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
            {isCurrentlySuspended ? '🔓 Разблокировка пользователя' : '🔒 Блокировка пользователя'}
            <Chip 
              label={isCurrentlySuspended ? 'Заблокирован' : 'Активен'} 
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
                    Пользователь заблокирован
                  </Typography>
                  {(() => {
                    const info = formatSuspensionInfo(suspensionInfo);
                    return (
                      <Box>
                        <Typography variant="body2">
                          <strong>Причина:</strong> {info.reason}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Заблокирован:</strong> {info.suspendedAt} пользователем {info.suspendedBy}
                        </Typography>
                        {info.isPermanent ? (
                          <Typography variant="body2">
                            <strong>Срок:</strong> Постоянная блокировка
                          </Typography>
                        ) : info.suspendedUntil ? (
                          <Typography variant="body2">
                            <strong>До:</strong> {info.suspendedUntil}
                            {info.daysRemaining !== undefined && info.daysRemaining > 0 && (
                              <span> (осталось {info.daysRemaining} дн.)</span>
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
                      Причина блокировки *
                    </Typography>
                    
                    {/* Быстрые причины */}
                    <Box mb={2}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Выберите готовую причину или введите свою:
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={1}>
                        {COMMON_REASONS.map((commonReason) => (
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
                      placeholder="Укажите причину блокировки пользователя..."
                      variant="outlined"
                      error={errors.some(err => err.includes('Причина'))}
                    />
                  </Box>

                  {/* Срок блокировки */}
                  <Box>
                    <FormControl component="fieldset">
                      <FormLabel component="legend">
                        <Typography variant="body1" fontWeight="bold">
                          Срок блокировки
                        </Typography>
                      </FormLabel>
                      <RadioGroup
                        value={duration}
                        onChange={(e) => setDuration(e.target.value as SuspensionDuration)}
                      >
                        {DURATION_OPTIONS.map((option) => (
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
                          label="Дата окончания блокировки"
                          value={customDate}
                          onChange={(newValue) => setCustomDate(newValue)}
                          minDate={new Date()}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              error: errors.some(err => err.includes('дату')),
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
                    Вы уверены, что хотите разблокировать этого пользователя? 
                    После разблокировки пользователь снова получит полный доступ к системе.
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
            Отмена
          </Button>
          
          {isCurrentlySuspended ? (
            <Button
              onClick={handleUnsuspend}
              disabled={isLoading}
              variant="contained"
              color="success"
              startIcon={isUnsuspending ? <CircularProgress size={16} /> : null}
            >
              {isUnsuspending ? 'Разблокировка...' : 'Разблокировать'}
            </Button>
          ) : (
            <Button
              onClick={handleSuspend}
              disabled={isLoading || !reason.trim()}
              variant="contained"
              color="error"
              startIcon={isSuspending ? <CircularProgress size={16} /> : null}
            >
              {isSuspending ? 'Блокировка...' : 'Заблокировать'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}; 