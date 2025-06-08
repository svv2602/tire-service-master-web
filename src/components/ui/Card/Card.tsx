import React from 'react';
import {
  Card as MuiCard,
  CardContent,
  CardActions,
  CardMedia,
  Typography,
  useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { CardProps } from './types';

// Стилизованная карточка с поддержкой темной темы
const StyledCard = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  backgroundColor: theme.palette.mode === 'dark' 
    ? theme.palette.background.paper 
    : theme.palette.background.default,
  borderRadius: theme.shape.borderRadius,
  transition: theme.transitions.create(['box-shadow', 'transform'], {
    duration: theme.transitions.duration.standard,
  }),
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
}));

// Стилизованный контент карточки
const StyledCardContent = styled(CardContent)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
}));

// Стилизованные действия карточки
const StyledCardActions = styled(CardActions)(({ theme }) => ({
  padding: theme.spacing(2),
  justifyContent: 'flex-end',
}));

/**
 * Универсальный компонент Card
 */
export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  content,
  media,
  actions,
  elevation = 1,
  variant = 'elevation',
  onClick,
  className,
  ...props
}) => {
  const theme = useTheme();

  return (
    <StyledCard 
      elevation={elevation}
      variant={variant}
      onClick={onClick}
      className={className}
      {...props}
    >
      {media && (
        <CardMedia
          component="img"
          height={media.height || 200}
          image={media.image}
          alt={media.alt || title}
        />
      )}
      
      <StyledCardContent>
        {title && (
          <Typography 
            variant="h5" 
            component="h2" 
            gutterBottom
            color={theme.palette.text.primary}
          >
            {title}
          </Typography>
        )}
        
        {subtitle && (
          <Typography 
            variant="subtitle1" 
            color={theme.palette.text.secondary}
            gutterBottom
          >
            {subtitle}
          </Typography>
        )}
        
        {content && (
          <Typography 
            variant="body1" 
            color={theme.palette.text.primary}
          >
            {content}
          </Typography>
        )}
      </StyledCardContent>

      {actions && (
        <StyledCardActions>
          {actions}
        </StyledCardActions>
      )}
    </StyledCard>
  );
};