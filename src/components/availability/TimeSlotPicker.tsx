import React from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Button, 
  Skeleton, 
  Chip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { getThemeColors } from '../../styles';
import { 
  AccessTime as TimeIcon, 
  CheckCircle as CheckIcon, 
  People as PeopleIcon,
  Block as BlockIcon,
  Warning as WarningIcon 
} from '@mui/icons-material';
import type { AvailableTimeSlot } from '../../types/availability';
import { useTranslation } from 'react-i18next';

interface TimeSlotPickerProps {
  selectedTimeSlot: string | null;
  onTimeSlotChange: (timeSlot: string | null, slotData?: AvailableTimeSlot) => void;
  availableTimeSlots: AvailableTimeSlot[];
  isLoading?: boolean;
  hideSelectedChip?: boolean;
  isServiceUser?: boolean; // Новый пропс для определения типа пользователя
}

export const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
  selectedTimeSlot,
  onTimeSlotChange,
  availableTimeSlots,
  isLoading = false,
  hideSelectedChip = false,
  isServiceUser = false, // По умолчанию обычный пользователь
}) => {
  const { t } = useTranslation('components');
  const theme = useTheme();
  const colors = getThemeColors(theme);

  // Функция для получения стиля кнопки в зависимости от статуса слота
  const getSlotButtonStyle = (slot: AvailableTimeSlot, isSelected: boolean) => {
    if (isSelected) {
      return {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        borderColor: theme.palette.primary.main,
      };
    }

    // Для служебных пользователей показываем все слоты с разными стилями
    if (isServiceUser) {
      if (slot.is_available === false || slot.occupancy_status === 'full') {
        // Занятый слот - красный фон
        return {
          backgroundColor: theme.palette.error.light,
          color: theme.palette.error.contrastText,
          borderColor: theme.palette.error.main,
          '&:hover': {
            backgroundColor: theme.palette.error.main,
          },
        };
      }
    }

    // Обычный доступный слот
    return {
      backgroundColor: 'transparent',
      color: colors.textPrimary,
      borderColor: colors.backgroundSecondary,
      '&:hover': {
        backgroundColor: colors.backgroundSecondary,
      },
    };
  };

  // Функция для получения иконки статуса слота
  const getSlotStatusIcon = (slot: AvailableTimeSlot) => {
    if (isServiceUser && (slot.is_available === false || slot.occupancy_status === 'full')) {
      return <BlockIcon sx={{ fontSize: 14, color: 'inherit' }} />;
    }
    return <PeopleIcon sx={{ fontSize: 14 }} />;
  };

  // Функция для получения текста статуса слота
  const getSlotStatusText = (slot: AvailableTimeSlot) => {
    if (isServiceUser) {
      if (slot.is_available === false || slot.occupancy_status === 'full') {
        return t('timeSlotPicker.fullyBooked', { 
          bookings: slot.bookings_count || 0, 
          total: slot.total_posts 
        });
      }
      // Показываем количество бронирований для служебных пользователей
      return t('timeSlotPicker.postsAvailableWithBookings', { 
        available: slot.available_posts, 
        total: slot.total_posts,
        bookings: slot.bookings_count || 0
      });
    }
    
    // Для обычных пользователей показываем только доступные посты
    return t('timeSlotPicker.postsAvailable', { 
      available: slot.available_posts, 
      total: slot.total_posts 
    });
  };

  return (
    <Box>
      {isLoading ? (
        <Box sx={{ mt: 2 }}>
          <Skeleton variant="rectangular" height={40} sx={{ mb: 1 }} />
          <Skeleton variant="rectangular" height={40} sx={{ mb: 1 }} />
          <Skeleton variant="rectangular" height={40} />
        </Box>
      ) : availableTimeSlots.length === 0 ? (
        <Box sx={{ 
          p: 3, 
          textAlign: 'center', 
          bgcolor: colors.backgroundSecondary,
          borderRadius: 2
        }}>
          <Typography variant="body1" sx={{ color: colors.textSecondary }}>
            {t('timeSlotPicker.noSlots')}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, color: colors.textSecondary }}>
            {t('timeSlotPicker.selectOtherDate')}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ maxHeight: 400, overflowY: 'auto', pr: 1 }}>
          {isServiceUser && (
            <Box sx={{ mb: 2, p: 2, bgcolor: colors.backgroundSecondary, borderRadius: 1 }}>
              <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 1 }}>
                <WarningIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                {t('timeSlotPicker.serviceUserNote')}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip 
                  size="small" 
                  label={t('timeSlotPicker.availableSlot')} 
                  sx={{ bgcolor: 'transparent', border: `1px solid ${colors.backgroundSecondary}` }}
                />
                <Chip 
                  size="small" 
                  label={t('timeSlotPicker.fullyBookedSlot')} 
                  sx={{ bgcolor: theme.palette.error.light, color: theme.palette.error.contrastText }}
                />
              </Box>
            </Box>
          )}
          
          <Grid container spacing={2}>
            {availableTimeSlots.map(slot => {
              const isSelected = slot.time === selectedTimeSlot;
              const buttonStyle = getSlotButtonStyle(slot, isSelected);
              
              return (
                <Grid item xs={12} sm={6} md={4} key={slot.time}>
                  <Button
                    variant={isSelected ? "contained" : "outlined"}
                    fullWidth
                    onClick={() => onTimeSlotChange(slot.time, slot)}
                    sx={{
                      p: 2,
                      ...buttonStyle,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 0.5,
                      position: 'relative',
                      minHeight: 64
                    }}
                  >
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {slot.time}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {getSlotStatusIcon(slot)}
                      <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                        {getSlotStatusText(slot)}
                      </Typography>
                    </Box>
                    {isSelected && (
                      <CheckIcon 
                        sx={{ 
                          position: 'absolute', 
                          top: 4, 
                          right: 4, 
                          fontSize: 16,
                          color: theme.palette.primary.contrastText,
                          bgcolor: colors.success,
                          borderRadius: '50%',
                          p: 0.5
                        }} 
                      />
                    )}
                  </Button>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}
      
      {!hideSelectedChip && selectedTimeSlot && (
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Chip
            color="primary"
            label={t('timeSlotPicker.selectedTime', { time: selectedTimeSlot })}
            onDelete={() => onTimeSlotChange(null)}
            sx={{ fontWeight: 500 }}
          />
        </Box>
      )}
    </Box>
  );
};

export default TimeSlotPicker; 