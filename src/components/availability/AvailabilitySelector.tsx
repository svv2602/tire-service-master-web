import React from 'react';
import { Box, Paper } from '@mui/material';
import { TimeSlotPicker } from './TimeSlotPicker';
import { DayDetailsPanel } from './DayDetailsPanel';
import { AvailabilityCalendar } from './AvailabilityCalendar';
import { useTheme } from '@mui/material/styles';
import type { AvailableTimeSlot } from '../../types/availability';

interface AvailabilitySelectorProps {
  servicePointId?: number;
  selectedDate: Date | null;
  onDateChange: (date: Date | null) => void;
  selectedTimeSlot: string | null;
  onTimeSlotChange: (timeSlot: string | null) => void;
  availableTimeSlots: AvailableTimeSlot[];
  isLoading?: boolean;
}

export const AvailabilitySelector: React.FC<AvailabilitySelectorProps> = ({
  servicePointId,
  selectedDate,
  onDateChange,
  selectedTimeSlot,
  onTimeSlotChange,
  availableTimeSlots,
  isLoading = false,
}) => {
  const theme = useTheme();

  return (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      <Paper 
        sx={{ 
          flex: '1 1 300px',
          p: 2,
          borderRadius: 2,
          boxShadow: theme.shadows[1]
        }}
      >
        <AvailabilityCalendar
          selectedDate={selectedDate}
          onDateChange={onDateChange}
          isLoading={isLoading}
        />
      </Paper>

      <Box sx={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Paper 
          sx={{ 
            p: 2,
            borderRadius: 2,
            boxShadow: theme.shadows[1]
          }}
        >
          <TimeSlotPicker
            selectedTimeSlot={selectedTimeSlot}
            onTimeSlotChange={onTimeSlotChange}
            availableTimeSlots={availableTimeSlots}
            isLoading={isLoading}
          />
        </Paper>

        <Paper 
          sx={{ 
            p: 2,
            borderRadius: 2,
            boxShadow: theme.shadows[1],
            flex: 1
          }}
        >
          <DayDetailsPanel
            selectedDate={selectedDate}
            selectedTimeSlot={selectedTimeSlot}
            isLoading={isLoading}
          />
        </Paper>
      </Box>
    </Box>
  );
};

export default AvailabilitySelector; 