// components/styled/StyledComponents.tsx
// Готовые стилизованные компоненты для быстрого использования

import React from 'react';
import {
  Card as MuiCard,
  Button as MuiButton,
  TextField as MuiTextField,
  Chip as MuiChip,
  Paper as MuiPaper,
  Box as MuiBox,
  useTheme,
} from '@mui/material';
import {
  getCardStyles,
  getButtonStyles,
  getTextFieldStyles,
  getChipStyles,
  getFormStyles,
  CardVariant,
  ButtonVariant,
  ChipVariant,
  TextFieldVariant,
} from '../../styles';

// Стилизованная карточка
interface StyledCardProps {
  variant?: CardVariant;
  children: React.ReactNode;
  [key: string]: any;
}

export const StyledCard: React.FC<StyledCardProps> = ({ 
  variant = 'primary', 
  children, 
  sx = {}, 
  ...props 
}) => {
  const theme = useTheme();
  const cardStyles = getCardStyles(theme, variant);
  
  return (
    <MuiCard sx={{ ...cardStyles, ...sx }} {...props}>
      {children}
    </MuiCard>
  );
};

// Стилизованная кнопка
interface StyledButtonProps {
  variant?: ButtonVariant;
  children: React.ReactNode;
  [key: string]: any;
}

export const StyledButton: React.FC<StyledButtonProps> = ({ 
  variant = 'primary', 
  children, 
  sx = {}, 
  ...props 
}) => {
  const theme = useTheme();
  const buttonStyles = getButtonStyles(theme, variant);
  
  return (
    <MuiButton sx={{ ...buttonStyles, ...sx }} {...props}>
      {children}
    </MuiButton>
  );
};

// Стилизованное поле ввода
interface StyledTextFieldProps {
  variant?: TextFieldVariant;
  [key: string]: any;
}

export const StyledTextField: React.FC<StyledTextFieldProps> = ({ 
  variant = 'filled', 
  sx = {}, 
  ...props 
}) => {
  const theme = useTheme();
  const textFieldStyles = getTextFieldStyles(theme, variant);
  
  return (
    <MuiTextField sx={{ ...textFieldStyles, ...sx }} {...props} />
  );
};

// Стилизованный чип
interface StyledChipProps {
  variant?: ChipVariant;
  [key: string]: any;
}

export const StyledChip: React.FC<StyledChipProps> = ({ 
  variant = 'primary', 
  sx = {}, 
  ...props 
}) => {
  const theme = useTheme();
  const chipStyles = getChipStyles(theme, variant);
  
  return (
    <MuiChip sx={{ ...chipStyles, ...sx }} {...props} />
  );
};

// Стилизованная форма
interface StyledFormProps {
  children: React.ReactNode;
  [key: string]: any;
}

export const StyledForm: React.FC<StyledFormProps> = ({ 
  children, 
  sx = {}, 
  ...props 
}) => {
  const theme = useTheme();
  const formStyles = getFormStyles(theme);
  
  return (
    <MuiPaper sx={{ ...formStyles.container, ...sx }} {...props}>
      {children}
    </MuiPaper>
  );
};

// Стилизованная секция формы
interface StyledFormSectionProps {
  title?: string;
  children: React.ReactNode;
  [key: string]: any;
}

export const StyledFormSection: React.FC<StyledFormSectionProps> = ({ 
  title, 
  children, 
  sx = {}, 
  ...props 
}) => {
  const theme = useTheme();
  const formStyles = getFormStyles(theme);
  
  return (
    <MuiBox sx={{ ...formStyles.section, ...sx }} {...props}>
      {title && (
        <MuiBox sx={formStyles.sectionTitle}>
          {title}
        </MuiBox>
      )}
      {children}
    </MuiBox>
  );
};
