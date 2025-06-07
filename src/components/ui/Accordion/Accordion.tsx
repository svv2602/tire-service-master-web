import React from 'react';
import {
  Accordion as MuiAccordion,
  AccordionSummary as MuiAccordionSummary,
  AccordionDetails as MuiAccordionDetails,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// Стилизованные компоненты
const StyledAccordion = styled(MuiAccordion)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  '&:before': {
    display: 'none',
  },
  '&:not(:last-child)': {
    marginBottom: theme.spacing(1),
  },
}));

const StyledAccordionSummary = styled(MuiAccordionSummary)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark'
    ? theme.palette.grey[800]
    : theme.palette.grey[50],
  '&.Mui-expanded': {
    minHeight: 48,
  },
}));

const StyledAccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.divider}`,
}));

export interface AccordionProps {
  /** Заголовок аккордеона */
  title: React.ReactNode;
  /** Содержимое аккордеона */
  children: React.ReactNode;
  /** Флаг развернутого состояния */
  expanded?: boolean;
  /** Callback при изменении состояния */
  onChange?: (event: React.SyntheticEvent, expanded: boolean) => void;
  /** Флаг отключения компонента */
  disabled?: boolean;
  /** Дополнительный класс для корневого элемента */
  className?: string;
}

/**
 * Компонент аккордеона для отображения сворачиваемого/разворачиваемого контента
 * 
 * @example
 * ```tsx
 * <Accordion title="Заголовок секции">
 *   <Typography>
 *     Содержимое секции
 *   </Typography>
 * </Accordion>
 * ```
 */
export const Accordion: React.FC<AccordionProps> = ({
  title,
  children,
  expanded,
  onChange,
  disabled,
  className,
  ...props
}) => {
  return (
    <StyledAccordion
      expanded={expanded}
      onChange={onChange}
      disabled={disabled}
      className={className}
      {...props}
    >
      <StyledAccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel-content"
        id="panel-header"
      >
        {typeof title === 'string' ? (
          <Typography>{title}</Typography>
        ) : (
          title
        )}
      </StyledAccordionSummary>
      <StyledAccordionDetails>
        {children}
      </StyledAccordionDetails>
    </StyledAccordion>
  );
};

export default Accordion; 