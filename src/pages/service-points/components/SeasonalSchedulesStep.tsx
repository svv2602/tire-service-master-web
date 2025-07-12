import React from 'react';
import { Box, Typography, Alert } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { FormikProps } from 'formik';

import { SeasonalScheduleManager } from '../../../components/seasonal-schedules/SeasonalScheduleManager';
import type { ServicePointFormDataNew, ServicePoint } from '../../../types/models';

interface SeasonalSchedulesStepProps {
  formik: FormikProps<ServicePointFormDataNew>;
  isEditMode: boolean;
  servicePoint?: ServicePoint;
}

const SeasonalSchedulesStep: React.FC<SeasonalSchedulesStepProps> = ({
  formik,
  isEditMode,
  servicePoint,
}) => {
  const { t } = useTranslation();

  // Сезонные расписания доступны только для существующих сервисных точек
  if (!isEditMode || !servicePoint?.id) {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Сезонные расписания
        </Typography>
        <Alert severity="info">
          Сезонные расписания можно настроить после создания сервисной точки.
          Сначала завершите создание точки обслуживания.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Сезонные расписания
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Настройте особые расписания работы для определенных периодов времени (праздники, сезонные изменения, и т.д.)
      </Typography>
      
      <SeasonalScheduleManager
        servicePointId={servicePoint.id.toString()}
        servicePointName={servicePoint.name}
      />
    </Box>
  );
};

export default SeasonalSchedulesStep; 