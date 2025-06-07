import React from 'react';
import { Card as MuiCard, CardProps as MuiCardProps, CardContent, CardHeader, CardActions } from '@mui/material';
import { styled } from '@mui/material/styles';
import { ANIMATIONS } from '../../../styles/theme';

/** Пропсы карточки */
export interface CardProps extends Omit<MuiCardProps, 'title'> {
  /** Заголовок карточки */
  title?: string;
  /** Контент карточки */
  children?: React.ReactNode;
  /** Действия в футере карточки */
  action?: React.ReactNode;
  /** Анимировать появление */
  animated?: boolean;
  /** Добавить эффект при наведении */
  hoverable?: boolean;
}

/** Стилизованная карточка */
const StyledCard = styled(MuiCard)<CardProps>(({ theme, animated, hoverable }) => ({
  borderRadius: '12px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',
  animation: animated ? `${ANIMATIONS.fadeIn} 0.3s ${ANIMATIONS.transition.cubic}` : 'none',
  
  ...(hoverable && {
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    },
  }),
}));

/**
 * Универсальный компонент карточки
 * 
 * @example
 * <Card
 *   title="Заголовок"
 *   subtitle="Подзаголовок"
 *   action={<Button>Действие</Button>}
 * >
 *   Содержимое карточки
 * </Card>
 */
export const Card: React.FC<CardProps> = ({
  title,
  children,
  action,
  animated = false,
  hoverable = false,
  ...props
}) => {
  return (
    <StyledCard
      animated={animated}
      hoverable={hoverable}
      {...props}
    >
      {title && (
        <CardHeader title={title} />
      )}
      <CardContent>
        {children}
      </CardContent>
      {action && (
        <CardActions>
          {action}
        </CardActions>
      )}
    </StyledCard>
  );
};

export default Card;