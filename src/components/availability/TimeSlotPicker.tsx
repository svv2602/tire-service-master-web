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
import { AccessTime as TimeIcon, CheckCircle as CheckIcon, People as PeopleIcon } from '@mui/icons-material';
import type { AvailableTimeSlot } from '../../types/availability';
import { useTranslation } from 'react-i18next';

interface TimeSlotPickerProps {
  selectedTimeSlot: string | null;
  onTimeSlotChange: (timeSlot: string | null, slotData?: AvailableTimeSlot) => void;
  availableTimeSlots: AvailableTimeSlot[];
  isLoading?: boolean;
  hideSelectedChip?: boolean;
}

export const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
  selectedTimeSlot,
  onTimeSlotChange,
  availableTimeSlots,
  isLoading = false,
  hideSelectedChip = false,
}) => {
  const { t } = useTranslation('components');
  const theme = useTheme();
  const colors = getThemeColors(theme);

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
        }}        >
          <Typography variant="body1" sx={{ color: colors.textSecondary }}>
            {t('timeSlotPicker.noSlots')}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, color: colors.textSecondary }}>
            {t('timeSlotPicker.selectOtherDate')}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ maxHeight: 400, overflowY: 'auto', pr: 1 }}>
          <Grid container spacing={2}>
            {availableTimeSlots.map(slot => {
              const isSelected = slot.time === selectedTimeSlot;
              return (
                <Grid item xs={12} sm={6} md={4} key={slot.time}>
                  <Button
                    variant={isSelected ? "contained" : "outlined"}
                    fullWidth
                    onClick={() => onTimeSlotChange(slot.time, slot)}
                    sx={{
                      p: 2,
                      borderColor: isSelected ? theme.palette.primary.main : colors.backgroundSecondary,
                      backgroundColor: isSelected ? theme.palette.primary.main : 'transparent',
                      color: isSelected ? theme.palette.primary.contrastText : colors.textPrimary,
                      '&:hover': {
                        backgroundColor: isSelected ? theme.palette.primary.main : colors.backgroundSecondary,
                        borderColor: isSelected ? theme.palette.primary.main : colors.backgroundSecondary,
                      },
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
                      <PeopleIcon sx={{ fontSize: 14 }} />
                      <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                        {slot.available_posts} {t('timeSlotPicker.postsAvailable', { total: slot.total_posts })}
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