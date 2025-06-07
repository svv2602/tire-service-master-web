import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { Stepper } from '../../../../components/ui/Stepper';

const StepperSection = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      label: 'Шаг 1',
      description: 'Выберите основные параметры',
      content: (
        <Typography>
          На этом шаге вы можете выбрать основные параметры вашего заказа.
          Внимательно ознакомьтесь с доступными опциями.
        </Typography>
      ),
    },
    {
      label: 'Шаг 2',
      description: 'Укажите дополнительные детали',
      content: (
        <Typography>
          Здесь вы можете указать дополнительные параметры и особые пожелания
          к вашему заказу.
        </Typography>
      ),
      optional: true,
    },
    {
      label: 'Шаг 3',
      description: 'Подтвердите заказ',
      content: (
        <Typography>
          Проверьте все указанные данные и подтвердите оформление заказа.
          После этого шага заказ будет отправлен на обработку.
        </Typography>
      ),
    },
  ];

  return (
    <Box mb={4}>
      <Typography variant="h5" gutterBottom>
        Пошаговый процесс (Stepper)
      </Typography>
      <Box display="flex" flexDirection="column" gap={2}>
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Вертикальный степпер
          </Typography>
          <Stepper
            steps={steps}
            activeStep={activeStep}
            onStepChange={setActiveStep}
            orientation="vertical"
          />
        </Box>

        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Горизонтальный степпер
          </Typography>
          <Stepper
            steps={steps}
            activeStep={activeStep}
            onStepChange={setActiveStep}
            orientation="horizontal"
          />
        </Box>

        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Отключенный степпер
          </Typography>
          <Stepper
            steps={steps}
            activeStep={0}
            onStepChange={setActiveStep}
            disabled
          />
        </Box>
      </Box>
    </Box>
  );
};

export default StepperSection; 