import React from 'react';
import { 
  Box, 
  Typography, 
  Skeleton, 
  Divider,
  LinearProgress,
  Tooltip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { getThemeColors } from '../../styles';
import { 
  InfoOutlined as InfoIcon,
  EventAvailable as EventAvailableIcon,
  EventBusy as EventBusyIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface DayDetailsPanelProps {
  selectedDate: Date | null;
  selectedTimeSlot: string | null;
  isLoading?: boolean;
  occupancyPercentage?: number;
  totalPosts?: number;
  availablePosts?: number;
}

export const DayDetailsPanel: React.FC<DayDetailsPanelProps> = ({
  selectedDate,
  selectedTimeSlot,
  isLoading = false,
  occupancyPercentage = 0,
  totalPosts = 0,
  availablePosts = 0,
}) => {
  const theme = useTheme();
  const colors = getThemeColors(theme);
  
  // Форматирование даты
  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return format(date, 'd MMMM yyyy (EEEE)', { locale: ru });
  };
  
  // Определение цвета для индикатора загруженности
  const getOccupancyColor = (percentage: number) => {
    if (percentage < 40) return colors.success;
    if (percentage < 80) return colors.warning;
    return colors.error;
  };
  
  // Определение текста для индикатора загруженности
  const getOccupancyText = (percentage: number) => {
    if (percentage < 40) return 'Свободно';
    if (percentage < 80) return 'Средняя загрузка';
    return 'Высокая загрузка';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <InfoIcon sx={{ mr: 1, color: colors.primary }} />
        <Typography variant="h6" sx={{ fontWeight: 600, color: colors.textPrimary }}>
          Информация
        </Typography>
      </Box>

      {isLoading ? (
        <Box sx={{ mt: 2 }}>
          <Skeleton variant="text" height={30} />
          <Skeleton variant="text" height={30} />
          <Skeleton variant="text" height={30} />
        </Box>
      ) : !selectedDate ? (
        <Box sx={{ 
          p: 3, 
          textAlign: 'center', 
          bgcolor: colors.backgroundSecondary,
          borderRadius: 2
        }}>
          <Typography variant="body1" sx={{ color: colors.textSecondary }}>
            Выберите дату для просмотра информации
          </Typography>
        </Box>
      ) : (
        <>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
              Выбранная дата:
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {formatDate(selectedDate)}
            </Typography>
          </Box>
          
          {selectedTimeSlot && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                Выбранное время:
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {selectedTimeSlot}
              </Typography>
            </Box>
          )}
          
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2" sx={{ color: colors.textSecondary }}>
                Загруженность:
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 500, 
                  color: getOccupancyColor(occupancyPercentage) 
                }}
              >
                {getOccupancyText(occupancyPercentage)}
              </Typography>
            </Box>
            
            <Tooltip title={`${occupancyPercentage}% занято`} arrow>
              <LinearProgress
                variant="determinate"
                value={occupancyPercentage}
                sx={{
                  height: 8,
                  borderRadius: 2,
                  backgroundColor: colors.backgroundSecondary,
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: getOccupancyColor(occupancyPercentage),
                  }
                }}
              />
            </Tooltip>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Box sx={{ textAlign: 'center', flex: 1 }}>
              <EventAvailableIcon sx={{ color: colors.success, mb: 0.5 }} />
              <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                Свободно слотов
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {availablePosts}
              </Typography>
            </Box>
            
            <Divider orientation="vertical" flexItem />
            
            <Box sx={{ textAlign: 'center', flex: 1 }}>
              <EventBusyIcon sx={{ color: colors.error, mb: 0.5 }} />
              <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                Занято слотов
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {totalPosts - availablePosts}
              </Typography>
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
};

export default DayDetailsPanel; 