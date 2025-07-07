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
import { styled, useTheme } from '@mui/material/styles';
import { tokens } from '../../../styles/theme/tokens';
import { useTranslation } from 'react-i18next';

// Стилизованные компоненты
const StyledStepper = styled(MuiStepper)(({ theme }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    '& .MuiStepLabel-root': {
      padding: `${tokens.spacing.sm} 0`,
      
      '& .MuiStepLabel-label': {
        fontFamily: tokens.typography.fontFamily,
        fontSize: tokens.typography.fontSize.md,
        fontWeight: tokens.typography.fontWeight.medium,
        transition: tokens.transitions.duration.normal,
        
        '&.Mui-active': {
          color: themeColors.primary,
          fontWeight: tokens.typography.fontWeight.semibold,
        },
        
        '&.Mui-completed': {
          color: themeColors.success,
        },
      },
      
      '& .MuiStepIcon-root': {
        color: themeColors.borderSecondary,
        
        '&.Mui-active': {
          color: themeColors.primary,
        },
        
        '&.Mui-completed': {
          color: themeColors.success,
        },
      },
    },
    
    '& .MuiStepContent-root': {
      borderLeft: `1px solid ${themeColors.borderPrimary}`,
      marginLeft: tokens.spacing.lg,
      paddingLeft: tokens.spacing.md,
      transition: tokens.transitions.duration.normal,
    },
    
    '& .MuiStepConnector-root': {
      '& .MuiStepConnector-line': {
        borderColor: themeColors.borderPrimary,
      },
    },
  };
});

const StyledStepContent = styled(MuiStepContent)(({ theme }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
    transition: tokens.transitions.duration.normal,
    animation: `${tokens.animations.fadeIn} ${tokens.transitions.duration.normal}ms ${tokens.transitions.easing.easeInOut}`,
  };
});

const StyledStepLabel = styled(MuiStepLabel)(({ theme }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    '& .MuiStepLabel-labelContainer': {
      transition: tokens.transitions.duration.normal,
    },
    
    '& .MuiStepLabel-iconContainer': {
      paddingRight: tokens.spacing.sm,
    },
  };
});

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
  const { t } = useTranslation();
  const handleNext = () => {
    onStepChange(activeStep + 1);
  };

  const handleBack = () => {
    onStepChange(activeStep - 1);
  };

  const theme = useTheme();
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return (
    <StyledStepper
      activeStep={activeStep}
      orientation={orientation}
      className={className}
      {...props}
    >
      {steps.map((step, index) => (
        <MuiStep key={step.label} disabled={disabled}>
          <StyledStepLabel
            optional={
              step.optional ? (
                <Typography 
                  variant="caption"
                  sx={{
                    color: themeColors.textSecondary,
                    fontFamily: tokens.typography.fontFamily,
                    fontSize: tokens.typography.fontSize.xs,
                  }}
                >
                  {t('stepper.optional')}
                </Typography>
              ) : null
            }
          >
            {step.label}
          </StyledStepLabel>
          {orientation === 'vertical' && (
            <StyledStepContent>
              {step.description && (
                <Typography 
                  sx={{ 
                    mt: 1, 
                    mb: 2,
                    color: themeColors.textSecondary,
                    fontFamily: tokens.typography.fontFamily,
                    fontSize: tokens.typography.fontSize.sm,
                  }}
                >
                  {step.description}
                </Typography>
              )}
              {step.content}
              <Box sx={{ mt: tokens.spacing.md }}>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  sx={{ 
                    mt: tokens.spacing.sm, 
                    mr: tokens.spacing.sm,
                    fontFamily: tokens.typography.fontFamily,
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.medium,
                    transition: tokens.transitions.duration.normal,
                  }}
                  disabled={disabled}
                >
                  {index === steps.length - 1 ? t('stepper.finish') : t('stepper.next')}
                </Button>
                <Button
                  disabled={index === 0 || disabled}
                  onClick={handleBack}
                  sx={{ 
                    mt: tokens.spacing.sm, 
                    mr: tokens.spacing.sm,
                    fontFamily: tokens.typography.fontFamily,
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.medium,
                    transition: tokens.transitions.duration.normal,
                  }}
                >
                  {t('stepper.back')}
                </Button>
              </Box>
            </StyledStepContent>
          )}
        </MuiStep>
      ))}
    </StyledStepper>
  );
};

export default Stepper; 