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
const StyledCardContent = styled(CardContent)(({ theme }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    flexGrow: 1,
    padding: tokens.spacing.lg,
    backgroundColor: themeColors.backgroundCard,
    color: themeColors.textPrimary,
  };
});

// Стилизованные действия карточки
const StyledCardActions = styled(CardActions)(({ theme }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
    justifyContent: 'flex-end',
    borderTop: `1px solid ${themeColors.borderPrimary}`,
    backgroundColor: theme.palette.mode === 'dark' 
      ? 'rgba(0, 0, 0, 0.1)' 
      : 'rgba(0, 0, 0, 0.02)',
  };
});

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
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;

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
          sx={{
            objectFit: 'cover',
            transition: tokens.transitions.duration.normal,
          }}
        />
      )}
      
      <StyledCardContent>
        {title && (
          <Typography 
            variant="h5" 
            component="h2" 
            gutterBottom
            sx={{ 
              color: themeColors.textPrimary,
              fontSize: tokens.typography.fontSize.lg,
              fontWeight: tokens.typography.fontWeights.medium,
              marginBottom: tokens.spacing.sm,
            }}
          >
            {title}
          </Typography>
        )}
        
        {subtitle && (
          <Typography 
            variant="subtitle1" 
            gutterBottom
            sx={{ 
              color: themeColors.textSecondary,
              fontSize: tokens.typography.fontSize.md,
              marginBottom: tokens.spacing.sm,
            }}
          >
            {subtitle}
          </Typography>
        )}
        
        {content && (
          <Typography 
            variant="body1" 
            sx={{ 
              color: themeColors.textPrimary,
              fontSize: tokens.typography.fontSize.md,
              lineHeight: tokens.typography.lineHeight.relaxed,
            }}
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