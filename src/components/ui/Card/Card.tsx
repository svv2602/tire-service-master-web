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
import { tokens } from '../../../styles/theme/tokens';

// Стилизованная карточка с поддержкой темной темы
const StyledCard = styled(MuiCard)(({ theme }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: themeColors.backgroundCard,
    borderRadius: tokens.borderRadius.lg,
    transition: tokens.transitions.duration.normal,
    border: `1px solid ${themeColors.borderPrimary}`,
    overflow: 'hidden',
    
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: tokens.shadows.md,
      borderColor: themeColors.borderHover,
    },
  };
});

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