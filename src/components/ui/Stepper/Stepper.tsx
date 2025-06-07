import React from 'react';
import {
  Stepper as MuiStepper,
  Step as MuiStep,
  StepLabel as MuiStepLabel,
  StepContent as MuiStepContent,
  Button,
  Typography,
  Box,
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Стилизованные компоненты
const StyledStepper = styled(MuiStepper)(({ theme }) => ({
  '& .MuiStepLabel-root': {
    padding: theme.spacing(1, 0),
  },
  '& .MuiStepContent-root': {
    borderLeft: `1px solid ${theme.palette.divider}`,
    marginLeft: theme.spacing(2.5),
    paddingLeft: theme.spacing(2),
  },
}));

export interface StepItem {
  /** Заголовок шага */
  label: string;
  /** Описание шага */
  description?: string;
  /** Содержимое шага */
  content: React.ReactNode;
  /** Флаг опционального шага */
  optional?: boolean;
}

export interface StepperProps {
  /** Массив шагов */
  steps: StepItem[];
  /** Активный шаг */
  activeStep: number;
  /** Callback при изменении шага */
  onStepChange: (step: number) => void;
  /** Ориентация степпера */
  orientation?: 'horizontal' | 'vertical';
  /** Флаг отключения компонента */
  disabled?: boolean;
  /** Дополнительный класс */
  className?: string;
}

/**
 * Компонент пошагового отображения контента
 * 
 * @example
 * ```tsx
 * const steps = [
 *   {
 *     label: 'Шаг 1',
 *     description: 'Описание шага 1',
 *     content: <Typography>Содержимое шага 1</Typography>
 *   },
 *   {
 *     label: 'Шаг 2',
 *     content: <Typography>Содержимое шага 2</Typography>
 *   }
 * ];
 * 
 * <Stepper
 *   steps={steps}
 *   activeStep={activeStep}
 *   onStepChange={handleStepChange}
 *   orientation="vertical"
 * />
 * ```
 */
export const Stepper: React.FC<StepperProps> = ({
  steps,
  activeStep,
  onStepChange,
  orientation = 'vertical',
  disabled,
  className,
  ...props
}) => {
  const handleNext = () => {
    onStepChange(activeStep + 1);
  };

  const handleBack = () => {
    onStepChange(activeStep - 1);
  };

  return (
    <StyledStepper
      activeStep={activeStep}
      orientation={orientation}
      className={className}
      {...props}
    >
      {steps.map((step, index) => (
        <MuiStep key={step.label} disabled={disabled}>
          <MuiStepLabel
            optional={
              step.optional ? (
                <Typography variant="caption">Опционально</Typography>
              ) : null
            }
          >
            {step.label}
          </MuiStepLabel>
          <MuiStepContent>
            {step.description && (
              <Typography color="textSecondary" sx={{ mt: 1, mb: 2 }}>
                {step.description}
              </Typography>
            )}
            {step.content}
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                onClick={handleNext}
                sx={{ mt: 1, mr: 1 }}
                disabled={disabled}
              >
                {index === steps.length - 1 ? 'Завершить' : 'Продолжить'}
              </Button>
              <Button
                disabled={index === 0 || disabled}
                onClick={handleBack}
                sx={{ mt: 1, mr: 1 }}
              >
                Назад
              </Button>
            </Box>
          </MuiStepContent>
        </MuiStep>
      ))}
    </StyledStepper>
  );
};

export default Stepper; 