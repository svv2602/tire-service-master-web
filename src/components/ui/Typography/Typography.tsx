import React from 'react';
import { Typography as MuiTypography, TypographyProps as MuiTypographyProps } from '@mui/material';
import { styled } from '@mui/material/styles';
import { tokens } from '../../../styles/theme/tokens';

/**
 * Расширенные пропсы для компонента Typography
 */
export interface TypographyProps extends MuiTypographyProps {
  /** 
   * Дополнительный вариант типографики 
   * @default undefined
   */
  textVariant?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'muted';
  
  /**
   * Вес шрифта
   * @default undefined
   */
  fontWeight?: 'light' | 'regular' | 'medium' | 'bold';
}

/**
 * Стилизованный компонент Typography с поддержкой темной темы
 */
const StyledTypography = styled(MuiTypography, {
  shouldForwardProp: (prop) => !['textVariant', 'fontWeight'].includes(prop as string),
})<TypographyProps>(({ theme, textVariant, fontWeight }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  // Определяем цвет текста в зависимости от варианта
  let color;
  switch (textVariant) {
    case 'primary':
      color = tokens.colors.primary.main;
      break;
    case 'secondary':
      color = tokens.colors.secondary.main;
      break;
    case 'success':
      color = themeColors.success;
      break;
    case 'error':
      color = themeColors.error;
      break;
    case 'warning':
      color = themeColors.warning;
      break;
    case 'info':
      color = tokens.colors.info.main;
      break;
    case 'muted':
      color = themeColors.textMuted;
      break;
    default:
      // Цвет по умолчанию не устанавливаем, чтобы использовать стандартный цвет из темы
      color = undefined;
  }
  
  // Определяем вес шрифта
  let weight;
  switch (fontWeight) {
    case 'light':
      weight = tokens.typography.fontWeights.light;
      break;
    case 'regular':
      weight = tokens.typography.fontWeights.regular;
      break;
    case 'medium':
      weight = tokens.typography.fontWeights.medium;
      break;
    case 'bold':
      weight = tokens.typography.fontWeights.bold;
      break;
    default:
      weight = undefined;
  }
  
  return {
    color,
    fontWeight: weight,
    fontFamily: tokens.typography.fontFamily,
    transition: tokens.transitions.duration.normal,
  };
});

/**
 * Компонент Typography - расширенный компонент для текста с поддержкой токенов дизайн-системы
 * 
 * @example
 * <Typography variant="h1" textVariant="primary" fontWeight="bold">
 *   Заголовок
 * </Typography>
 */
export const Typography: React.FC<TypographyProps> = ({
  textVariant,
  fontWeight,
  children,
  ...rest
}) => {
  return (
    <StyledTypography
      textVariant={textVariant}
      fontWeight={fontWeight}
      {...rest}
    >
      {children}
    </StyledTypography>
  );
};

export default Typography; 