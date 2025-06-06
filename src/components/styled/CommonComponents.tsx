import React from 'react';
import { Box, BoxProps, Grid, GridProps, Card, CardProps, List, ListProps, Alert, AlertProps, CardContent, CardContentProps, CardMedia, CardMediaProps, CardActions, CardActionsProps, ListItemButton, Button, ButtonProps } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { SIZES, getButtonStyles } from '../../styles/theme';

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
  const paddingLeft = nested === 1 ? SIZES.spacing.xl : nested === 2 ? SIZES.spacing.xxl : undefined;
  
  return (
    <ListItemButton
      sx={{
        borderRadius: SIZES.borderRadius.sm,
        margin: SIZES.spacing.xs,
        paddingLeft: paddingLeft,
        backgroundColor: selected ? theme.palette.action.selected : 'transparent',
        color: selected ? theme.palette.primary.main : theme.palette.text.primary,
        transition: theme.transitions.create(['background-color', 'color'], {
          duration: theme.transitions.duration.short,
        }),
        '&:hover': {
          backgroundColor: theme.palette.action.hover,
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
      sx={{
        ...buttonStyles,
        ...sx
      }}
      {...props}
    >
      {children}
    </Button>
  );
}; 