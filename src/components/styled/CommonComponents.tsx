import React from 'react';
import { Box, BoxProps, Grid, GridProps, Card, CardProps, List, ListProps, Alert, AlertProps, CardContent, CardContentProps, CardMedia, CardMediaProps, CardActions, CardActionsProps, ListItemButton, Button, ButtonProps, GlobalStyles, Table, TableProps, TableContainer, TableHead, TableBody, TableRow, TableCell, Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { SIZES, getButtonStyles, getInteractiveStyles, getUserButtonStyles, getTableStyles } from '../../styles';

// Компонент для flex-контейнеров
interface FlexBoxProps extends BoxProps {
  gap?: number;
  wrap?: boolean;
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  my?: number;
}

export const FlexBox: React.FC<FlexBoxProps> = ({ 
  children, 
  gap = SIZES.spacing.md,
  wrap = false,
  direction = 'row',
  my = 0,
  sx,
  ...props 
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        gap: gap,
        flexWrap: wrap ? 'wrap' : 'nowrap',
        flexDirection: direction,
        my: my,
        ...sx
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

// Компонент для сетки
interface GridContainerProps extends GridProps {
  spacing?: number;
  children?: React.ReactNode;
  sx?: any;
  my?: number;
}

export const GridContainer: React.FC<GridContainerProps> = ({
  children,
  spacing = SIZES.spacing.md,
  sx,
  ...props
}) => {
  return (
    <Grid
      container
      spacing={spacing}
      sx={sx}
      {...props}
    >
      {children}
    </Grid>
  );
};

// Компонент для элемента сетки
interface GridItemProps extends GridProps {
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  children?: React.ReactNode;
  sx?: any;
}

export const GridItem: React.FC<GridItemProps> = ({
  children,
  xs = 12,
  sm,
  md,
  lg,
  sx,
  ...props
}) => {
  return (
    <Grid
      item
      xs={xs}
      sm={sm}
      md={md}
      lg={lg}
      sx={sx}
      {...props}
    >
      {children}
    </Grid>
  );
};

// Компонент для изображений
interface ResponsiveImageProps {
  src: string;
  alt: string;
  borderRadius?: number;
}

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  borderRadius = SIZES.borderRadius.md
}) => {
  return (
    <Box
      component="img"
      src={src}
      alt={alt}
      sx={{
        width: '100%',
        height: 'auto',
        borderRadius: borderRadius,
        display: 'block'
      }}
    />
  );
};

// Компонент для списков
interface StyledListProps extends ListProps {
  gap?: number;
}

export const StyledList: React.FC<StyledListProps> = ({
  children,
  gap = SIZES.spacing.sm,
  sx,
  ...props
}) => {
  return (
    <List
      sx={{
        '& > *:not(:last-child)': {
          marginBottom: gap
        },
        ...sx
      }}
      {...props}
    >
      {children}
    </List>
  );
};

// Компонент для скрытых элементов с правильной типизацией
interface HiddenElementProps extends Omit<BoxProps, 'component'> {
  component?: React.ElementType;
  [key: string]: any; // Позволяет передавать любые props для компонента
}

export const HiddenElement = React.forwardRef<HTMLElement, HiddenElementProps>((props, ref) => {
  const { sx, ...otherProps } = props;
  
  return (
    <Box
      ref={ref}
      sx={{
        display: 'none',
        ...sx
      }}
      {...otherProps}
    />
  );
});

// Компонент для центрированного Box
interface CenteredBoxProps extends BoxProps {
  children?: React.ReactNode;
}

export const CenteredBox: React.FC<CenteredBoxProps> = ({
  children,
  sx,
  ...props
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        ...sx
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

// Стилизованный Alert компонент
interface StyledAlertProps extends AlertProps {
  marginBottom?: number;
}

export const StyledAlert: React.FC<StyledAlertProps> = ({
  children,
  marginBottom = SIZES.spacing.md,
  sx,
  ...props
}) => {
  return (
    <Alert
      sx={{
        marginBottom: marginBottom,
        ...sx
      }}
      {...props}
    >
      {children}
    </Alert>
  );
};

// Компонент для карточки сервисного центра
interface ServiceCardProps extends CardProps {
  elevation?: number;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  children,
  elevation = 1,
  sx,
  ...props
}) => {
  return (
    <Card
      elevation={elevation}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4
        },
        ...sx
      }}
      {...props}
    >
      {children}
    </Card>
  );
};

// Компонент для медиа-контента карточки с поддержкой alt
interface ServiceCardMediaProps extends CardMediaProps {
  height?: number;
  alt?: string;
}

export const ServiceCardMedia: React.FC<ServiceCardMediaProps> = ({
  height = 200,
  alt,
  sx,
  ...props
}) => {
  return (
    <CardMedia
      sx={{
        height: height,
        objectFit: 'cover',
        ...sx
      }}
      title={alt} // Используем title вместо alt для CardMedia
      {...props}
    />
  );
};

// Компонент для контента карточки
interface ServiceCardContentProps extends CardContentProps {
  spacing?: number;
}

export const ServiceCardContent: React.FC<ServiceCardContentProps> = ({
  children,
  spacing = SIZES.spacing.sm,
  sx,
  ...props
}) => {
  return (
    <CardContent
      sx={{
        flexGrow: 1,
        '& > *:not(:last-child)': {
          marginBottom: spacing
        },
        ...sx
      }}
      {...props}
    >
      {children}
    </CardContent>
  );
};

// Компонент для действий карточки
interface ServiceCardActionsProps extends CardActionsProps {
  spacing?: number;
}

export const ServiceCardActions: React.FC<ServiceCardActionsProps> = ({
  children,
  spacing = SIZES.spacing.sm,
  sx,
  ...props
}) => {
  return (
    <CardActions
      sx={{
        padding: spacing,
        justifyContent: 'space-between',
        ...sx
      }}
      {...props}
    >
      {children}
    </CardActions>
  );
};

// Стилизованная кнопка элемента списка для навигации
interface StyledListItemButtonProps {
  selected?: boolean;
  nested?: 0 | 1 | 2; // Уровень вложенности
  children: React.ReactNode;
  [key: string]: any;
}

export const StyledListItemButton: React.FC<StyledListItemButtonProps> = ({
  selected = false,
  nested = 0,
  children,
  sx = {},
  ...props
}) => {
  const theme = useTheme();
  
  // Определяем отступ в зависимости от уровня вложенности
  const paddingLeft = nested === 1 ? SIZES.spacing.xl : nested === 2 ? '48px' : undefined;
  
  return (
    <ListItemButton
      sx={{
        borderRadius: 0,
        margin: 0,
        padding: 0,
        paddingLeft: paddingLeft,
        paddingRight: SIZES.spacing.md,
        paddingTop: SIZES.spacing.sm,
        paddingBottom: SIZES.spacing.sm,
        minHeight: SIZES.navigation?.itemHeight || 48,
        backgroundColor: selected ? `${theme.palette.primary.main}15` : 'transparent',
        color: selected ? theme.palette.primary.main : theme.palette.text.primary,
        fontWeight: selected ? 600 : 400,
        position: 'relative',
        overflow: 'hidden',
        transition: theme.transitions.create(['background-color', 'color', 'transform'], {
          duration: theme.transitions.duration.short,
        }),
        '&::before': {
          content: '""',
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 3,
          backgroundColor: selected ? theme.palette.primary.main : 'transparent',
          transition: theme.transitions.create('background-color', {
            duration: theme.transitions.duration.short,
          }),
        },
        '&:hover': {
          backgroundColor: theme.palette.action.hover,
          transform: 'translateX(2px)',
          borderRadius: 0,
          '&::before': {
            backgroundColor: theme.palette.primary.main,
          },
        },
        '& .MuiListItemIcon-root': {
          color: selected ? theme.palette.primary.main : theme.palette.text.secondary,
          minWidth: 40,
          transition: theme.transitions.create('color', {
            duration: theme.transitions.duration.short,
          }),
        },
        '& .MuiListItemText-primary': {
          fontWeight: selected ? 600 : 400,
          fontSize: SIZES.fontSize?.md || 16,
        },
        ...sx
      }}
      {...props}
    >
      {children}
    </ListItemButton>
  );
};

// Стилизованная кнопка
interface StyledButtonProps extends Omit<ButtonProps, 'variant'> {
  styleVariant?: 'primary' | 'secondary' | 'success' | 'error';
  variant?: 'text' | 'outlined' | 'contained'; // Оставляем встроенные варианты MUI
}

export const StyledButton: React.FC<StyledButtonProps> = ({
  children,
  styleVariant = 'primary',
  sx,
  variant = 'contained',
  ...props
}) => {
  const theme = useTheme();
  const buttonStyles = getButtonStyles ? getButtonStyles(theme, styleVariant) : {};
  
  return (
    <Button
      variant={variant}
      sx={[
        buttonStyles,
        ...(Array.isArray(sx) ? sx : [sx])
      ]}
      {...props}
    >
      {children}
    </Button>
  );
};

// Глобальные стили для улучшенного UI/UX
export const GlobalUIStyles = () => {
  const theme = useTheme();
  
  return (
    <GlobalStyles
      styles={{
        // Улучшенная полоса прокрутки
        '*::-webkit-scrollbar': {
          width: SIZES.scrollbar.width,
          height: SIZES.scrollbar.width,
        },
        '*::-webkit-scrollbar-track': {
          backgroundColor: theme.palette.mode === 'dark' 
            ? 'rgba(255, 255, 255, 0.1)' 
            : 'rgba(0, 0, 0, 0.1)',
          borderRadius: SIZES.scrollbar.borderRadius,
        },
        '*::-webkit-scrollbar-thumb': {
          backgroundColor: theme.palette.mode === 'dark' 
            ? 'rgba(255, 255, 255, 0.4)' // Более видимая полоса прокрутки
            : 'rgba(0, 0, 0, 0.4)',
          borderRadius: SIZES.scrollbar.borderRadius,
          '&:hover': {
            backgroundColor: theme.palette.mode === 'dark' 
              ? 'rgba(255, 255, 255, 0.6)' 
              : 'rgba(0, 0, 0, 0.6)',
          },
        },
        '*::-webkit-scrollbar-corner': {
          backgroundColor: 'transparent',
        },
        
        // Плавная прокрутка для всего приложения
        'html': {
          scrollBehavior: 'smooth',
        },
        
        // Улучшенное выделение текста
        '::selection': {
          backgroundColor: theme.palette.primary.main + '40',
          color: theme.palette.getContrastText(theme.palette.primary.main),
        },
        
        // Убираем outline на фокусируемых элементах, но добавляем кастомный фокус
        '*:focus-visible': {
          outline: `2px solid ${theme.palette.primary.main}`,
          outlineOffset: '2px',
          borderRadius: SIZES.borderRadius.sm,
        },
        
        // Анимации появления для новых элементов
        '@keyframes fadeInUp': {
          '0%': {
            opacity: 0,
            transform: 'translateY(20px)',
          },
          '100%': {
            opacity: 1,
            transform: 'translateY(0)',
          },
        },
        
        '@keyframes slideInLeft': {
          '0%': {
            opacity: 0,
            transform: 'translateX(-20px)',
          },
          '100%': {
            opacity: 1,
            transform: 'translateX(0)',
          },
        },
        
        // Стили для кнопок с улучшенными эффектами
        '.enhanced-button': {
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
            transition: 'left 0.5s',
          },
          
          '&:hover::before': {
            left: '100%',
          },
        },
      }}
    />
  );
};

// Компонент для loading состояний
interface LoadingSkeletonProps extends BoxProps {
  variant?: 'text' | 'rectangular' | 'circular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave';
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  variant = 'rectangular',
  width = '100%',
  height = 20,
  animation = 'pulse',
  sx,
  ...props
}) => {
  const theme = useTheme();
  
  const getSkeletonStyles = () => {
    const baseStyles = {
      backgroundColor: theme.palette.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.1)' 
        : 'rgba(0, 0, 0, 0.1)',
      width,
      height,
    };
    
    if (variant === 'circular') {
      return {
        ...baseStyles,
        borderRadius: '50%',
      };
    }
    
    if (variant === 'text') {
      return {
        ...baseStyles,
        borderRadius: SIZES.borderRadius.xs,
        height: '1em',
      };
    }
    
    return {
      ...baseStyles,
      borderRadius: SIZES.borderRadius.sm,
    };
  };
  
  return (
    <Box
      sx={{
        ...getSkeletonStyles(),
        animation: animation === 'pulse' 
          ? 'pulse 1.5s ease-in-out infinite' 
          : 'wave 1.6s linear infinite',
        '@keyframes pulse': {
          '0%': { opacity: 1 },
          '50%': { opacity: 0.4 },
          '100%': { opacity: 1 },
        },
        '@keyframes wave': {
          '0%': { transform: 'translateX(-100%)' },
          '50%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        ...sx,
      }}
      {...props}
    />
  );
};

// Компонент для уведомлений с автоматическим исчезновением
interface NotificationToastProps {
  message: string;
  severity?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose?: () => void;
  show?: boolean;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  message,
  severity = 'info',
  duration = 4000,
  onClose,
  show = false,
}) => {
  const theme = useTheme();
  const interactiveStyles = getInteractiveStyles(theme);
  
  React.useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        onClose?.();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);
  
  if (!show) return null;
  
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 20,
        right: 20,
        zIndex: 9999,
        animation: 'slideInLeft 0.3s ease-out',
        ...interactiveStyles.glass,
        boxShadow: theme.shadows[8],
        borderRadius: SIZES.borderRadius.lg,
        overflow: 'hidden',
      }}
    >
      <Alert 
        severity={severity} 
        onClose={onClose}
        sx={{
          border: 'none',
          backgroundColor: 'transparent',
          '& .MuiAlert-message': {
            fontSize: SIZES.fontSize.md,
            fontWeight: 500,
          },
        }}
      >
        {message}
      </Alert>
    </Box>
  );
};

// Стилизованная таблица с темой "мокрый асфальт"
interface StyledTableProps extends TableProps {
  children: React.ReactNode;
}

export const StyledTable: React.FC<StyledTableProps> = ({
  children,
  sx,
  ...props
}) => {
  const theme = useTheme();
  const tableStyles = getTableStyles(theme);
  
  return (
    <TableContainer sx={tableStyles.container}>
      <Table
        sx={{
          ...tableStyles.table,
          ...sx
        }}
        {...props}
      >
        {children}
      </Table>
    </TableContainer>
  );
};

// Компонент для строки таблицы с улучшенными стилями
interface StyledTableRowProps {
  children: React.ReactNode;
  hover?: boolean;
  sx?: any;
  [key: string]: any;
}

export const StyledTableRow: React.FC<StyledTableRowProps> = ({
  children,
  hover = true,
  sx,
  ...props
}) => {
  const theme = useTheme();
  const tableStyles = getTableStyles(theme);
  
  return (
    <TableRow
      hover={hover}
      sx={{
        ...tableStyles.row,
        ...sx
      }}
      {...props}
    >
      {children}
    </TableRow>
  );
};

// Компонент для ячейки таблицы
interface StyledTableCellProps {
  children: React.ReactNode;
  header?: boolean;
  align?: 'left' | 'right' | 'center' | 'justify' | 'inherit';
  sx?: any;
  [key: string]: any;
}

export const StyledTableCell: React.FC<StyledTableCellProps> = ({
  children,
  header = false,
  sx,
  ...props
}) => {
  const theme = useTheme();
  const tableStyles = getTableStyles(theme);
  
  return (
    <TableCell
      sx={{
        ...(header ? tableStyles.header : tableStyles.cell),
        ...sx
      }}
      {...props}
    >
      {children}
    </TableCell>
  );
};

// Компонент для статусных чипов в таблицах
interface StatusChipProps {
  status: 'available' | 'unavailable' | 'pending';
  label: string;
  sx?: any;
}

export const StatusChip: React.FC<StatusChipProps> = ({
  status,
  label,
  sx,
}) => {
  const theme = useTheme();
  const tableStyles = getTableStyles(theme);
  
  const getStatusStyles = () => {
    switch (status) {
      case 'available':
        return tableStyles.statusAvailable;
      case 'unavailable':
        return tableStyles.statusUnavailable;
      case 'pending':
        return tableStyles.statusPending;
      default:
        return tableStyles.statusAvailable;
    }
  };
  
  return (
    <Box
      sx={{
        ...tableStyles.statusChip,
        ...getStatusStyles(),
        ...sx
      }}
    >
      {label}
    </Box>
  );
}; 