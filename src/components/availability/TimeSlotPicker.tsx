import React from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Button, 
  Skeleton, 
  Chip,
  Badge,
  Tooltip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { getThemeColors } from '../../styles';
import { AccessTime as TimeIcon, CheckCircle as CheckIcon } from '@mui/icons-material';

interface TimeSlotPickerProps {
  selectedTimeSlot: string | null;
  onTimeSlotChange: (timeSlot: string | null) => void;
  availableTimeSlots: string[];
  isLoading?: boolean;
}

export const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
  selectedTimeSlot,
  onTimeSlotChange,
  availableTimeSlots,
  isLoading = false,
}) => {
  const theme = useTheme();
  const colors = getThemeColors(theme);

  // Группируем временные слоты по часам для лучшей организации
  const groupedTimeSlots: { [hour: string]: string[] } = {};
  
  availableTimeSlots.forEach(slot => {
    const hour = slot.split(':')[0];
    if (!groupedTimeSlots[hour]) {
      groupedTimeSlots[hour] = [];
    }
    groupedTimeSlots[hour].push(slot);
  });

  // Создаем массив часов для отображения
  const hours = Object.keys(groupedTimeSlots).sort((a, b) => parseInt(a) - parseInt(b));

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <TimeIcon sx={{ mr: 1, color: colors.primary }} />
        <Typography variant="h6" sx={{ fontWeight: 600, color: colors.textPrimary }}>
          Выберите время
        </Typography>
      </Box>

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
            Нет доступных слотов на выбранную дату.
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, color: colors.textSecondary }}>
            Пожалуйста, выберите другую дату.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ maxHeight: 300, overflowY: 'auto', pr: 1 }}>
          {hours.map(hour => (
            <Box key={hour} sx={{ mb: 2 }}>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  mb: 1, 
                  color: colors.textSecondary,
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <TimeIcon sx={{ mr: 0.5, fontSize: '0.9rem' }} />
                {hour}:00
              </Typography>
              
              <Grid container spacing={1}>
                {groupedTimeSlots[hour].map(time => {
                  const isSelected = time === selectedTimeSlot;
                  return (
                    <Grid item xs={4} key={time}>
                      <Button
                        variant={isSelected ? "contained" : "outlined"}
                        size="small"
                        fullWidth
                        onClick={() => onTimeSlotChange(time)}
                        sx={{
                          borderColor: isSelected ? colors.primary : colors.backgroundSecondary,
                          backgroundColor: isSelected ? colors.primary : 'transparent',
                          color: isSelected ? 'white' : colors.textPrimary,
                          '&:hover': {
                            backgroundColor: isSelected ? colors.primary : colors.backgroundSecondary,
                            borderColor: isSelected ? colors.primary : colors.backgroundSecondary,
                          },
                          minWidth: 'unset',
                          p: '6px 0',
                          position: 'relative'
                        }}
                      >
                        {time}
                        {isSelected && (
                          <CheckIcon 
                            sx={{ 
                              position: 'absolute', 
                              top: -5, 
                              right: -5, 
                              fontSize: 16,
                              color: 'white',
                              bgcolor: colors.success,
                              borderRadius: '50%'
                            }} 
                          />
                        )}
                      </Button>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          ))}
        </Box>
      )}
      
      {selectedTimeSlot && (
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Chip
            color="primary"
            label={`Выбрано: ${selectedTimeSlot}`}
            onDelete={() => onTimeSlotChange(null)}
            sx={{ fontWeight: 500 }}
          />
        </Box>
      )}
    </Box>
  );
};

export default TimeSlotPicker; 