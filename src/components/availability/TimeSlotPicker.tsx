import React from 'react';
import { Box, Button, Typography, Skeleton } from '@mui/material';
import { useTheme } from '@mui/material/styles';

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

  if (isLoading) {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Доступное время
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 1 }}>
          {[...Array(6)].map((_, index) => (
            <Skeleton key={index} height={36} variant="rectangular" sx={{ borderRadius: 1 }} />
          ))}
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Доступное время
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 1 }}>
        {availableTimeSlots.map((timeSlot) => (
          <Button
            key={timeSlot}
            variant={selectedTimeSlot === timeSlot ? 'contained' : 'outlined'}
            onClick={() => onTimeSlotChange(timeSlot)}
            sx={{
              minWidth: 'unset',
              height: 36,
              borderRadius: 1,
              textTransform: 'none',
            }}
          >
            {timeSlot}
          </Button>
        ))}
      </Box>
    </Box>
  );
};

export default TimeSlotPicker; 