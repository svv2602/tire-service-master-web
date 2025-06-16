import React from 'react';
import {
  Breadcrumbs as MuiBreadcrumbs,
  BreadcrumbsProps as MuiBreadcrumbsProps,
  Link,
  Typography,
  styled,
  useTheme
} from '@mui/material';
import { tokens } from '../../../styles/theme/tokens';

/** Элемент хлебных крошек */
export interface BreadcrumbItem {
  /** Текст */
  label: string;
  /** Ссылка */
  href?: string;
  /** Иконка */
  icon?: React.ReactNode;
}

/** Пропсы хлебных крошек */
export interface BreadcrumbsProps extends Omit<MuiBreadcrumbsProps, 'children'> {
  /** Элементы */
  items: BreadcrumbItem[];
}

// Стилизованные хлебные крошки
const StyledBreadcrumbs = styled(MuiBreadcrumbs)(({ theme }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    fontFamily: tokens.typography.fontFamily,
    fontSize: tokens.typography.fontSize.sm,
    padding: `${tokens.spacing.xs} ${tokens.spacing.sm}`,
    color: themeColors.textSecondary,
    
    '& .MuiBreadcrumbs-separator': {
      margin: `0 ${tokens.spacing.xs}`,
      color: themeColors.textSecondary,
    },
    
    '& .MuiSvgIcon-root': {
      fontSize: tokens.typography.fontSize.md,
      marginRight: tokens.spacing.xs,
    },
  };
});

// Стилизованная ссылка
const StyledLink = styled(Link)(({ theme }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
    color: themeColors.primary,
    fontFamily: tokens.typography.fontFamily,
    fontSize: tokens.typography.fontSize.sm,
    transition: tokens.transitions.duration.normal,
    
    '&:hover': {
      textDecoration: 'underline',
      color: theme.palette.mode === 'dark' 
        ? themeColors.primaryLight 
        : themeColors.primaryDark,
    },
  };
});

// Стилизованный текст
const StyledTypography = styled(Typography)(({ theme, variant }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    display: 'flex',
    alignItems: 'center',
    fontFamily: tokens.typography.fontFamily,
    fontSize: tokens.typography.fontSize.sm,
    color: variant === 'current' 
      ? themeColors.textPrimary 
      : themeColors.textSecondary,
  };
});

/**
 * Компонент хлебных крошек
 * 
 * @example
 * <Breadcrumbs
 *   items={[
 *     { label: 'Главная', href: '/' },
 *     { label: 'Категория', href: '/category' },
 *     { label: 'Страница' },
 *   ]}
 * />
 */
export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  ...props
}) => {
  const theme = useTheme();
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  return (
    <StyledBreadcrumbs {...props}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const content = (
          <>
            {item.icon}
            {item.icon && ' '}
            {item.label}
          </>
        );

        if (isLast) {
          return (
            <StyledTypography
              key={index}
              variant="current"
            >
              {content}
            </StyledTypography>
          );
        }

        return item.href ? (
          <StyledLink
            key={index}
            href={item.href}
          >
            {content}
          </StyledLink>
        ) : (
          <StyledTypography
            key={index}
            variant="default"
          >
            {content}
          </StyledTypography>
        );
      })}
    </StyledBreadcrumbs>
  );
};

export default Breadcrumbs; 