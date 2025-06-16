import React, { useState } from 'react';
import {
  Accordion as MuiAccordion,
  AccordionProps as MuiAccordionProps,
  AccordionSummary,
  AccordionDetails,
  Typography,
  styled,
} from '@mui/material';
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

const StyledAccordion = styled(MuiAccordion)(({ theme }) => ({
  boxShadow: 'none',
  '&:before': {
    display: 'none',
  },
  '&.Mui-expanded': {
    margin: 0,
  },
}));

const StyledAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
  minHeight: 48,
  '&.Mui-expanded': {
    minHeight: 48,
  },
  '& .MuiAccordionSummary-content': {
    margin: theme.spacing(1, 0),
    '&.Mui-expanded': {
      margin: theme.spacing(1, 0),
    },
  },
}));

const StyledAccordionDetails = styled(AccordionDetails)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.divider}`,
}));

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