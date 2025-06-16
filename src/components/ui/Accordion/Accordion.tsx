import React, { useState } from 'react';
import {
  Accordion as MuiAccordion,
  AccordionProps as MuiAccordionProps,
  AccordionSummary,
  AccordionDetails,
  Typography,
  styled,
  useTheme,
} from '@mui/material';
import { tokens } from '../../../styles/theme/tokens';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export interface AccordionProps {
  /** Заголовок аккордеона */
  title: React.ReactNode;
  /** Содержимое аккордеона */
  children: React.ReactNode;
  /** Иконка раскрытия (по умолчанию ExpandMoreIcon) */
  expandIcon?: React.ReactNode;
  /** Открыт ли аккордеон по умолчанию */
  defaultExpanded?: boolean;
  /** Контролируемое состояние раскрытия */
  expanded?: boolean;
  /** Колбэк при изменении состояния */
  onChange?: (event: React.SyntheticEvent, expanded: boolean) => void;
  /** Отключен ли аккордеон */
  disabled?: boolean;
  /** Кастомные стили */
  sx?: Record<string, any>;
  /** Остальные свойства MUI Accordion */
  [key: string]: any;
}

const StyledAccordion = styled(MuiAccordion)(({ theme }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    boxShadow: tokens.shadows.none,
    backgroundColor: themeColors.backgroundPrimary,
    border: `1px solid ${themeColors.borderPrimary}`,
    borderRadius: tokens.borderRadius.md,
    transition: tokens.transitions.duration.normal,
    marginBottom: tokens.spacing.sm,
    
    '&:before': {
      display: 'none',
    },
    
    '&.Mui-expanded': {
      margin: 0,
      marginBottom: tokens.spacing.sm,
    },
    
    '&.Mui-disabled': {
      backgroundColor: theme.palette.mode === 'dark' 
        ? themeColors.backgroundSecondary 
        : themeColors.backgroundDisabled,
      opacity: 0.7,
    },
  };
});

const StyledAccordionSummary = styled(AccordionSummary)(({ theme }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    minHeight: 48,
    padding: `${tokens.spacing.xs} ${tokens.spacing.md}`,
    
    '&.Mui-expanded': {
      minHeight: 48,
    },
    
    '& .MuiAccordionSummary-content': {
      margin: `${tokens.spacing.sm} 0`,
      
      '&.Mui-expanded': {
        margin: `${tokens.spacing.sm} 0`,
      },
    },
    
    '& .MuiTypography-root': {
      fontFamily: tokens.typography.fontFamily,
      fontSize: tokens.typography.fontSize.md,
      fontWeight: tokens.typography.fontWeight.medium,
      color: themeColors.textPrimary,
    },
    
    '& .MuiSvgIcon-root': {
      fontSize: tokens.typography.fontSize.xl,
      color: themeColors.textSecondary,
      transition: tokens.transitions.duration.normal,
    },
    
    '&.Mui-disabled': {
      opacity: 0.7,
      
      '& .MuiTypography-root': {
        color: themeColors.textSecondary,
      },
    },
  };
});

const StyledAccordionDetails = styled(AccordionDetails)(({ theme }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    padding: tokens.spacing.md,
    borderTop: `1px solid ${themeColors.borderPrimary}`,
    color: themeColors.textPrimary,
    fontSize: tokens.typography.fontSize.sm,
    fontFamily: tokens.typography.fontFamily,
  };
});

/**
 * Компонент Accordion - раскрывающаяся панель для группировки и скрытия содержимого
 * 
 * @example
 * <Accordion title="Заголовок аккордеона">
 *   <Typography>Содержимое аккордеона</Typography>
 * </Accordion>
 */
export const Accordion: React.FC<AccordionProps> = ({
  title,
  children,
  expandIcon = <ExpandMoreIcon />,
  defaultExpanded = false,
  expanded,
  onChange,
  disabled = false,
  sx,
  ...props
}) => {
  const theme = useTheme();
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  // Используем внутреннее состояние только если expanded не передан извне
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  
  // Определяем, является ли компонент контролируемым
  const isControlled = expanded !== undefined;
  
  // Используем либо внешнее, либо внутреннее состояние
  const actualExpanded = isControlled ? expanded : internalExpanded;
  
  // Обработчик изменения состояния
  const handleChange = (event: React.SyntheticEvent, isExpanded: boolean) => {
    // Если компонент не контролируемый, обновляем внутреннее состояние
    if (!isControlled) {
      setInternalExpanded(isExpanded);
    }
    
    // Вызываем внешний обработчик, если он предоставлен
    if (onChange) {
      onChange(event, isExpanded);
    }
  };

  return (
    <StyledAccordion
      expanded={actualExpanded}
      onChange={handleChange}
      disabled={disabled}
      sx={sx}
      {...props}
    >
      <StyledAccordionSummary expandIcon={expandIcon}>
        {typeof title === 'string' ? <Typography>{title}</Typography> : title}
      </StyledAccordionSummary>
      <StyledAccordionDetails>{children}</StyledAccordionDetails>
    </StyledAccordion>
  );
};

export default Accordion;