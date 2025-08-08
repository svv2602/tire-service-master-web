import React from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import {
  AutoFixHigh as NormalizationIcon,
  CloudUpload as UploadIcon,
  Storage as ProcessIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';

interface NormalizationProgressProps {
  stage: 'uploading' | 'processing' | 'normalizing' | 'completed';
  className?: string;
}

const NormalizationProgress: React.FC<NormalizationProgressProps> = ({ stage, className }) => {
  const getStageInfo = () => {
    switch (stage) {
      case 'uploading':
        return {
          progress: 25,
          text: 'Загрузка прайс-листа...',
          icon: <UploadIcon />,
          color: 'info' as const,
        };
      case 'processing':
        return {
          progress: 50,
          text: 'Обработка товаров...',
          icon: <ProcessIcon />,
          color: 'warning' as const,
        };
      case 'normalizing':
        return {
          progress: 85,
          text: 'Автоматическая нормализация...',
          icon: <NormalizationIcon />,
          color: 'primary' as const,
        };
      case 'completed':
        return {
          progress: 100,
          text: 'Загрузка завершена',
          icon: <CheckIcon />,
          color: 'success' as const,
        };
      default:
        return {
          progress: 0,
          text: 'Инициализация...',
          icon: <UploadIcon />,
          color: 'info' as const,
        };
    }
  };

  const stageInfo = getStageInfo();

  return (
    <Card className={className} sx={{ mt: 2 }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          {React.cloneElement(stageInfo.icon, { 
            sx: { mr: 1, color: `${stageInfo.color}.main` } 
          })}
          <Typography variant="h6">
            Загрузка и обработка прайса
          </Typography>
          <Chip 
            label={`${stageInfo.progress}%`}
            color={stageInfo.color}
            size="small"
            sx={{ ml: 'auto' }}
          />
        </Box>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          {stageInfo.text}
        </Typography>

        <LinearProgress 
          variant="determinate" 
          value={stageInfo.progress}
          sx={{ 
            height: 8, 
            borderRadius: 1,
            backgroundColor: `${stageInfo.color}.50`,
            '& .MuiLinearProgress-bar': {
              borderRadius: 1,
            }
          }}
        />

        {stage === 'normalizing' && (
          <Box mt={2}>
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              🔄 Поиск брендов, стран и моделей в справочниках...
            </Typography>
          </Box>
        )}

        {stage === 'completed' && (
          <Box mt={2}>
            <Typography variant="body2" color="success.main" sx={{ fontWeight: 'medium' }}>
              ✅ Прайс успешно загружен и нормализован
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default NormalizationProgress;