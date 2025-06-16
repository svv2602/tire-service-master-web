import React from 'react';
import { styled } from '@mui/material/styles';
import MuiDivider from '@mui/material/Divider';
import { DividerProps } from './types';
import { tokens } from '../../../styles/theme/tokens';

// Стилизованный компонент Divider
const StyledDivider = styled(MuiDivider)(({ theme }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    borderColor: themeColors.borderPrimary,
    margin: `${tokens.spacing.md} 0`,
    
    '&::before, &::after': {
      borderColor: themeColors.borderPrimary,
    },
    
    '&.MuiDivider-vertical': {
      margin: `0 ${tokens.spacing.md}`,
    },
  };
});

// Стилизованный компонент для текста
const DividerText = styled('span')<{ padding?: number | string }>(({ theme, padding }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    padding: padding !== undefined ? padding : `0 ${tokens.spacing.md}`,
    color: themeColors.textSecondary,
    fontSize: tokens.typography.fontSize.sm,
    fontWeight: tokens.typography.fontWeights.medium,
  };
});

/**
 * Компонент Divider - разделительная линия с опциональным текстом
 */
const Divider: React.FC<DividerProps> = ({
  text,
  textPadding,
  children,
  ...rest
}) => {
  const content = text || children;

  if (!content) {
    return <StyledDivider {...rest} />;
  }

  return (
    <StyledDivider {...rest}>
      <DividerText padding={textPadding}>
        {content}
      </DividerText>
    </StyledDivider>
  );
};

export default Divider; 